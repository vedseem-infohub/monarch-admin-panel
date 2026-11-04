'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Sparkles,
  ExternalLink,
  Check,
  X,
  Search,
  Filter,
  Image as ImageIcon,
  Sliders,
  DollarSign,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { SectionFrame } from '@/types';
import { sectionFrameService, SECTION_OPTIONS } from '@/services/sectionFrameService';
import { useToast } from '@/components/ui/Toast';
import { formatINR } from '@/utils/formatters';
import { ImageUpload } from '@/components/admin/ImageUpload';

export default function SectionFramesPage() {
  const { toast } = useToast();
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [frames, setFrames] = useState<SectionFrame[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingFrame, setEditingFrame] = useState<SectionFrame | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [previewFrame, setPreviewFrame] = useState<SectionFrame | null>(null);

  // Form State for Create / Edit
  const [formData, setFormData] = useState<Partial<SectionFrame>>({
    sectionKey: 'six-moods',
    title: '',
    subtitle: '',
    eyebrow: '',
    description: '',
    image: '',
    imageMobile: '',
    ctaText: '',
    ctaLink: '',
    badge: '',
    price: 0,
    originalPrice: 0,
    tagline: '',
    displayOrder: 1,
    isVisible: true,
  });

  const refreshFrames = () => {
    sectionFrameService
      .fetchFrames(selectedSection)
      .then((res) => {
        setFrames(res || []);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    refreshFrames();
  }, [selectedSection]);

  // Filtered frames
  const filteredFrames = useMemo(() => {
    let list = frames;
    if (selectedSection !== 'all') {
      list = list.filter((f) => f.sectionKey === selectedSection);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          (f.subtitle && f.subtitle.toLowerCase().includes(q)) ||
          (f.badge && f.badge.toLowerCase().includes(q)) ||
          (f.description && f.description.toLowerCase().includes(q))
      );
    }
    return list;
  }, [frames, selectedSection, searchQuery]);

  // Open Create Modal
  const handleOpenCreate = () => {
    const targetSection = selectedSection !== 'all' ? selectedSection : 'six-moods';
    setFormData({
      sectionKey: targetSection,
      title: '',
      subtitle: '',
      eyebrow: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=70&w=800&auto=format&fit=crop',
      imageMobile: '',
      ctaText: 'Explore Ensemble',
      ctaLink: '/collections/all',
      badge: 'Haute Couture',
      price: 0,
      originalPrice: 0,
      tagline: '',
      displayOrder: frames.filter((f) => f.sectionKey === targetSection).length + 1,
      isVisible: true,
    });
    setIsCreating(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (frame: SectionFrame) => {
    setEditingFrame(frame);
    setFormData({ ...frame });
  };

  // Submit Save
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.image?.trim() || !formData.sectionKey) {
      toast('Please provide a Title, Section Key, and Image URL', 'error');
      return;
    }

    if (isCreating) {
      sectionFrameService.createFrame(formData as Omit<SectionFrame, 'id'>);
      toast(`Created new frame "${formData.title}" in ${formData.sectionKey}`, 'success');
      setIsCreating(false);
    } else if (editingFrame) {
      sectionFrameService.updateFrame(editingFrame.id, formData);
      toast(`Updated frame "${formData.title}" successfully`, 'success');
      setEditingFrame(null);
    }
    refreshFrames();
  };

  // Delete Frame
  const handleDelete = (id: string) => {
    sectionFrameService.deleteFrame(id);
    toast('Frame deleted successfully', 'info');
    setDeleteConfirmId(null);
    refreshFrames();
  };

  // Toggle Visibility
  const handleToggleVisibility = (id: string) => {
    const updated = sectionFrameService.toggleVisibility(id);
    toast(
      updated.isVisible ? `Frame "${updated.title}" is now visible` : `Frame "${updated.title}" is now hidden`,
      'info'
    );
    refreshFrames();
  };

  // Move Order
  const handleMove = (frame: SectionFrame, direction: 'up' | 'down') => {
    const sectionList = frames.filter((f) => f.sectionKey === frame.sectionKey);
    const currIndex = sectionList.findIndex((f) => f.id === frame.id);
    if (currIndex === -1) return;

    const newIndex = direction === 'up' ? currIndex - 1 : currIndex + 1;
    if (newIndex < 0 || newIndex >= sectionList.length) return;

    const reordered = [...sectionList];
    const temp = reordered[currIndex];
    reordered[currIndex] = reordered[newIndex];
    reordered[newIndex] = temp;

    const orderedIds = reordered.map((f) => f.id);
    sectionFrameService.reorderFrames(frame.sectionKey, orderedIds);
    refreshFrames();
    toast(`Reordered "${frame.title}"`, 'info');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E8E3D9] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[#B39458] font-bold">
              Visual Section Engine
            </span>
            <span className="text-[10px] bg-[#F4EEDF] text-[#9B7940] px-2.5 py-0.5 rounded-full font-semibold">
              {frames.length} Total Frames Across 15 Sections
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#24221E] mt-1">
            Section Frames Management
          </h1>
          <p className="text-xs md:text-sm text-[#77736C] mt-1">
            Add, edit, reorder, and delete editorial frames, cards, and chapters for each section of the MONARCH storefront.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center space-x-2 bg-[#B39458] hover:bg-[#9B7940] text-white text-xs font-semibold px-4 py-2.5 rounded-sm transition-colors shadow-xs shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Frame</span>
        </button>
      </div>

      {/* Controls: Section Filter Pills & Search */}
      <div className="luxury-card p-4 rounded-sm space-y-4">
        {/* Section Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedSection('all')}
            className={`px-3 py-1.5 rounded-sm text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedSection === 'all'
                ? 'bg-[#24221E] text-white'
                : 'bg-[#F7F5F0] text-[#77736C] hover:text-[#24221E]'
            }`}
          >
            All Sections ({frames.length})
          </button>
          {SECTION_OPTIONS.map((sec) => {
            const count = frames.filter((f) => f.sectionKey === sec.key).length;
            return (
              <button
                key={sec.key}
                onClick={() => setSelectedSection(sec.key)}
                className={`px-3 py-1.5 rounded-sm text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedSection === sec.key
                    ? 'bg-[#B39458] text-white shadow-xs'
                    : 'bg-[#F7F5F0] text-[#77736C] hover:text-[#24221E]'
                }`}
              >
                {sec.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Search Bar & Active Count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#E8E3D9]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A49C]" />
            <input
              type="text"
              placeholder="Search frames by title, subtitle, or badge..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:outline-none focus:border-[#B39458]"
            />
          </div>

          <div className="text-xs text-[#77736C]">
            Showing <strong className="text-[#24221E]">{filteredFrames.length}</strong> frames
          </div>
        </div>
      </div>

      {/* Frames Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" suppressHydrationWarning>
        {filteredFrames.map((frame, idx) => (
          <div
            key={frame.id}
            className={`luxury-card rounded-sm overflow-hidden flex flex-col justify-between group transition-all ${
              frame.isVisible ? 'bg-white' : 'bg-[#FAF9F5] opacity-75 border-dashed border-[#A8A49C]'
            }`}
          >
            <div>
              {/* Media Preview Box */}
              <div className="relative aspect-16/10 overflow-hidden bg-[#F7F5F0]">
                <img
                  src={frame.image}
                  alt={frame.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 left-2.5 text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-black/75 text-white backdrop-blur-xs">
                  {frame.sectionKey}
                </span>

                {frame.badge && (
                  <span className="absolute top-2.5 right-2.5 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#B39458] text-white">
                    {frame.badge}
                  </span>
                )}

                <span className="absolute bottom-2 left-2 text-[10px] bg-white/90 text-[#24221E] font-mono px-1.5 py-0.5 rounded shadow-xs">
                  Order #{frame.displayOrder}
                </span>

                {!frame.isVisible && (
                  <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider">
                    Hidden from storefront
                  </span>
                )}
              </div>

              {/* Text Meta Content */}
              <div className="p-5 space-y-2">
                {frame.eyebrow && (
                  <span className="text-[10px] uppercase tracking-wider text-[#B39458] font-bold block">
                    {frame.eyebrow}
                  </span>
                )}
                <h3 className="font-serif font-bold text-base text-[#24221E] line-clamp-1">
                  {frame.title}
                </h3>
                {frame.subtitle && (
                  <p className="text-xs font-medium text-[#9B7940] italic line-clamp-1">
                    {frame.subtitle}
                  </p>
                )}
                <p className="text-xs text-[#77736C] leading-relaxed line-clamp-2">
                  {frame.description || 'No editorial description configured.'}
                </p>

                {/* Price / CTA details */}
                <div className="pt-2 flex items-center justify-between text-xs border-t border-[#E8E3D9]">
                  {frame.price && frame.price > 0 ? (
                    <span className="font-semibold text-[#24221E]">
                      {formatINR(frame.price)}
                    </span>
                  ) : (
                    <span className="text-[#A8A49C] italic text-[11px]">Display Frame</span>
                  )}

                  {frame.ctaText && (
                    <span className="text-[11px] text-[#B39458] flex items-center space-x-1 font-medium">
                      <span>{frame.ctaText}</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-3 bg-[#FAF7F0] border-t border-[#E8E3D9] flex items-center justify-between">
              {/* Up / Down Controls */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleMove(frame, 'up')}
                  className="p-1.5 rounded hover:bg-white text-[#77736C] hover:text-[#24221E] transition-colors"
                  title="Move Up"
                >
                  <MoveUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleMove(frame, 'down')}
                  className="p-1.5 rounded hover:bg-white text-[#77736C] hover:text-[#24221E] transition-colors"
                  title="Move Down"
                >
                  <MoveDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => handleToggleVisibility(frame.id)}
                  className={`p-1.5 rounded transition-colors ${
                    frame.isVisible ? 'text-[#3E7B54] hover:bg-[#EBF5EE]' : 'text-[#A63A3A] hover:bg-[#FFF1F0]'
                  }`}
                  title={frame.isVisible ? 'Hide from Storefront' : 'Publish to Storefront'}
                >
                  {frame.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => handleOpenEdit(frame)}
                  className="p-1.5 rounded hover:bg-white text-[#B39458] hover:text-[#9B7940] transition-colors"
                  title="Edit Frame"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setDeleteConfirmId(frame.id)}
                  className="p-1.5 rounded hover:bg-white text-[#A63A3A] hover:text-red-700 transition-colors"
                  title="Delete Frame"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredFrames.length === 0 && (
        <div className="luxury-card p-12 text-center space-y-4 rounded-sm">
          <Layers className="w-10 h-10 text-[#A8A49C] mx-auto" />
          <h3 className="font-serif font-bold text-lg text-[#24221E]">No Frames Found</h3>
          <p className="text-xs text-[#77736C] max-w-md mx-auto">
            No frames currently match your search or selected section filter. Click below to add a new frame.
          </p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center space-x-2 bg-[#B39458] hover:bg-[#9B7940] text-white text-xs font-semibold px-4 py-2.5 rounded-sm shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Frame to Section</span>
          </button>
        </div>
      )}

      {/* Create / Edit Frame Modal */}
      {(isCreating || editingFrame) && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white max-w-2xl w-full rounded-sm shadow-2xl border border-[#E8E3D9] max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E8E3D9] p-5 pb-4 shrink-0 bg-white">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#B39458]">
                  {isCreating ? 'Create Frame' : 'Edit Frame'}
                </span>
                <h3 className="font-serif font-bold text-lg text-[#24221E]">
                  {isCreating ? 'Add New Section Frame' : `Editing: ${editingFrame?.title}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingFrame(null);
                }}
                className="p-1.5 rounded text-[#77736C] hover:text-[#24221E] hover:bg-[#F7F5F0] transition-colors"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#24221E]">Target Storefront Section *</label>
                    <select
                      value={formData.sectionKey}
                      onChange={(e) => setFormData({ ...formData, sectionKey: e.target.value })}
                      className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:outline-none focus:border-[#B39458]"
                    >
                      {SECTION_OPTIONS.map((s) => (
                        <option key={s.key} value={s.key}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[#24221E]">Badge / Pill Label</label>
                    <input
                      type="text"
                      placeholder="e.g. Vault Signature, Tradition #1"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#24221E]">Frame Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Awadhi Darbar Cathedral Arch Saree"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#24221E]">Eyebrow Label</label>
                    <input
                      type="text"
                      placeholder="e.g. Chapter I · The Sanctuary"
                      value={formData.eyebrow}
                      onChange={(e) => setFormData({ ...formData, eyebrow: e.target.value })}
                      className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-[#24221E]">Subtitle / Poetic Echo</label>
                    <input
                      type="text"
                      placeholder="e.g. Pure Katan Silk Kadwa in Royal Crimson"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#24221E]">Editorial Description</label>
                  <textarea
                    rows={3}
                    placeholder="Detailed craftsmanship narrative or curatorial story..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2.5 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
                  />
                </div>

                <ImageUpload
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  label="Showcase Frame Image *"
                  helperText="Upload showcase artwork directly from your device to Cloudinary"
                  aspectRatio="video"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#24221E]">CTA Button Label</label>
                    <input
                      type="text"
                      placeholder="e.g. Explore Ensemble"
                      value={formData.ctaText}
                      onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                      className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-[#24221E]">CTA Link Target</label>
                    <input
                      type="text"
                      placeholder="e.g. /product/monarch-001"
                      value={formData.ctaLink}
                      onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                      className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#24221E]">Ensemble Price (₹)</label>
                    <input
                      type="number"
                      placeholder="285000"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-[#24221E]">Regular / Original Price (₹)</label>
                    <input
                      type="number"
                      placeholder="325000"
                      value={formData.originalPrice || ''}
                      onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isVisible}
                      onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                      className="w-4 h-4 accent-[#B39458] rounded"
                    />
                    <span className="font-semibold text-[#24221E]">
                      Visible on Storefront
                    </span>
                  </label>
                </div>
              </div>

              {/* Modal Footer (Sticky) */}
              <div className="flex items-center justify-end space-x-3 p-4 border-t border-[#E8E3D9] shrink-0 bg-[#FAF9F5]">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingFrame(null);
                  }}
                  className="px-4 py-2 bg-white border border-[#E8E3D9] text-[#77736C] rounded-sm hover:bg-[#F7F5F0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#B39458] hover:bg-[#9B7940] text-white font-semibold rounded-sm shadow-xs transition-colors"
                >
                  {isCreating ? 'Create Frame' : 'Save Frame Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white max-w-sm w-full rounded-sm shadow-2xl p-6 space-y-4 border border-[#E8E3D9]">
            <h3 className="font-serif font-bold text-base text-[#24221E]">
              Delete Section Frame?
            </h3>
            <p className="text-xs text-[#77736C] leading-relaxed">
              Are you sure you want to delete this frame? It will be immediately removed from the section on the storefront.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-1.5 border border-[#E8E3D9] text-[#77736C] rounded-sm text-xs hover:bg-[#F7F5F0]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-1.5 bg-[#A63A3A] hover:bg-red-700 text-white rounded-sm text-xs font-semibold shadow-xs"
              >
                Delete Frame
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

