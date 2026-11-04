'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Coins,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Eye,
  ChevronRight,
  Package,
  RotateCcw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { formatINR } from '@/utils/formatters';
import { RevenueChart, CategoryDonutChart, OrderStatusChart } from '@/components/dashboard/Charts';
import { productService } from '@/services/productService';
import { orderService } from '@/services/orderService';
import { customerService } from '@/services/customerService';
import { inventoryService } from '@/services/inventoryService';
import { returnService } from '@/services/returnService';
import { settingsService } from '@/services/settingsService';
import { analyticsService } from '@/services/analyticsService';
import { categoryService } from '@/services/collectionService';
import { useToast } from '@/components/ui/Toast';
import { Order, Product, Customer, InventoryItem, ReturnRequest, ActivityLog } from '@/types';

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const [selectedRange, setSelectedRange] = useState<string>('This Month');
  const [filterMultiplier, setFilterMultiplier] = useState<number>(1);

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  const [revenueTrends, setRevenueTrends] = useState<any[]>(() => analyticsService.getRevenueTrends());
  const [categoryData, setCategoryData] = useState<any[]>(() => analyticsService.getCategoryPerformance());
  const [statusDistribution, setStatusDistribution] = useState<any[]>(() => analyticsService.getOrderStatusDistribution());

  useEffect(() => {
    async function loadDashboardRealData() {
      try {
        const [p, o, c, r] = await Promise.all([
          productService.fetchProducts(),
          orderService.fetchOrders(),
          customerService.fetchCustomers(),
          returnService.fetchReturns(),
        ]);
        if (p) setProducts(p);
        if (o) setOrders(o);
        if (c) setCustomers(c);
        if (r) setReturns(r);
        setInventory(inventoryService.getInventory());
        setLogs(settingsService.getActivityLogs());
        setRevenueTrends(analyticsService.getRevenueTrends());
        setCategoryData(analyticsService.getCategoryPerformance());
        setStatusDistribution(analyticsService.getOrderStatusDistribution());
      } catch (err) {
        console.warn('Dashboard real data fetch error:', err);
      }
    }

    loadDashboardRealData();
  }, []);

  // Date filters
  const dateFilters = [
    { label: 'Today', mult: 0.12 },
    { label: 'Yesterday', mult: 0.15 },
    { label: 'Last 7 Days', mult: 0.45 },
    { label: 'Last 30 Days', mult: 0.95 },
    { label: 'This Month', mult: 1.0 },
    { label: 'Last Month', mult: 0.88 },
  ];

  const handleFilterChange = (label: string, mult: number) => {
    setSelectedRange(label);
    setFilterMultiplier(mult);
    toast(`Dashboard metrics updated for: ${label}`, 'info');
  };

  // Adjust metrics based on real fetched data
  const realGrossRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalRevenue = Math.round(realGrossRevenue * filterMultiplier);
  const totalOrders = Math.round(orders.length * filterMultiplier);
  const totalCustomers = Math.round(customers.length * (0.8 + filterMultiplier * 0.2));
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending').length;
  const processingOrdersCount = orders.filter((o) => o.status === 'Processing').length;
  const deliveredOrdersCount = orders.filter((o) => o.status === 'Delivered').length;
  const lowStockCount = inventory.filter((i) => i.status === 'Low Stock' || i.status === 'Out of Stock').length;

  return (
    <div className="space-y-8 pb-12">
      {/* Page Title & Time Range Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E8E3D9] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[#B39458] font-bold">
              Executive Overview
            </span>
            <span className="text-[10px] bg-[#F4EEDF] text-[#9B7940] px-2 py-0.5 rounded-full font-semibold">
              Live Demo
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#24221E] mt-1">
            MONARCH Atelier Dashboard
          </h1>
          <p className="text-xs md:text-sm text-[#77736C] mt-1">
            Real-time performance of luxury orders, artisan inventory, and sovereign patron acclaim.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center flex-wrap gap-1.5 bg-[#FFFFFF] p-1.5 rounded-sm border border-[#E8E3D9] shadow-xs">
          <div className="hidden lg:flex items-center px-2 text-xs text-[#77736C]">
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-[#B39458]" />
            <span>Range:</span>
          </div>
          {dateFilters.map((df) => (
            <button
              key={df.label}
              onClick={() => handleFilterChange(df.label, df.mult)}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-all duration-150 ${
                selectedRange === df.label
                  ? 'bg-[#B39458] text-white shadow-xs'
                  : 'text-[#77736C] hover:text-[#24221E] hover:bg-[#F7F5F0]'
              }`}
            >
              {df.label}
            </button>
          ))}
        </div>
      </div>

      {/* 8 Statistics Cards (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Revenue */}
        <div className="luxury-card p-5 rounded-sm border-l-4 border-l-[#B39458] luxury-card-hover">
          <div className="flex items-center justify-between text-[#77736C]">
            <span className="text-xs uppercase tracking-wider font-semibold">Total Revenue</span>
            <span className="p-2 rounded bg-[#FAF7F0] text-[#B39458]">
              <Coins className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl font-serif font-bold text-[#24221E]" suppressHydrationWarning>
            {formatINR(totalRevenue)}
          </div>
          <div className="mt-2 flex items-center text-xs text-[#3E7B54]">
            <ArrowUpRight className="w-3.5 h-3.5 mr-1 shrink-0" />
            <span className="font-semibold">+24.8%</span>
            <span className="text-[#77736C] ml-1.5">vs previous period</span>
          </div>
        </div>

        {/* Card 2: Orders */}
        <div className="luxury-card p-5 rounded-sm border-l-4 border-l-[#5A1725] luxury-card-hover">
          <div className="flex items-center justify-between text-[#77736C]">
            <span className="text-xs uppercase tracking-wider font-semibold">Total Orders</span>
            <span className="p-2 rounded bg-[#FAF7F0] text-[#5A1725]">
              <ShoppingBag className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl font-serif font-bold text-[#24221E]" suppressHydrationWarning>
            {totalOrders} Ensembles
          </div>
          <div className="mt-2 flex items-center text-xs text-[#3E7B54]">
            <ArrowUpRight className="w-3.5 h-3.5 mr-1 shrink-0" />
            <span className="font-semibold">+18.2%</span>
            <span className="text-[#77736C] ml-1.5">conversion 3.8%</span>
          </div>
        </div>

        {/* Card 3: Customers */}
        <div className="luxury-card p-5 rounded-sm border-l-4 border-l-[#24221E] luxury-card-hover">
          <div className="flex items-center justify-between text-[#77736C]">
            <span className="text-xs uppercase tracking-wider font-semibold">Royal Patrons</span>
            <span className="p-2 rounded bg-[#FAF7F0] text-[#24221E]">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl font-serif font-bold text-[#24221E]" suppressHydrationWarning>
            {totalCustomers.toLocaleString('en-IN')} Clients
          </div>
          <div className="mt-2 flex items-center text-xs text-[#3E7B54]">
            <ArrowUpRight className="w-3.5 h-3.5 mr-1 shrink-0" />
            <span className="font-semibold">+14.1%</span>
            <span className="text-[#77736C] ml-1.5">high repeat rate</span>
          </div>
        </div>

        {/* Card 4: Average Order Value */}
        <div className="luxury-card p-5 rounded-sm border-l-4 border-l-[#C7A15B] luxury-card-hover">
          <div className="flex items-center justify-between text-[#77736C]">
            <span className="text-xs uppercase tracking-wider font-semibold">Avg. Order Value</span>
            <span className="p-2 rounded bg-[#FAF7F0] text-[#C7A15B]">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl font-serif font-bold text-[#24221E]" suppressHydrationWarning>
            {formatINR(avgOrderValue)}
          </div>
          <div className="mt-2 flex items-center text-xs text-[#3E7B54]">
            <ArrowUpRight className="w-3.5 h-3.5 mr-1 shrink-0" />
            <span className="font-semibold">+5.6%</span>
            <span className="text-[#77736C] ml-1.5">bespoke trousseau</span>
          </div>
        </div>

        {/* Card 5: Pending Orders */}
        <div className="luxury-card p-4 rounded-sm border border-[#E8E3D9] flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-sm bg-[#FFF8E6] text-[#C98A2C] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-[#77736C] uppercase">Pending Orders</div>
            <div className="text-lg font-serif font-bold text-[#24221E]" suppressHydrationWarning>
              {pendingOrdersCount} Awaiting Review
            </div>
            <span className="text-[10px] text-[#C98A2C]">Wire transfers & bank RTGS</span>
          </div>
        </div>

        {/* Card 6: Processing Orders */}
        <div className="luxury-card p-4 rounded-sm border border-[#E8E3D9] flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-sm bg-[#F4EEDF] text-[#B39458] flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-[#77736C] uppercase">In Atelier Processing</div>
            <div className="text-lg font-serif font-bold text-[#24221E]" suppressHydrationWarning>
              {processingOrdersCount} Ensembles
            </div>
            <span className="text-[10px] text-[#3E7B54]">Pitloom tailoring active</span>
          </div>
        </div>

        {/* Card 7: Delivered Orders */}
        <div className="luxury-card p-4 rounded-sm border border-[#E8E3D9] flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-sm bg-[#EBF5EE] text-[#3E7B54] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-[#77736C] uppercase">Delivered Orders</div>
            <div className="text-lg font-serif font-bold text-[#24221E]" suppressHydrationWarning>
              {deliveredOrdersCount} Dispatched
            </div>
            <span className="text-[10px] text-[#3E7B54]">99.4% white-glove SLA</span>
          </div>
        </div>

        {/* Card 8: Low Stock Alerts */}
        <div className="luxury-card p-4 rounded-sm border border-[#E8E3D9] flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-sm bg-[#FFF1F0] text-[#A63A3A] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-[#77736C] uppercase">Vault Stock Alerts</div>
            <div className="text-lg font-serif font-bold text-[#24221E]" suppressHydrationWarning>
              {lowStockCount} Items Low Stock
            </div>
            <Link href="/admin/inventory" className="text-[10px] text-[#A63A3A] hover:underline font-semibold">
              Restock from weaving guilds →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Revenue & Orders Analytics Chart */}
        <div className="lg:col-span-2 luxury-card p-6 rounded-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E3D9] pb-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-[#24221E]">
                Revenue & Inflow Analytics
              </h2>
              <p className="text-xs text-[#77736C]">
                Daily monetary progression for haute couture commissions ({selectedRange})
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-[#F4EEDF] text-[#9B7940] rounded">
              INR (₹)
            </span>
          </div>

          <RevenueChart data={revenueTrends} />
        </div>

        {/* Right 1 Col: Sales by Category */}
        <div className="luxury-card p-6 rounded-sm space-y-4">
          <div className="border-b border-[#E8E3D9] pb-4">
            <h2 className="text-lg font-serif font-bold text-[#24221E]">
              Sales by Silk Category
            </h2>
            <p className="text-xs text-[#77736C]">
              Share of gross revenues across bridal, weaves & groomwear
            </p>
          </div>

          <CategoryDonutChart data={categoryData} />

          <div className="border-t border-[#E8E3D9] pt-4 mt-6">
            <div className="text-xs font-semibold uppercase text-[#77736C] mb-3">
              Fulfilment Distribution
            </div>
            <OrderStatusChart data={statusDistribution} />
          </div>
        </div>
      </div>

      {/* Section 2: Recent Orders & Top-Selling Masterpieces */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table (2 Cols) */}
        <div className="lg:col-span-2 luxury-card p-6 rounded-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E3D9] pb-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-[#24221E]">
                Recent Sovereign Orders
              </h2>
              <p className="text-xs text-[#77736C]">
                Latest high-value transactions and white-glove dispatch requests
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-[#B39458] hover:text-[#9B7940] flex items-center space-x-1"
            >
              <span>View All Orders</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E8E3D9] text-[11px] font-semibold text-[#77736C] uppercase">
                  <th className="py-2.5 px-3">Order Number</th>
                  <th className="py-2.5 px-3">Patron</th>
                  <th className="py-2.5 px-3">Items</th>
                  <th className="py-2.5 px-3">Total</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E3D9]/60 text-xs" suppressHydrationWarning>
                {orders.slice(0, 5).map((order) => {
                  const statusColor =
                    order.status === 'Delivered'
                      ? 'bg-[#EBF5EE] text-[#3E7B54]'
                      : order.status === 'Processing'
                      ? 'bg-[#F4EEDF] text-[#9B7940]'
                      : order.status === 'Pending'
                      ? 'bg-[#FFF8E6] text-[#C98A2C]'
                      : order.status === 'Shipped'
                      ? 'bg-[#EEF4FF] text-[#3B66AC]'
                      : 'bg-[#FFF1F0] text-[#A63A3A]';

                  return (
                    <tr key={order.id} className="hover:bg-[#FAF9F5] transition-colors">
                      <td className="py-3 px-3 font-semibold font-mono text-[#24221E]">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-[#24221E]">{order.customerName}</div>
                        <div className="text-[10px] text-[#77736C]">{order.shippingAddress.city}</div>
                      </td>
                      <td className="py-3 px-3 text-[#77736C]">
                        {order.items.length} {order.items.length === 1 ? 'Ensemble' : 'Ensembles'}
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#24221E]">
                        {formatINR(order.total)}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/admin/orders`}
                          className="p-1.5 rounded hover:bg-[#E8E3D9] text-[#77736C] hover:text-[#24221E] inline-flex items-center"
                          title="View Order Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top-Selling Products (1 Col) */}
        <div className="luxury-card p-6 rounded-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E3D9] pb-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-[#24221E]">
                Patron Acclaim
              </h2>
              <p className="text-xs text-[#77736C]">Top converting royal creations</p>
            </div>
            <Link
              href="/admin/storefront/best-sellers"
              className="text-xs font-semibold text-[#B39458] hover:text-[#9B7940]"
            >
              Manage
            </Link>
          </div>

          <div className="space-y-3.5" suppressHydrationWarning>
            {products
              .filter((p) => p.isBestSeller)
              .slice(0, 4)
              .map((prod, idx) => (
                <div
                  key={prod.id}
                  className="flex items-center space-x-3 p-2 rounded-sm hover:bg-[#FAF9F5] transition-colors"
                >
                  <span className="w-6 text-center font-serif font-bold text-xs text-[#B39458]">
                    #{idx + 1}
                  </span>
                  <div className="w-12 h-12 rounded-xs overflow-hidden shrink-0 border border-[#E8E3D9]">
                    <img
                      src={prod.images[0] || '/images/moods/banarasi_brocade.jpg'}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#24221E] truncate">{prod.name}</p>
                    <p className="text-[10px] text-[#77736C]">{prod.categoryName}</p>
                    <p className="text-xs font-bold text-[#9B7940] mt-0.5">{formatINR(prod.price)}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Section 3: Inventory Alerts, Pending Returns, and Real-Time Activity Log */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Inventory Alerts */}
        <div className="luxury-card p-5 rounded-sm space-y-3">
          <div className="flex items-center justify-between border-b border-[#E8E3D9] pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#24221E] flex items-center space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#C98A2C]" />
              <span>Inventory Thresholds</span>
            </span>
            <Link
              href="/admin/inventory"
              className="text-[11px] text-[#B39458] hover:underline font-semibold"
            >
              Adjust
            </Link>
          </div>

          <div className="space-y-2.5" suppressHydrationWarning>
            {inventory
              .filter((item) => item.status === 'Low Stock' || item.status === 'Out of Stock')
              .slice(0, 3)
              .map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-sm bg-[#FFFDF7] border border-[#F4EEDF] text-xs"
                >
                  <div className="truncate mr-2">
                    <p className="font-semibold text-[#24221E] truncate">{item.name}</p>
                    <span className="text-[10px] text-[#77736C]">SKU: {item.sku}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-[#A63A3A]">
                      {item.available} Left
                    </span>
                    <span className="text-[10px] text-[#C98A2C] block">
                      +{item.incoming} Incoming
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Pending Returns & Alterations */}
        <div className="luxury-card p-5 rounded-sm space-y-3">
          <div className="flex items-center justify-between border-b border-[#E8E3D9] pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#24221E] flex items-center space-x-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-[#B39458]" />
              <span>Returns & Alterations</span>
            </span>
            <Link
              href="/admin/returns"
              className="text-[11px] text-[#B39458] hover:underline font-semibold"
            >
              Dashboard
            </Link>
          </div>

          <div className="space-y-2.5" suppressHydrationWarning>
            {returns.slice(0, 3).map((ret) => (
              <div
                key={ret.id}
                className="p-2.5 rounded-sm bg-[#FAF9F5] border border-[#E8E3D9] text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#24221E]">{ret.returnNumber}</span>
                  <span className="text-[10px] bg-[#F4EEDF] text-[#9B7940] px-1.5 py-0.5 rounded font-semibold">
                    {ret.status}
                  </span>
                </div>
                <p className="text-[11px] font-medium text-[#24221E] truncate">{ret.product.name}</p>
                <p className="text-[10px] text-[#77736C] truncate">{ret.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Admin Activity Log */}
        <div className="luxury-card p-5 rounded-sm space-y-3">
          <div className="flex items-center justify-between border-b border-[#E8E3D9] pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#24221E] flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#B39458]" />
              <span>Real-Time Audit Logs</span>
            </span>
            <Link
              href="/admin/system/logs"
              className="text-[11px] text-[#B39458] hover:underline font-semibold"
            >
              Full Log
            </Link>
          </div>

          <div className="space-y-2.5" suppressHydrationWarning>
            {logs.slice(0, 3).map((log) => (
              <div key={log.id} className="text-xs space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#24221E]">{log.action}</span>
                  <span className="text-[10px] text-[#A8A49C]" suppressHydrationWarning>
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-[#77736C] line-clamp-1">{log.details}</p>
                <span className="text-[10px] text-[#B39458] font-medium block">
                  By {log.user.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
