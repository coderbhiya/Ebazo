'use client';

import React, { useState, useEffect } from 'react';
import { 
  Tag, Plus, Edit, Trash2, CheckCircle2, 
  RefreshCw, Search, X, Calendar, Percent, IndianRupee, ToggleLeft, ToggleRight
} from 'lucide-react';
import { fetchAdminCoupons, saveAdminCoupon, deleteAdminCoupon, Coupon } from '@/lib/admin-api';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  // Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('10');
  const [minSpend, setMinSpend] = useState('299');
  const [maxDiscount, setMaxDiscount] = useState('100');
  const [usageLimit, setUsageLimit] = useState('100');
  const [expiresAt, setExpiresAt] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadCoupons = () => {
    setLoading(true);
    fetchAdminCoupons().then((res) => {
      setCoupons(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const openModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setCode(coupon.code);
      setDiscountType(coupon.discount_type);
      setDiscountValue(String(coupon.discount_value));
      setMinSpend(String(coupon.min_spend || 0));
      setMaxDiscount(String(coupon.max_discount || 0));
      setUsageLimit(String(coupon.usage_limit || 100));
      setExpiresAt(coupon.expires_at ? coupon.expires_at.slice(0, 10) : '');
      setIsActive(coupon.is_active === 1);
    } else {
      setEditingCoupon(null);
      setCode('');
      setDiscountType('percentage');
      setDiscountValue('15');
      setMinSpend('399');
      setMaxDiscount('150');
      setUsageLimit('200');
      setExpiresAt('');
      setIsActive(true);
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      code: code.trim().toUpperCase(),
      discount_type: discountType,
      discount_value: parseFloat(discountValue) || 0,
      min_spend: parseFloat(minSpend) || 0,
      max_discount: parseFloat(maxDiscount) || 0,
      usage_limit: parseInt(usageLimit) || 100,
      expires_at: expiresAt ? `${expiresAt} 23:59:59` : undefined,
      is_active: isActive ? 1 : 0,
    };

    await saveAdminCoupon(payload, editingCoupon?.id);
    setSaving(false);
    setModalOpen(false);
    setToastMessage(editingCoupon ? 'Coupon updated successfully' : 'Coupon created successfully');
    setTimeout(() => setToastMessage(''), 3000);
    loadCoupons();
  };

  const handleToggleActive = async (coupon: Coupon) => {
    const updatedStatus = coupon.is_active === 1 ? 0 : 1;
    await saveAdminCoupon({ ...coupon, is_active: updatedStatus }, coupon.id);
    loadCoupons();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      await deleteAdminCoupon(id);
      setToastMessage('Coupon deleted');
      setTimeout(() => setToastMessage(''), 3000);
      loadCoupons();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-400">
            Marketing & Promotions
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Coupon Codes & Discounts
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Configure percentage discounts, flat cart vouchers, minimum spends, and expiration dates
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-primary-500 shadow-lg shadow-primary-950/30 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="rounded-2xl bg-emerald-950/80 border border-emerald-500/30 p-3 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Coupons Table */}
      <div className="rounded-3xl border border-stone-800 bg-stone-950 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <h3 className="text-sm font-bold text-white">Active Promotional Codes</h3>
          <button
            onClick={loadCoupons}
            className="p-2 rounded-xl border border-stone-800 bg-stone-900 text-stone-400 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-primary-400' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <RefreshCw className="h-8 w-8 text-primary-400 animate-spin" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="py-12 text-center text-stone-500 text-xs">
            No coupon codes created yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 border-b border-stone-800">
                <tr>
                  <th className="pb-3">Promo Code</th>
                  <th className="pb-3">Discount Value</th>
                  <th className="pb-3">Min Order Spend</th>
                  <th className="pb-3">Usage Ratio</th>
                  <th className="pb-3">Expires On</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-900/50 transition-colors">
                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5 text-primary-400" />
                        <span className="font-mono font-black text-sm text-white tracking-wider">
                          {c.code}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 font-bold text-emerald-400">
                      {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `₹${c.discount_value} FLAT`}
                      {c.max_discount > 0 && <span className="text-[10px] text-stone-500 ml-1">(up to ₹{c.max_discount})</span>}
                    </td>

                    <td className="py-3.5 font-medium text-stone-300">
                      ₹{c.min_spend || 0}
                    </td>

                    <td className="py-3.5 text-stone-300">
                      <span className="font-bold text-white">{c.used_count || 0}</span> / {c.usage_limit} used
                    </td>

                    <td className="py-3.5 text-stone-400 text-[11px]">
                      {c.expires_at ? new Date(c.expires_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}
                    </td>

                    <td className="py-3.5">
                      <button
                        onClick={() => handleToggleActive(c)}
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase transition-colors ${
                          c.is_active === 1
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20'
                            : 'bg-stone-900 text-stone-500 border border-stone-800'
                        }`}
                      >
                        {c.is_active === 1 ? 'Active' : 'Disabled'}
                      </button>
                    </td>

                    <td className="py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openModal(c)}
                          className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-white"
                          title="Edit coupon"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
                          title="Delete coupon"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg rounded-3xl border border-stone-800 bg-stone-900 p-6 sm:p-8 shadow-2xl text-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <h3 className="text-lg font-black text-white">
                {editingCoupon ? 'Edit Promotional Coupon' : 'Create New Coupon'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-full p-2 text-stone-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 py-4 text-xs">
              <div>
                <label className="block font-bold text-stone-300 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. FESTIVE20, EBANZO100"
                  className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white font-mono font-bold uppercase tracking-wider"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-300 mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white font-semibold"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-300 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-300 mb-1">Min Order Spend (₹)</label>
                  <input
                    type="number"
                    value={minSpend}
                    onChange={(e) => setMinSpend(e.target.value)}
                    className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-300 mb-1">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    placeholder="0 = No limit"
                    className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-300 mb-1">Usage Limit (Total uses)</label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-300 mb-1">Expiration Date</label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-primary-500"
                  />
                  <span>Active & available for customer checkout</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl bg-stone-800 px-4 py-2 text-stone-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-primary-600 px-6 py-2 font-bold text-white hover:bg-primary-500 disabled:opacity-60 shadow-md"
                >
                  {saving ? 'Saving...' : 'Save Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
