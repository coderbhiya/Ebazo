'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, Search, Bell, ExternalLink, ShieldCheck, 
  Printer, AlertCircle, CheckCircle2, User, ChevronDown
} from 'lucide-react';
import { AdminStats, fetchAdminStats } from '@/lib/admin-api';

interface AdminHeaderProps {
  onToggleMobileMenu: () => void;
  stats?: AdminStats | null;
}

export default function AdminHeader({ onToggleMobileMenu, stats }: AdminHeaderProps) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<{ name: string; username: string; role: string } | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ebanzo_admin_user');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  // Format breadcrumb title
  const getBreadcrumb = () => {
    if (pathname === '/admin') return 'Dashboard Overview';
    if (pathname.startsWith('/admin/orders')) return 'Order Management';
    if (pathname.startsWith('/admin/production')) return 'Customization & Print Station';
    if (pathname.startsWith('/admin/products')) return 'Product Offerings';
    if (pathname.startsWith('/admin/inventory')) return 'Inventory & Stock Management';
    if (pathname.startsWith('/admin/customers')) return 'Customer Directory';
    if (pathname.startsWith('/admin/shipping')) return 'Shipping & Logistics';
    if (pathname.startsWith('/admin/payments')) return 'Payments & Revenue';
    if (pathname.startsWith('/admin/coupons')) return 'Coupons & Marketing';
    if (pathname.startsWith('/admin/reviews')) return 'Customer Reviews Moderation';
    if (pathname.startsWith('/admin/analytics')) return 'Performance Analytics';
    if (pathname.startsWith('/admin/settings')) return 'Studio Settings & Users';
    if (pathname.startsWith('/admin/inquiries')) return 'Customer Inquiries';
    return 'Console';
  };

  const notificationCount = (stats?.low_stock_count || 0) + (stats?.pending_orders || 0) + (stats?.unread_inquiries || 0);

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-stone-800/60 bg-[#0d0e12]/80 px-4 sm:px-6 backdrop-blur-xl">
      {/* Left: Mobile Hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="lg:hidden rounded-lg border border-stone-800/80 bg-stone-900/60 p-1.5 text-stone-400 hover:text-white"
          aria-label="Toggle menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-stone-400 hidden sm:inline">Admin</span>
          <span className="text-stone-600 text-xs hidden sm:inline">/</span>
          <h2 className="text-xs sm:text-sm font-semibold text-white truncate">
            {getBreadcrumb()}
          </h2>
        </div>
      </div>

      {/* Right: Quick actions, Live alerts & Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Quick Print Station Launcher */}
        <Link
          href="/admin/production"
          className="hidden sm:flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-xs font-medium text-amber-300 hover:bg-amber-500/20 transition-colors"
        >
          <Printer className="h-3 w-3" />
          <span>Queue ({stats?.pending_print || 0})</span>
        </Link>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg border border-stone-800/80 bg-stone-900/60 p-1.5 text-stone-400 hover:text-white transition-colors"
            title="Operational Alerts"
          >
            <Bell className="h-4 w-4" />
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary-500 text-[8px] font-bold text-white ring-2 ring-[#0d0e12]">
                {notificationCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-stone-800/80 bg-[#121318] p-3.5 shadow-2xl z-50 text-xs space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800/60">
                <span className="font-semibold text-white text-xs">Operational Alerts</span>
                <span className="text-[10px] text-stone-500">{notificationCount} issues</span>
              </div>

              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {stats?.pending_orders ? (
                  <Link
                    href="/admin/orders"
                    onClick={() => setShowNotifications(false)}
                    className="flex items-start gap-2.5 rounded-lg bg-stone-900/50 p-2 border border-stone-800/60 hover:border-primary-500/40 transition-colors"
                  >
                    <AlertCircle className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-white text-xs">{stats.pending_orders} Orders Processing</p>
                      <p className="text-[10px] text-stone-400">Review and move to laser/UV print queue</p>
                    </div>
                  </Link>
                ) : null}

                {stats?.low_stock_count ? (
                  <Link
                    href="/admin/inventory"
                    onClick={() => setShowNotifications(false)}
                    className="flex items-start gap-2.5 rounded-lg bg-stone-900/50 p-2 border border-stone-800/60 hover:border-rose-500/40 transition-colors"
                  >
                    <AlertCircle className="h-3.5 w-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-white text-xs">{stats.low_stock_count} Items in Low Stock</p>
                      <p className="text-[10px] text-stone-400">Restock acrylic/MDF blank materials</p>
                    </div>
                  </Link>
                ) : null}

                {stats?.unread_inquiries ? (
                  <Link
                    href="/admin/inquiries"
                    onClick={() => setShowNotifications(false)}
                    className="flex items-start gap-2.5 rounded-lg bg-stone-900/50 p-2 border border-stone-800/60 hover:border-primary-500/40 transition-colors"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-white text-xs">{stats.unread_inquiries} Customer Inquiries</p>
                      <p className="text-[10px] text-stone-400">Bulk corporate quote requests waiting</p>
                    </div>
                  </Link>
                ) : null}

                {notificationCount === 0 && (
                  <p className="py-3 text-center text-stone-500 text-xs">All operational stations are optimal ✨</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2 rounded-lg border border-stone-800/80 bg-stone-900/50 px-2.5 py-1">
          <div className="h-5 w-5 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center font-bold text-white text-[10px]">
            {currentUser?.name ? currentUser.name[0] : 'A'}
          </div>
          <div className="hidden sm:block text-left">
            <span className="font-medium text-white text-xs block leading-none">
              {currentUser?.name || 'Admin'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
