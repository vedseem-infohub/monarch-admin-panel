'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HeartHandshake, Plus, Eye, Sparkles, ExternalLink, Layers } from 'lucide-react';
import { formatINR } from '@/utils/formatters';
import { Product } from '@/types';
import { productService } from '@/services/productService';
import { useToast } from '@/components/ui/Toast';

export default function BridalCollectionPage() {
  const { toast } = useToast();
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    productService.fetchProducts().then((res) => {
      setAllProducts(res || []);
    });
  }, []);

  const bridalProducts = allProducts.filter((p) => p.isBridal);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E8E3D9] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[#B39458] font-bold">
              Section 5 & 10 Management
            </span>
            <span className="text-[10px] bg-[#F4EEDF] text-[#9B7940] px-2 py-0.5 rounded-full font-semibold">
              The Royal Wedding Trousseau
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#24221E] mt-1">
            Bridal Collection & Pheras Ensembles
          </h1>
          <p className="text-xs md:text-sm text-[#77736C] mt-1">
            Manage heirloom bridal lehengas, royal pheras dupattas, and bridal trousseau curations.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/storefront/frames?section=bridal"
            className="flex items-center space-x-2 bg-[#FAF7F0] border border-[#B39458]/40 hover:bg-[#B39458]/10 text-[#9B7940] hover:text-[#24221E] text-xs font-semibold px-3.5 py-2.5 rounded-sm transition-colors"
          >
            <Layers className="w-4 h-4" />
            <span>Manage Bridal Frames</span>
          </Link>

          <Link
            href="/admin/products/new"
            className="flex items-center space-x-2 bg-[#B39458] hover:bg-[#9B7940] text-white text-xs font-semibold px-4 py-2.5 rounded-sm transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Bridal Piece</span>
          </Link>
        </div>
      </div>

      {/* Bridal Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" suppressHydrationWarning>
        {bridalProducts.map((item) => (
          <div key={item.id} className="luxury-card rounded-sm overflow-hidden flex flex-col group luxury-card-hover">
            <div className="relative aspect-3/4 overflow-hidden bg-[#F7F5F0]">
              <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
              <div className="absolute top-2.5 left-2.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#5A1725] text-white">
                  BRIDAL EDIT
                </span>
              </div>
            </div>

            <div className="p-4 space-y-2">
              <span className="text-[10px] font-mono text-[#77736C]">SKU: {item.sku}</span>
              <h3 className="font-serif font-bold text-base text-[#24221E] line-clamp-1">{item.name}</h3>
              <p className="text-xs text-[#77736C] line-clamp-2">{item.description}</p>
              <div className="pt-2 border-t border-[#E8E3D9] flex items-center justify-between">
                <span className="font-serif font-bold text-base text-[#24221E]">{formatINR(item.price)}</span>
                <span className="text-xs font-semibold text-[#B39458]">Custom Bespoke</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
