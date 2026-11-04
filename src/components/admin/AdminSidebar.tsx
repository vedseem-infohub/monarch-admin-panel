'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  FolderTree,
  Boxes,
  ShoppingBag,
  Users,
  ShoppingCart,
  TicketPercent,
  RotateCcw,
  Layers,
  Image as ImageIcon,
  Flame,
  Crown,
  HeartHandshake,
  Compass,
  Mail,
  HelpCircle,
  Truck,
  CreditCard,
  BarChart3,
  UserCheck,
  KeyRound,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (val: boolean) => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'CATALOG',
    items: [
      { name: 'All Products', href: '/admin/products', icon: Package, badge: '14' },
      { name: 'Add Product', href: '/admin/products/new', icon: PlusCircle },
      { name: 'Categories', href: '/admin/categories', icon: FolderTree },
      { name: 'Inventory', href: '/admin/inventory', icon: Boxes, badge: 'Alerts' },
    ],
  },
  {
    title: 'SALES',
    items: [
      { name: 'Orders', href: '/admin/orders', icon: ShoppingBag, badge: '7' },
      { name: 'Customers', href: '/admin/customers', icon: Users },
      { name: 'Abandoned Carts', href: '/admin/abandoned-carts', icon: ShoppingCart },
      { name: 'Discounts & Coupons', href: '/admin/discounts', icon: TicketPercent },
      { name: 'Returns & Refunds', href: '/admin/returns', icon: RotateCcw, badge: '3' },
    ],
  },
  {
    title: 'STOREFRONT',
    items: [
      { name: 'Section Frames', href: '/admin/storefront/frames', icon: Layers, badge: '14' },
      { name: 'New Arrivals', href: '/admin/storefront/new-arrivals', icon: Flame },
      { name: 'Best Sellers', href: '/admin/storefront/best-sellers', icon: Crown },
      { name: 'Bridal Collection', href: '/admin/storefront/bridal', icon: HeartHandshake },
      { name: 'Six Moods', href: '/admin/storefront/six-moods', icon: Compass, badge: '6' },
    ],
  },
  {
    title: 'CONTENT',
    items: [
      { name: 'FAQs', href: '/admin/faqs', icon: HelpCircle },
      { name: 'Returns & Exchanges', href: '/admin/returns-exchanges', icon: RotateCcw },
      { name: 'Newsletter Subscribers', href: '/admin/newsletter', icon: Mail },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      { name: 'Payments', href: '/admin/payments', icon: CreditCard },
      { name: 'Reports & Analytics', href: '/admin/reports', icon: BarChart3 },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { name: 'Admin Users', href: '/admin/system/users', icon: UserCheck },
      { name: 'Roles & Permissions', href: '/admin/system/roles', icon: KeyRound },
      { name: 'Activity Logs', href: '/admin/system/logs', icon: History },
      { name: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

export function AdminSidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAdminAuth();

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#1A1816] text-[#E8E3D9] flex flex-col border-r border-[#2E2B26] transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-72'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-5 border-b border-[#2E2B26] bg-[#141211]">
          <Link
            href="/admin/dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex items-center space-x-3 overflow-hidden"
          >
            <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-[#B39458] to-[#6E562A] flex items-center justify-center shadow-md shrink-0">
              <Crown className="w-5 h-5 text-[#FAF7F0]" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-serif tracking-[0.25em] text-lg font-bold text-[#F7F5F0] leading-none">
                  MONARCH
                </span>
                <span className="text-[10px] tracking-[0.2em] uppercase text-[#B39458] mt-1 font-sans">
                  Sovereign Atelier Admin
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-7 h-7 rounded-sm items-center justify-center text-[#A8A49C] hover:text-[#FAF7F0] hover:bg-[#292622] transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-1">
              {!collapsed ? (
                <div className="px-3 pb-1.5 text-[11px] font-semibold tracking-[0.18em] text-[#8C877D] uppercase font-sans">
                  {section.title}
                </div>
              ) : (
                <div className="my-2 border-t border-[#2E2B26]/60" />
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center group relative rounded-sm px-3 py-2 text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-[#B39458]/15 text-[#E5C384] border-l-2 border-[#B39458]'
                        : 'text-[#C5BFB5] hover:text-[#FAF7F0] hover:bg-[#262320]'
                    } ${collapsed ? 'justify-center' : 'justify-between'}`}
                    title={collapsed ? item.name : undefined}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-[#B39458]' : 'text-[#8C877D] group-hover:text-[#E8E3D9]'
                        }`}
                      />
                      {!collapsed && <span className="truncate">{item.name}</span>}
                    </div>

                    {!collapsed && item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-sans font-semibold tracking-wide ${
                          isActive
                            ? 'bg-[#B39458] text-[#1A1816]'
                            : 'bg-[#292622] text-[#B39458] border border-[#B39458]/30'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* Tooltip for collapsed mode */}
                    {collapsed && (
                      <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#141211] text-[#FAF7F0] text-xs rounded border border-[#2E2B26] shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                        {item.name}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Live Storefront & Sovereign Sign Out Footer */}
        <div className="p-3 border-t border-[#2E2B26] bg-[#141211]/80 space-y-2">
          <a
            href="https://monarch-beta-two.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center px-3 py-2 rounded-sm bg-[#24211D] hover:bg-[#2E2A25] text-[#B39458] text-xs font-medium transition-colors border border-[#B39458]/20 ${
              collapsed ? 'justify-center' : 'justify-between'
            }`}
          >
            <div className="flex items-center space-x-2.5 truncate">
              <ExternalLink className="w-4 h-4 shrink-0 text-[#B39458]" />
              {!collapsed && <span className="truncate">Live Boutique</span>}
            </div>
            {!collapsed && (
              <span className="text-[10px] bg-[#B39458]/10 text-[#C9A96E] px-1.5 py-0.5 rounded">
                Store
              </span>
            )}
          </a>

          <button
            type="button"
            onClick={() => logout()}
            title={collapsed ? 'Sign Out' : undefined}
            className={`w-full flex items-center px-3 py-2 rounded-sm hover:bg-[#2D1619] text-[#A63A3A] hover:text-[#F87171] text-xs font-medium transition-colors border border-transparent hover:border-[#7D262D]/40 cursor-pointer ${
              collapsed ? 'justify-center' : 'space-x-2.5'
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
