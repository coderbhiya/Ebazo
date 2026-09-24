'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Mail, Phone, Clock, RefreshCw, CheckCircle2 } from 'lucide-react';
import { fetchAdminInquiries, updateInquiryStatus, Inquiry } from '@/lib/admin-api';

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  const loadData = () => {
    setLoading(true);
    fetchAdminInquiries().then((res) => {
      setInquiries(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (inq: Inquiry) => {
    const nextStatus = inq.status === 'unread' ? 'read' : 'unread';
    await updateInquiryStatus(inq.id, nextStatus);
    setToastMessage(`Inquiry marked as ${nextStatus.toUpperCase()}`);
    setTimeout(() => setToastMessage(''), 3000);
    loadData();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-400">
            Customer Inquiries
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Customer Notes & Bulk Quotes
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Manage inquiries submitted via the customer storefront
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 rounded-xl border border-stone-800 bg-stone-950 px-4 py-2.5 text-xs font-bold text-stone-300 hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-primary-400' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {toastMessage && (
        <div className="rounded-2xl bg-emerald-950/80 border border-emerald-500/30 p-3 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-8 w-8 text-primary-400 animate-spin" />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-800 bg-stone-950 p-12 text-center text-stone-500 text-xs">
          No customer inquiries received yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-stone-800 bg-stone-950">
          <table className="w-full min-w-[860px] text-left text-xs">
            <thead className="bg-stone-900/80 text-[10px] uppercase tracking-wider text-stone-400">
              <tr>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold">From</th>
                <th className="px-3 py-3 font-semibold">Subject & message</th>
                <th className="px-3 py-3 font-semibold">Received</th>
                <th className="px-3 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/70">
              {inquiries.map((inq) => (
                <tr key={inq.id} className={`align-top ${inq.status === 'unread' ? 'bg-amber-950/10' : ''} hover:bg-stone-900/50`}>
                  <td className="px-3 py-3">
                    <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                      inq.status === 'unread'
                        ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                        : 'bg-stone-900 text-stone-400'
                    }`}>
                      {inq.status || 'unread'}
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className={`block text-white ${inq.status === 'unread' ? 'font-bold' : 'font-semibold'}`}>{inq.name}</span>
                    <span className="flex items-center gap-1 text-[11px] text-stone-400"><Mail className="h-3 w-3" /> {inq.email}</span>
                    {inq.phone && <span className="flex items-center gap-1 text-[11px] text-stone-400"><Phone className="h-3 w-3" /> {inq.phone}</span>}
                  </td>
                  <td className="px-3 py-3 max-w-[420px]">
                    <span className="inline-block rounded bg-primary-950/60 border border-primary-500/30 px-2 py-0.5 text-[10px] font-bold uppercase text-primary-300">
                      {inq.subject || 'General Inquiry'}
                    </span>
                    <p className="mt-1.5 whitespace-pre-line leading-relaxed text-stone-300">{inq.message}</p>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-[11px] text-stone-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(inq.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleStatus(inq)}
                        className="rounded-lg border border-stone-700 bg-stone-900 px-2.5 py-1.5 text-[11px] font-semibold text-stone-300 hover:text-white"
                      >
                        Mark {inq.status === 'unread' ? 'read' : 'unread'}
                      </button>
                      <a
                        href={`mailto:${inq.email}?subject=Re: ${encodeURIComponent(inq.subject || 'Ebanzo Inquiry')}`}
                        className="rounded-lg bg-primary-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-primary-500"
                      >
                        Reply
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
