'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Check, Crop, Palette, SlidersHorizontal, RotateCcw, Loader2 } from 'lucide-react';

// Photo editor opened from the customizer: crop, filter presets and brightness / contrast /
// saturation. The result is a new image file, so the customizer preview, the print file and the
// uploaded photo all use the edited version.

type Rect = { x: number; y: number; w: number; h: number }; // normalised 0..1 of the photo

export interface PhotoEdits {
  crop: Rect;
  aspect: string;
  filter: string;
  brightness: number; // percent, 100 = unchanged
  contrast: number;
  saturation: number;
}

export const DEFAULT_PHOTO_EDITS: PhotoEdits = {
  crop: { x: 0, y: 0, w: 1, h: 1 },
  aspect: 'free',
  filter: 'none',
  brightness: 100,
  contrast: 100,
  saturation: 100,
};

// Ratios match the print sizes (8x12 = 2:3, 10x14 = 5:7, 16x20 = 4:5, 18x24 = 3:4)
const ASPECTS: { id: string; label: string; ratio: number | null }[] = [
  { id: 'free', label: 'Free', ratio: null },
  { id: '1:1', label: '1:1', ratio: 1 },
  { id: '2:3', label: '2:3', ratio: 2 / 3 },
  { id: '3:4', label: '3:4', ratio: 3 / 4 },
  { id: '4:5', label: '4:5', ratio: 4 / 5 },
  { id: '5:7', label: '5:7', ratio: 5 / 7 },
  { id: '3:2', label: '3:2', ratio: 3 / 2 },
];

type StepName = 'grayscale' | 'sepia' | 'saturate' | 'brightness' | 'contrast';
type Step = [StepName, number];

// Each preset is a chain of CSS filter functions: the live preview uses CSS, and applyFilters()
// reproduces the same functions pixel by pixel for the output file.
const FILTERS: { id: string; label: string; steps: Step[] }[] = [
  { id: 'none', label: 'Original', steps: [] },
  { id: 'vivid', label: 'Vivid', steps: [['saturate', 1.4], ['contrast', 1.1]] },
  { id: 'warm', label: 'Warm', steps: [['sepia', 0.25], ['saturate', 1.2]] },
  { id: 'bw', label: 'B&W', steps: [['grayscale', 1], ['contrast', 1.1]] },
  { id: 'sepia', label: 'Sepia', steps: [['sepia', 0.8]] },
  { id: 'fade', label: 'Fade', steps: [['contrast', 0.85], ['brightness', 1.1], ['saturate', 0.8]] },
  { id: 'drama', label: 'Drama', steps: [['contrast', 1.3], ['saturate', 1.1], ['brightness', 0.95]] },
];

const MIN_SIZE = 0.08;
const MAX_OUTPUT_SIDE = 4000;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function editSteps(e: PhotoEdits): Step[] {
  const preset = FILTERS.find((f) => f.id === e.filter)?.steps ?? [];
  const steps: Step[] = [...preset];
  if (e.brightness !== 100) steps.push(['brightness', e.brightness / 100]);
  if (e.contrast !== 100) steps.push(['contrast', e.contrast / 100]);
  if (e.saturation !== 100) steps.push(['saturate', e.saturation / 100]);
  return steps;
}

const cssFilter = (steps: Step[]) => (steps.length ? steps.map(([f, v]) => `${f}(${v})`).join(' ') : 'none');

