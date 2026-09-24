'use client';

import React from 'react';
import Link from 'next/link';
import { Category } from '@/lib/api';
import SectionHeader from './home/SectionHeader';
import FallbackImg from './FallbackImg';
import Carousel from './home/Carousel';

interface Props {
  categories: Category[];
  eyebrow?: string;
  title: string;
  subtitle?: string;
  // Fallback tile image per category id (first product photo) when the category has none
  fallbackImages?: Record<number, string>;
}

// Category tiles: swipeable carousel on mobile, grid on larger screens (Admin > Categories)
export default function FeaturedCategories({ categories, eyebrow, title, subtitle, fallbackImages = {} }: Props) {
  const visible = categories.filter((c) => !c.parent_id && (c.product_count ?? 1) > 0);
  if (visible.length === 0) return null;

  return (
    <section className="py-8 sm:py-16 bg-stone-50/70">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <SectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} href="/shop" linkLabel="View Full Catalog" />

        <Carousel className="-mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 scroll-px-3 pb-2 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 sm:scroll-px-0 lg:grid-cols-4 xl:grid-cols-5">
          {visible.map((cat) => {
            return (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group flex w-[38%] flex-shrink-0 snap-start flex-col sm:w-auto"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-br from-stone-200 via-stone-100 to-primary-100/60">
                  <FallbackImg
                    src={cat.image_url?.trim() || ''}
                    // A missing/broken upload falls back to the category's first product photo
                    fallback={fallbackImages[cat.id]}
                    alt={cat.name}
                    className="h-full w-full object-contain p-4 drop-shadow-[0_8px_14px_rgba(28,25,23,0.18)] transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                  />
                </div>
                <div className="mt-2 flex items-baseline justify-between gap-2 px-0.5">
                  <h3 className="line-clamp-1 text-[13px] sm:text-sm font-semibold text-stone-800 transition-colors group-hover:text-primary-600">
                    {cat.name}
                  </h3>
                  {(cat.product_count ?? 0) > 0 && (
                    <span className="flex-shrink-0 text-[11px] text-stone-400">{cat.product_count}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </Carousel>
      </div>
    </section>
  );
}
