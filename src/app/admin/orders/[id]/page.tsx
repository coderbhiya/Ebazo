'use client';


import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Printer, Download, ExternalLink, Truck, CheckCircle2, 
  Clock, RefreshCw, AlertCircle, Phone, MapPin, Mail, Calendar, 
  CreditCard, Tag, Copy, Check, FileText, Package, Sparkles, Layers,
  Save, AlertTriangle, ShieldCheck, User, ArrowUpRight, Send
} from 'lucide-react';
import { 
  fetchAdminOrder, updateOrderStatus, Order,
  createShiprocketShipment 
} from '@/lib/admin-api';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Form edit states
  const [orderStatus, setOrderStatus] = useState<string>('processing');
  const [productionStage, setProductionStage] = useState<string>('image_received');
  const [paymentStatus, setPaymentStatus] = useState<string>('paid');
  const [courierName, setCourierName] = useState<string>('');
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadOrder = async () => {
    if (!orderId) return;
    setLoading(true);
    const data = await fetchAdminOrder(orderId);
    if (data) {
      setOrder(data);
      setOrderStatus(data.order_status || 'processing');
      setProductionStage(data.production_stage || 'image_received');
      setPaymentStatus(data.payment_status || 'paid');
      setCourierName(data.courier_name || 'BlueDart Express');
      setTrackingNumber(data.tracking_number || '');
      setAdminNotes(data.admin_notes || '');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!order) return;
    setSaving(true);
    await updateOrderStatus(order.id, {
      order_status: orderStatus,
      production_stage: productionStage,
      payment_status: paymentStatus,
      courier_name: courierName,
      tracking_number: trackingNumber,
      admin_notes: adminNotes,
    });
    setSaving(false);
    showToast('Order manifest & tracking details saved successfully!');
    loadOrder();
  };

  const [syncingShiprocket, setSyncingShiprocket] = useState(false);

  const handlePushToShiprocket = async () => {
    if (!order) return;
    setSyncingShiprocket(true);
    try {
      const res = await createShiprocketShipment(order.id);
      if (res.status === 'success') {
        if (res.data?.courier_name) setCourierName(res.data.courier_name);
        if (res.data?.tracking_number) setTrackingNumber(res.data.tracking_number);
        setOrderStatus('dispatched');
        setProductionStage('dispatched');
        setToastMessage(`Shiprocket AWB Generated: ${res.data?.tracking_number} via ${res.data?.courier_name}!`);
        loadOrder();
      } else {
        setToastMessage(res.message || 'Failed to push to Shiprocket');
      }
    } catch {
      setToastMessage('Network error connecting to Shiprocket API');
    } finally {
      setSyncingShiprocket(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };


  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const cleanTitle = (str?: string) => {
    if (!str) return 'Custom Product';
    return str
      .replace(/\\u2014/g, '—')
      .replace(/\\u2013/g, '–')
      .replace(/\\u0026/g, '&')
      .replace(/\\u0022/g, '"')
      .replace(/\\u0027/g, "'");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processing':
        return { bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30', label: 'Processing' };
      case 'printing':
        return { bg: 'bg-purple-500/15 text-purple-300 border-purple-500/30', label: 'In Print Station' };
      case 'dispatched':
        return { bg: 'bg-sky-500/15 text-sky-300 border-sky-500/30', label: 'Dispatched' };
      case 'delivered':
        return { bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', label: 'Delivered' };
      default:
        return { bg: 'bg-stone-800 text-stone-300 border-stone-700', label: status };
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2.5">
          <RefreshCw className="h-8 w-8 text-primary-400 animate-spin" />
          <span className="text-xs text-stone-400 font-medium">Loading full order details...</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center space-y-3">
        <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-white">Order Not Found</h2>
        <p className="text-xs text-stone-400">The requested order ID #{orderId} could not be located.</p>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 rounded-lg bg-stone-800 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-700 mt-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Orders</span>
        </Link>
      </div>
    );
  }

  const statusBadge = getStatusBadge(orderStatus);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 rounded-xl bg-primary-600 px-4 py-2.5 text-xs font-bold text-white shadow-2xl animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Top Breadcrumbs & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <Link 
              href="/admin/orders" 
              className="flex items-center gap-1 text-stone-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Orders List</span>
            </Link>
            <span>/</span>
            <span className="text-stone-300 font-mono">#{order.order_number}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <h1 className="text-2xl font-black text-white font-mono flex items-center gap-2">
              {order.order_number}
              <span className="rounded bg-stone-800 px-2 py-0.5 text-xs font-mono font-normal text-stone-400">
                ID #{order.id}
              </span>
            </h1>

            <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-bold capitalize ${statusBadge.bg}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {statusBadge.label}
            </span>

            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 text-xs font-bold uppercase text-emerald-400 font-mono">
              {order.payment_method} • {order.payment_status}
            </span>
          </div>

          <p className="text-xs text-stone-400">
            Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg border border-stone-700 bg-stone-900 px-3.5 py-2 text-xs font-semibold text-stone-200 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <Printer className="h-3.5 w-3.5 text-stone-400" />
            <span>Print Slip</span>
          </button>

          {order.tracking_number && (
            <a
              href={`/track/${order.tracking_number}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-stone-700 bg-stone-900 px-3.5 py-2 text-xs font-semibold text-stone-200 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <span>Customer Track</span>
              <ExternalLink className="h-3.5 w-3.5 text-stone-400" />
            </a>
          )}

          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-xs font-bold text-white hover:bg-primary-500 disabled:opacity-50 transition-colors shadow-lg shadow-primary-950/40"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Line Items, Artwork Proofs & Financials */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Custom Items & High-Res Manufacture Assets */}
          <div className="rounded-xl border border-stone-800 bg-[#121318] p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-primary-600/20 text-primary-400 flex items-center justify-center">
                  <Package className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    Manufacture Line Items ({order.items?.length || 0})
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    High-resolution vector proofs & customer original photos for UV laser printing
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {order.items && order.items.map((item, idx) => {
                let customSpecs: any = null;
                if (item.customization_json) {
                  try {
                    customSpecs = typeof item.customization_json === 'string'
                      ? JSON.parse(item.customization_json)
                      : item.customization_json;
                  } catch (e) {}
                }

                return (
                  <div 
                    key={item.id || idx}
                    className="rounded-xl border border-stone-800 bg-[#15171e] p-4 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {/* Artwork Thumbnail */}
                        <div className="relative h-20 w-20 rounded-xl overflow-hidden border border-stone-700 bg-stone-950 flex-shrink-0">
                          <img
                            src={item.print_ready_artwork_url || item.custom_photo_url || item.product_image}
                            alt={item.product_title}
                            className="h-full w-full object-cover"
                          />
                          {item.print_ready_artwork_url && (
                            <span className="absolute bottom-1 right-1 rounded bg-emerald-600 px-1.5 py-0.5 text-[8px] font-black text-white shadow">
                              PROOF
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-bold text-white text-sm">
                            {cleanTitle(item.product_title)}
                          </h4>
                          
                          <div className="flex flex-wrap items-center gap-2 pt-0.5">
                            <span className="rounded-md bg-primary-950/80 border border-primary-500/30 px-2 py-0.5 text-[11px] font-bold text-primary-300 font-mono">
                              Contour Shape: {item.shape_selected || 'Standard'}
                            </span>
                            <span className="text-stone-400 text-xs font-mono">
                              Qty: {item.quantity} × ₹{item.price} = <strong className="text-white">₹{item.total || item.quantity * item.price}</strong>
                            </span>
                          </div>

                          {item.custom_text && (
                            <div className="rounded bg-stone-900/90 border border-stone-800 px-2.5 py-1 text-xs text-amber-300 italic font-medium inline-block mt-1">
                              Laser Inscription: &ldquo;{item.custom_text}&rdquo;
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Download Buttons */}
                      <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                        {item.print_ready_artwork_url && (
                          <a
                            href={item.print_ready_artwork_url}
                            target="_blank"
                            rel="noreferrer"
                            download
                            className="flex-1 sm:flex-none rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-500 flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Print Proof (1200 DPI)</span>
                          </a>
                        )}

                        {item.custom_photo_url && (
                          <a
                            href={item.custom_photo_url}
                            target="_blank"
                            rel="noreferrer"
                            download
                            className="flex-1 sm:flex-none rounded-lg bg-stone-800 border border-stone-700 px-3.5 py-2 text-xs font-bold text-stone-200 hover:text-white hover:bg-stone-700 flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Original Photo</span>
                          </a>
                        )}

                        {!item.print_ready_artwork_url && !item.custom_photo_url && (
                          <a
                            href={item.product_image}
                            target="_blank"
                            rel="noreferrer"
                            download
                            className="flex-1 sm:flex-none rounded-lg bg-stone-800 border border-stone-700 px-3.5 py-2 text-xs font-bold text-stone-200 hover:text-white flex items-center justify-center gap-1.5"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Mockup Image</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Laser / Customizer Parameters */}
                    {customSpecs && (
                      <div className="rounded-lg bg-stone-950 p-3 border border-stone-800/80 text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 font-mono block mb-1.5">
                          Studio Customizer Alignment Parameters
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] text-stone-300">
                          <div className="bg-stone-900 px-2 py-1 rounded border border-stone-800">
                            <span className="text-stone-500 block text-[9px]">SCALE / ZOOM</span>
                            <span>{customSpecs.zoom || 1}x</span>
                          </div>
                          <div className="bg-stone-900 px-2 py-1 rounded border border-stone-800">
                            <span className="text-stone-500 block text-[9px]">ROTATION</span>
                            <span>{customSpecs.rotation || 0}°</span>
                          </div>
                          <div className="bg-stone-900 px-2 py-1 rounded border border-stone-800">
                            <span className="text-stone-500 block text-[9px]">TEXT STYLE</span>
                            <span className="capitalize">{customSpecs.textStyle || 'Modern Serif'}</span>
                          </div>
                          <div className="bg-stone-900 px-2 py-1 rounded border border-stone-800">
                            <span className="text-stone-500 block text-[9px]">CUT PROFILE</span>
                            <span>{item.shape_selected || 'Standard'}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="rounded-xl border border-stone-800 bg-[#121318] p-5 space-y-3 text-xs">
            <h3 className="font-bold text-white text-sm pb-2 border-b border-stone-800">
              Payment & Invoice Summary
            </h3>
            
            <div className="space-y-2 font-mono">
              <div className="flex justify-between text-stone-400">
                <span>Items Subtotal</span>
                <span className="text-stone-200">₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Shipping & Packaging Fee</span>
                <span className="text-stone-200">₹{order.shipping_fee}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon / Applied Discount</span>
                  <span>-₹{order.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-stone-800">
                <span>Total Amount Paid</span>
                <span className="text-primary-400">₹{order.total_amount}</span>
              </div>
            </div>
          </div>

          {/* Admin Studio Notes */}
          <div className="rounded-xl border border-stone-800 bg-[#121318] p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">
                Admin & Studio Internal Notes
              </h3>
              <span className="text-[11px] text-stone-500">
                Visible only to studio staff
              </span>
            </div>

            <textarea
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add internal notes (e.g. customer requested specific border padding, verified laser power 80W, etc.)..."
              className="w-full rounded-lg border border-stone-700 bg-stone-950 p-3 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>

        {/* Right 1 Column: Logistics, Controls, Customer Profile */}
        <div className="space-y-6">
          
          {/* Fulfillment & Status Control Card */}
          <div className="rounded-xl border border-stone-800 bg-[#121318] p-5 space-y-4 text-xs">
            <h3 className="font-bold text-white text-sm pb-2 border-b border-stone-800 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary-400" />
              <span>Fulfillment & Pipeline</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-400 mb-1">
                  Order Status *
                </label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-primary-500 capitalize"
                >
                  <option value="processing">Processing</option>
                  <option value="printing">In Print Station</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-400 mb-1">
                  Production Stage *
                </label>
                <select
                  value={productionStage}
                  onChange={(e) => setProductionStage(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-primary-500 capitalize font-medium"
                >
                  <option value="image_received">1. Image Received</option>
                  <option value="design_proof">2. Design Proofing</option>
                  <option value="laser_uv_print">3. UV Print & Laser Cut</option>
                  <option value="quality_check">4. Quality Check</option>
                  <option value="packaging">5. Bubble Packaging</option>
                  <option value="dispatched">6. Handed to Courier</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-400 mb-1">
                  Payment Status
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-primary-500 capitalize font-semibold"
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="refunded">Refunded</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => handleSave()}
                disabled={saving}
                className="w-full rounded-lg bg-primary-600 py-2.5 text-xs font-bold text-white hover:bg-primary-500 disabled:opacity-50 transition-colors shadow-lg shadow-primary-950/40 flex items-center justify-center gap-1.5 mt-2"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{saving ? 'Updating...' : 'Save Pipeline Changes'}</span>
              </button>
            </div>
          </div>

          {/* Courier & Tracking Waybill Card */}
          <div className="rounded-xl border border-stone-800 bg-[#121318] p-5 space-y-4 text-xs">
            <h3 className="font-bold text-white text-sm pb-2 border-b border-stone-800 flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary-400" />
              <span>Courier & Tracking</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-400 mb-1">
                  Courier Partner
                </label>
                <input
                  type="text"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="e.g. BlueDart, Delhivery, DTDC"
                  className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-400 mb-1">
                  Tracking Number / Waybill (AWB)
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. TRK9482015821"
                  className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-xs font-mono text-white placeholder-stone-600 focus:outline-none focus:border-primary-500"
                />
              </div>

              {trackingNumber && (
                <div className="pt-1 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleCopy(trackingNumber, 'awb')}
                    className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-white"
                  >
                    {copiedText === 'awb' ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    <span>{copiedText === 'awb' ? 'Copied!' : 'Copy AWB'}</span>
                  </button>

                  <a
                    href={`/track/${trackingNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-400 hover:underline"
                  >
                    <span>Live Tracking</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                </div>
              )}

              {/* Shiprocket 1-Click AWB Button */}
              <div className="pt-2 border-t border-stone-800/80">
                <button
                  type="button"
                  onClick={handlePushToShiprocket}
                  disabled={syncingShiprocket}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-sky-600/90 hover:bg-sky-500 py-2 text-xs font-bold text-white transition-all shadow-md shadow-sky-950/40 disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>
                    {syncingShiprocket 
                      ? 'Connecting to Shiprocket...' 
                      : trackingNumber?.startsWith('SR') 
                      ? 'Re-Sync with Shiprocket' 
                      : 'Ship with Shiprocket (⚡ 1-Click AWB)'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Customer Profile & Address Card */}
          <div className="rounded-xl border border-stone-800 bg-[#121318] p-5 space-y-4 text-xs">
            <h3 className="font-bold text-white text-sm pb-2 border-b border-stone-800 flex items-center gap-2">
              <User className="h-4 w-4 text-primary-400" />
              <span>Customer Information</span>
            </h3>

            <div className="space-y-2.5">
              <div>
                <span className="text-[10px] text-stone-500 block uppercase font-mono">Full Name</span>
                <span className="font-bold text-white text-sm">{order.customer_name}</span>
              </div>

              <div>
                <span className="text-[10px] text-stone-500 block uppercase font-mono">Phone Number</span>
                <a 
                  href={`tel:${order.customer_phone}`}
                  className="font-mono text-stone-200 hover:text-primary-400 flex items-center gap-1.5"
                >
                  <Phone className="h-3 w-3 text-primary-400" />
                  <span>{order.customer_phone}</span>
                </a>
              </div>

              {order.customer_email && (
                <div>
                  <span className="text-[10px] text-stone-500 block uppercase font-mono">Email</span>
                  <a 
                    href={`mailto:${order.customer_email}`}
                    className="text-stone-300 hover:text-primary-400 flex items-center gap-1.5 truncate"
                  >
                    <Mail className="h-3 w-3 text-primary-400" />
                    <span>{order.customer_email}</span>
                  </a>
                </div>
              )}

              <div className="pt-2 border-t border-stone-800/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-stone-500 uppercase font-mono">Shipping Address</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(`${order.shipping_address}, ${order.city}, ${order.state} - ${order.pincode}`, 'address')}
                    className="text-[10px] text-stone-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedText === 'address' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedText === 'address' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-stone-300 leading-relaxed">
                  {order.shipping_address}
                </p>
                <p className="text-stone-200 font-semibold mt-0.5">
                  {order.city}, {order.state} - <span className="font-mono text-white">{order.pincode}</span>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}