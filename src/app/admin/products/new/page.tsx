'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Eye,
  UploadCloud,
  Trash2,
  Plus,
  Sparkles,
  Info,
  Check,
  Image as ImageIcon,
  HelpCircle,
  X,
  ExternalLink,
  Layers,
  Palette,
  Minus,
} from 'lucide-react';
import { formatINR } from '@/utils/formatters';
import { Product, ProductVariant, ColorVariant, SectionFrame, Category } from '@/types';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/collectionService';
import { INITIAL_CATEGORIES } from '@/data/categories';
import { SECTION_OPTIONS, sectionFrameService } from '@/services/sectionFrameService';
import { useToast } from '@/components/ui/Toast';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { MultipleImageUpload } from '@/components/admin/MultipleImageUpload';

const ROYAL_COLOR_PRESETS = [
  { name: 'Royal Crimson', hex: '#5A1725' },
  { name: 'Imperial Gold', hex: '#C7A15B' },
  { name: 'Emerald Green', hex: '#1C4D38' },
  { name: 'Midnight Sapphire', hex: '#18233C' },
  { name: 'Rani Pink', hex: '#C21E56' },
  { name: 'Ruby Red', hex: '#9B111E' },
  { name: 'Ivory Silk', hex: '#FAF7F0' },
  { name: 'Regal Purple', hex: '#4B1E5A' },
  { name: 'Terracotta Rust', hex: '#A44E28' },
  { name: 'Peacock Teal', hex: '#005F73' },
];

const PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size', 'Custom Bespoke'];

function AddProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);

  // Sync categories post-mount to avoid SSR hydration differences
  useEffect(() => {
    const loadedCats = categoryService.getCategories();
    if (loadedCats && loadedCats.length > 0) {
      setCategories(loadedCats);
    } else {
      categoryService.fetchCategories().then((res) => {
        if (res && res.length > 0) setCategories(res);
      }).catch(() => {});
    }
  }, []);

  // Active Tab in multi-section editor
  const [activeTab, setActiveTab] = useState<
    'general' | 'pricing' | 'images' | 'variants' | 'details' | 'seo'
  >('general');

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    slug: '',
    sku: '',
    tagline: '',
    description: '',
    shortDescription: '',
    category: 'bridal-lehengas',
    categoryName: 'Bridal Lehengas',
    collection: 'col-new-arrivals',
    gender: 'women',
    price: 150000,
    regularPrice: 175000,
    costPrice: 70000,
    discountPercent: 14,
    stock: 5,
    status: 'Published',
    featured: false,
    isNewArrival: true,
    isBestSeller: false,
    isBridal: false,
    homepageVisibility: true,
    sectionKey: '',
    sectionFrameId: '',
    badge: 'New Arrival',
    rating: 4.9,
    reviewsCount: 0,
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=70&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=70&w=800&auto=format&fit=crop',
    ],
    colors: [
      {
        name: 'Royal Crimson',
        hex: '#5A1725',
        imageIndex: 0,
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=70&w=800&auto=format&fit=crop',
      },
      {
        name: 'Imperial Gold',
        hex: '#C7A15B',
        imageIndex: 1,
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=70&w=800&auto=format&fit=crop',
      },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'Custom Bespoke'],
    variants: [
      { id: 'v-1', sku: 'MNR-NEW-01-S', size: 'S', color: 'Royal Crimson', price: 150000, stock: 2 },
      { id: 'v-2', sku: 'MNR-NEW-01-M', size: 'M', color: 'Royal Crimson', price: 150000, stock: 3 },
    ],
    fabric: 'Pure Mulberry Silk Velvet',
    weavingTechnique: 'Karchob Pitloom Embroidery',
    embroidery: 'Handcrafted Zardozi, Pota pearls, and 24K Gold-dipped Dabka',
    craftsmanshipStory: 'Meticulously crafted over 320 hours in the Awadh craft sanctum.',
    loomStory: 'Woven on non-electric wooden looms with certified 24K pure gold wire.',
    artisanInfo: 'Master karigar Ustad Rehmat Ali and guild.',
    careInstructions: [
      'Strictly Dry Clean Only by luxury couture specialist',
      'Store in provided breathable muslin bag away from direct sunlight',
    ],
    fitMeasurements: 'True to sovereign sizing. Custom measurements supported.',
    bespokeTailoring: true,
    metaTitle: 'New Sovereign Creation | MONARCH Haute Couture',
    metaDescription: 'Shop handcrafted Indian royal ethnic wear with certified 24K gold zari.',
    urlSlug: 'new-sovereign-creation',
  });

  // Section & Frame selection state
  const [availableFrames, setAvailableFrames] = useState<SectionFrame[]>([]);
  const [syncFrameVisuals, setSyncFrameVisuals] = useState<boolean>(true);

  // Prefill if editing
  useEffect(() => {
    if (editId) {
      const existing = productService.getProductById(editId);
      if (existing) {
        setFormData(existing);
        if (existing.sectionKey) {
          const frames = sectionFrameService.getFrames(existing.sectionKey);
          setAvailableFrames(frames);
        }
      }
    }
  }, [editId]);

  // Dynamically load frames whenever sectionKey changes
  useEffect(() => {
    if (!formData.sectionKey) {
      setAvailableFrames([]);
      return;
    }

    // 1. Synchronous read from cache / initial default frames
    const cachedFrames = sectionFrameService.getFrames(formData.sectionKey);
    setAvailableFrames(cachedFrames);

    // 2. Refresh asynchronously from backend
    sectionFrameService
      .fetchFrames(formData.sectionKey)
      .then((remote) => {
        if (remote && Array.isArray(remote) && remote.length > 0) {
          setAvailableFrames(remote);
        }
      })
      .catch(() => {});
  }, [formData.sectionKey]);

  // Selected frame reference for preview
  const selectedFrame = availableFrames.find(
    (f) => f.id === formData.sectionFrameId || (f as any)._id === formData.sectionFrameId
  );

  // Auto slug generation from name
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const categoryPrefix = (formData.category || 'ETH').slice(0, 3).toUpperCase();
    const autoSku = formData.sku || (name ? `MNR-${categoryPrefix}-${Date.now().toString().slice(-4)}` : '');
    setFormData((prev) => ({
      ...prev,
      name,
      slug,
      urlSlug: slug,
      sku: prev.sku || autoSku,
      metaTitle: `${name} | MONARCH Luxury`,
    }));
  };

  // Pricing calculations
  const handlePriceChange = (price: number) => {
    const regular = formData.regularPrice || price;
    const discount = regular > price ? Math.round(((regular - price) / regular) * 100) : 0;
    setFormData((prev) => ({
      ...prev,
      price,
      discountPercent: discount,
    }));
  };

  const handleRegularPriceChange = (regularPrice: number) => {
    const price = formData.price || regularPrice;
    const discount = regularPrice > price ? Math.round(((regularPrice - price) / regularPrice) * 100) : 0;
    setFormData((prev) => ({
      ...prev,
      regularPrice,
      discountPercent: discount,
    }));
  };

  // Image upload simulation
  const handleSimulateImageUpload = () => {
    const samples = [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=70&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=70&w=800&auto=format&fit=crop',
      '/images/moods/banarasi_brocade.jpg',
      '/images/moods/kanjivaram_silk.jpg',
    ];
    const nextImg = samples[formData.images?.length || 0] || samples[0];
    setFormData((prev) => ({
      ...prev,
      images: [...(prev.images || []), nextImg],
    }));
    toast('Image uploaded and preview generated', 'success');
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index),
    }));
  };

  // Active Colorway selection & inputs
  const [selectedColorIdx, setSelectedColorIdx] = useState<number>(0);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#5A1725');
  const [colorVariantSize, setColorVariantSize] = useState('M');
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [colorVariantStock, setColorVariantStock] = useState<number>(5);

  const activeColor: ColorVariant | null =
    formData.colors && formData.colors.length > 0
      ? formData.colors[selectedColorIdx < formData.colors.length ? selectedColorIdx : 0]
      : null;

  const activeColorVariants = (formData.variants || []).filter(
    (v) => activeColor && v.color.toLowerCase() === activeColor.name.toLowerCase()
  );

  const activeColorTotalPieces = activeColorVariants.reduce((sum, v) => sum + (v.stock || 0), 0);

  // Color management
  const handleAddColor = () => {
    if (!newColorName.trim()) {
      toast('Please enter a colourway name (e.g. Royal Rani Pink)', 'error');
      return;
    }
    const trimmed = newColorName.trim();
    const existing = (formData.colors || []).find(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (existing) {
      toast(`Colourway "${trimmed}" is already registered`, 'info');
      return;
    }
    const newColor: ColorVariant = {
      id: `col-${Date.now()}`,
      name: trimmed,
      hex: newColorHex,
      imageIndex: 0,
      image: '',
    };
    const updatedColors = [...(formData.colors || []), newColor];
    setFormData((prev) => ({
      ...prev,
      colors: updatedColors,
    }));
    setSelectedColorIdx(updatedColors.length - 1);
    setNewColorName('');
    toast(`Added "${trimmed}". You can now upload its image and set sizes & pieces.`, 'success');
  };

  const handleRemoveColor = (indexToRemove: number) => {
    if ((formData.colors?.length || 0) <= 1) {
      toast('Product must have at least one registered colourway', 'error');
      return;
    }
    const removedColor = formData.colors?.[indexToRemove];
    const updatedColors = (formData.colors || []).filter((_, i) => i !== indexToRemove);
    const updatedVariants = (formData.variants || []).filter(
      (v) => v.color.toLowerCase() !== removedColor?.name.toLowerCase()
    );
    const uniqueSizes = Array.from(new Set(updatedVariants.map((v) => v.size)));
    const totalStock = updatedVariants.reduce((sum, v) => sum + (v.stock || 0), 0);

    setFormData((prev) => ({
      ...prev,
      colors: updatedColors,
      variants: updatedVariants,
      sizes: uniqueSizes.length > 0 ? uniqueSizes : prev.sizes,
      stock: totalStock > 0 ? totalStock : prev.stock,
    }));

    setSelectedColorIdx((prev) => Math.min(prev, updatedColors.length - 1));
    toast(`Removed colourway "${removedColor?.name}"`, 'info');
  };

  // Color-specific image handlers
  const handleSetColorImage = (imageUrl: string) => {
    if (!activeColor) return;
    const masterImages = [...(formData.images || [])];
    let imgIndex = masterImages.indexOf(imageUrl);
    if (imgIndex === -1) {
      masterImages.push(imageUrl);
      imgIndex = masterImages.length - 1;
    }

    const currentIdx = selectedColorIdx < (formData.colors?.length || 0) ? selectedColorIdx : 0;
    const updatedColors = (formData.colors || []).map((col, idx) => {
      if (idx === currentIdx) {
        return {
          ...col,
          image: imageUrl,
          imageIndex: imgIndex,
        };
      }
      return col;
    });

    const updatedVariants = (formData.variants || []).map((v) => {
      if (v.color.toLowerCase() === activeColor.name.toLowerCase()) {
        return { ...v, image: imageUrl };
      }
      return v;
    });

    setFormData((prev) => ({
      ...prev,
      images: masterImages,
      colors: updatedColors,
      variants: updatedVariants,
    }));

    toast(`Assigned image for "${activeColor.name}" colourway`, 'success');
  };

  const handleRemoveColorImage = () => {
    if (!activeColor) return;
    const currentIdx = selectedColorIdx < (formData.colors?.length || 0) ? selectedColorIdx : 0;
    const updatedColors = (formData.colors || []).map((col, idx) => {
      if (idx === currentIdx) {
        return {
          ...col,
          image: '',
          imageIndex: 0,
        };
      }
      return col;
    });

    setFormData((prev) => ({
      ...prev,
      colors: updatedColors,
    }));

    toast(`Removed photo for "${activeColor.name}"`, 'info');
  };

  // Size & Stock pieces for the active colorway
  const handleAddColorSizeStock = () => {
    if (!activeColor) {
      toast('Please select or add a colourway first', 'error');
      return;
    }

    const chosenSize = (customSizeInput.trim() || colorVariantSize).trim();
    if (!chosenSize) {
      toast('Please choose or enter a size', 'error');
      return;
    }

    const pieces = Math.max(0, Math.floor(Number(colorVariantStock) || 0));
    const categoryPrefix = (formData.category || 'ETH').slice(0, 3).toUpperCase();
    const colorPrefix = activeColor.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase();
    const sizeClean = chosenSize.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const generatedSku = `${formData.sku || `MNR-${categoryPrefix}`}-${colorPrefix}-${sizeClean}`;

    const existingIdx = (formData.variants || []).findIndex(
      (v) =>
        v.color.toLowerCase() === activeColor.name.toLowerCase() &&
        v.size.toLowerCase() === chosenSize.toLowerCase()
    );

    let updatedVariants: ProductVariant[];
    if (existingIdx !== -1) {
      updatedVariants = [...(formData.variants || [])];
      updatedVariants[existingIdx] = {
        ...updatedVariants[existingIdx],
        stock: pieces,
        image: activeColor.image || updatedVariants[existingIdx].image,
      };
      toast(`Updated "${activeColor.name}" (${chosenSize}) to ${pieces} pieces`, 'success');
    } else {
      const newVariant: ProductVariant = {
        id: `var-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        sku: generatedSku,
        size: chosenSize,
        color: activeColor.name,
        price: formData.price || 150000,
        stock: pieces,
        image: activeColor.image,
      };
      updatedVariants = [...(formData.variants || []), newVariant];
      toast(`Added "${activeColor.name}" (${chosenSize}) with ${pieces} pieces`, 'success');
    }

    const allSizes = Array.from(new Set(updatedVariants.map((v) => v.size)));
    const totalStock = updatedVariants.reduce((sum, v) => sum + (v.stock || 0), 0);

    setFormData((prev) => ({
      ...prev,
      variants: updatedVariants,
      sizes: allSizes,
      stock: totalStock,
    }));

    setCustomSizeInput('');
  };

  const handleUpdateVariantStock = (variantId: string, delta: number) => {
    const updatedVariants = (formData.variants || []).map((v) => {
      if (v.id === variantId) {
        const nextStock = Math.max(0, (v.stock || 0) + delta);
        return { ...v, stock: nextStock };
      }
      return v;
    });
    const totalStock = updatedVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
    setFormData((prev) => ({
      ...prev,
      variants: updatedVariants,
      stock: totalStock,
    }));
  };

  const handleSetVariantStockDirect = (variantId: string, newStock: number) => {
    const clamped = Math.max(0, Math.floor(newStock || 0));
    const updatedVariants = (formData.variants || []).map((v) => {
      if (v.id === variantId) {
        return { ...v, stock: clamped };
      }
      return v;
    });
    const totalStock = updatedVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
    setFormData((prev) => ({
      ...prev,
      variants: updatedVariants,
      stock: totalStock,
    }));
  };

  const handleRemoveVariant = (variantId: string) => {
    const updatedVariants = (formData.variants || []).filter((v) => v.id !== variantId);
    const allSizes = Array.from(new Set(updatedVariants.map((v) => v.size)));
    const totalStock = updatedVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
    setFormData((prev) => ({
      ...prev,
      variants: updatedVariants,
      sizes: allSizes.length > 0 ? allSizes : prev.sizes,
      stock: totalStock,
    }));
    toast('Removed size variant', 'info');
  };

  // Save handler
  const handleSave = (status: 'Published' | 'Draft') => {
    if (!formData.name?.trim()) {
      toast('Please enter a product name', 'error');
      setActiveTab('general');
      return;
    }

    const finalSlug =
      formData.slug?.trim() ||
      formData.name
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') ||
      `product-${Date.now()}`;

    const categoryPrefix = (formData.category || 'ETH').slice(0, 3).toUpperCase();
    const finalSku =
      formData.sku?.trim() ||
      `MNR-${categoryPrefix}-${Date.now().toString().slice(-4)}`;

    const payload = {
      ...formData,
      slug: finalSlug,
      urlSlug: finalSlug,
      sku: finalSku,
      status,
      price: Number(formData.price) || 0,
      regularPrice: Number(formData.regularPrice) || Number(formData.price) || 0,
      costPrice: Number(formData.costPrice) || 0,
      stock: Number(formData.stock) || 0,
      categoryName:
        categories.find((c) => c.id === formData.category)?.name || formData.categoryName || 'Sarees',
    } as Product;

    let savedProduct: Product;
    if (editId) {
      savedProduct = productService.updateProduct(editId, payload);
      toast(`Updated product "${payload.name}" successfully`, 'success');
    } else {
      savedProduct = productService.createProduct(payload);
      toast(`Created product "${payload.name}" successfully`, 'success');
    }

    // Link chosen Section Frame to open this product directly when clicked
    if (formData.sectionFrameId) {
      const productLink = `/product/${savedProduct.id || savedProduct.slug}`;
      const updates: Partial<SectionFrame> = {
        ctaLink: productLink,
        actionHref: productLink,
      };

      if (syncFrameVisuals) {
        updates.title = savedProduct.name;
        if (savedProduct.images?.[0]) {
          updates.image = savedProduct.images[0];
        }
        if (savedProduct.price) {
          updates.price = savedProduct.price;
        }
        if (savedProduct.badge) {
          updates.badge = savedProduct.badge;
        }
      }

      try {
        sectionFrameService.updateFrame(formData.sectionFrameId, updates);
        toast(`Bound to homepage frame slot. Patrons clicking the frame will open this product.`, 'info');
      } catch (frameErr) {
        console.warn('Failed to update section frame link:', frameErr);
      }
    }

    setTimeout(() => {
      router.push('/admin/products');
    }, 600);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E8E3D9] pb-6">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-sm bg-white border border-[#E8E3D9] text-[#77736C] hover:text-[#24221E] hover:bg-[#F7F5F0] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#B39458] font-bold">
              {editId ? 'Edit Creation' : 'New Creation'}
            </span>
            <h1 className="text-2xl font-serif font-bold text-[#24221E]">
              {formData.name || 'Untitled Royal Ensemble'}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5">
          <Link
            href="/admin/products"
            className="px-3.5 py-2 text-xs font-medium rounded-sm border border-[#E8E3D9] bg-white text-[#77736C] hover:text-[#24221E] hover:bg-[#F7F5F0] transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={() => handleSave('Draft')}
            className="px-3.5 py-2 text-xs font-semibold rounded-sm border border-[#B39458] bg-[#F4EEDF] text-[#9B7940] hover:bg-[#EAE0CB] transition-colors"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave('Published')}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-sm bg-[#B39458] hover:bg-[#9B7940] text-white shadow-xs transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Publish Product</span>
          </button>
        </div>
      </div>

      {/* Grid: Editor Left (2 cols), Live Preview Right (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Multi-Tab Product Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Editor Tabs Navigation */}
          <div className="flex items-center space-x-1 overflow-x-auto border-b border-[#E8E3D9] pb-2 scrollbar-none">
            {[
              { id: 'general', label: '1. General Info' },
              { id: 'pricing', label: '2. Pricing' },
              { id: 'images', label: '3. Imagery & Colors' },
              { id: 'variants', label: '4. Variants Matrix' },
              { id: 'details', label: '5. Craft & Specs' },
              { id: 'seo', label: '6. SEO' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 text-xs font-medium rounded-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#24221E] text-[#F7F5F0] shadow-xs'
                    : 'text-[#77736C] hover:text-[#24221E] hover:bg-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: GENERAL INFORMATION */}
          {activeTab === 'general' && (
            <div className="luxury-card p-6 rounded-sm space-y-5 animate-in fade-in">
              <h3 className="font-serif font-bold text-base text-[#24221E] border-b border-[#E8E3D9] pb-3">
                General Product Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-[#24221E]">
                    Product Name <span className="text-[#A63A3A]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Gulnaar Embroidered Zardozi Lehenga"
                    className="w-full px-3.5 py-2.5 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:bg-white focus:outline-none focus:border-[#B39458]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#24221E]">Category</label>
                  <select
                    suppressHydrationWarning
                    value={formData.category}
                    onChange={(e) => {
                      const sel = categories.find((c) => c.id === e.target.value);
                      setFormData({
                        ...formData,
                        category: e.target.value,
                        categoryName: sel?.name || 'Sarees',
                      });
                    }}
                    className="w-full px-3.5 py-2.5 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:bg-white focus:outline-none focus:border-[#B39458]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.gender})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#24221E]">Gender Division</label>
                  <select
                    suppressHydrationWarning
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:bg-white focus:outline-none focus:border-[#B39458]"
                  >
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="unisex">Unisex / Heirloom</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#24221E]">Short Tagline</label>
                  <input
                    type="text"
                    value={formData.tagline || ''}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="e.g. Crimson Velvet & Hand-Beaded Zardozi with Pure Antique Gold Zari"
                    className="w-full px-3.5 py-2.5 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:bg-white focus:outline-none focus:border-[#B39458]"
                  />
                </div>

                {/* Storefront Homepage Section & Frame Assignment */}
                <div className="md:col-span-2 p-5 bg-[#FAF7F0] border border-[#B39458]/40 rounded-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E8E3D9] pb-3">
                    <div className="flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-[#B39458]" />
                      <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-[#24221E]">
                        Storefront Section &amp; Frame Placement
                      </h4>
                    </div>
                    <span className="text-[10px] text-[#9B7940] bg-[#F4EEDF] px-2 py-0.5 rounded font-mono font-semibold">
                      Direct Customer Link
                    </span>
                  </div>

                  <p className="text-xs text-[#77736C] leading-relaxed">
                    Choose a storefront section and section frame slot. When a customer clicks on this section frame on the storefront homepage, this product will open directly.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Input 1: Section Selector */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#24221E] flex items-center justify-between">
                        <span>1. Choose Section <span className="text-[#B39458]">*</span></span>
                        <span className="text-[10px] text-[#77736C] font-normal">Homepage Area</span>
                      </label>
                      <select
                        suppressHydrationWarning
                        value={formData.sectionKey || ''}
                        onChange={(e) => {
                          const newKey = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            sectionKey: newKey,
                            sectionFrameId: '',
                          }));
                        }}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#E8E3D9] rounded-sm text-xs font-medium text-[#24221E] focus:outline-none focus:border-[#B39458]"
                      >
                        <option value="">-- None (Do not attach to a section frame) --</option>
                        {SECTION_OPTIONS.map((sec) => (
                          <option key={sec.key} value={sec.key}>
                            {sec.name} ({sec.count} Frame Slots)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Input 2: Section Frame Selector */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#24221E] flex items-center justify-between">
                        <span>2. Choose Section Frame Slot <span className="text-[#B39458]">*</span></span>
                        <span className="text-[10px] text-[#77736C] font-normal">Target Frame</span>
                      </label>
                      <select
                        suppressHydrationWarning
                        value={formData.sectionFrameId || ''}
                        disabled={!formData.sectionKey}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            sectionFrameId: e.target.value,
                          }));
                        }}
                        className={`w-full px-3.5 py-2.5 rounded-sm text-xs font-medium focus:outline-none focus:border-[#B39458] ${
                          !formData.sectionKey
                            ? 'bg-[#EFECE6] text-[#A8A49C] border border-[#E8E3D9] cursor-not-allowed'
                            : 'bg-white border border-[#E8E3D9] text-[#24221E]'
                        }`}
                      >
                        <option value="">
                          {!formData.sectionKey
                            ? '-- Select a Section First --'
                            : availableFrames.length === 0
                            ? '-- No frames available for this section --'
                            : '-- Select Target Frame Slot --'}
                        </option>
                        {availableFrames.map((frame, index) => (
                          <option key={frame.id} value={frame.id}>
                            Slot #{frame.displayOrder || index + 1}: {frame.title} {frame.badge ? `[${frame.badge}]` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Selected Frame Confirmation & Visual Sync Card */}
                  {selectedFrame && (
                    <div className="p-3.5 bg-white border border-[#B39458]/30 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-14 rounded-xs overflow-hidden bg-[#F7F5F0] border border-[#E8E3D9] shrink-0">
                          <img
                            src={selectedFrame.image || formData.images?.[0] || '/images/moods/banarasi_brocade.jpg'}
                            alt={selectedFrame.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-[10px] uppercase font-bold tracking-wider text-[#B39458]">
                            Slot #{selectedFrame.displayOrder} • {selectedFrame.badge || 'Active Slot'}
                          </div>
                          <div className="text-xs font-serif font-bold text-[#24221E]">
                            {selectedFrame.title}
                          </div>
                          <div className="text-[11px] text-[#3E7B54] flex items-center space-x-1">
                            <span>✓ When clicked, opens:</span>
                            <code className="bg-[#FAF7F0] px-1 rounded text-[#24221E] font-mono text-[10px]">
                              /product/{formData.slug || 'product-slug'}
                            </code>
                          </div>
                        </div>
                      </div>

                      <label className="flex items-center space-x-2 text-xs text-[#24221E] cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={syncFrameVisuals}
                          onChange={(e) => setSyncFrameVisuals(e.target.checked)}
                          className="w-3.5 h-3.5 accent-[#B39458] rounded"
                        />
                        <span className="text-[11px] font-medium">Sync frame title, image &amp; price</span>
                      </label>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-[#24221E]">Editorial Description</label>
                  <textarea
                    rows={4}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Write evocative copy honoring the loom history, embroidery density, and silhouette..."
                    className="w-full p-3 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:bg-white focus:outline-none focus:border-[#B39458]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRICING */}
          {activeTab === 'pricing' && (
            <div className="luxury-card p-6 rounded-sm space-y-5 animate-in fade-in">
              <h3 className="font-serif font-bold text-base text-[#24221E] border-b border-[#E8E3D9] pb-3">
                Pricing & Economics
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#24221E]">
                    Retail Sale Price (INR ₹) <span className="text-[#A63A3A]">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.price || 0}
                    onChange={(e) => handlePriceChange(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-sm font-semibold text-[#24221E] focus:bg-white focus:outline-none focus:border-[#B39458]"
                  />
                  <span className="text-[11px] text-[#77736C]">
                    Displayed on storefront: {formatINR(formData.price || 0)}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#24221E]">
                    Original Price / MRP (INR ₹)
                  </label>
                  <input
                    type="number"
                    value={formData.regularPrice || 0}
                    onChange={(e) => handleRegularPriceChange(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-sm text-[#77736C] focus:bg-white focus:outline-none focus:border-[#B39458]"
                  />
                  <span className="text-[11px] text-[#77736C]">
                    Discount: {formData.discountPercent || 0}% Off
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#24221E]">
                    Atelier Handcraft Cost Price (INR ₹)
                  </label>
                  <input
                    type="number"
                    value={formData.costPrice || 0}
                    onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-sm text-[#24221E] focus:bg-white focus:outline-none focus:border-[#B39458]"
                  />
                  <span className="text-[11px] text-[#77736C]">
                    Gross Margin: ~
                    {formData.price && formData.costPrice
                      ? Math.round(((formData.price - formData.costPrice) / formData.price) * 100)
                      : 0}
                    %
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#24221E]">Total Vault Stock</label>
                  <input
                    type="number"
                    value={formData.stock || 0}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-sm text-[#24221E] focus:bg-white focus:outline-none focus:border-[#B39458]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCT IMAGERY & COLORWAYS */}
          {activeTab === 'images' && (
            <div className="space-y-6 animate-in fade-in">
              {/* CARD 1: COLORWAYS BAR & COLOR SELECTION */}
              <div className="luxury-card p-6 rounded-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E8E3D9] pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Palette className="w-4 h-4 text-[#B39458]" />
                      <h3 className="font-serif font-bold text-base text-[#24221E]">
                        1. Choose or Add Colourway
                      </h3>
                    </div>
                    <p className="text-xs text-[#77736C] mt-0.5">
                      Select a colourway below to upload its dedicated photos and set its sizes and pieces in stock.
                    </p>
                  </div>

                  <span className="text-xs bg-[#FAF7F0] border border-[#B39458]/30 text-[#9B7940] px-2.5 py-1 rounded font-semibold self-start sm:self-auto">
                    {formData.colors?.length || 0} Registered Colourways
                  </span>
                </div>

                {/* Colourway Pills / Buttons */}
                <div className="flex items-center flex-wrap gap-2.5">
                  {formData.colors?.map((col, idx) => {
                    const isSelected =
                      idx === (selectedColorIdx < (formData.colors?.length || 0) ? selectedColorIdx : 0);
                    const colorVariantsCount = (formData.variants || []).filter(
                      (v) => v.color.toLowerCase() === col.name.toLowerCase()
                    );
                    const totalPieces = colorVariantsCount.reduce((s, v) => s + (v.stock || 0), 0);

                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedColorIdx(idx)}
                        className={`group flex items-center space-x-2 pl-3 pr-2 py-2 rounded-full border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#24221E] text-white border-[#24221E] shadow-sm ring-2 ring-[#B39458]'
                            : 'bg-white text-[#24221E] border-[#E8E3D9] hover:border-[#B39458] hover:bg-[#FAF9F5]'
                        }`}
                      >
                        {/* Color Swatch Dot */}
                        <span
                          className="w-4 h-4 rounded-full border border-black/20 shrink-0 shadow-2xs"
                          style={{ backgroundColor: col.hex }}
                        />

                        {/* Color Name */}
                        <span className="font-medium">{col.name}</span>

                        {/* Image Indicator */}
                        {col.image ? (
                          <span
                            title="Has dedicated photo"
                            className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                              isSelected ? 'bg-[#3E7B54] text-white' : 'bg-[#EBF5ED] text-[#2D6A4F]'
                            }`}
                          >
                            ✓ Photo
                          </span>
                        ) : (
                          <span
                            title="No dedicated photo uploaded yet"
                            className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                              isSelected ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            No Photo
                          </span>
                        )}

                        {/* Stock Badge */}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-[#F7F5F0] text-[#77736C]'
                          }`}
                        >
                          {totalPieces} pcs
                        </span>

                        {/* Delete Button */}
                        {(formData.colors?.length || 0) > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveColor(idx);
                            }}
                            title="Remove this colourway"
                            className={`p-1 rounded-full transition-colors ${
                              isSelected
                                ? 'text-white/60 hover:text-white hover:bg-white/20'
                                : 'text-[#A8A49C] hover:text-[#A63A3A] hover:bg-red-50'
                            }`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Add New Colorway Form */}
                <div className="p-4 bg-[#FAF7F0] border border-[#B39458]/30 rounded-sm space-y-3">
                  <span className="text-xs font-bold text-[#24221E] flex items-center space-x-1.5">
                    <Plus className="w-3.5 h-3.5 text-[#B39458]" />
                    <span>Add Another Colourway</span>
                  </span>

                  {/* Preset Swatches */}
                  <div className="flex items-center flex-wrap gap-1.5">
                    <span className="text-[11px] text-[#77736C] mr-1">Royal Presets:</span>
                    {ROYAL_COLOR_PRESETS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => {
                          setNewColorName(p.name);
                          setNewColorHex(p.hex);
                        }}
                        title={p.name}
                        className="flex items-center space-x-1 px-2 py-1 bg-white border border-[#E8E3D9] hover:border-[#B39458] rounded-full text-[11px] transition-colors"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: p.hex }}
                        />
                        <span className="text-[#24221E]">{p.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Input fields */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newColorName}
                        onChange={(e) => setNewColorName(e.target.value)}
                        placeholder="Enter color name (e.g. Royal Rani Pink, Emerald Green, Maroon)"
                        className="w-full px-3.5 py-2.5 bg-white border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:outline-none focus:border-[#B39458]"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1.5 bg-white border border-[#E8E3D9] px-2.5 py-1.5 rounded-sm">
                        <input
                          type="color"
                          value={newColorHex}
                          onChange={(e) => setNewColorHex(e.target.value)}
                          className="w-7 h-7 p-0 border-0 rounded cursor-pointer"
                        />
                        <span className="text-xs font-mono text-[#77736C]">{newColorHex}</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddColor}
                        className="px-4 py-2.5 bg-[#B39458] hover:bg-[#9B7940] text-white text-xs font-semibold rounded-sm transition-colors shadow-xs flex items-center space-x-1.5 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Colourway</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 2: ACTIVE COLORWAY STUDIO (UPLOAD IMAGE + CHOOSE SIZES & PIECES) */}
              {activeColor && (
                <div className="luxury-card p-6 rounded-sm space-y-6 border-2 border-[#B39458]/40 bg-white">
                  {/* Active Color Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E8E3D9] pb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-6 h-6 rounded-full border border-black/20 shadow-xs shrink-0"
                        style={{ backgroundColor: activeColor.hex }}
                      />
                      <div>
                        <div className="text-[10px] uppercase font-bold tracking-wider text-[#B39458]">
                          Currently Configuring
                        </div>
                        <h3 className="font-serif font-bold text-lg text-[#24221E]">
                          {activeColor.name} Colourway
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 text-xs">
                      <span className="text-[#77736C]">
                        Total Allocated in {activeColor.name}:{' '}
                        <strong className="text-[#24221E] font-mono text-sm">{activeColorTotalPieces} pcs</strong>
                      </span>
                    </div>
                  </div>

                  {/* 2-Column Split: Left = Image for this Color, Right = Sizes & Pieces for this Color */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* LEFT: COLOR IMAGE UPLOAD (5 cols) */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[#24221E] flex items-center space-x-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-[#B39458]" />
                          <span>Photo for &quot;{activeColor.name}&quot;</span>
                        </label>
                        {activeColor.image && (
                          <span className="text-[10px] text-[#3E7B54] font-semibold bg-[#EBF5ED] px-2 py-0.5 rounded">
                            ✓ Photo Linked
                          </span>
                        )}
                      </div>

                      {/* If color has image */}
                      {activeColor.image ? (
                        <div className="space-y-3">
                          <div className="relative aspect-3/4 rounded-sm overflow-hidden bg-[#F7F5F0] border border-[#E8E3D9] group shadow-xs">
                            <img
                              src={activeColor.image}
                              alt={activeColor.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 flex items-center space-x-1.5 bg-black/75 text-white px-2.5 py-1 rounded-full text-[10px] font-medium backdrop-blur-xs">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: activeColor.hex }}
                              />
                              <span>{activeColor.name}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={handleRemoveColorImage}
                              className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 border border-red-200 text-[#A63A3A] hover:bg-red-50 text-xs font-semibold rounded-sm transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove Photo</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Color has no image yet -> Single Image Upload directly from device */
                        <div className="space-y-3">
                          <ImageUpload
                            value={activeColor.image || ''}
                            onChange={(url) => handleSetColorImage(url)}
                            label={`Upload ${activeColor.name} Image`}
                            helperText={`Upload high-res photo showing this ensemble in ${activeColor.name}. Max 25MB.`}
                            aspectRatio="portrait"
                          />
                        </div>
                      )}

                      {/* Quick Picker from existing product images */}
                      {(formData.images?.length || 0) > 0 && (
                        <div className="p-3 bg-[#FAF7F0] border border-[#E8E3D9] rounded-sm space-y-2">
                          <span className="text-[11px] font-semibold text-[#77736C]">
                            Or choose an existing product gallery photo for {activeColor.name}:
                          </span>
                          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                            {formData.images?.map((img, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSetColorImage(img)}
                                className={`relative w-12 h-16 rounded-xs overflow-hidden border-2 shrink-0 transition-all ${
                                  activeColor.image === img
                                    ? 'border-[#B39458] ring-1 ring-[#B39458]'
                                    : 'border-transparent opacity-70 hover:opacity-100 hover:border-[#E8E3D9]'
                                }`}
                              >
                                <img src={img} alt="" className="w-full h-full object-cover" />
                                {activeColor.image === img && (
                                  <span className="absolute bottom-0 inset-x-0 bg-[#B39458] text-white text-[8px] text-center font-bold">
                                    Selected
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* RIGHT: SIZES & PIECES (STOCK) FOR THIS COLOR (7 cols) */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="border-b border-[#E8E3D9] pb-2">
                        <label className="text-xs font-bold text-[#24221E] flex items-center space-x-1.5">
                          <Layers className="w-3.5 h-3.5 text-[#B39458]" />
                          <span>Sizes &amp; Pieces in Stock for &quot;{activeColor.name}&quot;</span>
                        </label>
                        <p className="text-[11px] text-[#77736C] mt-0.5">
                          Select the size and specify the quantity (pieces) in stock for this colourway.
                        </p>
                      </div>

                      {/* Add Size & Pieces Form */}
                      <div className="p-4 bg-[#FAF9F5] border border-[#E8E3D9] rounded-sm space-y-3">
                        {/* Quick Size Preset Chips */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-[#77736C]">
                            Choose Size:
                          </label>
                          <div className="flex items-center flex-wrap gap-1.5">
                            {PRESET_SIZES.map((sz) => (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => {
                                  setColorVariantSize(sz);
                                  setCustomSizeInput('');
                                }}
                                className={`px-2.5 py-1 text-xs rounded-sm border font-medium transition-colors ${
                                  (customSizeInput ? false : colorVariantSize === sz)
                                    ? 'bg-[#24221E] text-white border-[#24221E]'
                                    : 'bg-white text-[#24221E] border-[#E8E3D9] hover:border-[#B39458]'
                                }`}
                              >
                                {sz}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Custom Size Name & Pieces Input */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1">
                          <div className="sm:col-span-5 space-y-1">
                            <label className="text-[11px] font-semibold text-[#77736C]">
                              Custom Size (Optional)
                            </label>
                            <input
                              type="text"
                              value={customSizeInput}
                              onChange={(e) => setCustomSizeInput(e.target.value)}
                              placeholder="e.g. XXL, 3XL, Made to Order"
                              className="w-full px-3 py-2 bg-white border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:outline-none focus:border-[#B39458]"
                            />
                          </div>

                          <div className="sm:col-span-4 space-y-1">
                            <label className="text-[11px] font-semibold text-[#24221E]">
                              Pieces in Stock <span className="text-[#A63A3A]">*</span>
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={colorVariantStock}
                              onChange={(e) => setColorVariantStock(Number(e.target.value))}
                              className="w-full px-3 py-2 bg-white border border-[#E8E3D9] rounded-sm text-xs font-semibold text-[#24221E] focus:outline-none focus:border-[#B39458]"
                            />
                          </div>

                          <div className="sm:col-span-3 flex items-end">
                            <button
                              type="button"
                              onClick={handleAddColorSizeStock}
                              className="w-full py-2 bg-[#B39458] hover:bg-[#9B7940] text-white text-xs font-semibold rounded-sm transition-colors shadow-xs"
                            >
                              + Add Size
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Table of configured sizes for this colourway */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-[#24221E]">
                          <span>Configured Sizes for {activeColor.name} ({activeColorVariants.length})</span>
                          <span className="text-[#3E7B54] font-mono">{activeColorTotalPieces} total pieces</span>
                        </div>

                        {activeColorVariants.length === 0 ? (
                          <div className="p-6 text-center border border-dashed border-[#E8E3D9] rounded-sm bg-[#FAF7F0] space-y-1">
                            <p className="text-xs font-medium text-[#77736C]">
                              No sizes allocated for &quot;{activeColor.name}&quot; yet.
                            </p>
                            <p className="text-[11px] text-[#A8A49C]">
                              Select a size above and click &quot;+ Add Size&quot; to assign inventory pieces.
                            </p>
                          </div>
                        ) : (
                          <div className="border border-[#E8E3D9] rounded-sm overflow-hidden bg-white shadow-2xs">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-[#FAF9F5] border-b border-[#E8E3D9] text-[11px] text-[#77736C]">
                                <tr>
                                  <th className="p-2.5">Size</th>
                                  <th className="p-2.5">SKU</th>
                                  <th className="p-2.5">Pieces in Stock</th>
                                  <th className="p-2.5 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#E8E3D9]">
                                {activeColorVariants.map((v) => (
                                  <tr key={v.id} className="hover:bg-[#FAF9F5]/70 transition-colors">
                                    <td className="p-2.5">
                                      <span className="font-bold text-[#24221E] px-2 py-0.5 bg-[#FAF7F0] border border-[#E8E3D9] rounded">
                                        {v.size}
                                      </span>
                                    </td>
                                    <td className="p-2.5 font-mono text-[11px] text-[#77736C]">
                                      {v.sku}
                                    </td>
                                    <td className="p-2.5">
                                      <div className="flex items-center space-x-1.5">
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateVariantStock(v.id, -1)}
                                          className="w-6 h-6 rounded border border-[#E8E3D9] bg-[#F7F5F0] hover:bg-[#E8E3D9] text-xs font-bold flex items-center justify-center transition-colors"
                                        >
                                          -
                                        </button>
                                        <input
                                          type="number"
                                          min="0"
                                          value={v.stock}
                                          onChange={(e) => handleSetVariantStockDirect(v.id, Number(e.target.value))}
                                          className="w-14 px-1.5 py-0.5 text-center font-mono font-semibold text-xs border border-[#E8E3D9] rounded bg-white"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateVariantStock(v.id, 1)}
                                          className="w-6 h-6 rounded border border-[#E8E3D9] bg-[#F7F5F0] hover:bg-[#E8E3D9] text-xs font-bold flex items-center justify-center transition-colors"
                                        >
                                          +
                                        </button>
                                        <span className="text-[11px] text-[#77736C] ml-1">pcs</span>
                                      </div>
                                    </td>
                                    <td className="p-2.5 text-right">
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveVariant(v.id)}
                                        className="p-1 text-[#A8A49C] hover:text-[#A63A3A] hover:bg-red-50 rounded transition-colors"
                                        title="Delete size"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CARD 3: MASTER PRODUCT MEDIA GALLERY */}
              <div className="luxury-card p-6 rounded-sm space-y-4">
                <div className="border-b border-[#E8E3D9] pb-3">
                  <h4 className="font-serif font-bold text-sm text-[#24221E]">
                    Master Product Media Gallery
                  </h4>
                  <p className="text-xs text-[#77736C]">
                    All photos uploaded for colourways and editorial showcase. The first photo is the Sovereign Cover displayed on storefront catalogues.
                  </p>
                </div>

                <MultipleImageUpload
                  values={formData.images || []}
                  onChange={(urls) => {
                    setFormData((prev) => ({ ...prev, images: urls }));
                  }}
                  label="Editorial & Detail Photos"
                  helperText="Upload additional drape, zari close-up, and styling photos from device to Cloudinary (Max 8)."
                  maxImages={8}
                />
              </div>
            </div>
          )}

          {/* TAB 4: VARIANTS MATRIX */}
          {activeTab === 'variants' && (
            <div className="luxury-card p-6 rounded-sm space-y-5 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E8E3D9] pb-3">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#24221E]">
                    Colourways &amp; Sizing Inventory Matrix
                  </h3>
                  <p className="text-xs text-[#77736C] mt-0.5">
                    Consolidated inventory matrix across all colourways, sizes, SKUs, and stock pieces.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('images')}
                  className="text-xs font-semibold text-[#B39458] hover:text-[#9B7940] flex items-center space-x-1"
                >
                  <span>Configure in Imagery &amp; Colors Studio →</span>
                </button>
              </div>

              {/* Summary Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-[#FAF7F0] border border-[#E8E3D9] rounded-sm text-center">
                  <span className="text-[10px] uppercase font-bold text-[#77736C]">Total Colourways</span>
                  <div className="text-lg font-serif font-bold text-[#24221E]">
                    {formData.colors?.length || 0}
                  </div>
                </div>
                <div className="p-3 bg-[#FAF7F0] border border-[#E8E3D9] rounded-sm text-center">
                  <span className="text-[10px] uppercase font-bold text-[#77736C]">Distinct Sizes</span>
                  <div className="text-lg font-serif font-bold text-[#24221E]">
                    {formData.sizes?.length || 0}
                  </div>
                </div>
                <div className="p-3 bg-[#FAF7F0] border border-[#E8E3D9] rounded-sm text-center">
                  <span className="text-[10px] uppercase font-bold text-[#77736C]">Active Variants</span>
                  <div className="text-lg font-serif font-bold text-[#24221E]">
                    {formData.variants?.length || 0}
                  </div>
                </div>
                <div className="p-3 bg-[#FAF7F0] border border-[#B39458]/40 rounded-sm text-center">
                  <span className="text-[10px] uppercase font-bold text-[#B39458]">Total Vault Stock</span>
                  <div className="text-lg font-mono font-bold text-[#3E7B54]">
                    {formData.stock || 0} pcs
                  </div>
                </div>
              </div>

              {/* Master Matrix Table */}
              <div className="border border-[#E8E3D9] rounded-sm overflow-hidden bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF9F5] border-b border-[#E8E3D9] text-[11px] text-[#77736C]">
                    <tr>
                      <th className="p-2.5">Colourway</th>
                      <th className="p-2.5">Photo</th>
                      <th className="p-2.5">Size</th>
                      <th className="p-2.5">SKU</th>
                      <th className="p-2.5">Price</th>
                      <th className="p-2.5">Stock</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E3D9]">
                    {(!formData.variants || formData.variants.length === 0) ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-xs text-[#77736C]">
                          No variants registered yet. Switch to{' '}
                          <button
                            type="button"
                            onClick={() => setActiveTab('images')}
                            className="font-bold text-[#B39458] underline"
                          >
                            Tab 3 (Imagery &amp; Colors)
                          </button>{' '}
                          to select a colourway, upload photos, and allocate size pieces.
                        </td>
                      </tr>
                    ) : (
                      formData.variants.map((v) => {
                        const col = formData.colors?.find(
                          (c) => c.name.toLowerCase() === v.color.toLowerCase()
                        );
                        return (
                          <tr key={v.id} className="hover:bg-[#FAF9F5]/70 transition-colors">
                            <td className="p-2.5">
                              <div className="flex items-center space-x-2">
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                                  style={{ backgroundColor: col?.hex || '#B39458' }}
                                />
                                <span className="font-semibold text-[#24221E]">{v.color}</span>
                              </div>
                            </td>
                            <td className="p-2.5">
                              <div className="w-8 h-10 rounded-xs overflow-hidden bg-[#F7F5F0] border border-[#E8E3D9]">
                                <img
                                  src={v.image || col?.image || formData.images?.[0] || '/images/moods/banarasi_brocade.jpg'}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </td>
                            <td className="p-2.5">
                              <span className="font-bold text-[#24221E] px-2 py-0.5 bg-[#FAF7F0] border border-[#E8E3D9] rounded">
                                {v.size}
                              </span>
                            </td>
                            <td className="p-2.5 font-mono text-[11px] text-[#77736C]">
                              {v.sku}
                            </td>
                            <td className="p-2.5 text-[#24221E] font-medium">
                              {formatINR(v.price || formData.price || 0)}
                            </td>
                            <td className="p-2.5">
                              <div className="flex items-center space-x-1">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateVariantStock(v.id, -1)}
                                  className="w-5 h-5 rounded border border-[#E8E3D9] bg-[#F7F5F0] hover:bg-[#E8E3D9] text-xs font-bold flex items-center justify-center"
                                >
                                  -
                                </button>
                                <span className="w-10 text-center font-mono font-semibold text-[#3E7B54]">
                                  {v.stock}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateVariantStock(v.id, 1)}
                                  className="w-5 h-5 rounded border border-[#E8E3D9] bg-[#F7F5F0] hover:bg-[#E8E3D9] text-xs font-bold flex items-center justify-center"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="p-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveVariant(v.id)}
                                className="p-1 text-[#A8A49C] hover:text-[#A63A3A] hover:bg-red-50 rounded transition-colors"
                                title="Remove variant"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: CRAFT & SPECS */}
          {activeTab === 'details' && (
            <div className="luxury-card p-6 rounded-sm space-y-5 animate-in fade-in">
              <h3 className="font-serif font-bold text-base text-[#24221E] border-b border-[#E8E3D9] pb-3">
                Craftsmanship & Loom Pedigree
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#24221E]">Primary Fabric</label>
                  <input
                    type="text"
                    value={formData.fabric || ''}
                    onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                    placeholder="e.g. Mulberry Raw Silk & Gold Weft"
                    className="w-full px-3.5 py-2.5 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#24221E]">Weaving Technique</label>
                  <input
                    type="text"
                    value={formData.weavingTechnique || ''}
                    onChange={(e) => setFormData({ ...formData, weavingTechnique: e.target.value })}
                    placeholder="e.g. Authentic Korvai Handloom Weave Technique"
                    className="w-full px-3.5 py-2.5 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-[#24221E]">
                    Embroidery & Embellishments
                  </label>
                  <input
                    type="text"
                    value={formData.embroidery || ''}
                    onChange={(e) => setFormData({ ...formData, embroidery: e.target.value })}
                    placeholder="e.g. Handcrafted Zardozi, Pota pearls, and 24K Gold-dipped Dabka"
                    className="w-full px-3.5 py-2.5 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-[#24221E]">
                    Craftsmanship Story / Loom Narrative
                  </label>
                  <textarea
                    rows={3}
                    value={formData.craftsmanshipStory || ''}
                    onChange={(e) => setFormData({ ...formData, craftsmanshipStory: e.target.value })}
                    className="w-full p-3 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#24221E]">Master Artisan / Guild</label>
                  <input
                    type="text"
                    value={formData.artisanInfo || ''}
                    onChange={(e) => setFormData({ ...formData, artisanInfo: e.target.value })}
                    placeholder="e.g. Ustad Rehmat Ali, Awadh Guild"
                    className="w-full px-3.5 py-2.5 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#24221E]">Fit & Measurements</label>
                  <input
                    type="text"
                    value={formData.fitMeasurements || ''}
                    onChange={(e) => setFormData({ ...formData, fitMeasurements: e.target.value })}
                    placeholder="e.g. True to royal sizing. Full bespoke tailoring available."
                    className="w-full px-3.5 py-2.5 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SEO */}
          {activeTab === 'seo' && (
            <div className="luxury-card p-6 rounded-sm space-y-5 animate-in fade-in">
              <h3 className="font-serif font-bold text-base text-[#24221E] border-b border-[#E8E3D9] pb-3">
                Search Engine Architecture
              </h3>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#24221E]">Meta Title</label>
                  <input
                    type="text"
                    value={formData.metaTitle || ''}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#24221E]">Meta Description</label>
                  <textarea
                    rows={3}
                    value={formData.metaDescription || ''}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    className="w-full p-3 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
                  />
                </div>

                {/* Search Snippet Preview */}
                <div className="p-4 bg-[#F7F5F0] rounded-sm space-y-1 border border-[#E8E3D9]">
                  <span className="text-[10px] uppercase font-bold text-[#77736C]">
                    Google Search Snippet Preview
                  </span>
                  <div className="text-sm font-medium text-[#1A0DAB] hover:underline cursor-pointer">
                    {formData.metaTitle || `${formData.name} | MONARCH Luxury`}
                  </div>
                  <div className="text-[11px] text-[#006621]">
                    https://monarch-beta-two.vercel.app/product/{formData.urlSlug || 'product-slug'}
                  </div>
                  <div className="text-xs text-[#545454] line-clamp-2">
                    {formData.metaDescription || formData.description}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: LIVE PRODUCT PREVIEW CARD */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-[#77736C] flex items-center space-x-1.5">
              <Eye className="w-3.5 h-3.5 text-[#B39458]" />
              <span>Live Card Preview</span>
            </span>
            <span className="text-[10px] bg-[#E8E3D9] text-[#77736C] px-2 py-0.5 rounded font-mono">
              Storefront Mode
            </span>
          </div>

          {/* Storefront Card Simulation */}
          <div className="luxury-card rounded-sm overflow-hidden bg-white shadow-lg border border-[#E8E3D9]">
            <div className="relative aspect-3/4 overflow-hidden bg-[#F7F5F0]">
              <img
                src={
                  activeColor?.image ||
                  formData.images?.[0] ||
                  '/images/moods/banarasi_brocade.jpg'
                }
                alt={formData.name || 'Product'}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                {formData.badge && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#B39458] text-white shadow-xs">
                    {formData.badge}
                  </span>
                )}
                {formData.isNewArrival && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#24221E] text-white">
                    New Arrival
                  </span>
                )}
              </div>
              {activeColor && (
                <div className="absolute bottom-2 left-2 flex items-center space-x-1.5 bg-black/70 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-[10px]">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: activeColor.hex }}
                  />
                  <span>{activeColor.name}</span>
                </div>
              )}
            </div>

            <div className="p-4 space-y-2">
              <div className="text-[10px] uppercase font-bold tracking-widest text-[#B39458]">
                {formData.categoryName || 'Haute Couture'}
              </div>
              <h4 className="font-serif font-bold text-sm text-[#24221E] line-clamp-1">
                {formData.name || 'Ensemble Title'}
              </h4>
              <p className="text-xs text-[#77736C] line-clamp-2">
                {formData.tagline || formData.description}
              </p>

              {/* Color swatches in preview */}
              {formData.colors && formData.colors.length > 0 && (
                <div className="flex items-center space-x-1.5 pt-1">
                  {formData.colors.map((c, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedColorIdx(idx)}
                      title={`${c.name}${c.image ? ' (Has photo)' : ''}`}
                      className={`w-4 h-4 rounded-full border transition-all ${
                        idx === (selectedColorIdx < (formData.colors?.length || 0) ? selectedColorIdx : 0)
                          ? 'border-[#24221E] scale-125 ring-2 ring-[#B39458]'
                          : 'border-black/20 hover:scale-110'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                  <span className="text-[10px] text-[#77736C] ml-1 font-medium">
                    {activeColor?.name}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-[#E8E3D9] flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-[#24221E]">
                    {formatINR(formData.price || 0)}
                  </div>
                  {formData.regularPrice && formData.regularPrice > (formData.price || 0) && (
                    <div className="text-[10px] text-[#A8A49C] line-through">
                      {formatINR(formData.regularPrice)}
                    </div>
                  )}
                </div>
                <span className="text-[10px] px-2 py-1 bg-[#FAF7F0] text-[#9B7940] border border-[#B39458]/30 rounded font-semibold">
                  Bespoke Atelier
                </span>
              </div>
            </div>
          </div>

          {/* Homepage Section & Frame Assignment Status */}
          {formData.sectionKey && (
            <div className="p-3.5 bg-white border border-[#B39458]/40 rounded-sm shadow-xs space-y-2">
              <div className="flex items-center justify-between border-b border-[#E8E3D9] pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#B39458] flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#B39458]" />
                  <span>Homepage Frame Binding</span>
                </span>
                <span className="text-[9px] bg-[#3E7B54]/10 text-[#3E7B54] font-semibold px-2 py-0.5 rounded">
                  Live Action
                </span>
              </div>
              <div className="text-xs text-[#24221E] space-y-1">
                <div>
                  <span className="text-[#77736C]">Section: </span>
                  <span className="font-semibold">
                    {SECTION_OPTIONS.find((s) => s.key === formData.sectionKey)?.name || formData.sectionKey}
                  </span>
                </div>
                {selectedFrame ? (
                  <div>
                    <span className="text-[#77736C]">Frame Slot: </span>
                    <span className="font-semibold text-[#24221E]">{selectedFrame.title}</span>
                    <span className="text-[#77736C]"> (Slot #{selectedFrame.displayOrder})</span>
                  </div>
                ) : (
                  <div className="text-[11px] text-[#A63A3A] italic">
                    No frame slot chosen yet
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NewProductPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#77736C]">Loading Editor...</div>}>
      <AddProductForm />
    </Suspense>
  );
}
