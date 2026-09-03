'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, ShoppingCart, Clock, Truck, 
  Package, ArrowRight, Printer, CheckCircle2, RefreshCw 
} from 'lucide-react';
import { fetchAdminStats, updateOrderStatus, AdminStats } from '@/lib/admin-api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    fetchAdminStats().then((data) => {
      setStats(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    await updateOrderStatus(orderId, newStatus);
    loadData();
  };

  if (loading && !stats) {
    return (
      <div className="flex h-full items-center justify-center py-24">
        <RefreshCw className="h-8 w-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${(stats?.revenue || 0).toLocaleString('en-IN')}`,
      sub: 'Lifetime order volume',
      icon: TrendingUp,
      color: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    },
    {
      title: 'Total Orders',
      value: stats?.total_orders || 0,
      sub: 'Across 2,000+ pincodes',
      icon: ShoppingCart,
      color: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
    },
    {
      title: 'In Production Queue',
      value: stats?.pending_print || 0,
      sub: 'Awaiting UV laser printing',
      icon: Clock,
      color: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
    },
    {
      title: 'Dispatched & Delivered',
      value: stats?.shipped_orders || 0,
      sub: 'Fulfillment completed',
      icon: Truck,
      color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
            Ebanzo Command Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Studio Performance Overview</h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-violet-600/30 hover:bg-violet-500 transition-colors"
          >
            <Printer className="h-4 w-4 text-amber-300" />
            <span>Open Print Station ({stats?.pending_print || 0})</span>
          </Link>
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl border border-stone-800 bg-stone-950 text-stone-400 hover:text-white"
            title="Refresh Data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="rounded-2xl border border-stone-800 bg-stone-950 p-5 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-400">{card.title}</span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-xl border ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black text-white">{card.value}</span>
              <p className="text-[11px] text-stone-500 mt-0.5">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders Section */}
      <div className="rounded-3xl border border-stone-800 bg-stone-950 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div>
            <h2 className="text-base font-bold text-white">Recent Customer Orders</h2>
            <p className="text-xs text-stone-400">Incoming photo customization requests & orders</p>
          </div>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1.5 text-xs font-bold text-violet-400 hover:text-violet-300"
          >
            <span>View All Orders</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto pt-4">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 border-b border-stone-800">
              <tr>
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Total Amount</th>
                <th className="pb-3">Payment</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {stats?.recent_orders && stats.recent_orders.length > 0 ? (
                stats.recent_orders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-900/50 transition-colors">
                    <td className="py-3.5 font-mono font-bold text-violet-400">
                      {order.order_number}
                    </td>
                    <td className="py-3.5">
                      <p className="font-bold text-white">{order.customer_name}</p>
                      <p className="text-[10px] text-stone-500">{order.customer_phone}</p>
                    </td>
                    <td className="py-3.5 font-bold text-white">
                      ₹{order.total_amount}
                    </td>
                    <td className="py-3.5">
                      <span className="rounded-full bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400 uppercase">
                        {order.payment_method} • {order.payment_status}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <select
                        value={order.order_status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="rounded-lg border border-stone-700 bg-stone-900 px-2.5 py-1 text-[11px] font-semibold text-stone-200 capitalize focus:outline-none focus:ring-1 focus:ring-violet-500"
                      >
                        <option value="processing">Processing</option>
                        <option value="printing">In Printing</option>
                        <option value="dispatched">Dispatched</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </td>
                    <td className="py-3.5">
                      <Link
                        href="/admin/orders"
                        className="text-xs font-bold text-violet-400 hover:text-violet-300"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-500">
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
