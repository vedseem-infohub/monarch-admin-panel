'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Compass,
  Edit,
  Eye,
  Check,
  X,
  UploadCloud,
  MoveUp,
  MoveDown,
  Sparkles,
  ExternalLink,
  Plus,
  Trash2,
  Layers,
} from 'lucide-react';
import { Category } from '@/types';
import { categoryService } from '@/services/collectionService';
import { useToast } from '@/components/ui/Toast';
import { ImageUpload } from '@/components/admin/ImageUpload';

const SILK_MOOD_IDS = [
  'kanjivaram-silk',
  'chanderi-silk',
  'tussar-silk',
  'paithani-silk',
  'banarasi-silk',
  'pure-organza',
];

export default function SixMoodsManagementPage() {
  const { toast } = useToast();
  const [moods, setMoods] = useState<Category[]>([]);
  const [editingMood, setEditingMood] = useState<Category | null>(null);
  const [previewMood, setPreviewMood] = useState<Category | null>(null);
  const [isAddingMood, setIsAddingMood] = useState(false);
  const [newMood, setNewMood] = useState<Partial<Category>>({
    name: '',
    slug: '',
    tagline: '',
    description: '',
    image: '/images/moods/kanjivaram_silk.jpg',
    itemCount: 12,
    gender: 'women',
  });

  const refreshMoods = () => {
    categoryService.fetchCategories().then((allCategories) => {
      const filtered = (allCategories || []).filter((c) =>
        SILK_MOOD_IDS.includes(c.id) || SILK_MOOD_IDS.includes(c.slug) || c.id.startsWith('mood-')
      );
      setMoods(filtered);
    });
  };

  useEffect(() => {
    refreshMoods();
  }, []);

  const handleSaveMood = () => {
    if (!editingMood) return;
    categoryService.updateCategory(editingMood.id, editingMood);
    refreshMoods();
    toast(`Saved changes to "${editingMood.name}"`, 'success');
    setEditingMood(null);
  };

  const handleCreateMood = () => {
    if (!newMood.name) {
      toast('Please enter a tradition name', 'error');
      return;
    }
    const slug = newMood.slug || newMood.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const created = categoryService.createCategory({
      name: newMood.name,
      slug,
      tagline: newMood.tagline || 'Heirloom Handloom Weave',
      description: newMood.description || '',
      image: newMood.image || '/images/moods/kanjivaram_silk.jpg',
      itemCount: Number(newMood.itemCount) || 12,
      gender: (newMood.gender as 'women' | 'men' | 'all') || 'women',
      status: 'Active',
    });
    // Add id to active mood tracking
    SILK_MOOD_IDS.push(created.id);
    refreshMoods();
    toast(`Added new tradition "${created.name}"`, 'success');
    setIsAddingMood(false);
    setNewMood({
      name: '',
      slug: '',
      tagline: '',
      description: '',
      image: '/images/moods/kanjivaram_silk.jpg',
      itemCount: 12,
      gender: 'women',
    });
  };

  const handleDeleteMood = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete tradition "${name}"?`)) {
      categoryService.deleteCategory(id);
      const idx = SILK_MOOD_IDS.indexOf(id);
      if (idx > -1) SILK_MOOD_IDS.splice(idx, 1);
      refreshMoods();
      toast(`Deleted tradition "${name}"`, 'info');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E8E3D9] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[#B39458] font-bold">
              Section 1 & 6 Management
            </span>
            <span className="text-[10px] bg-[#F4EEDF] text-[#9B7940] px-2 py-0.5 rounded-full font-semibold">
              {moods.length} Regional Silk Sanctuaries
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#24221E] mt-1">
            Six Moods of Silk
          </h1>
          <p className="text-xs md:text-sm text-[#77736C] mt-1">
            Configure Kanjivaram, Chanderi, Tussar, Paithani, Banarasi, and Pure Organza handloom showcases.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/storefront/frames?section=six-moods"
            className="flex items-center space-x-2 bg-[#FAF7F0] border border-[#B39458]/40 hover:bg-[#B39458]/10 text-[#9B7940] hover:text-[#24221E] text-xs font-semibold px-3.5 py-2.5 rounded-sm transition-colors"
          >
            <Layers className="w-4 h-4" />
            <span>Master Frames Engine</span>
          </Link>

          <button
            onClick={() => setIsAddingMood(true)}
            className="flex items-center space-x-2 bg-[#B39458] hover:bg-[#9B7940] text-white text-xs font-semibold px-4 py-2.5 rounded-sm transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Silk Tradition</span>
          </button>
        </div>
      </div>

      {/* Six Silk Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" suppressHydrationWarning>
        {moods.map((mood, idx) => (
          <div
            key={mood.id}
            className="luxury-card rounded-sm overflow-hidden flex flex-col justify-between group luxury-card-hover"
          >
            <div>
              <div className="relative aspect-4/3 overflow-hidden bg-[#F7F5F0]">
                <img
                  src={mood.image}
                  alt={mood.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 left-2.5 text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-[#B39458] text-white">
                  Tradition #{idx + 1}
                </span>
              </div>

              <div className="p-5 space-y-2">
                <h3 className="font-serif font-bold text-lg text-[#24221E]">{mood.name}</h3>
                <p className="text-xs font-medium text-[#9B7940] italic line-clamp-1">{mood.tagline}</p>
                <p className="text-xs text-[#77736C] leading-relaxed line-clamp-3">
                  {mood.description}
                </p>
              </div>
            </div>

            <div className="p-4 pt-2 border-t border-[#E8E3D9] flex items-center justify-between">
              <span className="text-xs text-[#24221E] font-semibold">
                {mood.itemCount} Designs Curated
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPreviewMood(mood)}
                  className="p-1.5 rounded hover:bg-[#F7F5F0] text-[#77736C] hover:text-[#24221E]"
                  title="Preview Tradition"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditingMood({ ...mood })}
                  className="p-1.5 rounded hover:bg-[#F7F5F0] text-[#B39458] hover:text-[#9B7940]"
                  title="Configure Tradition"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteMood(mood.id, mood.name)}
                  className="p-1.5 rounded hover:bg-[#FFF1F0] text-[#A63A3A]"
                  title="Delete Tradition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Tradition Modal */}
      {editingMood && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-lg max-w-2xl w-full border border-[#E8E3D9] shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#E8E3D9] p-5 pb-4 shrink-0 bg-white">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-[#B39458]" />
                <h2 className="text-xl font-serif font-bold text-[#24221E]">
                  Edit Tradition: {editingMood.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingMood(null)}
                className="p-1 rounded-full hover:bg-[#F7F5F0] text-[#77736C]"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#24221E] mb-1">Tradition Title</label>
                <input
                  type="text"
                  value={editingMood.name}
                  onChange={(e) => setEditingMood({ ...editingMood, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#E8E3D9] rounded focus:outline-none focus:border-[#B39458]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#24221E] mb-1">Poetic Subtitle / Tagline</label>
                <input
                  type="text"
                  value={editingMood.tagline}
                  onChange={(e) => setEditingMood({ ...editingMood, tagline: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#E8E3D9] rounded focus:outline-none focus:border-[#B39458]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#24221E] mb-1">Curatorial Story / Description</label>
                <textarea
                  rows={4}
                  value={editingMood.description}
                  onChange={(e) => setEditingMood({ ...editingMood, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#E8E3D9] rounded focus:outline-none focus:border-[#B39458]"
                />
              </div>

              <ImageUpload
                value={editingMood.image}
                onChange={(url) => setEditingMood({ ...editingMood, image: url })}
                label="Showcase Silk Image"
                helperText="Upload regional handloom image from device to Cloudinary"
                aspectRatio="video"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 p-4 border-t border-[#E8E3D9] shrink-0 bg-[#FAF9F5]">
              <button
                type="button"
                onClick={() => setEditingMood(null)}
                className="px-4 py-2 border border-[#E8E3D9] text-[#77736C] rounded hover:bg-[#F7F5F0] text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMood}
                className="luxury-button px-5 py-2 text-sm text-white flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Tradition Modal */}
      {isAddingMood && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-lg max-w-2xl w-full border border-[#E8E3D9] shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#E8E3D9] p-5 pb-4 shrink-0 bg-white">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-[#B39458]" />
                <h2 className="text-xl font-serif font-bold text-[#24221E]">
                  Add New Silk Tradition
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingMood(false)}
                className="p-1 rounded-full hover:bg-[#F7F5F0] text-[#77736C]"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#24221E] mb-1">Tradition Name *</label>
                <input
                  type="text"
                  value={newMood.name}
                  onChange={(e) => setNewMood({ ...newMood, name: e.target.value })}
                  placeholder="e.g. Muga Silk of Assam"
                  className="w-full px-3 py-2 text-sm border border-[#E8E3D9] rounded focus:outline-none focus:border-[#B39458]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#24221E] mb-1">Poetic Subtitle / Tagline</label>
                <input
                  type="text"
                  value={newMood.tagline}
                  onChange={(e) => setNewMood({ ...newMood, tagline: e.target.value })}
                  placeholder="e.g. Golden Wild Cocoon Weave"
                  className="w-full px-3 py-2 text-sm border border-[#E8E3D9] rounded focus:outline-none focus:border-[#B39458]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#24221E] mb-1">Curatorial Story / Description</label>
                <textarea
                  rows={4}
                  value={newMood.description}
                  onChange={(e) => setNewMood({ ...newMood, description: e.target.value })}
                  placeholder="Describe the regional heritage, loom techniques, and gold sheen..."
                  className="w-full px-3 py-2 text-sm border border-[#E8E3D9] rounded focus:outline-none focus:border-[#B39458]"
                />
              </div>

              <ImageUpload
                value={newMood.image}
                onChange={(url) => setNewMood({ ...newMood, image: url })}
                label="Showcase Silk Image"
                helperText="Upload regional handloom image from device to Cloudinary"
                aspectRatio="video"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 p-4 border-t border-[#E8E3D9] shrink-0 bg-[#FAF9F5]">
              <button
                type="button"
                onClick={() => setIsAddingMood(false)}
                className="px-4 py-2 border border-[#E8E3D9] text-[#77736C] rounded hover:bg-[#F7F5F0] text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateMood}
                className="luxury-button px-5 py-2 text-sm text-white flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Create Tradition</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Tradition Modal */}
      {previewMood && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4 border border-[#E8E3D9] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E8E3D9] pb-3">
              <h3 className="font-serif font-bold text-lg text-[#24221E]">{previewMood.name}</h3>
              <button
                onClick={() => setPreviewMood(null)}
                className="p-1 rounded-full hover:bg-[#F7F5F0] text-[#77736C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-4/3 rounded overflow-hidden">
              <img src={previewMood.image} alt={previewMood.name} className="w-full h-full object-cover" />
            </div>
            <p className="text-xs font-semibold text-[#B39458] italic">{previewMood.tagline}</p>
            <p className="text-xs text-[#77736C] leading-relaxed">{previewMood.description}</p>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setPreviewMood(null)}
                className="px-4 py-1.5 border border-[#E8E3D9] text-xs text-[#24221E] rounded hover:bg-[#F7F5F0]"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
