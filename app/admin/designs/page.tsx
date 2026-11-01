'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  UploadCloud,
  Loader2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Rocket,
  X,
  ImageIcon,
  RefreshCw,
} from 'lucide-react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { useStore } from '@/lib/store';
import { useAdminGuard } from '@/lib/useAdminGuard';
import { CATEGORY_NAMES, CATEGORY_PRESETS, DEFAULT_CATEGORY, buildProductFromDesign } from '@/lib/productPresets';

interface Design {
  id: string;
  fileName: string;
  imageUrl: string;
  storagePath: string;
  qikinkSku: string | null;
  publishedProductId: string | null;
  createdAt: string;
}

interface PublishDraft {
  title: string;
  category: string;
  price: string;
  originalPrice: string;
  qikinkSku: string;
}

const emptyDraft = (fileName: string): PublishDraft => {
  const preset = CATEGORY_PRESETS[DEFAULT_CATEGORY];
  const guessedTitle = fileName
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title: guessedTitle ? `HOTBEE ${guessedTitle}` : '',
    category: DEFAULT_CATEGORY,
    price: String(preset.suggestedPrice),
    originalPrice: String(preset.suggestedMrp),
    qikinkSku: '',
  };
};

const readLocalDesigns = (): Design[] => {
  try {
    const raw = localStorage.getItem('hotbee_local_designs');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalDesigns = (designs: Design[]) => {
  try {
    localStorage.setItem('hotbee_local_designs', JSON.stringify(designs));
  } catch {}
};

export default function AdminDesignsPage() {
  const { ready, checking } = useAdminGuard();
  const { refreshProducts, addProduct } = useStore();

  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(true);
  const [supabaseUnreachable, setSupabaseUnreachable] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'ok' | 'warn'; text: string } | null>(null);

  const [publishTarget, setPublishTarget] = useState<Design | null>(null);
  const [draft, setDraft] = useState<PublishDraft>(emptyDraft(''));
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDesigns = useCallback(async () => {
    try {
      const res = await fetch('/api/designs', { cache: 'no-store' });
      const data = await res.json();
      const local = readLocalDesigns();

      if (!res.ok) {
        setLoadError(data?.error || 'Could not load the design library.');
        setDesigns(local);
      } else {
        setConfigured(data.configured !== false);
        setSupabaseUnreachable(Boolean(data.unreachable));
        const remoteList: Design[] = Array.isArray(data.designs) ? data.designs : [];
        const remoteIds = new Set(remoteList.map((d) => d.id));
        const merged = [...remoteList, ...local.filter((l) => !remoteIds.has(l.id))];
        setDesigns(merged);
        setLoadError(data.error && !data.unreachable ? data.error : '');
      }
    } catch {
      const local = readLocalDesigns();
      setDesigns(local);
      setLoadError('');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ready) void loadDesigns();
  }, [ready, loadDesigns]);

  const uploadLocally = async (files: File[], reason?: string) => {
    try {
      const newLocalDesigns: Design[] = [];
      for (const file of files) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        newLocalDesigns.push({
          id: `local-art-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          fileName: file.name,
          imageUrl: dataUrl,
          storagePath: 'local',
          qikinkSku: null,
          publishedProductId: null,
          createdAt: new Date().toISOString(),
        });
      }

      const existing = readLocalDesigns();
      const updated = [...newLocalDesigns, ...existing];
      saveLocalDesigns(updated);
      setDesigns((prev) => [...newLocalDesigns, ...prev]);

      setNotice({
        tone: 'ok',
        text: `${newLocalDesigns.length} design${newLocalDesigns.length === 1 ? '' : 's'} saved to local vault! (Supabase is paused, so artwork was saved locally and is 100% ready to publish to store).`,
      });
    } catch {
      setNotice({ tone: 'warn', text: reason || 'Upload failed.' });
    }
  };

  const upload = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      if (list.length === 0) return;

      setUploading(true);
      setNotice(null);

      const form = new FormData();
      list.forEach((file) => form.append('files', file));

      try {
        const res = await fetch('/api/designs', { method: 'POST', body: form });
        const data = await res.json();

        if (res.ok && data?.uploaded?.length) {
          const okCount = data.uploaded.length;
          const failCount = data.failed?.length || 0;
          const failDetail = failCount
            ? ` ${failCount} skipped: ${data.failed.map((f: any) => `${f.fileName} (${f.reason})`).join(', ')}`
            : '';

          setNotice({
            tone: failCount ? 'warn' : 'ok',
            text: `${okCount} design${okCount === 1 ? '' : 's'} uploaded to Supabase.${failDetail}`,
          });

          await loadDesigns();
        } else {
          // If Supabase is unreachable or returned error, fall back to saving locally
          if (data?.unreachable || res.status === 502 || res.status === 503) {
            setSupabaseUnreachable(true);
          }
          await uploadLocally(list, data?.error || 'Supabase is unreachable.');
        }
      } catch {
        setSupabaseUnreachable(true);
        await uploadLocally(list, 'Network error. Artwork saved locally.');
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [loadDesigns]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files?.length) void upload(e.dataTransfer.files);
    },
    [upload]
  );

  const openPublish = (design: Design) => {
    setPublishTarget(design);
    setDraft({ ...emptyDraft(design.fileName), qikinkSku: design.qikinkSku || '' });
    setPublishError('');
  };

  const onCategoryChange = (category: string) => {
    const preset = CATEGORY_PRESETS[category];
    setDraft((prev) => ({
      ...prev,
      category,
      price: String(preset.suggestedPrice),
      originalPrice: String(preset.suggestedMrp),
    }));
  };

  const submitPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publishTarget) return;

    setPublishing(true);
    setPublishError('');

    const isLocalDesign =
      publishTarget.storagePath === 'local' ||
      publishTarget.id.startsWith('local-') ||
      supabaseUnreachable;

    if (isLocalDesign) {
      try {
        const product = buildProductFromDesign({
          imageUrl: publishTarget.imageUrl,
          title: draft.title,
          category: draft.category,
          price: Number(draft.price),
          originalPrice: Number(draft.originalPrice),
          qikinkSku: draft.qikinkSku || undefined,
        });

        const res = await addProduct(product);
        if (res.success) {
          const local = readLocalDesigns();
          const nextLocal = local.map((d) =>
            d.id === publishTarget.id ? { ...d, publishedProductId: product.id } : d
          );
          saveLocalDesigns(nextLocal);
          setDesigns((prev) =>
            prev.map((d) => (d.id === publishTarget.id ? { ...d, publishedProductId: product.id } : d))
          );
          setPublishTarget(null);
          setNotice({ tone: 'ok', text: `"${product.title}" is now published and live on the store!` });
          await refreshProducts();
        } else {
          setPublishError(res.message || 'Could not publish the product.');
        }
      } catch (err: any) {
        setPublishError(err?.message || 'Could not publish design.');
      } finally {
        setPublishing(false);
      }
      return;
    }

    try {
      const res = await fetch('/api/designs/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designId: publishTarget.id,
          title: draft.title,
          category: draft.category,
          price: Number(draft.price),
          originalPrice: Number(draft.originalPrice),
          qikinkSku: draft.qikinkSku,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        // Fall back to direct local publish
        const product = buildProductFromDesign({
          imageUrl: publishTarget.imageUrl,
          title: draft.title,
          category: draft.category,
          price: Number(draft.price),
          originalPrice: Number(draft.originalPrice),
          qikinkSku: draft.qikinkSku || undefined,
        });
        await addProduct(product);
        setPublishTarget(null);
        setNotice({
          tone: 'ok',
          text: `"${product.title}" published locally to store (Supabase was unreachable).`,
        });
        await refreshProducts();
      } else {
        setPublishTarget(null);
        setNotice({ tone: 'ok', text: `"${data.product.title}" is now live on the store.` });
        await Promise.all([loadDesigns(), refreshProducts()]);
      }
    } catch {
      const product = buildProductFromDesign({
        imageUrl: publishTarget.imageUrl,
        title: draft.title,
        category: draft.category,
        price: Number(draft.price),
        originalPrice: Number(draft.originalPrice),
        qikinkSku: draft.qikinkSku || undefined,
      });
      await addProduct(product);
      setPublishTarget(null);
      setNotice({
        tone: 'ok',
        text: `"${product.title}" published locally to store.`,
      });
      await refreshProducts();
    } finally {
      setPublishing(false);
    }
  };

  const removeDesign = async (design: Design) => {
    if (!window.confirm(`Delete "${design.fileName}" from the design library?`)) return;

    if (design.storagePath === 'local' || design.id.startsWith('local-')) {
      const local = readLocalDesigns();
      const updated = local.filter((d) => d.id !== design.id);
      saveLocalDesigns(updated);
      setDesigns((prev) => prev.filter((d) => d.id !== design.id));
      return;
    }

    try {
      const res = await fetch(
        `/api/designs?id=${encodeURIComponent(design.id)}&path=${encodeURIComponent(design.storagePath)}`,
        { method: 'DELETE' }
      );

      if (res.ok) {
        setDesigns((prev) => prev.filter((d) => d.id !== design.id));
      } else {
        const data = await res.json().catch(() => ({}));
        setNotice({ tone: 'warn', text: data?.error || 'Could not delete the design.' });
      }
    } catch {
      setNotice({ tone: 'warn', text: 'Network error deleting design.' });
    }
  };

  const stats = useMemo(
    () => ({
      total: designs.length,
      published: designs.filter((d) => d.publishedProductId).length,
    }),
    [designs]
  );

  if (checking || !ready) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-hotbee-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-5rem)]">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 space-y-6">

        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-hotbee-500/10 via-transparent to-transparent p-6 rounded-3xl border border-hotbee-500/20">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-hotbee-500/10 border border-hotbee-500/30 text-[10px] font-extrabold uppercase tracking-widest text-hotbee-400 mb-2">
              <ImageIcon className="w-3 h-3 text-hotbee-500" /> Asset Management
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Qikink</span> <span className="text-gradient-gold">Design Vault</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
              Drop high-resolution design artwork and mockups here. Publish them straight to the customer store with automatic category presets.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="glass-btn-primary px-5 py-2.5 rounded-2xl text-xs font-bold inline-flex items-center gap-2 shadow-glow-gold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60"
            >
              <UploadCloud className="w-4 h-4 text-black" />
              <span>Upload New Art</span>
            </button>
          </div>
        </header>

        {supabaseUnreachable && (
          <div className="glass-panel p-5 rounded-3xl border border-amber-500/40 bg-amber-500/10 text-xs text-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <span>Supabase Database is Paused or Unreachable</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Local Vault Active
              </span>
            </div>
            <p className="leading-relaxed text-gray-300">
              The database at <code className="bg-black/50 px-1.5 py-0.5 rounded text-amber-300 font-mono">https://ughdrvnjkccdtwdoxtrz.supabase.co</code> is currently not responding. Free-tier Supabase projects automatically pause after 7 days of inactivity.
            </p>
            <div className="bg-black/40 p-3.5 rounded-2xl border border-white/10 space-y-2">
              <p className="font-semibold text-white">How to restore in 60 seconds:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-400">
                <li>Log in to your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-hotbee-400 underline font-bold">Supabase Dashboard ↗</a></li>
                <li>Find your project and click <strong className="text-white">&quot;Restore&quot;</strong> or <strong className="text-white">&quot;Unpause project&quot;</strong></li>
                <li>Wait ~1 minute for the instance to restart, then click <strong className="text-white">Refresh</strong> below</li>
              </ol>
            </div>
            <p className="text-[11px] text-gray-400">
              ✨ <strong className="text-white">You can still upload art:</strong> Dropping files now will save them in your browser&apos;s local vault so you can publish products to your storefront right away without waiting.
            </p>
          </div>
        )}

        {!configured && !supabaseUnreachable && (
          <div className="glass-panel p-4 rounded-2xl border border-amber-500/40 text-xs text-amber-300 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <p>
              Supabase storage is not configured yet. Uploads will run in fallback mode. Add{' '}
              <code className="bg-black/40 px-1 py-0.5 rounded text-white font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
              <code className="bg-black/40 px-1 py-0.5 rounded text-white font-mono">SUPABASE_SERVICE_ROLE_KEY</code>, then run{' '}
              <code className="bg-black/40 px-1 py-0.5 rounded text-white font-mono">supabase/setup.sql</code>.
            </p>
          </div>
        )}

        {/* Upload dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`glass-panel card-shine rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all ${
            dragging
              ? 'border-hotbee-500 bg-hotbee-500/10 shadow-glow-gold'
              : 'border-white/10 hover:border-hotbee-500/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            multiple
            hidden
            onChange={(e) => e.target.files && upload(e.target.files)}
          />

          <div className="w-16 h-16 rounded-2xl bg-hotbee-500/10 border border-hotbee-500/30 text-hotbee-500 flex items-center justify-center mx-auto mb-4 shadow-glow-gold-sm">
            {uploading ? (
              <Loader2 className="w-7 h-7 animate-spin text-hotbee-500" />
            ) : (
              <UploadCloud className="w-7 h-7 text-hotbee-500" />
            )}
          </div>

          <h2 className="text-base font-extrabold text-white">
            {uploading ? 'Processing & Optimizing Artwork...' : 'Drag & Drop Artwork or Mockup Files Here'}
          </h2>
          <p className="text-xs text-gray-400 mt-1.5 max-w-md mx-auto leading-relaxed">
            Batch uploads supported. High-res PNG, JPG, WEBP, or AVIF up to 12 MB each.
          </p>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="glass-btn-secondary mt-5 px-6 py-2.5 rounded-2xl text-xs font-bold inline-flex items-center gap-2 hover:border-hotbee-500/50 shadow-glow-gold-sm transition-all disabled:opacity-60"
          >
            <ImageIcon className="w-4 h-4 text-hotbee-500" />
            <span>Browse Local Files</span>
          </button>
        </div>

        {notice && (
          <div
            role="status"
            className={`glass-panel p-4 rounded-2xl text-xs flex items-start gap-3 border ${
              notice.tone === 'ok'
                ? 'border-green-500/40 text-green-300'
                : 'border-amber-500/40 text-amber-300'
            }`}
          >
            {notice.tone === 'ok' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <p className="flex-1 leading-relaxed">{notice.text}</p>
            <button onClick={() => setNotice(null)} aria-label="Dismiss">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Library */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-extrabold text-white">
              Library{' '}
              <span className="text-gray-500 font-medium">
                ({stats.total} design{stats.total === 1 ? '' : 's'}, {stats.published} published)
              </span>
            </h2>
            <button
              onClick={() => loadDesigns()}
              className="glass-btn-secondary px-4 py-2 rounded-full text-xs font-bold inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {loadError && !supabaseUnreachable && (
            <div className="glass-panel p-4 rounded-2xl border border-red-500/40 text-xs text-red-300">
              {loadError}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-hotbee-surface/60 aspect-[4/5] animate-pulse" />
              ))}
            </div>
          ) : designs.length === 0 ? (
            <div className="glass-panel p-10 rounded-3xl text-center border border-hotbee-500/15">
              <ImageIcon className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-white">No designs uploaded yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Drop your Qikink mockups above and they will show up here instantly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {designs.map((design) => (
                <article
                  key={design.id}
                  className="glass-card card-shine rounded-3xl overflow-hidden border border-white/10 hover:border-hotbee-500/40 transition-all flex flex-col group shadow-glow-gold-sm"
                >
                  <div className="relative aspect-[4/5] bg-hotbee-darker overflow-hidden">
                    <Image
                      src={design.imageUrl}
                      alt={design.fileName}
                      fill
                      unoptimized={design.imageUrl.startsWith('data:')}
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {design.publishedProductId ? (
                      <span className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-glow-gold-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        LIVE
                      </span>
                    ) : (
                      <span className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md border border-white/10 text-gray-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        DRAFT
                      </span>
                    )}
                    {design.storagePath === 'local' && (
                      <span className="absolute top-2.5 right-2.5 bg-amber-500/20 backdrop-blur-md border border-amber-500/40 text-amber-300 text-[9px] font-bold px-2 py-0.5 rounded-full">
                        Local Vault
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-white font-bold line-clamp-1 break-all">
                        {design.fileName}
                      </p>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                        {design.qikinkSku || 'No SKU assigned'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {design.publishedProductId ? (
                        <Link
                          href={`/products/${design.publishedProductId}`}
                          className="glass-btn-secondary flex-1 py-2 rounded-xl text-[11px] font-bold text-center hover:border-hotbee-500/40 transition-colors"
                        >
                          View Store
                        </Link>
                      ) : (
                        <button
                          onClick={() => openPublish(design)}
                          className="glass-btn-primary flex-1 py-2 rounded-xl text-[11px] font-bold inline-flex items-center justify-center gap-1.5 shadow-glow-gold-sm hover:scale-[1.02] active:scale-[0.98] transition-transform"
                        >
                          <Rocket className="w-3.5 h-3.5 text-black" />
                          <span>Publish</span>
                        </button>
                      )}
                      <button
                        onClick={() => removeDesign(design)}
                        className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete design"
                        aria-label={`Delete ${design.fileName}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Publish modal */}
        {publishTarget && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Publish design to store"
          >
            <div className="glass-panel max-w-lg w-full p-5 sm:p-6 rounded-3xl relative border border-hotbee-500/30 space-y-4 my-8">
              <button
                onClick={() => setPublishTarget(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-4">
                <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-hotbee-darker shrink-0">
                  <Image
                    src={publishTarget.imageUrl}
                    alt={publishTarget.fileName}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="pr-8">
                  <h3 className="text-base font-extrabold text-white">Publish to store</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5 break-all">{publishTarget.fileName}</p>
                  <p className="text-[11px] text-hotbee-500 mt-1">
                    Fabric, sizes, colours and print type are filled in from the category.
                  </p>
                </div>
              </div>

              {publishError && (
                <div role="alert" className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                  {publishError}
                </div>
              )}

              <form onSubmit={submitPublish} className="space-y-3 text-xs">
                <div>
                  <label htmlFor="d-title" className="font-bold text-gray-300 block mb-1">
                    Product title *
                  </label>
                  <input
                    id="d-title"
                    type="text"
                    required
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    className="w-full glass-input rounded-xl px-3 py-2.5 text-xs"
                    placeholder="HOTBEE Neon Cyber Tee"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="d-category" className="font-bold text-gray-300 block mb-1">
                      Category *
                    </label>
                    <select
                      id="d-category"
                      value={draft.category}
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
                    <label htmlFor="d-sku" className="font-bold text-gray-300 block mb-1">
                      Qikink SKU
                    </label>
                    <input
                      id="d-sku"
                      type="text"
                      value={draft.qikinkSku}
                      onChange={(e) => setDraft({ ...draft, qikinkSku: e.target.value })}
                      className="w-full glass-input rounded-xl px-3 py-2.5 text-xs font-mono"
                      placeholder={CATEGORY_PRESETS[draft.category].skuHint}
                    />
                    <p className="text-[10px] text-gray-500 mt-1">
                      Needed so Qikink knows which garment to print. The size is appended per order.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="d-price" className="font-bold text-gray-300 block mb-1">
                      Selling price (₹) *
                    </label>
                    <input
                      id="d-price"
                      type="number"
                      min={1}
                      required
                      value={draft.price}
                      onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                      className="w-full glass-input rounded-xl px-3 py-2.5 text-xs"
                    />
                  </div>
                  <div>
                    <label htmlFor="d-mrp" className="font-bold text-gray-300 block mb-1">
                      Original MRP (₹)
                    </label>
                    <input
                      id="d-mrp"
                      type="number"
                      min={1}
                      value={draft.originalPrice}
                      onChange={(e) => setDraft({ ...draft, originalPrice: e.target.value })}
                      className="w-full glass-input rounded-xl px-3 py-2.5 text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={publishing}
                  className="glass-btn-primary w-full py-3 rounded-xl font-bold text-xs shadow-glow-gold inline-flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {publishing ? (
                    <>
                      <Loader2 className="w-4 h-4 text-black animate-spin" /> Publishing...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4 text-black" /> Publish to store
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
