import { StoreSettings, AdminUser, ActivityLog } from '@/types';
import { getFromStorage, saveToStorage } from './storageHelper';
import { apiClient } from './apiClient';

const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'MONARCH Haute Couture Atelier',
  legalEntity: 'Monarch Royal Luxury Ethnic Wear Private Limited',
  gstin: '27AABCM8920K1ZX',
  supportEmail: 'concierge@monarch-couture.in',
  supportPhone: '+91 22 6984 4000',
  conciergeWhatsApp: '+91 98200 44590',
  currency: 'INR (Indian Rupee)',
  currencySymbol: '₹',
  timezone: 'Asia/Kolkata (IST +05:30)',
  standardShippingFee: 0,
  freeShippingThreshold: 50000,
  orderPrefix: 'MNR-2026',
  brandPrimaryColor: '#F7F5F0',
  brandAccentColor: '#B39458',
  brandTagline: 'A Legacy Woven in Elegance — Sovereign Indian Haute Couture',
};

let hasSyncedSettings = false;

export const settingsService = {
  async syncWithBackend(): Promise<void> {
    try {
      const [remoteSettings, remoteLogs, remoteUsers] = await Promise.all([
        apiClient.settings.getStoreSettings(),
        apiClient.settings.getActivityLogs(),
        apiClient.admins.getAll(),
      ]);

      if (remoteSettings) {
        saveToStorage('settings_store', remoteSettings);
      }
      if (remoteLogs && Array.isArray(remoteLogs)) {
        saveToStorage('settings_logs', remoteLogs);
      }
      if (remoteUsers && Array.isArray(remoteUsers)) {
        saveToStorage('settings_users', remoteUsers);
      }
    } catch (err) {
      console.warn('Could not sync settings with backend:', err);
    }
  },

  getStoreSettings(): StoreSettings {
    const cached = getFromStorage<StoreSettings>('settings_store', DEFAULT_STORE_SETTINGS);
    if (typeof window !== 'undefined' && !hasSyncedSettings) {
      hasSyncedSettings = true;
      this.syncWithBackend().catch(() => {});
    }
    return cached;
  },

  async fetchStoreSettings(): Promise<StoreSettings> {
    try {
      const remote = await apiClient.settings.getStoreSettings();
      if (remote) {
        const merged = { ...DEFAULT_STORE_SETTINGS, ...remote };
        saveToStorage('settings_store', merged);
        return merged;
      }
    } catch (err) {
      console.warn('fetchStoreSettings error:', err);
    }
    return this.getStoreSettings();
  },

  updateStoreSettings(settings: Partial<StoreSettings>): StoreSettings {
    const current = this.getStoreSettings();
    const updated = { ...current, ...settings };
    saveToStorage('settings_store', updated);

    apiClient.settings.updateStoreSettings(settings).catch((err) => {
      console.warn('Backend sync error on updateStoreSettings:', err);
    });

    return updated;
  },

  getAdminUsers(): AdminUser[] {
    return getFromStorage<AdminUser[]>('settings_users', []);
  },

  async fetchAdminUsers(): Promise<AdminUser[]> {
    try {
      const remote = await apiClient.admins.getAll();
      if (remote && Array.isArray(remote)) {
        saveToStorage('settings_users', remote);
        return remote;
      }
    } catch (err) {
      console.warn('fetchAdminUsers error:', err);
    }
    return this.getAdminUsers();
  },

  updateAdminUser(id: string, updates: Partial<AdminUser>): AdminUser {
    const users = this.getAdminUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('User not found');
    const updated = { ...users[index], ...updates };
    users[index] = updated;
    saveToStorage('settings_users', users);

    apiClient.admins.update(id, updates).catch((err) => {
      console.warn('Backend sync error on updateAdminUser:', err);
    });

    return updated;
  },

  addAdminUser(user: Omit<AdminUser, 'id' | 'lastLogin'> & { password?: string }): AdminUser {
    const users = this.getAdminUsers();
    const created: AdminUser = {
      ...user,
      id: `usr-${Date.now()}`,
      lastLogin: 'Never',
    };
    saveToStorage('settings_users', [...users, created]);

    apiClient.admins.create({ ...user, password: user.password || 'monarch123' }).catch((err) => {
      console.warn('Backend sync error on addAdminUser:', err);
    });

    return created;
  },

  deleteAdminUser(id: string): void {
    const users = this.getAdminUsers();
    saveToStorage('settings_users', users.filter((u) => u.id !== id));

    apiClient.admins.delete(id).catch((err) => {
      console.warn('Backend sync error on deleteAdminUser:', err);
    });
  },

  getActivityLogs(): ActivityLog[] {
    return getFromStorage<ActivityLog[]>('settings_logs', []);
  },

  async fetchActivityLogs(): Promise<ActivityLog[]> {
    try {
      const remote = await apiClient.settings.getActivityLogs();
      if (remote && Array.isArray(remote)) {
        saveToStorage('settings_logs', remote);
        return remote;
      }
    } catch (err) {
      console.warn('fetchActivityLogs error:', err);
    }
    return this.getActivityLogs();
  },

  logActivity(action: string, category: ActivityLog['category'], details: string, user = 'Current Admin'): ActivityLog {
    const logs = this.getActivityLogs();
    const log: ActivityLog = {
      id: `act-${Date.now()}`,
      action,
      category,
      user,
      details,
      ipAddress: '103.21.124.8',
      timestamp: new Date().toISOString(),
    };
    saveToStorage('settings_logs', [log, ...logs]);

    apiClient.settings.logActivity(log).catch((err) => {
      console.warn('Backend sync error on logActivity:', err);
    });

    return log;
  },
};
