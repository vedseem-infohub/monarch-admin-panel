'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Edit,
  Eye,
  LayoutGrid,
  List,
  Sparkles,
  ArrowUpDown,
  CheckSquare,
  Square,
  AlertCircle,
  MoreVertical,
  Check,
  X,
  RefreshCw,
  Package,
} from 'lucide-react';
import { formatINR } from '@/utils/formatters';
import { Product } from '@/types';
import { productService } from '@/services/productService';
import { useToast } from '@/components/ui/Toast';

export default function ProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'name' | 'stock'>('newest');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteModalProduct, setDeleteModalProduct] = useState<Product | null>(null);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  useEffect(() => {
    productService
      .fetchProducts()
      .then((res) => {
        setProducts(res || []);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Unique categories for filter
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.categoryName));
    return Array.from(set);
  }, [products]);

  // Filtering & Sorting
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.fabric.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.categoryName === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      result = result.filter((p) => p.status === selectedStatus);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'stock') return a.stock - b.stock;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [products, search, selectedCategory, selectedStatus, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage]);

  // Bulk Selection
  const isAllSelected =
    paginatedProducts.length > 0 &&
    paginatedProducts.every((p) => selectedIds.includes(p.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !paginatedProducts.some((p) => p.id === id)));
    } else {
      const newIds = Array.from(new Set([...selectedIds, ...paginatedProducts.map((p) => p.id)]));
      setSelectedIds(newIds);
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Actions
  const handleDeleteConfirm = () => {
    if (deleteModalProduct) {
      productService.deleteProduct(deleteModalProduct.id);
      setProducts(productService.getProducts());
      toast(`Deleted "${deleteModalProduct.name}" from catalog`, 'success');
      setDeleteModalProduct(null);
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) {
      productService.bulkDeleteProducts(selectedIds);
      setProducts(productService.getProducts());
      setSelectedIds([]);
      toast(`Bulk deleted ${selectedIds.length} products`, 'success');
    }
  };

  const handleBulkStatus = (status: Product['status']) => {
    productService.bulkUpdateStatus(selectedIds, status);
    setProducts(productService.getProducts());
    toast(`Updated ${selectedIds.length} products to ${status}`, 'success');
    setSelectedIds([]);
  };

  const handleToggleFeatured = (product: Product) => {
    const updated = productService.updateProduct(product.id, { featured: !product.featured });
    setProducts(productService.getProducts());
    toast(
      updated.featured
        ? `Added "${product.name}" to Sovereign Highlights`
        : `Removed "${product.name}" from Sovereign Highlights`
    );
  };

  // CSV Export simulation
  const exportCSV = () => {
    const headers = ['ID', 'Name', 'SKU', 'Category', 'Price (INR)', 'Stock', 'Status', 'Fabric'];
    const rows = filteredProducts.map((p) => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.sku,
      p.categoryName,
      p.price,
      p.stock,
      p.status,
      `"${p.fabric.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `monarch_catalog_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast(`Exported ${filteredProducts.length} products to CSV`, 'success');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E8E3D9] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[#B39458] font-bold">
              Catalog Management
            </span>
            <span className="text-[10px] bg-[#F4EEDF] text-[#9B7940] px-2 py-0.5 rounded-full font-semibold">
              {filteredProducts.length} Items Listed
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#24221E] mt-1">
            All Sovereign Products
          </h1>
          <p className="text-xs md:text-sm text-[#77736C] mt-1">
            Manage handloom sarees, bespoke bridal lehengas, royal sherwanis, and vault creations.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={exportCSV}
            className="flex items-center space-x-2 bg-white hover:bg-[#F7F5F0] text-[#24221E] text-xs font-semibold px-3.5 py-2.5 rounded-sm border border-[#E8E3D9] transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#B39458]" />
            <span>Export CSV</span>
          </button>

          <Link
            href="/admin/products/new"
            className="flex items-center space-x-2 bg-[#B39458] hover:bg-[#9B7940] text-white text-xs font-semibold px-4 py-2.5 rounded-sm transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-sm border border-[#E8E3D9] shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#A8A49C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, SKU, or fabric..."
              className="w-full pl-9 pr-4 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] placeholder-[#A8A49C] focus:bg-white focus:outline-none focus:border-[#B39458] transition-colors"
            />
          </div>

          {/* Filters & Toggles */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:outline-none focus:border-[#B39458]"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:outline-none focus:border-[#B39458]"
            >
              <option value="all">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:outline-none focus:border-[#B39458]"
            >
              <option value="newest">Sort: Newest Drops</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name: Alphabetical</option>
              <option value="stock">Stock Level</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-[#E8E3D9] rounded-sm overflow-hidden bg-[#F7F5F0]">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 transition-colors ${
                  viewMode === 'table' ? 'bg-[#B39458] text-white' : 'text-[#77736C] hover:text-[#24221E]'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${
                  viewMode === 'grid' ? 'bg-[#B39458] text-white' : 'text-[#77736C] hover:text-[#24221E]'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Action Bar (when items selected) */}
        {selectedIds.length > 0 && (
          <div className="bg-[#FAF7EE] border border-[#B39458]/40 p-3 rounded-sm flex items-center justify-between animate-in fade-in">
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#24221E]">
              <span className="w-5 h-5 rounded-full bg-[#B39458] text-white flex items-center justify-center text-[10px]">
                {selectedIds.length}
              </span>
              <span>Ensembles Selected</span>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <button
                onClick={() => handleBulkStatus('Published')}
                className="px-2.5 py-1.5 bg-white border border-[#E8E3D9] hover:border-[#3E7B54] text-[#3E7B54] font-medium rounded-sm"
              >
                Publish All
              </button>
              <button
                onClick={() => handleBulkStatus('Archived')}
                className="px-2.5 py-1.5 bg-white border border-[#E8E3D9] hover:border-[#C98A2C] text-[#C98A2C] font-medium rounded-sm"
              >
                Archive All
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-2.5 py-1.5 bg-white border border-[#A63A3A] text-[#A63A3A] font-medium rounded-sm hover:bg-[#FFF5F5]"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content: Table or Grid */}
      {paginatedProducts.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-sm border border-[#E8E3D9]">
          <Package className="w-10 h-10 text-[#D0C9BD] mx-auto mb-3" />
          <h3 className="text-base font-serif font-bold text-[#24221E]">No Products Match Filter</h3>
          <p className="text-xs text-[#77736C] mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or clear the filters to view the complete catalog.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('all');
              setSelectedStatus('all');
            }}
            className="mt-4 px-3.5 py-2 bg-[#F7F5F0] hover:bg-[#E8E3D9] text-[#24221E] text-xs font-semibold rounded-sm transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-sm border border-[#E8E3D9] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E8E3D9] bg-[#FAF9F5] text-[11px] font-semibold text-[#77736C] uppercase tracking-wider">
                  <th className="py-3 px-4 w-10">
                    <button onClick={toggleSelectAll} className="flex items-center text-[#77736C]">
                      {isAllSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#B39458]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#A8A49C]" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-3">Ensemble</th>
                  <th className="py-3 px-3">SKU</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">Stock</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-center">Featured</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E3D9]/60 text-xs">
                {paginatedProducts.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  const isLowStock = p.stock <= 3;
                  const isOutOfStock = p.stock === 0;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-[#FAF9F5] transition-colors ${
                        isSelected ? 'bg-[#FAF7EE]' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => toggleSelectOne(p.id)}
                          className="flex items-center text-[#77736C]"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#B39458]" />
                          ) : (
                            <Square className="w-4 h-4 text-[#A8A49C]" />
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-14 rounded-xs overflow-hidden shrink-0 border border-[#E8E3D9] bg-[#F7F5F0]">
                            <img
                              src={p.images[0] || '/images/moods/banarasi_brocade.jpg'}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <span className="font-serif font-bold text-sm text-[#24221E] hover:text-[#B39458] block line-clamp-1">
                              {p.name}
                            </span>
                            <span className="text-[11px] text-[#77736C] line-clamp-1">
                              {p.fabric}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-medium text-[#77736C] text-[11px]">
                        {p.sku}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#F7F5F0] text-[#24221E] font-medium border border-[#E8E3D9]">
                          {p.categoryName}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-[#24221E]">{formatINR(p.price)}</div>
                        {p.regularPrice && p.regularPrice > p.price && (
                          <div className="text-[10px] text-[#A8A49C] line-through">
                            {formatINR(p.regularPrice)}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`font-semibold ${
                            isOutOfStock
                              ? 'text-[#A63A3A]'
                              : isLowStock
                              ? 'text-[#C98A2C]'
                              : 'text-[#3E7B54]'
                          }`}
                        >
                          {p.stock} units
                        </span>
                        {isLowStock && !isOutOfStock && (
                          <span className="text-[10px] text-[#C98A2C] block">Low Stock</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            p.status === 'Published'
                              ? 'bg-[#EBF5EE] text-[#3E7B54]'
                              : p.status === 'Draft'
                              ? 'bg-[#FFF8E6] text-[#C98A2C]'
                              : 'bg-[#F7F5F0] text-[#77736C]'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => handleToggleFeatured(p)}
                          className={`p-1 rounded transition-colors ${
                            p.featured ? 'text-[#B39458]' : 'text-[#D0C9BD] hover:text-[#B39458]'
                          }`}
                          title={p.featured ? 'Featured on Sovereign highlights' : 'Mark as featured'}
                        >
                          <Sparkles className="w-4 h-4 inline" />
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setPreviewProduct(p)}
                            className="p-1.5 rounded hover:bg-[#F7F5F0] text-[#77736C] hover:text-[#24221E]"
                            title="Quick Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/admin/products/new?edit=${p.id}`}
                            className="p-1.5 rounded hover:bg-[#F7F5F0] text-[#77736C] hover:text-[#B39458]"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteModalProduct(p)}
                            className="p-1.5 rounded hover:bg-[#FFF1F0] text-[#77736C] hover:text-[#A63A3A]"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {paginatedProducts.map((p) => (
            <div
              key={p.id}
              className="luxury-card rounded-sm overflow-hidden flex flex-col group luxury-card-hover"
            >
              <div className="relative aspect-3/4 overflow-hidden bg-[#F7F5F0]">
                <img
                  src={p.images[0] || '/images/moods/banarasi_brocade.jpg'}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-[#24221E] backdrop-blur-xs">
                    {p.categoryName}
                  </span>
                  {p.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#B39458] text-white">
                      {p.badge}
                    </span>
                  )}
                </div>
                <div className="absolute top-2.5 right-2.5">
                  <button
                    onClick={() => handleToggleFeatured(p)}
                    className={`p-1.5 rounded-full bg-white/90 backdrop-blur-xs transition-colors ${
                      p.featured ? 'text-[#B39458]' : 'text-[#A8A49C] hover:text-[#B39458]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="text-[10px] font-mono text-[#77736C]">{p.sku}</div>
                  <h3 className="font-serif font-bold text-sm text-[#24221E] line-clamp-1 mt-0.5">
                    {p.name}
                  </h3>
                  <p className="text-xs text-[#77736C] line-clamp-1 mt-1">{p.fabric}</p>
                </div>

                <div className="pt-2 border-t border-[#E8E3D9] flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-[#24221E]">{formatINR(p.price)}</div>
                    <span className="text-[10px] text-[#77736C]">{p.stock} in vault</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setPreviewProduct(p)}
                      className="p-1.5 rounded hover:bg-[#F7F5F0] text-[#77736C]"
                      title="Preview"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <Link
                      href={`/admin/products/new?edit=${p.id}`}
                      className="p-1.5 rounded hover:bg-[#F7F5F0] text-[#B39458]"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#77736C] pt-2">
        <div>
          Showing{' '}
          <strong className="text-[#24221E]">
            {filteredProducts.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
          </strong>{' '}
          to{' '}
          <strong className="text-[#24221E]">
            {Math.min(currentPage * pageSize, filteredProducts.length)}
          </strong>{' '}
          of <strong className="text-[#24221E]">{filteredProducts.length}</strong> creations
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-sm border border-[#E8E3D9] bg-white disabled:opacity-40 hover:bg-[#F7F5F0] text-[#24221E] transition-colors"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-8 h-8 rounded-sm font-semibold transition-colors ${
                currentPage === i + 1
                  ? 'bg-[#B39458] text-white'
                  : 'bg-white border border-[#E8E3D9] text-[#24221E] hover:bg-[#F7F5F0]'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-sm border border-[#E8E3D9] bg-white disabled:opacity-40 hover:bg-[#F7F5F0] text-[#24221E] transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white max-w-md w-full rounded-sm p-6 space-y-4 shadow-2xl border border-[#E8E3D9]">
            <div className="flex items-center space-x-3 text-[#A63A3A]">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-serif font-bold text-lg text-[#24221E]">
                Decommission Creation?
              </h3>
            </div>
            <p className="text-xs text-[#77736C] leading-relaxed">
              Are you sure you want to permanently remove{' '}
              <strong className="text-[#24221E]">{deleteModalProduct.name}</strong> (SKU:{' '}
              {deleteModalProduct.sku}) from the MONARCH catalog? This action will remove it from all
              collections and storefront portals.
            </p>
            <div className="pt-2 flex items-center justify-end space-x-3 text-xs font-semibold">
              <button
                onClick={() => setDeleteModalProduct(null)}
                className="px-4 py-2 bg-[#F7F5F0] hover:bg-[#E8E3D9] text-[#24221E] rounded-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-[#A63A3A] hover:bg-[#8B2626] text-white rounded-sm transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Preview Drawer/Modal */}
      {previewProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-end backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl overflow-y-auto p-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#E8E3D9] pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#B39458]">
                    Haute Couture Preview
                  </span>
                  <h2 className="text-xl font-serif font-bold text-[#24221E] mt-0.5">
                    {previewProduct.name}
                  </h2>
                  <span className="text-xs font-mono text-[#77736C]">SKU: {previewProduct.sku}</span>
                </div>
                <button
                  onClick={() => setPreviewProduct(null)}
                  className="p-2 rounded-sm text-[#77736C] hover:text-[#24221E] hover:bg-[#F7F5F0]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Image & Gallery */}
              <div className="space-y-3">
                <div className="aspect-4/3 rounded-sm overflow-hidden border border-[#E8E3D9] bg-[#F7F5F0]">
                  <img
                    src={previewProduct.images[0] || '/images/moods/banarasi_brocade.jpg'}
                    alt={previewProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {previewProduct.images.length > 1 && (
                  <div className="flex items-center space-x-2">
                    {previewProduct.images.map((img, i) => (
                      <div
                        key={i}
                        className="w-14 h-16 rounded-xs overflow-hidden border border-[#E8E3D9]"
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Price & Stock */}
              <div className="p-4 bg-[#FAF9F5] rounded-sm border border-[#E8E3D9] flex items-center justify-between">
                <div>
                  <div className="text-xl font-serif font-bold text-[#24221E]">
                    {formatINR(previewProduct.price)}
                  </div>
                  <div className="text-xs text-[#77736C]">
                    Cost Price: {formatINR(previewProduct.costPrice)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#3E7B54]">
                    {previewProduct.stock} Available in Vault
                  </span>
                  <span className="text-[10px] text-[#77736C] block">
                    Status: {previewProduct.status}
                  </span>
                </div>
              </div>

              {/* Details & Craftsmanship */}
              <div className="space-y-3 text-xs text-[#24221E]">
                <div>
                  <h4 className="font-semibold text-[#77736C] uppercase text-[10px] tracking-wider">
                    Description
                  </h4>
                  <p className="mt-1 leading-relaxed text-[#24221E]">
                    {previewProduct.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-2.5 bg-[#F7F5F0] rounded-sm">
                    <span className="text-[10px] text-[#77736C] uppercase block">Fabric</span>
                    <strong className="text-xs font-medium text-[#24221E]">{previewProduct.fabric}</strong>
                  </div>
                  <div className="p-2.5 bg-[#F7F5F0] rounded-sm">
                    <span className="text-[10px] text-[#77736C] uppercase block">Embroidery</span>
                    <strong className="text-xs font-medium text-[#24221E]">{previewProduct.embroidery}</strong>
                  </div>
                </div>

                {previewProduct.craftsmanshipStory && (
                  <div className="pt-2">
                    <h4 className="font-semibold text-[#77736C] uppercase text-[10px] tracking-wider">
                      Loom Story & Craftsmanship
                    </h4>
                    <p className="mt-1 leading-relaxed text-[#77736C] italic">
                      &ldquo;{previewProduct.craftsmanshipStory}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Action */}
            <div className="border-t border-[#E8E3D9] pt-4 flex items-center justify-between">
              <Link
                href={`/admin/products/new?edit=${previewProduct.id}`}
                className="px-4 py-2 bg-[#B39458] hover:bg-[#9B7940] text-white text-xs font-semibold rounded-sm transition-colors"
              >
                Open Full Editor
              </Link>
              <button
                onClick={() => setPreviewProduct(null)}
                className="px-4 py-2 bg-[#F7F5F0] text-[#24221E] text-xs font-medium rounded-sm"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
