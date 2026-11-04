// Comprehensive types for MONARCH luxury admin panel

export interface ColorVariant {
  id?: string;
  name: string;
  hex: string;
  imageIndex?: number;
  image?: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  size: string;
  color: string;
  price: number;
  stock: number;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  tagline: string;
  description: string;
  shortDescription?: string;
  category: string;
  categoryName: string;
  subcategory?: string;
  collection?: string;
  gender: 'women' | 'men' | 'unisex';
  price: number;
  regularPrice: number;
  costPrice: number;
  discountPercent?: number;
  stock: number;
  status: 'Published' | 'Draft' | 'Archived';
  featured: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isBridal?: boolean;
  isSixMoods?: boolean;
  isVaultSignature?: boolean;
  homepageVisibility: boolean;
  sectionKey?: string;
  sectionFrameId?: string;
  ctaLink?: string;
  badge?: string;
  rating: number;
  reviewsCount: number;
  images: string[];
  colors: ColorVariant[];
  sizes: string[];
  variants?: ProductVariant[];
  fabric: string;
  weavingTechnique?: string;
  embroidery: string;
  craftsmanshipStory: string;
  loomStory?: string;
  artisanInfo?: string;
  careInstructions: string[];
  fitMeasurements?: string;
  bespokeTailoring?: boolean;
  relatedProductIds?: string[];
  metaTitle?: string;
  metaDescription?: string;
  urlSlug?: string;
  socialImage?: string;
  bestsellerRank?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  gender: 'women' | 'men' | 'all';
  image: string;
  itemCount: number;
  tagline: string;
  description: string;
  status: 'Active' | 'Inactive';
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  productIds: string[];
  isVisible: boolean;
  isFeatured: boolean;
  displayOrder: number;
  itemCount?: number;
}

export interface InventoryItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  image: string;
  category: string;
  variant: string;
  available: number;
  reserved: number;
  incoming: number;
  threshold: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  price: number;
  inventoryValue: number;
  location: string;
  updatedAt: string;
}

export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: 'Addition' | 'Deduction' | 'Audit Correction' | 'Return Restock' | 'Damaged/Write-off';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  adjustedBy: string;
  timestamp: string;
}

export interface Address {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  image: string;
  variantColor: string;
  variantSize: string;
  price: number;
  quantity: number;
  total: number;
}

export interface OrderTimelineEvent {
  status: string;
  message: string;
  timestamp: string;
  actor: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customer?: any;
  orderDate: string;
  createdAt?: string;
  date?: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Refunded';
  paymentStatus: 'Paid' | 'Pending' | 'Refunded' | 'Failed';
  paymentMethod: string;
  shippingAddress: Address;
  billingAddress: Address;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shippingFee: number;
  total: number;
  trackingNumber?: string;
  courier?: string;
  internalNotes?: string[];
  timeline: OrderTimelineEvent[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  totalSpend: number;
  totalOrders: number;
  firstOrderDate: string;
  lastOrderDate: string;
  tags: string[];
  status: 'Active' | 'VIP' | 'Royal Patron' | 'Inactive';
  addresses: Address[];
  notes: string[];
}

export interface DiscountCoupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit: number;
  usageCount: number;
  expiryDate: string;
  status: 'Active' | 'Expired' | 'Disabled';
  createdAt: string;
}

export interface ReturnRequest {
  id: string;
  returnNumber: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  product: {
    id: string;
    name: string;
    sku: string;
    image: string;
    variant: string;
    price: number;
  };
  reason: string;
  requestDate: string;
  status: 'Requested' | 'Approved' | 'Rejected' | 'Pickup Scheduled' | 'Received' | 'Refunded' | 'Exchanged';
  refundAmount: number;
  pickupAddress: Address;
  inspectionNotes?: string;
  timeline: {
    status: string;
    date: string;
    note: string;
  }[];
}

export interface Shipment {
  id: string;
  shipmentNumber: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  destinationCity: string;
  destinationState: string;
  courier: 'BlueDart Apex' | 'Delhivery Express' | 'DTDC Air' | 'Monarch White-Glove';
  awbNumber: string;
  status: 'Manifested' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'NDR' | 'RTO';
  dispatchDate: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  shippingFee: number;
  weightKg: number;
}

