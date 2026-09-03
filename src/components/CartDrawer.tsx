'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles, Tag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

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
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-violet-700" />
              <h2 className="text-lg font-bold text-stone-900">Your Shopping Bag</h2>
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-800">
                {cart.length}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Free Delivery Bar */}
          <div className="border-b border-stone-100 bg-violet-50/50 px-6 py-3">
            <div className="flex items-center justify-between text-xs font-medium text-violet-950 mb-1.5">
              <span>
                {amountNeeded > 0 ? (
                  <>Add <strong>₹{amountNeeded.toFixed(0)}</strong> more for <strong>FREE Pan-India Delivery</strong>!</>
                ) : (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" /> Congratulations! You unlocked Free Shipping!
                  </span>
                )}
              </span>
              <span className="font-bold">{progressPercent.toFixed(0)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-violet-200/70">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-violet-600 to-amber-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 divide-y divide-stone-100">
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
                  className="mt-6 rounded-full bg-violet-700 px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-violet-800 transition-colors"
                >
                  Explore Collections
                </Link>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                  {/* Photo Preview: Either uploaded customized photo or product photo */}
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                    <img
                      src={item.customPhotoUrl || item.image}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                    {item.customPhotoUrl && (
                      <span className="absolute bottom-1 right-1 rounded-md bg-violet-900/90 px-1 py-0.5 text-[9px] font-bold text-amber-300">
                        Custom
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-stone-900 line-clamp-1">{item.title}</h4>
                        <span className="inline-block rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-600 mt-1">
                          Shape: {item.shape}
                        </span>
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
                      <span className="text-sm font-extrabold text-violet-900">
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
            <div className="border-t border-stone-200 bg-stone-50 p-6">
              {/* Coupon Bar */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. EBANZO10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold uppercase text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-violet-600"
                    />
                    <Tag className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
                  </div>
                  <button
                    onClick={applyCoupon}
                    className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white hover:bg-violet-700 transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponSuccess && <p className="mt-1 text-[11px] text-emerald-600 font-medium">{couponSuccess}</p>}
                {couponError && <p className="mt-1 text-[11px] text-rose-500 font-medium">{couponError}</p>}
              </div>

              {/* Financial Calculation */}
              <div className="space-y-1.5 text-xs text-stone-600 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">₹{subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount ({discountPercent}%)</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span>{shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `₹${shippingFee}`}</span>
                </div>
                <div className="flex justify-between border-t border-stone-200 pt-2 text-sm font-extrabold text-stone-900">
                  <span>Total Amount</span>
                  <span className="text-violet-900">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-700 to-purple-800 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-600/30 hover:brightness-105 transition-all"
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
