'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Printer, Scissors, Download, CheckCircle2, 
  Clock, RefreshCw, Eye, AlertCircle, ShieldCheck, 
  Package, Truck, ArrowRight, ArrowLeft, Image as ImageIcon,
  MessageSquare, Sparkles
} from 'lucide-react';
import { fetchProductionOrders, updateOrderStatus, Order, OrderItem } from '@/lib/admin-api';
import { getPrintRows } from '@/components/admin/OrderItemPrintFiles';

const parseSpecs = (item: OrderItem) => {
  try {
    return typeof item.customization_json === 'string' ? JSON.parse(item.customization_json) : item.customization_json || null;
  } catch {
    return null;
  }
};

const checkered =
  'bg-[conic-gradient(#292524_25%,#1c1917_0_50%,#292524_0_75%,#1c1917_0)] bg-[length:10px_10px]';

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
        <div className="overflow-x-auto rounded-2xl border border-stone-800 bg-stone-950">
          <table className="w-full min-w-[1000px] text-left text-xs">
            <thead className="bg-stone-900/80 text-[10px] uppercase tracking-wider text-stone-400">
              <tr>
                <th className="px-3 py-3 font-semibold">Order</th>
                <th className="px-3 py-3 font-semibold">Product</th>
                <th className="px-3 py-3 font-semibold">Print files (cut-out, ready to print)</th>
                <th className="px-3 py-3 font-semibold">Engraving</th>
                <th className="px-3 py-3 font-semibold text-center">Qty</th>
                <th className="px-3 py-3 font-semibold">Stage</th>
                <th className="px-3 py-3 font-semibold text-right">Move</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const currentStage = order.production_stage || 'image_received';
                const items = order.items?.length ? order.items : [null];
                return items.map((item, idx) => {
                  const rows = item ? getPrintRows(item, parseSpecs(item)) : [];
                  const first = idx === 0;
                  const span = items.length;
                  return (
                    <tr key={`${order.id}-${item?.id ?? idx}`} className={`align-top ${first ? 'border-t border-stone-800' : ''}`}>
                      {first && (
                        <td rowSpan={span} className="px-3 py-3 border-r border-stone-800/60">
                          <Link href={`/admin/orders/${order.id}`} className="font-mono font-bold text-primary-400 hover:underline">
                            {order.order_number}
                          </Link>
                          <span className="block font-semibold text-white mt-0.5">{order.customer_name}</span>
                          <span className="block text-[10px] text-stone-500">{order.customer_phone}</span>
                          {(order.notes || order.admin_notes) && (
                            <div className="mt-2 max-w-[200px] space-y-1 text-[10px] text-stone-300">
                              {order.notes && <p><strong className="text-amber-400">Customer:</strong> {order.notes}</p>}
                              {order.admin_notes && <p><strong className="text-primary-400">Studio:</strong> {order.admin_notes}</p>}
                            </div>
                          )}
                        </td>
                      )}
                      <td className="px-3 py-3">
                        {item ? (
                          <>
                            <span className="block max-w-[220px] truncate font-bold text-white">{item.product_title}</span>
                            <span className="block text-[11px] font-bold text-primary-300">Shape: {item.shape_selected}</span>
                          </>
                        ) : (
                          <span className="text-stone-500">No items</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        {rows.length === 0 ? (
                          <span className="text-[11px] text-stone-500">No customer photo</span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {rows.map((r, i) => (
                              <div key={i} className="w-[88px] text-center">
                                {r.artwork ? (
                                  <a href={r.artwork} target="_blank" rel="noreferrer" download title={`Download ${r.label} print file`}>
                                    <img src={r.artwork} alt={r.label} className={`h-16 w-16 max-w-none mx-auto rounded-lg border border-stone-700 object-contain ${checkered}`} />
                                    <span className="mt-1 inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-400">
                                      <Download className="h-3 w-3" /> {r.label}
                                    </span>
                                  </a>
                                ) : (
                                  <div title="The cut-out print file was not saved — do not print the raw photo">
                                    <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-amber-500/50 text-amber-400">
                                      <AlertCircle className="h-5 w-5" />
                                    </span>
                                    <span className="mt-1 block text-[10px] font-bold text-amber-300">{r.label}: missing</span>
                                  </div>
                                )}
                                {r.shape && <span className="block truncate text-[9px] text-stone-500">{r.shape}</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 max-w-[160px]">
                        {item?.custom_text ? (
                          <span className="italic text-amber-300">&ldquo;{item.custom_text}&rdquo;</span>
                        ) : (
                          <span className="text-stone-600">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-white">{item?.quantity ?? '—'}</td>
                      {first && (
                        <>
                          <td rowSpan={span} className="px-3 py-3 border-l border-stone-800/60">
                            <span className="inline-block whitespace-nowrap rounded-lg bg-amber-500/10 border border-amber-500/30 px-2 py-1 text-[10px] font-bold uppercase text-amber-300">
                              {currentStage.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td rowSpan={span} className="px-3 py-3 text-right">
                            <div className="inline-flex flex-col items-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => advanceStage(order.id, currentStage)}
                                disabled={currentStage === 'dispatched'}
                                className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg bg-primary-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-primary-500 disabled:opacity-40"
                              >
                                Next stage <ArrowRight className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => regressStage(order.id, currentStage)}
                                disabled={currentStage === 'image_received'}
                                className="inline-flex items-center gap-1 whitespace-nowrap text-[11px] text-stone-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                              >
                                <ArrowLeft className="h-3.5 w-3.5" /> Previous
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
