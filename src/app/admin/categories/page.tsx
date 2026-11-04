'use client';

import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Plus,
  Search,
  Edit,
  Trash2,
  Sparkles,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { Category } from '@/types';
import { categoryService } from '@/services/collectionService';
import { useToast } from '@/components/ui/Toast';
import { ImageUpload } from '@/components/admin/ImageUpload';

export default function CategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'women' | 'men'>('all');
  const [editModalCategory, setEditModalCategory] = useState<Partial<Category> | null>(null);

  useEffect(() => {
    categoryService
      .fetchCategories()
      .then((res) => {
        setCategories(res || []);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filtered = categories.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchGender = genderFilter === 'all' || c.gender === genderFilter;
    return matchSearch && matchGender;
  });

  const handleSaveCategory = () => {
    if (!editModalCategory?.name?.trim()) {
      toast('Please enter a category name', 'error');
      return;
    }

    if (editModalCategory.id) {
      categoryService.updateCategory(editModalCategory.id, editModalCategory);
      toast(`Category "${editModalCategory.name}" updated`, 'success');
    } else {
      const slug = editModalCategory.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      categoryService.createCategory({
        name: editModalCategory.name,
        slug: editModalCategory.slug || slug,
        gender: editModalCategory.gender || 'women',
        image:
          editModalCategory.image ||
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=70&w=600&auto=format&fit=crop',
        itemCount: 0,
        tagline: editModalCategory.tagline || 'Royal Indian Ethnic Wear',
        description: editModalCategory.description || '',
        status: 'Active',
      });
      toast(`Created category "${editModalCategory.name}"`, 'success');
    }

    setCategories(categoryService.getCategories());
    setEditModalCategory(null);
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (confirm(`Delete category "${name}"?`)) {
      categoryService.deleteCategory(id);
      setCategories(categoryService.getCategories());
      toast(`Category "${name}" deleted`, 'success');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E8E3D9] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[#B39458] font-bold">
              Catalog Architecture
            </span>
            <span className="text-[10px] bg-[#F4EEDF] text-[#9B7940] px-2 py-0.5 rounded-full font-semibold">
              {categories.length} Categories
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#24221E] mt-1">
            Product Categories
          </h1>
          <p className="text-xs md:text-sm text-[#77736C] mt-1">
            Organize bridal lehengas, silk sarees, sherwanis, and the Six Silk Moods.
          </p>
        </div>

        <button
          onClick={() =>
            setEditModalCategory({
              name: '',
              slug: '',
              gender: 'women',
              tagline: '',
              description: '',
              image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=70&w=600&auto=format&fit=crop',
              status: 'Active',
            })
          }
          className="flex items-center space-x-2 bg-[#B39458] hover:bg-[#9B7940] text-white text-xs font-semibold px-4 py-2.5 rounded-sm transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Search & Gender Filter */}
      <div className="bg-white p-4 rounded-sm border border-[#E8E3D9] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-[#A8A49C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories by name or tagline..."
            className="w-full pl-9 pr-4 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:bg-white focus:outline-none focus:border-[#B39458]"
          />
        </div>

        <div className="flex items-center space-x-2">
          {(['all', 'women', 'men'] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGenderFilter(g)}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${
                genderFilter === g
                  ? 'bg-[#B39458] text-white shadow-xs'
                  : 'bg-[#F7F5F0] text-[#77736C] hover:text-[#24221E]'
              }`}
            >
              {g === 'all' ? 'All Divisions' : g === 'women' ? "Women's" : "Men's"}
            </button>
          ))}
        </div>
      </div>

      {/* Categories Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" suppressHydrationWarning>
        {filtered.map((cat) => (
          <div
            key={cat.id}
            className="luxury-card rounded-sm overflow-hidden flex flex-col justify-between group luxury-card-hover"
          >
            <div>
              <div className="relative aspect-16/9 overflow-hidden bg-[#F7F5F0]">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/90 text-[#24221E]">
                    {cat.gender}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#3E7B54] text-white">
                    {cat.status}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-base text-[#24221E]">{cat.name}</h3>
                  <span className="text-xs font-semibold text-[#B39458]" suppressHydrationWarning>
                    {cat.itemCount} Designs
                  </span>
                </div>
                <p className="text-xs text-[#77736C] line-clamp-1 italic">{cat.tagline}</p>
                <p className="text-xs text-[#24221E] line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>
            </div>

            <div className="p-4 pt-2 border-t border-[#E8E3D9] flex items-center justify-between text-xs">
              <span className="text-[11px] font-mono text-[#A8A49C]">/{cat.slug}</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setEditModalCategory(cat)}
                  className="p-1.5 rounded hover:bg-[#F7F5F0] text-[#77736C] hover:text-[#B39458]"
                  title="Edit Category"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(cat.id, cat.name)}
                  className="p-1.5 rounded hover:bg-[#FFF1F0] text-[#77736C] hover:text-[#A63A3A]"
                  title="Delete Category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Category Modal */}
      {editModalCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white max-w-lg w-full rounded-sm shadow-2xl border border-[#E8E3D9] max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E8E3D9] p-5 pb-4 shrink-0 bg-white">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#B39458]">
                  {editModalCategory.id ? 'Edit Taxonomy' : 'New Taxonomy'}
                </span>
                <h3 className="font-serif font-bold text-lg text-[#24221E]">
                  {editModalCategory.id ? 'Edit Category' : 'Create Category'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditModalCategory(null)}
                className="p-1.5 rounded text-[#77736C] hover:text-[#24221E] hover:bg-[#F7F5F0] transition-colors"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#24221E]">Category Name</label>
                <input
                  type="text"
                  value={editModalCategory.name || ''}
                  onChange={(e) => setEditModalCategory({ ...editModalCategory, name: e.target.value })}
                  placeholder="e.g. Royal Brocade Sherwanis"
                  className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:outline-none focus:border-[#B39458]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#24221E]">Gender Division</label>
                  <select
                    value={editModalCategory.gender || 'women'}
                    onChange={(e) =>
                      setEditModalCategory({ ...editModalCategory, gender: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:outline-none focus:border-[#B39458]"
                  >
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="all">Unisex / All</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#24221E]">Status</label>
                  <select
                    value={editModalCategory.status || 'Active'}
                    onChange={(e) =>
                      setEditModalCategory({ ...editModalCategory, status: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:outline-none focus:border-[#B39458]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <ImageUpload
                value={editModalCategory.image || ''}
                onChange={(url) => setEditModalCategory({ ...editModalCategory, image: url })}
                label="Category Cover Image"
                helperText="Upload category cover image from your device directly to Cloudinary"
                aspectRatio="video"
              />

              <div className="space-y-1">
                <label className="font-semibold text-[#24221E]">Tagline</label>
                <input
                  type="text"
                  value={editModalCategory.tagline || ''}
                  onChange={(e) => setEditModalCategory({ ...editModalCategory, tagline: e.target.value })}
                  placeholder="e.g. Centered on 24K real gold kadwa pitloom weaves"
                  className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:outline-none focus:border-[#B39458]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#24221E]">Description</label>
                <textarea
                  rows={3}
                  value={editModalCategory.description || ''}
                  onChange={(e) =>
                    setEditModalCategory({ ...editModalCategory, description: e.target.value })
                  }
                  placeholder="Detailed description of the category..."
                  className="w-full p-2.5 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:outline-none focus:border-[#B39458]"
                />
              </div>
            </div>

            {/* Modal Footer (Sticky) */}
            <div className="flex items-center justify-end space-x-2 p-4 border-t border-[#E8E3D9] text-xs font-semibold shrink-0 bg-[#FAF9F5]">
              <button
                type="button"
                onClick={() => setEditModalCategory(null)}
                className="px-4 py-2 bg-white border border-[#E8E3D9] text-[#77736C] rounded-sm hover:bg-[#F7F5F0] hover:text-[#24221E] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCategory}
                className="px-5 py-2 bg-[#B39458] hover:bg-[#9B7940] text-white rounded-sm shadow-xs transition-colors font-medium"
              >
                {editModalCategory.id ? 'Save Changes' : 'Create Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
