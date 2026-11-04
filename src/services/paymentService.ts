import { PaymentTransaction } from '@/types';
import { getFromStorage, saveToStorage } from './storageHelper';
import { apiClient } from './apiClient';
import { orderService } from './orderService';

const STORAGE_KEY = 'payments';
let hasSyncedPayments = false;

export const paymentService = {
  getAll(): PaymentTransaction[] {
    const cached = getFromStorage<PaymentTransaction[]>(STORAGE_KEY, []);
    if (typeof window !== 'undefined' && !hasSyncedPayments) {
      hasSyncedPayments = true;
      this.syncWithBackend().catch(() => {});
    }
    return cached || [];
  },

  async fetchPayments(): Promise<PaymentTransaction[]> {
    return this.syncWithBackend();
  },

  async syncWithBackend(): Promise<PaymentTransaction[]> {
    try {
      const remote = await apiClient.payments.getAll();
      if (remote && Array.isArray(remote)) {
        saveToStorage(STORAGE_KEY, remote);
        return remote;
      }
    } catch (err) {
      console.warn('Could not sync payments with backend:', err);
    }

    // Derive from real customer orders if payments list is empty
    const orders = orderService.getOrders();
    if (orders && orders.length > 0) {
      const derived: PaymentTransaction[] = orders.map((o) => {
        const isSettled = o.status === 'Delivered' || (o as any).paymentStatus === 'Paid' || (o as any).paymentStatus === 'Settled';
        const isRefunded = o.status === 'Refunded' || (o as any).paymentStatus === 'Refunded';
        const isFailed = o.status === 'Cancelled' || (o as any).paymentStatus === 'Failed';
        const status = isRefunded ? 'Refunded' : isFailed ? 'Failed' : isSettled ? 'Settled' : 'Captured';
        const amount = Number(o.total) || 0;
        const gatewayFee = Math.round(amount * 0.02);
        const tax = Math.round(gatewayFee * 0.18);
        const netSettlement = isRefunded ? -amount : isFailed ? 0 : amount - (gatewayFee + tax);
        const isCod = !o.paymentMethod || o.paymentMethod.toLowerCase().includes('cod');

        return {
          id: `pay-${o.id || o.orderNumber}`,
          transactionRef: (o as any).razorpayPaymentId || `tx_${o.orderNumber.replace(/[^0-9]/g, '').slice(-8) || '998811'}`,
          orderNumber: o.orderNumber,
          customerName: o.customer?.name || (o as any).customerName || 'Bespoke Patron',
          paymentGateway: (isCod ? 'Standard Chartered Wire' : 'Razorpay') as any,
          method: (isCod ? 'NEFT / RTGS' : 'Credit Card') as any,
          amount,
          currency: 'INR',
          status: status as any,
          gatewayFee,
          tax,
          netSettlement,
          timestamp: o.createdAt || new Date().toISOString(),
          ...(isRefunded ? { refundRef: `rfnd_${Date.now().toString().slice(-6)}` } : {}),
        };
      });
      if (derived.length > 0) {
        saveToStorage(STORAGE_KEY, derived);
        return derived;
      }
    }

    return getFromStorage<PaymentTransaction[]>(STORAGE_KEY, []);
  },

  getById(id: string): PaymentTransaction | undefined {
    return this.getAll().find((p) => p.id === id);
  },

  processRefund(id: string): PaymentTransaction {
    const list = this.getAll();
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Transaction not found');

    const item = list[index];
    const updated: PaymentTransaction = {
      ...item,
      status: 'Refunded',
      refundRef: `rfnd_${Date.now()}`,
      netSettlement: -item.amount,
    };

    list[index] = updated;
    saveToStorage(STORAGE_KEY, list);
    return updated;
  },

  capturePayment(id: string): PaymentTransaction {
    const list = this.getAll();
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Transaction not found');

    const item = list[index];
    const updated: PaymentTransaction = {
      ...item,
      status: 'Settled',
    };

    list[index] = updated;
    saveToStorage(STORAGE_KEY, list);
    return updated;
  },

  resetToDefault(): PaymentTransaction[] {
    saveToStorage(STORAGE_KEY, []);
    return [];
  },
};
