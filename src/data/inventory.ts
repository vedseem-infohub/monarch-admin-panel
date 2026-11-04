import { InventoryItem, StockAdjustment } from '@/types';
import { INITIAL_PRODUCTS } from './products';

export const INITIAL_INVENTORY: InventoryItem[] = INITIAL_PRODUCTS.map((product) => {
  const isLow = product.stock <= 3;
  const isOut = product.stock === 0;

  return {
    id: `inv-${product.id}`,
    productId: product.id,
    sku: product.sku,
    name: product.name,
    image: product.images[0] || '/images/moods/banarasi_brocade.jpg',
    category: product.categoryName,
    variant: product.sizes.join(', '),
    available: product.stock,
    reserved: Math.max(0, Math.floor(product.stock * 0.25)),
    incoming: isLow ? 5 : 2,
    threshold: 4,
    status: isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock',
    price: product.price,
    inventoryValue: product.stock * product.price,
    location: product.category.includes('bridal') ? 'Mehrauli Vault, Delhi' : 'Kala Ghoda Atelier, Mumbai',
    updatedAt: product.updatedAt,
  };
});

export const INITIAL_ADJUSTMENTS: StockAdjustment[] = [
  {
    id: 'adj-001',
    productId: 'monarch-001',
    productName: 'Gulnaar Embroidered Zardozi Lehenga',
    sku: 'MNR-BRD-001',
    type: 'Audit Correction',
    quantity: -1,
    previousStock: 7,
    newStock: 6,
    reason: 'Transferred to Kala Ghoda Flagship Boutique for Gallery Display',
    adjustedBy: 'Vikramaditya Rao (Inventory Director)',
    timestamp: '2026-10-28T14:30:00Z',
  },
  {
    id: 'adj-002',
    productId: 'monarch-na-008',
    productName: 'Gulrukh Rose Quartz Silk Lehenga',
    sku: 'MNR-BRD-008',
    type: 'Deduction',
    quantity: -1,
    previousStock: 3,
    newStock: 2,
    reason: 'Dispatched for Royal Client Commission #MNR-8842',
    adjustedBy: 'Gayatri Devi (Order Specialist)',
    timestamp: '2026-10-29T11:15:00Z',
  },
  {
    id: 'adj-003',
    productId: 'monarch-na-006',
    productName: 'Surya Rekha Kanjivaram Gold Tissue Saree',
    sku: 'MNR-KNJ-006',
    type: 'Addition',
    quantity: 2,
    previousStock: 0,
    newStock: 2,
    reason: 'Received newly woven batch from Kanchipuram Pitloom Guild',
    adjustedBy: 'Vikramaditya Rao (Inventory Director)',
    timestamp: '2026-10-27T16:00:00Z',
  },
  {
    id: 'adj-004',
    productId: 'monarch-bs-007',
    productName: 'Darbar Hand-Brocade Nehru Jacket',
    sku: 'MNR-NHR-007',
    type: 'Addition',
    quantity: 5,
    previousStock: 10,
    newStock: 15,
    reason: 'Pre-festive restock batch delivered',
    adjustedBy: 'Rajiv Singhania (Logistics Lead)',
    timestamp: '2026-10-25T10:00:00Z',
  },
  {
    id: 'adj-005',
    productId: 'monarch-sm-paithani',
    productName: 'Paithani Hansa Heirloom Saree',
    sku: 'MNR-PTH-009',
    type: 'Audit Correction',
    quantity: 1,
    previousStock: 2,
    newStock: 3,
    reason: 'Returned from Royal Exhibition showcase in pristine condition',
    adjustedBy: 'Ananya Birla (Curator)',
    timestamp: '2026-10-24T09:40:00Z',
  },
];
