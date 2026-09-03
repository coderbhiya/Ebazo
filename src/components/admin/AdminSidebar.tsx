'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, ShoppingBag, Package, MessageSquare, 
  ExternalLink, LogOut, Sparkles, Printer 
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('ebanzo_admin_token');
    localStorage.removeItem('ebanzo_admin_user');
    router.push('/admin/login');
  };

  const navLinks = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Print & Orders', href: '/admin/orders', icon: Printer },
    { name: 'Product Catalog', href: '/admin/products', icon: Package },
    { name: 'Customer Inquiries', href: '/admin/inquiries', icon: MessageSquare },
  ];

  return (
    <aside className="w-64 border-r border-stone-800 bg-stone-950 text-stone-300 flex flex-col justify-between p-4 flex-shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 px-3 py-4 mb-6 border-b border-stone-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-800 text-white shadow-md shadow-violet-600/30">
            <Sparkles className="h-4 w-4 text-amber-300" />
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-white block">EBANZO</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400">Admin Console</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                    : 'text-stone-400 hover:bg-stone-900 hover:text-stone-100'
                }`}
              >
                <link.icon className={`h-4 w-4 ${isActive ? 'text-amber-300' : 'text-stone-400'}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer: Live Store Link & Logout */}
      <div className="space-y-2 pt-4 border-t border-stone-800">
        <Link
          href="/"
          className="flex items-center justify-between rounded-xl bg-stone-900/80 px-3.5 py-2.5 text-xs font-medium text-stone-300 hover:bg-stone-800 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-violet-400" />
            <span>Open Customer Store</span>
          </span>
          <ExternalLink className="h-3 w-3 text-stone-500" />
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-950/40 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
