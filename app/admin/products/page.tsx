'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Trash2,
  X,
  Package,
  Search,
  Loader2,
  Palette,
  AlertTriangle,
  Pencil,
  Save,
  UploadCloud,
  Link as LinkIcon,
  Plus,
  Check,
  Eye,
  Sparkles,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { AdminSidebar } from '@/components/AdminSidebar';
import { useAdminGuard } from '@/lib/useAdminGuard';
import { CATEGORY_NAMES, CATEGORY_PRESETS, buildProductFromDesign } from '@/lib/productPresets';
import { Product } from '@/lib/types';

interface Design {
  id: string;
  fileName: string;
  imageUrl: string;
  publishedProductId: string | null;
  qikinkSku: string | null;
}

export default function AdminProductsPage() {
  const { ready, checking } = useAdminGuard();
  const { products, productsLoading, addProduct, updateProduct, deleteProduct, catalogSource } = useStore();

  const [search, setSearch] = useState('');
  const [designs, setDesigns] = useState<Design[]>([]);
  const [designsLoading, setDesignsLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState<'upload' | 'url' | 'library'>('upload');
  const [selectedDesignId, setSelectedDesignId] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [uploadedDataUrl, setUploadedDataUrl] = useState('');
  const [fileNameHint, setFileNameHint] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: '',
    category: CATEGORY_NAMES[0],
    price: String(CATEGORY_PRESETS[CATEGORY_NAMES[0]].suggestedPrice),
    originalPrice: String(CATEGORY_PRESETS[CATEGORY_NAMES[0]].suggestedMrp),
    qikinkSku: '',
  });

  const [editing, setEditing] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const loadDesigns = useCallback(async () => {
    try {
      const res = await fetch('/api/designs', { cache: 'no-store' });
      const data = await res.json();
      setDesigns(Array.isArray(data?.designs) ? data.designs : []);
    } catch {
      setDesigns([]);
    } finally {
      setDesignsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ready) void loadDesigns();
  }, [ready, loadDesigns]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.qikink_id || '').toLowerCase().includes(q)
    );
  }, [products, search]);

  const onCategoryChange = (category: string) => {
    const preset = CATEGORY_PRESETS[category];
    setForm((prev) => ({
      ...prev,
      category,
      price: String(preset.suggestedPrice),
      originalPrice: String(preset.suggestedMrp),
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileNameHint(file.name);
    if (!form.title) {
      const guessedTitle = file.name
        .replace(/\.[^.]+$/, '')
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (c) => c.toUpperCase());
      if (guessedTitle) setForm((prev) => ({ ...prev, title: `HOTBEE ${guessedTitle}` }));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setUploadedDataUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const activePreviewImage = useMemo(() => {
    if (addMode === 'upload') return uploadedDataUrl;
    if (addMode === 'url') return customImageUrl;
    if (addMode === 'library') {
      const d = designs.find((item) => item.id === selectedDesignId);
      return d ? d.imageUrl : '';
    }
    return '';
  }, [addMode, uploadedDataUrl, customImageUrl, selectedDesignId, designs]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let finalImageUrl = activePreviewImage;

    if (!finalImageUrl) {
      if (addMode === 'upload') setError('Please select an image file to upload.');
      else if (addMode === 'url') setError('Please enter a valid image URL.');
      else setError('Please select a design from your library.');
      return;
    }

    if (!form.title.trim()) {
      setError('Please enter a product title.');
      return;
    }

    setBusy(true);
    const product = buildProductFromDesign({
      imageUrl: finalImageUrl,
      title: form.title,
      category: form.category,
      price: Number(form.price),
      originalPrice: Number(form.originalPrice),
      qikinkSku: form.qikinkSku || undefined,
    });

    const result = await addProduct(product);
    setBusy(false);

    if (result.success) {
      setShowAddModal(false);
      setSelectedDesignId('');
      setCustomImageUrl('');
      setUploadedDataUrl('');
      setFileNameHint('');
      setForm((prev) => ({ ...prev, title: '', qikinkSku: '' }));
    } else {
      setError(result.message || 'Could not save the product.');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    setBusy(true);
    setError('');

    const originalPrice = Math.max(editing.price, editing.originalPrice);
    const result = await updateProduct({
      ...editing,
      originalPrice,
      discountPercentage:
        originalPrice > editing.price
          ? Math.round(((originalPrice - editing.price) / originalPrice) * 100)
          : 0,
    });

    setBusy(false);
    if (result.success) setEditing(null);
    else setError(result.message || 'Could not update the product.');
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Remove "${product.title}" from the store?`)) return;
    const result = await deleteProduct(product.id);
    if (!result.success) setError(result.message || 'Could not delete the product.');
  };

  if (checking || !ready) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-hotbee-500 animate-spin" />
      </div>
    );
  }

  const unpublishedDesigns = designs.filter((d) => !d.publishedProductId);

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-5rem)]">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 space-y-6">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-hotbee-500/10 via-transparent to-transparent p-6 rounded-3xl border border-hotbee-500/20">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-hotbee-500/10 border border-hotbee-500/30 text-[10px] font-extrabold uppercase tracking-widest text-hotbee-400 mb-2">
              <Package className="w-3 h-3 text-hotbee-500" /> Catalog Management
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Product</span> <span className="text-gradient-gold">Inventory</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              {catalogSource === 'supabase' ? (
                <span className="text-emerald-400 font-medium">● Connected to Supabase DB — live on customer storefront.</span>
              ) : (
                <span className="text-amber-400/80 font-medium">● Operating in local in-memory fallback. Connect Supabase to sync.</span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
            <Link
              href="/admin/designs"
              className="glass-btn-secondary px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 flex-1 sm:flex-none justify-center hover:border-hotbee-500/40 transition-colors"
            >
              <Palette className="w-4 h-4 text-hotbee-500" />
              <span>Design Library</span>
            </Link>
            <button
              onClick={() => {
                setShowAddModal(true);
                setError('');
              }}
              className="glass-btn-primary px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-glow-gold hover:scale-[1.02] active:scale-[0.98] transition-all flex-1 sm:flex-none justify-center"
            >
              <Plus className="w-4 h-4 text-black stroke-[3]" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {error && (
          <div role="alert" className="glass-panel p-4 rounded-2xl border border-red-500/40 text-xs text-red-300 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <p className="flex-1">{error}</p>
            <button onClick={() => setError('')} aria-label="Dismiss">
              <X className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search by title, category, or Qikink SKU..."
              aria-label="Search products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full glass-input rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white border-white/10 focus:border-hotbee-500/50"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="font-mono text-hotbee-400 font-bold">{filtered.length}</span> products shown
          </div>
        </div>

        {productsLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-hotbee-surface/60 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-panel p-10 rounded-3xl text-center border border-hotbee-500/15">
            <Package className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-sm font-bold text-white">No products found</p>
            <p className="text-xs text-gray-400 mt-1">
              {search ? 'Try a different search.' : 'Publish a design to add your first product.'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile: cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden">
              {filtered.map((p) => (
                <article
                  key={p.id}
                  className="glass-card rounded-2xl p-3 border border-hotbee-500/15 flex gap-3"
                >
                  <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-hotbee-darker shrink-0">
                    <Image src={p.images[0]} alt={p.title} fill sizes="64px" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="text-xs font-bold text-white truncate">{p.title}</h3>
                    <p className="text-[10px] text-gray-400">{p.category}</p>
                    <p className="text-[10px] font-mono text-hotbee-500 truncate">
                      {p.qikink_id || 'NO SKU SET'}
                    </p>
                    <p className="text-sm font-extrabold text-white">₹{p.price.toLocaleString('en-IN')}</p>
                    <div className="flex gap-1 pt-1">
                      <button
                        onClick={() => setEditing(p)}
                        className="glass-btn-secondary px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-400"
                        aria-label={`Delete ${p.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden lg:block glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-glow-gold-sm">
              <table className="w-full text-xs text-left text-gray-300">
                <thead className="text-[10px] font-extrabold uppercase text-hotbee-400 bg-white/[0.02] border-b border-white/10">
                  <tr>
                    <th scope="col" className="py-3.5 px-4">Design</th>
                    <th scope="col" className="py-3.5 px-4">Title</th>
                    <th scope="col" className="py-3.5 px-4">Qikink SKU</th>
                    <th scope="col" className="py-3.5 px-4">Category</th>
                    <th scope="col" className="py-3.5 px-4">Price</th>
                    <th scope="col" className="py-3.5 px-4">Stock Status</th>
                    <th scope="col" className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="relative w-10 h-12 rounded-xl overflow-hidden bg-hotbee-darker border border-white/10">
                          <Image src={p.images[0]} alt={p.title} fill sizes="40px" className="object-cover" />
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white max-w-xs truncate">{p.title}</td>
                      <td className="py-3.5 px-4 font-mono">
                        {p.qikink_id ? (
                          <span className="text-hotbee-400 font-semibold">{p.qikink_id}</span>
                        ) : (
                          <span className="text-red-400 flex items-center gap-1 text-[11px]" title="Orders cannot be printed without a SKU">
                            <AlertTriangle className="w-3 h-3 shrink-0" /> not set
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-white/5 border border-white/10 text-gray-300">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-black text-white whitespace-nowrap">
                        ₹{p.price.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.inStock
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-white/5 text-gray-400 border border-white/10'
                          }`}
                        >
                          {p.inStock ? 'IN STOCK' : 'HIDDEN'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setEditing(p)}
                          className="p-2 text-gray-400 hover:text-hotbee-400 transition-colors"
                          title="Edit product"
                          aria-label={`Edit ${p.title}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                          title="Delete product"
                          aria-label={`Delete ${p.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Add Product Modal */}
        {showAddModal && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Add product"
          >
            <div className="glass-panel max-w-3xl w-full p-5 sm:p-6 rounded-3xl relative border border-hotbee-500/40 space-y-5 my-8">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="pr-8">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-hotbee-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Quick Add Product & Design
                </span>
                <h3 className="text-lg font-extrabold text-white mt-0.5">Add Product to Storefront</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Upload artwork, paste an image link, or pick from your Qikink design library.
                </p>
              </div>

              {/* Mode selector tabs */}
              <div className="flex rounded-2xl bg-hotbee-darker p-1 border border-hotbee-500/20 text-xs font-bold gap-1">
                <button
                  type="button"
                  onClick={() => setAddMode('upload')}
                  className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
                    addMode === 'upload' ? 'bg-hotbee-500 text-black font-extrabold shadow-md' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" /> Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setAddMode('url')}
                  className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
                    addMode === 'url' ? 'bg-hotbee-500 text-black font-extrabold shadow-md' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" /> Image URL
                </button>
                <button
                  type="button"
                  onClick={() => setAddMode('library')}
                  className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
                    addMode === 'library' ? 'bg-hotbee-500 text-black font-extrabold shadow-md' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" /> Design Library ({unpublishedDesigns.length})
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 text-xs">
                {/* Image input based on mode */}
                {addMode === 'upload' && (
                  <div>
                    <span className="font-bold text-gray-300 block mb-2">Select Design Image *</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer border-2 border-dashed border-hotbee-500/40 hover:border-hotbee-500 bg-hotbee-500/5 hover:bg-hotbee-500/10 rounded-2xl p-4 text-center transition-all flex flex-col items-center justify-center gap-2"
                    >
                      <UploadCloud className="w-8 h-8 text-hotbee-500" />
                      <p className="font-bold text-white">
                        {fileNameHint ? `Selected: ${fileNameHint}` : 'Click to choose image file from device'}
                      </p>
                      <p className="text-[10px] text-gray-400">Supports PNG, JPG, WEBP mockup files</p>
                    </div>
                  </div>
                )}

                {addMode === 'url' && (
                  <div>
                    <label htmlFor="p-url" className="font-bold text-gray-300 block mb-1">
                      Direct Image Web Link (URL) *
                    </label>
                    <input
                      id="p-url"
                      type="url"
                      placeholder="https://i.imgur.com/example.png or Qikink image link"
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      className="w-full glass-input rounded-xl px-3 py-2.5 text-xs"
                    />
                  </div>
                )}

                {addMode === 'library' && (
                  <div>
                    <span className="font-bold text-gray-300 block mb-2">Pick from uploaded designs *</span>
                    {designsLoading ? (
                      <div className="flex gap-2">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="w-20 h-24 rounded-xl bg-hotbee-surface/60 animate-pulse" />
                        ))}
                      </div>
                    ) : unpublishedDesigns.length === 0 ? (
                      <div className="p-4 rounded-xl bg-hotbee-surface/60 border border-hotbee-500/15 text-center">
                        <p className="text-gray-300 font-semibold">No unpublished designs found in library.</p>
                        <p className="text-[10px] text-gray-400 mt-1">Switch to &quot;Upload File&quot; tab above to add directly!</p>
                      </div>
                    ) : (
                      <div
                        role="radiogroup"
                        aria-label="Available designs"
                        className="flex gap-2 overflow-x-auto pb-2"
                      >
                        {unpublishedDesigns.map((d) => {
                          const isSelected = selectedDesignId === d.id;
                          return (
                            <button
                              type="button"
                              key={d.id}
                              role="radio"
                              aria-checked={isSelected}
                              onClick={() => {
                                setSelectedDesignId(d.id);
                                if (!form.title) {
                                  const name = d.fileName.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
                                  setForm((prev) => ({ ...prev, title: `HOTBEE ${name}` }));
                                }
                              }}
                              className={`relative w-20 h-24 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                                isSelected ? 'border-hotbee-500 ring-2 ring-hotbee-500/40' : 'border-transparent opacity-70 hover:opacity-100'
                              }`}
                              title={d.fileName}
                            >
                              <Image src={d.imageUrl} alt={d.fileName} fill sizes="80px" className="object-cover" />
                              {isSelected && (
                                <div className="absolute inset-0 bg-hotbee-500/20 flex items-center justify-center">
                                  <Check className="w-5 h-5 text-hotbee-500 drop-shadow-md stroke-[3]" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Form fields & live preview side by side */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="md:col-span-2 space-y-3">
                    <div>
                      <label htmlFor="p-title" className="font-bold text-gray-300 block mb-1">
                        Product title *
                      </label>
                      <input
                        id="p-title"
                        type="text"
                        required
                        placeholder="e.g. HOTBEE Neon Cyber Oversized Tee"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full glass-input rounded-xl px-3 py-2.5 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="p-category" className="font-bold text-gray-300 block mb-1">
                          Category Preset *
                        </label>
                        <select
                          id="p-category"
                          value={form.category}
                          onChange={(e) => onCategoryChange(e.target.value)}
                          className="w-full glass-input rounded-xl px-3 py-2.5 text-xs bg-hotbee-darker"
                        >
                          {CATEGORY_NAMES.map((name) => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="p-sku" className="font-bold text-gray-300 block mb-1 flex items-center justify-between">
                          <span>Qikink SKU</span>
                          <span className="text-[10px] text-hotbee-500 font-normal">Auto print code</span>
                        </label>
                        <input
                          id="p-sku"
                          type="text"
                          value={form.qikinkSku}
                          onChange={(e) => setForm({ ...form, qikinkSku: e.target.value })}
                          placeholder={CATEGORY_PRESETS[form.category].skuHint}
                          className="w-full glass-input rounded-xl px-3 py-2.5 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="p-price" className="font-bold text-gray-300 block mb-1">
                          Selling Price (₹) *
                        </label>
                        <input
                          id="p-price"
                          type="number"
                          min={1}
                          required
                          value={form.price}
                          onChange={(e) => setForm({ ...form, price: e.target.value })}
                          className="w-full glass-input rounded-xl px-3 py-2.5 text-xs font-bold text-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="p-mrp" className="font-bold text-gray-300 block mb-1">
                          Original MRP (₹)
                        </label>
                        <input
                          id="p-mrp"
                          type="number"
                          min={1}
                          value={form.originalPrice}
                          onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                          className="w-full glass-input rounded-xl px-3 py-2.5 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Live preview card */}
                  <div className="glass-card p-3 rounded-2xl border border-hotbee-500/20 flex flex-col justify-between space-y-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1 mb-2">
                        <Eye className="w-3 h-3 text-hotbee-500" /> Live Preview
                      </span>
                      <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden bg-hotbee-darker border border-hotbee-500/20">
                        {activePreviewImage ? (
                          <Image src={activePreviewImage} alt="Preview" fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center text-gray-500">
                            <UploadCloud className="w-6 h-6 mb-1 opacity-50" />
                            <span className="text-[10px]">No image selected</span>
                          </div>
                        )}
                        <span className="absolute top-2 left-2 bg-hotbee-500 text-black text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                          NEW
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white truncate mt-2">
                        {form.title || 'Product Title'}
                      </h4>
                      <p className="text-[10px] text-gray-400">{form.category}</p>
                    </div>

                    <div className="pt-1 border-t border-hotbee-500/10 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-gradient-gold">
                        ₹{Number(form.price || 0).toLocaleString('en-IN')}
                      </span>
                      {Number(form.originalPrice) > Number(form.price) && (
                        <span className="text-[10px] text-gray-500 line-through">
                          ₹{Number(form.originalPrice).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={busy || !activePreviewImage}
                  className="glass-btn-primary w-full py-3.5 rounded-xl font-extrabold text-xs shadow-glow-gold inline-flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {busy ? (
                    <>
                      <Loader2 className="w-4 h-4 text-black animate-spin" /> Publishing to Store...
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4 text-black" /> Save & Publish Product Live
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Edit modal */}
        {editing && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label={`Edit ${editing.title}`}
          >
            <div className="glass-panel max-w-lg w-full p-5 sm:p-6 rounded-3xl relative border border-hotbee-500/30 space-y-4 my-8">
              <button
                onClick={() => setEditing(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-base font-extrabold text-white pr-8">Edit product</h3>

              <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
                <div>
                  <label htmlFor="e-title" className="font-bold text-gray-300 block mb-1">Title</label>
                  <input
                    id="e-title"
                    type="text"
                    required
                    value={editing.title}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                    className="w-full glass-input rounded-xl px-3 py-2.5 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="e-price" className="font-bold text-gray-300 block mb-1">Price (₹)</label>
                    <input
                      id="e-price"
                      type="number"
                      min={1}
                      required
                      value={editing.price}
                      onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                      className="w-full glass-input rounded-xl px-3 py-2.5 text-xs"
                    />
                  </div>
                  <div>
                    <label htmlFor="e-mrp" className="font-bold text-gray-300 block mb-1">MRP (₹)</label>
                    <input
                      id="e-mrp"
                      type="number"
                      min={1}
                      value={editing.originalPrice}
                      onChange={(e) => setEditing({ ...editing, originalPrice: Number(e.target.value) })}
                      className="w-full glass-input rounded-xl px-3 py-2.5 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="e-sku" className="font-bold text-gray-300 block mb-1">
                    Qikink SKU
                  </label>
                  <input
                    id="e-sku"
                    type="text"
                    value={editing.qikink_id || ''}
                    onChange={(e) => setEditing({ ...editing, qikink_id: e.target.value })}
                    className="w-full glass-input rounded-xl px-3 py-2.5 text-xs font-mono"
                    placeholder="Required for Qikink to print this item"
                  />
                </div>

                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editing.inStock}
                    onChange={(e) => setEditing({ ...editing, inStock: e.target.checked })}
                    className="w-4 h-4 accent-hotbee-500"
                  />
                  <span className="font-bold text-gray-300">Visible and in stock on the storefront</span>
                </label>

                <button
                  type="submit"
                  disabled={busy}
                  className="glass-btn-primary w-full py-3 rounded-xl font-bold text-xs shadow-glow-gold inline-flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {busy ? (
                    <>
                      <Loader2 className="w-4 h-4 text-black animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-black" /> Save changes
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
