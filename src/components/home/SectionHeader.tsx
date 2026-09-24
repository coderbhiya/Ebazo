import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  tone?: 'light' | 'dark';
}

// Heading row shared by homepage sections; all text comes from Admin > Homepage
export default function SectionHeader({ eyebrow, title, subtitle, href, linkLabel = 'View All', tone = 'light' }: Props) {
  const dark = tone === 'dark';
  return (
    <div className="flex items-end justify-between gap-4 mb-6 sm:mb-10">
      <div className="min-w-0">
        {eyebrow && (
          <span className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider ${dark ? 'text-primary-300' : 'text-primary-600'}`}>
            {eyebrow}
          </span>
        )}
        <h2 className={`mt-1 text-xl sm:text-3xl lg:text-4xl font-black tracking-tight ${dark ? 'text-white' : 'text-stone-900'}`}>
          {title}
        </h2>
        {subtitle && (
          <p className={`mt-1 sm:mt-2 text-xs sm:text-sm max-w-xl ${dark ? 'text-stone-400' : 'text-stone-600'}`}>{subtitle}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="group flex-shrink-0 inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
        >
          <span>{linkLabel}</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  );
}
