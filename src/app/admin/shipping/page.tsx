'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Truck, Search, Package, CheckCircle2, 
  Clock, RefreshCw, ExternalLink, MapPin, 
  Phone, Edit3, Send, AlertCircle
} from 'lucide-react';
import { fetchAdminShipping, updateOrderStatus, Order } from '@/lib/admin-api';

const COURIERS = [
  'BlueDart Express',
  'Delhivery Logistics',
  'DTDC Express',
  'India Post Speed Post',
  'Shadowfax',
  'Ecom Express'
];

export default function AdminShippingPage() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [courierName, setCourierName] = useState('BlueDart Express');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const loadShipping = (status: string = 'all') => {
    setLoading(true);
    fetchAdminShipping(status).then((res) => {
      setShipments(res.data);
      setSummary(res.summary);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadShipping(activeTab);
  }, [activeTab]);

  const handleSaveWaybill = async (id: number) => {
    await updateOrderStatus(id, {
      courier_name: courierName,
      tracking_number: trackingNumber,
    });
    setEditingId(null);
    setToastMessage(`Shipment #${id} courier info updated!`);
    setTimeout(() => setToastMessage(''), 3000);
    loadShipping(activeTab);
  };

  const handleMarkDelivered = async (id: number) => {
    await updateOrderStatus(id, {
      order_status: 'delivered',
      production_stage: 'dispatched'
    });
    setToastMessage(`Order #${id} marked as Delivered!`);
    setTimeout(() => setToastMessage(''), 3000);
    loadShipping(activeTab);
  };

  const filteredShipments = shipments.filter((s) => {
    if (!searchQuery) return true;
    return (
      s.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tracking_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.courier_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
            Logistics & Couriers
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Shipping & Dispatch Station
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Assign courier waybills, monitor in-transit deliveries, and maintain delivery milestone logs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadShipping(activeTab)}
            className="flex items-center gap-2 rounded-xl border border-stone-800 bg-stone-950 px-4 py-2.5 text-xs font-bold text-stone-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-primary-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="rounded-2xl bg-emerald-950/80 border border-emerald-500/30 p-3 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTab('printing')}
          className={`p-5 rounded-3xl border text-left transition-all ${
            activeTab === 'printing'
              ? 'border-amber-500 bg-stone-950 shadow-md shadow-amber-950/30'
              : 'border-stone-800 bg-stone-950/60 hover:border-stone-700'
          }`}
        >
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">Ready for Dispatch</span>
          <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">{summary?.ready_to_ship || 0}</span>
          <span className="text-[11px] text-stone-400 mt-1 block">In packaging station awaiting pickup</span>
        </button>

        <button
          onClick={() => setActiveTab('dispatched')}
          className={`p-5 rounded-3xl border text-left transition-all ${
            activeTab === 'dispatched'
              ? 'border-sky-500 bg-stone-950 shadow-md shadow-sky-950/30'
              : 'border-stone-800 bg-stone-950/60 hover:border-stone-700'
          }`}
        >
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">In Transit / Dispatched</span>
          <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">{summary?.dispatched || 0}</span>
          <span className="text-[11px] text-stone-400 mt-1 block">Handed over to courier network</span>
        </button>

        <button
          onClick={() => setActiveTab('delivered')}
          className={`p-5 rounded-3xl border text-left transition-all ${
            activeTab === 'delivered'
              ? 'border-emerald-500 bg-stone-950 shadow-md shadow-emerald-950/30'
              : 'border-stone-800 bg-stone-950/60 hover:border-stone-700'
          }`}
        >
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Delivered Orders</span>
          <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">{summary?.delivered || 0}</span>
          <span className="text-[11px] text-stone-400 mt-1 block">Successfully handed to customer</span>
        </button>
      </div>

      {/* Shipments Table */}
      <div className="rounded-3xl border border-stone-800 bg-stone-950 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Shipments' },
              { id: 'printing', label: 'Ready to Ship' },
              { id: 'dispatched', label: 'Dispatched' },
              { id: 'delivered', label: 'Delivered' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-stone-900 text-stone-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search AWB, order #, or city..."
              className="w-full rounded-xl border border-stone-800 bg-stone-900 py-2 pl-9 pr-3 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-primary-500"
            />
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-500" />
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <RefreshCw className="h-8 w-8 text-primary-400 animate-spin" />
          </div>
        ) : filteredShipments.length === 0 ? (
          <div className="py-12 text-center text-stone-500 text-xs">
            No shipping records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 border-b border-stone-800">
                <tr>
                  <th className="pb-3">Order #</th>
                  <th className="pb-3">Customer & Destination</th>
                  <th className="pb-3">Courier Partner</th>
                  <th className="pb-3">AWB Tracking Number</th>
                  <th className="pb-3">Delivery Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {filteredShipments.map((s) => (
                  <tr key={s.id} className="hover:bg-stone-900/50 transition-colors">
                    <td className="py-3.5 font-mono font-bold text-primary-400">
                      {s.order_number}
                    </td>

                    <td className="py-3.5">
                      <p className="font-bold text-white">{s.customer_name}</p>
                      <p className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-primary-400" />
                        <span>{s.city}, {s.state} ({s.pincode})</span>
                      </p>
                    </td>

                    <td className="py-3.5">
                      {editingId === s.id ? (
                        <select
                          value={courierName}
                          onChange={(e) => setCourierName(e.target.value)}
                          className="rounded-lg border border-primary-500 bg-stone-900 px-2 py-1 text-xs text-white"
                        >
                          {COURIERS.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="font-semibold text-stone-200">
                          {s.courier_name || 'BlueDart Express'}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 font-mono">
                      {editingId === s.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            className="rounded-lg border border-primary-500 bg-stone-900 px-2 py-1 text-xs text-white"
                          />
                          <button
                            onClick={() => handleSaveWaybill(s.id)}
                            className="rounded-lg bg-primary-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-primary-500"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-primary-300 font-bold">{s.tracking_number}</span>
                          <button
                            onClick={() => {
                              setEditingId(s.id);
                              setCourierName(s.courier_name || 'BlueDart Express');
                              setTrackingNumber(s.tracking_number || '');
                            }}
                            className="text-stone-500 hover:text-white"
                            title="Edit AWB"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5">
                      <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                        s.order_status === 'delivered'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20'
                          : s.order_status === 'dispatched'
                          ? 'bg-sky-950/60 text-sky-400 border border-sky-500/20'
                          : 'bg-amber-950/60 text-amber-400 border border-amber-500/20'
                      }`}>
                        {s.order_status}
                      </span>
                    </td>

                    <td className="py-3.5 text-right space-x-2">
                      <a
                        href={`/track/${s.tracking_number}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 font-bold text-primary-400 hover:underline"
                        title="Live tracking page"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Track</span>
                      </a>

                      {s.order_status !== 'delivered' && (
                        <button
                          onClick={() => handleMarkDelivered(s.id)}
                          className="rounded-lg bg-stone-900 border border-stone-800 px-2.5 py-1 text-[10px] font-bold text-emerald-400 hover:bg-emerald-950/40 transition-colors"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
