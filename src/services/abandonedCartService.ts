import { AbandonedCart } from '@/types';
import { getFromStorage, saveToStorage } from './storageHelper';
import { apiClient } from './apiClient';

const STORAGE_KEY = 'abandoned_carts';

export const abandonedCartService = {
  getAll(): AbandonedCart[] {
    return getFromStorage<AbandonedCart[]>(STORAGE_KEY, []);
  },

  async fetchAbandonedCarts(): Promise<AbandonedCart[]> {
    try {
      const remote = await apiClient.abandonedCarts.getAll();
      if (remote && Array.isArray(remote)) {
        saveToStorage(STORAGE_KEY, remote);
        return remote;
      }
    } catch (err) {
      console.warn('Could not sync abandoned carts with backend:', err);
    }
    return this.getAll();
  },

  getById(id: string): AbandonedCart | undefined {
    return this.getAll().find((c) => c.id === id || (c as any)._id === id);
  },

  updateRecoveryStatus(
    id: string,
    status: AbandonedCart['recoveryStatus'],
    note?: string
  ): AbandonedCart {
    const list = this.getAll();
    const index = list.findIndex((c) => c.id === id || (c as any)._id === id);
    if (index === -1) throw new Error('Cart not found');

    const updated: AbandonedCart = {
      ...list[index],
      recoveryStatus: status,
      lastContactedAt: new Date().toISOString(),
      ...(note ? { recoveryNote: note } : {}),
    };

    list[index] = updated;
    saveToStorage(STORAGE_KEY, list);
    return updated;
  },

  deleteCart(id: string): void {
    const list = this.getAll();
    saveToStorage(
      STORAGE_KEY,
      list.filter((c) => c.id !== id && (c as any)._id !== id)
    );
  },

  resetToDefault(): AbandonedCart[] {
    saveToStorage(STORAGE_KEY, []);
    return [];
  },
};
