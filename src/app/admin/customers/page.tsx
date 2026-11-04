'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Search,
  Crown,
  Eye,
  MapPin,
  ShoppingBag,
  Coins,
  Tag,
  Plus,
  X,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { formatINR } from '@/utils/formatters';
import { Customer, Order } from '@/types';
import { customerService } from '@/services/customerService';
import { orderService } from '@/services/orderService';
import { useToast } from '@/components/ui/Toast';

export default function CustomersPage() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    Promise.all([customerService.fetchCustomers(), orderService.fetchOrders()])
      .then(([custs, ords]) => {
        setCustomers(custs || []);
        setAllOrders(ords || []);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search);
      const matchTag = tagFilter === 'all' || c.tags.includes(tagFilter) || c.status === tagFilter;
      return matchSearch && matchTag;
    });
  }, [customers, search, tagFilter]);

  const handleAddCustomerNote = () => {
    if (!selectedCustomer || !newNote.trim()) return;
    const updated = customerService.addCustomerNote(selectedCustomer.id, newNote.trim());
    setCustomers(customerService.getCustomers());
    setSelectedCustomer(updated);
    setNewNote('');
    toast('Patron note saved', 'success');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E8E3D9] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[#B39458] font-bold">
              Clientele & Sovereign Registry
            </span>
            <span className="text-[10px] bg-[#F4EEDF] text-[#9B7940] px-2 py-0.5 rounded-full font-semibold">
              {customers.length} Verified Patrons
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#24221E] mt-1">
            Royal Patrons & Clients
          </h1>
          <p className="text-xs md:text-sm text-[#77736C] mt-1">
            Maintain relationship profiles, trousseau measurements, sizing preferences, and lifetime patronage.
          </p>
        </div>
      </div>

      {/* Search & Tag Filter Bar */}
      <div className="bg-white p-4 rounded-sm border border-[#E8E3D9] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-[#A8A49C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patron name, email, or telephone..."
            className="w-full pl-9 pr-4 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:bg-white focus:outline-none focus:border-[#B39458]"
          />
        </div>

        <div className="flex items-center space-x-2">
          {['all', 'Royal Patron', 'VIP', 'Active'].map((t) => (
            <button
              key={t}
              onClick={() => setTagFilter(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${
                tagFilter === t
                  ? 'bg-[#B39458] text-white shadow-xs'
                  : 'bg-[#F7F5F0] text-[#77736C] hover:text-[#24221E]'
              }`}
            >
              {t === 'all' ? 'All Patrons' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-sm border border-[#E8E3D9] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E8E3D9] bg-[#FAF9F5] text-[11px] font-semibold text-[#77736C] uppercase tracking-wider">
                <th className="py-3 px-4">Patron</th>
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Total Spend</th>
                <th className="py-3 px-3">Orders</th>
                <th className="py-3 px-3">Patron Tags</th>
                <th className="py-3 px-4 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E3D9]/60 text-xs" suppressHydrationWarning>
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-[#FAF9F5] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#B39458] to-[#9B7940] text-white flex items-center justify-center font-serif font-bold text-xs shrink-0 shadow-xs">
                        {c.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <span className="font-serif font-bold text-sm text-[#24221E] block">
                          {c.name}
                        </span>
                        <span className="text-[10px] text-[#77736C]">Client #{c.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="text-[#24221E] font-medium">{c.email}</div>
                    <div className="text-[10px] text-[#77736C]">{c.phone}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        c.status === 'Royal Patron'
                          ? 'bg-[#24221E] text-[#B39458] border border-[#B39458]/40'
                          : c.status === 'VIP'
                          ? 'bg-[#FAF7EE] text-[#9B7940]'
                          : 'bg-[#F7F5F0] text-[#77736C]'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-[#24221E]">
                    {formatINR(c.totalSpend)}
                  </td>
                  <td className="py-3.5 px-3 text-[#24221E]">
                    <strong>{c.totalOrders}</strong> Ensembles
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center flex-wrap gap-1">
                      {c.tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-[#F7F5F0] text-[#77736C] border border-[#E8E3D9]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedCustomer(c)}
                      className="px-3 py-1.5 bg-[#FAF7F0] hover:bg-[#F4EEDF] text-[#9B7940] border border-[#B39458]/30 font-semibold rounded-sm transition-colors text-xs"
                    >
                      View Dossier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile Dossier Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-end backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Drawer Top */}
              <div className="flex items-center justify-between border-b border-[#E8E3D9] pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#B39458] to-[#9B7940] text-white flex items-center justify-center font-serif font-bold text-base shadow-md">
                    {selectedCustomer.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#B39458]">
                      Patron Dossier
                    </span>
                    <h3 className="font-serif font-bold text-xl text-[#24221E]">
                      {selectedCustomer.name}
                    </h3>
                    <span className="text-xs text-[#77736C]">{selectedCustomer.email}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1 rounded text-[#77736C] hover:text-[#24221E]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* High-Level Financials */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-[#FAF9F5] border border-[#E8E3D9] rounded-sm">
                  <span className="text-[10px] uppercase text-[#77736C]">Lifetime Spend</span>
                  <div className="text-sm font-bold text-[#24221E] mt-0.5">
                    {formatINR(selectedCustomer.totalSpend)}
                  </div>
                </div>
                <div className="p-3 bg-[#FAF9F5] border border-[#E8E3D9] rounded-sm">
                  <span className="text-[10px] uppercase text-[#77736C]">Total Orders</span>
                  <div className="text-sm font-bold text-[#B39458] mt-0.5">
                    {selectedCustomer.totalOrders} Commissions
                  </div>
                </div>
                <div className="p-3 bg-[#FAF9F5] border border-[#E8E3D9] rounded-sm">
                  <span className="text-[10px] uppercase text-[#77736C]">Patron Tier</span>
                  <div className="text-xs font-bold text-[#3E7B54] mt-1">
                    {selectedCustomer.status}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-[#77736C] uppercase tracking-wider">
                  Patron Preferences & Tags
                </span>
                <div className="flex items-center flex-wrap gap-1.5 pt-1">
                  {selectedCustomer.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FAF7EE] text-[#9B7940] border border-[#B39458]/30"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Addresses */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#77736C] uppercase tracking-wider">
                  Registered Estates & Addresses
                </span>
                <div className="space-y-2">
                  {selectedCustomer.addresses.map((addr, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] space-y-0.5"
                    >
                      <div className="font-semibold">{addr.name}</div>
                      <div className="text-[#77736C]">{addr.addressLine1}</div>
                      <div className="text-[#77736C]">
                        {addr.city}, {addr.state} - {addr.postalCode}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order History */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#77736C] uppercase tracking-wider">
                  Commission History
                </span>
                <div className="space-y-2 border border-[#E8E3D9] rounded-sm p-3 bg-[#FAF9F5]">
                  {allOrders
                    .filter((o) => o.customerId === selectedCustomer.id)
                    .map((ord) => (
                      <div
                        key={ord.id}
                        className="flex items-center justify-between text-xs border-b border-[#E8E3D9]/60 pb-2 last:border-0 last:pb-0"
                      >
                        <div>
                          <strong className="text-[#24221E] block font-mono">{ord.orderNumber}</strong>
                          <span className="text-[10px] text-[#77736C]" suppressHydrationWarning>
                            {new Date(ord.orderDate).toLocaleDateString()} · {ord.items.length} items
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-[#24221E] block">{formatINR(ord.total)}</span>
                          <span className="text-[10px] text-[#3E7B54] font-semibold">{ord.status}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Internal Notes */}
              <div className="space-y-2 pt-2 border-t border-[#E8E3D9]">
                <span className="text-xs font-semibold text-[#77736C] uppercase tracking-wider">
                  Patron Sizing &amp; Customization Notes
                </span>
                <div className="space-y-1.5">
                  {selectedCustomer.notes.map((note, i) => (
                    <div key={i} className="p-2.5 bg-[#FFFDF7] border border-[#F4EEDF] rounded-sm text-xs text-[#24221E]">
                      {note}
                    </div>
                  ))}
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add confidential preference note..."
                    className="flex-1 px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
                  />
                  <button
                    onClick={handleAddCustomerNote}
                    className="px-3 py-2 bg-[#24221E] hover:bg-[#B39458] text-white text-xs font-semibold rounded-sm transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8E3D9] text-right">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-[#F7F5F0] text-[#77736C] text-xs font-medium rounded-sm"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
