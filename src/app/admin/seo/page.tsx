'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ExternalLink, EyeOff, RefreshCw, Save, Search } from 'lucide-react';
import { parseJsonSetting } from '@/lib/api';
import { fetchAdminSettings, saveAdminSettings } from '@/lib/admin-api';
import { SEO_PAGES, SeoEntry } from '@/lib/seo-pages';
import SeoFields from '@/components/admin/SeoFields';

// Admin > SEO: title and meta description for every fixed storefront page (settings.seo_pages).
// Products, categories, blog posts and CMS pages have their own SEO fields in their editors.
export default function AdminSeoPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [values, setValues] = useState<Record<string, SeoEntry>>({});
  const [open, setOpen] = useState<string | null>('/');

  useEffect(() => {
    fetchAdminSettings().then((s) => {
      const saved = parseJsonSetting<Record<string, Partial<SeoEntry>>>(s?.seo_pages, {});
      setValues(
        Object.fromEntries(SEO_PAGES.map((p) => [p.path, { title: saved[p.path]?.title || '', description: saved[p.path]?.description || '' }]))
      );
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      // Only non-empty overrides are stored; empty fields use the defaults
      const out: Record<string, Partial<SeoEntry>> = {};
      for (const [path, v] of Object.entries(values)) {
        const entry: Partial<SeoEntry> = {};
        if (v.title.trim()) entry.title = v.title.trim();
        if (v.description.trim()) entry.description = v.description.trim();
        if (entry.title || entry.description) out[path] = entry;
      }
      const res = await saveAdminSettings({ seo_pages: JSON.stringify(out) });
      if (res?.status !== 'success') throw new Error(res?.message || 'Save failed');
      setToast('SEO saved — live on the storefront.');
      setTimeout(() => setToast(''), 3500);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-xs text-stone-400">
        <RefreshCw className="h-4 w-4 animate-spin" /> Loading SEO settings…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-24">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-400">Storefront</span>
          <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">SEO Titles &amp; Descriptions</h1>
          <p className="mt-0.5 text-xs text-stone-400">
            The browser-tab title and Google description of every page. Leave a field empty to use the default shown in grey.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-primary-500 disabled:opacity-60"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save SEO
        </button>
      </div>

      {toast && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/40 bg-emerald-950/90 p-4 text-xs font-bold text-emerald-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" /> {toast}
        </div>
      )}

      <div className="rounded-2xl border border-stone-800 bg-stone-950 p-4 text-[11px] leading-relaxed text-stone-400">
        <p className="mb-1 font-bold text-stone-200">Other pages have SEO fields in their own editor:</p>
        Products → <Link href="/admin/products" className="text-primary-400 hover:underline">Product Offerings</Link> (edit a product) ·
        Category pages → <Link href="/admin/categories" className="text-primary-400 hover:underline">Product Categories</Link> ·
        Blog posts → <Link href="/admin/blogs" className="text-primary-400 hover:underline">Blog &amp; Articles</Link> ·
        Custom pages → <Link href="/admin/pages" className="text-primary-400 hover:underline">Pages &amp; Policy CMS</Link>
      </div>

      <div className="space-y-2">
        {SEO_PAGES.map((p) => {
          const v = values[p.path] || { title: '', description: '' };
          const expanded = open === p.path;
          const customized = Boolean(v.title.trim() || v.description.trim());
          return (
            <div key={p.path} className="rounded-2xl border border-stone-800 bg-stone-900/60">
              <button onClick={() => setOpen(expanded ? null : p.path)} className="flex w-full items-center gap-3 p-3 text-left">
                <Search className="h-4 w-4 flex-shrink-0 text-stone-500" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-xs font-bold text-white">
                    {p.label}
                    <span className="font-mono text-[10px] font-normal text-stone-500">{p.path}</span>
                  </p>
                  <p className="truncate text-[11px] text-stone-400">{v.title.trim() || p.title}</p>
                </div>
                {p.noindex && (
                  <span className="flex flex-shrink-0 items-center gap-1 rounded-full bg-stone-800 px-2 py-0.5 text-[10px] font-bold text-stone-400" title="Kept out of Google results">
                    <EyeOff className="h-3 w-3" /> not indexed
                  </span>
                )}
                <span
                  className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    customized ? 'bg-emerald-950 text-emerald-300' : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {customized ? 'Custom' : 'Default'}
                </span>
              </button>
              {expanded && (
                <div className="space-y-2 border-t border-stone-800 p-3">
                  <SeoFields
                    title={v.title}
                    description={v.description}
                    onChange={(patch) => setValues((all) => ({ ...all, [p.path]: { ...v, ...patch } }))}
                    defaultTitle={p.title}
                    defaultDescription={p.description}
                    urlPath={p.path}
                  />
                  {p.cmsSlug && (
                    <p className="text-[10px] text-stone-500">
                      Empty here = the meta title / description set on this page in Pages &amp; Policy CMS, else the default.
                    </p>
                  )}
                  <Link href={p.path} target="_blank" className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-400 hover:underline">
                    <ExternalLink className="h-3 w-3" /> Open page
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-4 right-4 z-30">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-full bg-primary-600 px-5 py-3 text-xs font-bold text-white shadow-2xl hover:bg-primary-500 disabled:opacity-60"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save SEO
        </button>
      </div>
    </div>
  );
}
