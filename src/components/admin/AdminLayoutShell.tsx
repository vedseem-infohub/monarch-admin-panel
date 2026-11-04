'use client';

import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { ToastProvider } from '@/components/ui/Toast';

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#F7F5F0] flex">
        {/* Fixed Collapsible Sidebar */}
        <AdminSidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        {/* Main Content Area */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
            collapsed ? 'lg:pl-20' : 'lg:pl-72'
          }`}
        >
          {/* Top Sticky Header */}
          <AdminHeader collapsed={collapsed} setMobileOpen={setMobileOpen} />

          {/* Page Content */}
          <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
            {children}
          </main>

          {/* Sovereign Admin Footer */}
          <footer className="border-t border-[#E8E3D9] bg-[#FFFFFF] py-4 px-6 text-center text-xs text-[#77736C] flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="font-serif font-bold text-[#24221E] tracking-wider">MONARCH</span>
              <span>· Sovereign Indian Haute Couture Administration</span>
            </div>
            <div className="flex items-center space-x-3 text-[11px]">
              <span className="text-[#3E7B54] flex items-center space-x-1">
                <span className="w-1.5 h-1.5 bg-[#3E7B54] rounded-full inline-block animate-pulse" />
                <span>Backend Synchronized</span>
              </span>
              <span>·</span>
              <span>API-Ready Architecture</span>
              <span>·</span>
              <span>v1.0.4 Sovereign Release</span>
            </div>
          </footer>
        </div>
      </div>
    </ToastProvider>
  );
}
