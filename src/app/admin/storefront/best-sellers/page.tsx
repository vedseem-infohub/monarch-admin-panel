'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Crown,
  MoveUp,
  MoveDown,
  Sparkles,
  TrendingUp,
  ShoppingBag,
  Eye,
  Plus,
  Trash2,
  Check,
  Layers,
} from 'lucide-react';
import { formatINR } from '@/utils/formatters';
import { Product } from '@/types';
import { productService } from '@/services/productService';
import { useToast } from '@/components/ui/Toast';

export default function BestSellersManagementPage() {
  const { toast } = useToast();
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    productService.fetchProducts().then((res) => {
      setAllProducts(res || []);
    });
  }, []);

  // Ranked Bestsellers
  const bestSellers = allProducts
    .filter((p) => p.isBestSeller)
    .sort((a, b) => (a.bestsellerRank || 99) - (b.bestsellerRank || 99));

  // Move Rank Up / Down
  const handleMoveRank = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= bestSellers.length) return;

    const reordered = [...bestSellers];
    const temp = reordered[index];
    reordered[index] = reordered[newIndex];
    reordered[newIndex] = temp;

    const orderedIds = reordered.map((p) => p.id);
    productService.reorderBestSellers(orderedIds);
    setAllProducts(productService.getProducts());
    toast(`Rank updated: "${temp.name}" is now #${newIndex + 1}`, 'success');
  };

  const handleRemoveBestseller = (product: Product) => {
    productService.updateProduct(product.id, { isBestSeller: false, bestsellerRank: undefined });
    setAllProducts(productService.getProducts());
    toast(`Removed "${product.name}" from Patron Bestsellers`, 'info');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E8E3D9] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[#B39458] font-bold">
              Section 9 Management
            </span>
            <span className="text-[10px] bg-[#F4EEDF] text-[#9B7940] px-2 py-0.5 rounded-full font-semibold">
              Ranked Sovereign Favorites
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#24221E] mt-1">
            Best Sellers & Patron Favorites
          </h1>
          <p className="text-xs md:text-sm text-[#77736C] mt-1">
            Manage numerical rankings (#01 to #08), verified ratings, sales counts, and velocity badges.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/storefront/frames?section=best-sellers"
            className="flex items-center space-x-2 bg-[#FAF7F0] border border-[#B39458]/40 hover:bg-[#B39458]/10 text-[#9B7940] hover:text-[#24221E] text-xs font-semibold px-3.5 py-2.5 rounded-sm transition-colors"
          >
            <Layers className="w-4 h-4" />
            <span>Manage Best Seller Frames</span>
          </Link>
        </div>
      </div>

      {/* Ranked Product List */}
      <div className="space-y-3.5">
        {bestSellers.map((prod, idx) => {
          const rankNum = idx + 1;
          const salesMock = 120 - idx * 12;

          return (
            <div
              key={prod.id}
              className="luxury-card p-4 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4 luxury-card-hover"
            >
              <div className="flex items-center space-x-4">
                {/* Crown Rank Badge */}
                <div
                  className={`w-12 h-12 rounded-sm flex flex-col items-center justify-center shrink-0 border ${
                    rankNum === 1
                      ? 'bg-gradient-to-br from-[#B39458] to-[#6E562A] text-white border-[#B39458]'
                      : rankNum <= 3
                      ? 'bg-[#FAF7EE] text-[#9B7940] border-[#B39458]/40'
                      : 'bg-[#F7F5F0] text-[#77736C] border-[#E8E3D9]'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span className="font-serif font-bold text-xs">
                    #{rankNum < 10 ? `0${rankNum}` : rankNum}
                  </span>
                </div>

                {/* Image */}
                <div className="w-16 h-20 rounded-xs overflow-hidden shrink-0 border border-[#E8E3D9] bg-[#F7F5F0]">
                  <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-serif font-bold text-base text-[#24221E]">{prod.name}</h3>
                    <span className="text-[10px] bg-[#EBF5EE] text-[#3E7B54] px-2 py-0.5 rounded-full font-semibold">
                      ★ {prod.rating} ({prod.reviewsCount} reviews)
                    </span>
                  </div>
                  <p className="text-xs text-[#77736C]">{prod.tagline}</p>
                  <div className="flex items-center space-x-3 text-xs pt-1">
                    <span className="font-bold text-[#24221E]">{formatINR(prod.price)}</span>
                    <span className="text-[#B39458] font-semibold">
                      · {salesMock} Orders Placed
                    </span>
                    <span className="text-[#3E7B54] font-medium">· Peak Velocity</span>
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                <div className="flex items-center border border-[#E8E3D9] rounded-sm bg-[#F7F5F0]">
                  <button
                    onClick={() => handleMoveRank(idx, 'up')}
                    disabled={idx === 0}
                    className="p-2 hover:bg-white text-[#77736C] hover:text-[#24221E] disabled:opacity-30 transition-colors"
                    title="Promote Rank"
                  >
                    <MoveUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveRank(idx, 'down')}
                    disabled={idx === bestSellers.length - 1}
                    className="p-2 hover:bg-white text-[#77736C] hover:text-[#24221E] disabled:opacity-30 transition-colors"
                    title="Demote Rank"
                  >
                    <MoveDown className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => handleRemoveBestseller(prod)}
                  className="p-2 text-[#77736C] hover:text-[#A63A3A] hover:bg-[#FFF1F0] rounded-sm transition-colors"
                  title="Remove from Bestsellers"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
