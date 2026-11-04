import { InventoryItem, StockAdjustment } from '@/types';
import { getFromStorage, saveToStorage } from './storageHelper';
import { productService } from './productService';

const ADJUSTMENTS_KEY = 'stock_adjustments';

export const inventoryService = {
  getInventory(): InventoryItem[] {
    const products = productService.getProducts();
    if (!products || products.length === 0) return [];

    return products.map((p, index) => {
      const stock = typeof p.stock === 'number' ? p.stock : 0;
      const threshold = 3;
      const status: InventoryItem['status'] =
        stock === 0 ? 'Out of Stock' : stock <= threshold ? 'Low Stock' : 'In Stock';

      return {
        id: `inv-${p.id || index}`,
        productId: p.id,
        name: p.name,
        sku: p.sku || `MNR-${String(p.id).slice(-4)}`,
        image: (p.images && p.images[0]) || (p as any).image || '',
        category: p.categoryName || p.category || 'Couture',
        variant: (p.colors && p.colors[0]?.name) || 'Standard',
        available: stock,
        reserved: 0,
        incoming: 0,
        threshold,
        location: 'Monarch Central Vault, Awadh',
        status,
        price: p.price || 0,
        inventoryValue: stock * (p.price || 0),
        lastRestocked: (p as any).updatedAt || new Date().toISOString(),
        updatedAt: (p as any).updatedAt || new Date().toISOString(),
      };
    });
  },

  getAdjustments(): StockAdjustment[] {
    return getFromStorage<StockAdjustment[]>(ADJUSTMENTS_KEY, []);
  },

  adjustStock(
    inventoryId: string,
    quantityDelta: number,
    type: StockAdjustment['type'],
    reason: string,
    adjustedBy: string
  ): { item: InventoryItem; adjustment: StockAdjustment } {
    const inventory = this.getInventory();
    const adjustments = this.getAdjustments();
    const item = inventory.find((i) => i.id === inventoryId || i.productId === inventoryId);
    if (!item) throw new Error('Inventory item not found');

    const prevStock = item.available;
    const newStock = Math.max(0, prevStock + quantityDelta);

    // Update product stock directly
    productService.updateProduct(item.productId, { stock: newStock });

    const updatedItem: InventoryItem = {
      ...item,
      available: newStock,
      status: newStock === 0 ? 'Out of Stock' : newStock <= item.threshold ? 'Low Stock' : 'In Stock',
      inventoryValue: newStock * item.price,
    };

    const newAdjustment: StockAdjustment = {
      id: `adj-${Date.now()}`,
      productId: item.productId,
      productName: item.name,
      sku: item.sku,
      type,
      quantity: quantityDelta,
      previousStock: prevStock,
      newStock,
      reason,
      adjustedBy,
      timestamp: new Date().toISOString(),
    };

    saveToStorage(ADJUSTMENTS_KEY, [newAdjustment, ...adjustments]);

    return { item: updatedItem, adjustment: newAdjustment };
  },

  resetToDefault(): void {
    saveToStorage(ADJUSTMENTS_KEY, []);
  },
};
