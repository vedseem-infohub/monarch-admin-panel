'use client';

import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  Layers,
  Eye,
} from 'lucide-react';
import { ReturnsExchangePolicy } from '@/types';
import { contentService } from '@/services/contentService';
import { useToast } from '@/components/ui/Toast';

export default function AdminReturnsExchangesPage() {
  const { toast } = useToast();
  const [policy, setPolicy] = useState<ReturnsExchangePolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewTab, setPreviewTab] = useState<'editor' | 'preview'>('editor');

  useEffect(() => {
    contentService
      .fetchReturnsPolicy()
      .then((data) => {
        setPolicy(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPolicy((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleSectionChange = (index: number, field: 'title' | 'content', value: string) => {
    if (!policy) return;
    const updatedSections = [...policy.sections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setPolicy({ ...policy, sections: updatedSections });
  };

  const handleAddSection = () => {
    if (!policy) return;
    setPolicy({
      ...policy,
      sections: [
        ...policy.sections,
        {
          title: 'New Policy Clause',
          content: 'Specify detailed guidelines for your royal patrons...',
        },
      ],
    });
  };

  const handleRemoveSection = (index: number) => {
    if (!policy) return;
    const updatedSections = policy.sections.filter((_, i) => i !== index);
    setPolicy({ ...policy, sections: updatedSections });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!policy) return;

    setSaving(true);
    try {
      contentService.saveReturnsPolicy(policy);
      toast('Returns & Exchanges policy updated and published', 'success');
    } catch {
      toast('Failed to save policy updates', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !policy) {
    return (
      <div className="p-12 text-center text-xs font-serif text-[#77736C]">
        Loading Returns &amp; Exchanges Protocol...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E8E3D9] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[#B39458] font-bold">
              Client Relations &amp; Policies
            </span>
            <span className="text-[10px] bg-[#F4EEDF] text-[#9B7940] px-2 py-0.5 rounded-full font-semibold">
              Live Policy Protocol
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#24221E] mt-1">
            Returns &amp; Exchanges Editor
          </h1>
          <p className="text-xs md:text-sm text-[#77736C] mt-1">
            Configure exchange timeframes, bespoke bridal alteration policies, and concierge coordination published to patrons.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="http://localhost:3000/returns"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-white border border-[#E8E3D9] rounded-sm text-xs font-semibold text-[#24221E] hover:bg-[#FAF9F5] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#B39458]" />
            <span>View on Storefront</span>
          </a>

          <a
            href="/admin/returns"
            className="px-4 py-2 bg-white border border-[#E8E3D9] rounded-sm text-xs font-semibold text-[#24221E] hover:bg-[#FAF9F5] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#B39458]" />
            <span>Manage Return Orders</span>
          </a>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-[#B39458] hover:bg-[#9B7940] text-white rounded-sm text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing...' : 'Save & Publish'}</span>
          </button>
        </div>
      </div>

      {/* Editor / Preview Tab Toggle */}
      <div className="flex items-center border-b border-[#E8E3D9] gap-4 text-xs font-semibold">
        <button
          onClick={() => setPreviewTab('editor')}
          className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-1.5 ${
            previewTab === 'editor'
              ? 'border-[#B39458] text-[#24221E]'
              : 'border-transparent text-[#77736C] hover:text-[#24221E]'
          }`}
        >
          <Layers className="w-4 h-4 text-[#B39458]" />
          <span>Policy Document Editor</span>
        </button>

        <button
          onClick={() => setPreviewTab('preview')}
          className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-1.5 ${
            previewTab === 'preview'
              ? 'border-[#B39458] text-[#24221E]'
              : 'border-transparent text-[#77736C] hover:text-[#24221E]'
          }`}
        >
          <Eye className="w-4 h-4 text-[#B39458]" />
          <span>Live Storefront Preview</span>
        </button>
      </div>

      {previewTab === 'editor' ? (
        <form onSubmit={handleSave} className="space-y-6">
          {/* 1. Main Header & Eyebrow */}
          <div className="bg-white p-6 rounded-sm border border-[#E8E3D9] shadow-xs space-y-4">
            <h3 className="font-serif text-base font-bold text-[#24221E] border-b border-[#E8E3D9] pb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#B39458]" />
              <span>1. Page Header &amp; Concierge Subtitle</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#24221E] mb-1">
                  Page Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={policy.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:outline-none focus:border-[#B39458]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#24221E] mb-1">
                  Exchange Window Duration (Days)
                </label>
                <input
                  type="number"
                  name="exchangeWindowDays"
                  min={1}
                  max={30}
                  value={policy.exchangeWindowDays}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:outline-none focus:border-[#B39458]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#24221E] mb-1">
                  Concierge Subtitle / Tagline
                </label>
                <input
                  type="text"
                  name="subtitle"
                  value={policy.subtitle}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:outline-none focus:border-[#B39458]"
                />
              </div>
            </div>
          </div>

          {/* 2. Ready-to-Wear Exchange Policy */}
          <div className="bg-white p-6 rounded-sm border border-[#E8E3D9] shadow-xs space-y-4">
            <h3 className="font-serif text-base font-bold text-[#24221E] border-b border-[#E8E3D9] pb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#B39458]" />
              <span>2. Ready-to-Wear Silk &amp; Prêt Exchange Terms</span>
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#24221E] mb-1">
                Clause Headline
              </label>
              <input
                type="text"
                name="exchangeWindowHeadline"
                value={policy.bespokePolicyHeadline ? `${policy.exchangeWindowDays}-Day Complimentary Exchange Window` : ''}
                readOnly
                className="w-full px-3 py-2 bg-[#F7F5F0]/70 border border-[#E8E3D9] rounded-sm text-xs text-[#77736C]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#24221E] mb-1">
                Policy Description
              </label>
              <textarea
                rows={3}
                name="exchangeWindowDescription"
                value={policy.exchangeWindowDescription}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:outline-none focus:border-[#B39458]"
              />
            </div>
          </div>

          {/* 3. Bespoke Bridal Couture Policy */}
          <div className="bg-white p-6 rounded-sm border border-[#E8E3D9] shadow-xs space-y-4">
            <h3 className="font-serif text-base font-bold text-[#24221E] border-b border-[#E8E3D9] pb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B39458]" />
              <span>3. Bespoke Bridal Couture &amp; Custom Tailoring Terms</span>
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#24221E] mb-1">
                Headline
              </label>
              <input
                type="text"
                name="bespokePolicyHeadline"
                value={policy.bespokePolicyHeadline}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:outline-none focus:border-[#B39458]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#24221E] mb-1">
                Description
              </label>
              <textarea
                rows={3}
                name="bespokePolicyDescription"
                value={policy.bespokePolicyDescription}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:outline-none focus:border-[#B39458]"
              />
            </div>
          </div>

          {/* 4. How to Request an Exchange (Concierge Coordinates) */}
          <div className="bg-white p-6 rounded-sm border border-[#E8E3D9] shadow-xs space-y-4">
            <h3 className="font-serif text-base font-bold text-[#24221E] border-b border-[#E8E3D9] pb-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#B39458]" />
              <span>4. Concierge Coordination &amp; Doorstep Reverse Pickup</span>
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#24221E] mb-1">
                Instructions Headline
              </label>
              <input
                type="text"
                name="exchangeStepsHeadline"
                value={policy.exchangeStepsHeadline}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:outline-none focus:border-[#B39458]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#24221E] mb-1">
                  Concierge WhatsApp
                </label>
                <input
                  type="text"
                  name="conciergeWhatsApp"
                  value={policy.conciergeWhatsApp}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:outline-none focus:border-[#B39458]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#24221E] mb-1">
                  Concierge Email
                </label>
                <input
                  type="email"
                  name="conciergeEmail"
                  value={policy.conciergeEmail}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:outline-none focus:border-[#B39458]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#24221E] mb-1">
                Instructions Wording
              </label>
              <textarea
                rows={3}
                name="exchangeStepsDescription"
                value={policy.exchangeStepsDescription}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:outline-none focus:border-[#B39458]"
              />
            </div>
          </div>

          {/* 5. Custom Policy Clauses & Sections */}
          <div className="bg-white p-6 rounded-sm border border-[#E8E3D9] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E3D9] pb-3">
              <h3 className="font-serif text-base font-bold text-[#24221E]">
                5. Additional Policy Clauses &amp; Terms
              </h3>
              <button
                type="button"
                onClick={handleAddSection}
                className="px-3 py-1 bg-[#F7F5F0] hover:bg-[#E8E3D9] text-[#24221E] text-xs font-semibold rounded-sm flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Clause</span>
              </button>
            </div>

            <div className="space-y-4">
              {policy.sections.map((section, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-[#F7F5F0]/60 rounded-sm border border-[#E8E3D9] space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#77736C]">
                      Clause #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSection(idx)}
                      className="text-red-600 hover:text-red-800 text-xs font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => handleSectionChange(idx, 'title', e.target.value)}
                    placeholder="Clause Title (e.g. Tamper-Proof Seal Guarantee)"
                    className="w-full px-3 py-1.5 bg-white border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:outline-none focus:border-[#B39458]"
                  />

                  <textarea
                    rows={2}
                    value={section.content}
                    onChange={(e) => handleSectionChange(idx, 'content', e.target.value)}
                    placeholder="Clause details..."
                    className="w-full px-3 py-1.5 bg-white border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:outline-none focus:border-[#B39458]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Save Bar */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-[#B39458] hover:bg-[#9B7940] text-white rounded-sm text-xs font-semibold flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Publishing Updates...' : 'Publish Policy Changes'}</span>
            </button>
          </div>
        </form>
      ) : (
        /* Live Storefront Preview */
        <div className="bg-[#FBF8F3] p-8 sm:p-12 rounded-xl border border-[#E8E3D9] shadow-inner max-w-4xl mx-auto space-y-8 text-[#24221E]">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#B39458] font-bold block mb-2">
              &larr; Storefront Preview Mode
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-medium text-[#5A1725]">
              {policy.title}
            </h1>
            <p className="text-xs font-sans text-[#77736C] mt-2">{policy.subtitle}</p>
          </div>

          <div className="space-y-6 text-sm leading-relaxed text-[#24221E]/80 border-t border-[#B39458]/30 pt-8">
            <section className="space-y-2">
              <h2 className="font-serif text-xl text-[#5A1725] font-semibold">
                {policy.exchangeWindowDays}-Day Complimentary Exchange Window
              </h2>
              <p>{policy.exchangeWindowDescription}</p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-xl text-[#5A1725] font-semibold">
                {policy.bespokePolicyHeadline}
              </h2>
              <p>{policy.bespokePolicyDescription}</p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-xl text-[#5A1725] font-semibold">
                {policy.exchangeStepsHeadline}
              </h2>
              <p>{policy.exchangeStepsDescription}</p>
              <div className="p-3 bg-white rounded border border-[#E8E3D9] text-xs space-y-1">
                <p>
                  <strong>WhatsApp:</strong>{' '}
                  <span className="text-[#5A1725] font-medium">{policy.conciergeWhatsApp}</span>
                </p>
                <p>
                  <strong>Email:</strong>{' '}
                  <span className="text-[#5A1725] font-medium">{policy.conciergeEmail}</span>
                </p>
              </div>
            </section>

            {policy.sections.map((sec, i) => (
              <section key={i} className="space-y-2 pt-2 border-t border-[#E8E3D9]/60">
                <h2 className="font-serif text-lg text-[#5A1725] font-semibold">{sec.title}</h2>
                <p className="text-xs">{sec.content}</p>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

