'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  Coins,
  ShoppingBag,
  RotateCcw,
  Truck,
  Package,
} from 'lucide-react';
import { formatINR } from '@/utils/formatters';
import { RevenueChart, CategoryDonutChart, OrderStatusChart } from '@/components/dashboard/Charts';
import { analyticsService } from '@/services/analyticsService';
import { useToast } from '@/components/ui/Toast';

export default function ReportsAndAnalyticsPage() {
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = useState<
    'revenue' | 'products' | 'categories' | 'regional' | 'returns'
  >('revenue');

  const revenueTrends = analyticsService.getRevenueTrends();
  const categories = analyticsService.getCategoryPerformance();
  const regional = analyticsService.getRegionalSales();
  const orderStatus = analyticsService.getOrderStatusDistribution();

  const handleExportReportCSV = () => {
    toast(`Exported ${selectedReport.toUpperCase()} report to CSV`, 'success');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E8E3D9] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[#B39458] font-bold">
              Business Intelligence
            </span>
            <span className="text-[10px] bg-[#F4EEDF] text-[#9B7940] px-2 py-0.5 rounded-full font-semibold">
              Financial & Atelier Audit
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#24221E] mt-1">
            Reports & Deep Analytics
          </h1>
          <p className="text-xs md:text-sm text-[#77736C] mt-1">
            Examine luxury margins, seasonal silk velocity, regional sovereign demand, and white-glove return rates.
          </p>
        </div>

        <button
          onClick={handleExportReportCSV}
          className="flex items-center space-x-2 bg-[#B39458] hover:bg-[#9B7940] text-white text-xs font-semibold px-4 py-2.5 rounded-sm transition-colors shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Export Analytics Ledger</span>
        </button>
      </div>

      {/* Report Tabs */}
      <div className="flex items-center space-x-1 border-b border-[#E8E3D9] pb-2 overflow-x-auto">
        {[
          { id: 'revenue', label: 'Revenue & Gross Margins' },
          { id: 'categories', label: 'Category & Fabric Shares' },
          { id: 'regional', label: 'Regional Demand (Tier 1 & Palaces)' },
          { id: 'returns', label: 'Returns & Alterations Audit' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedReport(tab.id as any)}
            className={`px-3.5 py-2 text-xs font-medium rounded-sm whitespace-nowrap transition-colors ${
              selectedReport === tab.id
                ? 'bg-[#24221E] text-white shadow-xs'
                : 'text-[#77736C] hover:text-[#24221E] hover:bg-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Report Body */}
      {selectedReport === 'revenue' && (
        <div className="space-y-6">
          <div className="luxury-card p-6 rounded-sm space-y-4">
            <h2 className="font-serif font-bold text-lg text-[#24221E]">
              Revenue Growth & Inflow Velocity
            </h2>
            <RevenueChart data={revenueTrends} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="luxury-card p-4 rounded-sm border-l-4 border-l-[#B39458]">
              <span className="text-xs text-[#77736C] uppercase font-semibold">Gross Profit Margin</span>
              <div className="text-2xl font-serif font-bold text-[#24221E] mt-1">54.2%</div>
              <p className="text-[11px] text-[#3E7B54] mt-1">Reflects authentic handloom atelier markup</p>
            </div>
            <div className="luxury-card p-4 rounded-sm border-l-4 border-l-[#5A1725]">
              <span className="text-xs text-[#77736C] uppercase font-semibold">Trousseau Repeat Rate</span>
              <div className="text-2xl font-serif font-bold text-[#24221E] mt-1">32.8%</div>
              <p className="text-[11px] text-[#3E7B54] mt-1">High patron retention</p>
            </div>
            <div className="luxury-card p-4 rounded-sm border-l-4 border-l-[#24221E]">
              <span className="text-xs text-[#77736C] uppercase font-semibold">Air Freight Cost Absorption</span>
              <div className="text-2xl font-serif font-bold text-[#24221E] mt-1">1.8%</div>
              <p className="text-[11px] text-[#77736C] mt-1">Within luxury white-glove allowance</p>
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'categories' && (
        <div className="luxury-card p-6 rounded-sm space-y-4">
          <h2 className="font-serif font-bold text-lg text-[#24221E]">
            Category & Weave Tradition Breakdown
          </h2>
          <CategoryDonutChart data={categories} />
        </div>
      )}

      {selectedReport === 'regional' && (
        <div className="luxury-card p-6 rounded-sm space-y-4">
          <h2 className="font-serif font-bold text-lg text-[#24221E] border-b border-[#E8E3D9] pb-3">
            Regional Sovereign Demand by Metros & Palaces
          </h2>
          <div className="divide-y divide-[#E8E3D9] text-xs">
            {regional.map((r) => (
              <div key={r.city} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-sm text-[#24221E] block">{r.city}</span>
                  <span className="text-[10px] text-[#77736C]">{r.region}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-sm text-[#24221E] block">{formatINR(r.revenue)}</span>
                  <span className="text-[10px] text-[#B39458] font-semibold">{r.share}% National Share</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedReport === 'returns' && (
        <div className="luxury-card p-6 rounded-sm space-y-4">
          <h2 className="font-serif font-bold text-lg text-[#24221E]">
            Returns & Alterations Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-[#FAF9F5] border border-[#E8E3D9] rounded-sm">
              <span className="text-[#77736C] block">Return Rate:</span>
              <strong className="text-lg font-bold text-[#3E7B54]">1.2%</strong>
              <span className="text-[10px] text-[#77736C] block mt-0.5">Industry avg is ~18%</span>
            </div>
            <div className="p-4 bg-[#FAF9F5] border border-[#E8E3D9] rounded-sm">
              <span className="text-[#77736C] block">Complimentary Alteration Rate:</span>
              <strong className="text-lg font-bold text-[#9B7940]">8.4%</strong>
              <span className="text-[10px] text-[#77736C] block mt-0.5">Handled at Master Atelier Studio</span>
            </div>
            <div className="p-4 bg-[#FAF9F5] border border-[#E8E3D9] rounded-sm">
              <span className="text-[#77736C] block">RTO / NDR Incident Rate:</span>
              <strong className="text-lg font-bold text-[#3E7B54]">0.0%</strong>
              <span className="text-[10px] text-[#77736C] block mt-0.5">Pre-verified address concierges</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
