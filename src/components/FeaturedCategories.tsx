'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Category } from '@/lib/api';

interface Props {
  categories: Category[];
}

export default function FeaturedCategories({ categories }: Props) {
  return (
    <section className="py-12 sm:py-16 bg-stone-50/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary-600 mb-2">
              <span>Bespoke Collections</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">
              Explore Our Personalized Categories
            </h2>
            <p className="mt-2 text-sm text-stone-600 max-w-xl">
              Every item is tailored with your choice of image, laser cut with millimeter precision, and cured with high-density UV print.
            </p>
          </div>
          <Link
            href="/shop"
            className="group mt-4 sm:mt-0 inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {categories
            .filter((c) => !c.parent_id || c.parent_id === null)
            .map((cat) => {
              const imageSrc = cat.image_url && cat.image_url.trim().length > 0 
                ? cat.image_url 
                : '/frames/fridge-magnet/1_nos_a.png';

              return (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white p-3 shadow-sm hover:shadow-xl hover:border-primary-300 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-stone-100 mb-3">
                    <img
                      src={imageSrc}
                      alt={cat.name}
                      className="h-full w-full object-cover group-hover:scale-108 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity" />
                    {cat.product_count !== undefined && cat.product_count > 0 && (
                      <span className="absolute top-2.5 right-2.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-extrabold text-primary-700 shadow backdrop-blur-sm">
                        {cat.product_count} Items
                      </span>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <h3 className="text-sm font-bold text-stone-900 group-hover:text-primary-600 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="mt-1 text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-stone-100 text-[11px] font-semibold text-primary-600">
                      <span>Customize Now</span>
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>
      </div>
    </section>
  );
}
