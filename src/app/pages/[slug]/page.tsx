'use client';


import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  FileText, ShieldCheck, ChevronRight, MessageCircle, 
  ArrowLeft, Sparkles, Clock, Globe, HelpCircle, Phone, Mail,
  ShoppingBag, CheckCircle2
} from 'lucide-react';
import { fetchPageBySlug, fetchPages, CMSPage } from '@/lib/api';

export default function DynamicCMSPage() {
  const params = useParams();
  const slug = (params?.slug as string) || '';
  
  const [page, setPage] = useState<CMSPage | null>(null);
  const [allPages, setAllPages] = useState<CMSPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);

    Promise.all([
      fetchPageBySlug(slug),
      fetchPages()
    ]).then(([pageData, allPagesData]) => {
      if (pageData) {
        setPage(pageData);
      } else {
        setNotFound(true);
      }
      setAllPages(allPagesData);
      setLoading(false);
    }).catch(() => {
      setNotFound(true);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-stone-50/60 py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent mb-4" />
        <p className="text-xs font-semibold text-stone-500">Loading page content...</p>
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center bg-stone-50/60 px-4 py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-200 text-stone-500 mb-4">
          <FileText className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-black text-stone-900">Page Not Found</h1>
        <p className="mt-2 text-xs text-stone-600 max-w-sm">
          The requested page <span className="font-mono text-primary-600 font-bold">/{slug}</span> could not be found or has been unpublished by the administrator.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <Link
            href="/"
            className="rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-stone-800 transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/shop"
            className="rounded-xl bg-primary-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-500 transition-colors"
          >
            Explore Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/70 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Bar */}
        <nav className="flex items-center gap-2 text-xs text-stone-500 mb-6">
          <Link href="/" className="hover:text-stone-900 transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
          <Link href="/pages/about-us" className="hover:text-stone-900 transition-colors">Pages</Link>
          <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
          <span className="font-bold text-stone-900 truncate max-w-xs">{page.title}</span>
        </nav>

        {/* Hero Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-950 via-[#15161c] to-stone-900 p-8 sm:p-12 text-white shadow-xl mb-10 border border-stone-800">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-primary-600/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-3 py-1 text-xs font-bold text-primary-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ebanzo Official Information</span>
            </div>
            
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              {page.title}
            </h1>

            {page.subtitle && (
              <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-medium">
                {page.subtitle}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 pt-2 text-[11px] text-stone-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-primary-400" />
                <span>Verified Studio Policy</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-stone-400" />
                <span>Updated: {new Date(page.updated_at || page.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Article Body */}
          <main className="lg:col-span-8 rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-10 shadow-sm">
            <article 
              className="prose prose-stone prose-sm sm:prose-base max-w-none text-stone-800 leading-relaxed 
                prose-headings:font-black prose-headings:text-stone-900 
                prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-3 prose-h2:border-b prose-h2:border-stone-100 prose-h2:pb-2
                prose-h3:text-base sm:prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2 text-stone-900
                prose-p:text-xs sm:prose-p:text-sm prose-p:leading-relaxed prose-p:text-stone-600
                prose-ul:text-xs sm:prose-ul:text-sm prose-ul:text-stone-600 prose-ul:space-y-1.5
                prose-strong:text-stone-900 prose-strong:font-bold
                prose-a:text-primary-600 prose-a:font-semibold hover:prose-a:text-primary-700 hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />

            {/* Bottom Guarantee Banner */}
            <div className="mt-12 rounded-2xl bg-stone-50 border border-stone-200 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700 font-bold">
                  EB
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Crafted by Ebanzo Precision Artisans</h4>
                  <p className="text-[11px] text-stone-500">100% Satisfaction Guarantee on all personalized keepsakes.</p>
                </div>
              </div>
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2 text-xs font-bold text-white hover:bg-primary-500 transition-colors shadow-sm"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>Shop Best Sellers</span>
              </Link>
            </div>
          </main>

          {/* Right Sidebar: Policy Directory & Support Card */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Other Pages Directory */}
            <div className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary-600" />
                <span>Information & Policies</span>
              </h3>

              <div className="space-y-1">
                {allPages.map((p) => {
                  const isActive = p.slug === slug;
                  return (
                    <Link
                      key={p.id}
                      href={`/pages/${p.slug}`}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-primary-50 text-primary-700 font-bold border border-primary-200/60'
                          : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                      }`}
                    >
                      <span className="truncate">{p.title}</span>
                      <ChevronRight className={`h-3.5 w-3.5 ${isActive ? 'text-primary-600' : 'text-stone-400'}`} />
                    </Link>
                  );
                })}

                <Link
                  href="/contact"
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors"
                >
                  <span>Contact & Studio Support</span>
                  <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
                </Link>
              </div>
            </div>

            {/* Direct WhatsApp Support Card */}
            <div className="rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-950 p-6 text-white shadow-md border border-emerald-800/60 space-y-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <MessageCircle className="h-5 w-5" />
              </div>

              <div>
                <h4 className="font-bold text-sm text-white">Have Questions About This Policy?</h4>
                <p className="text-xs text-emerald-200/80 mt-1 leading-relaxed">
                  Our customer care team is available on WhatsApp Mon–Sat (9:30 AM to 8:00 PM IST) to assist you with order status, photos, or returns.
                </p>
              </div>

              <a
                href="https://wa.me/919999988888?text=Hi%20Ebanzo%20Team,%20I%20have%20a%20question%20regarding%20store%20policies."
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors shadow-sm"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

          </aside>

        </div>
      </div>
    </div>
  );
}