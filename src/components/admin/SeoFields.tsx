'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { DESCRIPTION_LIMIT, TITLE_LIMIT } from '@/lib/seo-pages';

interface Props {
  title: string;
  description: string;
  onChange: (patch: { title?: string; description?: string }) => void;
  // What the page shows when a field is left empty
  defaultTitle: string;
  defaultDescription: string;
  // Shown in the Google preview, e.g. "ebanzo.com › shop"
  urlPath?: string;
  compact?: boolean;
}

const inputClass =
  'w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-primary-500';

function Counter({ length, limit }: { length: number; limit: number }) {
  return (
    <span className={`font-mono text-[10px] ${length > limit ? 'text-amber-400' : 'text-stone-500'}`}>
      {length}/{limit}
    </span>
  );
}

// SEO title + meta description with a Google-style preview. Empty fields fall back to the
// defaults shown as placeholders.
export default function SeoFields({ title, description, onChange, defaultTitle, defaultDescription, urlPath, compact }: Props) {
  const shownTitle = title.trim() || defaultTitle;
  const shownDescription = description.trim() || defaultDescription;

  return (
    <div className={compact ? 'space-y-2.5' : 'space-y-3'}>
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-[11px] font-bold text-stone-400">SEO title (browser tab &amp; Google)</label>
          <Counter length={shownTitle.length} limit={TITLE_LIMIT} />
        </div>
        <input className={inputClass} value={title} placeholder={defaultTitle} onChange={(e) => onChange({ title: e.target.value })} />
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-[11px] font-bold text-stone-400">Meta description</label>
          <Counter length={shownDescription.length} limit={DESCRIPTION_LIMIT} />
        </div>
        <textarea
          rows={compact ? 2 : 3}
          className={inputClass}
          value={description}
          placeholder={defaultDescription}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </div>

      {/* Google result preview */}
      <div className="rounded-xl border border-stone-800 bg-white p-3">
        <p className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
          <Search className="h-3 w-3" /> Google preview
        </p>
        {urlPath && <p className="truncate text-[11px] text-stone-600">ebanzo.com{urlPath === '/' ? '' : ` › ${urlPath.replace(/^\//, '').split('/').join(' › ')}`}</p>}
        <p className="truncate text-[15px] leading-snug text-[#1a0dab]">{shownTitle}</p>
        <p className="line-clamp-2 text-[12px] leading-snug text-stone-600">{shownDescription}</p>
      </div>
    </div>
  );
}
