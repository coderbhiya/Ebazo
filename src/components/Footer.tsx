'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Category, fetchCategories, whatsappLink } from '@/lib/api';
import { useSiteSettings } from '@/lib/site-settings';
import { Sparkles, MessageCircle, Mail, Phone, MapPin, Send, Check } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  // Texts and links from Admin > Homepage; collections from Admin > Categories
  const site = useSiteSettings();
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-stone-950 text-stone-300 pt-12 sm:pt-16 pb-10 sm:pb-12 border-t border-stone-800">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 pb-10 sm:pb-12 border-b border-stone-800">
          
          {/* Col 1: Brand Info */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-4">
            <Link href="/" className="flex items-center py-1">
              <img 
                src="/logo.png" 
                alt="Ebanzo" 
                className="h-8 w-auto max-w-[150px] object-contain brightness-0 invert" 
              />
            </Link>
            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              {site.footer_about}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={whatsappLink(site.whatsapp_number, site.whatsapp_message)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors shadow-sm"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp Live Support</span>
              </a>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Collections</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              {categories
                .filter((cat) => !cat.parent_id && (cat.product_count ?? 1) > 0)
                .map((cat) => (
                  <li key={cat.id}>
                    <Link href={`/shop?category=${cat.slug}`} className="hover:text-primary-400 transition-colors">{cat.name}</Link>
                  </li>
                ))}
            </ul>
          </div>

          {/* Col 3: Customer Care & Policies */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Stories & Policies</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><Link href="/blog" className="hover:text-primary-400 transition-colors font-semibold text-primary-300">The Journal (Blog)</Link></li>
              <li><Link href="/about" className="hover:text-primary-400 transition-colors">About Ebanzo</Link></li>
              <li><Link href="/track" className="hover:text-primary-400 transition-colors">Track Order</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-primary-400 transition-colors">Shipping & Delivery</Link></li>
              <li><Link href="/refund-policy" className="hover:text-primary-400 transition-colors">Refund & Replacement</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-primary-400 transition-colors">Privacy & Photo Safety</Link></li>
              <li><Link href="/terms-and-conditions" className="hover:text-primary-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/faqs" className="hover:text-primary-400 transition-colors">Help & FAQs</Link></li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Get Special Offers</h4>
            <p className="text-xs text-stone-400">
              {site.newsletter_text}
            </p>

            <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 rounded-xl border border-stone-800 bg-stone-900 px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:border-primary-500 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-xl bg-primary-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-600 transition-colors flex items-center justify-center gap-1.5 flex-shrink-0"
              >
                <span>Join</span>
                <Send className="h-3 w-3" />
              </button>
            </form>

            {subscribed && (
              <p className="text-xs text-primary-300 font-medium flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> Welcome!{site.newsletter_coupon ? <> Use coupon <strong>{site.newsletter_coupon}</strong> on your order.</> : ' You are subscribed.'}
              </p>
            )}

            <div className="pt-2 text-[11px] text-stone-500">
              <span>{site.footer_dispatch_note}</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Payment icons */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 text-center sm:text-left">
          <p>© {new Date().getFullYear()} {site.copyright_text}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
            <span className="rounded bg-stone-900 border border-stone-800 px-2 py-1 text-[10px] text-stone-300 font-bold">UPI</span>
            <span className="rounded bg-stone-900 border border-stone-800 px-2 py-1 text-[10px] text-stone-300 font-bold">RuPay</span>
            <span className="rounded bg-stone-900 border border-stone-800 px-2 py-1 text-[10px] text-stone-300 font-bold">VISA</span>
            <span className="rounded bg-stone-900 border border-stone-800 px-2 py-1 text-[10px] text-stone-300 font-bold">Mastercard</span>
            <span className="rounded bg-stone-900 border border-stone-800 px-2 py-1 text-[10px] text-stone-300 font-bold">NetBanking</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