export interface HomepageSection {
  id: string;
  key: string;
  name: string;
  title: string;
  subtitle: string;
  description: string;
  desktopImage: string;
  mobileImage: string;
  ctaText: string;
  ctaLink: string;
  isVisible: boolean;
  displayOrder: number;
  badgeText?: string;
  associatedProductIds?: string[];
  associatedCollectionId?: string;
  contentStats?: string;
}

export interface SectionFrame {
  id: string;
  sectionKey: string;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  description?: string;
  image: string;
  imageMobile?: string;
  ctaText?: string;
  ctaLink?: string;
  actionHref?: string;
  badge?: string;
  price?: number;
  originalPrice?: number;
  tagline?: string;
  displayOrder: number;
  metadata?: Record<string, any>;
  isVisible: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  status: 'Approved' | 'Pending' | 'Flagged';
  verifiedPurchase: boolean;
}

export interface RoyalSubscriber {
  id: string;
  email: string;
  fullName?: string;
  subscriptionDate: string;
  status: 'Subscribed' | 'Unsubscribed';
  preferredCategories: string[];
}

export interface StorySection {
  id: string;
  heading: string;
  content: string;
  image?: string;
}

export interface StoryCMS {
  brandTitle: string;
  heroHeadline: string;
  manifesto: string;
  establishedYear: string;
  sections: StorySection[];
  editorialQuote: string;
  quoteAuthor: string;
  bannerImage: string;
}

export interface ArtisanProfile {
  id: string;
  name: string;
  craft: string;
  region: string;
  experienceYears: number;
  biography: string;
  image: string;
  signaturePieces: string[];
}

export interface LookbookItem {
  id: string;
  title: string;
  season: string;
  collection: string;
  coverImage: string;
  images: string[];
  displayOrder: number;
  photographer?: string;
  stylist?: string;
}

export interface StoreLocation {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  workingHours: string;
  image: string;
  valetService: boolean;
  appointmentOnly: boolean;
}

export interface PolicyDocument {
  id: string;
  key: 'shipping' | 'returns' | 'privacy' | 'terms';
  title: string;
  lastUpdated: string;
  sections: { title: string; content: string }[];
}

export interface ReturnsExchangePolicy {
  title: string;
  subtitle: string;
  exchangeWindowDays: number;
  exchangeWindowDescription: string;
  bespokePolicyHeadline: string;
  bespokePolicyDescription: string;
  exchangeStepsHeadline: string;
  exchangeStepsDescription: string;
  conciergeWhatsApp: string;
  conciergeEmail: string;
  lastUpdated: string;
  sections: { title: string; content: string }[];
}

export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  displayOrder: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'Super Admin' | 'Catalog Director' | 'Order Specialist' | 'Concierge Lead';
  status: 'Active' | 'Inactive';
  lastLogin: string;
  permissions: string[];
}

export interface ActivityLog {
  id: string;
  action: string;
  category: 'Catalog' | 'Sales' | 'Storefront' | 'Operations' | 'System' | 'Security';
  user: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface StoreSettings {
  storeName: string;
  legalEntity: string;
  gstin: string;
  supportEmail: string;
  supportPhone: string;
  conciergeWhatsApp: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  standardShippingFee: number;
  freeShippingThreshold: number;
  orderPrefix: string;
  brandPrimaryColor: string;
  brandAccentColor: string;
  brandTagline: string;
}

export interface AbandonedCartItem {
  productId: string;
  productName: string;
  variant: string;
  price: number;
  quantity: number;
  image: string;
}

export interface AbandonedCart {
  id: string;
  cartToken: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: AbandonedCartItem[];
  totalValue: number;
  createdAt: string;
  recoveryStatus: 'Unrecovered' | 'Email Sent' | 'WhatsApp Sent' | 'VIP Concierge Contacted' | 'Recovered';
  lastContactedAt?: string;
  recoveryNote?: string;
}

export interface PaymentTransaction {
  id: string;
  transactionRef: string;
  orderNumber: string;
  customerName: string;
  paymentGateway: 'Razorpay' | 'Amex Centurion Direct' | 'Standard Chartered Wire' | 'HDFC NetBanking';
  method: 'Credit Card' | 'Net Banking' | 'UPI' | 'NEFT / RTGS' | 'International Card';
  amount: number;
  currency: string;
  status: 'Captured' | 'Settled' | 'Refunded' | 'Failed';
  gatewayFee: number;
  tax: number;
  netSettlement: number;
  timestamp: string;
  refundRef?: string;
}

