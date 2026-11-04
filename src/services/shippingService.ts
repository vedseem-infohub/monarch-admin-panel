import { Shipment } from '@/types';
import { getFromStorage, saveToStorage } from './storageHelper';
import { apiClient } from './apiClient';
import { orderService } from './orderService';

const STORAGE_KEY = 'shipments';
let hasSyncedShipments = false;

export const shippingService = {
  getShipments(): Shipment[] {
    const cached = getFromStorage<Shipment[]>(STORAGE_KEY, []);
    if (typeof window !== 'undefined' && !hasSyncedShipments) {
      hasSyncedShipments = true;
      this.syncWithBackend().catch(() => {});
    }
    return cached || [];
  },

  async fetchShipments(): Promise<Shipment[]> {
    return this.syncWithBackend();
  },

  async syncWithBackend(): Promise<Shipment[]> {
    try {
      const remote = await apiClient.shipments.getAll();
      if (remote && Array.isArray(remote)) {
        saveToStorage(STORAGE_KEY, remote);
        return remote;
      }
    } catch (err) {
      console.warn('Could not sync shipments with backend:', err);
    }

    // Synthesize shipments from real orders if available
    const orders = orderService.getOrders();
    if (orders && orders.length > 0) {
      const derived: Shipment[] = orders
        .filter((o) => o.trackingNumber || o.status === 'Shipped' || o.status === 'Delivered' || o.status === 'Processing')
        .map((o) => ({
          id: `shp-${o.id || o.orderNumber}`,
          shipmentNumber: `SHP-${o.orderNumber || o.id}`,
          orderId: o.id || o.orderNumber,
          orderNumber: o.orderNumber || o.id,
          customerName: o.customer?.name || (o as any).customerName || 'Bespoke Patron',
          destinationCity: o.shippingAddress?.city || 'New Delhi',
          destinationState: o.shippingAddress?.state || 'Delhi',
          courier: ((o as any).courier?.includes('Delhivery') ? 'Delhivery Express' : 'BlueDart Apex') as any,
          awbNumber: o.trackingNumber || `AWB-${o.orderNumber.replace(/[^0-9]/g, '').slice(-6) || '998811'}`,
          status: (o.status === 'Delivered' ? 'Delivered' : o.status === 'Shipped' ? 'In Transit' : 'Manifested') as any,
          dispatchDate: o.createdAt || new Date().toISOString(),
          estimatedDelivery: new Date(new Date(o.createdAt || Date.now()).getTime() + 4 * 86400000).toISOString(),
          shippingFee: o.shippingFee || 0,
          weightKg: 2.5,
        }));
      if (derived.length > 0) {
        saveToStorage(STORAGE_KEY, derived);
        return derived;
      }
    }

    return getFromStorage<Shipment[]>(STORAGE_KEY, []);
  },

  getShipmentById(id: string): Shipment | undefined {
    return this.getShipments().find((s) => s.id === id || s.shipmentNumber === id || s.awbNumber === id);
  },

  createShipment(newShipment: Omit<Shipment, 'id' | 'shipmentNumber'>): Shipment {
    const shipments = this.getShipments();
    const id = `shp-${Date.now()}`;
    const shipmentNumber = `SHP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const created: Shipment = { ...newShipment, id, shipmentNumber };
    const updated = [created, ...shipments];
    saveToStorage(STORAGE_KEY, updated);
    return created;
  },

  updateShipmentStatus(id: string, status: Shipment['status']): Shipment {
    const shipments = this.getShipments();
    const index = shipments.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Shipment not found');

    const updated = {
      ...shipments[index],
      status,
      actualDelivery: status === 'Delivered' ? new Date().toISOString() : shipments[index].actualDelivery,
    };
    shipments[index] = updated;
    saveToStorage(STORAGE_KEY, shipments);
    return updated;
  },

  resetToDefault(): Shipment[] {
    saveToStorage(STORAGE_KEY, []);
    return [];
  },
};
