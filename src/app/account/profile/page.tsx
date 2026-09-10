'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { userUpdateProfile } from '@/lib/api';
import { ChevronLeft, Check, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', phone: '', current_password: '', new_password: '', confirm_password: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/auth?redirect=/account/profile');
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) setForm(p => ({ ...p, name: user.name || '', phone: user.phone || '' }));
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.new_password && form.new_password !== form.confirm_password) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setSaving(true);
    setMessage(null);
    const payload: Parameters<typeof userUpdateProfile>[0] = { name: form.name, phone: form.phone };
    if (form.new_password) {
      payload.current_password = form.current_password;
      payload.new_password = form.new_password;
    }
    const res = await userUpdateProfile(payload);
    if (res.status === 'success') {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setForm(p => ({ ...p, current_password: '', new_password: '', confirm_password: '' }));
      refreshUser();
    } else {
      setMessage({ type: 'error', text: res.message || 'Failed to update profile.' });
    }
    setSaving(false);
  };

  const inpStyle = { width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' as const, outline: 'none' };

  if (isLoading || !user) return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#7c3aed' }}>Loading...</span></div>;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <Link href="/account" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#7c3aed', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
          <ChevronLeft size={16} /> Back
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0 }}>Account Settings</h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Personal Info */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '24px 28px', marginBottom: 20 }}>
          <p style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 20 }}>Personal Information</p>

          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#fff' }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontWeight: 700, color: '#111827', margin: 0 }}>{user.name}</p>
              <p style={{ color: '#6b7280', fontSize: 13, margin: '2px 0 0' }}>{user.email}</p>
              <p style={{ color: '#9ca3af', fontSize: 12, margin: '2px 0 0' }}>Member since {new Date().getFullYear()}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Full Name *</label>
              <input style={inpStyle} type="text" value={form.name} required onChange={e => setForm(p => ({ ...p, name: e.target.value }))} onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Phone</label>
              <input style={inpStyle} type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Email Address</label>
            <input style={{ ...inpStyle, background: '#f9fafb', color: '#6b7280' }} type="email" value={user.email} disabled />
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Email address cannot be changed.</p>
          </div>
        </div>

        {/* Change Password */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '24px 28px', marginBottom: 20 }}>
          <p style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 6 }}>Change Password</p>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>Leave blank if you don't want to change your password.</p>
          {[
            ['Current Password', 'current_password'],
            ['New Password', 'new_password'],
            ['Confirm New Password', 'confirm_password'],
          ].map(([label, key]) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>{label}</label>
              <input
                style={inpStyle}
                type="password"
                value={form[key as keyof typeof form]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                placeholder="••••••"
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
          ))}
        </div>

        {message && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontSize: 14, background: message.type === 'success' ? '#d1fae5' : '#fee2e2', color: message.type === 'success' ? '#065f46' : '#991b1b', border: `1px solid ${message.type === 'success' ? '#6ee7b7' : '#fecaca'}` }}>
            {message.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          style={{ padding: '12px 28px', background: saving ? '#a78bfa' : '#7c3aed', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer' }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
