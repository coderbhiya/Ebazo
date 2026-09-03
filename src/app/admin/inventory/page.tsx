'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Scissors, AlertTriangle, CheckCircle2, RefreshCw, 
  Search, Plus, Minus, Package, Edit, ArrowRight
} from 'lucide-react';
import { fetchAdminInventory, updateInventoryStock, InventoryItem } from '@/lib/admin-api';

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState<{ total_items: number; low_stock: number; out_of_stock: number }>({
    total_items: 0,
    low_stock: 0,
    out_of_stock: 0,
  });
  const [activeFilter, setActiveFilter] = useState<'all' | 'low' | 'out'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [stockInput, setStockInput] = useState<string>('');

  const loadInventory = (filter: string = 'all') => {
    setLoading(true);
    fetchAdminInventory(filter).then((res) => {
      setItems(res.data);
      setSummary(res.summary);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadInventory(activeFilter);
  }, [activeFilter]);

  const handleAdjustStock = async (id: number, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    await updateInventoryStock(id, newStock);
    setToastMessage(`Stock updated to ${newStock} units`);
    setTimeout(() => setToastMessage(''), 3000);
    loadInventory(activeFilter);
  };

  const handleDirectStockSave = async (id: number) => {
    const val = parseInt(stockInput);
    if (isNaN(val) || val < 0) return;
    await updateInventoryStock(id, val);
    setEditingId(null);
    setToastMessage(`Stock updated to ${val} units`);
    setTimeout(() => setToastMessage(''), 3000);
    loadInventory(activeFilter);
  };

  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true;
    return (
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category_slug.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-800/60">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-primary-400">
            Stock & Warehousing
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
            Inventory & Stock Control
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Monitor raw blank stock levels, update acrylic units, and manage reorder thresholds
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadInventory(activeFilter)}
            className="flex items-center gap-1.5 rounded-lg border border-stone-800/80 bg-stone-900/60 px-3 py-1.5 text-xs font-semibold text-stone-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-primary-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="rounded-lg bg-emerald-950/40 border border-emerald-500/30 px-3 py-2 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <button
          onClick={() => setActiveFilter('all')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeFilter === 'all'
              ? 'border-primary-500/50 bg-primary-500/10 shadow-sm'
              : 'border-stone-800/70 bg-stone-900/40 hover:bg-stone-900/60'
          }`}
        >
          <span className="text-xs font-medium text-stone-400 block">Total Catalog Items</span>
          <span className="text-2xl font-bold tracking-tight text-white mt-1 block">{summary.total_items}</span>
          <span className="text-[11px] text-stone-500 mt-0.5 block">Active product silhouettes</span>
        </button>

        <button
          onClick={() => setActiveFilter('low')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeFilter === 'low'
              ? 'border-amber-500/50 bg-amber-500/10 shadow-sm'
              : 'border-stone-800/70 bg-stone-900/40 hover:bg-stone-900/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-400 block">Low Stock Alert</span>
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white mt-1 block">{summary.low_stock}</span>
          <span className="text-[11px] text-stone-400 mt-0.5 block">Units ≤ 15 remaining</span>
        </button>

        <button
          onClick={() => setActiveFilter('out')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeFilter === 'out'
              ? 'border-rose-500/50 bg-rose-500/10 shadow-sm'
              : 'border-stone-800/70 bg-stone-900/40 hover:bg-stone-900/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-400 block">Out of Stock</span>
            <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white mt-1 block">{summary.out_of_stock}</span>
          <span className="text-[11px] text-stone-400 mt-0.5 block">Requires immediate reorder</span>
        </button>
      </div>

      {/* Search & Stock Table */}
      <div className="rounded-xl border border-stone-800/70 bg-stone-900/40 p-4 sm:p-5 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800/60">
          <div className="relative flex-1 sm:max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name or category..."
              className="w-full rounded-xl border border-stone-800 bg-stone-900 py-2 pl-9 pr-3 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-primary-500"
            />
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-500" />
          </div>

          <span className="text-xs text-stone-400">
            Showing <strong>{filteredItems.length}</strong> items in view
          </span>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <RefreshCw className="h-8 w-8 text-primary-400 animate-spin" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-12 text-center text-stone-500 text-xs">
            No inventory records found under this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 border-b border-stone-800">
                <tr>
                  <th className="pb-3">Product / Keepsake</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Material Specs</th>
                  <th className="pb-3">Current Stock</th>
                  <th className="pb-3">Stock Status</th>
                  <th className="pb-3 text-right">Quick Stock Adjustment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {filteredItems.map((item) => {
                  const isLow = item.stock > 0 && item.stock <= 15;
                  const isOut = item.stock === 0;

                  return (
                    <tr key={item.id} className="hover:bg-stone-900/50 transition-colors">
                      <td className="py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image_url}
                            alt=""
                            className="h-10 w-10 rounded-xl object-cover bg-stone-900 border border-stone-800 flex-shrink-0"
                          />
                          <div className="max-w-[200px] truncate">
                            <span className="font-bold text-white block truncate">{item.title}</span>
                            <span className="text-[10px] text-stone-500">₹{item.price}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 font-medium text-stone-400 capitalize">
                        {item.category_slug.replace(/-/g, ' ')}
                      </td>

                      <td className="py-3.5 text-stone-400 text-[11px]">
                        <p className="truncate max-w-[160px]">{item.material || 'Cast Acrylic'}</p>
                        <p className="text-stone-500 text-[10px]">{item.dimensions}</p>
                      </td>

                      <td className="py-3.5">
                        {editingId === item.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              value={stockInput}
                              onChange={(e) => setStockInput(e.target.value)}
                              className="w-16 rounded-lg border border-primary-500 bg-stone-900 px-2 py-1 text-xs text-white"
                              autoFocus
                            />
                            <button
                              onClick={() => handleDirectStockSave(item.id)}
                              className="rounded-lg bg-primary-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-primary-500"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-stone-400 hover:text-white text-[10px]"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white">{item.stock} units</span>
                            <button
                              onClick={() => {
                                setEditingId(item.id);
                                setStockInput(String(item.stock));
                              }}
                              className="text-stone-500 hover:text-primary-400"
                              title="Direct edit"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5">
                        {isOut ? (
                          <span className="inline-block rounded-md bg-rose-950/60 border border-rose-500/30 px-2 py-0.5 text-[10px] font-bold text-rose-300 uppercase">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-block rounded-md bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-300 uppercase">
                            Low Stock (≤15)
                          </span>
                        ) : (
                          <span className="inline-block rounded-md bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400 uppercase">
                            In Stock
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleAdjustStock(item.id, item.stock, -10)}
                            className="p-1.5 rounded-lg border border-stone-800 bg-stone-900 text-stone-400 hover:text-white hover:bg-stone-800"
                            title="Subtract 10 units"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleAdjustStock(item.id, item.stock, +10)}
                            className="p-1.5 rounded-lg border border-stone-800 bg-stone-900 text-stone-400 hover:text-white hover:bg-stone-800"
                            title="Add 10 units"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleAdjustStock(item.id, item.stock, +50)}
                            className="px-2 py-1 rounded-lg border border-stone-800 bg-stone-900 text-[10px] font-bold text-primary-400 hover:bg-stone-800"
                            title="Batch restock +50"
                          >
                            +50
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
