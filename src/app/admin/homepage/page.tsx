'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDown, ArrowUp, CheckCircle2, ChevronDown, ChevronRight, ExternalLink, Eye, EyeOff,
  Image as ImageIcon, LayoutTemplate, Megaphone, Plus, RefreshCw, Save, Sparkles, Trash2, Upload,
} from 'lucide-react';
import {
  BannerContent, CraftPillar, HomeBlock, HomeBlockType, fetchHome, parseJsonSetting,
} from '@/lib/api';
import { fetchAdminSettings, saveAdminSettings, uploadAdminPhoto } from '@/lib/admin-api';

const BLOCK_LABELS: Record<HomeBlockType, string> = {
  hero: 'Hero Slider (edit slides in Settings)',
  categories: 'Category Tiles (carousel on mobile)',
  mid_banner: 'Mid Banner',
  bestsellers: 'Bestseller Products',
  promo_slider: 'Promo Banner Slider',
  category: 'Category Section',
  featured: 'Featured Products',
  craftsmanship: 'Craftsmanship / Why Us',
  reviews: 'Customer Reviews',
};
// Blocks with a product/review count and editable heading
const HAS_LIMIT: HomeBlockType[] = ['bestsellers', 'featured', 'category', 'reviews'];
const HAS_TEXT: HomeBlockType[] = ['categories', 'bestsellers', 'featured', 'category', 'craftsmanship', 'reviews'];

const TEXT_FIELDS: { key: string; label: string; textarea?: boolean; hint?: string }[] = [
  { key: 'announcement_text', label: 'Top announcement bar' },
  { key: 'announcement_badge', label: 'Announcement badge (right side)' },
  { key: 'whatsapp_number', label: 'WhatsApp number', hint: 'With country code, e.g. 919876543210 — used by every WhatsApp button' },
  { key: 'whatsapp_message', label: 'WhatsApp pre-filled message' },
  { key: 'support_phone', label: 'Support phone' },
  { key: 'support_email', label: 'Support email' },
  { key: 'support_hours', label: 'Support hours' },
  { key: 'store_address', label: 'Store address (Contact page)', textarea: true },
  { key: 'footer_about', label: 'Footer about text', textarea: true },
  { key: 'newsletter_text', label: 'Newsletter text', textarea: true },
  { key: 'newsletter_coupon', label: 'Coupon shown after newsletter signup', hint: 'Must exist in Admin > Coupons. Leave empty to show none.' },
  { key: 'footer_dispatch_note', label: 'Footer dispatch note' },
  { key: 'copyright_text', label: 'Copyright text' },
];

const input =
  'w-full rounded-xl border border-stone-800 bg-stone-900 px-3 py-2 text-xs text-white placeholder-stone-500 focus:border-primary-500 focus:outline-none';
const card = 'rounded-3xl border border-stone-800 bg-stone-950 p-5 sm:p-6';

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  return (
    <div>
      <label className="block text-[11px] font-bold text-stone-400 mb-1">{label}</label>
      <div className="flex gap-2">
        {value ? (
          <img src={value} alt="" className="h-9 w-14 flex-shrink-0 rounded-lg border border-stone-800 object-cover" />
        ) : (
          <span className="flex h-9 w-14 flex-shrink-0 items-center justify-center rounded-lg border border-stone-800 bg-stone-900">
            <ImageIcon className="h-4 w-4 text-stone-600" />
          </span>
        )}
        <input className={input} value={value} placeholder="/banners/... or upload" onChange={(e) => onChange(e.target.value)} />
        <label className="flex flex-shrink-0 cursor-pointer items-center gap-1 rounded-xl bg-stone-800 px-3 text-[11px] font-bold text-stone-200 hover:bg-stone-700">
          {uploading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setUploading(true);
              try {
                onChange(await uploadAdminPhoto(f));
              } catch (err) {
                alert(err instanceof Error ? err.message : 'Upload failed');
              } finally {
                setUploading(false);
                e.target.value = '';
              }
            }}
          />
        </label>
      </div>
    </div>
  );
}

