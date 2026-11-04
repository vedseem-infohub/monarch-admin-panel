// Centralized API client connecting the Monarch Admin Panel with the Express Backend
import {
  Product,
  Order,
  Category,
  Collection,
  Customer,
  DiscountCoupon,
  ReturnRequest,
  Review,
  StoreSettings,
  ActivityLog,
  SectionFrame,
  AbandonedCart,
  Shipment,
  PaymentTransaction,
  AdminUser,
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 5000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('monarch_admin_token') || localStorage.getItem('monarch_auth_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const res = await fetch(url, {
      ...options,
      credentials: 'include',
      signal: controller.signal,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export const apiClient = {
  baseUrl: API_BASE,

  async isHealthy(): Promise<boolean> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/health`, { method: 'GET' }, 2000);
      return res.ok;
    } catch {
      return false;
    }
  },

  products: {
    async getAll(): Promise<Product[] | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/products`);
        if (!res.ok) return null;
        const data = await res.json();
        return Array.isArray(data) ? data : null;
      } catch {
        return null;
      }
    },

    async getById(id: string): Promise<Product | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/products/${id}`);
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },

    async create(product: Partial<Product>): Promise<Product | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/products/add`, {
          method: 'POST',
          body: JSON.stringify(product),
        });
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },

    async update(id: string, updates: Partial<Product>): Promise<Product | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/products/update/${id}`, {
          method: 'PUT',
          body: JSON.stringify(updates),
        });
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },

    async delete(id: string): Promise<boolean> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/products/delete/${id}`, {
          method: 'DELETE',
        });
        return res.ok;
      } catch {
        return false;
      }
    },

    async bulkDelete(ids: string[]): Promise<boolean> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/products/bulk-delete`, {
          method: 'POST',
          body: JSON.stringify({ ids }),
        });
        return res.ok;
      } catch {
        return false;
      }
    },

    async bulkUpdateStatus(ids: string[], status: string): Promise<boolean> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/products/bulk-status`, {
          method: 'POST',
          body: JSON.stringify({ ids, status }),
        });
        return res.ok;
      } catch {
        return false;
      }
    },
  },

  orders: {
    async getAll(): Promise<Order[] | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/orders/all`);
        if (!res.ok) return null;
        const data = await res.json();
        return Array.isArray(data) ? data : null;
      } catch {
        return null;
      }
    },

    async getById(id: string): Promise<Order | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/orders/${id}`);
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },

    async updateStatus(orderId: string, status: string, actor = 'Admin Concierge', note?: string): Promise<Order | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/orders/${orderId}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status, actor, note }),
        });
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },

    async updateShipping(orderId: string, courier: string, trackingNumber: string): Promise<Order | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/orders/${orderId}/shipping`, {
          method: 'PUT',
          body: JSON.stringify({ courier, trackingNumber }),
        });
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },

    async addNote(orderId: string, note: string): Promise<Order | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/orders/${orderId}/notes`, {
          method: 'POST',
          body: JSON.stringify({ note }),
        });
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },
  },

  categories: {
    async getAll(): Promise<Category[] | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/categories`);
        if (!res.ok) return null;
        const data = await res.json();
        return Array.isArray(data) ? data : null;
      } catch {
        return null;
      }
    },

    async create(category: Partial<Category>): Promise<Category | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/categories`, {
          method: 'POST',
          body: JSON.stringify(category),
        });
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },

    async update(id: string, updates: Partial<Category>): Promise<Category | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/categories/${id}`, {
          method: 'PUT',
          body: JSON.stringify(updates),
        });
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },

    async delete(id: string): Promise<boolean> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/categories/${id}`, {
          method: 'DELETE',
        });
        return res.ok;
      } catch {
        return false;
      }
    },
  },

  collections: {
    async getAll(): Promise<Collection[] | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/collections`);
        if (!res.ok) return null;
        const data = await res.json();
        return Array.isArray(data) ? data : null;
      } catch {
        return null;
      }
    },

    async create(collection: Partial<Collection>): Promise<Collection | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/collections`, {
          method: 'POST',
          body: JSON.stringify(collection),
        });
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },

    async update(id: string, updates: Partial<Collection>): Promise<Collection | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/collections/${id}`, {
          method: 'PUT',
          body: JSON.stringify(updates),
        });
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },

    async delete(id: string): Promise<boolean> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/collections/${id}`, {
          method: 'DELETE',
        });
        return res.ok;
      } catch {
        return false;
      }
    },
  },

  customers: {
    async getAll(): Promise<Customer[] | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/customers`);
        if (!res.ok) return null;
        const data = await res.json();
        return Array.isArray(data) ? data : null;
      } catch {
        return null;
      }
    },

    async addNote(customerId: string, note: string): Promise<Customer | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/customers/${customerId}/notes`, {
          method: 'POST',
          body: JSON.stringify({ note }),
        });
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },

    async updateTags(customerId: string, tags: string[]): Promise<Customer | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/customers/${customerId}/tags`, {
          method: 'PUT',
          body: JSON.stringify({ tags }),
        });
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },
  },

  coupons: {
    async getAll(): Promise<DiscountCoupon[] | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/coupons`);
        if (!res.ok) return null;
        const data = await res.json();
        return Array.isArray(data) ? data : null;
      } catch {
        return null;
      }
    },

    async create(coupon: Partial<DiscountCoupon>): Promise<DiscountCoupon | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/coupons`, {
          method: 'POST',
          body: JSON.stringify(coupon),
        });
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },

    async update(id: string, updates: Partial<DiscountCoupon>): Promise<DiscountCoupon | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/coupons/${id}`, {
          method: 'PUT',
          body: JSON.stringify(updates),
        });
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },

    async delete(id: string): Promise<boolean> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/coupons/${id}`, {
          method: 'DELETE',
        });
        return res.ok;
      } catch {
        return false;
      }
    },

    async toggleStatus(id: string): Promise<DiscountCoupon | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/coupons/${id}/toggle`, {
          method: 'PUT',
        });
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },
  },

  returns: {
    async getAll(): Promise<ReturnRequest[] | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/returns`);
        if (!res.ok) return null;
        const data = await res.json();
        return Array.isArray(data) ? data : null;
      } catch {
        return null;
      }
    },

    async updateStatus(id: string, status: string, note?: string): Promise<ReturnRequest | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/returns/${id}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status, note }),
        });
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },
  },

  reviews: {
    async getAll(): Promise<Review[] | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/reviews`);
        if (!res.ok) return null;
        const data = await res.json();
        return Array.isArray(data) ? data : null;
      } catch {
        return null;
      }
    },

    async updateStatus(id: string, status: string): Promise<Review | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/reviews/${id}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status }),
        });
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },

    async delete(id: string): Promise<boolean> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/reviews/${id}`, {
          method: 'DELETE',
        });
        return res.ok;
      } catch {
        return false;
      }
    },
  },

  analytics: {
    async getDashboard(): Promise<any | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/analytics/dashboard`);
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },
  },

  settings: {
    async getStoreSettings(): Promise<StoreSettings | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/settings`);
        if (!res.ok) return null;
        const data = await res.json();
        return data?.settings || data;
      } catch {
        return null;
      }
    },

    async updateStoreSettings(settings: Partial<StoreSettings>): Promise<StoreSettings | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/settings`, {
          method: 'PUT',
          body: JSON.stringify(settings),
        });
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },

    async getActivityLogs(): Promise<ActivityLog[] | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/settings/logs`);
        if (!res.ok) return null;
        const data = await res.json();
        return Array.isArray(data) ? data : null;
      } catch {
        return null;
      }
    },

    async logActivity(log: Partial<ActivityLog>): Promise<ActivityLog | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/settings/logs`, {
          method: 'POST',
          body: JSON.stringify(log),
        });
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },
  },

  newsletter: {
    async getAll(): Promise<any[] | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/newsletter`);
        if (!res.ok) return null;
        const data = await res.json();
        return Array.isArray(data) ? data : null;
      } catch {
        return null;
      }
    },

    async unsubscribe(email: string): Promise<boolean> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/newsletter/unsubscribe`, {
          method: 'POST',
          body: JSON.stringify({ email }),
        });
        return res.ok;
      } catch {
        return false;
      }
    },
  },

  frames: {
    async getAll(sectionKey?: string): Promise<SectionFrame[] | null> {
      try {
        const query = sectionKey ? `?sectionKey=${encodeURIComponent(sectionKey)}` : '';
        const res = await fetchWithTimeout(`${API_BASE}/storefront/frames${query}`);
        if (!res.ok) return null;
        const data = await res.json();
        if (Array.isArray(data)) return data;
        if (data?.frames && Array.isArray(data.frames)) return data.frames;
        return null;
      } catch {
        return null;
      }
    },

    async create(frame: Partial<SectionFrame>): Promise<SectionFrame | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/storefront/frames`, {
          method: 'POST',
          body: JSON.stringify(frame),
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data?.frame || data;
      } catch {
        return null;
      }
    },

    async update(id: string, updates: Partial<SectionFrame>): Promise<SectionFrame | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/storefront/frames/${id}`, {
          method: 'PUT',
          body: JSON.stringify(updates),
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data?.frame || data;
      } catch {
        return null;
      }
    },

    async delete(id: string): Promise<boolean> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/storefront/frames/${id}`, {
          method: 'DELETE',
        });
        return res.ok;
      } catch {
        return false;
      }
    },

    async reorder(sectionKey: string, orderedIds: string[]): Promise<SectionFrame[] | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/storefront/frames/reorder`, {
          method: 'PUT',
          body: JSON.stringify({ sectionKey, orderedIds }),
        });
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },
  },

  abandonedCarts: {
    async getAll(): Promise<AbandonedCart[] | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/cart/admin/all`);
        if (!res.ok) return null;
        const data = await res.json();
        return Array.isArray(data) ? data : null;
      } catch {
        return null;
      }
    },
  },

  shipping: {
    async getAll(): Promise<Shipment[] | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/shipping/all`);
        if (!res.ok) return null;
        const data = await res.json();
        return Array.isArray(data) ? data : null;
      } catch {
        return null;
      }
    },
    async createShipment(payload: {
      orderId: string;
      weight?: number;
      dimensions?: { length: number; width: number; height: number };
      shippingMode?: string;
    }): Promise<{ success: boolean; data?: any; message?: string }> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/shipping/create-shipment`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        return await res.json();
      } catch (err: any) {
        return { success: false, message: err.message || 'Failed to create Delhivery shipment' };
      }
    },
    async trackShipment(waybill: string): Promise<{ success: boolean; data?: any; message?: string }> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/shipping/track/${encodeURIComponent(waybill)}`);
        return await res.json();
      } catch (err: any) {
        return { success: false, message: err.message || 'Tracking unavailable' };
      }
    },
    async checkServiceability(pincode: string): Promise<any> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/shipping/serviceability/${encodeURIComponent(pincode)}`);
        return await res.json();
      } catch (err: any) {
        return { success: false, message: err.message || 'Serviceability check unavailable' };
      }
    },
    async schedulePickup(payload: {
      pickupDate?: string;
      pickupTime?: string;
      expectedPackageCount?: number;
    }): Promise<{ success: boolean; data?: any; message?: string }> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/shipping/pickups/schedule`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        return await res.json();
      } catch (err: any) {
        return { success: false, message: err.message || 'Pickup scheduling failed' };
      }
    },
    async cancelShipment(waybill: string): Promise<{ success: boolean; data?: any; message?: string }> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/shipping/shipments/${encodeURIComponent(waybill)}/cancel`, {
          method: 'POST',
        });
        return await res.json();
      } catch (err: any) {
        return { success: false, message: err.message || 'Failed to cancel shipment' };
      }
    },
    getLabelUrl(waybill: string): string {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('monarch_admin_token') || localStorage.getItem('monarch_auth_token')) : '';
      const qs = token ? `?token=${encodeURIComponent(token)}` : '';
      return `${API_BASE}/shipping/labels/${encodeURIComponent(waybill)}${qs}`;
    },
  },

  shipments: {
    async getAll(): Promise<Shipment[] | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/shipping/all`);
        if (!res.ok) return null;
        const data = await res.json();
        return Array.isArray(data) ? data : null;
      } catch {
        return null;
      }
    },
  },

  payments: {
    async getAll(): Promise<PaymentTransaction[] | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/payments/all`);
        if (!res.ok) return null;
        const data = await res.json();
        return Array.isArray(data) ? data : null;
      } catch {
        return null;
      }
    },
  },

  admins: {
    async getAll(): Promise<AdminUser[] | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/admins`);
        if (!res.ok) return null;
        const data = await res.json();
        return Array.isArray(data) ? data : null;
      } catch {
        return null;
      }
    },
    async create(user: Partial<AdminUser> & { password?: string }): Promise<AdminUser | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/admins`, {
          method: 'POST',
          body: JSON.stringify(user),
        });
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },
    async update(id: string, updates: Partial<AdminUser>): Promise<AdminUser | null> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/admins/${id}`, {
          method: 'PUT',
          body: JSON.stringify(updates),
        });
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },
    async delete(id: string): Promise<boolean> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/admins/${id}`, {
          method: 'DELETE',
        });
        return res.ok;
      } catch {
        return false;
      }
    },
  },

  upload: {
    async uploadFromDevice(file: File): Promise<string | null> {
      try {
        const formData = new FormData();
        formData.append('file', file);

        // 1. Try Next.js Cloudinary API route first
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          if (res.ok) {
            const data = await res.json();
            if (data.url) return data.url;
          }
        } catch {
          // continue to backend
        }

        // 2. Try Express backend API
        const resBackend = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          body: formData,
        });
        if (resBackend.ok) {
          const data = await resBackend.json();
          if (data.url) return data.url;
        }

        return null;
      } catch (err) {
        console.error('apiClient.upload.uploadFromDevice error:', err);
        return null;
      }
    },

    async uploadMultipleFromDevice(files: File[]): Promise<string[]> {
      const urls: string[] = [];
      for (const file of files) {
        const url = await this.uploadFromDevice(file);
        if (url) urls.push(url);
      }
      return urls;
    },
  },

  auth: {
    async adminLogin(email: string, password: string): Promise<{ success: boolean; token?: string; user?: any; message?: string }> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/auth/admin-login`, {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          return { success: false, message: data.message || 'Authentication failed' };
        }
        return { success: true, token: data.token, user: data.user };
      } catch (err: any) {
        return { success: false, message: err.message || 'Connection to authentication service failed' };
      }
    },

    async getAdminMe(): Promise<{ success: boolean; user?: any; message?: string }> {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/auth/admin-me`, {
          method: 'GET',
        });
        if (!res.ok) {
          return { success: false };
        }
        const data = await res.json().catch(() => ({}));
        return { success: true, user: data.user };
      } catch {
        return { success: false };
      }
    },

    async logout(): Promise<void> {
      try {
        await fetchWithTimeout(`${API_BASE}/auth/logout`, {
          method: 'POST',
        });
      } catch {
        // ignore network error on logout
      }
    },
  },
};