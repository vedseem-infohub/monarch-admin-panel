'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Flame,
  Plus,
  Trash2,
  MoveLeft,
  MoveRight,
  Eye,
  Check,
  Sparkles,
  Sliders,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { formatINR } from '@/utils/formatters';
import { Product } from '@/types';
import { productService } from '@/services/productService';
import { useToast } from '@/components/ui/Toast';

export default function NewArrivalsManagementPage() {
  const { toast } = useToast();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [sectionHeading, setSectionHeading] = useState('Autumn-Winter 2026 Collection');
  const [sectionEyebrow, setSectionEyebrow] = useState('Top Arrivals · Royal Weaves');
  const [displayLimit, setDisplayLimit] = useState(8);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    productService.fetchProducts().then((res) => {
      setAllProducts(res || []);
    });
  }, []);

  const newArrivals = allProducts.filter((p) => p.isNewArrival);

  const handleToggleNewArrival = (product: Product) => {
    const updated = productService.updateProduct(product.id, {
      isNewArrival: !product.isNewArrival,
    });
    setAllProducts(productService.getProducts());
    toast(
      updated.isNewArrival
        ? `Added "${product.name}" to New Arrivals`
        : `Removed "${product.name}" from New Arrivals`
    );
  };

  const handleSaveSettings = () => {
    toast('New Arrivals section configuration updated successfully', 'success');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E8E3D9] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[#B39458] font-bold">
              Section 8 Management
            </span>
            <span className="text-[10px] bg-[#F4EEDF] text-[#9B7940] px-2 py-0.5 rounded-full font-semibold">
              {newArrivals.length} Active Drops
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#24221E] mt-1">
            New Arrivals Curation
          </h1>
          <p className="text-xs md:text-sm text-[#77736C] mt-1">
            Manage newly dropped garments with live badges, section headings, and display limits.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/storefront/frames?section=new-arrivals"
            className="flex items-center space-x-2 bg-[#FAF7F0] border border-[#B39458]/40 hover:bg-[#B39458]/10 text-[#9B7940] hover:text-[#24221E] text-xs font-semibold px-3.5 py-2.5 rounded-sm transition-colors"
          >
            <Layers className="w-4 h-4" />
            <span>Manage Frames</span>
          </Link>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-[#B39458] hover:bg-[#9B7940] text-white text-xs font-semibold px-4 py-2.5 rounded-sm transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Products to Drop</span>
          </button>
        </div>
      </div>

      {/* Controls: Heading & Display Limit */}
      <div className="luxury-card p-5 rounded-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#24221E]">Section Eyebrow</label>
          <input
            type="text"
            value={sectionEyebrow}
            onChange={(e) => setSectionEyebrow(e.target.value)}
            className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#24221E]">Section Main Heading</label>
          <input
            type="text"
            value={sectionHeading}
            onChange={(e) => setSectionHeading(e.target.value)}
            className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#24221E]">Storefront Display Limit</label>
          <div className="flex items-center space-x-3">
            <select
              value={displayLimit}
              onChange={(e) => setDisplayLimit(Number(e.target.value))}
              className="px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] flex-1"
            >
              <option value={4}>4 Ensembles (1 Row)</option>
              <option value={8}>8 Ensembles (2 Rows)</option>
              <option value={12}>12 Ensembles (3 Rows)</option>
            </select>
            <button
              onClick={handleSaveSettings}
              className="px-3 py-2 bg-[#24221E] text-white text-xs font-semibold rounded-sm hover:bg-[#B39458] transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Visual Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {newArrivals.slice(0, displayLimit).map((product, idx) => (
          <div
            key={product.id}
            className="luxury-card rounded-sm overflow-hidden flex flex-col justify-between group luxury-card-hover"
          >
            <div>
              <div className="relative aspect-3/4 overflow-hidden bg-[#F7F5F0]">
                <img
                  src={product.images[0] || '/images/moods/banarasi_brocade.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#B39458] text-white shadow-xs">
                    NEW ARRIVAL
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-white">
                    #{idx + 1}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#B39458]">
                  {product.categoryName}
                </span>
                <h4 className="font-serif font-bold text-sm text-[#24221E] line-clamp-1">
                  {product.name}
                </h4>
                <p className="text-xs text-[#77736C] line-clamp-1">{product.fabric}</p>
                <div className="text-sm font-bold text-[#24221E] pt-1">
                  {formatINR(product.price)}
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-[#E8E3D9] flex items-center justify-between text-xs">
              <span className="text-[10px] text-[#3E7B54] font-semibold">Active in Section 8</span>
              <button
                onClick={() => handleToggleNewArrival(product)}
                className="text-xs text-[#A63A3A] hover:underline font-semibold"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Products Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white max-w-xl w-full rounded-sm p-6 space-y-4 shadow-2xl border border-[#E8E3D9]">
            <div className="flex items-center justify-between border-b border-[#E8E3D9] pb-3">
              <h3 className="font-serif font-bold text-lg text-[#24221E]">
                Select Products for New Arrivals
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded text-[#77736C] hover:text-[#24221E]"
              >
                ✕
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2">
              {allProducts.map((p) => {
                const isCurrent = p.isNewArrival;
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2.5 rounded-sm bg-[#FAF9F5] border border-[#E8E3D9] text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xs overflow-hidden shrink-0 border border-[#E8E3D9]">
                        <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-semibold text-[#24221E]">{p.name}</div>
                        <div className="text-[10px] text-[#77736C]">
                          {p.sku} · {formatINR(p.price)}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleNewArrival(p)}
                      className={`px-3 py-1 rounded-sm font-semibold text-xs ${
                        isCurrent
                          ? 'bg-[#EBF5EE] text-[#3E7B54] border border-[#3E7B54]/40'
                          : 'bg-[#B39458] text-white'
                      }`}
                    >
                      {isCurrent ? 'Added ✓' : '+ Add'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-[#24221E] text-white text-xs font-semibold rounded-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
