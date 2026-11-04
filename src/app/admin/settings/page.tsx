'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, Check, Shield, Sliders, Palette, Store, Bell } from 'lucide-react';
import { settingsService } from '@/services/settingsService';
import { StoreSettings } from '@/types';
import { useToast } from '@/components/ui/Toast';

export default function StoreSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<StoreSettings>(() => settingsService.getStoreSettings());

  useEffect(() => {
    setSettings(settingsService.getStoreSettings());
    settingsService.fetchStoreSettings().then((remote) => {
      if (remote) setSettings(remote);
    });
  }, []);

  const handleSave = () => {
    settingsService.updateStoreSettings(settings);
    toast('Atelier store settings updated successfully', 'success');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E8E3D9] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[#B39458] font-bold">
              Configuration
            </span>
            <span className="text-[10px] bg-[#F4EEDF] text-[#9B7940] px-2 py-0.5 rounded-full font-semibold">
              Legal & Branding
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#24221E] mt-1">
            Boutique & Atelier Settings
          </h1>
          <p className="text-xs md:text-sm text-[#77736C] mt-1">
            Manage legal entity details, GSTIN, currency formatting, concierge contacts, and brand tokens.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center space-x-2 bg-[#B39458] hover:bg-[#9B7940] text-white text-xs font-semibold px-4 py-2.5 rounded-sm transition-colors shadow-xs"
        >
          <Check className="w-4 h-4" />
          <span>Save Boutique Settings</span>
        </button>
      </div>

      <div className="luxury-card p-6 rounded-sm space-y-6">
        {/* Store Info */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-base text-[#24221E] border-b border-[#E8E3D9] pb-2 flex items-center space-x-2">
            <Store className="w-4 h-4 text-[#B39458]" />
            <span>Storefront Entity & Legal Info</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-[#24221E]">Brand Name</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#24221E]">Legal Entity Corporate Name</label>
              <input
                type="text"
                value={settings.legalEntity}
                onChange={(e) => setSettings({ ...settings, legalEntity: e.target.value })}
                className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#24221E]">GSTIN Identification Number</label>
              <input
                type="text"
                value={settings.gstin}
                onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
                className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs font-mono text-[#24221E]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#24221E]">Order Number Prefix</label>
              <input
                type="text"
                value={settings.orderPrefix}
                onChange={(e) => setSettings({ ...settings, orderPrefix: e.target.value })}
                className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs font-mono text-[#24221E]"
              />
            </div>
          </div>
        </div>

        {/* Concierge Communication */}
        <div className="space-y-4 pt-4 border-t border-[#E8E3D9]">
          <h3 className="font-serif font-bold text-base text-[#24221E] border-b border-[#E8E3D9] pb-2 flex items-center space-x-2">
            <Bell className="w-4 h-4 text-[#B39458]" />
            <span>Patron Concierge Communication</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-[#24221E]">Patron Support Email</label>
              <input
                type="text"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#24221E]">Direct Atelier Phone</label>
              <input
                type="text"
                value={settings.supportPhone}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#24221E]">Concierge WhatsApp Business</label>
              <input
                type="text"
                value={settings.conciergeWhatsApp}
                onChange={(e) => setSettings({ ...settings, conciergeWhatsApp: e.target.value })}
                className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
              />
            </div>
          </div>
        </div>

        {/* Branding Tokens */}
        <div className="space-y-4 pt-4 border-t border-[#E8E3D9]">
          <h3 className="font-serif font-bold text-base text-[#24221E] border-b border-[#E8E3D9] pb-2 flex items-center space-x-2">
            <Palette className="w-4 h-4 text-[#B39458]" />
            <span>Luxury Design System Tokens</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-[#24221E]">Antique Gold Accent (#B39458)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={settings.brandAccentColor}
                  onChange={(e) => setSettings({ ...settings, brandAccentColor: e.target.value })}
                  className="w-10 h-9 p-0.5 border border-[#E8E3D9] rounded-sm cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.brandAccentColor}
                  onChange={(e) => setSettings({ ...settings, brandAccentColor: e.target.value })}
                  className="flex-1 px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#24221E]">Primary Warm Ivory Background (#F7F5F0)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={settings.brandPrimaryColor}
                  onChange={(e) => setSettings({ ...settings, brandPrimaryColor: e.target.value })}
                  className="w-10 h-9 p-0.5 border border-[#E8E3D9] rounded-sm cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.brandPrimaryColor}
                  onChange={(e) => setSettings({ ...settings, brandPrimaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
