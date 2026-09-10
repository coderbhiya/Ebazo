'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, ShoppingBag, Package, MessageSquare, 
  ExternalLink, LogOut, Printer, Scissors, Truck, 
  CreditCard, Tag, Star, BarChart3, Users, Settings,
  AlertTriangle, X, ShieldCheck, Layers, FileText, BookOpen
} from 'lucide-react';

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  badgeCounts?: {
    pending_orders?: number;
    pending_print?: number;
    low_stock?: number;
    unread_inquiries?: number;
  };
}

export default function AdminSidebar({
  mobileOpen = false,
  onCloseMobile,
  badgeCounts = {}
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('ebanzo_admin_token');
    localStorage.removeItem('ebanzo_admin_user');
    router.push('/admin/login');
  };

  const navGroups: {
    title: string;
    items: {
      name: string;
      href: string;
      icon: any;
      badge?: string;
      badgeColor?: string;
    }[];
  }[] = [
    {
      title: 'CORE',
      items: [
        { name: 'Dashboard Overview', href: '/admin', icon: LayoutDashboard },
      ]
    },
    {
      title: 'SALES & FULFILLMENT',
      items: [
        { 
          name: 'Orders & Manifests', 
          href: '/admin/orders', 
          icon: ShoppingBag, 
          badge: badgeCounts.pending_orders ? String(badgeCounts.pending_orders) : undefined 
        },
        { name: 'Shipping & Couriers', href: '/admin/shipping', icon: Truck },
        { name: 'Payments & Revenue', href: '/admin/payments', icon: CreditCard },
      ]
    },
    {
      title: 'CATALOG & INVENTORY',
      items: [
        { name: 'Product Offerings', href: '/admin/products', icon: Package },
        { name: 'Product Categories', href: '/admin/categories', icon: Layers },
        { 
          name: 'Inventory & Stock Levels', 
          href: '/admin/inventory', 
          icon: Scissors,
          badge: badgeCounts.low_stock ? `${badgeCounts.low_stock} Low` : undefined,
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
        },
      ]
    },
    {
      title: 'CUSTOMERS & CRM',
      items: [
        { name: 'Customer Directory', href: '/admin/customers', icon: Users },
        { 
          name: 'Customer Inquiries', 
          href: '/admin/inquiries', 
          icon: MessageSquare,
          badge: badgeCounts.unread_inquiries ? String(badgeCounts.unread_inquiries) : undefined
        },
        { name: 'Customer Reviews', href: '/admin/reviews', icon: Star },
      ]
    },
    {
      title: 'MARKETING & CMS',
      items: [
        { name: 'Blog & Articles', href: '/admin/blogs', icon: BookOpen },
        { name: 'Pages & Policy CMS', href: '/admin/pages', icon: FileText },
        { name: 'Coupons & Discounts', href: '/admin/coupons', icon: Tag },
        { name: 'Sales Analytics & Reports', href: '/admin/analytics', icon: BarChart3 },
      ]
    },
    {
      title: 'STUDIO CONFIG',
      items: [
        { name: 'Users, Roles & Settings', href: '/admin/settings', icon: Settings },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside 
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 border-r border-stone-800/60 bg-[#0d0e12]/95 backdrop-blur-xl text-stone-300 flex flex-col justify-between flex-shrink-0 transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Brand Header */}
        <div className="h-14 px-4 border-b border-stone-800/60 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5 group" onClick={onCloseMobile}>
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center font-bold text-white text-xs shadow-sm shadow-primary-950/50">
              EB
            </div>
            <div>
              <span className="font-bold text-xs text-white tracking-wide block leading-none">EBANZO</span>
              <span className="text-[9px] font-medium text-stone-500 uppercase tracking-wider block mt-0.5">Admin Studio</span>
            </div>
          </Link>

          {/* Close Mobile Button */}
          <button 
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800/50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-3.5 space-y-4 scrollbar-thin scrollbar-thumb-stone-800/50">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-0.5">
              <span className="px-2.5 text-[10px] font-semibold tracking-wider text-stone-500 uppercase">
                {group.title}
              </span>
              <div className="space-y-0.5 pt-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={`group relative flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-primary-500/10 text-primary-300 font-semibold border border-primary-500/20'
                          : 'text-stone-400 hover:bg-stone-800/40 hover:text-stone-200 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <item.icon className={`h-4 w-4 flex-shrink-0 transition-colors ${isActive ? 'text-primary-400' : 'text-stone-400 group-hover:text-stone-300'}`} />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className={`rounded-full px-1.5 py-0.2 text-[9px] font-semibold leading-tight ${
                          item.badgeColor || (isActive ? 'bg-primary-500/20 text-primary-200 border border-primary-500/30' : 'bg-stone-800 text-stone-300 border border-stone-700/50')
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer: Live Store & Sign Out */}
        <div className="p-3 border-t border-stone-800/60 space-y-1 bg-[#0d0e12]">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between rounded-lg bg-stone-900/50 border border-stone-800/50 px-2.5 py-1.5 text-xs font-medium text-stone-300 hover:bg-stone-800/50 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="h-3.5 w-3.5 text-primary-400" />
              <span>Customer Store</span>
            </span>
            <ExternalLink className="h-3 w-3 text-stone-500" />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
          >
            <span className="flex items-center gap-2">
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </span>
            <span className="text-[10px] text-stone-600 font-mono">v1.2</span>
          </button>
        </div>
      </aside>
    </>
  );
}
