'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return <div className="min-h-screen bg-stone-950 text-stone-100">{children}</div>;
  }

  return (
    <div className="flex min-h-screen w-full bg-stone-900 text-stone-100">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-stone-900 p-6 sm:p-8">
        {children}
      </main>
    </div>
  );
}
