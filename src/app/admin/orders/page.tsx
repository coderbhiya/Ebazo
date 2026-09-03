'use client';

import React, { useState, useEffect } from 'react';
import { 
  Printer, Download, ExternalLink, Truck, CheckCircle2, 
  Clock, RefreshCw, Eye, Search, AlertCircle, Phone, MapPin 
} from 'lucide-react';
import { fetchAdminOrders, updateOrderStatus, Order } from '@/lib/admin-api';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadOrders = (status?: string) => {
    setLoading(true);
    fetchAdminOrders(status === 'all' ? undefined : status).then((data) => {
      setOrders(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadOrders(activeFilter);
  }, [activeFilter]);

  const handleStatusUpdate = async (orderId: number, newStatus: string, courier?: string) => {
    await updateOrderStatus(orderId, newStatus, courier);
    loadOrders(activeFilter);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, order_status: newStatus as any } : null));
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery) return true;
    return (
      o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_phone.includes(searchQuery)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
            Fulfillment Station
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Orders & Laser Print Queue
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Inspect customer uploaded high-res photos, crop frames, and dispatch tracking
          </p>
        </div>

        <button
          onClick={() => loadOrders(activeFilter)}
          className="flex items-center gap-2 rounded-xl border border-stone-800 bg-stone-950 px-4 py-2.5 text-xs font-bold text-stone-300 hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-violet-400' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-stone-800 bg-stone-950 p-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          {['all', 'processing', 'printing', 'dispatched', 'delivered'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`rounded-xl px-3.5 py-1.5 capitalize transition-all ${
                activeFilter === tab
                  ? 'bg-violet-600 text-white shadow'
                  : 'text-stone-400 hover:bg-stone-900 hover:text-stone-200'
              }`}
            >
              {tab === 'all' ? 'All Orders' : tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order #, phone, name..."
            className="w-full rounded-xl border border-stone-800 bg-stone-900 py-2 pl-9 pr-3 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-500" />
        </div>
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-8 w-8 text-violet-500 animate-spin" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-800 bg-stone-950 p-12 text-center text-stone-500 text-xs">
          No orders found matching this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-3xl border border-stone-800 bg-stone-950 p-6 shadow-sm hover:border-stone-700 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800/80">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-violet-400">
                      {order.order_number}
                    </span>
                    <span className="text-xs text-stone-500">•</span>
                    <span className="text-xs text-stone-400 font-medium">Waybill: {order.tracking_number}</span>
                  </div>
                  <p className="text-xs font-bold text-white mt-1">
                    {order.customer_name} • <span className="text-stone-400">{order.customer_phone}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-extrabold text-white">
                    ₹{order.total_amount}
                  </span>

                  {/* Status Dropdown */}
                  <select
                    value={order.order_status}
                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                    className="rounded-xl border border-stone-700 bg-stone-900 px-3 py-1.5 text-xs font-bold text-white capitalize focus:outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    <option value="processing">1. Processing (Artwork Check)</option>
                    <option value="printing">2. In Laser & UV Printing</option>
                    <option value="dispatched">3. Dispatched via Courier</option>
                    <option value="delivered">4. Delivered</option>
                  </select>

                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="rounded-xl bg-violet-600/20 text-violet-300 border border-violet-500/30 px-3 py-1.5 text-xs font-bold hover:bg-violet-600 hover:text-white transition-colors"
                  >
                    View Studio Details
                  </button>
                </div>
              </div>

              {/* Items & Custom Photos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                {order.items && order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 rounded-2xl border border-stone-800/80 bg-stone-900/40 p-3"
                  >
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-stone-700 bg-stone-800">
                      <img
                        src={item.custom_photo_url || item.product_image}
                        alt={item.product_title}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 text-xs">
                      <h4 className="font-bold text-white truncate">{item.product_title}</h4>
                      <p className="text-[11px] text-stone-400">Contour Shape: <strong>{item.shape_selected}</strong></p>
                      <p className="text-[10px] text-stone-500">Qty: {item.quantity} • ₹{item.price} each</p>

                      {/* Download Print Asset Button */}
                      {item.custom_photo_url ? (
                        <a
                          href={item.custom_photo_url}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 text-[10px] font-bold text-amber-300 hover:bg-amber-400 hover:text-stone-950 transition-colors"
                        >
                          <Download className="h-3 w-3" />
                          <span>Download High-Res Asset</span>
                        </a>
                      ) : (
                        <span className="mt-2 inline-block text-[10px] text-stone-500 italic">
                          Standard Catalog Artwork
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipping Address snippet */}
              <div className="text-[11px] text-stone-400 flex items-center gap-2 pt-2 border-t border-stone-800/60">
                <MapPin className="h-3.5 w-3.5 text-violet-400 flex-shrink-0" />
                <span className="truncate">
                  {order.shipping_address}, {order.city}, {order.state} - {order.pincode}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl rounded-3xl border border-stone-800 bg-stone-900 p-6 sm:p-8 shadow-2xl text-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">Studio Print Station</span>
                <h3 className="text-lg font-black text-white">{selectedOrder.order_number}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-full p-2 text-stone-400 hover:bg-stone-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6 py-6 text-xs">
              <div className="rounded-2xl border border-stone-800 bg-stone-950 p-4 space-y-1.5">
                <h4 className="font-bold text-white uppercase text-[10px] tracking-wider text-violet-400">Customer & Shipping</h4>
                <p className="font-bold text-white">{selectedOrder.customer_name}</p>
                <p className="text-stone-400">{selectedOrder.shipping_address}, {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}</p>
                <p className="text-stone-400">Phone: <strong>{selectedOrder.customer_phone}</strong> • Email: {selectedOrder.customer_email || 'N/A'}</p>
                {selectedOrder.notes && (
                  <p className="text-amber-300 font-medium pt-1">Note: &ldquo;{selectedOrder.notes}&rdquo;</p>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-white uppercase text-[10px] tracking-wider text-violet-400">Customized Line Items</h4>
                {selectedOrder.items && selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex gap-4 rounded-2xl border border-stone-800 bg-stone-950 p-4 items-center">
                    <img
                      src={item.custom_photo_url || item.product_image}
                      alt={item.product_title}
                      className="h-20 w-20 rounded-xl object-cover border border-stone-700"
                    />
                    <div className="flex-1">
                      <h5 className="font-bold text-white text-sm">{item.product_title}</h5>
                      <p className="text-stone-400 text-xs">Shape: <strong>{item.shape_selected}</strong></p>
                      {item.custom_text && <p className="text-violet-400 font-medium">Text: &ldquo;{item.custom_text}&rdquo;</p>}
                      <p className="text-stone-500 mt-1">Quantity: {item.quantity} • Subtotal: ₹{item.total}</p>
                    </div>
                    {item.custom_photo_url && (
                      <a
                        href={item.custom_photo_url}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-violet-500 shadow flex items-center gap-1.5 flex-shrink-0"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download 1200 DPI Photo</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-stone-800">
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl bg-stone-800 px-6 py-2.5 text-xs font-bold text-white hover:bg-stone-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
