'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Search, Download, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { newsletterService } from '@/services/newsletterService';
import { RoyalSubscriber } from '@/types';
import { useToast } from '@/components/ui/Toast';

export default function NewsletterSubscribersPage() {
  const { toast } = useToast();
  const [subscribers, setSubscribers] = useState<RoyalSubscriber[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    newsletterService
      .fetchSubscribers()
      .then((res) => {
        setSubscribers(res || []);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filtered = subscribers.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.fullName && s.fullName.toLowerCase().includes(search.toLowerCase()))
  );

  const handleToggle = (id: string) => {
    const updated = newsletterService.toggleStatus(id);
    setSubscribers(newsletterService.getSubscribers());
    toast(`Subscriber ${updated.email} status is now ${updated.status}`, 'info');
  };

  const handleExportCSV = () => {
    const headers = ['Email', 'Full Name', 'Subscription Date', 'Status', 'Preferences'];
    const rows = filtered.map((s) => [
      s.email,
      `"${s.fullName || ''}"`,
      new Date(s.subscriptionDate).toLocaleDateString(),
      s.status,
      `"${s.preferredCategories.join(', ')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `royal_registry_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast(`Exported ${filtered.length} subscribers to CSV`, 'success');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E8E3D9] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[#B39458] font-bold">
              Audience & Registry
            </span>
            <span className="text-[10px] bg-[#F4EEDF] text-[#9B7940] px-2 py-0.5 rounded-full font-semibold">
              {subscribers.length} Sovereign Subscriptions
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#24221E] mt-1">
            Royal Registry Newsletter
          </h1>
          <p className="text-xs md:text-sm text-[#77736C] mt-1">
            Patron email subscribers for exclusive ethnic wear drops, limited silk weave announcements, and vault releases.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center space-x-2 bg-white hover:bg-[#F7F5F0] text-[#24221E] text-xs font-semibold px-4 py-2.5 rounded-sm border border-[#E8E3D9] transition-colors shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-[#B39458]" />
          <span>Export Registry CSV</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-sm border border-[#E8E3D9] shadow-xs max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-[#A8A49C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subscriber email or name..."
            className="w-full pl-9 pr-4 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:bg-white focus:outline-none focus:border-[#B39458]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-sm border border-[#E8E3D9] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E8E3D9] bg-[#FAF9F5] text-[11px] font-semibold text-[#77736C] uppercase tracking-wider">
                <th className="py-3 px-4">Patron Name</th>
                <th className="py-3 px-3">Subscriber Email</th>
                <th className="py-3 px-3">Subscribed On</th>
                <th className="py-3 px-3">Preferred Categories</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E3D9]/60 text-xs">
              {filtered.map((sub) => (
                <tr key={sub.id} className="hover:bg-[#FAF9F5] transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-[#24221E]">
                    {sub.fullName || 'Patron'}
                  </td>
                  <td className="py-3.5 px-3 font-medium text-[#24221E]">{sub.email}</td>
                  <td className="py-3.5 px-3 text-[#77736C]" suppressHydrationWarning>
                    {new Date(sub.subscriptionDate).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-3 text-[#77736C]">
                    {sub.preferredCategories.join(', ')}
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        sub.status === 'Subscribed'
                          ? 'bg-[#EBF5EE] text-[#3E7B54]'
                          : 'bg-[#FFF1F0] text-[#A63A3A]'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleToggle(sub.id)}
                      className="text-xs text-[#77736C] hover:text-[#B39458] font-medium"
                    >
                      {sub.status === 'Subscribed' ? 'Unsubscribe' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
