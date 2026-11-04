import { Order } from '@/types';
import { getFromStorage, saveToStorage } from './storageHelper';
import { apiClient } from './apiClient';

const STORAGE_KEY = 'orders';
let hasSyncedOrders = false;

export const orderService = {
  getOrders(): Order[] {
    const cached = getFromStorage<Order[]>(STORAGE_KEY, []);

    if (typeof window !== 'undefined' && !hasSyncedOrders) {
      hasSyncedOrders = true;
      this.syncWithBackend().catch(() => {});
    }
    return cached || [];
  },

  async fetchOrders(): Promise<Order[]> {
    return this.syncWithBackend();
  },

  async syncWithBackend(): Promise<Order[]> {
    try {
      const remote = await apiClient.orders.getAll();
      if (remote && Array.isArray(remote)) {
        saveToStorage(STORAGE_KEY, remote);
        return remote;
      }
    } catch (err) {
      console.warn('Could not sync orders with backend:', err);
    }
    return getFromStorage<Order[]>(STORAGE_KEY, []);
  },

  getOrderById(id: string): Order | undefined {
    return this.getOrders().find((o) => o.id === id || (o as any)._id === id || o.orderNumber === id);
  },

  updateOrderStatus(orderId: string, status: Order['status'], actor = 'Admin Concierge'): Order {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId || (o as any)._id === orderId || o.orderNumber === orderId);
    if (index === -1) throw new Error('Order not found');

    const timestamp = new Date().toISOString();
    const updatedOrder = {
      ...orders[index],
      status,
      timeline: [
        ...(orders[index].timeline || []),
        {
          status,
          message: `Order status transitioned to ${status}`,
          timestamp,
          actor,
        },
      ],
    };

    orders[index] = updatedOrder;
    saveToStorage(STORAGE_KEY, orders);

    // Persist to backend asynchronously
    apiClient.orders.updateStatus(orderId, status, actor).catch((err) => {
      console.warn('Backend sync error on updateOrderStatus:', err);
    });

    return updatedOrder;
  },

  addInternalNote(orderId: string, note: string): Order {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId || (o as any)._id === orderId || o.orderNumber === orderId);
    if (index === -1) throw new Error('Order not found');

    const updatedOrder = {
      ...orders[index],
      internalNotes: [...(orders[index].internalNotes || []), note],
    };

    orders[index] = updatedOrder;
    saveToStorage(STORAGE_KEY, orders);

    // Persist to backend asynchronously
    apiClient.orders.addNote(orderId, note).catch((err) => {
      console.warn('Backend sync error on addInternalNote:', err);
    });

    return updatedOrder;
  },

  updateShippingDetails(orderId: string, courier: string, trackingNumber: string): Order {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId || (o as any)._id === orderId || o.orderNumber === orderId);
    if (index === -1) throw new Error('Order not found');

    const updatedOrder = {
      ...orders[index],
      courier,
      trackingNumber,
      status: 'Shipped' as Order['status'],
      timeline: [
        ...(orders[index].timeline || []),
        {
          status: 'Shipped',
          message: `Dispatched via ${courier} AWB #${trackingNumber}`,
          timestamp: new Date().toISOString(),
          actor: 'Shipping Desk',
        },
      ],
    };

    orders[index] = updatedOrder;
    saveToStorage(STORAGE_KEY, orders);

    // Persist to backend asynchronously
    apiClient.orders.updateShipping(orderId, courier, trackingNumber).catch((err) => {
      console.warn('Backend sync error on updateShippingDetails:', err);
    });

    return updatedOrder;
  },

  async manifestDelhiveryShipment(
    orderId: string,
    weight = 750,
    shippingMode = 'Express'
  ): Promise<{ success: boolean; awb?: string; order?: Order; message?: string }> {
    try {
      const res = await apiClient.shipping.createShipment({ orderId, weight, shippingMode });
      if (res.success && res.data?.waybill) {
        const awb = res.data.waybill;
        this.updateShippingDetails(orderId, 'Delhivery Express', awb);
        const remoteOrders = await this.syncWithBackend();
        const updated = remoteOrders.find(
          (o) => o.id === orderId || (o as any)._id === orderId || o.orderNumber === orderId
        );
        return { success: true, awb, order: updated };
      }
      return { success: false, message: res.message || 'Courier manifesting failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to connect to Delhivery' };
    }
  },

  resetToDefault(): Order[] {
    saveToStorage(STORAGE_KEY, []);
    return [];
  },
};
