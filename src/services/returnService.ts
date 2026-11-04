import { ReturnRequest } from '@/types';
import { getFromStorage, saveToStorage } from './storageHelper';
import { apiClient } from './apiClient';

const STORAGE_KEY = 'returns';
let hasSyncedReturns = false;

export const returnService = {
  getReturns(): ReturnRequest[] {
    const cached = getFromStorage<ReturnRequest[]>(STORAGE_KEY, []);
    if (typeof window !== 'undefined' && !hasSyncedReturns) {
      hasSyncedReturns = true;
      this.syncWithBackend().catch(() => {});
    }
    return cached || [];
  },

  async fetchReturns(): Promise<ReturnRequest[]> {
    return this.syncWithBackend();
  },

  async syncWithBackend(): Promise<ReturnRequest[]> {
    try {
      const remote = await apiClient.returns.getAll();
      if (remote && Array.isArray(remote)) {
        saveToStorage(STORAGE_KEY, remote);
        return remote;
      }
    } catch (err) {
      console.warn('Could not sync returns with backend:', err);
    }
    return getFromStorage<ReturnRequest[]>(STORAGE_KEY, []);
  },

  getReturnById(id: string): ReturnRequest | undefined {
    return this.getReturns().find((r) => r.id === id || (r as any)._id === id || r.returnNumber === id);
  },

  updateReturnStatus(
    id: string,
    status: ReturnRequest['status'],
    note?: string
  ): ReturnRequest {
    const returns = this.getReturns();
    const index = returns.findIndex((r) => r.id === id || (r as any)._id === id || r.returnNumber === id);
    if (index === -1) throw new Error('Return request not found');

    const timestamp = new Date().toISOString();
    const updated = {
      ...returns[index],
      status,
      timeline: [
        ...(returns[index].timeline || []),
        {
          status,
          date: timestamp,
          note: note || `Return status transitioned to ${status}`,
        },
      ],
    };

    returns[index] = updated;
    saveToStorage(STORAGE_KEY, returns);

    apiClient.returns.updateStatus(id, status, note).catch((err) => {
      console.warn('Backend sync error on updateReturnStatus:', err);
    });

    return updated;
  },

  resetToDefault(): ReturnRequest[] {
    saveToStorage(STORAGE_KEY, []);
    return [];
  },
};
