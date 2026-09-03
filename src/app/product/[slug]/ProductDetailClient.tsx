'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Star, Sparkles, ShieldCheck, Truck, ArrowRight, 
  Layers, CheckCircle, Heart, Share2, Eye, Shield 
} from 'lucide-react';
import { Product } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import LiveCustomizerModal from '@/components/LiveCustomizerModal';
import ProductCard from '@/components/ProductCard';

interface Props {
  product: Product;
}

export default function ProductDetailClient({ product }: Props) {
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(product.image_url);
  const [selectedShape, setSelectedShape] = useState(product.shapes[0] || 'Standard');
  const [quantity, setQuantity] = useState(1);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  const isWishlisted = wishlist.includes(product.id);
  const discountPercent = Math.round(
    ((product.original_price - product.price) / product.original_price) * 100
  );

  const handleQuickAdd = () => {
    addToCart({
      productId: product.id,
      title: product.title,
      slug: product.slug,
      price: product.price,
      image: product.image_url,
      shape: selectedShape,
      quantity,
    });
  };

  return (
    <div className="min-h-screen bg-stone-50/50 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-stone-500 font-medium">
          <Link href="/" className="hover:text-stone-900">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-stone-900">Catalog</Link>
          <span>/</span>
          <Link href={`/shop?category=${product.category_slug}`} className="hover:text-stone-900">
            {product.category_name || product.category_slug}
          </Link>
          <span>/</span>
          <span className="text-stone-900 font-bold truncate max-w-[200px]">{product.title}</span>
        </nav>

        {/* Main Product Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start rounded-3xl border border-stone-200 bg-white p-6 sm:p-10 shadow-sm">
          
          {/* Left: Images Showcase */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-stone-200 bg-stone-100">
              <img
                src={selectedImage}
                alt={product.title}
                className="h-full w-full object-cover"
              />
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {discountPercent > 0 && (
                  <span className="rounded-full bg-rose-600 px-3 py-1 text-xs font-black text-white shadow-md">
                    SAVE {discountPercent}%
                  </span>
                )}
                {product.is_bestseller === 1 && (
                  <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-stone-950 shadow-md">
                    ⭐ Top Rated Bestseller
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-4 right-4 rounded-full bg-white/90 p-2.5 text-stone-700 shadow backdrop-blur-sm hover:text-rose-600"
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
              </button>
            </div>

            {/* Thumbnails Carousel */}
            {product.gallery && product.gallery.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.gallery.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${
                      selectedImage === img ? 'border-violet-600 ring-2 ring-violet-600/30' : 'border-stone-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Actions & Specs */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-violet-700">
                {product.category_name || 'Bespoke Keepsake'}
              </span>
              <h1 className="mt-1 text-2xl sm:text-3xl font-black text-stone-900 leading-tight">
                {product.title}
              </h1>

              {/* Rating */}
              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-bold text-stone-900">{product.rating} / 5</span>
                <span className="text-xs text-stone-400">({product.reviews_count} verified reviews)</span>
              </div>
            </div>

            {/* Price section */}
            <div className="flex items-baseline gap-3 rounded-2xl bg-violet-50/70 p-4 border border-violet-100">
              <span className="text-3xl font-black text-violet-950">₹{product.price}</span>
              <span className="text-base text-stone-400 line-through">₹{product.original_price}</span>
              <span className="text-xs font-bold text-emerald-700">
                You Save ₹{(product.original_price - product.price).toFixed(0)} ({discountPercent}% OFF)
              </span>
            </div>

            <p className="text-sm text-stone-600 leading-relaxed">
              {product.description}
            </p>

            {/* Shape options */}
            {product.shapes && product.shapes.length > 0 && (
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-stone-900 block mb-2">
                  Choose Contour Cut Shape: <strong className="text-violet-700">{selectedShape}</strong>
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {product.shapes.map((shape) => (
                    <button
                      key={shape}
                      type="button"
                      onClick={() => setSelectedShape(shape)}
                      className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                        selectedShape === shape
                          ? 'bg-violet-700 text-white shadow-md shadow-violet-600/30 ring-2 ring-violet-700/20'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {shape}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Main CTA Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCustomizerOpen(true)}
                className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-700 to-indigo-700 py-4 text-sm font-black text-white shadow-xl shadow-violet-600/30 hover:brightness-110 transition-all hover:scale-[1.01]"
              >
                <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
                <span>Upload Photo & Open Live Customizer</span>
              </button>

              <div className="flex gap-3">
                <div className="flex items-center rounded-2xl border border-stone-200 bg-stone-50 px-3">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 text-stone-600 hover:text-stone-900 font-bold"
                  >
                    -
                  </button>
                  <span className="px-3 text-sm font-bold text-stone-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2 text-stone-600 hover:text-stone-900 font-bold"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleQuickAdd}
                  className="flex-1 rounded-2xl border-2 border-stone-900 bg-stone-900 py-3.5 text-xs font-extrabold text-white hover:bg-stone-800 transition-colors"
                >
                  Quick Add (Without Photo Edit)
                </button>
              </div>
            </div>

            {/* Specifications Details */}
            <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-stone-200/60">
                <span className="text-stone-500 font-medium">Material Quality</span>
                <span className="text-stone-900 font-bold">{product.material || 'Cast Acrylic & UV Ink'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200/60">
                <span className="text-stone-500 font-medium">Dimensions</span>
                <span className="text-stone-900 font-bold">{product.dimensions || 'Custom Contour Cut'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200/60">
                <span className="text-stone-500 font-medium">Print Standard</span>
                <span className="text-stone-900 font-bold">1200+ DPI Japanese UV Ink (Fade-proof)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-stone-500 font-medium">Dispatch Speed</span>
                <span className="text-emerald-700 font-bold">Dispatched within 24-48 Hours</span>
              </div>
            </div>

            {/* Delivery & Trust Perks */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 rounded-xl bg-white p-3 border border-stone-200 shadow-sm">
                <Truck className="h-4 w-4 text-violet-600 flex-shrink-0" />
                <span className="text-[11px] font-semibold text-stone-700">Free delivery over ₹499</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white p-3 border border-stone-200 shadow-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span className="text-[11px] font-semibold text-stone-700">99.8% Print Precision</span>
              </div>
            </div>

          </div>
        </div>

        {/* Related Products in Same Category */}
        {product.related && product.related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-black text-stone-900 mb-6">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {product.related.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Interactive Customizer Modal */}
      <LiveCustomizerModal
        product={product}
        selectedShape={selectedShape}
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
      />
    </div>
  );
}
