'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Printer, Scissors, Download, CheckCircle2, 
  Clock, RefreshCw, Eye, AlertCircle, ShieldCheck, 
  Package, Truck, ArrowRight, ArrowLeft, Image as ImageIcon,
  MessageSquare, Sparkles
} from 'lucide-react';
import { fetchProductionOrders, updateOrderStatus, Order } from '@/lib/admin-api';

const PRODUCTION_STAGES = [
  { id: 'all', label: 'All Active Queue', icon: Printer },
  { id: 'image_received', label: '1. Image Received', icon: ImageIcon },
  { id: 'design_proof', label: '2. Design Proof', icon: Sparkles },
  { id: 'laser_uv_print', label: '3. UV Print & Cut', icon: Scissors },
  { id: 'quality_check', label: '4. Quality Check', icon: ShieldCheck },
  { id: 'packaging', label: '5. Packaging', icon: Package },
  { id: 'dispatched', label: '6. Dispatched', icon: Truck },
];

export default function AdminProductionPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stageCounts, setStageCounts] = useState<Record<string, number>>({});
  const [activeStage, setActiveStage] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  const loadPipeline = (stage?: string) => {
    setLoading(true);
    fetchProductionOrders(stage === 'all' ? undefined : stage).then((res) => {
      setOrders(res.data);
      setStageCounts(res.stages);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadPipeline(activeStage);
  }, [activeStage]);

  const advanceStage = async (orderId: number, currentStage: string) => {
    let nextStage = 'design_proof';
    let nextOrderStatus = 'processing';

    if (currentStage === 'image_received') {
      nextStage = 'design_proof';
      nextOrderStatus = 'processing';
    } else if (currentStage === 'design_proof') {
      nextStage = 'laser_uv_print';
      nextOrderStatus = 'printing';
    } else if (currentStage === 'laser_uv_print') {
      nextStage = 'quality_check';
      nextOrderStatus = 'printing';
    } else if (currentStage === 'quality_check') {
      nextStage = 'packaging';
      nextOrderStatus = 'printing';
    } else if (currentStage === 'packaging') {
      nextStage = 'dispatched';
      nextOrderStatus = 'dispatched';
    }

    await updateOrderStatus(orderId, {
      production_stage: nextStage,
      order_status: nextOrderStatus
    });

    setSuccessMessage(`Order #${orderId} moved to ${nextStage.replace(/_/g, ' ').toUpperCase()}`);
    setTimeout(() => setSuccessMessage(''), 3000);
    loadPipeline(activeStage);
  };

  const regressStage = async (orderId: number, currentStage: string) => {
    let prevStage = 'image_received';
    if (currentStage === 'dispatched') prevStage = 'packaging';
    else if (currentStage === 'packaging') prevStage = 'quality_check';
    else if (currentStage === 'quality_check') prevStage = 'laser_uv_print';
    else if (currentStage === 'laser_uv_print') prevStage = 'design_proof';
    else if (currentStage === 'design_proof') prevStage = 'image_received';

    await updateOrderStatus(orderId, {
      production_stage: prevStage,
      order_status: prevStage === 'laser_uv_print' ? 'printing' : 'processing'
    });

    setSuccessMessage(`Order #${orderId} moved back to ${prevStage.replace(/_/g, ' ').toUpperCase()}`);
    setTimeout(() => setSuccessMessage(''), 3000);
    loadPipeline(activeStage);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Manufacturing & Print Station
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Customization Production Pipeline
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Stage-by-stage UV printing, laser contour cutting, and quality control workflow
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadPipeline(activeStage)}
            className="flex items-center gap-2 rounded-xl border border-stone-800 bg-stone-950 px-4 py-2.5 text-xs font-bold text-stone-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-primary-400' : ''}`} />
            <span>Refresh Pipeline</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="rounded-2xl bg-emerald-950/80 border border-emerald-500/30 p-3 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Pipeline Stage Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {PRODUCTION_STAGES.map((st) => {
          const isActive = activeStage === st.id;
          const count = st.id === 'all' 
            ? orders.length 
            : (stageCounts[st.id] || 0);

          return (
            <button
              key={st.id}
              onClick={() => setActiveStage(st.id)}
              className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all ${
                isActive
                  ? 'border-primary-500 bg-primary-950/40 text-white shadow-md shadow-primary-950/40'
                  : 'border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700 hover:text-stone-200'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <st.icon className={`h-4 w-4 ${isActive ? 'text-primary-400' : 'text-stone-500'}`} />
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                  isActive ? 'bg-primary-500 text-white' : 'bg-stone-900 text-stone-300'
                }`}>
                  {count}
                </span>
              </div>
              <span className="text-[11px] font-bold truncate w-full">{st.label}</span>
            </button>
          );
        })}
      </div>

      {/* Orders in Active Stage */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-8 w-8 text-primary-400 animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-800 bg-stone-950 p-12 text-center text-stone-500 text-xs">
          No orders currently in this production stage.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {orders.map((order) => {
            const currentStage = order.production_stage || 'image_received';
            return (
              <div
                key={order.id}
                className="rounded-3xl border border-stone-800 bg-stone-950 p-5 space-y-4 shadow-sm hover:border-stone-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Order & Customer Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                    <div>
                      <span className="font-mono font-bold text-sm text-primary-400 block">
                        {order.order_number}
                      </span>
                      <span className="text-xs font-bold text-white">
                        {order.customer_name} ({order.customer_phone})
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="inline-block rounded-lg bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-[10px] font-bold text-amber-300 uppercase">
                        {currentStage.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Artwork & Items */}
                  <div className="space-y-2">
                    {order.items && order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-3 rounded-2xl border border-stone-800/80 bg-stone-900/60 p-3 items-center"
                      >
                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-stone-700 bg-stone-800">
                          <img
                            src={item.custom_photo_url || item.product_image}
                            alt={item.product_title}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0 text-xs space-y-1">
                          <h4 className="font-bold text-white text-sm truncate">{item.product_title}</h4>
                          <p className="text-[11px] text-primary-300 font-bold">Shape: {item.shape_selected}</p>
                          {item.custom_text && (
                            <p className="text-[11px] text-amber-300 italic">Engraving: &ldquo;{item.custom_text}&rdquo;</p>
                          )}
                          <p className="text-[10px] text-stone-400">Qty: {item.quantity} units</p>
                        </div>

                        {/* Download Original Photo Asset */}
                        <a
                          href={item.custom_photo_url || item.product_image}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white hover:bg-primary-500 transition-colors flex-shrink-0 shadow-sm"
                          title="Download High-Res Original Asset"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    ))}
                  </div>

                  {/* Internal Notes / Customer Note */}
                  {(order.notes || order.admin_notes) && (
                    <div className="rounded-xl bg-stone-900/80 border border-stone-800 p-2.5 text-[11px] text-stone-300">
                      {order.notes && <p><strong className="text-amber-400">Customer Note:</strong> {order.notes}</p>}
                      {order.admin_notes && <p className="mt-1"><strong className="text-primary-400">Studio Note:</strong> {order.admin_notes}</p>}
                    </div>
                  )}
                </div>

                {/* Pipeline Stage Transitions Footer */}
                <div className="pt-3 border-t border-stone-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => regressStage(order.id, currentStage)}
                    disabled={currentStage === 'image_received'}
                    className="flex items-center gap-1 text-xs text-stone-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Previous Stage</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => advanceStage(order.id, currentStage)}
                    disabled={currentStage === 'dispatched'}
                    className="flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2 text-xs font-bold text-white hover:bg-primary-500 shadow-md transition-colors disabled:opacity-40"
                  >
                    <span>Advance Stage</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
