'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Layers, Plus, X, Trash2, ChevronDown, ChevronRight, Wand2, Upload,
  RefreshCw, Image as ImageIcon, AlertTriangle, ExternalLink, Eye, EyeOff,
} from 'lucide-react';
import { ProductAttribute, ProductVariation, uploadCustomPhoto } from '@/lib/api';
import { fetchAdminAttributes, GlobalAttribute } from '@/lib/admin-api';
import { allCombinations, variationAttributes, variationLabel } from '@/lib/variations';

// Variations in the editor carry a client-side key so unsaved rows render stably
export type EditorVariation = ProductVariation & { _key: string };

let keySeq = 0;
const newKey = () => `v${Date.now()}_${keySeq++}`;

export function toEditorVariations(vs: ProductVariation[] | undefined): EditorVariation[] {
  return (vs || []).map((v) => ({ ...v, _key: v.id ? `id${v.id}` : newKey() }));
}

// Problems that should block saving (shown inline and returned to the page)
export function validateVariations(attributes: ProductAttribute[], variations: EditorVariation[]): string | null {
  const attrs = variationAttributes(attributes);
  if (variations.length && !attrs.length) {
    return 'Variations exist but no attribute is marked "Used for variations".';
  }
  const seen = new Set<string>();
  for (const [i, v] of variations.entries()) {
    if (v.price === null || v.price === undefined || isNaN(Number(v.price)) || String(v.price) === '') {
      return `Variation #${i + 1} needs a price.`;
    }
    const sig = attrs.map((a) => v.attributes[a.name] || '*').join('|');
    if (seen.has(sig)) return `Variation #${i + 1} duplicates another variation (${variationLabel(v, attributes)}).`;
    seen.add(sig);
  }
  return null;
}

interface Props {
  attributes: ProductAttribute[];
  variations: EditorVariation[];
  onAttributesChange: (a: ProductAttribute[]) => void;
  onVariationsChange: (v: EditorVariation[]) => void;
  basePrice: number;
  baseOriginalPrice: number;
  baseStock: number;
}

const baseInputCls =
  'rounded-lg border border-stone-700 bg-stone-900 px-2.5 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-primary-500';
const inputCls = `w-full ${baseInputCls}`;

