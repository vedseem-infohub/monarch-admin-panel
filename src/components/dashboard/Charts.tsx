'use client';

import React, { useState } from 'react';
import { formatINR } from '@/utils/formatters';

interface RevenueTrendPoint {
  date: string;
  revenue: number;
  orders: number;
  aov?: number;
}

interface CategoryPoint {
  category: string;
  revenue: number;
  percentage: number;
  ordersCount: number;
  color: string;
}

interface StatusPoint {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

// 1. Interactive Area / Line Revenue Chart
export function RevenueChart({ data }: { data: RevenueTrendPoint[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-48 flex flex-col items-center justify-center text-[#77736C] border border-dashed border-[#E8E3D9] rounded-sm p-8 text-center bg-[#FAF9F5]">
        <div className="w-10 h-10 rounded-full bg-[#F4EEDF] flex items-center justify-center text-[#B39458] mb-2 font-serif font-bold text-sm">
          ₹
        </div>
        <span className="text-sm font-serif font-semibold text-[#24221E] mb-1">
          Awaiting Revenue Trajectory
        </span>
        <span className="text-xs text-[#77736C]">
          Daily monetary progression will render as patrons place commissions through checkout.
        </span>
      </div>
    );
  }

  const maxRevenue = Math.max(1, ...data.map((d) => d.revenue || 0));
  const minRevenue = 0;
  const height = 240;
  const width = 640;
  const paddingX = 40;
  const paddingY = 30;
  const divisor = data.length > 1 ? data.length - 1 : 1;
  const range = maxRevenue > minRevenue ? maxRevenue - minRevenue : 1;

  const points = data.map((d, i) => {
    const x = paddingX + (i / divisor) * (width - 2 * paddingX);
    const revenueVal = d.revenue || 0;
    const y = height - paddingY - ((revenueVal - minRevenue) / range) * (height - 2 * paddingY);
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const firstPoint = points[0] || { x: paddingX, y: height - paddingY, data: { date: '-', revenue: 0, orders: 0, aov: 0 } };
  const lastPoint = points[points.length - 1] || firstPoint;

  const areaD = `${pathD} L ${lastPoint.x} ${height - paddingY} L ${firstPoint.x} ${height - paddingY} Z`;

  const activePoint = (hoverIndex !== null ? points[hoverIndex] : lastPoint) || firstPoint;
  const activeAov = activePoint.data.aov ?? (activePoint.data.orders > 0 ? Math.round(activePoint.data.revenue / activePoint.data.orders) : 0);

  return (
    <div className="w-full flex flex-col">
      {/* Chart Top Stats */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs text-[#77736C]">Highlighted Period ({activePoint.data.date})</span>
          <div className="text-xl font-serif font-bold text-[#24221E]">
            {formatINR(activePoint.data.revenue || 0)}
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-[#77736C]">Orders Volume</span>
          <div className="text-sm font-semibold text-[#B39458]">
            {activePoint.data.orders || 0} Ensembles (Avg {formatINR(activeAov)})
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="goldAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B39458" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#B39458" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#B39458" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="goldLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#9B7940" />
              <stop offset="50%" stopColor="#C7A15B" />
              <stop offset="100%" stopColor="#DFBE7F" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = height - paddingY - ratio * (height - 2 * paddingY);
            return (
              <line
                key={`grid-line-${ratio}`}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#E8E3D9"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill="url(#goldAreaGrad)" />

          {/* Smooth Line */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#goldLineGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Interactive Points */}
          {points.map((p, idx) => (
            <g
              key={`revenue-point-${p.data.date}-${idx}`}
              className="cursor-pointer"
              onMouseEnter={() => setHoverIndex(idx)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              {/* Invisible touch area */}
              <circle cx={p.x} cy={p.y} r="18" fill="transparent" />

              {/* Outer halo */}
              <circle
                cx={p.x}
                cy={p.y}
                r={hoverIndex === idx ? 7 : 4}
                fill="#FFFFFF"
                stroke="#B39458"
                strokeWidth={hoverIndex === idx ? 3 : 2}
                className="transition-all duration-150"
              />

              {/* Date label */}
              <text
                x={p.x}
                y={height - 8}
                textAnchor="middle"
                fontSize="11"
                fill={hoverIndex === idx ? '#24221E' : '#77736C'}
                fontWeight={hoverIndex === idx ? '600' : '400'}
              >
                {p.data.date}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

// 2. Category Share Donut / Segment Chart
export function CategoryDonutChart({ data }: { data: CategoryPoint[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-36 flex flex-col items-center justify-center text-[#77736C] border border-dashed border-[#E8E3D9] rounded-sm p-6 text-center bg-[#FAF9F5]">
        <span className="text-sm font-serif font-semibold text-[#24221E] mb-1">No Category Orders</span>
        <span className="text-xs">Category performance will populate as royal ensembles are ordered.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
      {/* Visual Segments Bar */}
      <div className="w-full sm:w-1/2 flex flex-col space-y-3">
        <div className="h-6 w-full flex rounded-full overflow-hidden shadow-inner bg-[#E8E3D9]">
          {data.map((cat, index) => (
            <div
              key={`cat-segment-${cat.category || 'unknown'}-${index}`}
              style={{
                width: `${cat.percentage}%`,
                backgroundColor: cat.color,
              }}
              onMouseEnter={() => setActiveCategory(cat.category)}
              onMouseLeave={() => setActiveCategory(null)}
              className="h-full cursor-pointer hover:opacity-85 transition-opacity relative group"
              title={`${cat.category}: ${cat.percentage}%`}
            />
          ))}
        </div>

        {/* Selected Category Highlight */}
        <div className="text-center sm:text-left py-2">
          {activeCategory ? (
            (() => {
              const item = data.find((c) => c.category === activeCategory);
              return item ? (
                <div>
                  <span className="text-xs text-[#77736C]">{item.category}</span>
                  <div className="text-lg font-serif font-bold text-[#24221E]">
                    {formatINR(item.revenue)}{' '}
                    <span className="text-xs font-sans text-[#B39458]">({item.percentage}%)</span>
                  </div>
                </div>
              ) : null;
            })()
          ) : (
            <div>
              <span className="text-xs text-[#77736C]">Leading Category</span>
              <div className="text-lg font-serif font-bold text-[#24221E]">
                {data[0]?.category}{' '}
                <span className="text-xs font-sans text-[#B39458]">({data[0]?.percentage}%)</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend Table */}
      <div className="w-full sm:w-1/2 space-y-2 text-xs">
        {data.map((cat, index) => (
          <div
            key={`cat-legend-${cat.category || 'unknown'}-${index}`}
            onMouseEnter={() => setActiveCategory(cat.category)}
            onMouseLeave={() => setActiveCategory(null)}
            className={`flex items-center justify-between p-1.5 rounded cursor-pointer transition-colors ${
              activeCategory === cat.category ? 'bg-[#F7F5F0]' : 'hover:bg-[#FAF9F5]'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
              <span className="text-[#24221E] font-medium">{cat.category}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-[#24221E]">{cat.percentage}%</span>
              <span className="text-[#77736C] font-mono text-[11px]">{formatINR(cat.revenue)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 3. Order Status Progress Rings / Bars
export function OrderStatusChart({ data }: { data: StatusPoint[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-36 flex flex-col items-center justify-center text-[#77736C] border border-dashed border-[#E8E3D9] rounded-sm p-6 text-center bg-[#FAF9F5]">
        <span className="text-sm font-serif font-semibold text-[#24221E] mb-1">No Orders Recorded</span>
        <span className="text-xs">Order status distribution will display here once purchases are initiated.</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={`order-status-${item.status || 'unknown'}-${index}`} className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[#24221E] flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{item.status}</span>
            </span>
            <span className="text-[#77736C]">
              <strong className="text-[#24221E]">{item.count} orders</strong> ({item.percentage}%)
            </span>
          </div>
          <div className="h-2 w-full bg-[#E8E3D9] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${item.percentage}%`,
                backgroundColor: item.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
