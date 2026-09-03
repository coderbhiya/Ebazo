'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CreditCard, IndianRupee, CheckCircle2, Clock, 
  AlertCircle, RefreshCw, Search, ArrowDownLeft, 
  ArrowUpRight, ShieldCheck, Wallet
} from 'lucide-react';
import { fetchAdminPayments, updateOrderStatus } from '@/lib/admin-api';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  const loadPayments = (status: string = 'all') => {
    setLoading(true);
    fetchAdminPayments(status).then((res) => {
      setPayments(res.data);
      setSummary(res.summary);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadPayments(activeTab);
  }, [activeTab]);

  const handleUpdatePaymentStatus = async (orderId: number, status: string) => {
    await updateOrderStatus(orderId, { payment_status: status });
    setToastMessage(`Payment status updated to ${status.toUpperCase()} for Order #${orderId}`);
    setTimeout(() => setToastMessage(''), 3000);
    loadPayments(activeTab);
  };

  const filteredPayments = payments.filter((p) => {
    if (!searchQuery) return true;
    return (
      p.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customer_phone?.includes(searchQuery) ||
      p.payment_method?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Financial Reconciliation
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Payments & Transactions
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            UPI collections, card gateways, cash on delivery settlements, and refund logs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadPayments(activeTab)}
            className="flex items-center gap-2 rounded-xl border border-stone-800 bg-stone-950 px-4 py-2.5 text-xs font-bold text-stone-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-primary-400' : ''}`} />
            <span>Refresh Transactions</span>
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

      {/* Financial Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Paid */}
        <div className="rounded-3xl border border-stone-800 bg-stone-950 p-5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Settled Collections</span>
            <div className="rounded-xl bg-emerald-950/60 p-2 text-emerald-400 border border-emerald-500/20">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-emerald-400 block mt-1">
            ₹{summary?.total_collected?.toLocaleString('en-IN') || 0}
          </span>
          <span className="text-[11px] text-stone-500 block">Confirmed received funds</span>
        </div>

        {/* UPI Revenue */}
        <div className="rounded-3xl border border-stone-800 bg-stone-950 p-5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">UPI Payments</span>
            <div className="rounded-xl bg-primary-950/60 p-2 text-primary-400 border border-primary-500/20">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-white block mt-1">
            ₹{summary?.upi_total?.toLocaleString('en-IN') || 0}
          </span>
          <span className="text-[11px] text-stone-500 block">GPay, PhonePe, Paytm, QR</span>
        </div>

        {/* Cards & Net Banking */}
        <div className="rounded-3xl border border-stone-800 bg-stone-950 p-5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Credit/Debit Cards</span>
            <div className="rounded-xl bg-sky-950/60 p-2 text-sky-400 border border-sky-500/20">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-white block mt-1">
            ₹{summary?.card_total?.toLocaleString('en-IN') || 0}
          </span>
          <span className="text-[11px] text-stone-500 block">Visa, Mastercard, RuPay</span>
        </div>

        {/* Pending & COD */}
        <div className="rounded-3xl border border-stone-800 bg-stone-950 p-5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Pending / COD</span>
            <div className="rounded-xl bg-amber-950/60 p-2 text-amber-400 border border-amber-500/20">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-amber-400 block mt-1">
            ₹{summary?.pending_collection?.toLocaleString('en-IN') || 0}
          </span>
          <span className="text-[11px] text-stone-500 block">Awaiting customer clearance</span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-3xl border border-stone-800 bg-stone-950 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Transactions' },
              { id: 'paid', label: 'Paid' },
              { id: 'pending', label: 'Pending' },
              { id: 'refunded', label: 'Refunded' },
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
              placeholder="Search Order #, phone or customer..."
              className="w-full rounded-xl border border-stone-800 bg-stone-900 py-2 pl-9 pr-3 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-primary-500"
            />
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-500" />
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <RefreshCw className="h-8 w-8 text-primary-400 animate-spin" />
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="py-12 text-center text-stone-500 text-xs">
            No transaction records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 border-b border-stone-800">
                <tr>
                  <th className="pb-3">Order #</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Gross Total</th>
                  <th className="pb-3">Breakdown</th>
                  <th className="pb-3">Payment Method</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-900/50 transition-colors">
                    <td className="py-3.5 font-mono font-bold text-primary-400">
                      {p.order_number}
                    </td>

                    <td className="py-3.5">
                      <p className="font-bold text-white">{p.customer_name}</p>
                      <p className="text-[10px] text-stone-500">{p.customer_phone}</p>
                    </td>

                    <td className="py-3.5 font-black text-white text-sm">
                      ₹{p.total_amount}
                    </td>

                    <td className="py-3.5 text-[11px] text-stone-400">
                      <span>Items: ₹{p.subtotal}</span>
                      {p.discount > 0 && <span className="text-emerald-400 ml-1.5">-₹{p.discount}</span>}
                      {p.shipping_fee > 0 && <span className="text-stone-500 ml-1.5">+₹{p.shipping_fee} Ship</span>}
                    </td>

                    <td className="py-3.5">
                      <span className="rounded-lg bg-stone-900 border border-stone-800 px-2 py-1 text-[11px] font-bold uppercase text-stone-300">
                        {p.payment_method}
                      </span>
                    </td>

                    <td className="py-3.5">
                      <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                        p.payment_status === 'paid'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20'
                          : p.payment_status === 'refunded'
                          ? 'bg-rose-950/60 text-rose-300 border border-rose-500/20'
                          : 'bg-amber-950/60 text-amber-400 border border-amber-500/20'
                      }`}>
                        {p.payment_status}
                      </span>
                    </td>

                    <td className="py-3.5 text-right">
                      <select
                        value={p.payment_status}
                        onChange={(e) => handleUpdatePaymentStatus(p.id, e.target.value)}
                        className="rounded-lg border border-stone-700 bg-stone-900 px-2.5 py-1 text-[11px] font-semibold text-stone-200 capitalize focus:outline-none focus:ring-1 focus:ring-primary-500"
                      >
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="refunded">Refunded</option>
                        <option value="failed">Failed</option>
                      </select>
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
