'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, ShoppingBag, Clock, Truck, 
  Package, ArrowRight, Printer, RefreshCw,
  AlertCircle, AlertTriangle, CheckCircle2, IndianRupee, Users,
  Star, ChevronRight, Eye, Sparkles, Filter, ArrowUpRight
} from 'lucide-react';
import { fetchAdminStats, fetchAdminAnalytics, updateOrderStatus, AdminStats, AnalyticsData } from '@/lib/admin-api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsRange, setAnalyticsRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, analyticsData] = await Promise.all([
        fetchAdminStats(),
        fetchAdminAnalytics(analyticsRange)
      ]);
      setStats(statsData);
      setAnalytics(analyticsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRangeChange = async (range: '7d' | '30d' | '90d') => {
    setAnalyticsRange(range);
    setAnalyticsLoading(true);
    const data = await fetchAdminAnalytics(range);
    setAnalytics(data);
    setAnalyticsLoading(false);
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    await updateOrderStatus(orderId, { order_status: newStatus });
    setActionSuccess(`Order #${orderId} updated to ${newStatus}`);
    setTimeout(() => setActionSuccess(''), 3000);
    loadData();
  };

  // Calculate max values for SVG chart scaling
  const maxRevenue = analytics?.daily_series?.length 
    ? Math.max(...analytics.daily_series.map(d => d.revenue), 1000)
    : 1000;

  return (
    <div className="space-y-6">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-800/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-emerald-400 tracking-wide">
              Live Operations
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            Studio Performance
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Real-time fulfillment metrics, print queue status, and financial overview
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/production"
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-500 transition-all"
          >
            <Printer className="h-3.5 w-3.5 text-primary-100" />
            <span>Print Station ({stats?.pending_print || 0})</span>
          </Link>

          <button
            onClick={loadData}
            className="p-2 rounded-lg border border-stone-800/80 bg-stone-900/60 text-stone-400 hover:text-white hover:bg-stone-800/60 transition-colors"
            title="Refresh All Metrics"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-primary-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {actionSuccess && (
        <div className="rounded-lg bg-emerald-950/40 border border-emerald-500/30 px-3 py-2 text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Revenue */}
        <div className="rounded-xl border border-stone-800/70 bg-stone-900/40 hover:bg-stone-900/60 p-4 transition-all space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-400">Total Revenue</span>
            <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-400 border border-emerald-500/20">
              <IndianRupee className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-white">
            ₹{stats?.revenue?.toLocaleString('en-IN') || 0}
          </div>
          <div className="flex items-center justify-between text-[11px] pt-2 text-stone-400 border-t border-stone-800/60">
            <span>Today: <strong className="text-emerald-400 font-medium">₹{stats?.today_revenue?.toLocaleString('en-IN') || 0}</strong></span>
            <span>Month: <strong className="text-stone-200 font-medium">₹{stats?.monthly_revenue?.toLocaleString('en-IN') || 0}</strong></span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="rounded-xl border border-stone-800/70 bg-stone-900/40 hover:bg-stone-900/60 p-4 transition-all space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-400">Total Orders</span>
            <div className="rounded-lg bg-primary-500/10 p-1.5 text-primary-400 border border-primary-500/20">
              <ShoppingBag className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-white">
            {stats?.total_orders || 0}
          </div>
          <div className="flex items-center justify-between text-[11px] pt-2 text-stone-400 border-t border-stone-800/60">
            <span>Processing: <strong className="text-amber-400 font-medium">{stats?.pending_orders || 0}</strong></span>
            <span>Delivered: <strong className="text-emerald-400 font-medium">{stats?.delivered_orders || 0}</strong></span>
          </div>
        </div>

        {/* In Print & UV Station */}
        <div className="rounded-xl border border-stone-800/70 bg-stone-900/40 hover:bg-stone-900/60 p-4 transition-all space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-400">UV Print & Laser Queue</span>
            <div className="rounded-lg bg-amber-500/10 p-1.5 text-amber-400 border border-amber-500/20">
              <Printer className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-white">
            {stats?.pending_print || 0}
          </div>
          <div className="flex items-center justify-between text-[11px] pt-2 text-stone-400 border-t border-stone-800/60">
            <span>Proofing: <strong className="text-stone-300 font-medium">{stats?.production_pending || 0}</strong></span>
            <Link href="/admin/production" className="text-primary-400 hover:text-primary-300 font-medium inline-flex items-center gap-0.5">
              <span>Queue</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Shipped & Out for Delivery */}
        <div className="rounded-xl border border-stone-800/70 bg-stone-900/40 hover:bg-stone-900/60 p-4 transition-all space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-400">Dispatched / Transit</span>
            <div className="rounded-lg bg-sky-500/10 p-1.5 text-sky-400 border border-sky-500/20">
              <Truck className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-white">
            {stats?.shipped_orders || 0}
          </div>
          <div className="flex items-center justify-between text-[11px] pt-2 text-stone-400 border-t border-stone-800/60">
            <span>Customers: <strong className="text-stone-300 font-medium">{stats?.unique_customers || 0}</strong></span>
            <Link href="/admin/shipping" className="text-primary-400 hover:text-primary-300 font-medium inline-flex items-center gap-0.5">
              <span>Track</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Operational Alerts Row */}
      {((stats?.low_stock_count || 0) > 0 || (stats?.pending_orders || 0) > 0 || (stats?.unread_inquiries || 0) > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {stats?.low_stock_count ? (
            <Link
              href="/admin/inventory?filter=low"
              className="flex items-center justify-between rounded-xl bg-rose-950/25 border border-rose-500/25 p-3 hover:bg-rose-950/40 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="h-4 w-4 text-rose-400 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-xs text-white">{stats.low_stock_count} Low Stock Items</h4>
                  <p className="text-[11px] text-rose-300/80">Inventory below safety threshold</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-rose-400/80" />
            </Link>
          ) : null}

          {stats?.pending_orders ? (
            <Link
              href="/admin/orders?status=processing"
              className="flex items-center justify-between rounded-xl bg-amber-950/25 border border-amber-500/25 p-3 hover:bg-amber-950/40 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-amber-400 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-xs text-white">{stats.pending_orders} Orders Awaiting Action</h4>
                  <p className="text-[11px] text-amber-300/80">Verify custom photos & artwork</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-amber-400/80" />
            </Link>
          ) : null}

          {stats?.unread_inquiries ? (
            <Link
              href="/admin/inquiries"
              className="flex items-center justify-between rounded-xl bg-primary-950/25 border border-primary-500/25 p-3 hover:bg-primary-950/40 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-primary-400 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-xs text-white">{stats.unread_inquiries} Unread Inquiries</h4>
                  <p className="text-[11px] text-primary-300/80">New custom quotes & inquiries</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-primary-400/80" />
            </Link>
          ) : null}
        </div>
      )}

      {/* Analytics Chart & Category Performance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue Trends Chart (2 Columns) */}
        <div className="lg:col-span-2 rounded-xl border border-stone-800/70 bg-stone-900/40 p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-800/60">
            <div>
              <h3 className="font-semibold text-sm text-white">Revenue & Order Volume</h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Period: <strong className="text-stone-200 font-medium">₹{analytics?.period_revenue?.toLocaleString('en-IN') || 0}</strong> • 
                Avg Order: <strong className="text-emerald-400 font-medium">₹{analytics?.average_order_value || 0}</strong>
              </p>
            </div>

            <div className="flex items-center gap-1 bg-stone-950/60 rounded-lg p-1 border border-stone-800/60">
              {(['7d', '30d', '90d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRangeChange(r)}
                  className={`rounded-md px-2.5 py-0.5 text-[11px] font-semibold transition-all ${
                    analyticsRange === r
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive SVG Bar/Line Chart */}
          <div className="h-52 w-full relative pt-2">
            {analyticsLoading ? (
              <div className="flex h-full items-center justify-center">
                <RefreshCw className="h-5 w-5 text-primary-400 animate-spin" />
              </div>
            ) : analytics?.daily_series && analytics.daily_series.length > 0 ? (
              <div className="flex h-full items-end gap-1 sm:gap-2">
                {analytics.daily_series.map((item, idx) => {
                  const heightPercent = Math.max(6, Math.round((item.revenue / maxRevenue) * 100));
                  return (
                    <div 
                      key={item.date} 
                      className="group relative flex-1 flex flex-col items-center h-full justify-end"
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-9 hidden group-hover:flex flex-col items-center z-20 bg-stone-800 border border-stone-700/80 px-2 py-1 rounded-md text-[10px] text-white shadow-xl whitespace-nowrap pointer-events-none">
                        <span className="font-semibold">₹{item.revenue} ({item.orders} orders)</span>
                        <span className="text-stone-400 text-[9px]">{item.date}</span>
                      </div>

                      {/* Bar */}
                      <div 
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-sm transition-all duration-200 ${
                          item.revenue > 0
                            ? 'bg-gradient-to-t from-primary-600 to-primary-400 group-hover:from-primary-500 group-hover:to-primary-300'
                            : 'bg-stone-800/40 group-hover:bg-stone-800/70'
                        }`}
                      />
                      <span className="text-[9px] text-stone-500 mt-1 truncate max-w-full block">
                        {idx % Math.ceil(analytics.daily_series.length / 7) === 0 ? item.label : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-stone-500 text-xs">
                No revenue transactions recorded in this period.
              </div>
            )}
          </div>
        </div>

        {/* Top Products & Category Breakdown (1 Column) */}
        <div className="rounded-xl border border-stone-800/70 bg-stone-900/40 p-4 sm:p-5 space-y-4">
          <div className="pb-3 border-b border-stone-800/60 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm text-white">Top Custom Keepsakes</h3>
              <p className="text-xs text-stone-400 mt-0.5">Best-selling products by volume</p>
            </div>
            <Link href="/admin/products" className="text-xs font-medium text-primary-400 hover:text-primary-300">
              All Products
            </Link>
          </div>

          <div className="space-y-2.5">
            {stats?.top_products && stats.top_products.length > 0 ? (
              stats.top_products.map((tp, idx) => (
                <div key={tp.product_id} className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-stone-800/30 transition-colors">
                  <span className="text-[11px] font-bold text-stone-500 w-4 text-center">{idx + 1}</span>
                  <div className="h-8 w-8 rounded-lg overflow-hidden bg-stone-800 border border-stone-700/60 flex-shrink-0">
                    <img src={tp.product_image} alt={tp.product_title} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-xs text-stone-200 truncate">{tp.product_title}</h5>
                    <p className="text-[11px] text-stone-400">{tp.units_sold} sold • <span className="text-emerald-400 font-medium">₹{tp.gross_revenue}</span></p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-stone-500 text-xs">
                No product sales recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="rounded-xl border border-stone-800/70 bg-stone-900/40 p-4 sm:p-5 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-800/60">
          <div>
            <h3 className="text-sm font-semibold text-white">Recent Orders</h3>
            <p className="text-xs text-stone-400 mt-0.5">Manage statuses and print workflow</p>
          </div>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-xs font-medium text-primary-400 hover:text-primary-300"
          >
            <span>View All ({stats?.total_orders || 0})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 border-b border-stone-800/60">
              <tr>
                <th className="pb-2.5">Order #</th>
                <th className="pb-2.5">Customer</th>
                <th className="pb-2.5">Item / Shape</th>
                <th className="pb-2.5">Amount</th>
                <th className="pb-2.5">Payment</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/40">
              {stats?.recent_orders && stats.recent_orders.length > 0 ? (
                stats.recent_orders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-800/20 transition-colors">
                    <td className="py-2.5 font-mono font-medium text-primary-400">
                      {order.order_number}
                    </td>
                    <td className="py-2.5">
                      <p className="font-medium text-white">{order.customer_name}</p>
                      <p className="text-[10px] text-stone-500">{order.customer_phone}</p>
                    </td>
                    <td className="py-2.5">
                      {order.items && order.items.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <img 
                            src={order.items[0].custom_photo_url || order.items[0].product_image} 
                            alt="" 
                            className="h-7 w-7 rounded-md object-cover border border-stone-800" 
                          />
                          <div className="max-w-[140px] truncate">
                            <span className="font-medium text-stone-200 block truncate">{order.items[0].product_title}</span>
                            <span className="text-[10px] text-primary-300/90">{order.items[0].shape_selected}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-stone-500">No items</span>
                      )}
                    </td>
                    <td className="py-2.5 font-semibold text-white">
                      ₹{order.total_amount}
                    </td>
                    <td className="py-2.5">
                      <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-medium uppercase ${
                        order.payment_status === 'paid'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-950/60 text-amber-400 border border-amber-500/20'
                      }`}>
                        {order.payment_method} • {order.payment_status}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <select
                        value={order.order_status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="rounded-md border border-stone-700/80 bg-stone-900 px-2 py-1 text-[11px] font-medium text-stone-200 capitalize focus:outline-none focus:ring-1 focus:ring-primary-500"
                      >
                        <option value="processing">Processing</option>
                        <option value="printing">In Print Station</option>
                        <option value="dispatched">Dispatched</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </td>
                    <td className="py-2.5 text-right">
                      <Link
                        href={`/admin/orders`}
                        className="inline-flex items-center gap-1 font-medium text-primary-400 hover:text-primary-300"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Inspect</span>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-500">
                    No orders placed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
