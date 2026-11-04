'use client';

import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  Eye,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { formatINR } from '@/utils/formatters';
import { ReturnRequest } from '@/types';
import { returnService } from '@/services/returnService';
import { useToast } from '@/components/ui/Toast';

export default function ReturnsPage() {
  const { toast } = useToast();
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);

  useEffect(() => {
    returnService
      .fetchReturns()
      .then((res) => {
        setReturns(res || []);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filtered = returns.filter((r) => {
    const matchSearch =
      r.returnNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.product.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleUpdateStatus = (id: string, status: ReturnRequest['status']) => {
    const updated = returnService.updateReturnStatus(id, status);
    setReturns(returnService.getReturns());
    if (selectedReturn?.id === id) {
      setSelectedReturn(updated);
    }
    toast(`Return ${updated.returnNumber} updated to ${status}`, 'success');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E8E3D9] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[#B39458] font-bold">
              Alterations & Reversals
            </span>
            <span className="text-[10px] bg-[#F4EEDF] text-[#9B7940] px-2 py-0.5 rounded-full font-semibold">
              {returns.length} Requests Handled
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#24221E] mt-1">
            Returns, Exchanges &amp; Fitting Alterations
          </h1>
          <p className="text-xs md:text-sm text-[#77736C] mt-1">
            Manage bespoke alteration pickups, fall/pico servicing, and unworn heritage returns.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/admin/returns-exchanges"
            className="px-4 py-2 bg-[#B39458] hover:bg-[#9B7940] text-white rounded-sm text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Edit Returns Policy &amp; Terms</span>
          </a>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-sm border border-[#E8E3D9] shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#A8A49C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search return #, order #, or patron..."
            className="w-full pl-9 pr-4 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:bg-white focus:outline-none focus:border-[#B39458]"
          />
        </div>

        <div className="flex items-center flex-wrap gap-1.5">
          {['all', 'Requested', 'Approved', 'Pickup Scheduled', 'Received', 'Refunded'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${
                statusFilter === s
                  ? 'bg-[#B39458] text-white shadow-xs'
                  : 'bg-[#F7F5F0] text-[#77736C] hover:text-[#24221E]'
              }`}
            >
              {s === 'all' ? 'All Requests' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-sm border border-[#E8E3D9] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E8E3D9] bg-[#FAF9F5] text-[11px] font-semibold text-[#77736C] uppercase tracking-wider">
                <th className="py-3 px-4">Return ID</th>
                <th className="py-3 px-3">Order Ref</th>
                <th className="py-3 px-3">Patron</th>
                <th className="py-3 px-3">Ensemble</th>
                <th className="py-3 px-3">Reason</th>
                <th className="py-3 px-3">Request Date</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E3D9]/60 text-xs">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-[#FAF9F5] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#24221E]">
                    {r.returnNumber}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[#77736C]">{r.orderNumber}</td>
                  <td className="py-3.5 px-3 font-medium text-[#24221E]">{r.customerName}</td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-10 rounded-xs overflow-hidden shrink-0 border border-[#E8E3D9]">
                        <img src={r.product.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="font-semibold text-[#24221E] line-clamp-1">
                        {r.product.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-[#77736C] max-w-xs truncate">{r.reason}</td>
                  <td className="py-3.5 px-3 text-[#77736C]" suppressHydrationWarning>
                    {new Date(r.requestDate).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FAF7EE] text-[#9B7940] border border-[#B39458]/30">
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedReturn(r)}
                      className="px-3 py-1.5 bg-[#FAF7F0] hover:bg-[#F4EEDF] text-[#9B7940] border border-[#B39458]/30 font-semibold rounded-sm transition-colors text-xs"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return Detail Drawer */}
      {selectedReturn && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-end backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#E8E3D9] pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#B39458]">
                    Return Dossier
                  </span>
                  <h3 className="font-serif font-bold text-xl text-[#24221E]">
                    {selectedReturn.returnNumber}
                  </h3>
                  <span className="text-xs text-[#77736C]">Order Ref: {selectedReturn.orderNumber}</span>
                </div>
                <button onClick={() => setSelectedReturn(null)} className="text-[#77736C]">
                  ✕
                </button>
              </div>

              {/* Status Progression Bar */}
              <div className="p-3 bg-[#FAF9F5] border border-[#E8E3D9] rounded-sm space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#77736C] tracking-wider block">
                  Workflow Progression:
                </span>
                <div className="flex items-center flex-wrap gap-2 text-xs font-semibold">
                  <button
                    onClick={() => handleUpdateStatus(selectedReturn.id, 'Approved')}
                    className="px-2.5 py-1 bg-white border border-[#E8E3D9] text-[#3E7B54] rounded-sm hover:border-[#3E7B54]"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedReturn.id, 'Pickup Scheduled')}
                    className="px-2.5 py-1 bg-white border border-[#E8E3D9] text-[#3B66AC] rounded-sm hover:border-[#3B66AC]"
                  >
                    Schedule Pickup
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedReturn.id, 'Received')}
                    className="px-2.5 py-1 bg-white border border-[#E8E3D9] text-[#9B7940] rounded-sm hover:border-[#9B7940]"
                  >
                    Mark Received
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedReturn.id, 'Refunded')}
                    className="px-2.5 py-1 bg-white border border-[#E8E3D9] text-[#A63A3A] rounded-sm hover:border-[#A63A3A]"
                  >
                    Authorize Refund
                  </button>
                </div>
              </div>

              {/* Product Details */}
              <div className="p-4 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm flex items-center space-x-3 text-xs">
                <div className="w-14 h-16 rounded-xs overflow-hidden border border-[#E8E3D9] bg-white shrink-0">
                  <img
                    src={selectedReturn.product.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#24221E]">{selectedReturn.product.name}</h4>
                  <div className="text-[#77736C]">Variant: {selectedReturn.product.variant}</div>
                  <div className="text-[#77736C]">SKU: {selectedReturn.product.sku}</div>
                  <div className="font-bold text-[#B39458] mt-0.5">
                    {formatINR(selectedReturn.product.price)}
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-1 text-xs">
                <span className="font-semibold text-[#77736C] uppercase text-[10px]">
                  Patron Stated Reason:
                </span>
                <p className="p-3 bg-[#FAF9F5] border border-[#E8E3D9] rounded-sm text-[#24221E] leading-relaxed">
                  {selectedReturn.reason}
                </p>
              </div>

              {/* Timeline */}
              <div className="space-y-2 text-xs">
                <span className="font-semibold text-[#77736C] uppercase text-[10px]">
                  Inspection Timeline
                </span>
                <div className="space-y-2 border-l-2 border-[#B39458] pl-3">
                  {selectedReturn.timeline.map((evt, i) => (
                    <div key={i} className="text-xs">
                      <div className="font-semibold text-[#24221E]">{evt.status}</div>
                      <p className="text-[#77736C] text-[11px]">{evt.note}</p>
                      <span className="text-[10px] text-[#A8A49C]">{new Date(evt.date).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8E3D9] text-right">
              <button
                onClick={() => setSelectedReturn(null)}
                className="px-4 py-2 bg-[#F7F5F0] text-[#77736C] text-xs font-medium rounded-sm"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
