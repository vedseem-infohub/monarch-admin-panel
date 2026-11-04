'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Boxes,
  Search,
  Filter,
  AlertTriangle,
  History,
  Plus,
  Minus,
  CheckCircle2,
  XCircle,
  Coins,
  Warehouse,
  ArrowRight,
  X,
  Edit3,
} from 'lucide-react';
import { formatINR } from '@/utils/formatters';
import { InventoryItem, StockAdjustment } from '@/types';
import { inventoryService } from '@/services/inventoryService';
import { productService } from '@/services/productService';
import { useToast } from '@/components/ui/Toast';

export default function InventoryPage() {
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);

  useEffect(() => {
    productService.fetchProducts().then(() => {
      setInventory(inventoryService.getInventory());
      setAdjustments(inventoryService.getAdjustments());
    });
  }, []);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAdjustmentItem, setSelectedAdjustmentItem] = useState<InventoryItem | null>(null);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  // Adjustment Modal Form State
  const [adjustmentDelta, setAdjustmentDelta] = useState<number>(1);
  const [adjustmentType, setAdjustmentType] = useState<StockAdjustment['type']>('Addition');
  const [adjustmentReason, setAdjustmentReason] = useState<string>('Restock batch received from weaving guild');

  // Summary Metrics
  const totalItems = inventory.length;
  const inStockCount = inventory.filter((i) => i.status === 'In Stock').length;
  const lowStockCount = inventory.filter((i) => i.status === 'Low Stock').length;
  const outOfStockCount = inventory.filter((i) => i.status === 'Out of Stock').length;
  const totalValue = inventory.reduce((sum, item) => sum + item.inventoryValue, 0);

  // Filtered Table Items
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.sku.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [inventory, search, statusFilter]);

  // Execute Adjustment
  const handleConfirmAdjustment = () => {
    if (!selectedAdjustmentItem) return;
    const finalDelta =
      adjustmentType === 'Deduction' || adjustmentType === 'Damaged/Write-off'
        ? -Math.abs(adjustmentDelta)
        : Math.abs(adjustmentDelta);

    const result = inventoryService.adjustStock(
      selectedAdjustmentItem.id,
      finalDelta,
      adjustmentType,
      adjustmentReason,
      'Vikramaditya Rao (Inventory Director)'
    );

    setInventory(inventoryService.getInventory());
    setAdjustments(inventoryService.getAdjustments());
    toast(
      `Adjusted stock for ${selectedAdjustmentItem.name} (${finalDelta > 0 ? '+' : ''}${finalDelta} units)`,
      'success'
    );
    setSelectedAdjustmentItem(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E8E3D9] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[#B39458] font-bold">
              Operations & Vault
            </span>
            <span className="text-[10px] bg-[#F4EEDF] text-[#9B7940] px-2 py-0.5 rounded-full font-semibold">
              Live Vault Telemetry
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#24221E] mt-1">
            Inventory & Handloom Vaults
          </h1>
          <p className="text-xs md:text-sm text-[#77736C] mt-1">
            Track certified silk yards, reserved bridal trousseaus, and warehouse locations.
          </p>
        </div>

        <button
          onClick={() => setShowHistoryDrawer(true)}
          className="flex items-center space-x-2 bg-white hover:bg-[#F7F5F0] text-[#24221E] text-xs font-semibold px-4 py-2.5 rounded-sm border border-[#E8E3D9] transition-colors shadow-xs"
        >
          <History className="w-4 h-4 text-[#B39458]" />
          <span>Audit History ({adjustments.length})</span>
        </button>
      </div>

      {/* 5 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="luxury-card p-4 rounded-sm border-l-4 border-l-[#24221E]">
          <span className="text-[11px] text-[#77736C] font-semibold uppercase">Total Heirlooms</span>
          <div className="text-xl font-serif font-bold text-[#24221E] mt-1">{totalItems} Styles</div>
          <span className="text-[10px] text-[#77736C]">In sovereign registry</span>
        </div>

        <div className="luxury-card p-4 rounded-sm border-l-4 border-l-[#3E7B54]">
          <span className="text-[11px] text-[#77736C] font-semibold uppercase">In Stock</span>
          <div className="text-xl font-serif font-bold text-[#3E7B54] mt-1">{inStockCount} Styles</div>
          <span className="text-[10px] text-[#3E7B54]">Available for dispatch</span>
        </div>

        <div className="luxury-card p-4 rounded-sm border-l-4 border-l-[#C98A2C]">
          <span className="text-[11px] text-[#77736C] font-semibold uppercase">Low Stock</span>
          <div className="text-xl font-serif font-bold text-[#C98A2C] mt-1">{lowStockCount} Styles</div>
          <span className="text-[10px] text-[#C98A2C]">≤ 3 pieces in vault</span>
        </div>

        <div className="luxury-card p-4 rounded-sm border-l-4 border-l-[#A63A3A]">
          <span className="text-[11px] text-[#77736C] font-semibold uppercase">Out of Stock</span>
          <div className="text-xl font-serif font-bold text-[#A63A3A] mt-1">{outOfStockCount} Styles</div>
          <span className="text-[10px] text-[#A63A3A]">Weaving in progress</span>
        </div>

        <div className="luxury-card p-4 rounded-sm border-l-4 border-l-[#B39458]">
          <span className="text-[11px] text-[#77736C] font-semibold uppercase">Total Vault Value</span>
          <div className="text-xl font-serif font-bold text-[#9B7940] mt-1">{formatINR(totalValue)}</div>
          <span className="text-[10px] text-[#77736C]">Insured valuation</span>
        </div>
      </div>

      {/* Search & Stock Status Filters */}
      <div className="bg-white p-4 rounded-sm border border-[#E8E3D9] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-[#A8A49C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ensemble name, SKU, or category..."
            className="w-full pl-9 pr-4 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:bg-white focus:outline-none focus:border-[#B39458]"
          />
        </div>

        <div className="flex items-center space-x-2">
          {['all', 'In Stock', 'Low Stock', 'Out of Stock'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${
                statusFilter === status
                  ? 'bg-[#B39458] text-white shadow-xs'
                  : 'bg-[#F7F5F0] text-[#77736C] hover:text-[#24221E]'
              }`}
            >
              {status === 'all' ? 'All Inventory' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-sm border border-[#E8E3D9] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E8E3D9] bg-[#FAF9F5] text-[11px] font-semibold text-[#77736C] uppercase tracking-wider">
                <th className="py-3 px-4">Creation</th>
                <th className="py-3 px-3">SKU</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Available</th>
                <th className="py-3 px-3">Reserved</th>
                <th className="py-3 px-3">Incoming</th>
                <th className="py-3 px-3">Vault Location</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Quick Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E3D9]/60 text-xs">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-[#FAF9F5] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-12 rounded-xs overflow-hidden shrink-0 border border-[#E8E3D9] bg-[#F7F5F0]">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="font-semibold text-sm text-[#24221E] block line-clamp-1">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-[#77736C] font-mono">{formatINR(item.price)} each</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono font-medium text-[11px] text-[#77736C]">
                    {item.sku}
                  </td>
                  <td className="py-3 px-3 text-[#24221E] font-medium">{item.category}</td>
                  <td className="py-3 px-3">
                    <span className="text-sm font-bold text-[#24221E]">{item.available}</span>
                    <span className="text-[10px] text-[#77736C] block">in vault</span>
                  </td>
                  <td className="py-3 px-3 text-[#77736C]">
                    <span className="font-semibold text-[#24221E]">{item.reserved}</span>
                    <span className="text-[10px] block">order holds</span>
                  </td>
                  <td className="py-3 px-3 text-[#3E7B54]">
                    <span className="font-semibold">+{item.incoming}</span>
                    <span className="text-[10px] block text-[#77736C]">on loom</span>
                  </td>
                  <td className="py-3 px-3 text-[#77736C] text-[11px]">{item.location}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        item.status === 'In Stock'
                          ? 'bg-[#EBF5EE] text-[#3E7B54]'
                          : item.status === 'Low Stock'
                          ? 'bg-[#FFF8E6] text-[#C98A2C]'
                          : 'bg-[#FFF1F0] text-[#A63A3A]'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedAdjustmentItem(item)}
                      className="px-3 py-1.5 rounded-sm bg-[#FAF7F0] hover:bg-[#F4EEDF] text-[#9B7940] border border-[#B39458]/30 font-semibold text-xs transition-colors inline-flex items-center space-x-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Adjust</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {selectedAdjustmentItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white max-w-lg w-full rounded-sm p-6 space-y-5 shadow-2xl border border-[#E8E3D9]">
            <div className="flex items-center justify-between border-b border-[#E8E3D9] pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#B39458]">
                  Vault Calibration
                </span>
                <h3 className="font-serif font-bold text-lg text-[#24221E]">
                  Adjust Stock: {selectedAdjustmentItem.name}
                </h3>
                <span className="text-xs font-mono text-[#77736C]">
                  Current Stock: {selectedAdjustmentItem.available} units (SKU: {selectedAdjustmentItem.sku})
                </span>
              </div>
              <button
                onClick={() => setSelectedAdjustmentItem(null)}
                className="p-1 rounded text-[#77736C] hover:text-[#24221E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#24221E]">Adjustment Reason Type</label>
                <select
                  value={adjustmentType}
                  onChange={(e) => setAdjustmentType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
                >
                  <option value="Addition">Addition (Guild batch arrival / restock)</option>
                  <option value="Deduction">Deduction (Order fulfillment / Boutique gallery transfer)</option>
                  <option value="Audit Correction">Audit Correction (Physical cycle count update)</option>
                  <option value="Return Restock">Return Restock (Inspected unworn return)</option>
                  <option value="Damaged/Write-off">Damaged / Write-off</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#24221E]">Units Quantity Delta</label>
                <input
                  type="number"
                  min="1"
                  value={adjustmentDelta}
                  onChange={(e) => setAdjustmentDelta(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-sm font-semibold text-[#24221E]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#24221E]">Internal Audit Justification</label>
                <textarea
                  rows={3}
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="Note the provenance or fulfillment destination..."
                  className="w-full p-2.5 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-[#E8E3D9] text-xs font-semibold">
              <button
                onClick={() => setSelectedAdjustmentItem(null)}
                className="px-4 py-2 bg-[#F7F5F0] text-[#77736C] hover:text-[#24221E] rounded-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAdjustment}
                className="px-4 py-2 bg-[#B39458] hover:bg-[#9B7940] text-white rounded-sm shadow-xs transition-colors"
              >
                Record Calibration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Drawer */}
      {showHistoryDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-end backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E3D9] pb-3">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-[#B39458]" />
                <h3 className="font-serif font-bold text-base text-[#24221E]">
                  Vault Audit Ledger
                </h3>
              </div>
              <button
                onClick={() => setShowHistoryDrawer(false)}
                className="p-1 rounded text-[#77736C] hover:text-[#24221E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {adjustments.map((adj) => (
                <div
                  key={adj.id}
                  className="p-3 bg-[#FAF9F5] border border-[#E8E3D9] rounded-sm space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-[#24221E]">{adj.productName}</span>
                    <span
                      className={`font-mono text-xs ${
                        adj.quantity > 0 ? 'text-[#3E7B54]' : 'text-[#A63A3A]'
                      }`}
                    >
                      {adj.quantity > 0 ? `+${adj.quantity}` : adj.quantity}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#77736C]">SKU: {adj.sku} · {adj.type}</div>
                  <p className="text-[11px] text-[#24221E]">{adj.reason}</p>
                  <div className="flex items-center justify-between text-[10px] text-[#A8A49C] pt-1 border-t border-[#E8E3D9]/60">
                    <span>{adj.adjustedBy.split(' ')[0]}</span>
                    <span suppressHydrationWarning>{new Date(adj.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
