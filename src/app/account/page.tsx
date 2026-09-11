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
    <div className="max-w-4xl mx-auto py-6 sm:py-10 px-3 sm:px-6">
      <h1 className="text-2xl sm:text-3xl font-black text-stone-900 mb-6">My Account</h1>

      {/* Profile Card */}
      <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-primary-900 via-secondary-900 to-primary-950 p-4 sm:p-7 mb-6 text-white flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 text-center sm:text-left shadow-lg">
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-black flex-shrink-0">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-lg sm:text-xl font-bold">{user.name}</p>
            <p className="text-xs sm:text-sm text-stone-300 truncate">{user.email}</p>
            {user.phone && <p className="text-xs text-stone-400">{user.phone}</p>}
          </div>
        </div>
        <Link 
          href="/account/profile" 
          className="rounded-xl bg-white/15 border border-white/30 text-white px-4 py-2 text-xs font-bold hover:bg-white/25 transition-colors flex-shrink-0"
        >
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
