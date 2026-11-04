'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingCart,
  Phone,
  Mail,
  Send,
  MessageSquare,
  Sparkles,
  Search,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Clock,
  IndianRupee,
  ShieldCheck,
  X,
} from 'lucide-react';
import { abandonedCartService } from '@/services/abandonedCartService';
import { AbandonedCart } from '@/types';
import { useToast } from '@/components/ui/Toast';

export default function AbandonedCartsPage() {
  const { addToast } = useToast();
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [activeCart, setActiveCart] = useState<AbandonedCart | null>(null);
  const [messageChannel, setMessageChannel] = useState<'WhatsApp' | 'Email'>('WhatsApp');
  const [customMessage, setCustomMessage] = useState('');

  useEffect(() => {
    setCarts(abandonedCartService.getAll());
    abandonedCartService.fetchAbandonedCarts().then((data) => {
      if (data) setCarts(data);
    });
  }, []);

  const filteredCarts = useMemo(() => {
    return carts.filter((c) => {
      const matchStatus = statusFilter === 'All' || c.recoveryStatus === statusFilter;
      const matchSearch =
        c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.cartToken.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.items.some((i) => i.productName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchStatus && matchSearch;
    });
  }, [carts, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const totalVal = carts.reduce((acc, c) => acc + c.totalValue, 0);
    const recovered = carts.filter((c) => c.recoveryStatus === 'Recovered').length;
    const rate = carts.length > 0 ? ((recovered / carts.length) * 100).toFixed(1) : '0';
    return {
      totalValue: totalVal,
      unrecoveredCount: carts.filter((c) => c.recoveryStatus !== 'Recovered').length,
      recoveryRate: rate,
      avgValue: carts.length > 0 ? Math.round(totalVal / carts.length) : 0,
    };
  }, [carts]);

  const handleOpenRecoveryModal = (cart: AbandonedCart, channel: 'WhatsApp' | 'Email') => {
    setActiveCart(cart);
    setMessageChannel(channel);
    const itemNames = cart.items.map((i) => i.productName).join(', ');
    if (channel === 'WhatsApp') {
      setCustomMessage(
        `Pranam ${cart.customerName}. We noticed your bespoke ensemble selection (${itemNames}) in the Sovereign MONARCH atelier cart. Would you like our senior master draper to arrange a private video consultation or reserve this loom edition for your fitting? Use code ROYAL10 for an atelier privilege.`
      );
    } else {
      setCustomMessage(
        `Dear ${cart.customerName},\n\nWe reserved your chosen pieces (${itemNames}) in your online shopping bag with complimentary white-glove delivery. Each MONARCH ensemble is handloomed in strictly limited numbers.\n\nShould you require custom sizing or expedited delivery, please reply to this royal dispatch or connect with our concierge at concierge@monarch-couture.in.\n\nWith warm regards,\nMonarch Haute Couture Concierge`
      );
    }
  };

  const handleSendRecoveryMessage = () => {
    if (!activeCart) return;
    const newStatus =
      messageChannel === 'WhatsApp' ? 'WhatsApp Sent' : 'Email Sent';
    try {
      const updated = abandonedCartService.updateRecoveryStatus(
        activeCart.id,
        newStatus,
        `Dispatched ${messageChannel} recovery message on ${new Date().toLocaleTimeString('en-IN')}`
      );
      setCarts((prev) => prev.map((c) => (c.id === activeCart.id ? updated : c)));
      addToast(
        `${messageChannel} Recovery Dispatched`,
        `Direct concierge message sent to ${activeCart.customerName}.`,
        'success'
      );
      setActiveCart(null);
    } catch {
      addToast('Error', 'Unable to send message', 'error');
    }
  };

  const handleMarkRecovered = (id: string) => {
    try {
      const updated = abandonedCartService.updateRecoveryStatus(
        id,
        'Recovered',
        'Customer completed booking/order via concierge phone call.'
      );
      setCarts((prev) => prev.map((c) => (c.id === id ? updated : c)));
      addToast('Cart Converted to Order', 'Marked cart as successfully recovered!', 'success');
    } catch {
      addToast('Error', 'Unable to update status', 'error');
    }
  };

  const handleDeleteCart = (id: string) => {
    if (confirm('Delete this abandoned cart record?')) {
      abandonedCartService.deleteCart(id);
      setCarts((prev) => prev.filter((c) => c.id !== id));
      addToast('Cart Removed', 'Record removed from dashboard.', 'info');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="border-b border-[#E8E3D9] pb-6">
        <div className="flex items-center space-x-2 text-xs font-serif tracking-[0.2em] text-[#B39458] uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>High-Value Trousseau Pipeline</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif text-[#24221E] font-medium tracking-tight mt-1">
          Abandoned Trousseau Carts
        </h1>
        <p className="text-sm text-[#77736C] font-sans mt-1">
          Engage royal patrons who left bespoke couture in checkout with personalized WhatsApp & VIP concierge outreach.
        </p>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] border border-[#E8E3D9] p-5 rounded-sm shadow-xs">
          <span className="text-xs text-[#77736C] font-sans uppercase tracking-wider">
            Total Abandoned Value
          </span>
          <div className="text-2xl font-serif font-bold text-[#24221E] mt-1">
            ₹ {stats.totalValue.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-[#A63A3A] mt-1 flex items-center font-medium">
            High-ticket bridal ensembles
          </span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E8E3D9] p-5 rounded-sm shadow-xs">
          <span className="text-xs text-[#77736C] font-sans uppercase tracking-wider">
            Unrecovered Carts
          </span>
          <div className="text-2xl font-serif font-bold text-[#24221E] mt-1">
            {stats.unrecoveredCount}
          </div>
          <span className="text-[11px] text-[#A67C2E] mt-1 flex items-center font-medium">
            Requiring concierge outreach
          </span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E8E3D9] p-5 rounded-sm shadow-xs">
          <span className="text-xs text-[#77736C] font-sans uppercase tracking-wider">
            Average Cart Value
          </span>
          <div className="text-2xl font-serif font-bold text-[#24221E] mt-1">
            ₹ {stats.avgValue.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-[#B39458] mt-1 flex items-center font-medium">
            Bespoke haute couture average
          </span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E8E3D9] p-5 rounded-sm shadow-xs">
          <span className="text-xs text-[#77736C] font-sans uppercase tracking-wider">
            Recovery Conversion Rate
          </span>
          <div className="text-2xl font-serif font-bold text-[#3E7B54] mt-1">
            {stats.recoveryRate}%
          </div>
          <span className="text-[11px] text-[#3E7B54] mt-1 flex items-center font-medium">
            Via personalized concierge
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FFFFFF] border border-[#E8E3D9] rounded-sm p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-2 md:pb-0">
          {[
            'All',
            'Unrecovered',
            'WhatsApp Sent',
            'Email Sent',
            'VIP Concierge Contacted',
            'Recovered',
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-[#24221E] text-[#FAF7F0]'
                  : 'text-[#77736C] hover:text-[#24221E] hover:bg-[#F7F5F0]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#77736C]" />
          <input
            type="text"
            placeholder="Search patron, email, items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm focus:outline-hidden focus:border-[#B39458] text-[#24221E]"
          />
        </div>
      </div>

      {/* Abandoned Carts List */}
      <div className="space-y-4">
        {filteredCarts.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-[#E8E3D9] rounded-sm p-12 text-center">
            <ShoppingCart className="w-10 h-10 text-[#77736C]/40 mx-auto mb-3" />
            <h3 className="text-base font-serif text-[#24221E] font-medium">No abandoned carts found</h3>
            <p className="text-xs text-[#77736C] mt-1">All patron sessions have converted or are resolved.</p>
          </div>
        ) : (
          filteredCarts.map((cart) => (
            <div
              key={cart.id}
              className="bg-[#FFFFFF] border border-[#E8E3D9] rounded-sm p-5 shadow-xs transition-all hover:shadow-md"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                {/* Left: Patron Info & Cart Items */}
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between border-b border-[#E8E3D9]/60 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-base font-serif font-bold text-[#24221E]">
                          {cart.customerName}
                        </span>
                        <span className="text-xs font-mono text-[#77736C]">
                          [{cart.cartToken}]
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-[#77736C] mt-1">
                        <span className="flex items-center space-x-1">
                          <Mail className="w-3.5 h-3.5 text-[#B39458]" />
                          <span>{cart.customerEmail}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3.5 h-3.5 text-[#B39458]" />
                          <span>{cart.customerPhone}</span>
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-[#77736C] block">Total Bag Value</span>
                      <span className="text-lg font-serif font-bold text-[#B39458]">
                        ₹ {cart.totalValue.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="space-y-2">
                    {cart.items.map((item, idx) => {
                      const itemImg = typeof item.image === 'string' && item.image.trim() !== ''
                        ? item.image
                        : typeof (item.image as any)?.url === 'string' && (item.image as any).url.trim() !== ''
                        ? (item.image as any).url
                        : null;

                      return (
                        <div key={idx} className="flex items-center space-x-3 bg-[#F7F5F0]/60 p-2 rounded-sm border border-[#E8E3D9]/40">
                          <div className="relative w-12 h-14 bg-[#FFFFFF] rounded-sm overflow-hidden shrink-0 border border-[#E8E3D9] flex items-center justify-center">
                            {itemImg ? (
                              <img
                                src={itemImg}
                                alt={item.productName || 'Product'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ShoppingCart className="w-4 h-4 text-[#B39458]/40" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-serif font-bold text-[#24221E] truncate">{item.productName}</h4>
                            <span className="text-[11px] text-[#77736C] block">{item.variant} · Qty: {item.quantity}</span>
                          </div>
                          <span className="text-xs font-serif font-semibold text-[#24221E]">
                            ₹ {item.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Recovery Notes / Timeline */}
                  {cart.recoveryNote && (
                    <div className="p-2.5 bg-[#FAF9F5] border border-[#E8E3D9] rounded-sm text-xs text-[#77736C] flex items-start space-x-2">
                      <Clock className="w-3.5 h-3.5 text-[#B39458] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[#24221E]">Concierge Log:</span> {cart.recoveryNote}
                        {cart.lastContactedAt && (
                          <span className="text-[10px] text-[#77736C] block mt-0.5">
                            Last touched: {new Date(cart.lastContactedAt).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Actions and Status */}
                <div className="lg:w-64 flex flex-col space-y-3 pt-2 lg:pt-0 lg:border-l lg:border-[#E8E3D9] lg:pl-5 shrink-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#77736C]">Status:</span>
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider ${
                        cart.recoveryStatus === 'Recovered'
                          ? 'bg-[#EBF5EF] text-[#3E7B54] border border-[#3E7B54]/20'
                          : cart.recoveryStatus === 'WhatsApp Sent'
                          ? 'bg-[#E8F4F8] text-[#1E7085] border border-[#1E7085]/20'
                          : cart.recoveryStatus === 'Email Sent'
                          ? 'bg-[#F2EDFB] text-[#693E94] border border-[#693E94]/20'
                          : cart.recoveryStatus === 'VIP Concierge Contacted'
                          ? 'bg-[#FAF1E3] text-[#A67C2E] border border-[#C98A2C]/20'
                          : 'bg-[#FBEAE8] text-[#A63A3A] border border-[#A63A3A]/20'
                      }`}
                    >
                      {cart.recoveryStatus}
                    </span>
                  </div>

                  {cart.recoveryStatus !== 'Recovered' && (
                    <>
                      <button
                        onClick={() => handleOpenRecoveryModal(cart, 'WhatsApp')}
                        className="w-full py-2 px-3 text-xs bg-[#24221E] hover:bg-[#33302B] text-[#FAF7F0] rounded-sm flex items-center justify-center space-x-2 transition-colors font-medium"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                        <span>WhatsApp VIP Outreach</span>
                      </button>

                      <button
                        onClick={() => handleOpenRecoveryModal(cart, 'Email')}
                        className="w-full py-2 px-3 text-xs bg-[#F7F5F0] hover:bg-[#ECE8DF] text-[#24221E] border border-[#E8E3D9] rounded-sm flex items-center justify-center space-x-2 transition-colors font-medium"
                      >
                        <Mail className="w-3.5 h-3.5 text-[#B39458]" />
                        <span>Send Royal Email</span>
                      </button>

                      <button
                        onClick={() => handleMarkRecovered(cart.id)}
                        className="w-full py-2 px-3 text-xs bg-[#3E7B54]/10 hover:bg-[#3E7B54]/20 text-[#3E7B54] border border-[#3E7B54]/30 rounded-sm flex items-center justify-center space-x-2 transition-colors font-medium"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark as Recovered</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handleDeleteCart(cart.id)}
                    className="w-full py-1.5 px-3 text-[11px] text-[#77736C] hover:text-[#A63A3A] hover:bg-[#FBEAE8] rounded-sm flex items-center justify-center space-x-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Discard Cart Record</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Concierge Outreach Modal */}
      {activeCart && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] border border-[#E8E3D9] rounded-sm max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E8E3D9] pb-4">
              <div>
                <span className="text-[10px] font-serif tracking-[0.2em] text-[#B39458] uppercase">
                  {messageChannel === 'WhatsApp' ? 'Instant Concierge Messenger' : 'Atelier Letterhead'}
                </span>
                <h3 className="text-lg font-serif font-bold text-[#24221E] mt-0.5">
                  Send Recovery Dispatch to {activeCart.customerName}
                </h3>
              </div>
              <button
                onClick={() => setActiveCart(null)}
                className="p-1.5 text-[#77736C] hover:text-[#24221E] rounded-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#77736C] bg-[#F7F5F0] p-2.5 rounded-sm">
                <span>Destination: <strong>{messageChannel === 'WhatsApp' ? activeCart.customerPhone : activeCart.customerEmail}</strong></span>
                <span>Bag Value: <strong>₹ {activeCart.totalValue.toLocaleString('en-IN')}</strong></span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#24221E] uppercase tracking-wider mb-1.5 font-sans">
                  Concierge Message Text
                </label>
                <textarea
                  rows={5}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full text-xs p-3 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm focus:outline-hidden focus:border-[#B39458] text-[#24221E] font-sans leading-relaxed"
                />
              </div>

              <div className="flex items-center space-x-2 text-[11px] text-[#B39458]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Includes active 10% Royal Privilege voucher code (ROYAL10) automatically.</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#E8E3D9]">
              <button
                onClick={() => setActiveCart(null)}
                className="px-4 py-2 text-xs text-[#77736C] hover:text-[#24221E] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSendRecoveryMessage}
                className="px-5 py-2 text-xs bg-[#24221E] hover:bg-[#38342E] text-[#FAF7F0] rounded-sm font-medium flex items-center space-x-2 transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-[#B39458]" />
                <span>Dispatch Recovery Message</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
