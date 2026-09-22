'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Star, Sparkles, ShieldCheck, Truck, ArrowRight,
  Layers, CheckCircle, Heart, Share2, Eye, Shield,
  Layers as LayersIcon, Copy
} from 'lucide-react';
import { Product, formatProductTitle, fetchPublicSettings } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import LiveCustomizerModal from '@/components/LiveCustomizerModal';
import ProductCard from '@/components/ProductCard';

interface Props {
  product: Product;
}

export default function ProductDetailClient({ product }: Props) {
  const { wishlist, toggleWishlist, addToCart } = useCart();
  // Admin-configurable pricing rules (Admin > Settings). Fall back to the historical defaults
  // until settings load, or if the admin has never customized them.
  const [pricingRules, setPricingRules] = useState({ set6Multiplier: 1.4, set8Multiplier: 1.8, dualSideSurcharge: 49 });
  useEffect(() => {
    let cancelled = false;
    fetchPublicSettings()
      .then((s) => {
        if (cancelled) return;
        setPricingRules({
          set6Multiplier: Number(s.magnet_set6_multiplier ?? 1.4) || 1.4,
          set8Multiplier: Number(s.magnet_set8_multiplier ?? 1.8) || 1.8,
          dualSideSurcharge: Number(s.dual_side_surcharge ?? 49) || 49,
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  const [selectedImage, setSelectedImage] = useState(product.image_url);
  const [selectedShape, setSelectedShape] = useState(product.shapes?.[0] || 'Standard');
  const [quantity, setQuantity] = useState(1);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Product type is admin-set (Admin > Products > Customization Type) when available — this is
  // the authoritative signal. Products saved before that field existed (or left as "Standard")
  // default to 'standard' in the DB, so for those we fall back to the old title/category keyword
  // matching for compatibility.
  const hasExplicitProductType = Boolean(product.product_type) && product.product_type !== 'standard';
  const isFridgeMagnet = hasExplicitProductType
    ? product.product_type === 'fridge_magnet'
    : Boolean(
        product.category_slug?.includes('magnet') ||
        product.title?.toLowerCase().includes('magnet') ||
        product.slug?.includes('magnet')
      );
  const [magnetSetOption, setMagnetSetOption] = useState<'Set of 4' | 'Set of 6' | 'Set of 8'>('Set of 4');

  // Dual-side printing options for Car Stand, Car Hanging, Keychain
  const isDualSideEligible = hasExplicitProductType
    ? product.product_type === 'dual_side'
    : Boolean(
        product.category_slug?.includes('car-stand') ||
        product.category_slug?.includes('car-hanging') ||
        product.category_slug?.includes('key') ||
        product.title?.toLowerCase().includes('car stand') ||
        product.title?.toLowerCase().includes('car hanging') ||
        product.title?.toLowerCase().includes('keychain') ||
        product.title?.toLowerCase().includes('charm') ||
        product.slug?.includes('keychain')
      );
  const [printType, setPrintType] = useState<'single' | 'dual'>('single');

  // Calculate dynamic price based on magnet pack or dual-side print (multipliers/surcharge
  // are admin-configurable in Settings, not hardcoded)
  const getDynamicPrice = () => {
    let basePrice = product.price;
    if (isFridgeMagnet) {
      if (magnetSetOption === 'Set of 6') basePrice = Math.round(product.price * pricingRules.set6Multiplier);
      else if (magnetSetOption === 'Set of 8') basePrice = Math.round(product.price * pricingRules.set8Multiplier);
    } else if (isDualSideEligible && printType === 'dual') {
      basePrice = product.price + pricingRules.dualSideSurcharge;
    }
    return basePrice;
  };

  const getDynamicOriginalPrice = () => {
    let baseOriginal = product.original_price;
    if (isFridgeMagnet) {
      if (magnetSetOption === 'Set of 6') baseOriginal = Math.round(product.original_price * pricingRules.set6Multiplier);
      else if (magnetSetOption === 'Set of 8') baseOriginal = Math.round(product.original_price * pricingRules.set8Multiplier);
    } else if (isDualSideEligible && printType === 'dual') {
      baseOriginal = product.original_price + pricingRules.dualSideSurcharge;
    }
    return baseOriginal;
  };

  const activePrice = getDynamicPrice();
  const activeOriginalPrice = getDynamicOriginalPrice();

  const isWishlisted = wishlist.includes(product.id);
  const discountPercent = Math.round(
    ((activeOriginalPrice - activePrice) / activeOriginalPrice) * 100
  );

  const handleQuickAdd = () => {
    addToCart({
      productId: product.id,
      title: product.title,
      slug: product.slug,
      price: activePrice,
      image: product.image_url,
      shape: selectedShape,
      setOption: isFridgeMagnet ? magnetSetOption : undefined,
      printType: isDualSideEligible ? printType : undefined,
      quantity,
    });
  };

  return (
    <div className="min-h-screen bg-stone-50/50 py-6 sm:py-14">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="mb-4 sm:mb-6 flex items-center gap-1.5 sm:gap-2 text-xs text-stone-500 font-medium overflow-x-auto whitespace-nowrap pb-1">
          <Link href="/" className="hover:text-stone-900">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-stone-900">Catalog</Link>
          <span>/</span>
          <Link href={`/shop?category=${product.category_slug}`} className="hover:text-stone-900">
            {product.category_name || product.category_slug}
          </Link>
          <span>/</span>
          <span className="text-stone-900 font-bold truncate max-w-[160px] sm:max-w-[240px]">{product.title}</span>
        </nav>

        {/* Main Product Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-start rounded-2xl sm:rounded-3xl border border-stone-200 bg-white p-4 sm:p-8 lg:p-10 shadow-sm">
          
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
                {isDualSideEligible && (
                  <span className="rounded-full bg-stone-900 px-3 py-1 text-xs font-bold text-amber-300 shadow-md">
                    Dual-Side Printing Available
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
                      selectedImage === img ? 'border-primary-600 ring-2 ring-primary-600/30' : 'border-stone-200 opacity-70 hover:opacity-100'
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
              <span className="text-xs font-bold uppercase tracking-widest text-primary-600">
                {product.category_name || 'Bespoke Keepsake'}
              </span>
              <h1 className="mt-1 text-2xl sm:text-3xl font-black text-stone-900 leading-tight">
                {formatProductTitle(product.title)}
              </h1>

              {/* Rating */}
              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center gap-1 text-primary-600">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary-500 text-primary-500" />
                  ))}
                </div>
                <span className="text-xs font-bold text-stone-900">{product.rating} / 5</span>
                <span className="text-xs text-stone-400">({product.reviews_count} verified reviews)</span>
              </div>
            </div>

            {/* Price section */}
            <div className="flex items-baseline gap-3 rounded-2xl bg-primary-50/70 p-4 border border-primary-100">
              <span className="text-3xl font-black text-primary-700">₹{activePrice}</span>
              <span className="text-base text-stone-400 line-through">₹{activeOriginalPrice}</span>
              <span className="text-xs font-bold text-primary-600">
                You Save ₹{(activeOriginalPrice - activePrice).toFixed(0)} ({discountPercent}% OFF)
              </span>
            </div>

            <p className="text-sm text-stone-600 leading-relaxed">
              {product.description}
            </p>

            {/* Fridge Magnet Set Options (Set of 4, Set of 6, Set of 8) */}
            {isFridgeMagnet && (
              <div className="rounded-2xl border border-primary-200 bg-primary-50/40 p-4 space-y-2.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-stone-900 block">
                  Select Pack Size: <strong className="text-primary-700">{magnetSetOption}</strong>
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['Set of 4', 'Set of 6', 'Set of 8'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setMagnetSetOption(opt)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border text-center ${
                        magnetSetOption === opt
                          ? 'bg-primary-600 text-white border-primary-600 shadow-md ring-2 ring-primary-600/30'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      <span>{opt}</span>
                      <span className="block text-[10px] opacity-80 mt-0.5">
                        {opt === 'Set of 4' ? `₹${product.price}` : opt === 'Set of 6' ? `₹${Math.round(product.price * pricingRules.set6Multiplier)}` : `₹${Math.round(product.price * pricingRules.set8Multiplier)}`}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-primary-800 font-medium">
                  📸 Upload individual photos for each magnet in the live customizer!
                </p>
              </div>
            )}

            {/* Dual-Side Print Selector for Car Stand / Car Hanging / Keychain */}
            {isDualSideEligible && (
              <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4 space-y-2.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-stone-900 block">
                  Printing Option: <strong className="text-primary-700">{printType === 'dual' ? 'Dual-Side (Front & Back)' : 'Single-Side Print'}</strong>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPrintType('single')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border text-center ${
                      printType === 'single'
                        ? 'bg-primary-600 text-white border-primary-600 shadow-md ring-2 ring-primary-600/30'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <span>Single-Side Print</span>
                    <span className="block text-[10px] opacity-80 mt-0.5">Standard (₹{product.price})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPrintType('dual')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border text-center ${
                      printType === 'dual'
                        ? 'bg-primary-600 text-white border-primary-600 shadow-md ring-2 ring-primary-600/30'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <span>✨ Dual-Side Print</span>
                    <span className="block text-[10px] opacity-80 mt-0.5">+₹{pricingRules.dualSideSurcharge} (Both Front & Back)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Shape options */}
            {product.shapes && product.shapes.length > 0 && (
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-stone-900 block mb-2">
                  Choose Acrylic Shape: <strong className="text-primary-600">{selectedShape}</strong>
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {product.shapes.map((shape) => (
                    <button
                      key={shape}
                      type="button"
                      onClick={() => setSelectedShape(shape)}
                      className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                        selectedShape === shape
                          ? 'bg-primary-500 text-white shadow-md shadow-primary-950/20 ring-2 ring-primary-500/20'
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
                className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-primary-500 py-3 text-sm font-bold text-white shadow-md shadow-primary-500/20 hover:bg-primary-600 hover:shadow-lg transition-all"
              >
                <Sparkles className="h-5 w-5 text-primary-200 animate-pulse" />
                <span>Upload Photo & Open Live Customizer</span>
              </button>

              <div className="flex gap-3">
                <div className="flex items-center rounded-xl border border-stone-200 bg-stone-50 px-2">
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
                  className="flex-1 rounded-xl border border-stone-900 bg-stone-900 py-3 text-xs font-bold text-white hover:bg-stone-800 transition-colors"
                >
                  Quick Add (Without Photo Edit)
                </button>
              </div>
            </div>

            {/* Specifications Details */}
            <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-stone-200/60">
                <span className="text-stone-500 font-medium">Material Quality</span>
                <span className="text-stone-900 font-bold">{product.material || 'Cast Acrylic & Japanese UV Ink'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200/60">
                <span className="text-stone-500 font-medium">Dimensions</span>
                <span className="text-stone-900 font-bold">{product.dimensions || 'Bespoke Contour Frame'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200/60">
                <span className="text-stone-500 font-medium">Print Standard</span>
                <span className="text-stone-900 font-bold">1200+ DPI Japanese UV Ink (Fade-proof)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-stone-500 font-medium">Dispatch Speed</span>
                <span className="text-primary-700 font-bold">Dispatched within 24-48 Hours</span>
              </div>
            </div>

            {/* Delivery & Trust Perks */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 rounded-xl bg-white p-3 border border-stone-200 shadow-sm">
                <Truck className="h-4 w-4 text-primary-600 flex-shrink-0" />
                <span className="text-[11px] font-semibold text-stone-700">100% Free Pan-India Delivery</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white p-3 border border-stone-200 shadow-sm">
                <ShieldCheck className="h-4 w-4 text-primary-600 flex-shrink-0" />
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
        initialSetOption={isFridgeMagnet ? magnetSetOption : undefined}
        initialPrintType={isDualSideEligible ? printType : 'single'}
        customPrice={activePrice}
      />
    </div>
  );
}
