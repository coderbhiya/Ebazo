'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, ShoppingBag, Heart, Truck, Sparkles, X, 
  Menu, ChevronDown, ArrowRight, ShieldCheck, User, LogOut,
  Phone, MessageSquare, BookOpen, Layers, Gift, ChevronRight
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { fetchProducts, Product, Category, fetchCategories } from '@/lib/api';

export default function Navbar() {
  const router = useRouter();
  const { cart, wishlist, setIsCartOpen } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await fetchProducts({ search: searchQuery });
      setSearchResults(results.slice(0, 5));
      setIsSearching(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-white/95 backdrop-blur-md transition-all">
        {/* Top Announcement Bar */}
        <div className="bg-gradient-to-r from-primary-950 via-secondary-900 to-primary-900 px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-medium text-primary-100">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 truncate">
              <span className="flex h-1.5 w-1.5 rounded-full bg-primary-400 animate-pulse flex-shrink-0" />
              <span className="truncate">
                ✨ <strong>FREE Express Pan-India Delivery</strong> over ₹499 • Use code <strong>EBANZO10</strong>
              </span>
            </div>
            <div className="hidden items-center gap-6 sm:flex flex-shrink-0">
              <Link href="/track" className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Truck className="h-3.5 w-3.5 text-primary-300" />
                <span>Track Order</span>
              </Link>
              <span className="text-primary-400">•</span>
              <span className="flex items-center gap-1 text-primary-200">
                <ShieldCheck className="h-3.5 w-3.5 text-primary-300" />
                <span>99.8% Print Precision Guarantee</span>
              </span>
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4 px-3 py-2.5 sm:px-6 sm:py-3.5 lg:px-8">
          {/* Left: Mobile Sidebar Toggle & Brand Logo */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="rounded-xl p-2 text-stone-700 hover:bg-stone-100 active:bg-stone-200 lg:hidden flex-shrink-0 transition-colors"
              aria-label="Open Mobile Menu"
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            <Link href="/" className="group flex items-center py-0.5 min-w-0">
              <img 
                src="/logo.png" 
                alt="Ebanzo - Personalized Keepsakes" 
                className="h-7 sm:h-9 w-auto max-w-[115px] sm:max-w-[170px] object-contain transition-transform duration-200 group-hover:scale-105"
              />
            </Link>
          </div>

          {/* Center: Live Search Bar */}
          <div ref={searchRef} className="relative hidden max-w-md flex-1 md:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search personalized keychains, fridge magnets, acrylic stands..."
                className="w-full rounded-full border border-stone-200 bg-stone-50 py-2 pl-10 pr-4 text-xs sm:text-sm text-stone-900 placeholder-stone-400 transition-all focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Search Dropdown Results */}
            {isSearchOpen && searchQuery && (
              <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-2xl border border-stone-200 bg-white p-2 shadow-xl ring-1 ring-black/5 z-50">
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-stone-500">Searching products...</div>
                ) : searchResults.length > 0 ? (
                  <div className="divide-y divide-stone-100">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-primary-50/70 transition-colors"
                      >
                        <img
                          src={product.image_url && product.image_url.trim() ? product.image_url : '/frames/photostand/1_nos_a.png'}
                          alt={product.title}
                          className="h-12 w-12 rounded-lg object-cover border border-stone-200"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-stone-900 truncate">{product.title}</p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-primary-600">₹{product.price}</span>
                            <span className="text-stone-400 line-through">₹{product.original_price}</span>
                            <span className="text-secondary-600 font-medium">{product.category_name}</span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-stone-400" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-stone-500">
                    No products found for &quot;{searchQuery}&quot;
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action Icons: Track, Wishlist, Cart */}
          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
            <Link
              href="/track"
              className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors sm:flex"
            >
              <Truck className="h-4 w-4 text-primary-600" />
              <span>Track</span>
            </Link>

            <Link
              href="/shop"
              className="relative rounded-full p-2 sm:p-2.5 text-stone-700 hover:bg-stone-100 transition-colors"
              title="Wishlist"
            >
              <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
              {wishlist.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[9px] font-bold text-white shadow">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* User Account Icon */}
            <div ref={userMenuRef} className="relative">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1.5 rounded-full p-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
                    title="My Account"
                  >
                    <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-primary-600 text-white text-[11px] sm:text-xs font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline max-w-[80px] truncate">{user?.name?.split(' ')[0]}</span>
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-stone-200 bg-white py-2 shadow-xl z-50">
                      <div className="border-b border-stone-100 px-4 py-3">
                        <p className="text-sm font-semibold text-stone-900 truncate">{user?.name}</p>
                        <p className="text-xs text-stone-500 truncate">{user?.email}</p>
                      </div>
                      <Link href="/account" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                        <User className="h-4 w-4" /> My Account
                      </Link>
                      <Link href="/account/orders" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                        <ShoppingBag className="h-4 w-4" /> My Orders
                      </Link>
                      <Link href="/account/addresses" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                        <Truck className="h-4 w-4" /> Addresses
                      </Link>
                      <div className="border-t border-stone-100 mt-1 pt-1">
                        <button onClick={() => { logout(); setIsUserMenuOpen(false); }} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                          <LogOut className="h-4 w-4" /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link href="/auth" className="flex items-center gap-1 rounded-full p-2 sm:px-3 sm:py-2 text-xs sm:text-sm font-semibold text-stone-700 hover:bg-stone-100 transition-colors">
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Login</span>
                </Link>
              )}
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="group relative flex items-center gap-1.5 rounded-full bg-secondary-900 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-primary-600 transition-all hover:shadow-md"
              aria-label="Open Shopping Cart"
            >
              <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-300 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Bag</span>
              <span className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-white/20 text-[10px] sm:text-xs font-bold text-white">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {/* Desktop Category Bar */}
        <nav className="hidden border-t border-stone-100 bg-white px-4 py-2.5 lg:block">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-8 text-sm font-semibold text-stone-600">
            <Link href="/shop" className="hover:text-primary-600 transition-colors whitespace-nowrap">
              All Products
            </Link>
            <Link href="/shop?category=fridge-magnet" className="hover:text-primary-600 transition-colors whitespace-nowrap">
              Fridge Magnets
            </Link>
            <Link href="/shop?category=key-chains" className="hover:text-primary-600 transition-colors whitespace-nowrap">
              Keychains
            </Link>
            <Link href="/shop?category=car-hanging" className="hover:text-primary-600 transition-colors whitespace-nowrap">
              Car Hangings
            </Link>
            <Link href="/shop?category=car-stand" className="hover:text-primary-600 transition-colors whitespace-nowrap">
              Car Dashboard Stands
            </Link>
            <Link href="/shop?category=mini-gallary" className="hover:text-primary-600 transition-colors whitespace-nowrap">
              Mini Galleries
            </Link>
            <Link href="/shop?category=photostand" className="hover:text-primary-600 transition-colors whitespace-nowrap">
              Acrylic Photo Stands
            </Link>
            <Link href="/shop?category=wallet-card" className="hover:text-primary-600 transition-colors whitespace-nowrap">
              Wallet Cards
            </Link>
            <Link href="/blog" className="hover:text-primary-600 transition-colors whitespace-nowrap font-bold text-amber-700">
              Journal & Guides
            </Link>
            <Link href="/contact" className="hover:text-primary-600 transition-colors font-bold text-primary-600 whitespace-nowrap">
              Bulk Gifting
            </Link>
          </div>
        </nav>
      </header>

      {/* ========================================================= */}
      {/* MOBILE SLIDE-IN SIDEBAR DRAWER (LEFT-TO-RIGHT) */}
      {/* ========================================================= */}
      
      {/* 1. Backdrop Overlay */}
      <div 
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* 2. Slide-out Sidebar Panel */}
      <aside 
        className={`fixed top-0 left-0 bottom-0 z-50 w-[85%] max-w-[340px] bg-white text-stone-900 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-out lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header of Sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-stone-100 bg-stone-50/70">
          <Link href="/" onClick={closeMobileMenu} className="flex items-center">
            <img 
              src="/logo.png" 
              alt="Ebanzo" 
              className="h-7 w-auto object-contain"
            />
          </Link>
          
          <button 
            onClick={closeMobileMenu}
            className="rounded-full p-2 text-stone-500 hover:bg-stone-200 hover:text-stone-900 transition-colors"
            aria-label="Close Mobile Sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Profile Card inside Sidebar */}
        <div className="p-4 bg-gradient-to-r from-stone-900 to-secondary-950 text-white">
          {isAuthenticated ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm shadow">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="truncate">
                  <p className="font-bold text-sm leading-tight truncate">{user?.name}</p>
                  <p className="text-[11px] text-stone-400 truncate">{user?.email}</p>
                </div>
              </div>
              <Link
                href="/account"
                onClick={closeMobileMenu}
                className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-bold text-primary-200 hover:bg-white/20 transition-colors"
              >
                Account
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-stone-300">Welcome to Ebanzo</p>
                <p className="text-sm font-bold text-white">Create personalized gifts</p>
              </div>
              <Link
                href="/auth"
                onClick={closeMobileMenu}
                className="rounded-xl bg-primary-500 px-4 py-2 text-xs font-bold text-white hover:bg-primary-600 shadow-md transition-colors"
              >
                Sign In / Join
              </Link>
            </div>
          )}
        </div>

        {/* Scrollable Categories & Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Quick Search */}
          <div>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search photo gifts & keepsakes..."
                className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-9 pr-3 text-xs text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            </div>
          </div>

          {/* Main Navigation Links */}
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 px-3 block mb-1.5">
              Categories & Catalog
            </span>

            <Link
              href="/shop"
              onClick={closeMobileMenu}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 font-bold text-sm text-stone-800 hover:bg-primary-50 hover:text-primary-600 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Layers className="h-4 w-4 text-primary-600" />
                <span>All Collections</span>
              </div>
              <ChevronRight className="h-4 w-4 text-stone-400" />
            </Link>

            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                onClick={closeMobileMenu}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 font-semibold text-xs text-stone-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
              >
                <div className="flex items-center gap-3 truncate">
                  <span className="h-2 w-2 rounded-full bg-primary-400 flex-shrink-0" />
                  <span className="truncate">{cat.name}</span>
                </div>
                {cat.product_count !== undefined && cat.product_count > 0 && (
                  <span className="text-[10px] rounded-full bg-stone-100 px-2 py-0.5 text-stone-500 font-bold">
                    {cat.product_count}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Quick Services */}
          <div className="pt-2 border-t border-stone-100 space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 px-3 block mb-1.5">
              Quick Shortcuts
            </span>

            <Link
              href="/track"
              onClick={closeMobileMenu}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 font-semibold text-xs text-stone-700 hover:bg-stone-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Truck className="h-4 w-4 text-primary-600" />
                <span>Track Order Shipment</span>
              </div>
              <ChevronRight className="h-4 w-4 text-stone-400" />
            </Link>

            <Link
              href="/blog"
              onClick={closeMobileMenu}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 font-semibold text-xs text-stone-700 hover:bg-stone-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="h-4 w-4 text-amber-600" />
                <span>The Journal (Blog & Guides)</span>
              </div>
              <ChevronRight className="h-4 w-4 text-stone-400" />
            </Link>

            <Link
              href="/contact"
              onClick={closeMobileMenu}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 font-semibold text-xs text-stone-700 hover:bg-stone-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Gift className="h-4 w-4 text-rose-500" />
                <span>Bulk & Corporate Orders</span>
              </div>
              <ChevronRight className="h-4 w-4 text-stone-400" />
            </Link>
          </div>
        </div>

        {/* Bottom Sidebar Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50/70 space-y-3">
          <div className="flex items-center justify-between text-[11px] text-stone-500 font-semibold">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>99.8% UV Fidelity</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-primary-600" />
              <span>Free Delivery &gt;₹499</span>
            </div>
          </div>

          <a
            href="https://wa.me/919999988888"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>WhatsApp Support</span>
          </a>
        </div>
      </aside>
    </>
  );
}
