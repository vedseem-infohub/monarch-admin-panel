import { Collection, Category } from '@/types';
import { INITIAL_COLLECTIONS } from '@/data/collections';
import { INITIAL_CATEGORIES } from '@/data/categories';
import { getFromStorage, saveToStorage } from './storageHelper';
import { apiClient } from './apiClient';

const COLLECTIONS_KEY = 'collections';
const CATEGORIES_KEY = 'categories';

let hasSyncedCollections = false;
let hasSyncedCategories = false;

export const collectionService = {
  getCollections(): Collection[] {
    const cached = getFromStorage<Collection[]>(COLLECTIONS_KEY, INITIAL_COLLECTIONS);

    if (typeof window !== 'undefined' && !hasSyncedCollections) {
      hasSyncedCollections = true;
      this.syncWithBackend().catch(() => {});
    }
    return cached || INITIAL_COLLECTIONS;
  },

  async fetchCollections(): Promise<Collection[]> {
    return this.syncWithBackend();
  },

  async syncWithBackend(): Promise<Collection[]> {
    try {
      const remote = await apiClient.collections.getAll();
      if (remote && Array.isArray(remote)) {
        saveToStorage(COLLECTIONS_KEY, remote);
        return remote;
      }
    } catch (err) {
      console.warn('Could not sync collections with backend:', err);
    }
    return getFromStorage<Collection[]>(COLLECTIONS_KEY, INITIAL_COLLECTIONS);
  },

  getCollectionById(id: string): Collection | undefined {
    return this.getCollections().find((c) => c.id === id || (c as any)._id === id || c.slug === id);
  },

  updateCollection(id: string, updates: Partial<Collection>): Collection {
    const collections = this.getCollections();
    const index = collections.findIndex((c) => c.id === id || (c as any)._id === id);
    if (index === -1) throw new Error('Collection not found');

    const updated = { ...collections[index], ...updates };
    collections[index] = updated;
    saveToStorage(COLLECTIONS_KEY, collections);

    apiClient.collections.update(id, updates).catch((err) => {
      console.warn('Backend sync error on updateCollection:', err);
    });

    return updated;
  },

  reorderCollectionProducts(collectionId: string, productIds: string[]): Collection {
    const collections = this.getCollections();
    const index = collections.findIndex((c) => c.id === collectionId || (c as any)._id === collectionId);
    if (index === -1) throw new Error('Collection not found');

    const updated = {
      ...collections[index],
      productIds,
      itemCount: productIds.length,
    };
    collections[index] = updated;
    saveToStorage(COLLECTIONS_KEY, collections);

    apiClient.collections.update(collectionId, { productIds }).catch((err) => {
      console.warn('Backend sync error on reorderCollectionProducts:', err);
    });

    return updated;
  },

  createCollection(newCol: Omit<Collection, 'id'>): Collection {
    const collections = this.getCollections();
    const id = `col-${Date.now()}`;
    const collection: Collection = { ...newCol, id };
    const updated = [...collections, collection];
    saveToStorage(COLLECTIONS_KEY, updated);

    apiClient.collections.create(collection).catch((err) => {
      console.warn('Backend sync error on createCollection:', err);
    });

    return collection;
  },

  deleteCollection(id: string): void {
    const collections = this.getCollections();
    const filtered = collections.filter((c) => c.id !== id && (c as any)._id !== id);
    saveToStorage(COLLECTIONS_KEY, filtered);

    apiClient.collections.delete(id).catch((err) => {
      console.warn('Backend sync error on deleteCollection:', err);
    });
  },

  resetToDefault(): Collection[] {
    saveToStorage(COLLECTIONS_KEY, []);
    return [];
  },
};

export const categoryService = {
  getCategories(): Category[] {
    const cached = getFromStorage<Category[]>(CATEGORIES_KEY, INITIAL_CATEGORIES);

    if (typeof window !== 'undefined' && !hasSyncedCategories) {
      hasSyncedCategories = true;
      this.syncWithBackend().catch(() => {});
    }
    return cached || INITIAL_CATEGORIES;
  },

  async fetchCategories(): Promise<Category[]> {
    return this.syncWithBackend();
  },

  async syncWithBackend(): Promise<Category[]> {
    try {
      const remote = await apiClient.categories.getAll();
      if (remote && Array.isArray(remote)) {
        saveToStorage(CATEGORIES_KEY, remote);
        return remote;
      }
    } catch (err) {
      console.warn('Could not sync categories with backend:', err);
    }
    return getFromStorage<Category[]>(CATEGORIES_KEY, INITIAL_CATEGORIES);
  },

  getCategoryById(id: string): Category | undefined {
    return this.getCategories().find((c) => c.id === id || (c as any)._id === id || c.slug === id);
  },

  updateCategory(id: string, updates: Partial<Category>): Category {
    const categories = this.getCategories();
    const index = categories.findIndex((c) => c.id === id || (c as any)._id === id);
    if (index === -1) throw new Error('Category not found');

    const updated = { ...categories[index], ...updates };
    categories[index] = updated;
    saveToStorage(CATEGORIES_KEY, categories);

    apiClient.categories.update(id, updates).catch((err) => {
      console.warn('Backend sync error on updateCategory:', err);
    });

    return updated;
  },

  createCategory(newCat: Omit<Category, 'id'>): Category {
    const categories = this.getCategories();
    const id = `cat-${Date.now()}`;
    const category: Category = { ...newCat, id };
    const updated = [...categories, category];
    saveToStorage(CATEGORIES_KEY, updated);

    apiClient.categories.create(category).catch((err) => {
      console.warn('Backend sync error on createCategory:', err);
    });

    return category;
  },

  deleteCategory(id: string): void {
    const categories = this.getCategories();
    const filtered = categories.filter((c) => c.id !== id && (c as any)._id !== id);
    saveToStorage(CATEGORIES_KEY, filtered);

    apiClient.categories.delete(id).catch((err) => {
      console.warn('Backend sync error on deleteCategory:', err);
    });
  },

  resetToDefault(): Category[] {
    saveToStorage(CATEGORIES_KEY, []);
    return [];
  },
};
