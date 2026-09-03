'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, IndianRupee, ShoppingBag, 
  RefreshCw, Calendar, ArrowUpRight, PieChart, Layers
} from 'lucide-react';
import { fetchAdminAnalytics, AnalyticsData } from '@/lib/admin-api';

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(true);

  const loadAnalytics = (selectedRange: '7d' | '30d' | '90d') => {
    setLoading(true);
    fetchAdminAnalytics(selectedRange).then((data) => {
      setAnalytics(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadAnalytics(range);
  }, [range]);

  const maxRevenue = analytics?.daily_series?.length 
    ? Math.max(...analytics.daily_series.map(d => d.revenue), 1000)
    : 1000;

  const maxOrders = analytics?.daily_series?.length 
    ? Math.max(...analytics.daily_series.map(d => d.orders), 5)
    : 5;

  const totalCatRevenue = (analytics?.category_sales || []).reduce((sum, c) => sum + (c.category_revenue || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-400">
            Business Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Sales & Operational Analytics
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Track daily revenue trajectories, volume peaks, category share, and average basket sizes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-stone-950 rounded-2xl p-1.5 border border-stone-800">
            {(['7d', '30d', '90d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded-xl px-4 py-1.5 text-xs font-bold uppercase transition-all ${
                  range === r
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-950/40'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {r === '7d' ? 'Last 7 Days' : r === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
              </button>
            ))}
          </div>

          <button
            onClick={() => loadAnalytics(range)}
            className="p-2.5 rounded-2xl border border-stone-800 bg-stone-950 text-stone-400 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-primary-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-stone-800 bg-stone-950 p-6 space-y-1">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Period Gross Revenue</span>
          <span className="text-3xl font-black text-emerald-400 block mt-1">
            ₹{analytics?.period_revenue?.toLocaleString('en-IN') || 0}
          </span>
          <span className="text-[11px] text-stone-500 block">Settled order transactions</span>
        </div>

        <div className="rounded-3xl border border-stone-800 bg-stone-950 p-6 space-y-1">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Total Volume</span>
          <span className="text-3xl font-black text-white block mt-1">
            {analytics?.period_orders || 0} Orders
          </span>
          <span className="text-[11px] text-stone-500 block">Custom gifting items processed</span>
        </div>

        <div className="rounded-3xl border border-stone-800 bg-stone-950 p-6 space-y-1">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Average Order Value (AOV)</span>
          <span className="text-3xl font-black text-primary-400 block mt-1">
            ₹{analytics?.average_order_value || 0}
          </span>
          <span className="text-[11px] text-stone-500 block">Average spend per transaction</span>
        </div>
      </div>

      {/* Revenue Trend Visual Chart */}
      <div className="rounded-3xl border border-stone-800 bg-stone-950 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div>
            <h3 className="font-bold text-base text-white">Daily Revenue Curve</h3>
            <p className="text-xs text-stone-400">Interactive revenue progression over the selected timeframe</p>
          </div>
          <span className="text-xs font-mono text-primary-400 font-bold">Max Peak: ₹{maxRevenue}</span>
        </div>

        <div className="h-64 w-full relative pt-6">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <RefreshCw className="h-8 w-8 text-primary-400 animate-spin" />
            </div>
          ) : analytics?.daily_series && analytics.daily_series.length > 0 ? (
            <div className="flex h-full items-end gap-1.5 sm:gap-2">
              {analytics.daily_series.map((item, idx) => {
                const heightPercent = Math.max(8, Math.round((item.revenue / maxRevenue) * 100));
                return (
                  <div 
                    key={item.date} 
                    className="group relative flex-1 flex flex-col items-center h-full justify-end"
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-12 hidden group-hover:flex flex-col items-center z-20 bg-stone-800 border border-stone-700 px-3 py-1.5 rounded-xl text-[11px] text-white shadow-2xl whitespace-nowrap pointer-events-none">
                      <span className="font-bold text-emerald-400">₹{item.revenue}</span>
                      <span className="text-stone-300">{item.orders} orders placed</span>
                      <span className="text-stone-500 text-[9px]">{item.date}</span>
                    </div>

                    <div 
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-lg transition-all duration-300 ${
                        item.revenue > 0
                          ? 'bg-gradient-to-t from-primary-700 via-primary-500 to-primary-400 group-hover:brightness-125'
                          : 'bg-stone-900 group-hover:bg-stone-850'
                      }`}
                    />
                    <span className="text-[9px] text-stone-500 mt-2 truncate max-w-full block">
                      {idx % Math.ceil(analytics.daily_series.length / 8) === 0 ? item.label : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-stone-500 text-xs">
              No revenue series data available.
            </div>
          )}
        </div>
      </div>

      {/* Category Performance & Order Volume Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Share */}
        <div className="rounded-3xl border border-stone-800 bg-stone-950 p-6 space-y-4">
          <div className="pb-3 border-b border-stone-800">
            <h3 className="font-bold text-base text-white">Category Sales Distribution</h3>
            <p className="text-xs text-stone-400">Revenue split across custom categories</p>
          </div>

          <div className="space-y-3">
            {analytics?.category_sales && analytics.category_sales.length > 0 ? (
              analytics.category_sales.map((cat) => {
                const percent = totalCatRevenue > 0 ? Math.round((cat.category_revenue / totalCatRevenue) * 100) : 0;
                return (
                  <div key={cat.category_slug} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white capitalize">{cat.category_slug.replace(/-/g, ' ')}</span>
                      <span className="text-stone-400">₹{cat.category_revenue} ({percent}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-stone-900 overflow-hidden">
                      <div 
                        style={{ width: `${percent}%` }}
                        className="h-full bg-primary-500 rounded-full"
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="py-6 text-center text-stone-500 text-xs">No category data recorded yet.</p>
            )}
          </div>
        </div>

        {/* Daily Order Volume */}
        <div className="rounded-3xl border border-stone-800 bg-stone-950 p-6 space-y-4">
          <div className="pb-3 border-b border-stone-800">
            <h3 className="font-bold text-base text-white">Daily Order Volume</h3>
            <p className="text-xs text-stone-400">Number of orders received per day</p>
          </div>

          <div className="h-48 w-full relative pt-4">
            {analytics?.daily_series && (
              <div className="flex h-full items-end gap-1.5">
                {analytics.daily_series.map((item) => {
                  const heightPercent = Math.max(10, Math.round((item.orders / maxOrders) * 100));
                  return (
                    <div key={item.date} className="group relative flex-1 flex flex-col items-center h-full justify-end">
                      <div 
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-md transition-all ${
                          item.orders > 0 ? 'bg-amber-500 group-hover:bg-amber-400' : 'bg-stone-900'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