export default function AdminHomepagePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [blocks, setBlocks] = useState<HomeBlock[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [midBanner, setMidBanner] = useState<BannerContent>({ enabled: true, image: '', link: '/shop' });
  const [promoSlides, setPromoSlides] = useState<BannerContent[]>([]);
  const [pillars, setPillars] = useState<CraftPillar[]>([]);
  const [texts, setTexts] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const [home, settings] = await Promise.all([fetchHome(true), fetchAdminSettings()]);
    setBlocks(home);
    setMidBanner(parseJsonSetting(settings.home_mid_banner, { enabled: true, image: '', link: '/shop' }));
    setPromoSlides(parseJsonSetting(settings.home_promo_slides, []));
    setPillars(parseJsonSetting(settings.home_craft_pillars, []));
    setTexts(Object.fromEntries(TEXT_FIELDS.map((f) => [f.key, String(settings[f.key] ?? '')])));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const updateBlock = (id: string, patch: Partial<HomeBlock>) =>
    setBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const save = async () => {
    setSaving(true);
    try {
      const layout = blocks.map(({ id, type, enabled, category_id, eyebrow, title, subtitle, limit }) => ({
        id, type, enabled, category_id, eyebrow, title, subtitle, limit,
      }));
      const res = await saveAdminSettings({
        home_layout: JSON.stringify(layout),
        home_mid_banner: JSON.stringify(midBanner),
        home_promo_slides: JSON.stringify(promoSlides.filter((s) => s.image)),
        home_craft_pillars: JSON.stringify(pillars.filter((p) => p.title.trim())),
        ...texts,
      });
      if (res?.status !== 'success') throw new Error(res?.message || 'Save failed');
      setToast('Homepage saved — changes are live on the storefront.');
      setTimeout(() => setToast(''), 3500);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-stone-400 text-xs gap-2">
        <RefreshCw className="h-4 w-4 animate-spin" /> Loading homepage…
      </div>
    );
  }

  const blockName = (b: HomeBlock) =>
    b.type === 'category' ? `${b.category?.name || 'Category'} — Category Section` : BLOCK_LABELS[b.type];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-400">Storefront</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Homepage Manager</h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Order, show/hide and edit every homepage section, banners, and site-wide contact texts.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 rounded-xl border border-stone-800 px-4 py-2.5 text-xs font-bold text-stone-300 hover:bg-stone-900"
          >
            <ExternalLink className="h-4 w-4" /> View Store
          </Link>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-primary-500 disabled:opacity-60"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Homepage
          </button>
        </div>
      </div>

      {toast && (
        <div className="rounded-2xl bg-emerald-950/90 border border-emerald-500/40 p-4 text-xs font-bold text-emerald-200 flex items-center gap-2.5">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" /> {toast}
        </div>
      )}

      {/* Sections */}
      <div className={card}>
        <h3 className="font-bold text-base text-white flex items-center gap-2">
          <LayoutTemplate className="h-4 w-4 text-primary-400" /> Homepage Sections
        </h3>
        <p className="text-xs text-stone-400 mt-0.5 mb-4">
          Top to bottom = order on the homepage. New categories are added automatically; a category section with no
          products stays hidden. Leave a category&apos;s title empty to use the category name.
        </p>
        <div className="space-y-2">
          {blocks.map((b, i) => {
            const expanded = open === b.id;
            const productCount = b.type === 'category' ? b.category?.product_count ?? 0 : null;
            return (
              <div key={b.id} className={`rounded-2xl border ${b.enabled ? 'border-stone-800 bg-stone-900/60' : 'border-stone-800/60 bg-stone-900/20'}`}>
                <div className="flex items-center gap-2 p-3">
                  <div className="flex flex-col">
                    <button onClick={() => setBlocks(move(blocks, i, i - 1))} disabled={i === 0} className="p-0.5 text-stone-500 hover:text-white disabled:opacity-20" title="Move up">
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setBlocks(move(blocks, i, i + 1))} disabled={i === blocks.length - 1} className="p-0.5 text-stone-500 hover:text-white disabled:opacity-20" title="Move down">
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => setOpen(expanded ? null : b.id)}
                    className="flex flex-1 min-w-0 items-center gap-2 text-left"
                    disabled={!HAS_TEXT.includes(b.type) && !HAS_LIMIT.includes(b.type)}
                  >
                    {HAS_TEXT.includes(b.type) || HAS_LIMIT.includes(b.type) ? (
                      expanded ? <ChevronDown className="h-4 w-4 text-stone-500" /> : <ChevronRight className="h-4 w-4 text-stone-500" />
                    ) : (
                      <span className="w-4" />
                    )}
                    <span className={`truncate text-xs font-bold ${b.enabled ? 'text-white' : 'text-stone-500'}`}>{blockName(b)}</span>
                    {productCount !== null && (
                      <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${productCount > 0 ? 'bg-stone-800 text-stone-300' : 'bg-rose-950 text-rose-300'}`}>
                        {productCount} products
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => updateBlock(b.id, { enabled: !b.enabled })}
                    className={`flex flex-shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold ${
                      b.enabled ? 'bg-emerald-950 text-emerald-300' : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    {b.enabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    {b.enabled ? 'Shown' : 'Hidden'}
                  </button>
                </div>

                {expanded && (
                  <div className="grid gap-3 border-t border-stone-800 p-3 sm:grid-cols-2">
                    {HAS_TEXT.includes(b.type) && (
                      <>
                        <div>
                          <label className="block text-[11px] font-bold text-stone-400 mb-1">Small label above title</label>
                          <input className={input} value={b.eyebrow} onChange={(e) => updateBlock(b.id, { eyebrow: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-stone-400 mb-1">Title</label>
                          <input
                            className={input}
                            value={b.title}
                            placeholder={b.type === 'category' ? b.category?.name : ''}
                            onChange={(e) => updateBlock(b.id, { title: e.target.value })}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-stone-400 mb-1">Subtitle</label>
                          <textarea
                            rows={2}
                            className={input}
                            value={b.subtitle}
                            placeholder={b.type === 'category' ? b.category?.description : ''}
                            onChange={(e) => updateBlock(b.id, { subtitle: e.target.value })}
                          />
                        </div>
                      </>
                    )}
                    {HAS_LIMIT.includes(b.type) && (
                      <div>
                        <label className="block text-[11px] font-bold text-stone-400 mb-1">
                          {b.type === 'reviews' ? 'Reviews to show' : 'Products to show'}
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={24}
                          className={input}
                          value={b.limit}
                          onChange={(e) => updateBlock(b.id, { limit: Math.max(1, Math.min(24, Number(e.target.value) || 1)) })}
                        />
                      </div>
                    )}
                    {b.type === 'reviews' && (
                      <p className="sm:col-span-2 text-[11px] text-stone-500">
                        Shows approved reviews from Admin &gt; Reviews (featured ones first).
                      </p>
                    )}
                    {b.type === 'category' && b.category && (
                      <p className="sm:col-span-2 text-[11px] text-stone-500">
                        Products from &quot;{b.category.name}&quot; and its sub-categories (featured &amp; bestsellers first). Rename or change the
                        image in Admin &gt; Product Categories.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mid banner */}
      <div className={card}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-primary-400" /> Mid Banner
          </h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <ImageField label="Desktop image" value={midBanner.image} onChange={(image) => setMidBanner({ ...midBanner, image })} />
          <ImageField label="Mobile image (optional)" value={midBanner.mobile_image || ''} onChange={(mobile_image) => setMidBanner({ ...midBanner, mobile_image })} />
          <div>
            <label className="block text-[11px] font-bold text-stone-400 mb-1">Link</label>
            <input className={input} value={midBanner.link} onChange={(e) => setMidBanner({ ...midBanner, link: e.target.value })} />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-stone-400 mb-1">Alt text</label>
            <input className={input} value={midBanner.alt || ''} onChange={(e) => setMidBanner({ ...midBanner, alt: e.target.value })} />
          </div>
        </div>
      </div>

      {/* Promo slides */}
      <div className={card}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-primary-400" /> Promo Banner Slider ({promoSlides.length})
          </h3>
          <button
            onClick={() => setPromoSlides([...promoSlides, { image: '', mobile_image: '', link: '/shop', title: '' }])}
            className="flex items-center gap-1 rounded-xl bg-stone-800 px-3 py-2 text-[11px] font-bold text-white hover:bg-stone-700"
          >
            <Plus className="h-3.5 w-3.5" /> Add Slide
          </button>
        </div>
        <div className="space-y-3">
          {promoSlides.map((s, i) => {
            const set = (patch: Partial<BannerContent>) => setPromoSlides(promoSlides.map((x, j) => (j === i ? { ...x, ...patch } : x)));
            return (
              <div key={i} className="rounded-2xl border border-stone-800 bg-stone-900/60 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-stone-400">Slide {i + 1}</span>
                  <div className="flex gap-1">
                    <button onClick={() => setPromoSlides(move(promoSlides, i, i - 1))} className="p-1 text-stone-500 hover:text-white"><ArrowUp className="h-3.5 w-3.5" /></button>
                    <button onClick={() => setPromoSlides(move(promoSlides, i, i + 1))} className="p-1 text-stone-500 hover:text-white"><ArrowDown className="h-3.5 w-3.5" /></button>
                    <button onClick={() => setPromoSlides(promoSlides.filter((_, j) => j !== i))} className="p-1 text-rose-400 hover:text-rose-300"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ImageField label="Desktop image" value={s.image} onChange={(image) => set({ image })} />
                  <ImageField label="Mobile image (optional)" value={s.mobile_image || ''} onChange={(mobile_image) => set({ mobile_image })} />
                  <div>
                    <label className="block text-[11px] font-bold text-stone-400 mb-1">Title (for accessibility)</label>
                    <input className={input} value={s.title || ''} onChange={(e) => set({ title: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-400 mb-1">Link</label>
                    <input className={input} value={s.link} onChange={(e) => set({ link: e.target.value })} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Craftsmanship */}
      <div className={card}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary-400" /> Craftsmanship Points ({pillars.length})
          </h3>
          <button
            onClick={() => setPillars([...pillars, { title: '', desc: '' }])}
            className="flex items-center gap-1 rounded-xl bg-stone-800 px-3 py-2 text-[11px] font-bold text-white hover:bg-stone-700"
          >
            <Plus className="h-3.5 w-3.5" /> Add Point
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {pillars.map((p, i) => (
            <div key={i} className="rounded-2xl border border-stone-800 bg-stone-900/60 p-3 space-y-2">
              <div className="flex gap-2">
                <input
                  className={input}
                  placeholder="Title"
                  value={p.title}
                  onChange={(e) => setPillars(pillars.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))}
                />
                <button onClick={() => setPillars(pillars.filter((_, j) => j !== i))} className="p-1 text-rose-400 hover:text-rose-300">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <textarea
                rows={3}
                className={input}
                placeholder="Description"
                value={p.desc}
                onChange={(e) => setPillars(pillars.map((x, j) => (j === i ? { ...x, desc: e.target.value } : x)))}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Texts */}
      <div className={card}>
        <h3 className="font-bold text-base text-white mb-4">Announcement, Contact &amp; Footer</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {TEXT_FIELDS.map((f) => (
            <div key={f.key} className={f.textarea ? 'sm:col-span-2' : ''}>
              <label className="block text-[11px] font-bold text-stone-400 mb-1">{f.label}</label>
              {f.textarea ? (
                <textarea rows={2} className={input} value={texts[f.key] || ''} onChange={(e) => setTexts({ ...texts, [f.key]: e.target.value })} />
              ) : (
                <input className={input} value={texts[f.key] || ''} onChange={(e) => setTexts({ ...texts, [f.key]: e.target.value })} />
              )}
              {f.hint && <p className="mt-1 text-[10px] text-stone-500">{f.hint}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Sticky save for long page */}
      <div className="fixed bottom-4 right-4 z-30">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-full bg-primary-600 px-5 py-3 text-xs font-bold text-white shadow-2xl hover:bg-primary-500 disabled:opacity-60"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Homepage
        </button>
      </div>
    </div>
  );
}
