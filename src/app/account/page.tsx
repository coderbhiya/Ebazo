'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { User, ShoppingBag, MapPin, Settings, LogOut, ChevronRight } from 'lucide-react';

const menuItems = [
  { href: '/account/orders', icon: ShoppingBag, label: 'My Orders', desc: 'Track and view your order history' },
  { href: '/account/addresses', icon: MapPin, label: 'Addresses', desc: 'Manage delivery addresses' },
  { href: '/account/profile', icon: Settings, label: 'Account Settings', desc: 'Update your profile & password' },
];

export default function AccountDashboard() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth?redirect=/account');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !user) {
    return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#7c3aed', fontSize: 15 }}>Loading...</span></div>;
  }

  const initial = user.name?.charAt(0).toUpperCase();

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 16px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', marginBottom: 28 }}>My Account</h1>

      {/* Profile Card */}
      <div style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', borderRadius: 16, padding: '28px 28px', marginBottom: 24, color: '#fff', display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, flexShrink: 0 }}>
          {initial}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{user.name}</p>
          <p style={{ fontSize: 14, opacity: 0.8, margin: '4px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
          {user.phone && <p style={{ fontSize: 13, opacity: 0.7, margin: '2px 0 0' }}>{user.phone}</p>}
        </div>
        <Link href="/account/profile" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}>
          Edit Profile
        </Link>
      </div>

      {/* Menu Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16, marginBottom: 24 }}>
        {menuItems.map(({ href, icon: Icon, label, desc }) => (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex', alignItems: 'center', gap: 16, background: '#fff',
              border: '1px solid #e5e7eb', borderRadius: 14, padding: '20px 20px',
              textDecoration: 'none', transition: 'box-shadow 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 20px rgba(124,58,237,0.12)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = '#7c3aed'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none'; (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e5e7eb'; }}
          >
            <div style={{ width: 44, height: 44, background: '#f5f3ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={20} color="#7c3aed" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>{label}</p>
              <p style={{ fontSize: 12, color: '#6b7280', margin: '3px 0 0' }}>{desc}</p>
            </div>
            <ChevronRight size={18} color="#9ca3af" />
          </Link>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={() => { logout(); router.push('/'); }}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', border: '1px solid #fecaca', borderRadius: 10, background: '#fff', color: '#dc2626', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
      >
        <LogOut size={16} /> Logout from account
      </button>
    </div>
  );
}
