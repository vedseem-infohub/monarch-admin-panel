import { Customer } from '@/types';
import { getFromStorage, saveToStorage } from './storageHelper';
import { apiClient } from './apiClient';

const STORAGE_KEY = 'customers';
let hasSyncedCustomers = false;

export const customerService = {
  getCustomers(): Customer[] {
    const cached = getFromStorage<Customer[]>(STORAGE_KEY, []);

    if (typeof window !== 'undefined' && !hasSyncedCustomers) {
      hasSyncedCustomers = true;
      this.syncWithBackend().catch(() => {});
    }
    return cached || [];
  },

  async fetchCustomers(): Promise<Customer[]> {
    return this.syncWithBackend();
  },

  async syncWithBackend(): Promise<Customer[]> {
    try {
      const remote = await apiClient.customers.getAll();
      if (remote && Array.isArray(remote)) {
        saveToStorage(STORAGE_KEY, remote);
        return remote;
      }
    } catch (err) {
      console.warn('Could not sync customers with backend:', err);
    }
    return getFromStorage<Customer[]>(STORAGE_KEY, []);
  },

  getCustomerById(id: string): Customer | undefined {
    return this.getCustomers().find((c) => c.id === id || (c as any)._id === id);
  },

  addCustomerNote(customerId: string, note: string): Customer {
    const customers = this.getCustomers();
    const index = customers.findIndex((c) => c.id === customerId || (c as any)._id === customerId);
    if (index === -1) throw new Error('Customer not found');

    const updated = {
      ...customers[index],
      notes: [...(customers[index].notes || []), note],
    };
    customers[index] = updated;
    saveToStorage(STORAGE_KEY, customers);

    apiClient.customers.addNote(customerId, note).catch((err) => {
      console.warn('Backend sync error on addCustomerNote:', err);
    });

    return updated;
  },

  updateCustomerTags(customerId: string, tags: string[]): Customer {
    const customers = this.getCustomers();
    const index = customers.findIndex((c) => c.id === customerId || (c as any)._id === customerId);
    if (index === -1) throw new Error('Customer not found');

    const updated = {
      ...customers[index],
      tags,
    };
    customers[index] = updated;
    saveToStorage(STORAGE_KEY, customers);

    apiClient.customers.updateTags(customerId, tags).catch((err) => {
      console.warn('Backend sync error on updateCustomerTags:', err);
    });

    return updated;
  },

  resetToDefault(): Customer[] {
    saveToStorage(STORAGE_KEY, []);
    return [];
  },
};
