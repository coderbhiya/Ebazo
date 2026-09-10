'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { userAddresses, userSaveAddress, UserAddress } from '@/lib/api';
import { ChevronLeft, MapPin, Plus, Home, Building, Check } from 'lucide-react';

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh','Puducherry'];

const EMPTY_FORM: Partial<UserAddress> = { type: 'shipping', first_name: '', last_name: '', address_line_1: '', address_line_2: '', city: '', state: '', pincode: '', phone: '', is_default: 0 };

export default function AddressesPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<UserAddress>>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/auth?redirect=/account/addresses');
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) userAddresses().then(d => { setAddresses(d); setLoading(false); });
  }, [isAuthenticated]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await userSaveAddress(form);
    if (res.status === 'success') {
      setSuccessMsg('Address saved!');
      setShowForm(false);
      setForm(EMPTY_FORM);
      const updated = await userAddresses();
      setAddresses(updated);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
    setSaving(false);
  };

  const inp = (label: string, key: keyof UserAddress, type = 'text', required = false) => (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>{label}{required && ' *'}</label>
      <input
        type={type}
        required={required}
        value={(form[key] as string) || ''}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none' }}
        onFocus={e => e.target.style.borderColor = '#7c3aed'}
        onBlur={e => e.target.style.borderColor = '#d1d5db'}
      />
    </div>
  );

  if (isLoading || loading) return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#7c3aed' }}>Loading...</span></div>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/account" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#7c3aed', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            <ChevronLeft size={16} /> Back
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0 }}>My Addresses</h1>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setForm(EMPTY_FORM); }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
        >
          <Plus size={16} /> Add New Address
        </button>
      </div>

      {successMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#d1fae5', border: '1px solid #6ee7b7', color: '#065f46', padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontSize: 14 }}>
          <Check size={16} /> {successMsg}
        </div>
      )}

      {/* Add Address Form */}
      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '24px 28px', marginBottom: 24 }}>
          <p style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 20 }}>New Address</p>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              {inp('First Name', 'first_name', 'text', true)}
              {inp('Last Name', 'last_name')}
            </div>
            {inp('Address Line 1', 'address_line_1', 'text', true)}
            <div style={{ margin: '14px 0' }}>
              {inp('Address Line 2 (Apartment, area...)', 'address_line_2')}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
              {inp('City', 'city', 'text', true)}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>State *</label>
                <select
                  required
                  value={form.state || ''}
                  onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
                >
                  <option value="">Select state</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {inp('Pincode', 'pincode', 'text', true)}
            </div>
            {inp('Phone Number', 'phone', 'tel')}
            <div style={{ marginTop: 14 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: '#374151' }}>
                <input type="checkbox" checked={form.is_default === 1} onChange={e => setForm(p => ({ ...p, is_default: e.target.checked ? 1 : 0 }))} style={{ accentColor: '#7c3aed' }} />
                Set as default address
              </label>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button type="submit" disabled={saving} style={{ padding: '10px 24px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? 'Saving...' : 'Save Address'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 24px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address Cards */}
      {addresses.length === 0 && !showForm ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f9fafb', borderRadius: 16 }}>
          <MapPin size={48} color="#d1d5db" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: 18, fontWeight: 700, color: '#374151' }}>No addresses saved</p>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Add a delivery address for faster checkout.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
          {addresses.map(addr => (
            <div key={addr.id} style={{ background: '#fff', border: `1px solid ${addr.is_default ? '#7c3aed' : '#e5e7eb'}`, borderRadius: 14, padding: '20px 22px', position: 'relative' }}>
              {addr.is_default === 1 && (
                <span style={{ position: 'absolute', top: 12, right: 12, background: '#f5f3ff', color: '#7c3aed', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>
                  Default
                </span>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, background: '#f5f3ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Home size={18} color="#7c3aed" />
                </div>
                <p style={{ fontWeight: 700, fontSize: 14, color: '#111827', margin: 0 }}>{addr.first_name} {addr.last_name}</p>
              </div>
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
                {addr.address_line_1}{addr.address_line_2 ? `, ${addr.address_line_2}` : ''}<br />
                {addr.city}, {addr.state} — {addr.pincode}
              </p>
              {addr.phone && <p style={{ fontSize: 13, color: '#6b7280', margin: '6px 0 0' }}>📞 {addr.phone}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
