'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import { MessageCircle } from 'lucide-react';

export default function StorefrontShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <a
        href="https://wa.me/919876543210?text=Hello%20Ebanzo,%20I%20need%20help%20with%20my%20personalized%20photo%20order"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 left-6 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 hover:scale-110 hover:bg-emerald-400 transition-all"
        title="Chat with photo customization specialist"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
    </>
  );
}
