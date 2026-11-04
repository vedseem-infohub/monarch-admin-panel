'use client';

import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Plus,
  Search,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { FAQItem } from '@/types';
import { contentService } from '@/services/contentService';
import { useToast } from '@/components/ui/Toast';

const PREDEFINED_CATEGORIES = [
  'Bespoke & Tailoring',
  'Authenticity & Hallmarks',
  'White-Glove Shipping',
  'Care & Preservation',
  'Returns & Alterations',
  'General Inquiries',
];

export default function AdminFaqsPage() {
  const { toast } = useToast();
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'Bespoke & Tailoring',
    customCategory: '',
    displayOrder: 1,
  });

  useEffect(() => {
    contentService
      .fetchFAQs()
      .then((items) => {
        setFaqs(items || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = Array.from(
    new Set([...PREDEFINED_CATEGORIES, ...faqs.map((f) => f.category)])
  );

  const filteredFaqs = faqs
    .filter((f) => {
      const matchSearch =
        f.question.toLowerCase().includes(search.toLowerCase()) ||
        f.answer.toLowerCase().includes(search.toLowerCase()) ||
        f.category.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === 'all' || f.category === categoryFilter;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const handleOpenAdd = () => {
    setEditingFaq(null);
    setFormData({
      question: '',
      answer: '',
      category: 'Bespoke & Tailoring',
      customCategory: '',
      displayOrder: faqs.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (faq: FAQItem) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      customCategory: '',
      displayOrder: faq.displayOrder || 1,
    });
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast('Please enter both question and answer', 'error');
      return;
    }

    const finalCategory =
      formData.category === 'CUSTOM'
        ? formData.customCategory.trim() || 'General'
        : formData.category;

    if (editingFaq) {
      // Update existing
      const updatedList = faqs.map((f) =>
        f.id === editingFaq.id
          ? {
              ...f,
              question: formData.question.trim(),
              answer: formData.answer.trim(),
              category: finalCategory,
              displayOrder: Number(formData.displayOrder) || 1,
            }
          : f
      );
      setFaqs(updatedList);
      contentService.saveAllFAQs(updatedList);
      toast('FAQ updated successfully', 'success');
    } else {
      // Add new
      const newFaq: FAQItem = {
        id: `faq-${Date.now()}`,
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        category: finalCategory,
        displayOrder: Number(formData.displayOrder) || faqs.length + 1,
      };
      const updatedList = [...faqs, newFaq];
      setFaqs(updatedList);
      contentService.saveAllFAQs(updatedList);
      toast('New FAQ added to registry', 'success');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this FAQ item?')) {
      const updatedList = faqs.filter((f) => f.id !== id);
      setFaqs(updatedList);
      contentService.saveAllFAQs(updatedList);
      toast('FAQ removed from storefront', 'info');
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredFaqs.length) return;

    const listCopy = [...faqs];
    const itemA = filteredFaqs[index];
    const itemB = filteredFaqs[targetIndex];

    const idxA = listCopy.findIndex((f) => f.id === itemA.id);
    const idxB = listCopy.findIndex((f) => f.id === itemB.id);

    // Swap displayOrder
    const tempOrder = itemA.displayOrder;
    itemA.displayOrder = itemB.displayOrder;
    itemB.displayOrder = tempOrder;

    listCopy[idxA] = { ...itemA };
    listCopy[idxB] = { ...itemB };

    setFaqs(listCopy);
    contentService.saveAllFAQs(listCopy);
    toast('FAQ display order updated', 'info');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E8E3D9] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[#B39458] font-bold">
              Content &amp; Guidance
            </span>
            <span className="text-[10px] bg-[#F4EEDF] text-[#9B7940] px-2 py-0.5 rounded-full font-semibold">
              {faqs.length} Frequently Asked Questions
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#24221E] mt-1">
            FAQ Management Editor
          </h1>
          <p className="text-xs md:text-sm text-[#77736C] mt-1">
            Curate guidance regarding silk authenticity, bespoke tailoring, climate dispatch, and care instructions shown on the storefront.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="http://localhost:3000/faqs"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-white border border-[#E8E3D9] rounded-sm text-xs font-semibold text-[#24221E] hover:bg-[#FAF9F5] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#B39458]" />
            <span>View Storefront</span>
          </a>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#B39458] hover:bg-[#9B7940] text-white rounded-sm text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New FAQ</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-sm border border-[#E8E3D9] shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#A8A49C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions, answers, or categories..."
            className="w-full pl-9 pr-4 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:bg-white focus:outline-none focus:border-[#B39458]"
          />
        </div>

        <div className="flex items-center flex-wrap gap-1.5">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${
              categoryFilter === 'all'
                ? 'bg-[#24221E] text-white'
                : 'bg-[#F7F5F0] text-[#77736C] hover:bg-[#E8E3D9]'
            }`}
          >
            All Categories ({faqs.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${
                categoryFilter === cat
                  ? 'bg-[#24221E] text-white'
                  : 'bg-[#F7F5F0] text-[#77736C] hover:bg-[#E8E3D9]'
              }`}
            >
              {cat} ({faqs.filter((f) => f.category === cat).length})
            </button>
          ))}
        </div>
      </div>

      {/* FAQs List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-sm border border-[#E8E3D9] space-y-3">
            <HelpCircle className="w-10 h-10 text-[#A8A49C] mx-auto" />
            <h3 className="text-base font-serif font-bold text-[#24221E]">No FAQs Found</h3>
            <p className="text-xs text-[#77736C] max-w-sm mx-auto">
              No frequently asked questions match your search or filter. Click &ldquo;Add New FAQ&rdquo; to create one.
            </p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#B39458] text-white text-xs font-semibold rounded-sm hover:bg-[#9B7940]"
            >
              <Plus className="w-4 h-4" />
              <span>Create First FAQ</span>
            </button>
          </div>
        ) : (
          filteredFaqs.map((faq, idx) => {
            const isExpanded = expandedFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white rounded-sm border border-[#E8E3D9] shadow-xs hover:border-[#B39458]/60 transition-all overflow-hidden"
              >
                <div className="p-4 sm:p-5 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-[#F7F5F0] border border-[#E8E3D9] flex items-center justify-center text-[10px] font-mono text-[#77736C] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] uppercase tracking-wider font-semibold bg-[#F4EEDF] text-[#9B7940] px-2 py-0.5 rounded">
                          {faq.category}
                        </span>
                        <span className="text-[10px] text-[#A8A49C] font-mono">
                          Order: #{faq.displayOrder || idx + 1}
                        </span>
                      </div>

                      <h3
                        onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                        className="font-serif text-base font-bold text-[#24221E] cursor-pointer hover:text-[#B39458] transition-colors"
                      >
                        {faq.question}
                      </h3>

                      <p
                        className={`text-xs text-[#77736C] leading-relaxed mt-2 font-sans ${
                          isExpanded ? '' : 'line-clamp-2'
                        }`}
                      >
                        {faq.answer}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleMove(idx, 'up')}
                      disabled={idx === 0}
                      title="Move Up"
                      className="p-1.5 text-[#77736C] hover:text-[#24221E] hover:bg-[#F7F5F0] rounded disabled:opacity-30"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMove(idx, 'down')}
                      disabled={idx === filteredFaqs.length - 1}
                      title="Move Down"
                      className="p-1.5 text-[#77736C] hover:text-[#24221E] hover:bg-[#F7F5F0] rounded disabled:opacity-30"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(faq)}
                      title="Edit FAQ"
                      className="p-1.5 text-[#B39458] hover:bg-[#FAF7F0] rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id)}
                      title="Delete FAQ"
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#E8E3D9] shadow-2xl max-w-lg w-full overflow-hidden animate-fadeIn">
            <div className="px-6 py-4 bg-[#141211] text-white flex items-center justify-between border-b border-[#2E2B26]">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#B39458]" />
                <h3 className="font-serif text-base font-bold tracking-wide">
                  {editingFaq ? 'Edit Frequently Asked Question' : 'Add New FAQ'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#A8A49C] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#24221E] mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, category: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:outline-none focus:border-[#B39458]"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="CUSTOM">+ Create New Category...</option>
                </select>

                {formData.category === 'CUSTOM' && (
                  <input
                    type="text"
                    value={formData.customCategory}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, customCategory: e.target.value }))
                    }
                    placeholder="Enter custom category name..."
                    required
                    className="w-full px-3 py-2 mt-2 bg-white border border-[#B39458] rounded-sm text-xs text-[#24221E] focus:outline-none"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#24221E] mb-1">
                  Question
                </label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, question: e.target.value }))
                  }
                  placeholder="e.g. How can I verify the authenticity of the zari and silk?"
                  required
                  className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:outline-none focus:border-[#B39458]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#24221E] mb-1">
                  Answer
                </label>
                <textarea
                  rows={5}
                  value={formData.answer}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, answer: e.target.value }))
                  }
                  placeholder="Provide comprehensive, royal guidance for the patron..."
                  required
                  className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:outline-none focus:border-[#B39458]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#24221E] mb-1">
                  Display Order Priority
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.displayOrder}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      displayOrder: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="w-24 px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:outline-none focus:border-[#B39458]"
                />
                <span className="text-[11px] text-[#77736C] ml-2">Lower number displays first</span>
              </div>

              <div className="pt-4 border-t border-[#E8E3D9] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#E8E3D9] text-[#77736C] hover:bg-[#F7F5F0] rounded-sm text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#B39458] hover:bg-[#9B7940] text-white rounded-sm text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingFaq ? 'Save Updates' : 'Add FAQ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

