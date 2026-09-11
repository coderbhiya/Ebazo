'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Search, Truck, CheckCircle2, Clock, Package, 
  Layers, MapPin, AlertCircle, RefreshCw 
} from 'lucide-react';
import { trackOrder } from '@/lib/api';

function TrackContent() {
  const searchParams = useSearchParams();
  const initialNumber = searchParams.get('number') || '';

  const [trackingInput, setTrackingInput] = useState(initialNumber);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSearch = async (trackingNo?: string) => {
    const target = trackingNo || trackingInput;
    if (!target.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await trackOrder(target.trim());
      if (res.status === 'success') {
        setOrder(res.data);
      } else {
        setError(res.message || 'No order found with this tracking ID');
        setOrder(null);
      }
    } catch (err: any) {
      setError('Could not connect to tracking server. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialNumber) {
      handleSearch(initialNumber);
    }
  }, [initialNumber]);

  return (
    <div className="min-h-screen bg-stone-50/70 py-6 sm:py-16">
      <div className="mx-auto max-w-4xl px-3 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 mb-3">
            <Truck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900">Track Your Custom Keepsake</h1>
          <p className="mt-2 text-xs text-stone-600">
            Enter your Order Reference ID (EBZ-XXXX) or Courier Tracking Number to view real-time studio production & delivery milestones.
          </p>

          {/* Search Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="mt-6 flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                required
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="Enter Tracking ID (e.g. TRK... or EBZ-...)"
                className="w-full rounded-2xl border border-stone-300 bg-white py-3 pl-10 pr-4 text-xs font-bold uppercase tracking-wider text-stone-900 placeholder-stone-400 focus:border-primary-600 focus:outline-none shadow-sm"
              />
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-primary-500 px-6 py-3 text-xs font-extrabold text-white shadow-md hover:bg-primary-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <span>Track Order</span>
              )}
            </button>
          </form>
        </div>

        {error && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-medium text-rose-700 text-center flex items-center justify-center gap-2 mb-8">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Tracking Details View */}
        {order && (
          <div className="space-y-6">
            
            {/* Status Summary Card */}
            <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary-600">
                    Order {order.order_number}
                  </span>
                  <h2 className="text-xl font-black text-stone-900 mt-0.5">
                    Status: <span className="text-primary-600 capitalize">{order.order_status}</span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Courier Partner: <strong>{order.courier_name}</strong> • Waybill: <strong>{order.tracking_number}</strong>
                  </p>
                </div>

                <div className="rounded-2xl bg-primary-50 p-4 border border-primary-100 text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Total Amount</span>
                  <span className="text-lg font-black text-primary-700">₹{order.total_amount}</span>
                  <span className="text-[10px] text-primary-700 font-bold block uppercase mt-0.5">
                    {order.payment_status} via {order.payment_method.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Milestones Progress Timeline */}
              <div className="pt-8">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-900 mb-6">
                  Production & Dispatch Timeline
                </h3>

                <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                  {order.timeline && order.timeline.map((step: any, idx: number) => (
                    <div key={idx} className="relative">
                      {/* Step Node */}
                      <span className={`absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-white ${
                        step.done ? 'bg-primary-500 text-white' : 'bg-stone-300 text-stone-500'
                      }`}>
                        {step.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3 w-3" />}
                      </span>

                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-bold ${step.done ? 'text-stone-900' : 'text-stone-400'}`}>
                            {step.title}
                          </h4>
                          <span className="text-[10px] font-semibold text-stone-400">{step.time}</span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Items in this Order */}
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-900 mb-4">
                Customized Items in This Order
              </h3>
              <div className="divide-y divide-stone-100">
                {order.items && order.items.map((item: any) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.custom_photo_url || item.product_image}
                        alt={item.product_title}
                        className="h-14 w-14 rounded-xl object-cover border border-stone-200"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-stone-900">{item.product_title}</h4>
                        <p className="text-[11px] text-stone-500">Shape: <strong>{item.shape_selected}</strong></p>
                        {item.custom_text && (
                          <p className="text-[10px] text-primary-600 italic font-medium">&ldquo;{item.custom_text}&rdquo;</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-stone-900">
                        {item.quantity} x ₹{item.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Destination */}
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-900 mb-2 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary-600" /> Delivery Address
              </h3>
              <p className="text-xs font-bold text-stone-800">{order.customer_name}</p>
              <p className="text-xs text-stone-600 mt-0.5">{order.shipping_address}, {order.city}, {order.state} - {order.pincode}</p>
              <p className="text-xs text-stone-500 mt-1">Phone: {order.customer_phone}</p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-stone-500">Loading tracking information...</div>}>
      <TrackContent />
    </Suspense>
  );
}
