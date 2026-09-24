'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { fetchAdminStats, AdminStats } from '@/lib/admin-api';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Auth route check
    if (!isLoginPage) {
      const token = localStorage.getItem('ebanzo_admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }
      setAuthChecked(true);

      // Fetch operational metrics for badges
      fetchAdminStats().then((data) => {
        if (data) setStats(data);
      });
    } else {
      setAuthChecked(true);
    }
  }, [pathname, isLoginPage, router]);

  if (isLoginPage) {
    return <div className="min-h-screen bg-stone-950 text-stone-100">{children}</div>;
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-400 text-xs">
        <div className="h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mr-2" />
        <span>Verifying admin session...</span>
      </div>
    );
  }

  const badgeCounts = {
    pending_orders: stats?.pending_orders,
    pending_print: stats?.pending_print,
    low_stock: stats?.low_stock_count,
    unread_inquiries: stats?.unread_inquiries,
  };

  return (
    // App shell: the layout is exactly one viewport tall and never grows, so the sidebar and
    // header stay fixed and only <main> scrolls. (With min-h-screen the whole document grew
    // with long pages and the browser window scrolled instead.)
    <div className="flex h-dvh w-full overflow-hidden bg-[#0c0d0e] text-stone-100 font-sans antialiased selection:bg-primary-600 selection:text-white">
      {/* Sidebar */}
      <AdminSidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        badgeCounts={badgeCounts}
      />

      {/* Main Content Area with Header */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <AdminHeader
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          stats={stats}
        />
        {/* Scroll container spans the full width so the scrollbar sits at the window edge;
            the inner wrapper keeps the content width capped and centered. */}
        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <div className="p-4 sm:p-6 lg:p-7 max-w-[1536px] w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
