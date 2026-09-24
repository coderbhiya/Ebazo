'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Tags, Plus, Trash2, Check, X, RefreshCw, Pencil, Upload, CheckCircle2, AlertCircle, Image as ImageIcon,
} from 'lucide-react';
import {
  fetchAdminAttributes, saveAdminAttribute, deleteAdminAttribute,
  saveAdminAttributeTerm, deleteAdminAttributeTerm, GlobalAttribute, AttributeTerm,
} from '@/lib/admin-api';
import { uploadCustomPhoto } from '@/lib/api';

const TYPE_LABELS: Record<GlobalAttribute['type'], string> = {
  select: 'Buttons (text)',
  color: 'Color swatches',
  image: 'Image swatches',
};

const inputCls =
  'w-full rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-primary-500';

function SwatchUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (!f) return;
          setBusy(true);
          const res = await uploadCustomPhoto(f).catch(() => null);
          setBusy(false);
          if (res?.url) onChange(res.url);
        }}
      />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-stone-700 bg-stone-900 hover:border-stone-500"
        title="Upload swatch image"
      >
        {busy ? (
          <RefreshCw className="h-3.5 w-3.5 animate-spin text-stone-400" />
        ) : value ? (
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <Upload className="h-3.5 w-3.5 text-stone-400" />
        )}
      </button>
    </>
  );
}

