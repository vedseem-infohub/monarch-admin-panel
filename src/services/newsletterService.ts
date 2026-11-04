import { RoyalSubscriber } from '@/types';
import { getFromStorage, saveToStorage } from './storageHelper';
import { apiClient } from './apiClient';

const STORAGE_KEY = 'subscribers';
let hasSyncedNewsletter = false;

export const newsletterService = {
  getSubscribers(): RoyalSubscriber[] {
    const cached = getFromStorage<RoyalSubscriber[]>(STORAGE_KEY, []);
    if (typeof window !== 'undefined' && !hasSyncedNewsletter) {
      hasSyncedNewsletter = true;
      this.syncWithBackend().catch(() => {});
    }
    return cached || [];
  },

  async fetchSubscribers(): Promise<RoyalSubscriber[]> {
    return this.syncWithBackend();
  },

  async syncWithBackend(): Promise<RoyalSubscriber[]> {
    try {
      const remote = await apiClient.newsletter.getAll();
      if (remote && Array.isArray(remote)) {
        saveToStorage(STORAGE_KEY, remote);
        return remote;
      }
    } catch (err) {
      console.warn('Could not sync newsletter with backend:', err);
    }
    return getFromStorage<RoyalSubscriber[]>(STORAGE_KEY, []);
  },

  toggleStatus(id: string): RoyalSubscriber {
    const list = this.getSubscribers();
    const index = list.findIndex((s) => s.id === id || (s as any)._id === id);
    if (index === -1) throw new Error('Subscriber not found');

    const updated = {
      ...list[index],
      status: (list[index].status === 'Subscribed' ? 'Unsubscribed' : 'Subscribed') as RoyalSubscriber['status'],
    };
    list[index] = updated;
    saveToStorage(STORAGE_KEY, list);

    if (updated.status === 'Unsubscribed') {
      apiClient.newsletter.unsubscribe(updated.email).catch((err) => {
        console.warn('Backend sync error on unsubscribe:', err);
      });
    }

    return updated;
  },

  deleteSubscriber(id: string): void {
    const list = this.getSubscribers();
    saveToStorage(STORAGE_KEY, list.filter((s) => s.id !== id && (s as any)._id !== id));
  },

  resetToDefault(): RoyalSubscriber[] {
    saveToStorage(STORAGE_KEY, []);
    return [];
  },
};
