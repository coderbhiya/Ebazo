'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Printer, Download, ExternalLink, Truck, CheckCircle2, 
  Clock, RefreshCw, Eye, Search, AlertCircle, Phone, MapPin,
  Mail, Calendar, CreditCard, Tag, ArrowUpDown, ChevronLeft, ChevronRight,
  Filter, CheckSquare, Square, FileText, X, Edit3, Send
} from 'lucide-react';
import { 
  fetchAdminOrders, updateOrderStatus, bulkUpdateOrderStatus, 
  Order, OrderItem 
} from '@/lib/admin-api';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, total_pages: 1 });
  const [activeTab, setActiveTab] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('id_desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Selection & Bulk Actions
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkActionStatus, setBulkActionStatus] = useState<string>('');
  const [bulkUpdating, setBulkUpdating] = useState(false);

  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalUpdating, setModalUpdating] = useState(false);
  const [courierInput, setCourierInput] = useState('');
  const [trackingInput, setTrackingInput] = useState('');
  const [adminNotesInput, setAdminNotesInput] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  const loadOrders = (page: number = 1) => {
    setLoading(true);
    fetchAdminOrders({
      page,
      limit: 15,
      status: activeTab === 'all' ? undefined : activeTab,
      payment_status: paymentFilter === 'all' ? undefined : paymentFilter,
      search: searchQuery || undefined,
      sort: sortOption,
    }).then((res) => {
      setOrders(res.data);
      setPagination(res.pagination);
      setLoading(false);
      setSelectedIds([]);
    });
  };

  useEffect(() => {
    loadOrders(1);
  }, [activeTab, paymentFilter, sortOption]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders(1);
  };

  const handleQuickStatusChange = async (orderId: number, newStatus: string) => {
    await updateOrderStatus(orderId, { order_status: newStatus });
    loadOrders(pagination.page);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, order_status: newStatus as any } : null));
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === orders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map((o) => o.id));
    }
  };

  const handleToggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkUpdate = async () => {
    if (!bulkActionStatus || selectedIds.length === 0) return;
    setBulkUpdating(true);
    await bulkUpdateOrderStatus(selectedIds, bulkActionStatus);
    setBulkUpdating(false);
    setBulkActionStatus('');
    loadOrders(pagination.page);
  };

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setCourierInput(order.courier_name || 'BlueDart Express');
    setTrackingInput(order.tracking_number || '');
    setAdminNotesInput(order.admin_notes || '');
    setModalSuccess('');
  };

  const handleSaveOrderDetails = async () => {
    if (!selectedOrder) return;
    setModalUpdating(true);
    await updateOrderStatus(selectedOrder.id, {
      courier_name: courierInput,
      tracking_number: trackingInput,
      admin_notes: adminNotesInput,
      order_status: selectedOrder.order_status,
      production_stage: selectedOrder.production_stage,
      payment_status: selectedOrder.payment_status,
    });
    setModalSuccess('Order details updated successfully!');
    setModalUpdating(false);
    loadOrders(pagination.page);
    setTimeout(() => setModalSuccess(''), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-400">
            Fulfillment Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Order Management & Manifests
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Download high-res customer artwork, update courier AWB tracking, and manage production stages
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/production"
            className="flex items-center gap-2 rounded-xl bg-amber-500/20 border border-amber-500/40 px-4 py-2.5 text-xs font-extrabold text-amber-300 hover:bg-amber-500/30 transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>Open Print Pipeline</span>
          </Link>

          <button
            onClick={() => loadOrders(pagination.page)}
            className="flex items-center gap-2 rounded-xl border border-stone-800 bg-stone-950 px-4 py-2.5 text-xs font-bold text-stone-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-primary-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="rounded-3xl border border-stone-800 bg-stone-950 p-5 space-y-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 text-xs font-bold border-b border-stone-800/80 pb-4">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'processing', label: 'Processing' },
            { id: 'printing', label: 'In Print Station' },
            { id: 'dispatched', label: 'Dispatched' },
            { id: 'delivered', label: 'Delivered' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-xl px-4 py-2 transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-950/40'
                  : 'bg-stone-900 text-stone-400 hover:bg-stone-850 hover:text-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Multi-Filters Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Order #, phone, customer, or waybill..."
              className="w-full rounded-xl border border-stone-800 bg-stone-900 py-2.5 pl-9 pr-20 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-primary-500"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-primary-600 px-3 py-1 text-[10px] font-bold text-white hover:bg-primary-500"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2">
            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="rounded-xl border border-stone-800 bg-stone-900 px-3 py-2 text-xs text-stone-300 font-medium focus:outline-none"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            {/* Sort Options */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="rounded-xl border border-stone-800 bg-stone-900 px-3 py-2 text-xs text-stone-300 font-medium focus:outline-none"
            >
              <option value="id_desc">Newest First</option>
              <option value="id_asc">Oldest First</option>
              <option value="total_desc">Highest Amount</option>
              <option value="total_asc">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between rounded-2xl bg-primary-950/80 border border-primary-500/40 p-3 text-xs">
            <span className="font-bold text-primary-200">
              {selectedIds.length} orders selected
            </span>
            <div className="flex items-center gap-2">
              <select
                value={bulkActionStatus}
                onChange={(e) => setBulkActionStatus(e.target.value)}
                className="rounded-lg border border-primary-500/40 bg-stone-900 px-3 py-1 text-xs font-semibold text-white focus:outline-none"
              >
                <option value="">Update Status To...</option>
                <option value="processing">Processing</option>
                <option value="printing">In Print Station</option>
                <option value="dispatched">Dispatched</option>
                <option value="delivered">Delivered</option>
              </select>
              <button
                onClick={handleBulkUpdate}
                disabled={bulkUpdating || !bulkActionStatus}
                className="rounded-lg bg-primary-600 px-3 py-1 font-bold text-white hover:bg-primary-500 disabled:opacity-50"
              >
                {bulkUpdating ? 'Applying...' : 'Apply Batch'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-8 w-8 text-primary-400 animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-800 bg-stone-950 p-12 text-center text-stone-500 text-xs">
          No orders match the selected search or filters.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Select All Bar */}
          <div className="flex items-center gap-2 px-2 text-xs font-bold text-stone-400">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-1.5 hover:text-white"
            >
              {selectedIds.length === orders.length ? (
                <CheckSquare className="h-4 w-4 text-primary-400" />
              ) : (
                <Square className="h-4 w-4 text-stone-500" />
              )}
              <span>Select All on Page</span>
            </button>
            <span>•</span>
            <span>Showing {orders.length} of {pagination.total} orders</span>
          </div>

          {/* Cards */}
          {orders.map((order) => {
            const isSelected = selectedIds.includes(order.id);
            return (
              <div
                key={order.id}
                className={`rounded-3xl border transition-all p-5 sm:p-6 space-y-4 ${
                  isSelected
                    ? 'border-primary-500/60 bg-stone-950 shadow-lg shadow-primary-950/30'
                    : 'border-stone-800 bg-stone-950 hover:border-stone-700'
                }`}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800/80">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleSelect(order.id)}
                      className="text-stone-500 hover:text-primary-400"
                    >
                      {isSelected ? (
                        <CheckSquare className="h-5 w-5 text-primary-400" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-sm text-primary-400">
                        {order.order_number}
                      </span>
                      <span className="text-xs text-stone-500">•</span>
                      <span className="text-xs font-bold text-white">
                        {order.customer_name}
                      </span>
                      <span className="text-xs text-stone-400">
                        ({order.customer_phone})
                      </span>
                      <span className="rounded-md bg-stone-900 border border-stone-800 px-2 py-0.5 text-[10px] font-mono text-stone-400">
                        AWB: {order.tracking_number}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-sm font-black text-white block">
                        ₹{order.total_amount}
                      </span>
                      <span className={`inline-block rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                        order.payment_status === 'paid'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-950/60 text-amber-400 border border-amber-500/20'
                      }`}>
                        {order.payment_method} • {order.payment_status}
                      </span>
                    </div>

                    <select
                      value={order.order_status}
                      onChange={(e) => handleQuickStatusChange(order.id, e.target.value)}
                      className="rounded-xl border border-stone-700 bg-stone-900 px-3 py-1.5 text-xs font-bold text-white capitalize focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="processing">Processing</option>
                      <option value="printing">In Print Station</option>
                      <option value="dispatched">Dispatched</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {order.items && order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 rounded-2xl border border-stone-800/80 bg-stone-900/60 p-3 items-center"
                    >
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-stone-700 bg-stone-800">
                        <img
                          src={item.custom_photo_url || item.product_image}
                          alt={item.product_title}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0 text-xs space-y-0.5">
                        <h4 className="font-bold text-white truncate">{item.product_title}</h4>
                        <p className="text-[11px] text-primary-300 font-semibold">Shape: {item.shape_selected}</p>
                        {item.custom_text && (
                          <p className="text-[10px] text-stone-400 italic truncate">Engraving: &ldquo;{item.custom_text}&rdquo;</p>
                        )}
                        <p className="text-[10px] text-stone-500">Qty: {item.quantity} • ₹{item.price}</p>
                      </div>

                      {/* Download High-Res Original */}
                      <a
                        href={item.custom_photo_url || item.product_image}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600/20 text-primary-300 hover:bg-primary-600 hover:text-white transition-colors flex-shrink-0"
                        title="Download Artwork File"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-xs text-stone-400 border-t border-stone-800/60">
                  <div className="flex items-center gap-2 truncate max-w-xl">
                    <MapPin className="h-3.5 w-3.5 text-primary-400 flex-shrink-0" />
                    <span className="truncate">
                      {order.shipping_address}, {order.city}, {order.state} - {order.pincode}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-stone-500">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                      onClick={() => openOrderModal(order)}
                      className="flex items-center gap-1.5 font-bold text-primary-400 hover:text-primary-300 bg-stone-900 border border-stone-800 px-3 py-1 rounded-lg"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Full Manifest & Edit</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-800 text-xs">
            <span className="text-stone-400">
              Page <strong>{pagination.page}</strong> of <strong>{pagination.total_pages}</strong>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => loadOrders(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="flex items-center gap-1 rounded-xl bg-stone-950 border border-stone-800 px-3 py-2 text-stone-300 hover:text-white disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Prev</span>
              </button>
              <button
                onClick={() => loadOrders(pagination.page + 1)}
                disabled={pagination.page >= pagination.total_pages}
                className="flex items-center gap-1 rounded-xl bg-stone-950 border border-stone-800 px-3 py-2 text-stone-300 hover:text-white disabled:opacity-40"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl rounded-3xl border border-stone-800 bg-stone-900 p-6 sm:p-8 shadow-2xl text-stone-200 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-400">
                    Order Manifest
                  </span>
                  <span className="rounded-md bg-stone-800 px-2 py-0.5 text-[10px] font-mono text-stone-400">
                    ID #{selectedOrder.id}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  {selectedOrder.order_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-full p-2 text-stone-400 hover:text-white bg-stone-800/80"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Notification alert inside modal */}
            {modalSuccess && (
              <div className="rounded-xl bg-emerald-950/80 border border-emerald-500/30 p-3 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>{modalSuccess}</span>
              </div>
            )}

            {/* Customer & Destination Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-stone-950 p-4 border border-stone-800 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Customer Profile
                </span>
                <p className="font-bold text-white text-sm">{selectedOrder.customer_name}</p>
                <p className="text-stone-300 flex items-center gap-1.5"><Phone className="h-3 w-3 text-primary-400" /> {selectedOrder.customer_phone}</p>
                <p className="text-stone-300 flex items-center gap-1.5"><Mail className="h-3 w-3 text-primary-400" /> {selectedOrder.customer_email || 'No email provided'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Shipping Address
                </span>
                <p className="text-stone-300">{selectedOrder.shipping_address}</p>
                <p className="text-stone-300">{selectedOrder.city}, {selectedOrder.state} - <strong>{selectedOrder.pincode}</strong></p>
                <div className="pt-1">
                  <a
                    href={`/track/${selectedOrder.tracking_number}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-400 hover:underline"
                  >
                    <span>View Customer Tracking Page</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Order Items with High-Res Download */}
            <div className="space-y-3">
              <span className="font-bold text-stone-400 uppercase text-[10px] tracking-wider block">
                Manufacture Items & Assets ({selectedOrder.items?.length || 0})
              </span>
              <div className="space-y-2">
                {selectedOrder.items && selectedOrder.items.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-stone-950 p-4 border border-stone-800"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.custom_photo_url || item.product_image}
                        alt={item.product_title}
                        className="h-16 w-16 rounded-xl object-cover border border-stone-700 bg-stone-900 flex-shrink-0"
                      />
                      <div className="space-y-0.5 text-xs">
                        <h5 className="font-bold text-white text-sm">{item.product_title}</h5>
                        <p className="text-primary-300 font-bold">Cut Contour: {item.shape_selected}</p>
                        {item.custom_text && (
                          <p className="text-stone-400 italic">Custom Text: &ldquo;{item.custom_text}&rdquo;</p>
                        )}
                        <p className="text-stone-500 text-[11px]">Quantity: {item.quantity} • Unit Rate: ₹{item.price}</p>
                      </div>
                    </div>

                    <a
                      href={item.custom_photo_url || item.product_image}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="rounded-xl bg-primary-600 px-4 py-2 text-xs font-bold text-white hover:bg-primary-500 flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download High-Res (1200 DPI)</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Logistics, Tracking & Production Stage Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-2xl bg-stone-950 p-4 border border-stone-800 text-xs">
              <div>
                <label className="font-bold text-stone-300 block mb-1">Order Status</label>
                <select
                  value={selectedOrder.order_status}
                  onChange={(e) => setSelectedOrder({ ...selectedOrder, order_status: e.target.value as any })}
                  className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-white capitalize font-semibold"
                >
                  <option value="processing">Processing</option>
                  <option value="printing">In Print Station</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-300 block mb-1">Production Stage</label>
                <select
                  value={selectedOrder.production_stage || 'image_received'}
                  onChange={(e) => setSelectedOrder({ ...selectedOrder, production_stage: e.target.value as any })}
                  className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-white capitalize font-semibold"
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
                <label className="font-bold text-stone-300 block mb-1">Payment Status</label>
                <select
                  value={selectedOrder.payment_status}
                  onChange={(e) => setSelectedOrder({ ...selectedOrder, payment_status: e.target.value as any })}
                  className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-white capitalize font-semibold"
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="refunded">Refunded</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-300 block mb-1">Courier Partner</label>
                <input
                  type="text"
                  value={courierInput}
                  onChange={(e) => setCourierInput(e.target.value)}
                  placeholder="e.g. BlueDart, Delhivery"
                  className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-stone-300 block mb-1">Tracking Number / Waybill</label>
                <input
                  type="text"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="AWB tracking number..."
                  className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="font-bold text-stone-300 block mb-1">Admin / Studio Internal Notes</label>
                <textarea
                  rows={2}
                  value={adminNotesInput}
                  onChange={(e) => setAdminNotesInput(e.target.value)}
                  placeholder="Production notes, custom laser alignment instructions..."
                  className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-white"
                />
              </div>
            </div>

            {/* Financial Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-2 border-t border-stone-800">
              <div className="text-stone-400 space-x-3">
                <span>Subtotal: ₹{selectedOrder.subtotal}</span>
                <span>Shipping: ₹{selectedOrder.shipping_fee}</span>
                <span>Discount: -₹{selectedOrder.discount}</span>
                <span className="font-bold text-white">Grand Total: ₹{selectedOrder.total_amount}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-xl border border-stone-700 bg-stone-800 px-4 py-2 font-bold text-stone-300 hover:text-white flex items-center gap-1.5"
                >
                  <FileText className="h-4 w-4" />
                  <span>Print Slip</span>
                </button>
                <button
                  type="button"
                  disabled={modalUpdating}
                  onClick={handleSaveOrderDetails}
                  className="rounded-xl bg-primary-600 px-5 py-2 font-bold text-white hover:bg-primary-500 disabled:opacity-50 transition-colors shadow-md"
                >
                  {modalUpdating ? 'Saving...' : 'Save Order Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
