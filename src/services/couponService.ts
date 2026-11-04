import { DiscountCoupon } from '@/types';
import { getFromStorage, saveToStorage } from './storageHelper';
import { apiClient } from './apiClient';

const STORAGE_KEY = 'coupons';
let hasSyncedCoupons = false;

export const couponService = {
  getCoupons(): DiscountCoupon[] {
    const cached = getFromStorage<DiscountCoupon[]>(STORAGE_KEY, []);

    if (typeof window !== 'undefined' && !hasSyncedCoupons) {
      hasSyncedCoupons = true;
      this.syncWithBackend().catch(() => {});
    }
    return cached || [];
  },

  async fetchCoupons(): Promise<DiscountCoupon[]> {
    return this.syncWithBackend();
  },

  async syncWithBackend(): Promise<DiscountCoupon[]> {
    try {
      const remote = await apiClient.coupons.getAll();
      if (remote && Array.isArray(remote)) {
        saveToStorage(STORAGE_KEY, remote);
        return remote;
      }
    } catch (err) {
      console.warn('Could not sync coupons with backend:', err);
    }
    return getFromStorage<DiscountCoupon[]>(STORAGE_KEY, []);
  },

  getCouponById(id: string): DiscountCoupon | undefined {
    return this.getCoupons().find((c) => c.id === id || (c as any)._id === id || c.code.toLowerCase() === id.toLowerCase());
  },

  createCoupon(newCoupon: Omit<DiscountCoupon, 'id' | 'createdAt' | 'usageCount'>): DiscountCoupon {
    const coupons = this.getCoupons();
    const id = `coup-${Date.now()}`;
    const created: DiscountCoupon = {
      ...newCoupon,
      code: newCoupon.code.toUpperCase().trim(),
      id,
      usageCount: 0,
      createdAt: new Date().toISOString(),
    };
    const updated = [created, ...coupons];
    saveToStorage(STORAGE_KEY, updated);

    apiClient.coupons.create(created).catch((err) => {
      console.warn('Backend sync error on createCoupon:', err);
    });

    return created;
  },

  updateCoupon(id: string, updates: Partial<DiscountCoupon>): DiscountCoupon {
    const coupons = this.getCoupons();
    const index = coupons.findIndex((c) => c.id === id || (c as any)._id === id);
    if (index === -1) throw new Error('Coupon not found');

    const updated = { ...coupons[index], ...updates };
    coupons[index] = updated;
    saveToStorage(STORAGE_KEY, coupons);

    apiClient.coupons.update(id, updates).catch((err) => {
      console.warn('Backend sync error on updateCoupon:', err);
    });

    return updated;
  },

  deleteCoupon(id: string): void {
    const coupons = this.getCoupons();
    const filtered = coupons.filter((c) => c.id !== id && (c as any)._id !== id);
    saveToStorage(STORAGE_KEY, filtered);

    apiClient.coupons.delete(id).catch((err) => {
      console.warn('Backend sync error on deleteCoupon:', err);
    });
  },

  toggleCouponStatus(id: string): DiscountCoupon {
    const coupons = this.getCoupons();
    const index = coupons.findIndex((c) => c.id === id || (c as any)._id === id);
    if (index === -1) throw new Error('Coupon not found');

    const current = coupons[index];
    const newStatus: DiscountCoupon['status'] = current.status === 'Active' ? 'Disabled' : 'Active';
    const updated = { ...current, status: newStatus };
    coupons[index] = updated;
    saveToStorage(STORAGE_KEY, coupons);

    apiClient.coupons.toggleStatus(id).catch((err) => {
      console.warn('Backend sync error on toggleCouponStatus:', err);
    });

    return updated;
  },

  resetToDefault(): DiscountCoupon[] {
    saveToStorage(STORAGE_KEY, []);
    return [];
  },
};