// Colour matrices from the Filter Effects spec: [3x3 matrix, offset 0..1]
function stepMatrix([name, a]: Step): { m: number[]; o: number } {
  switch (name) {
    case 'grayscale': {
      const s = 1 - Math.min(1, a);
      return { o: 0, m: [
        0.2126 + 0.7874 * s, 0.7152 - 0.7152 * s, 0.0722 - 0.0722 * s,
        0.2126 - 0.2126 * s, 0.7152 + 0.2848 * s, 0.0722 - 0.0722 * s,
        0.2126 - 0.2126 * s, 0.7152 - 0.7152 * s, 0.0722 + 0.9278 * s,
      ] };
    }
    case 'sepia': {
      const s = 1 - Math.min(1, a);
      return { o: 0, m: [
        0.393 + 0.607 * s, 0.769 - 0.769 * s, 0.189 - 0.189 * s,
        0.349 - 0.349 * s, 0.686 + 0.314 * s, 0.168 - 0.168 * s,
        0.272 - 0.272 * s, 0.534 - 0.534 * s, 0.131 + 0.869 * s,
      ] };
    }
    case 'saturate':
      return { o: 0, m: [
        0.213 + 0.787 * a, 0.715 - 0.715 * a, 0.072 - 0.072 * a,
        0.213 - 0.213 * a, 0.715 + 0.285 * a, 0.072 - 0.072 * a,
        0.213 - 0.213 * a, 0.715 - 0.715 * a, 0.072 + 0.928 * a,
      ] };
    case 'brightness':
      return { o: 0, m: [a, 0, 0, 0, a, 0, 0, 0, a] };
    case 'contrast':
      return { o: 0.5 - 0.5 * a, m: [a, 0, 0, 0, a, 0, 0, 0, a] };
  }
}

// Applies the steps in order, clamping after each one like the browser's CSS filter does
function applyFilters(data: Uint8ClampedArray, steps: Step[]) {
  const mats = steps.map(stepMatrix);
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i], g = data[i + 1], b = data[i + 2];
    for (const { m, o } of mats) {
      const off = o * 255;
      const nr = m[0] * r + m[1] * g + m[2] * b + off;
      const ng = m[3] * r + m[4] * g + m[5] * b + off;
      const nb = m[6] * r + m[7] * g + m[8] * b + off;
      r = clamp(nr, 0, 255); g = clamp(ng, 0, 255); b = clamp(nb, 0, 255);
    }
    data[i] = r; data[i + 1] = g; data[i + 2] = b;
  }
}

function hasAlpha(data: Uint8ClampedArray) {
  for (let i = 3; i < data.length; i += 4) if (data[i] < 255) return true;
  return false;
}

// Largest centred rect of the given pixel ratio inside a photo of aspect `imgAspect`
function fitAspect(ratio: number | null, imgAspect: number): Rect {
  if (!ratio) return { x: 0, y: 0, w: 1, h: 1 };
  let w = 1;
  let h = (w * imgAspect) / ratio;
  if (h > 1) { h = 1; w = (h * ratio) / imgAspect; }
  return { x: (1 - w) / 2, y: (1 - h) / 2, w, h };
}

const isFullCrop = (c: Rect) => c.x < 0.001 && c.y < 0.001 && c.w > 0.999 && c.h > 0.999;

interface Props {
  src: string;
  initial?: PhotoEdits;
  onApply: (result: { file: File; url: string; edits: PhotoEdits; cropped: boolean }) => void;
  onClose: () => void;
}