function ImageField({
  label, hint, value, onChange, checkered,
}: { label: string; hint: string; value: string; onChange: (url: string) => void; checkered?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const res = await uploadCustomPhoto(file);
      if (res?.url) onChange(res.url);
      else setError('Upload failed');
    } catch {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-[11px] font-semibold text-stone-300 mb-1">{label}</label>
      <div className="flex gap-2.5">
        <div
          className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-stone-700 flex items-center justify-center ${
            checkered
              ? 'bg-[conic-gradient(#292524_25%,#1c1917_0_50%,#292524_0_75%,#1c1917_0)] bg-[length:12px_12px]'
              : 'bg-stone-950'
          }`}
        >
          {value ? (
            <img src={value} alt="" className="h-full w-full object-contain p-1" />
          ) : (
            <ImageIcon className="h-6 w-6 text-stone-700" />
          )}
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute top-0.5 right-0.5 rounded bg-black/80 p-0.5 text-rose-400 hover:text-rose-300"
              title="Remove"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <input ref={ref} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          <button
            type="button"
            onClick={() => ref.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 rounded-lg border border-stone-700 bg-stone-800 hover:bg-stone-700 px-2.5 py-1.5 text-[11px] font-semibold text-stone-200 disabled:opacity-50"
          >
            {uploading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3 text-primary-400" />}
            {uploading ? 'Uploading...' : value ? 'Replace' : 'Upload'}
          </button>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="or paste image URL"
            className={inputCls}
          />
          <p className="text-[10px] text-stone-500 leading-snug">{error ? <span className="text-rose-400">{error}</span> : hint}</p>
        </div>
      </div>
    </div>
  );
}

export default function ProductVariationsEditor({
  attributes, variations, onAttributesChange, onVariationsChange, basePrice, baseOriginalPrice, baseStock,
}: Props) {
  const [globals, setGlobals] = useState<GlobalAttribute[]>([]);
  const [globalsError, setGlobalsError] = useState('');
  const [picker, setPicker] = useState('custom');
  const [customInputs, setCustomInputs] = useState<Record<number, string>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkStock, setBulkStock] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    fetchAdminAttributes()
      .then(setGlobals)
      .catch((e: Error) => setGlobalsError(e.message));
  }, []);

  const varAttrs = variationAttributes(attributes);
  const validation = validateVariations(attributes, variations);

  const updateAttr = (idx: number, patch: Partial<ProductAttribute>) => {
    onAttributesChange(attributes.map((a, i) => (i === idx ? { ...a, ...patch } : a)));
  };

  const addAttribute = () => {
    if (picker === 'custom') {
      onAttributesChange([...attributes, { id: null, name: '', options: [], visible: true, variation: true }]);
      return;
    }
    const g = globals.find((x) => String(x.id) === picker);
    if (!g || attributes.some((a) => a.id === g.id)) return;
    onAttributesChange([
      ...attributes,
      { id: g.id, name: g.name, type: g.type, options: g.terms.map((t) => t.name), visible: true, variation: true },
    ]);
    setPicker('custom');
  };

  const removeAttribute = (idx: number) => {
    const name = attributes[idx].name;
    const usedBy = variations.filter((v) => v.attributes[name]).length;
    if (usedBy && !confirm(`${usedBy} variation(s) use "${name}". Remove the attribute anyway? Those variations will lose this option.`)) {
      return;
    }
    onAttributesChange(attributes.filter((_, i) => i !== idx));
    if (usedBy) {
      onVariationsChange(
        variations.map((v) => {
          const { [name]: _removed, ...rest } = v.attributes;
          return { ...v, attributes: rest };
        })
      );
    }
  };

  const renameCustomAttribute = (idx: number, newName: string) => {
    const oldName = attributes[idx].name;
    updateAttr(idx, { name: newName });
    if (oldName && oldName !== newName) {
      onVariationsChange(
        variations.map((v) => {
          if (!(oldName in v.attributes)) return v;
          const { [oldName]: val, ...rest } = v.attributes;
          return { ...v, attributes: { ...rest, [newName]: val } };
        })
      );
    }
  };

  const addCustomValues = (idx: number) => {
    const raw = customInputs[idx] || '';
    // WooCommerce convention: separate several values with "|"
    const values = raw.split('|').map((s) => s.trim()).filter(Boolean);
    if (!values.length) return;
    const merged = Array.from(new Set([...attributes[idx].options, ...values]));
    updateAttr(idx, { options: merged });
    setCustomInputs({ ...customInputs, [idx]: '' });
  };

  const toggleOption = (idx: number, option: string) => {
    const a = attributes[idx];
    updateAttr(idx, {
      options: a.options.includes(option) ? a.options.filter((o) => o !== option) : [...a.options, option],
    });
  };

  const makeVariation = (attrs: Record<string, string>): EditorVariation => ({
    _key: newKey(),
    attributes: attrs,
    sku: '',
    price: basePrice,
    original_price: baseOriginalPrice || null,
    stock: baseStock,
    image_url: '',
    frame_url: '',
    is_active: 1,
  });

  const generateVariations = () => {
    if (!varAttrs.length) return;
    const names = varAttrs.map((a) => a.name);
    const existing = new Set(variations.map((v) => names.map((n) => v.attributes[n] || '').join('|')));
    const combos = allCombinations(attributes).filter((c) => !existing.has(names.map((n) => c[n]).join('|')));
    if (combos.length > 50 && !confirm(`This will create ${combos.length} variations. Continue?`)) return;
    onVariationsChange([...variations, ...combos.map(makeVariation)]);
    setNotice(combos.length ? `${combos.length} variation(s) created.` : 'All combinations already exist.');
    setTimeout(() => setNotice(''), 3000);
  };

  const updateVariation = (key: string, patch: Partial<EditorVariation>) => {
    onVariationsChange(variations.map((v) => (v._key === key ? { ...v, ...patch } : v)));
  };

  const removeVariation = (key: string) => {
    onVariationsChange(variations.filter((v) => v._key !== key));
  };

  const applyBulk = (field: 'price' | 'stock', value: string) => {
    if (value === '' || isNaN(Number(value))) return;
    onVariationsChange(variations.map((v) => ({ ...v, [field]: Number(value) })));
  };

  const availableGlobals = globals.filter((g) => !attributes.some((a) => a.id === g.id));

  return (
    <div className="rounded-2xl border border-stone-800 bg-[#121318] p-5 space-y-5">
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Layers className="h-4 w-4 text-sky-400" />
          Attributes & Variations
        </h3>
        <Link
          href="/admin/attributes"
          target="_blank"
          className="flex items-center gap-1 text-[11px] font-semibold text-sky-300 hover:text-sky-200"
        >
          Manage global attributes <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* ---------- Attributes ---------- */}
      <div className="space-y-3">
        <p className="text-xs text-stone-400 leading-relaxed">
          Add attributes like Size, Shape or Color. Tick <strong className="text-stone-200">Used for variations</strong> to
          let customers choose them — each combination can then have its own image, customizer frame, price and stock.
        </p>

        <div className="flex items-center gap-2">
          <select value={picker} onChange={(e) => setPicker(e.target.value)} className={`${baseInputCls} w-full max-w-xs`}>
            <option value="custom">Custom product attribute</option>
            {availableGlobals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.terms.length} values)
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addAttribute}
            className="flex items-center gap-1 rounded-lg bg-sky-600 hover:bg-sky-500 px-3 py-1.5 text-xs font-bold text-white"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
        {globalsError && (
          <p className="text-[11px] text-amber-300">Couldn&apos;t load global attributes: {globalsError}</p>
        )}

        {attributes.map((attr, idx) => {
          const global = attr.id ? globals.find((g) => g.id === attr.id) : undefined;
          return (
            <div key={idx} className="rounded-xl border border-stone-800 bg-stone-950/60 p-3 space-y-2.5">
              <div className="flex items-center gap-2">
                {global ? (
                  <span className="flex-1 text-xs font-bold text-white">
                    {attr.name}
                    <span className="ml-2 rounded bg-sky-950 border border-sky-800 px-1.5 py-0.5 text-[9px] font-bold text-sky-300 uppercase">
                      Global · {global.type}
                    </span>
                  </span>
                ) : (
                  <input
                    type="text"
                    value={attr.name}
                    onChange={(e) => renameCustomAttribute(idx, e.target.value)}
                    placeholder="Attribute name, e.g. Thickness"
                    className={`${inputCls} flex-1 font-bold`}
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeAttribute(idx)}
                  className="rounded-lg p-1.5 text-stone-500 hover:text-rose-400 hover:bg-rose-950/40"
                  title="Remove attribute"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Values */}
              {global ? (
                <div className="space-y-1.5">
                  <div className="flex flex-wrap gap-1.5">
                    {global.terms.map((t) => {
                      const on = attr.options.includes(t.name);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => toggleOption(idx, t.name)}
                          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                            on
                              ? 'border-sky-500/60 bg-sky-950/60 text-sky-200'
                              : 'border-stone-800 bg-stone-900 text-stone-500 hover:text-stone-300'
                          }`}
                        >
                          {t.color && <span className="h-3 w-3 rounded-full border border-white/20" style={{ background: t.color }} />}
                          {t.image_url && <img src={t.image_url} alt="" className="h-4 w-4 rounded object-cover" />}
                          {t.name}
                        </button>
                      );
                    })}
                    {global.terms.length === 0 && (
                      <span className="text-[11px] text-stone-500 italic">
                        No values yet — add them in Manage global attributes.
                      </span>
                    )}
                  </div>
                  {global.terms.length > 0 && (
                    <div className="flex gap-3 text-[10px] font-semibold">
                      <button type="button" className="text-sky-300 hover:text-sky-200" onClick={() => updateAttr(idx, { options: global.terms.map((t) => t.name) })}>
                        Select all
                      </button>
                      <button type="button" className="text-stone-400 hover:text-stone-200" onClick={() => updateAttr(idx, { options: [] })}>
                        Select none
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex flex-wrap gap-1.5">
                    {attr.options.map((o) => (
                      <span
                        key={o}
                        className="flex items-center gap-1 rounded-lg border border-sky-500/40 bg-sky-950/40 px-2.5 py-1 text-[11px] font-semibold text-sky-200"
                      >
                        {o}
                        <button type="button" onClick={() => toggleOption(idx, o)} className="text-sky-400 hover:text-white">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customInputs[idx] || ''}
                      onChange={(e) => setCustomInputs({ ...customInputs, [idx]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomValues(idx);
                        }
                      }}
                      placeholder='Add values — separate several with "|", e.g. 3mm | 5mm'
                      className={`${inputCls} flex-1`}
                    />
                    <button
                      type="button"
                      onClick={() => addCustomValues(idx)}
                      className="rounded-lg bg-stone-800 hover:bg-stone-700 px-3 py-1.5 text-[11px] font-semibold text-stone-200"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-300 cursor-pointer">
                  <input type="checkbox" checked={attr.visible} onChange={(e) => updateAttr(idx, { visible: e.target.checked })} />
                  Visible on product page
                </label>
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-300 cursor-pointer">
                  <input type="checkbox" checked={attr.variation} onChange={(e) => updateAttr(idx, { variation: e.target.checked })} />
                  Used for variations
                </label>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------- Variations ---------- */}
      {(varAttrs.length > 0 || variations.length > 0) && (
        <div className="space-y-3 border-t border-stone-800 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Variations <span className="text-stone-500">({variations.length})</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={generateVariations}
                disabled={!varAttrs.length}
                className="flex items-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 px-3 py-1.5 text-[11px] font-bold text-white disabled:opacity-40"
              >
                <Wand2 className="h-3.5 w-3.5" /> Generate variations
              </button>
              <button
                type="button"
                onClick={() => {
                  const v = makeVariation({});
                  onVariationsChange([...variations, v]);
                  setExpanded({ ...expanded, [v._key]: true });
                }}
                disabled={!varAttrs.length}
                className="flex items-center gap-1.5 rounded-lg border border-stone-700 bg-stone-800 hover:bg-stone-700 px-3 py-1.5 text-[11px] font-semibold text-stone-200 disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" /> Add manually
              </button>
            </div>
          </div>

          {notice && <p className="text-[11px] font-semibold text-emerald-300">{notice}</p>}
          {validation && (
            <p className="flex items-center gap-1.5 rounded-lg border border-amber-700/50 bg-amber-950/40 px-2.5 py-1.5 text-[11px] font-semibold text-amber-200">
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" /> {validation}
            </p>
          )}

          {variations.length > 1 && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-stone-800 bg-stone-950/60 p-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Bulk edit</span>
              <input type="number" value={bulkPrice} onChange={(e) => setBulkPrice(e.target.value)} placeholder="Price ₹" className={`${baseInputCls} w-24`} />
              <button type="button" onClick={() => applyBulk('price', bulkPrice)} className="rounded-lg bg-stone-800 hover:bg-stone-700 px-2.5 py-1.5 text-[11px] font-semibold text-stone-200">
                Set all prices
              </button>
              <input type="number" value={bulkStock} onChange={(e) => setBulkStock(e.target.value)} placeholder="Stock" className={`${baseInputCls} w-20`} />
              <button type="button" onClick={() => applyBulk('stock', bulkStock)} className="rounded-lg bg-stone-800 hover:bg-stone-700 px-2.5 py-1.5 text-[11px] font-semibold text-stone-200">
                Set all stock
              </button>
            </div>
          )}

          {variations.length === 0 && (
            <p className="text-[11px] text-stone-500 italic">
              No variations yet. Click <strong>Generate variations</strong> to create one for every combination.
            </p>
          )}

          {variations.map((v, i) => {
            const open = !!expanded[v._key];
            const stale = varAttrs.some((a) => v.attributes[a.name] && !a.options.includes(v.attributes[a.name]));
            return (
              <div key={v._key} className={`rounded-xl border ${v.is_active ? 'border-stone-800' : 'border-stone-800/60 opacity-70'} bg-stone-950/60`}>
                {/* Row header */}
                <div className="flex flex-wrap items-center gap-2 p-2.5">
                  <button
                    type="button"
                    onClick={() => setExpanded({ ...expanded, [v._key]: !open })}
                    className="p-1 text-stone-400 hover:text-white"
                    title={open ? 'Collapse' : 'Edit details'}
                  >
                    {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  <span className="text-[10px] font-mono font-bold text-stone-500">#{i + 1}</span>
                  {v.image_url ? (
                    <img src={v.image_url} alt="" className="h-7 w-7 rounded object-cover border border-stone-700" />
                  ) : (
                    <span className="h-7 w-7 rounded border border-dashed border-stone-700 flex items-center justify-center">
                      <ImageIcon className="h-3.5 w-3.5 text-stone-700" />
                    </span>
                  )}
                  {varAttrs.map((a) => (
                    <select
                      key={a.name}
                      value={v.attributes[a.name] || ''}
                      onChange={(e) => updateVariation(v._key, { attributes: { ...v.attributes, [a.name]: e.target.value } })}
                      className="rounded-lg border border-stone-700 bg-stone-900 px-2 py-1 text-[11px] text-white focus:outline-none"
                    >
                      <option value="">Any {a.name}</option>
                      {a.options.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  ))}
                  <span className="ml-auto flex items-center gap-2 text-[11px]">
                    {stale && (
                      <span className="rounded bg-amber-950 border border-amber-700/60 px-1.5 py-0.5 text-[9px] font-bold text-amber-300" title="Uses a value no longer on the attribute">
                        Stale value
                      </span>
                    )}
                    {v.frame_url && (
                      <span className="rounded bg-violet-950 border border-violet-700/60 px-1.5 py-0.5 text-[9px] font-bold text-violet-300">Frame</span>
                    )}
                    <span className="font-bold text-emerald-300">₹{v.price}</span>
                    <span className={`${v.stock > 0 ? 'text-stone-400' : 'text-rose-400 font-bold'}`}>
                      {v.stock > 0 ? `${v.stock} in stock` : 'Out of stock'}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateVariation(v._key, { is_active: v.is_active ? 0 : 1 })}
                      className={`p-1 ${v.is_active ? 'text-emerald-400' : 'text-stone-600'} hover:text-white`}
                      title={v.is_active ? 'Enabled — click to disable' : 'Disabled — click to enable'}
                    >
                      {v.is_active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeVariation(v._key)}
                      className="p-1 text-stone-500 hover:text-rose-400"
                      title="Delete variation"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </div>

                {/* Details */}
                {open && (
                  <div className="border-t border-stone-800 p-3 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ImageField
                        label="Variation image"
                        hint="Shown on the product page when this option is selected."
                        value={v.image_url}
                        onChange={(url) => updateVariation(v._key, { image_url: url })}
                      />
                      <ImageField
                        label="Customizer frame / cutout (PNG)"
                        hint="Transparent PNG shape the customer's photo is cut into. Leave empty to use the product's frame."
                        value={v.frame_url}
                        onChange={(url) => updateVariation(v._key, { frame_url: url })}
                        checkered
                      />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-300 mb-1">SKU</label>
                        <input
                          type="text"
                          value={v.sku}
                          onChange={(e) => updateVariation(v._key, { sku: e.target.value })}
                          placeholder="Optional"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                          Price (₹) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={v.price ?? ''}
                          onChange={(e) => updateVariation(v._key, { price: e.target.value === '' ? ('' as unknown as number) : Number(e.target.value) })}
                          className={`${inputCls} font-bold`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-300 mb-1">MRP (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={v.original_price ?? ''}
                          onChange={(e) => updateVariation(v._key, { original_price: e.target.value === '' ? null : Number(e.target.value) })}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-300 mb-1">Stock</label>
                        <input
                          type="number"
                          value={v.stock}
                          onChange={(e) => updateVariation(v._key, { stock: Number(e.target.value) || 0 })}
                          className={inputCls}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
