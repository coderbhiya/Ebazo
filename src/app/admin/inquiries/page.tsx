'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Mail, Phone, Clock, RefreshCw, CheckCircle2 } from 'lucide-react';
import { fetchAdminInquiries, Inquiry } from '@/lib/admin-api';

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
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
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-violet-400' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-8 w-8 text-violet-500 animate-spin" />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-800 bg-stone-950 p-12 text-center text-stone-500 text-xs">
          No customer inquiries received yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {inquiries.map((inq) => (
            <div
              key={inq.id}
              className="rounded-3xl border border-stone-800 bg-stone-950 p-6 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-800">
                <div>
                  <h3 className="text-sm font-bold text-white">{inq.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-stone-400 mt-0.5">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {inq.email}</span>
                    {inq.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {inq.phone}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-stone-500">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(inq.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <div>
                <span className="inline-block rounded-lg bg-violet-950/60 border border-violet-500/30 px-2.5 py-0.5 text-[10px] font-bold text-violet-300 uppercase mb-2">
                  {inq.subject || 'General Inquiry'}
                </span>
                <p className="text-xs text-stone-300 leading-relaxed bg-stone-900/60 rounded-xl p-3 border border-stone-800/80">
                  {inq.message}
                </p>
              </div>

              <div className="flex justify-end pt-1">
                <a
                  href={`mailto:${inq.email}?subject=Re: ${encodeURIComponent(inq.subject || 'Ebanzo Inquiry')}`}
                  className="rounded-xl bg-violet-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-violet-500 transition-colors"
                >
                  Reply via Email
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
