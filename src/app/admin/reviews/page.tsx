'use client';

import React, { useState, useEffect } from 'react';
import { 
  Star, CheckCircle2, XCircle, Trash2, 
  RefreshCw, MessageSquare, Sparkles, Eye, Filter
} from 'lucide-react';
import { fetchAdminReviews, updateAdminReview, deleteAdminReview, Review } from '@/lib/admin-api';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [toastMessage, setToastMessage] = useState('');

  const loadReviews = () => {
    setLoading(true);
    fetchAdminReviews().then((res) => {
      setReviews(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleUpdateStatus = async (id: number, status: string) => {
    await updateAdminReview(id, { status });
    setToastMessage(`Review #${id} marked as ${status.toUpperCase()}`);
    setTimeout(() => setToastMessage(''), 3000);
    loadReviews();
  };

  const handleToggleFeatured = async (review: Review) => {
    const newFeatured = review.is_featured === 1 ? 0 : 1;
    await updateAdminReview(review.id, { is_featured: newFeatured });
    setToastMessage(newFeatured === 1 ? 'Review featured on storefront homepage!' : 'Review removed from featured');
    setTimeout(() => setToastMessage(''), 3000);
    loadReviews();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to permanently delete this customer review?')) {
      await deleteAdminReview(id);
      setToastMessage('Review deleted');
      setTimeout(() => setToastMessage(''), 3000);
      loadReviews();
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (activeFilter === 'all') return true;
    return r.status === activeFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            User-Generated Content
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Customer Reviews Moderation
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Moderate verified buyer feedback, star ratings, and showcase testimonials on the storefront
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadReviews}
            className="flex items-center gap-2 rounded-xl border border-stone-800 bg-stone-950 px-4 py-2.5 text-xs font-bold text-stone-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-primary-400' : ''}`} />
            <span>Refresh Reviews</span>
          </button>
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="rounded-2xl bg-emerald-950/80 border border-emerald-500/30 p-3 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Reviews Table & Filters */}
      <div className="rounded-3xl border border-stone-800 bg-stone-950 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: `All Reviews (${reviews.length})` },
              { id: 'approved', label: 'Approved' },
              { id: 'pending', label: 'Pending Moderation' },
              { id: 'rejected', label: 'Rejected' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  activeFilter === tab.id
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-stone-900 text-stone-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <RefreshCw className="h-8 w-8 text-primary-400 animate-spin" />
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="py-12 text-center text-stone-500 text-xs">
            No reviews found under this filter.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReviews.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-stone-800 bg-stone-900/60 p-4 space-y-3 hover:border-stone-700 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-800/80">
                  <div className="flex items-center gap-3">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-700'}`} 
                        />
                      ))}
                    </div>
                    <span className="font-bold text-white text-xs">{r.customer_name}</span>
                    <span className="text-[10px] text-stone-500">({r.customer_email || 'Verified Buyer'})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {r.is_featured === 1 && (
                      <span className="rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 text-[9px] font-black uppercase">
                        Homepage Featured
                      </span>
                    )}

                    <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                      r.status === 'approved'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20'
                        : r.status === 'rejected'
                        ? 'bg-rose-950/60 text-rose-300 border border-rose-500/20'
                        : 'bg-amber-950/60 text-amber-400 border border-amber-500/20'
                    }`}>
                      {r.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  {r.title && <h4 className="font-bold text-white text-xs">&ldquo;{r.title}&rdquo;</h4>}
                  <p className="text-xs text-stone-300 leading-relaxed">{r.comment}</p>
                  {r.product_title && (
                    <p className="text-[11px] text-primary-400 font-semibold pt-1">
                      Product: {r.product_title}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-800/80 text-xs">
                  <span className="text-[10px] text-stone-500">
                    Submitted on {new Date(r.created_at || '').toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleFeatured(r)}
                      className={`px-3 py-1 rounded-lg border text-[11px] font-bold transition-colors ${
                        r.is_featured === 1
                          ? 'border-amber-500/40 bg-amber-500/20 text-amber-300'
                          : 'border-stone-700 bg-stone-800 text-stone-300 hover:text-white'
                      }`}
                    >
                      {r.is_featured === 1 ? '★ Featured' : '☆ Feature on Home'}
                    </button>

                    {r.status !== 'approved' && (
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'approved')}
                        className="rounded-lg bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 text-[11px] font-bold text-emerald-400 hover:bg-emerald-900/60"
                      >
                        Approve
                      </button>
                    )}

                    {r.status !== 'rejected' && (
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'rejected')}
                        className="rounded-lg bg-rose-950/60 border border-rose-500/30 px-3 py-1 text-[11px] font-bold text-rose-400 hover:bg-rose-900/60"
                      >
                        Reject
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(r.id)}
                      className="p-1 rounded-lg text-stone-500 hover:text-rose-400"
                      title="Delete review"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
