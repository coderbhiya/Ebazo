'use client';

import React from 'react';
import Link from 'next/link';

export default function MidPromoBanner() {
  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-2 sm:py-5">
      <div className="overflow-hidden rounded-2xl sm:rounded-3xl bg-stone-900 shadow-sm hover:shadow-lg transition-all duration-300">
        <Link
          href="/shop"
          className="group block relative w-full aspect-[16/8] sm:aspect-[21/8] lg:aspect-[24/8] overflow-hidden"
          aria-label="Shop Luxury Personalized Keepsakes"
        >
          <img
            src="/banners/mid_luxury_gifting_banner.jpg"
            alt="Personalized Photo Gifts & Bespoke Keepsakes"
            className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.015]"
          />
        </Link>
      </div>
    </section>
  );
}
