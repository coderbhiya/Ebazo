import React from 'react';
import Link from 'next/link';
import { BannerContent } from '@/lib/api';

// Single wide banner (Admin > Homepage > Mid Banner)
export default function MidPromoBanner({ banner }: { banner: BannerContent }) {
  if (banner.enabled === false || !banner.image) return null;
  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-2 sm:py-5">
      <div className="overflow-hidden rounded-2xl sm:rounded-3xl bg-stone-100 shadow-sm hover:shadow-lg transition-all duration-300">
        <Link
          href={banner.link || '/shop'}
          className="group block relative w-full aspect-[16/8] sm:aspect-[21/8] lg:aspect-[24/8] overflow-hidden"
          aria-label={banner.alt || 'Shop now'}
        >
          <picture>
            {banner.mobile_image && <source media="(max-width: 639px)" srcSet={banner.mobile_image} />}
            <img
              src={banner.image}
              alt={banner.alt || ''}
              className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.015]"
            />
          </picture>
        </Link>
      </div>
    </section>
  );
}
