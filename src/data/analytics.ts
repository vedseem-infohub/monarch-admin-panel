export interface AnalyticsMetric {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  subtext: string;
}

export interface RevenueTrendPoint {
  date: string;
  revenue: number;
  orders: number;
  aov: number;
}

export interface CategoryPerformance {
  category: string;
  revenue: number;
  percentage: number;
  ordersCount: number;
  color: string;
}

export interface RegionalSales {
  region: string;
  city: string;
  revenue: number;
  orders: number;
  share: number;
}

export const INITIAL_ANALYTICS = {
  kpis: [
    {
      label: 'Total Revenue',
      value: '₹ 1,84,65,400',
      change: '+24.8%',
      isPositive: true,
      subtext: 'vs last month',
    },
    {
      label: 'Total Orders',
      value: '94 Orders',
      change: '+18.2%',
      isPositive: true,
      subtext: 'vs last month',
    },
    {
      label: 'Average Order Value',
      value: '₹ 1,96,440',
      change: '+5.6%',
      isPositive: true,
      subtext: 'high-value bespoke trousseau',
    },
    {
      label: 'Royal Patrons',
      value: '1,420 Clients',
      change: '+14.1%',
      isPositive: true,
      subtext: 'verified sovereign clients',
    },
    {
      label: 'Pending Orders',
      value: '8 Orders',
      change: 'Needs Review',
      isPositive: false,
      subtext: '₹ 22.4L in escrow',
    },
    {
      label: 'Processing In Atelier',
      value: '14 Orders',
      change: 'Active Weaving',
      isPositive: true,
      subtext: 'On-schedule delivery',
    },
    {
      label: 'Delivered (This Month)',
      value: '72 Ensembles',
      change: '99.4% on-time',
      isPositive: true,
      subtext: 'White-Glove Courier',
    },
    {
      label: 'Low Stock Products',
      value: '5 Heirlooms',
      change: 'Action Required',
      isPositive: false,
      subtext: '≤ 3 items in vault',
    },
  ],
  revenueTrends: [
    { date: '01 Oct', revenue: 420000, orders: 2, aov: 210000 },
    { date: '05 Oct', revenue: 780000, orders: 4, aov: 195000 },
    { date: '10 Oct', revenue: 1450000, orders: 7, aov: 207142 },
    { date: '15 Oct', revenue: 2100000, orders: 11, aov: 190909 },
    { date: '20 Oct', revenue: 3850000, orders: 18, aov: 213888 },
    { date: '25 Oct', revenue: 5200000, orders: 26, aov: 200000 },
    { date: '30 Oct', revenue: 4665400, orders: 26, aov: 179438 },
  ],
  categoryPerformance: [
    { category: 'Bridal Lehengas', revenue: 7850000, percentage: 42.5, ordersCount: 28, color: '#5A1725' },
    { category: 'Royal Sherwanis', revenue: 4120000, percentage: 22.3, ordersCount: 22, color: '#C7A15B' },
    { category: 'Designer Sarees', revenue: 3340000, percentage: 18.1, ordersCount: 24, color: '#291116' },
    { category: 'Six Moods Handlooms', revenue: 1980000, percentage: 10.7, ordersCount: 14, color: '#9B7940' },
    { category: 'Imperial Bandhgalas', revenue: 1175400, percentage: 6.4, ordersCount: 6, color: '#1A1816' },
  ],
  regionalSales: [
    { region: 'Western India', city: 'Mumbai', revenue: 6420000, orders: 32, share: 34.8 },
    { region: 'Northern India', city: 'New Delhi / NCR', revenue: 5280000, orders: 28, share: 28.6 },
    { region: 'Southern India', city: 'Bengaluru', revenue: 2850000, orders: 15, share: 15.4 },
    { region: 'Rajasthan', city: 'Jaipur', revenue: 1940000, orders: 10, share: 10.5 },
    { region: 'Telangana', city: 'Hyderabad', revenue: 1975400, orders: 9, share: 10.7 },
  ],
  orderStatusDistribution: [
    { status: 'Delivered', count: 72, percentage: 76.6, color: '#3E7B54' },
    { status: 'Processing', count: 14, percentage: 14.9, color: '#C7A15B' },
    { status: 'Pending Verification', count: 5, percentage: 5.3, color: '#C98A2C' },
    { status: 'Refunded / Exchanged', count: 3, percentage: 3.2, color: '#A63A3A' },
  ],
};
