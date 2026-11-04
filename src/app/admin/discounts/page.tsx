'use client';

import React, { useState, useEffect } from 'react';
import {
  TicketPercent,
  Plus,
  Search,
  Edit,
  Trash2,
  Sparkles,
  Check,
  X,
  Coins,
  Calendar,
} from 'lucide-react';
import { formatINR } from '@/utils/formatters';
import { DiscountCoupon } from '@/types';
import { couponService } from '@/services/couponService';
import { useToast } from '@/components/ui/Toast';

export default function DiscountsPage() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<DiscountCoupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [editCoupon, setEditCoupon] = useState<Partial<DiscountCoupon> | null>(null);

  useEffect(() => {
    couponService
      .fetchCoupons()
      .then((res) => {
        setCoupons(res || []);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filtered = coupons.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleStatus = (id: string) => {
    const updated = couponService.toggleCouponStatus(id);
    setCoupons(couponService.getCoupons());
    toast(`Coupon ${updated.code} status changed to ${updated.status}`, 'info');
  };

  const handleDelete = (id: string, code: string) => {
    if (confirm(`Revoke coupon "${code}"?`)) {
      couponService.deleteCoupon(id);
      setCoupons(couponService.getCoupons());
      toast(`Coupon ${code} revoked`, 'success');
    }
  };

  const handleSaveModal = () => {
    if (!editCoupon?.code?.trim()) {
      toast('Please enter a coupon code', 'error');
      return;
    }

    if (editCoupon.id) {
      couponService.updateCoupon(editCoupon.id, editCoupon);
      toast(`Updated coupon ${editCoupon.code}`, 'success');
    } else {
      couponService.createCoupon({
        code: editCoupon.code,
        description: editCoupon.description || 'Exclusive privilege token',
        discountType: editCoupon.discountType || 'percentage',
        discountValue: Number(editCoupon.discountValue) || 10,
        minOrderValue: Number(editCoupon.minOrderValue) || 100000,
        maxDiscount: editCoupon.maxDiscount ? Number(editCoupon.maxDiscount) : undefined,
        usageLimit: Number(editCoupon.usageLimit) || 100,
        expiryDate: editCoupon.expiryDate || '2026-12-31',
        status: 'Active',
      });
      toast(`Created coupon ${editCoupon.code}`, 'success');
    }

    setCoupons(couponService.getCoupons());
    setEditCoupon(null);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E8E3D9] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[#B39458] font-bold">
              Privileges & Promotions
            </span>
            <span className="text-[10px] bg-[#F4EEDF] text-[#9B7940] px-2 py-0.5 rounded-full font-semibold">
              {coupons.length} Active Codes
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#24221E] mt-1">
            Royal Privileges & Coupons
          </h1>
          <p className="text-xs md:text-sm text-[#77736C] mt-1">
            Manage bespoke bridal courtesy codes, seasonal percentages, and exclusive online privilege limits.
          </p>
        </div>

        <button
          onClick={() =>
            setEditCoupon({
              code: '',
              description: '',
              discountType: 'percentage',
              discountValue: 10,
              minOrderValue: 100000,
              usageLimit: 100,
              expiryDate: '2026-12-31',
              status: 'Active',
            })
          }
          className="flex items-center space-x-2 bg-[#B39458] hover:bg-[#9B7940] text-white text-xs font-semibold px-4 py-2.5 rounded-sm transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create Royal Coupon</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-sm border border-[#E8E3D9] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E8E3D9] bg-[#FAF9F5] text-[11px] font-semibold text-[#77736C] uppercase tracking-wider">
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3">Privilege Value</th>
                <th className="py-3 px-3">Min. Order</th>
                <th className="py-3 px-3">Usage Ratio</th>
                <th className="py-3 px-3">Expiry Date</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E3D9]/60 text-xs">
              {filtered.map((coup) => (
                <tr key={coup.id} className="hover:bg-[#FAF9F5] transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-sm text-[#24221E] bg-[#FAF7EE] text-[#9B7940] px-2.5 py-1 rounded border border-[#B39458]/30 inline-block">
                      {coup.code}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 max-w-xs">
                    <p className="text-[#24221E] font-medium line-clamp-1">{coup.description}</p>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-[#24221E]">
                    {coup.discountType === 'percentage'
                      ? `${coup.discountValue}% Courtesy`
                      : `Flat ${formatINR(coup.discountValue)}`}
                  </td>
                  <td className="py-3.5 px-3 text-[#77736C]">
                    {formatINR(coup.minOrderValue)}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-[#24221E] font-semibold">
                      {coup.usageCount} / {coup.usageLimit}
                    </span>
                    <span className="text-[10px] text-[#77736C] block">
                      {Math.round((coup.usageCount / coup.usageLimit) * 100)}% redeemed
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-[#77736C]">{coup.expiryDate}</td>
                  <td className="py-3.5 px-3">
                    <button
                      onClick={() => handleToggleStatus(coup.id)}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors ${
                        coup.status === 'Active'
                          ? 'bg-[#EBF5EE] text-[#3E7B54]'
                          : 'bg-[#FFF1F0] text-[#A63A3A]'
                      }`}
                    >
                      {coup.status}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => setEditCoupon(coup)}
                        className="p-1.5 rounded hover:bg-[#F7F5F0] text-[#77736C] hover:text-[#B39458]"
                        title="Edit Coupon"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(coup.id, coup.code)}
                        className="p-1.5 rounded hover:bg-[#FFF1F0] text-[#77736C] hover:text-[#A63A3A]"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create or Edit Coupon */}
      {editCoupon && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white max-w-lg w-full rounded-sm p-6 space-y-4 shadow-2xl border border-[#E8E3D9]">
            <div className="flex items-center justify-between border-b border-[#E8E3D9] pb-3">
              <h3 className="font-serif font-bold text-lg text-[#24221E]">
                {editCoupon.id ? `Edit Privilege: ${editCoupon.code}` : 'Generate Royal Privilege Code'}
              </h3>
              <button onClick={() => setEditCoupon(null)} className="p-1 text-[#77736C]">
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#24221E]">Privilege Code (Uppercase)</label>
                <input
                  type="text"
                  value={editCoupon.code || ''}
                  onChange={(e) => setEditCoupon({ ...editCoupon, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. ROYAL15"
                  className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs font-mono font-bold text-[#24221E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#24221E]">Privilege Type</label>
                  <select
                    value={editCoupon.discountType || 'percentage'}
                    onChange={(e) => setEditCoupon({ ...editCoupon, discountType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
                  >
                    <option value="percentage">Percentage Off (%)</option>
                    <option value="fixed">Fixed Reduction (INR ₹)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#24221E]">Privilege Value</label>
                  <input
                    type="number"
                    value={editCoupon.discountValue || 0}
                    onChange={(e) => setEditCoupon({ ...editCoupon, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#24221E]">Minimum Order Value (INR ₹)</label>
                  <input
                    type="number"
                    value={editCoupon.minOrderValue || 0}
                    onChange={(e) => setEditCoupon({ ...editCoupon, minOrderValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#24221E]">Max Redemption Limit</label>
                  <input
                    type="number"
                    value={editCoupon.usageLimit || 100}
                    onChange={(e) => setEditCoupon({ ...editCoupon, usageLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#24221E]">Expiry Date</label>
                <input
                  type="date"
                  value={editCoupon.expiryDate || '2026-12-31'}
                  onChange={(e) => setEditCoupon({ ...editCoupon, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#24221E]">Internal Notes / Campaign Purpose</label>
                <textarea
                  rows={2}
                  value={editCoupon.description || ''}
                  onChange={(e) => setEditCoupon({ ...editCoupon, description: e.target.value })}
                  className="w-full p-2.5 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#E8E3D9] text-xs font-semibold">
              <button
                onClick={() => setEditCoupon(null)}
                className="px-4 py-2 bg-[#F7F5F0] text-[#77736C] rounded-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModal}
                className="px-4 py-2 bg-[#B39458] hover:bg-[#9B7940] text-white rounded-sm shadow-xs transition-colors"
              >
                Confirm Privilege
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