function TermRow({
  attr, term, onSaved, onError,
}: { attr: GlobalAttribute; term: AttributeTerm; onSaved: () => void; onError: (m: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(term.name);
  const [color, setColor] = useState(term.color || '#cccccc');
  const [image, setImage] = useState(term.image_url || '');

  const save = async () => {
    try {
      await saveAdminAttributeTerm(attr.id, { name, color: attr.type === 'color' ? color : null, image_url: image || null }, term.id);
      setEditing(false);
      onSaved();
    } catch (e) {
      onError((e as Error).message);
    }
  };

  const remove = async () => {
    if (!confirm(`Delete "${term.name}"? Products keep their existing variations.`)) return;
    try {
      await deleteAdminAttributeTerm(attr.id, term.id);
      onSaved();
    } catch (e) {
      onError((e as Error).message);
    }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-primary-700/50 bg-stone-900 p-1.5">
        {attr.type === 'color' && (
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-8 rounded bg-transparent" />
        )}
        {attr.type === 'image' && <SwatchUpload value={image} onChange={setImage} />}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && save()}
          className={`${inputCls} py-1.5`}
          autoFocus
        />
        <button type="button" onClick={save} className="p-1.5 text-emerald-400 hover:text-emerald-300" title="Save">
          <Check className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => setEditing(false)} className="p-1.5 text-stone-400 hover:text-white" title="Cancel">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-2 rounded-lg border border-stone-800 bg-stone-950/60 px-2.5 py-1.5">
      {attr.type === 'color' && (
        <span className="h-5 w-5 flex-shrink-0 rounded-full border border-white/20" style={{ background: term.color || '#ccc' }} />
      )}
      {attr.type === 'image' &&
        (term.image_url ? (
          <img src={term.image_url} alt="" className="h-6 w-6 flex-shrink-0 rounded object-cover" />
        ) : (
          <ImageIcon className="h-5 w-5 flex-shrink-0 text-stone-600" />
        ))}
      <span className="flex-1 text-xs font-semibold text-stone-200">{term.name}</span>
      <button type="button" onClick={() => setEditing(true)} className="p-1 text-stone-500 hover:text-white" title="Edit">
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button type="button" onClick={remove} className="p-1 text-stone-500 hover:text-rose-400" title="Delete">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function AttributeCard({
  attr, onChanged, onError,
}: { attr: GlobalAttribute; onChanged: () => void; onError: (m: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(attr.name);
  const [type, setType] = useState(attr.type);
  const [termName, setTermName] = useState('');
  const [termColor, setTermColor] = useState('#cccccc');
  const [termImage, setTermImage] = useState('');

  const saveAttr = async () => {
    try {
      await saveAdminAttribute({ name, type }, attr.id);
      setEditing(false);
      onChanged();
    } catch (e) {
      onError((e as Error).message);
    }
  };

  const removeAttr = async () => {
    if (!confirm(`Delete attribute "${attr.name}" and all its values? Products keep their existing variations.`)) return;
    try {
      await deleteAdminAttribute(attr.id);
      onChanged();
    } catch (e) {
      onError((e as Error).message);
    }
  };

  const addTerm = async () => {
    // "|" adds several at once, like WooCommerce
    const names = termName.split('|').map((s) => s.trim()).filter(Boolean);
    if (!names.length) return;
    try {
      for (const n of names) {
        await saveAdminAttributeTerm(attr.id, {
          name: n,
          color: attr.type === 'color' ? termColor : null,
          image_url: attr.type === 'image' ? termImage || null : null,
        });
      }
      setTermName('');
      setTermImage('');
      onChanged();
    } catch (e) {
      onError((e as Error).message);
      onChanged();
    }
  };

  return (
    <div className="rounded-2xl border border-stone-800 bg-[#121318] p-4 space-y-3">
      <div className="flex items-center gap-2 border-b border-stone-800 pb-3">
        {editing ? (
          <>
            <input value={name} onChange={(e) => setName(e.target.value)} className={`${inputCls} flex-1 font-bold`} autoFocus />
            <select value={type} onChange={(e) => setType(e.target.value as GlobalAttribute['type'])} className={`${inputCls} w-40`}>
              {Object.entries(TYPE_LABELS).map(([k, l]) => (
                <option key={k} value={k}>{l}</option>
              ))}
            </select>
            <button type="button" onClick={saveAttr} className="p-1.5 text-emerald-400 hover:text-emerald-300" title="Save">
              <Check className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => { setEditing(false); setName(attr.name); setType(attr.type); }}
              className="p-1.5 text-stone-400 hover:text-white"
              title="Cancel"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white">{attr.name}</h3>
              <p className="text-[10px] text-stone-500">
                {TYPE_LABELS[attr.type]} · {attr.terms.length} value{attr.terms.length === 1 ? '' : 's'}
              </p>
            </div>
            <button type="button" onClick={() => setEditing(true)} className="p-1.5 text-stone-400 hover:text-white" title="Rename / change type">
              <Pencil className="h-4 w-4" />
            </button>
            <button type="button" onClick={removeAttr} className="p-1.5 text-stone-500 hover:text-rose-400" title="Delete attribute">
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {attr.terms.map((t) => (
          <TermRow key={`${t.id}-${t.name}-${t.color}-${t.image_url}`} attr={attr} term={t} onSaved={onChanged} onError={onError} />
        ))}
        {attr.terms.length === 0 && <p className="text-[11px] text-stone-500 italic">No values yet.</p>}
      </div>

      <div className="flex items-center gap-2 pt-1">
        {attr.type === 'color' && (
          <input type="color" value={termColor} onChange={(e) => setTermColor(e.target.value)} className="h-8 w-8 rounded bg-transparent" title="Swatch color" />
        )}
        {attr.type === 'image' && <SwatchUpload value={termImage} onChange={setTermImage} />}
        <input
          value={termName}
          onChange={(e) => setTermName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTerm();
            }
          }}
          placeholder={`Add ${attr.name} value — use "|" for several`}
          className={`${inputCls} flex-1`}
        />
        <button type="button" onClick={addTerm} className="flex items-center gap-1 rounded-lg bg-primary-600 hover:bg-primary-500 px-3 py-2 text-xs font-bold text-white">
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
    </div>
  );
}

export default function AdminAttributesPage() {
  const [attributes, setAttributes] = useState<GlobalAttribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<GlobalAttribute['type']>('select');
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, t: 'success' | 'error' = 'success') => {
    setToast({ text, type: t });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    try {
      setAttributes(await fetchAdminAttributes());
      setLoadError('');
    } catch (e) {
      setLoadError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await saveAdminAttribute({ name: name.trim(), type });
      setName('');
      showToast('Attribute created');
      load();
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 rounded-lg border px-4 py-3 text-xs flex items-center gap-2 shadow-2xl ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertCircle className="h-4 w-4 text-rose-400" />}
          <span className="font-semibold">{toast.text}</span>
        </div>
      )}

      <div className="border-b border-stone-800 pb-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Tags className="h-5 w-5 text-sky-400" />
          Product Attributes
        </h1>
        <p className="text-xs text-stone-400 mt-0.5">
          Global attributes (Size, Shape, Frame Color…) you can reuse on any product to build variations — each variation
          gets its own image, customizer frame, price and stock.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form onSubmit={create} className="lg:col-span-4 rounded-2xl border border-stone-800 bg-[#121318] p-5 space-y-3 h-fit">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-stone-800 pb-3">Add new attribute</h2>
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Size" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">Shown to customers as</label>
            <select value={type} onChange={(e) => setType(e.target.value as GlobalAttribute['type'])} className={inputCls}>
              {Object.entries(TYPE_LABELS).map(([k, l]) => (
                <option key={k} value={k}>{l}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary-600 hover:bg-primary-500 py-2.5 text-xs font-bold text-white">
            <Plus className="h-4 w-4" /> Add attribute
          </button>
        </form>

        <div className="lg:col-span-8 space-y-4">
          {loading ? (
            <div className="flex items-center gap-2 text-stone-400 text-sm">
              <RefreshCw className="h-4 w-4 animate-spin" /> Loading attributes...
            </div>
          ) : loadError ? (
            <p className="rounded-xl border border-rose-800/60 bg-rose-950/40 p-4 text-xs text-rose-200">{loadError}</p>
          ) : attributes.length === 0 ? (
            <p className="rounded-xl border border-stone-800 bg-[#121318] p-6 text-center text-xs text-stone-400">
              No attributes yet. Create one on the left, e.g. <strong>Size</strong> with values 6x8 in | 8x10 in | A4.
            </p>
          ) : (
            attributes.map((a) => (
              <AttributeCard
                key={`${a.id}-${a.name}-${a.type}`}
                attr={a}
                onChanged={load}
                onError={(m) => showToast(m, 'error')}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
