import { AdminUser, ActivityLog, StoreSettings } from '@/types';

export const INITIAL_STORE_SETTINGS: StoreSettings = {
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

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'usr-1',
    name: 'Devraj Singh Rathore',
    email: 'devraj@monarch-couture.in',
    avatar: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=70&w=200&auto=format&fit=crop',
    role: 'Super Admin',
    status: 'Active',
    lastLogin: '2026-10-30T11:45:00Z',
    permissions: ['all_access', 'catalog_manage', 'financial_reports', 'user_management', 'system_config'],
  },
  {
    id: 'usr-2',
    name: 'Gayatri Devi Chawla',
    email: 'gayatri@monarch-couture.in',
    avatar: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=70&w=200&auto=format&fit=crop',
    role: 'Catalog Director',
    status: 'Active',
    lastLogin: '2026-10-30T10:15:00Z',
    permissions: ['catalog_manage', 'homepage_builder', 'lookbook_edit', 'inventory_adjust'],
  },
  {
    id: 'usr-3',
    name: 'Vikramaditya Rao',
    email: 'vikram.rao@monarch-couture.in',
    avatar: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=70&w=200&auto=format&fit=crop',
    role: 'Order Specialist',
    status: 'Active',
    lastLogin: '2026-10-30T09:30:00Z',
    permissions: ['orders_manage', 'shipping_dashboard', 'returns_process', 'customer_view'],
  },
  {
    id: 'usr-4',
    name: 'Ananya Birla',
    email: 'ananya.birla@monarch-couture.in',
    avatar: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=70&w=200&auto=format&fit=crop',
    role: 'Concierge Lead',
    status: 'Active',
    lastLogin: '2026-10-29T18:20:00Z',
    permissions: ['customer_view', 'orders_view', 'newsletter_registry', 'patron_concierge'],
  },
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'act-101',
    action: 'Product Price Updated',
    category: 'Catalog',
    user: 'Gayatri Devi Chawla (Catalog Director)',
    details: 'Updated price for Surya Rekha Kanjivaram Gold Tissue Saree (MNR-KNJ-006) to ₹ 1,65,000',
    ipAddress: '103.21.124.9',
    timestamp: '2026-10-30T11:20:00Z',
  },
  {
    id: 'act-102',
    action: 'Order Status Changed to Processing',
    category: 'Sales',
    user: 'Vikramaditya Rao (Order Specialist)',
    details: 'Order #MNR-2026-8841 moved to Processing · Tailoring dispatched to Awadh Atelier',
    ipAddress: '103.21.124.12',
    timestamp: '2026-10-30T10:45:00Z',
  },
  {
    id: 'act-103',
    action: 'Stock Adjustment Recorded',
    category: 'Operations',
    user: 'Vikramaditya Rao (Inventory Director)',
    details: 'Transferred 1 unit of Gulnaar Lehenga to Mumbai Kala Ghoda Boutique for gallery showcase',
    ipAddress: '103.21.124.12',
    timestamp: '2026-10-30T09:15:00Z',
  },
  {
    id: 'act-104',
    action: 'Homepage Section Reordered',
    category: 'Storefront',
    user: 'Devraj Singh Rathore (Super Admin)',
    details: 'Published visual builder revisions · Main Hero headline updated with 24K zari hallmark tagline',
    ipAddress: '103.21.124.8',
    timestamp: '2026-10-29T17:30:00Z',
  },
  {
    id: 'act-105',
    action: 'New Royal Coupon Created',
    category: 'Sales',
    user: 'Devraj Singh Rathore (Super Admin)',
    details: 'Created coupon ATELIERPRIVILEGE (Flat ₹ 50,000 privilege, limit 25)',
    ipAddress: '103.21.124.8',
    timestamp: '2026-10-29T14:10:00Z',
  },
];

export interface IntegrationStatus {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'Connected' | 'Disconnected' | 'Sandbox Active';
  lastSync: string;
  iconName: string;
}

export const INITIAL_INTEGRATIONS: IntegrationStatus[] = [
  {
    id: 'int-1',
    name: 'Razorpay Haute Couture Suite',
    category: 'Payment Gateway',
    description: 'Accept credit cards, Amex Centurion, UPI & NetBanking with 3D Secure 2.0',
    status: 'Connected',
    lastSync: '10 mins ago',
    iconName: 'CreditCard',
  },
  {
    id: 'int-2',
    name: 'BlueDart Apex Luxury Logistics',
    category: 'Shipping & Fulfillment',
    description: 'Automated AWB manifest generation, scheduled pickups and live GPS air tracking',
    status: 'Connected',
    lastSync: '25 mins ago',
    iconName: 'Truck',
  },
  {
    id: 'int-3',
    name: 'WhatsApp Business Concierge',
    category: 'Patron Communications',
    description: 'Automated order confirmations, courier updates and real-time patron support',
    status: 'Connected',
    lastSync: 'Just now',
    iconName: 'MessageSquare',
  },
  {
    id: 'int-4',
    name: 'Delhivery Express Network',
    category: 'Shipping & Fulfillment',
    description: 'Backup insured pan-India express network for tier-1 and tier-2 city deliveries',
    status: 'Connected',
    lastSync: '1 hour ago',
    iconName: 'Package',
  },
  {
    id: 'int-5',
    name: 'Klaviyo Luxury VIP Registry',
    category: 'Marketing Automation',
    description: 'Automated ethnic wear releases, high-value abandonment reminders & newsletters',
    status: 'Connected',
    lastSync: '3 hours ago',
    iconName: 'Mail',
  },
  {
    id: 'int-6',
    name: 'Tally Prime Enterprise ERP',
    category: 'Financial Accounting',
    description: 'Automatic GST e-invoicing and inventory ledger synchronization',
    status: 'Sandbox Active',
    lastSync: 'Yesterday',
    iconName: 'FileText',
  },
];
