import { Product } from '@/types';
import { getFromStorage, saveToStorage } from './storageHelper';
import { apiClient } from './apiClient';

const STORAGE_KEY = 'products';
let hasSynced = false;

export const productService = {
  getProducts(): Product[] {
    const cached = getFromStorage<Product[]>(STORAGE_KEY, []);

    if (typeof window !== 'undefined' && !hasSynced) {
      hasSynced = true;
      this.syncWithBackend().catch(() => {});
    }
    return cached || [];
  },

  async fetchProducts(): Promise<Product[]> {
    return this.syncWithBackend();
  },

  async syncWithBackend(): Promise<Product[]> {
    try {
      const remote = await apiClient.products.getAll();
      if (remote && Array.isArray(remote)) {
        saveToStorage(STORAGE_KEY, remote);
        return remote;
      }
    } catch (err) {
      console.warn('Could not sync products with backend:', err);
    }
    return getFromStorage<Product[]>(STORAGE_KEY, []);
  },

  getProductById(id: string): Product | undefined {
    const products = this.getProducts();
    return products.find((p) => p.id === id || (p as any)._id === id);
  },

  async createProductAsync(newProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product | null> {
    try {
      const created = await apiClient.products.create(newProduct);
      if (created) {
        await this.syncWithBackend();
        return created;
      }
    } catch (err) {
      console.warn('Backend create error:', err);
    }
    return this.createProduct(newProduct);
  },

  createProduct(newProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const products = this.getProducts();
    const id = `monarch-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const product: Product = {
      ...newProduct,
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const updated = [product, ...products];
    saveToStorage(STORAGE_KEY, updated);

    // Persist to backend asynchronously
    apiClient.products.create(product).catch((err) => {
      console.warn('Backend sync error on createProduct:', err);
    });

    return product;
  },

  updateProduct(id: string, updates: Partial<Product>): Product {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === id || (p as any)._id === id);
    if (index === -1) {
      throw new Error(`Product ${id} not found`);
    }
    const updatedProduct = {
      ...products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    products[index] = updatedProduct;
    saveToStorage(STORAGE_KEY, products);

    // Persist to backend asynchronously
    apiClient.products.update(id, updates).catch((err) => {
      console.warn('Backend sync error on updateProduct:', err);
    });

    return updatedProduct;
  },

  deleteProduct(id: string): void {
    const products = this.getProducts();
    const filtered = products.filter((p) => p.id !== id && (p as any)._id !== id);
    saveToStorage(STORAGE_KEY, filtered);

    // Persist to backend asynchronously
    apiClient.products.delete(id).catch((err) => {
      console.warn('Backend sync error on deleteProduct:', err);
    });
  },

  bulkDeleteProducts(ids: string[]): void {
    const products = this.getProducts();
    const filtered = products.filter((p) => !ids.includes(p.id) && !ids.includes((p as any)._id));
    saveToStorage(STORAGE_KEY, filtered);

    // Persist to backend asynchronously
    apiClient.products.bulkDelete(ids).catch((err) => {
      console.warn('Backend sync error on bulkDeleteProducts:', err);
    });
  },

  bulkUpdateStatus(ids: string[], status: Product['status']): void {
    const products = this.getProducts();
    const updated = products.map((p) => (ids.includes(p.id) || ids.includes((p as any)._id) ? { ...p, status } : p));
    saveToStorage(STORAGE_KEY, updated);

    // Persist to backend asynchronously
    apiClient.products.bulkUpdateStatus(ids, status).catch((err) => {
      console.warn('Backend sync error on bulkUpdateStatus:', err);
    });
  },

  reorderBestSellers(orderedIds: string[]): void {
    const products = this.getProducts();
    const updated = products.map((p) => {
      const rankIndex = orderedIds.indexOf(p.id);
      if (rankIndex !== -1) {
        return {
          ...p,
          isBestSeller: true,
          bestsellerRank: rankIndex + 1,
        };
      }
      return p;
    });
    saveToStorage(STORAGE_KEY, updated);
  },

  resetToDefault(): Product[] {
    saveToStorage(STORAGE_KEY, []);
    return [];
  },
};
