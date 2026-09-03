'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, Truck, ArrowLeft, CheckCircle2, 
  CreditCard, QrCode, Banknote, Sparkles, Loader2 
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { createOrder } from '@/lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, shippingFee, clearCart } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  // Auto-fill city / state when 6-digit Indian pincode is entered
  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pin = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(pin);

    if (pin.length === 6) {
      // Mock Indian postal lookups for major hubs
      if (pin.startsWith('400')) {
        setCity('Mumbai');
        setState('Maharashtra');
      } else if (pin.startsWith('110')) {
        setCity('New Delhi');
        setState('Delhi');
      } else if (pin.startsWith('560')) {
        setCity('Bengaluru');
        setState('Karnataka');
      } else if (pin.startsWith('380')) {
        setCity('Ahmedabad');
        setState('Gujarat');
      } else if (pin.startsWith('600')) {
        setCity('Chennai');
        setState('Tamil Nadu');
      } else if (pin.startsWith('302')) {
        setCity('Jaipur');
        setState('Rajasthan');
      }
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        shipping_address: shippingAddress,
        city,
        state,
        pincode,
        payment_method: paymentMethod,
        notes,
        items: cart.map((item) => ({
          product_id: item.productId,
          product_title: item.title,
          product_image: item.image,
          shape_selected: item.shape,
          custom_photo_url: item.customPhotoUrl,
          custom_text: item.customText,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      const res = await createOrder(payload);

      if (res.status === 'success') {
        setPlacedOrder(res.data);
        clearCart();
      } else {
        setErrorMessage(res.message || 'Failed to place order. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error placing order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (placedOrder) {
    return (
      <div className="min-h-screen bg-stone-50 py-16 flex items-center justify-center px-4">
        <div className="max-w-lg w-full rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Order Confirmed</span>
          <h1 className="mt-1 text-2xl font-black text-stone-900">Thank You for Your Order!</h1>
          <p className="mt-2 text-xs text-stone-600">
            We have received your customization files. Our precision UV printing & laser contour cutting studio is preparing your keepsake!
          </p>

          <div className="my-6 rounded-2xl bg-stone-50 p-4 border border-stone-200 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-stone-500 font-medium">Order Reference:</span>
              <span className="font-extrabold text-stone-900">{placedOrder.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500 font-medium">Tracking Number:</span>
              <span className="font-extrabold text-primary-700">{placedOrder.tracking_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500 font-medium">Total Paid:</span>
              <span className="font-extrabold text-stone-900">₹{placedOrder.total_amount}</span>
            </div>
            <div className="flex justify-between border-t border-stone-200 pt-2">
              <span className="text-stone-500 font-medium">Estimated Delivery:</span>
              <span className="font-bold text-primary-700">{placedOrder.estimated_delivery}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href={`/track?number=${placedOrder.tracking_number}`}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary-500 py-3 text-xs font-bold text-white hover:bg-primary-600 transition-colors shadow"
            >
              <Truck className="h-4 w-4" />
              <span>Track Order Live Timeline</span>
            </Link>

            <Link
              href="/"
              className="rounded-xl border border-stone-300 py-3 text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center py-20 px-4 text-center">
        <h2 className="text-xl font-bold text-stone-900">Your shopping bag is empty</h2>
        <p className="mt-1 text-xs text-stone-500">Please add personalized items to your bag before checking out.</p>
        <Link
          href="/shop"
          className="mt-6 rounded-full bg-primary-500 px-6 py-2.5 text-xs font-bold text-white hover:bg-primary-600"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/70 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="mb-6 flex items-center gap-2">
          <Link href="/shop" className="text-xs font-semibold text-stone-500 hover:text-stone-900 flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Continue Shopping
          </Link>
        </div>

        <h1 className="text-3xl font-black text-stone-900 mb-8">Secure Checkout</h1>

        {errorMessage && (
          <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-medium text-rose-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left: Customer & Address Information */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Contact Details */}
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-900 flex items-center gap-2">
                <span>1. Contact Details</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-primary-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Phone (for courier updates) *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-primary-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Email Address (for order receipt)</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="rahul@example.com"
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-primary-600"
                />
              </div>
            </div>

            {/* Shipping Address */}
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-900">
                2. Shipping Address (Pan-India)
              </h2>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Street Address / Flat / Floor *</label>
                <textarea
                  required
                  rows={2}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="House No, Apartment name, Street, Landmark"
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-primary-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={handlePincodeChange}
                    placeholder="e.g. 400001"
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-primary-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-primary-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-primary-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Order Notes (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special laser engraving requests, delivery instructions"
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-primary-600"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-900">
                3. Payment Method
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all ${
                  paymentMethod === 'upi' ? 'border-primary-600 bg-primary-50/50 ring-1 ring-primary-600' : 'border-stone-200 hover:bg-stone-50'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                    className="sr-only"
                  />
                  <QrCode className="h-5 w-5 text-primary-600" />
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">Instant UPI</span>
                    <span className="text-[10px] text-stone-500">GPay, PhonePe, Paytm</span>
                  </div>
                </label>

                <label className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all ${
                  paymentMethod === 'card' ? 'border-primary-600 bg-primary-50/50 ring-1 ring-primary-600' : 'border-stone-200 hover:bg-stone-50'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="sr-only"
                  />
                  <CreditCard className="h-5 w-5 text-primary-600" />
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">Card / NetBanking</span>
                    <span className="text-[10px] text-stone-500">RuPay, Visa, MC</span>
                  </div>
                </label>

                <label className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all ${
                  paymentMethod === 'cod' ? 'border-primary-600 bg-primary-50/50 ring-1 ring-primary-600' : 'border-stone-200 hover:bg-stone-50'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="sr-only"
                  />
                  <Banknote className="h-5 w-5 text-primary-600" />
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">Cash On Delivery</span>
                    <span className="text-[10px] text-stone-500">Pay at doorstep</span>
                  </div>
                </label>
              </div>
            </div>

          </div>

          {/* Right: Order Summary & Placement */}
          <div className="lg:col-span-5 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm space-y-6">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-900 pb-3 border-b border-stone-100">
              Order Summary ({cart.length} Items)
            </h2>

            <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="py-3 flex gap-3">
                  <img
                    src={item.customPhotoUrl || item.image}
                    alt={item.title}
                    className="h-14 w-14 rounded-xl object-cover border border-stone-200"
                  />
                  <div className="flex-1 min-w-0 text-xs">
                    <h4 className="font-bold text-stone-900 truncate">{item.title}</h4>
                    <p className="text-stone-500 text-[11px]">Shape: {item.shape}</p>
                    {item.customPhotoUrl && (
                      <span className="text-[10px] font-bold text-primary-600">✓ Custom Photo Fused</span>
                    )}
                    <div className="mt-1 flex justify-between font-semibold">
                      <span className="text-stone-500">{item.quantity} x ₹{item.price}</span>
                      <span className="text-stone-900 font-extrabold">₹{item.quantity * item.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2 border-t border-stone-200 pt-4 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-bold text-stone-900">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Pan-India Delivery</span>
                <span>{shippingFee === 0 ? <strong className="text-primary-600">FREE</strong> : `₹${shippingFee}`}</span>
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-3 text-base font-black text-stone-900">
                <span>Total Due</span>
                <span className="text-primary-700">₹{(subtotal + shippingFee).toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-500 py-4 text-sm font-black text-white shadow-xl shadow-primary-950/20 hover:bg-primary-600 transition-all disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing Order & Custom Files...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-primary-200" />
                  <span>Place Order (₹{(subtotal + shippingFee).toFixed(2)})</span>
                </>
              )}
            </button>

            <div className="rounded-xl bg-stone-50 p-3 border border-stone-200 text-center text-[10px] text-stone-500">
              🔒 256-Bit Bank-Grade SSL Encryption • 100% Secure Checkout
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
