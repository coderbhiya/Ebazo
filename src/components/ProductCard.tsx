'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, Heart, Sparkles, SlidersHorizontal } from 'lucide-react';
import { Product, formatProductTitle } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import LiveCustomizerModal from './LiveCustomizerModal';

interface Props {
  product: Product;
}

// Light product tile: borderless image, one badge, title, rating and price. The whole card
// opens the product; the round button on the image opens the customizer directly.
export default function ProductCard({ product }: Props) {
  const { wishlist, toggleWishlist } = useCart();
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const isWishlisted = wishlist.includes(product.id);
  const hasVariations = Boolean(product.has_variations) && product.min_price != null;
  const href = `/product/${product.slug}`;
  const title = formatProductTitle(product.title);

  // Guard against a missing MRP (0 would give Infinity/NaN badges)
  const discountPercent = !hasVariations && product.original_price > 0
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <>
      <div className="group relative flex flex-col">
        {/* Image */}
        {/* Catalog photos are white acrylic cutouts, so a toned backdrop + soft shadow makes the shape read */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-br from-stone-200 via-stone-100 to-primary-100/60">
          <Link href={href} aria-label={title}>
            <img
              src={product.image_url && product.image_url.trim() ? product.image_url : '/frames/photostand/1_nos_a.png'}
              alt={title}
              loading="lazy"
              className="h-full w-full object-contain p-4 sm:p-5 drop-shadow-[0_8px_14px_rgba(28,25,23,0.18)] transition-transform duration-500 ease-out group-hover:scale-[1.05]"
            />
          </Link>

          {/* One badge only: bestseller wins, else the discount */}
          {product.is_bestseller === 1 ? (
            <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-stone-800 backdrop-blur-sm">
              Bestseller
            </span>
          ) : discountPercent > 0 ? (
            <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-emerald-700 backdrop-blur-sm">
              {discountPercent}% off
            </span>
          ) : null}

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product.id);
            }}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-stone-600 backdrop-blur-sm transition-colors hover:bg-white hover:text-rose-500"
            title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          {/* Quick action: customize now, or pick options first for variable products */}
          {hasVariations ? (
            <Link
              href={href}
              aria-label="Choose options"
              className="absolute bottom-2 right-2 flex h-9 w-9 sm:w-auto items-center justify-center gap-1.5 rounded-full bg-white/95 sm:px-3 text-[11px] font-bold text-stone-900 shadow-sm backdrop-blur-sm transition-all hover:bg-stone-900 hover:text-white sm:translate-y-1 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Options</span>
            </Link>
          ) : (
            <button
              type="button"
              aria-label="Customize"
              onClick={() => setIsCustomizerOpen(true)}
              className="absolute bottom-2 right-2 flex h-9 w-9 sm:w-auto items-center justify-center gap-1.5 rounded-full bg-white/95 sm:px-3 text-[11px] font-bold text-stone-900 shadow-sm backdrop-blur-sm transition-all hover:bg-stone-900 hover:text-white sm:translate-y-1 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Customize</span>
            </button>
          )}
        </div>

        {/* Text */}
        <Link href={href} className="mt-2.5 block px-0.5">
          <h3 className="line-clamp-1 text-[13px] sm:text-sm font-semibold text-stone-800 transition-colors group-hover:text-primary-600">
            {title}
          </h3>

          <div className="mt-1 flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-1.5">
              {hasVariations ? (
                <span className="text-sm sm:text-[15px] font-bold text-stone-900">
                  {product.min_price !== product.max_price && <span className="mr-0.5 text-[11px] font-medium text-stone-500">From</span>}
                  ₹{Number(product.min_price)}
                </span>
              ) : (
                <>
                  <span className="text-sm sm:text-[15px] font-bold text-stone-900">₹{product.price}</span>
                  {product.original_price > product.price && (
                    <span className="text-[11px] text-stone-400 line-through">₹{product.original_price}</span>
                  )}
                </>
              )}
            </div>
            {Number(product.rating) > 0 && (
              <span className="flex flex-shrink-0 items-center gap-0.5 text-[11px] font-medium text-stone-500">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {product.rating}
              </span>
            )}
          </div>
        </Link>
      </div>

      {/* Live Customizer Modal attached to this card */}
      <LiveCustomizerModal
        product={product}
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
      />
    </>
  );
}
