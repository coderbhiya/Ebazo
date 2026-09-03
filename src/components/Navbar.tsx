'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, ShoppingBag, Heart, Truck, Sparkles, X, 
  Menu, ChevronDown, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { fetchProducts, Product, Category, fetchCategories } from '@/lib/api';

export default function Navbar() {
  const router = useRouter();
  const { cart, wishlist, setIsCartOpen } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
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

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-white/95 backdrop-blur-md transition-all">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-primary-950 via-secondary-900 to-primary-900 px-4 py-2 text-xs font-medium text-primary-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-1.5 w-1.5 rounded-full bg-primary-400 animate-pulse" />
            <span>✨ <strong>FREE Express Pan-India Delivery</strong> on orders over ₹499 • Use code <strong>EBANZO10</strong></span>
          </div>
          <div className="hidden items-center gap-6 sm:flex">
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
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Left: Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-lg p-2 text-stone-700 hover:bg-stone-100 lg:hidden"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <Link href="/" className="group flex items-center py-1">
            <img 
              src="/logo.png" 
              alt="Ebanzo - Personalized Keepsakes" 
              className="h-8 sm:h-9 w-auto max-w-[150px] sm:max-w-[170px] object-contain transition-transform duration-200 group-hover:scale-105"
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
              className="w-full rounded-full border border-stone-200 bg-stone-50 py-2.5 pl-11 pr-4 text-sm text-stone-900 placeholder-stone-400 transition-all focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
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
                        src={product.image_url}
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
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/track"
            className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors sm:flex"
          >
            <Truck className="h-4 w-4 text-primary-600" />
            <span>Track</span>
          </Link>

          <Link
            href="/shop"
            className="relative rounded-full p-2.5 text-stone-700 hover:bg-stone-100 transition-colors"
            title="Wishlist"
          >
            <Heart className="h-5 w-5" />
            {wishlist.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white shadow">
                {wishlist.length}
              </span>
            )}
          </Link>

          <button
            onClick={() => setIsCartOpen(true)}
            className="group relative flex items-center gap-2 rounded-full bg-secondary-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-600 transition-all hover:shadow-md"
            aria-label="Open Shopping Cart"
          >
            <ShoppingBag className="h-4 w-4 text-primary-300 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Bag</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      {/* Desktop Category Bar */}
      <nav className="hidden border-t border-stone-100 bg-stone-50/50 px-4 py-2 lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-8 text-xs font-medium text-stone-600">
          <Link href="/shop" className="hover:text-primary-600 transition-colors">
            All Products
          </Link>
          <Link href="/shop?category=fridge-magnet" className="hover:text-primary-600 transition-colors">
            Fridge Magnets
          </Link>
          <Link href="/shop?category=key-chains" className="hover:text-primary-600 transition-colors">
            Keychains
          </Link>
          <Link href="/shop?category=car-hanging" className="hover:text-primary-600 transition-colors">
            Car Hangings
          </Link>
          <Link href="/shop?category=car-stand" className="hover:text-primary-600 transition-colors">
            Car Dashboard Stands
          </Link>
          <Link href="/shop?category=mini-gallary" className="hover:text-primary-600 transition-colors">
            Mini Galleries
          </Link>
          <Link href="/shop?category=photostand" className="hover:text-primary-600 transition-colors">
            Acrylic Photo Stands
          </Link>
          <Link href="/shop?category=wallet-card" className="hover:text-primary-600 transition-colors">
            Wallet Cards
          </Link>
          <Link href="/contact" className="hover:text-primary-600 transition-colors font-semibold text-primary-600">
            Bulk / Corporate Gifting
          </Link>
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="border-t border-stone-200 bg-white p-4 shadow-xl lg:hidden">
          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Ebanzo gifts..."
              className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-sm"
            />
          </div>
          <div className="flex flex-col gap-2 text-sm font-medium text-stone-800">
            <Link 
              href="/shop" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 hover:bg-stone-50"
            >
              All Collections
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-primary-50 text-stone-700 hover:text-primary-600"
              >
                <span>{cat.name}</span>
                <span className="text-xs text-stone-400">{cat.product_count || 0} items</span>
              </Link>
            ))}
            <div className="my-2 border-t border-stone-100" />
            <Link
              href="/track"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-primary-600 font-semibold"
            >
              <Truck className="h-4 w-4" />
              <span>Track Your Order</span>
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-stone-600 hover:text-stone-900"
            >
              Support & Bulk Orders
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