export default function PhotoEditorModal({ src, initial, onApply, onClose }: Props) {
  const [edits, setEdits] = useState<PhotoEdits>(initial ?? DEFAULT_PHOTO_EDITS);
  const [tab, setTab] = useState<'crop' | 'filters' | 'adjust'>('crop');
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ mode: 'move' | 'nw' | 'ne' | 'sw' | 'se'; startX: number; startY: number; start: Rect } | null>(null);

  const imgAspect = natural ? natural.w / natural.h : 1;
  const ratio = ASPECTS.find((a) => a.id === edits.aspect)?.ratio ?? null;
  const steps = editSteps(edits);
  const crop = edits.crop;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const set = (patch: Partial<PhotoEdits>) => setEdits((e) => ({ ...e, ...patch }));

  const chooseAspect = (id: string) => {
    const r = ASPECTS.find((a) => a.id === id)?.ratio ?? null;
    // Free keeps the current box; a fixed ratio starts from the largest centred box
    set({ aspect: id, crop: r ? fitAspect(r, imgAspect) : crop });
  };

  const onPointerDown = (e: React.PointerEvent, mode: 'move' | 'nw' | 'ne' | 'sw' | 'se') => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { mode, startX: e.clientX, startY: e.clientY, start: crop };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const box = boxRef.current?.getBoundingClientRect();
    if (!d || !box) return;
    const dx = (e.clientX - d.startX) / box.width;
    const dy = (e.clientY - d.startY) / box.height;
    const s = d.start;

    if (d.mode === 'move') {
      set({ crop: { ...s, x: clamp(s.x + dx, 0, 1 - s.w), y: clamp(s.y + dy, 0, 1 - s.h) } });
      return;
    }

    // Resize from a corner: the opposite corner stays put
    const right = d.mode === 'ne' || d.mode === 'se';
    const bottom = d.mode === 'sw' || d.mode === 'se';
    const ax = right ? s.x : s.x + s.w;
    const ay = bottom ? s.y : s.y + s.h;
    const px = clamp((right ? s.x + s.w : s.x) + dx, 0, 1);
    const py = clamp((bottom ? s.y + s.h : s.y) + dy, 0, 1);
    const maxW = right ? 1 - ax : ax;
    const maxH = bottom ? 1 - ay : ay;
    let w = Math.max(MIN_SIZE, Math.abs(px - ax));
    let h = Math.max(MIN_SIZE, Math.abs(py - ay));
    if (ratio) {
      w = Math.max(w, (h * ratio) / imgAspect);
      h = (w * imgAspect) / ratio;
      if (w > maxW) { w = maxW; h = (w * imgAspect) / ratio; }
      if (h > maxH) { h = maxH; w = (h * ratio) / imgAspect; }
    } else {
      w = Math.min(w, maxW);
      h = Math.min(h, maxH);
    }
    set({ crop: { x: right ? ax : ax - w, y: bottom ? ay : ay - h, w, h } });
  };

  const onPointerUp = () => {
    drag.current = null;
  };

  const handleApply = async () => {
    const img = imgRef.current;
    if (!img || !natural) return;
    const cropped = !isFullCrop(crop);
    if (!cropped && steps.length === 0 && !initial) {
      onClose();
      return;
    }
    setSaving(true);
    setError('');
    try {
      const sx = Math.round(crop.x * natural.w);
      const sy = Math.round(crop.y * natural.h);
      const sw = Math.max(1, Math.round(crop.w * natural.w));
      const sh = Math.max(1, Math.round(crop.h * natural.h));
      const scale = Math.min(1, MAX_OUTPUT_SIDE / Math.max(sw, sh));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(sw * scale);
      canvas.height = Math.round(sh * scale);
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Canvas not supported');
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
      if (steps.length) {
        applyFilters(pixels.data, steps);
        ctx.putImageData(pixels, 0, 0);
      }
      // Keep transparency (e.g. background-removed photos); plain photos stay small as JPEG
      const png = hasAlpha(pixels.data);
      const type = png ? 'image/png' : 'image/jpeg';
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, type, 0.92));
      if (!blob) throw new Error('Could not export the photo');
      const file = new File([blob], `edited-photo.${png ? 'png' : 'jpg'}`, { type });
      onApply({ file, url: URL.createObjectURL(blob), edits, cropped });
    } catch (err) {
      console.error('Photo edit failed:', err);
      setError('Could not apply the edits to this photo. Please try again.');
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'crop' as const, label: 'Crop', icon: Crop },
    { id: 'filters' as const, label: 'Filters', icon: Palette },
    { id: 'adjust' as const, label: 'Adjust', icon: SlidersHorizontal },
  ];

  const sliders: { key: 'brightness' | 'contrast' | 'saturation'; label: string }[] = [
    { key: 'brightness', label: 'Brightness' },
    { key: 'contrast', label: 'Contrast' },
    { key: 'saturation', label: 'Saturation' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-950/80 p-0 sm:p-4 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-lg flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[95vh] sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
          <h2 className="text-sm font-extrabold text-stone-900">Edit Photo</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Photo with crop box */}
        <div className="flex flex-1 items-center justify-center bg-stone-900 p-4 sm:flex-none">
          <div ref={boxRef} className="relative inline-block select-none overflow-hidden" style={{ touchAction: 'none' }}>
            <img
              ref={imgRef}
              src={src}
              alt="Photo being edited"
              draggable={false}
              onLoad={(e) => setNatural({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
              className="block max-h-[45vh] max-w-full"
              style={{ filter: cssFilter(steps) }}
            />
            {natural && (
              <div
                className="absolute cursor-move border-2 border-white"
                style={{
                  left: `${crop.x * 100}%`,
                  top: `${crop.y * 100}%`,
                  width: `${crop.w * 100}%`,
                  height: `${crop.h * 100}%`,
                  boxShadow: '0 0 0 9999px rgba(12,10,9,0.55)',
                  pointerEvents: tab === 'crop' ? 'auto' : 'none',
                }}
                onPointerDown={(e) => onPointerDown(e, 'move')}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
              >
                {tab === 'crop' && (
                  <>
                    {/* Rule-of-thirds guides */}
                    <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="border border-white/25" />
                      ))}
                    </div>
                    {(['nw', 'ne', 'sw', 'se'] as const).map((c) => (
                      <div
                        key={c}
                        className={`absolute h-5 w-5 rounded-full border-2 border-white bg-primary-500 shadow ${
                          c === 'nw' ? '-left-2.5 -top-2.5 cursor-nwse-resize'
                          : c === 'ne' ? '-right-2.5 -top-2.5 cursor-nesw-resize'
                          : c === 'sw' ? '-bottom-2.5 -left-2.5 cursor-nesw-resize'
                          : '-bottom-2.5 -right-2.5 cursor-nwse-resize'
                        }`}
                        onPointerDown={(e) => onPointerDown(e, c)}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        onPointerCancel={onPointerUp}
                      />
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tools */}
        <div className="space-y-3 overflow-y-auto p-4">
          <div className="flex gap-1 rounded-2xl border border-stone-300/80 bg-stone-200/70 p-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                  tab === id ? 'bg-white text-stone-900 shadow-sm ring-1 ring-stone-300' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5 text-primary-600" />
                {label}
              </button>
            ))}
          </div>

          {tab === 'crop' && (
            <div className="space-y-2">
              <p className="text-[11px] text-stone-500">Drag the box to move it, drag a corner to resize. Pick a ratio to match your print size.</p>
              <div className="flex flex-wrap gap-1.5">
                {ASPECTS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => chooseAspect(a.id)}
                    className={`rounded-full border px-3 py-1 text-xs font-bold transition-colors ${
                      edits.aspect === a.id ? 'border-primary-600 bg-primary-600 text-white' : 'border-stone-300 text-stone-700 hover:border-stone-500'
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === 'filters' && (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
              {FILTERS.map((f) => (
                <button key={f.id} type="button" onClick={() => set({ filter: f.id })} className="flex flex-col items-center gap-1">
                  <span className={`block aspect-square w-full overflow-hidden rounded-lg ring-2 ${edits.filter === f.id ? 'ring-primary-600' : 'ring-transparent'}`}>
                    <img src={src} alt="" className="h-full w-full object-cover" style={{ filter: cssFilter(f.steps) }} />
                  </span>
                  <span className={`text-[10px] font-bold ${edits.filter === f.id ? 'text-primary-700' : 'text-stone-600'}`}>{f.label}</span>
                </button>
              ))}
            </div>
          )}

          {tab === 'adjust' && (
            <div className="space-y-3">
              {sliders.map(({ key, label }) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                    <span>{label}</span>
                    <span className="font-mono text-stone-600">{edits[key] - 100 > 0 ? '+' : ''}{edits[key] - 100}</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    step="1"
                    value={edits[key]}
                    onChange={(e) => set({ [key]: parseInt(e.target.value) } as Partial<PhotoEdits>)}
                    className="h-2 w-full cursor-pointer rounded-lg bg-stone-200 accent-primary-600"
                  />
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 border-t border-stone-200 p-4">
          <button
            type="button"
            onClick={() => setEdits(DEFAULT_PHOTO_EDITS)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-100 hover:text-stone-900"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
          <div className="flex-1" />
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-100">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={saving || !natural}
            className="flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary-700 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
