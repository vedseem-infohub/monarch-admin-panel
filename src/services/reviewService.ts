import { Review } from '@/types';
import { getFromStorage, saveToStorage } from './storageHelper';
import { apiClient } from './apiClient';

const STORAGE_KEY = 'reviews';
let hasSyncedReviews = false;

export const reviewService = {
  getAll(): Review[] {
    const cached = getFromStorage<Review[]>(STORAGE_KEY, []);
    if (typeof window !== 'undefined' && !hasSyncedReviews) {
      hasSyncedReviews = true;
      this.syncWithBackend().catch(() => {});
    }
    return cached || [];
  },

  async fetchReviews(): Promise<Review[]> {
    return this.syncWithBackend();
  },

  async syncWithBackend(): Promise<Review[]> {
    try {
      const remote = await apiClient.reviews.getAll();
      if (remote && Array.isArray(remote)) {
        saveToStorage(STORAGE_KEY, remote);
        return remote;
      }
    } catch (err) {
      console.warn('Could not sync reviews with backend:', err);
    }
    return getFromStorage<Review[]>(STORAGE_KEY, []);
  },

  getById(id: string): Review | undefined {
    return this.getAll().find((r) => r.id === id || (r as any)._id === id);
  },

  updateStatus(id: string, status: Review['status']): Review {
    const list = this.getAll();
    const index = list.findIndex((r) => r.id === id || (r as any)._id === id);
    if (index === -1) throw new Error('Review not found');

    const updated = { ...list[index], status };
    list[index] = updated;
    saveToStorage(STORAGE_KEY, list);

    apiClient.reviews.updateStatus(id, status).catch((err) => {
      console.warn('Backend sync error on updateStatus:', err);
    });

    return updated;
  },

  deleteReview(id: string): void {
    const list = this.getAll();
    saveToStorage(
      STORAGE_KEY,
      list.filter((r) => r.id !== id && (r as any)._id !== id)
    );

    apiClient.reviews.delete(id).catch((err) => {
      console.warn('Backend sync error on deleteReview:', err);
    });
  },

  resetToDefault(): Review[] {
    saveToStorage(STORAGE_KEY, []);
    return [];
  },
};
