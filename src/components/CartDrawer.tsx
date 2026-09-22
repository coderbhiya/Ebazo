'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles, Tag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatProductTitle } from '@/lib/api';

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, subtotal, shippingFee, total } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  if (!isCartOpen) return null;

  const freeShippingThreshold = 499;
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const amountNeeded = Math.max(0, freeShippingThreshold - subtotal);

  const applyCoupon = () => {
    if (couponCode.trim().toUpperCase() === 'EBANZO10') {
      setDiscountPercent(10);
      setCouponSuccess('10% OFF coupon applied!');
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code. Try EBANZO10');
      setCouponSuccess('');
    }
  };

  const discountAmount = (subtotal * discountPercent) / 100;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-200 px-4 sm:px-6 py-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary-600" />
              <h2 className="text-lg font-bold text-stone-900">Your Shopping Bag</h2>
              <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-bold text-primary-700">
                {cart.reduce((total, item) => total + item.quantity, 0)}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-500 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Free Delivery Bar */}
          <div className="border-b border-stone-100 bg-primary-50/70 px-4 sm:px-6 py-2.5 sm:py-3">
            <div className="flex items-center justify-between text-xs font-semibold text-primary-900">
              <span className="flex items-center gap-1.5 text-primary-700 font-bold">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>100% FREE Pan-India Express Shipping on all orders!</span>
              </span>
              <span className="rounded-full bg-primary-600 text-white px-2 py-0.5 text-[10px] font-extrabold uppercase">
                ₹0 Ship
              </span>
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-stone-100">
            {cart.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center py-12">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-stone-100 text-stone-400 mb-4">
                  <ShoppingBag className="h-10 w-10" />
                </div>
                <h3 className="text-base font-bold text-stone-900">Your bag is empty</h3>
                <p className="mt-1 text-xs text-stone-500 max-w-xs">
                  Discover our personalized photo fridge magnets, custom keychains, and acrylic tabletop stands!
                </p>
                <Link
                  href="/shop"
                  onClick={() => setIsCartOpen(false)}
                  className="mt-6 rounded-full bg-primary-500 px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-primary-600 transition-colors"
                >
                  Explore Collections
                </Link>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                  {/* Photo Preview: multi-image items show all photos in a mini grid; others show a single proof */}
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-stone-100 shadow-sm">
                    {item.multiImages && item.multiImages.length > 0 ? (
                      <div className="grid grid-cols-2 grid-rows-2 gap-px h-full w-full bg-stone-200">
                        {Array.from({ length: 4 }, (_, i) => item.multiImages![i]).map((img, i) => (
                          <div key={i} className="relative bg-stone-100 overflow-hidden">
                            {img ? (
                              <img
                                src={img.artworkUrl || img.photoUrl}
                                alt={`${item.title} ${i + 1}`}
                                className="h-full w-full object-cover"
                              />
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <img
                        src={item.frontArtworkUrl || item.printReadyArtworkUrl || item.customPhotoUrl || item.image}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                    {item.backPhotoUrl && (
                      <span className="absolute top-1 left-1 rounded bg-stone-900/90 px-1 py-0.5 text-[8px] font-black text-amber-300">
                        2-Sided
                      </span>
                    )}
                    {item.multiImages && item.multiImages.length > 0 && (
                      <span className="absolute top-1 left-1 rounded bg-stone-900/90 px-1 py-0.5 text-[8px] font-black text-primary-300">
                        {item.multiImages.length} Photos
                      </span>
                    )}
                    {item.printReadyArtworkUrl || item.frontArtworkUrl ? (
                      <span className="absolute bottom-1 right-1 rounded-md bg-emerald-950/90 px-1 py-0.5 text-[8px] font-bold text-emerald-300">
                        Proof OK
                      </span>
                    ) : item.customPhotoUrl ? (
                      <span className="absolute bottom-1 right-1 rounded-md bg-secondary-900/90 px-1 py-0.5 text-[9px] font-bold text-primary-200">
                        Custom
                      </span>
                    ) : null}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-stone-900 line-clamp-1">{formatProductTitle(item.title)}</h4>
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          {item.setOption && (
                            <span className="inline-block rounded-md bg-primary-100 text-primary-800 font-bold px-1.5 py-0.5 text-[10px]">
                              {item.setOption}
                            </span>
                          )}
                          {item.printType === 'dual' && (
                            <span className="inline-block rounded-md bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 text-[10px]">
                              Dual-Side Print
                            </span>
                          )}
                          <span className="inline-block rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600">
                            Shape: {item.shape}
                          </span>
                          {item.customText && (
                            <span className="inline-block rounded-md bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 text-[10px] font-semibold truncate max-w-[120px]">
                              ✍️ {item.customText}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center rounded-lg border border-stone-200 bg-stone-50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 text-stone-500 hover:text-stone-900"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-stone-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 text-stone-500 hover:text-stone-900"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-sm font-extrabold text-primary-600">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {cart.length > 0 && (
            <div className="border-t border-stone-200 bg-stone-50 p-4 sm:p-6">
              {/* Coupon Bar */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. EBANZO10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold uppercase text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-primary-600"
                    />
                    <Tag className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
                  </div>
                  <button
                    onClick={applyCoupon}
                    className="rounded-xl bg-secondary-900 px-4 py-2 text-xs font-bold text-white hover:bg-primary-600 transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponSuccess && <p className="mt-1 text-[11px] text-primary-600 font-medium">{couponSuccess}</p>}
                {couponError && <p className="mt-1 text-[11px] text-rose-500 font-medium">{couponError}</p>}
              </div>

              {/* Financial Calculation */}
              <div className="space-y-1.5 text-xs text-stone-600 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">₹{subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-primary-600 font-medium">
                    <span>Discount ({discountPercent}%)</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span>{shippingFee === 0 ? <strong className="text-primary-600">FREE</strong> : `₹${shippingFee}`}</span>
                </div>
                <div className="flex justify-between border-t border-stone-200 pt-2 text-sm font-extrabold text-stone-900">
                  <span>Total Amount</span>
                  <span className="text-primary-700">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 py-3 text-sm font-bold text-white shadow-sm shadow-primary-500/20 hover:bg-primary-600 hover:shadow-md transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
