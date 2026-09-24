'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, RotateCw } from 'lucide-react';
import { Product } from '@/lib/api';

export interface PreviewArtwork {
  label: string;
  // Final composite (photo cut into the frame shape), or null when this slot has no photo yet
  url: string | null;
  // Frame silhouette, used to draw an empty placeholder in the right shape
  frameUrl: string;
}

type Scene = 'fridge' | 'gallery' | 'dual' | 'clock' | 'hanging' | 'keychain' | 'stand';

// Crops a composite down to its non-transparent bounds so the mockup can sit the shape
// directly on a stand / string instead of floating inside the square print canvas.
export async function trimTransparent(dataUrl: string): Promise<string> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = dataUrl;
  });
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0);
  const { data, width, height } = ctx.getImageData(0, 0, img.width, img.height);

  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return dataUrl;

  const w = maxX - minX + 1;
  const h = maxY - minY + 1;
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  out.getContext('2d')?.drawImage(canvas, minX, minY, w, h, 0, 0, w, h);
  return out.toDataURL('image/png');
}

function getScene(product: Product, isFridgeMagnet: boolean, isMiniGallery: boolean, isDual: boolean): Scene {
  if (isFridgeMagnet) return 'fridge';
  if (isMiniGallery) return 'gallery';
  if (isDual) return 'dual';
  const hay = `${product.category_slug || ''} ${product.slug || ''} ${product.title || ''}`.toLowerCase();
  if (hay.includes('clock')) return 'clock';
  if (hay.includes('hanging')) return 'hanging';
  if (hay.includes('key') || hay.includes('charm')) return 'keychain';
  return 'stand';
}

// Renders one artwork, or a dashed placeholder in the frame's shape when there's no photo
function Artwork({ art, className = '' }: { art: PreviewArtwork; className?: string }) {
  if (art.url) {
    return <img src={art.url} alt={art.label} className={`object-contain drop-shadow-xl ${className}`} draggable={false} />;
  }
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div
        className="absolute inset-0 bg-stone-300/80"
        style={{
          WebkitMaskImage: `url("${art.frameUrl}")`,
          maskImage: `url("${art.frameUrl}")`,
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
        }}
      />
      <ImageIcon className="relative h-5 w-5 text-stone-500" />
    </div>
  );
}

interface Props {
  product: Product;
  artworks: PreviewArtwork[];
  isFridgeMagnet: boolean;
  isMiniGallery: boolean;
  isDual: boolean;
}

