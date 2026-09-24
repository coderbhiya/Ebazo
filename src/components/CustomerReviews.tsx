import React from 'react';
import Link from 'next/link';
import { Star, CheckCircle2 } from 'lucide-react';
import { HomeReview } from '@/lib/api';
import Carousel from './home/Carousel';

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  reviews: HomeReview[];
  stats?: { count: number; average: number | null };
}

function timeAgo(date: string): string {
  const days = Math.floor((Date.now() - new Date(date.replace(' ', 'T')).getTime()) / 86400000);
  if (!Number.isFinite(days) || days < 1) return 'Today';
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${days >= 14 ? 's' : ''} ago`;
  if (days < 365) return `${Math.floor(days / 30)} month${days >= 60 ? 's' : ''} ago`;
  return `${Math.floor(days / 365)} year${days >= 730 ? 's' : ''} ago`;
}

// Approved customer reviews (Admin > Reviews; featured ones first)
export default function CustomerReviews({ eyebrow, title, subtitle, reviews, stats }: Props) {
  if (reviews.length === 0) return null;
  return (
    <section className="py-10 sm:py-20 bg-stone-50 border-b border-stone-200">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-14">
          {eyebrow && <span className="text-xs font-bold uppercase tracking-wider text-primary-600">{eyebrow}</span>}
          <h2 className="mt-1 sm:mt-2 text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900">{title}</h2>
          {subtitle && <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-stone-600">{subtitle}</p>}
          {stats && stats.count > 0 && stats.average !== null && (
            <div className="mt-2 sm:mt-3 flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.round(stats.average!) ? 'fill-primary-500 text-primary-500' : 'text-stone-300'}`}
                />
              ))}
              <span className="ml-2 text-xs sm:text-sm font-bold text-stone-800">{stats.average} out of 5</span>
              <span className="text-[11px] sm:text-xs text-stone-500">
                ({stats.count} Verified Review{stats.count > 1 ? 's' : ''})
              </span>
            </div>
          )}
        </div>

        <Carousel className="-mx-3 flex snap-x snap-mandatory gap-4 overflow-x-auto px-3 scroll-px-3 pb-2 no-scrollbar md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:scroll-px-0 lg:grid-cols-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="w-[82%] flex-shrink-0 snap-start md:w-auto flex flex-col justify-between rounded-3xl border border-stone-200 bg-white p-6 shadow-sm hover:shadow-xl hover:border-primary-300 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i < rev.rating ? 'fill-primary-500 text-primary-500' : 'text-stone-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-stone-400">{timeAgo(rev.created_at)}</span>
                </div>
                {rev.title && <h3 className="text-sm font-bold text-stone-900 mb-1">{rev.title}</h3>}
                <p className="text-xs text-stone-700 italic leading-relaxed mb-4">&ldquo;{rev.comment}&rdquo;</p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center gap-3">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-black text-primary-700">
                  {rev.customer_name.trim().charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <h4 className="text-xs font-bold text-stone-900 truncate">{rev.customer_name}</h4>
                    <CheckCircle2 className="h-3 w-3 flex-shrink-0 text-primary-600" />
                  </div>
                  <p className="text-[10px] text-stone-500">Verified Buyer</p>
                  {rev.product_title && (
                    <Link
                      href={rev.product_slug ? `/product/${rev.product_slug}` : '/shop'}
                      className="block text-[10px] font-semibold text-primary-600 truncate max-w-[170px] hover:underline"
                    >
                      {rev.product_title}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
