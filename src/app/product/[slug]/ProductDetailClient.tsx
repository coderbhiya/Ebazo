'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Star, Sparkles, ShieldCheck, Truck, ArrowRight,
  Layers, CheckCircle, Heart, Share2, Eye, Shield,
  Layers as LayersIcon, Copy
} from 'lucide-react';
import { Product, formatProductTitle, fetchPublicSettings } from '@/lib/api';
import { useShapeFrames } from '@/lib/frames';
import {
  DEFAULT_MINI_GALLERY_RULES, framesLabel, isMiniGalleryProduct, miniGalleryPrice, parseMiniGalleryRules,
} from '@/lib/pricing';
import {
  findVariation, isOptionAvailable, selectionLabel, variationAttributes, variationMatches,
} from '@/lib/variations';
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
  const [galleryRules, setGalleryRules] = useState(DEFAULT_MINI_GALLERY_RULES);
  // Mini gallery: how many frames (photos) the customer wants
  const isMiniGallery = isMiniGalleryProduct(product);
  const [galleryFrames, setGalleryFrames] = useState(DEFAULT_MINI_GALLERY_RULES.baseFrames);
  useEffect(() => {
    // Keep the choice valid when the admin's allowed counts load
    if (!galleryRules.counts.includes(galleryFrames)) {
      setGalleryFrames(galleryRules.counts.includes(galleryRules.baseFrames) ? galleryRules.baseFrames : galleryRules.counts[0]);
    }
  }, [galleryRules]);
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
        setGalleryRules(parseMiniGalleryRules(s as unknown as Record<string, unknown>));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  const [selectedImage, setSelectedImage] = useState(product.image_url);
  const [selectedShape, setSelectedShape] = useState(product.shapes?.[0] || 'Standard');
  // Real frame image per shape (matched by name and verified to exist)
  const shapeFrames = useShapeFrames(product);
  // Once frames are verified, preselect the frame the product is pictured with (shape buttons
  // only render after this, so there's no customer choice to override)
  useEffect(() => {
    if (shapeFrames.ready && shapeFrames.defaultLabel) setSelectedShape(shapeFrames.defaultLabel);
  }, [shapeFrames.ready]);
  const selectedFrameUrl = shapeFrames.options.find((o) => o.label === selectedShape)?.url;
  const [quantity, setQuantity] = useState(1);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // WooCommerce-style variations (Admin > Products > Attributes & Variations)
  const choiceAttributes = variationAttributes(product.attributes);
  const hasVariations = choiceAttributes.length > 0 && (product.variations?.length ?? 0) > 0;
  // Preselect the first in-stock variation, resolving any "Any" value to the first option
  const [selection, setSelection] = useState<Record<string, string>>(() => {
    if (!hasVariations) return {};
    const vs = product.variations!;
    const first = vs.find((v) => v.stock > 0) || vs[0];
    return Object.fromEntries(choiceAttributes.map((a) => [a.name, first.attributes[a.name] || a.options[0]]));
  });
  const selectedVariation = hasVariations ? findVariation(product.variations, product.attributes, selection) : null;
  const isOutOfStock = hasVariations ? !selectedVariation || selectedVariation.stock <= 0 : product.stock <= 0;
  const needsSelection = hasVariations && !selectedVariation;

  const chooseOption = (attrName: string, option: string) => {
    const next = { ...selection, [attrName]: option };
    // If that combination doesn't exist, keep the new choice and move the other attributes to
    // the closest valid combination instead of leaving the customer on a dead end.
    if (!findVariation(product.variations, product.attributes, next)) {
      const fallback = product.variations!.find((v) => variationMatches(v, { [attrName]: option }));
      if (fallback) {
        for (const a of choiceAttributes) {
          if (a.name !== attrName) next[a.name] = fallback.attributes[a.name] || next[a.name] || a.options[0];
        }
      }
    }
    setSelection(next);
  };

  // Show the variation's own image when it has one
  useEffect(() => {
    if (selectedVariation?.image_url) setSelectedImage(selectedVariation.image_url);
  }, [selectedVariation?.id]);

  const variationBasePrice = selectedVariation ? selectedVariation.price : product.price;
  const variationBaseOriginal = selectedVariation
    ? selectedVariation.original_price ?? Math.max(selectedVariation.price, product.original_price)
    : product.original_price;

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
    let basePrice = variationBasePrice;
    if (isFridgeMagnet) {
      if (magnetSetOption === 'Set of 6') basePrice = Math.round(variationBasePrice * pricingRules.set6Multiplier);
      else if (magnetSetOption === 'Set of 8') basePrice = Math.round(variationBasePrice * pricingRules.set8Multiplier);
    } else if (isMiniGallery) {
      basePrice = miniGalleryPrice(variationBasePrice, galleryFrames, galleryRules);
    } else if (isDualSideEligible && printType === 'dual') {
      basePrice = variationBasePrice + pricingRules.dualSideSurcharge;
    }
    return basePrice;
  };

  const getDynamicOriginalPrice = () => {
    let baseOriginal = variationBaseOriginal;
    if (isFridgeMagnet) {
      if (magnetSetOption === 'Set of 6') baseOriginal = Math.round(variationBaseOriginal * pricingRules.set6Multiplier);
      else if (magnetSetOption === 'Set of 8') baseOriginal = Math.round(variationBaseOriginal * pricingRules.set8Multiplier);
    } else if (isMiniGallery) {
      baseOriginal = miniGalleryPrice(variationBaseOriginal, galleryFrames, galleryRules);
    } else if (isDualSideEligible && printType === 'dual') {
      baseOriginal = variationBaseOriginal + pricingRules.dualSideSurcharge;
    }
    return baseOriginal;
  };

  const activePrice = getDynamicPrice();
  const activeOriginalPrice = getDynamicOriginalPrice();

  const isWishlisted = wishlist.includes(product.id);
  const discountPercent = activeOriginalPrice > 0
    ? Math.max(0, Math.round(((activeOriginalPrice - activePrice) / activeOriginalPrice) * 100))
    : 0;
  const variationLabelText = selectedVariation ? selectionLabel(selection, product.attributes) : undefined;

  const handleQuickAdd = () => {
    if (needsSelection || isOutOfStock) return;
    addToCart({
      productId: product.id,
      title: product.title,
      slug: product.slug,
      price: activePrice,
      image: selectedVariation?.image_url || product.image_url,
      shape: variationLabelText || selectedShape,
      variationId: selectedVariation?.id,
      variationLabel: variationLabelText,
      variationSelection: selectedVariation ? selection : undefined,
      setOption: isFridgeMagnet ? magnetSetOption : isMiniGallery ? framesLabel(galleryFrames) : undefined,
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

            {/* Variation selectors (admin-defined attributes) */}
            {hasVariations && (
              <div className="space-y-4">
                {choiceAttributes.map((attr) => (
                  <div key={attr.name}>
                    <label className="text-xs font-extrabold uppercase tracking-wider text-stone-900 block mb-2">
                      {attr.name}: <strong className="text-primary-600 normal-case">{selection[attr.name] || 'Choose an option'}</strong>
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {attr.options.map((opt) => {
                        const meta = attr.options_meta?.find((m) => m.name === opt);
                        const active = selection[attr.name] === opt;
                        const available = isOptionAvailable(product.variations, {}, attr.name, opt);
                        const base = 'transition-all disabled:cursor-not-allowed disabled:opacity-35';
                        if (attr.type === 'color' && meta?.color) {
                          return (
                            <button
                              key={opt}
                              type="button"
                              disabled={!available}
                              onClick={() => chooseOption(attr.name, opt)}
                              title={opt}
                              className={`${base} h-9 w-9 rounded-full border-2 ${
                                active ? 'border-primary-600 ring-2 ring-primary-600/30 ring-offset-2' : 'border-stone-200 hover:border-stone-400'
                              }`}
                              style={{ background: meta.color }}
                            >
                              <span className="sr-only">{opt}</span>
                            </button>
                          );
                        }
                        if (attr.type === 'image' && meta?.image_url) {
                          return (
                            <button
                              key={opt}
                              type="button"
                              disabled={!available}
                              onClick={() => chooseOption(attr.name, opt)}
                              title={opt}
                              className={`${base} flex flex-col items-center gap-1 rounded-xl border-2 p-1 ${
                                active ? 'border-primary-600 ring-2 ring-primary-600/30' : 'border-stone-200 hover:border-stone-400'
                              }`}
                            >
                              <img src={meta.image_url} alt={opt} className="h-12 w-12 rounded-lg object-cover" />
                              <span className="text-[10px] font-bold text-stone-700">{opt}</span>
                            </button>
                          );
                        }
                        return (
                          <button
                            key={opt}
                            type="button"
                            disabled={!available}
                            onClick={() => chooseOption(attr.name, opt)}
                            className={`${base} rounded-xl px-4 py-2 text-xs font-bold ${
                              active
                                ? 'bg-primary-500 text-white shadow-md shadow-primary-950/20 ring-2 ring-primary-500/20'
                                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold">
                  {needsSelection ? (
                    <span className="text-rose-600">This combination isn&apos;t available — please choose another option.</span>
                  ) : selectedVariation && selectedVariation.stock <= 0 ? (
                    <span className="text-rose-600">Out of stock</span>
                  ) : selectedVariation ? (
                    <span className="text-emerald-700">
                      In stock{selectedVariation.stock <= 5 ? ` — only ${selectedVariation.stock} left` : ''}
                    </span>
                  ) : null}
                  {selectedVariation?.sku && <span className="text-stone-400">SKU: {selectedVariation.sku}</span>}
                </div>
              </div>
            )}

            {/* Mini Gallery: number of frames (admin-configurable counts & per-frame price) */}
            {isMiniGallery && (
              <div className="rounded-2xl border border-primary-200 bg-primary-50/40 p-4 space-y-2.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-stone-900 block">
                  Number of Frames: <strong className="text-primary-700">{galleryFrames}</strong>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {galleryRules.counts.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setGalleryFrames(n)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border text-center ${
                        galleryFrames === n
                          ? 'bg-primary-600 text-white border-primary-600 shadow-md ring-2 ring-primary-600/30'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      <span>{n} Frames</span>
                      <span className="block text-[10px] opacity-80 mt-0.5">
                        ₹{miniGalleryPrice(variationBasePrice, n, galleryRules)}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-primary-800 font-medium">
                  📸 Upload a different photo for each frame in the live customizer!
                </p>
              </div>
            )}

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
                        {/* Priced from the chosen variation, same as the total below */}
                        {opt === 'Set of 4' ? `₹${variationBasePrice}` : opt === 'Set of 6' ? `₹${Math.round(variationBasePrice * pricingRules.set6Multiplier)}` : `₹${Math.round(variationBasePrice * pricingRules.set8Multiplier)}`}
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
                    <span className="block text-[10px] opacity-80 mt-0.5">Standard (₹{variationBasePrice})</span>
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
            {!hasVariations && shapeFrames.options.length > 1 && (
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-stone-900 block mb-2">
                  Choose Acrylic Shape: <strong className="text-primary-600 normal-case">{selectedShape}</strong>
                </label>
                {/* Each option shows the actual cutout the photo will be printed in */}
                <div className="flex flex-wrap gap-2.5">
                  {shapeFrames.options.map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => {
                        setSelectedShape(opt.label);
                        setSelectedImage(opt.url);
                      }}
                      title={opt.label}
                      className={`flex flex-col items-center gap-1 rounded-xl border-2 p-1.5 transition-all ${
                        selectedShape === opt.label
                          ? 'border-primary-500 ring-2 ring-primary-500/20'
                          : 'border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-stone-700">
                        <img src={opt.url} alt="" className="h-10 w-10 object-contain" />
                      </span>
                      <span className="text-[10px] font-bold text-stone-700">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Main CTA Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                disabled={needsSelection || isOutOfStock || !shapeFrames.ready}
                onClick={() => setIsCustomizerOpen(true)}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-primary-500 py-3 text-sm font-bold text-white shadow-md shadow-primary-500/20 hover:bg-primary-600 hover:shadow-lg transition-all disabled:cursor-not-allowed disabled:bg-stone-300 disabled:shadow-none"
              >
                <Sparkles className="h-5 w-5 text-primary-200 animate-pulse" />
                <span>
                  {needsSelection ? 'Select available options' : isOutOfStock ? 'Out of Stock' : 'Upload Photo & Open Live Customizer'}
                </span>
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
                  disabled={needsSelection || isOutOfStock}
                  onClick={handleQuickAdd}
                  className="flex-1 rounded-xl border border-stone-900 bg-stone-900 py-3 text-xs font-bold text-white hover:bg-stone-800 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
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
              {(product.attributes || [])
                .filter((a) => a.visible && a.options.length > 0)
                .map((a) => (
                  <div key={a.name} className="flex justify-between gap-4 py-1 border-b border-stone-200/60">
                    <span className="text-stone-500 font-medium">{a.name}</span>
                    <span className="text-stone-900 font-bold text-right">{a.options.join(', ')}</span>
                  </div>
                ))}
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-6 sm:gap-x-5">
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
        frameUrl={hasVariations ? undefined : selectedFrameUrl}
        frameOptions={hasVariations ? undefined : shapeFrames.options}
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        initialSetOption={isFridgeMagnet ? magnetSetOption : undefined}
        galleryFrameCount={isMiniGallery ? galleryFrames : undefined}
        initialPrintType={isDualSideEligible ? printType : 'single'}
        customPrice={activePrice}
        variation={selectedVariation}
        variationLabel={variationLabelText}
        variationSelection={selectedVariation ? selection : undefined}
      />
    </div>
  );
}