export default function ProductPreviewMockup({ product, artworks, isFridgeMagnet, isMiniGallery, isDual }: Props) {
  const scene = getScene(product, isFridgeMagnet, isMiniGallery, isDual);
  const [showBack, setShowBack] = useState(false);
  const main = artworks[0];

  if (scene === 'fridge') {
    return (
      <div className="relative rounded-3xl border border-slate-300 bg-gradient-to-br from-slate-100 via-white to-slate-200 p-6 min-h-[380px] shadow-inner overflow-hidden">
        {/* Fridge door handle */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 h-40 w-2.5 rounded-full bg-gradient-to-b from-slate-300 to-slate-400 shadow" />
        <div className={`grid ${artworks.length > 4 ? 'grid-cols-3 sm:grid-cols-4' : 'grid-cols-2'} gap-5 pr-6 place-items-center`}>
          {artworks.map((art, idx) => (
            <div key={idx} className="flex flex-col items-center" style={{ transform: `rotate(${[-4, 3, -2, 5, -3, 2, -5, 4][idx % 8]}deg)` }}>
              <Artwork art={art} className="h-24 w-24 sm:h-28 sm:w-28" />
              <span className="mt-1 text-[10px] font-bold text-slate-500">{art.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (scene === 'gallery') {
    return (
      <div className="relative rounded-3xl border border-stone-300 bg-gradient-to-b from-amber-50 via-stone-100 to-stone-200 p-6 min-h-[380px] shadow-inner flex items-center justify-center">
        <div className={`grid ${artworks.length > 4 ? 'grid-cols-3 gap-3' : 'grid-cols-2 gap-5'}`}>
          {artworks.map((art, idx) => (
            <div key={idx} className="rounded-xl bg-white p-2 shadow-lg ring-1 ring-stone-200">
              <Artwork art={art} className={artworks.length > 4 ? 'h-20 w-20 sm:h-24 sm:w-24' : 'h-28 w-28 sm:h-32 sm:w-32'} />
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-stone-300/60 to-transparent" />
      </div>
    );
  }

  if (scene === 'dual') {
    const current = showBack ? artworks[1] : artworks[0];
    return (
      <div className="relative rounded-3xl border border-stone-200 bg-gradient-to-b from-sky-100 via-stone-50 to-stone-200 p-6 min-h-[380px] shadow-inner flex flex-col items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-10 w-0.5 bg-stone-500" />
          <div className="h-3 w-3 rounded-full border-2 border-stone-500 -mt-0.5 mb-1" />
          <div className="transition-transform duration-500" style={{ transform: showBack ? 'rotateY(360deg)' : 'none' }}>
            {current && <Artwork art={current} className="h-60 w-60 sm:h-64 sm:w-64" />}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowBack((b) => !b)}
          className="mt-4 flex items-center gap-1.5 rounded-full bg-stone-900 px-3 py-1.5 text-xs font-bold text-amber-300 shadow hover:bg-stone-800"
        >
          <RotateCw className="h-3.5 w-3.5" />
          Showing {showBack ? 'Back' : 'Front'} — tap to flip
        </button>
      </div>
    );
  }

  if (scene === 'clock') {
    return (
      <div className="relative rounded-3xl border border-stone-200 bg-gradient-to-b from-stone-200 via-stone-100 to-stone-200 p-6 min-h-[380px] shadow-inner flex items-center justify-center">
        <div className="relative h-72 w-72">
          {main && <Artwork art={main} className="h-full w-full" />}
          {/* Clock hands (10:10) */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="absolute h-16 w-1.5 rounded-full bg-stone-900 origin-bottom" style={{ transform: 'translateY(-50%) rotate(-60deg)' }} />
            <div className="absolute h-24 w-1 rounded-full bg-stone-900 origin-bottom" style={{ transform: 'translateY(-50%) rotate(60deg)' }} />
            <div className="absolute h-28 w-0.5 rounded-full bg-rose-600 origin-bottom" style={{ transform: 'translateY(-50%) rotate(180deg)' }} />
            <div className="absolute h-3.5 w-3.5 rounded-full bg-stone-900 ring-2 ring-amber-400" />
          </div>
        </div>
      </div>
    );
  }

  if (scene === 'hanging' || scene === 'keychain') {
    return (
      <div className="relative rounded-3xl border border-stone-200 bg-gradient-to-b from-sky-100 via-stone-50 to-stone-200 p-6 min-h-[380px] shadow-inner flex flex-col items-center justify-start">
        {scene === 'hanging' ? (
          <div className="h-14 w-0.5 bg-gradient-to-b from-stone-400 to-stone-600" />
        ) : (
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 rounded-full border-4 border-slate-400 shadow-md" />
            <div className="h-4 w-2.5 -mt-1 rounded-full border-2 border-slate-400 bg-slate-200" />
          </div>
        )}
        <div className="h-3 w-3 -mt-0.5 rounded-full border-2 border-stone-500" />
        {main && <Artwork art={main} className="h-64 w-64 -mt-0.5 origin-top animate-[swing_3s_ease-in-out_infinite]" />}
        <style>{`@keyframes swing { 0%,100% { transform: rotate(2deg); } 50% { transform: rotate(-2deg); } }`}</style>
      </div>
    );
  }

  // Tabletop acrylic stand (photo stand, car stand, caricature, default)
  return (
    <div className="relative rounded-3xl border border-stone-200 bg-gradient-to-b from-stone-100 via-white to-stone-100 min-h-[380px] shadow-inner overflow-hidden flex flex-col items-center justify-end pt-8">
      <div className="relative z-10 flex flex-col items-center">
        {main && <Artwork art={main} className="max-h-64 max-w-[16rem] sm:max-h-72 sm:max-w-[18rem]" />}
        {/* Acrylic base */}
        <div className="h-4 w-44 rounded-sm bg-gradient-to-b from-white/90 to-sky-100/80 border border-sky-200/70 shadow-md" />
        <div className="h-2 w-52 rounded-full bg-stone-900/15 blur-sm" />
      </div>
      {/* Table surface */}
      <div className="w-full h-16 bg-gradient-to-b from-amber-100 to-amber-200/80 border-t border-amber-200" />
    </div>
  );
}
