'use client';

import React from 'react';
import { KeyRound, Shield, Check } from 'lucide-react';

export default function RolesAndPermissionsPage() {
  const roles = [
    {
      name: 'Super Admin',
      description: 'Unrestricted sovereign authority over catalog, finance, personnel, and systems.',
      usersCount: 1,
      permissions: ['All System Modules', 'Financial Ledger', 'Product Pricing', 'User Management', 'Storefront Overwrite'],
    },
    {
      name: 'Catalog Director',
      description: 'Authority over product creation, imagery uploads, collections, and lookbooks.',
      usersCount: 1,
      permissions: ['Product Management', 'Collections & Moods', 'Lookbook Curation', 'Inventory Adjustment'],
    },
    {
      name: 'Order Specialist',
      description: 'Manages incoming patron orders, invoices, courier manifests, and returns.',
      usersCount: 1,
      permissions: ['Orders Processing', 'Invoice Generation', 'Courier Dispatch', 'Returns Inspection'],
    },
    {
      name: 'Concierge Lead',
      description: 'Maintains patron profiles, concierge inquiries, and registry communications.',
      usersCount: 1,
      permissions: ['Patron Profiles', 'Newsletter Registry', 'Internal Patron Notes', 'Read-Only Catalog'],
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E8E3D9] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[#B39458] font-bold">
              Access Governance
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#24221E] mt-1">
            Roles & Permissions Matrix
          </h1>
          <p className="text-xs md:text-sm text-[#77736C] mt-1">
            Define role boundaries, security scopes, and administrative rights.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((r) => (
          <div key={r.name} className="luxury-card p-6 rounded-sm space-y-4 luxury-card-hover">
            <div className="flex items-center justify-between border-b border-[#E8E3D9] pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-[#24221E]">{r.name}</h3>
                <span className="text-[10px] text-[#B39458] font-medium">{r.usersCount} Assigned User</span>
              </div>
              <Shield className="w-5 h-5 text-[#B39458]" />
            </div>

            <p className="text-xs text-[#77736C]">{r.description}</p>

            <div className="space-y-2 pt-2 text-xs">
              <span className="font-semibold text-[#24221E] text-[10px] uppercase tracking-wider">
                Granted Capabilities
              </span>
              <div className="space-y-1.5">
                {r.permissions.map((p) => (
                  <div key={p} className="flex items-center space-x-2 text-[#77736C]">
                    <Check className="w-3.5 h-3.5 text-[#3E7B54] shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
