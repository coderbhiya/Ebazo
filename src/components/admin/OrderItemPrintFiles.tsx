'use client';

import React from 'react';
import { Download, AlertTriangle, CheckCircle2, Image as ImageIcon } from 'lucide-react';

interface ItemLike {
  print_ready_artwork_url?: string | null;
  custom_photo_url?: string | null;
  shape_selected?: string | null;
}

interface SlotSpec {
  slot?: number;
  name?: string;
  photoUrl?: string;
  artworkUrl?: string;
  shape?: string;
  frameUrl?: string;
}

// The parts of an order item's customization_json that describe what to print
export interface PrintSpecs {
  frameImage?: string;
  printType?: string;
  multiImages?: SlotSpec[];
  frontPhotoUrl?: string;
  backPhotoUrl?: string;
  frontArtworkUrl?: string;
  backArtworkUrl?: string;
}

interface PrintRow {
  label: string;
  artwork?: string | null; // cut-out, print-ready PNG
  photo?: string | null; // customer's original upload
  frame?: string | null; // cutout mask used
  shape?: string | null;
}

// Every photo that has to be printed for an order item, from whichever flow created it
// (single photo, dual-side front/back, magnet set / mini gallery slots).
export function getPrintRows(item: ItemLike, specs: PrintSpecs | null | undefined): PrintRow[] {
  const frame = specs?.frameImage || null;
  const multi: SlotSpec[] = Array.isArray(specs?.multiImages) ? specs.multiImages : [];
  if (multi.length) {
    return multi
      .filter((m) => m && (m.artworkUrl || m.photoUrl))
      .map((m, i) => ({
        label: m.name || `Photo ${m.slot ?? i + 1}`,
        artwork: m.artworkUrl,
        photo: m.photoUrl,
        frame: m.frameUrl || frame,
        shape: m.shape || item.shape_selected,
      }));
  }
  if (specs?.printType === 'dual' || specs?.backPhotoUrl || specs?.backArtworkUrl) {
    return [
      {
        label: 'Front',
        artwork: specs?.frontArtworkUrl || item.print_ready_artwork_url,
        photo: specs?.frontPhotoUrl || item.custom_photo_url,
        frame,
        shape: item.shape_selected,
      },
      { label: 'Back', artwork: specs?.backArtworkUrl, photo: specs?.backPhotoUrl, frame, shape: item.shape_selected },
    ].filter((r) => r.artwork || r.photo);
  }
  if (item.print_ready_artwork_url || item.custom_photo_url) {
    return [{ label: 'Photo', artwork: item.print_ready_artwork_url, photo: item.custom_photo_url, frame, shape: item.shape_selected }];
  }
  return [];
}

const checkered =
  'bg-[conic-gradient(#292524_25%,#1c1917_0_50%,#292524_0_75%,#1c1917_0)] bg-[length:10px_10px]';

function Thumb({ src, dark, label }: { src?: string | null; dark?: boolean; label: string }) {
  if (!src) {
    return (
      <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg border border-dashed border-stone-700 text-stone-600">
        <ImageIcon className="h-5 w-5" />
      </span>
    );
  }
  return (
    <a href={src} target="_blank" rel="noreferrer" title={`Open ${label}`} className="flex-shrink-0">
      <img
        src={src}
        alt={label}
        className={`h-16 w-16 max-w-none rounded-lg border border-stone-700 object-contain ${dark ? 'bg-stone-700 p-1' : checkered}`}
      />
    </a>
  );
}

function DownloadLink({ href, children, primary }: { href: string; children: React.ReactNode; primary?: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      download
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold transition-colors ${
        primary
          ? 'bg-emerald-600 text-white hover:bg-emerald-500'
          : 'border border-stone-700 bg-stone-800 text-stone-200 hover:bg-stone-700'
      }`}
    >
      <Download className="h-3 w-3" />
      {children}
    </a>
  );
}

export default function OrderItemPrintFiles({ item, specs }: { item: ItemLike; specs: PrintSpecs | null | undefined }) {
  const rows = getPrintRows(item, specs);
  const missing = rows.filter((r) => !r.artwork).length;

  if (!rows.length) {
    return (
      <p className="rounded-lg border border-stone-800 bg-stone-950 px-3 py-2 text-[11px] text-stone-400">
        No customer photo on this item (added without photo customization).
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-stone-800 bg-stone-950">
      <div className="flex items-center justify-between border-b border-stone-800 px-3 py-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
          Print files ({rows.length})
        </span>
        {missing ? (
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-300">
            <AlertTriangle className="h-3.5 w-3.5" /> {missing} missing print file{missing > 1 ? 's' : ''}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" /> All print-ready
          </span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-xs">
          <thead className="text-[10px] uppercase tracking-wider text-stone-500">
            <tr className="border-b border-stone-800">
              <th className="px-3 py-2 font-semibold">Item</th>
              <th className="px-3 py-2 font-semibold">Print file (cut-out)</th>
              <th className="px-3 py-2 font-semibold">Frame / shape</th>
              <th className="px-3 py-2 font-semibold">Original photo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-stone-800/60 last:border-0 align-top">
                <td className="px-3 py-2.5 font-bold text-stone-200 whitespace-nowrap">{r.label}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Thumb src={r.artwork} label={`${r.label} print file`} />
                    {r.artwork ? (
                      <DownloadLink href={r.artwork} primary>Print file</DownloadLink>
                    ) : (
                      <span className="max-w-[180px] text-[11px] font-semibold leading-snug text-amber-300">
                        Missing — don&apos;t print the raw photo; the cut-out wasn&apos;t saved.
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Thumb src={r.frame} dark label="frame" />
                    <span className="text-[11px] font-semibold text-stone-300 whitespace-nowrap">{r.shape || '—'}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Thumb src={r.photo} dark label={`${r.label} original photo`} />
                    {r.photo && <DownloadLink href={r.photo}>Original</DownloadLink>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
