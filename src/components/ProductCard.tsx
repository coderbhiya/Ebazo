'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, Heart, Sparkles, ArrowRight } from 'lucide-react';
import { Product } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import LiveCustomizerModal from './LiveCustomizerModal';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { wishlist, toggleWishlist } = useCart();
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const isWishlisted = wishlist.includes(product.id);

  const discountPercent = Math.round(
    ((product.original_price - product.price) / product.original_price) * 100
  );

  return (
    <>
      <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-stone-200/80 bg-white p-3.5 shadow-sm hover:shadow-2xl hover:border-violet-300 transition-all duration-300 hover:-translate-y-1">
        {/* Image Frame */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-stone-100 mb-3.5">
          <Link href={`/product/${product.slug}`}>
            <img
              src={product.image_url}
              alt={product.title}
              className="h-full w-full object-cover group-hover:scale-106 transition-transform duration-500"
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {discountPercent > 0 && (
              <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-sm">
                -{discountPercent}%
              </span>
            )}
            {product.is_bestseller === 1 && (
              <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-extrabold text-stone-950 shadow-sm">
                Bestseller
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product.id);
            }}
            className="absolute top-2.5 right-2.5 rounded-full bg-white/90 p-2 text-stone-700 shadow backdrop-blur-sm hover:bg-white hover:text-rose-600 transition-colors"
            title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
          </button>

          {/* Quick Shape Indicator Pill */}
          {product.shapes && product.shapes.length > 0 && (
            <div className="absolute bottom-2.5 left-2.5 right-2.5">
              <span className="rounded-xl bg-stone-950/75 px-2.5 py-1 text-[10px] font-semibold text-stone-200 backdrop-blur-md flex items-center justify-between">
                <span>{product.shapes.length} Shapes Available</span>
                <span className="text-amber-300">UV Print</span>
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-amber-500 mb-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-stone-900">{product.rating}</span>
              <span className="text-stone-400">({product.reviews_count})</span>
            </div>

            <Link href={`/product/${product.slug}`}>
              <h3 className="text-sm font-bold text-stone-900 line-clamp-1 group-hover:text-violet-700 transition-colors">
                {product.title}
              </h3>
            </Link>

            <p className="mt-1 text-xs text-stone-500 line-clamp-2 leading-relaxed">
              {product.short_desc}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-violet-900">₹{product.price}</span>
              <span className="text-xs text-stone-400 line-through">₹{product.original_price}</span>
            </div>

            <button
              type="button"
              onClick={() => setIsCustomizerOpen(true)}
              className="flex items-center gap-1 rounded-xl bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-700 hover:text-white transition-all shadow-sm"
            >
              <Sparkles className="h-3 w-3" />
              <span>Customize</span>
            </button>
          </div>
        </div>
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
