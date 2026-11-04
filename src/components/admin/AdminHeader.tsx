'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  Sparkles,
  Plus,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Package,
  ShoppingBag,
  Users,
  Check,
  Calendar,
  LogOut,
  User,
  Sliders,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { productService } from '@/services/productService';
import { orderService } from '@/services/orderService';
import { customerService } from '@/services/customerService';
import { clearAdminStorage } from '@/services/storageHelper';

interface HeaderProps {
  collapsed: boolean;
  setMobileOpen: (val: boolean) => void;
}

export function AdminHeader({ collapsed, setMobileOpen }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { admin, logout } = useAdminAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const notifRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (quickRef.current && !quickRef.current.contains(event.target as Node)) {
        setShowQuickActions(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute breadcrumbs from pathname
  const pathParts = pathname.split('/').filter(Boolean);
  const breadcrumbItems = pathParts.map((part, index) => {
    const href = '/' + pathParts.slice(0, index + 1).join('/');
    const title = part
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return { title, href };
  });

  // Global search matching
  const allProducts = productService.getProducts();
  const allOrders = orderService.getOrders();
  const allCustomers = customerService.getCustomers();

  const matchedProducts = searchQuery
    ? allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const matchedOrders = searchQuery
    ? allOrders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const matchedCustomers = searchQuery
    ? allCustomers.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const hasSearchResults =
    matchedProducts.length > 0 || matchedOrders.length > 0 || matchedCustomers.length > 0;

  // Handle demo data reset
  const handleResetDemoData = () => {
    if (confirm('Reset all demo changes back to pristine initial luxury dataset?')) {
      clearAdminStorage();
      toast('Demo data restored to initial state', 'info');
      setShowQuickActions(false);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  // Client-safe profile display values (prevents server vs client hydration mismatches)
  const displayInitials =
    mounted && admin?.name
      ? admin.avatar || admin.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
      : 'DR';
  const displayName = mounted && admin?.name ? admin.name : 'Devraj S. Rathore';
  const displayRole = mounted && admin?.role ? admin.role : 'Super Admin';

  return (
    <header className="h-20 bg-[#FFFFFF] border-b border-[#E8E3D9] sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-sm text-[#24221E] hover:bg-[#F7F5F0]"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5 text-[#24221E]" />
        </button>

        {/* Breadcrumbs */}
        <nav className="hidden sm:flex items-center space-x-2 text-xs font-sans">
          <Link
            href="/admin/dashboard"
            className="text-[#77736C] hover:text-[#B39458] transition-colors font-medium"
          >
            MONARCH
          </Link>
          {breadcrumbItems.map((item, idx) => (
            <React.Fragment key={item.href}>
              <span className="text-[#D0C9BD]">/</span>
              {idx === breadcrumbItems.length - 1 ? (
                <span className="text-[#24221E] font-semibold">{item.title}</span>
              ) : (
                <Link
                  href={item.href}
                  className="text-[#77736C] hover:text-[#B39458] transition-colors"
                >
                  {item.title}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Center: Global Search Bar */}
      <div ref={searchRef} className="relative flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-[#A8A49C] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            placeholder="Search products, SKUs, patrons, or orders..."
            className="w-full pl-10 pr-4 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] placeholder-[#A8A49C] focus:bg-[#FFFFFF] focus:outline-none focus:border-[#B39458] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#77736C] hover:text-[#24221E]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {searchFocused && searchQuery.trim() !== '' && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-[#E8E3D9] shadow-2xl rounded-sm p-3 z-50 animate-in fade-in max-h-96 overflow-y-auto">
            {!hasSearchResults ? (
              <div className="py-6 text-center text-xs text-[#77736C]">
                No matching results found for &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              <div className="space-y-4">
                {matchedProducts.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold tracking-wider text-[#A8A49C] uppercase px-2 mb-1.5 flex items-center space-x-1">
                      <Package className="w-3 h-3 text-[#B39458]" />
                      <span>Products</span>
                    </div>
                    {matchedProducts.map((p) => (
                      <Link
                        key={p.id}
                        href={`/admin/products`}
                        onClick={() => setSearchFocused(false)}
                        className="flex items-center justify-between p-2 hover:bg-[#F7F5F0] rounded-sm transition-colors text-xs"
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="font-medium text-[#24221E]">{p.name}</span>
                          <span className="text-[10px] bg-[#E8E3D9] text-[#77736C] px-1.5 py-0.5 rounded">
                            {p.sku}
                          </span>
                        </div>
                        <span className="text-[#9B7940] font-semibold">₹ {p.price.toLocaleString('en-IN')}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {matchedOrders.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold tracking-wider text-[#A8A49C] uppercase px-2 mb-1.5 flex items-center space-x-1">
                      <ShoppingBag className="w-3 h-3 text-[#B39458]" />
                      <span>Orders</span>
                    </div>
                    {matchedOrders.map((o) => (
                      <Link
                        key={o.id}
                        href={`/admin/orders`}
                        onClick={() => setSearchFocused(false)}
                        className="flex items-center justify-between p-2 hover:bg-[#F7F5F0] rounded-sm transition-colors text-xs"
                      >
                        <div>
                          <span className="font-semibold text-[#24221E]">{o.orderNumber}</span>
                          <span className="text-[#77736C] ml-2">— {o.customerName}</span>
                        </div>
                        <span className="text-[11px] font-medium text-[#3E7B54]">{o.status}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {matchedCustomers.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold tracking-wider text-[#A8A49C] uppercase px-2 mb-1.5 flex items-center space-x-1">
                      <Users className="w-3 h-3 text-[#B39458]" />
                      <span>Royal Patrons</span>
                    </div>
                    {matchedCustomers.map((c) => (
                      <Link
                        key={c.id}
                        href={`/admin/customers`}
                        onClick={() => setSearchFocused(false)}
                        className="flex items-center justify-between p-2 hover:bg-[#F7F5F0] rounded-sm transition-colors text-xs"
                      >
                        <div>
                          <span className="font-medium text-[#24221E]">{c.name}</span>
                          <span className="text-[10px] text-[#77736C] ml-2">{c.email}</span>
                        </div>
                        <span className="text-[10px] bg-[#F4EEDF] text-[#9B7940] px-1.5 py-0.5 rounded">
                          {c.status}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Date, Notifications, Quick Actions, Profile */}
      <div className="flex items-center space-x-3 md:space-x-4">
        {/* Current Date Badge */}
        <div className="hidden xl:flex items-center space-x-1.5 text-xs text-[#77736C] bg-[#F7F5F0] px-3 py-1.5 rounded-sm border border-[#E8E3D9]">
          <Calendar className="w-3.5 h-3.5 text-[#B39458]" />
          <span>Friday, 30 Oct 2026</span>
        </div>

        {/* Quick Actions Dropdown */}
        <div ref={quickRef} className="relative">
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="flex items-center space-x-1.5 bg-[#B39458] hover:bg-[#9B7940] text-white text-xs font-semibold px-3 py-2 rounded-sm transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Actions</span>
            <ChevronDown className="w-3 h-3 ml-0.5" />
          </button>

          {showQuickActions && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-[#E8E3D9] shadow-xl rounded-sm p-1.5 z-50 animate-in fade-in">
              <Link
                href="/admin/products/new"
                onClick={() => setShowQuickActions(false)}
                className="flex items-center space-x-2.5 px-3 py-2 text-xs text-[#24221E] hover:bg-[#F7F5F0] rounded-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#B39458]" />
                <span>Add New Product</span>
              </Link>
              <Link
                href="/admin/discounts"
                onClick={() => setShowQuickActions(false)}
                className="flex items-center space-x-2.5 px-3 py-2 text-xs text-[#24221E] hover:bg-[#F7F5F0] rounded-sm transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#B39458]" />
                <span>Create Royal Coupon</span>
              </Link>
              <a
                href="https://monarch-beta-two.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowQuickActions(false)}
                className="flex items-center space-x-2.5 px-3 py-2 text-xs text-[#24221E] hover:bg-[#F7F5F0] rounded-sm transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#B39458]" />
                <span>Open Live Boutique</span>
              </a>
              <div className="border-t border-[#E8E3D9] my-1" />
              <button
                onClick={handleResetDemoData}
                className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-[#A63A3A] hover:bg-[#FFF5F5] rounded-sm transition-colors text-left"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#A63A3A]" />
                <span>Reset Demo Changes</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-sm text-[#24221E] hover:bg-[#F7F5F0] border border-transparent hover:border-[#E8E3D9] transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4 text-[#24221E]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#B39458] rounded-full ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white border border-[#E8E3D9] shadow-2xl rounded-sm p-4 z-50 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E3D9]">
                <div className="flex items-center space-x-2">
                  <span className="font-serif font-bold text-sm text-[#24221E]">
                    Atelier Notifications
                  </span>
                  <span className="bg-[#F4EEDF] text-[#9B7940] text-[10px] font-bold px-1.5 py-0.5 rounded">
                    3 New
                  </span>
                </div>
                <button
                  onClick={() => {
                    toast('All notifications marked as read');
                    setShowNotifications(false);
                  }}
                  className="text-[11px] text-[#B39458] hover:text-[#9B7940] font-medium"
                >
                  Mark all read
                </button>
              </div>

              <div className="py-2 space-y-2.5">
                <div className="p-2.5 bg-[#FAF9F5] rounded-sm border border-[#E8E3D9]/60 flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-full bg-[#3E7B54]/15 flex items-center justify-center shrink-0 mt-0.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-[#3E7B54]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[#24221E]">
                      High-Value Order Received
                    </p>
                    <p className="text-[11px] text-[#77736C] mt-0.5">
                      Maharani Radhika Scindia placed Order #MNR-2026-8841 (₹ 3,98,160).
                    </p>
                    <span className="text-[10px] text-[#A8A49C] mt-1 block">15 minutes ago</span>
                  </div>
                </div>

                <div className="p-2.5 bg-[#FAF9F5] rounded-sm border border-[#E8E3D9]/60 flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-full bg-[#C98A2C]/15 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#C98A2C]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[#24221E]">
                      Low Vault Stock Alert
                    </p>
                    <p className="text-[11px] text-[#77736C] mt-0.5">
                      Surya Rekha Kanjivaram Gold Tissue Saree has only 2 units left.
                    </p>
                    <span className="text-[10px] text-[#A8A49C] mt-1 block">1 hour ago</span>
                  </div>
                </div>

                <div className="p-2.5 bg-[#FAF9F5] rounded-sm border border-[#E8E3D9]/60 flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-full bg-[#B39458]/15 flex items-center justify-center shrink-0 mt-0.5">
                    <Users className="w-3.5 h-3.5 text-[#B39458]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[#24221E]">
                      High-Value Order Placed
                    </p>
                    <p className="text-[11px] text-[#77736C] mt-0.5">
                      Princess Gauravi Kumari ordered Gulnaar Embroidered Zardozi Lehenga.
                    </p>
                    <span className="text-[10px] text-[#A8A49C] mt-1 block">3 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2.5 p-1.5 rounded-sm hover:bg-[#F7F5F0] transition-colors"
          >
            <div
              suppressHydrationWarning
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#B39458] to-[#9B7940] flex items-center justify-center text-white text-xs font-serif font-bold shadow-xs"
            >
              {displayInitials}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span suppressHydrationWarning className="text-xs font-semibold text-[#24221E] leading-tight">
                {displayName}
              </span>
              <span suppressHydrationWarning className="text-[10px] text-[#77736C] leading-none mt-0.5">
                {displayRole} · Sovereign
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#77736C] hidden lg:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-[#E8E3D9] shadow-xl rounded-sm p-2 z-50 animate-in fade-in">
              <div className="p-2 border-b border-[#E8E3D9]">
                <p suppressHydrationWarning className="text-xs font-bold text-[#24221E]">
                  {mounted && admin?.name ? admin.name : 'Devraj Singh Rathore'}
                </p>
                <p suppressHydrationWarning className="text-[11px] text-[#77736C]">
                  {mounted && admin?.email ? admin.email : 'devraj@monarch-couture.in'}
                </p>
                <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F4EEDF] text-[#9B7940] border border-[#B39458]/30">
                  {displayRole}
                </div>
              </div>

              <div className="py-1">
                <Link
                  href="/admin/system/users"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center space-x-2 px-3 py-2 text-xs text-[#24221E] hover:bg-[#F7F5F0] rounded-sm"
                >
                  <User className="w-3.5 h-3.5 text-[#77736C]" />
                  <span>Admin Profiles</span>
                </Link>
                <Link
                  href="/admin/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center space-x-2 px-3 py-2 text-xs text-[#24221E] hover:bg-[#F7F5F0] rounded-sm"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#77736C]" />
                  <span>Boutique Settings</span>
                </Link>
                <div className="border-t border-[#E8E3D9] my-1" />
                <button
                  onClick={async () => {
                    setShowProfileMenu(false);
                    toast('Logging out administrative terminal...', 'info');
                    await logout();
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-[#A63A3A] hover:bg-[#FFF5F5] rounded-sm text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#A63A3A]" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
