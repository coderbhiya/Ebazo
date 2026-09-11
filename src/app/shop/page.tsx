'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Filter, Sparkles, SlidersHorizontal, ArrowUpDown, 
  Search, Check, RefreshCw 
} from 'lucide-react';
import { fetchCategories, fetchProducts, Product, Category } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    fetchProducts({
      category: selectedCategory || undefined,
      search: searchQuery || undefined,
    }).then((res) => {
      let list = [...res];
      if (sortBy === 'price-low') {
        list.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price-high') {
        list.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'rating') {
        list.sort((a, b) => b.rating - a.rating);
      }
      setProducts(list);
      setLoading(false);
    });
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-stone-50/50 py-6 sm:py-14">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        
        {/* Top Header */}
        <div className="mb-6 sm:mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
            Artisanal Keepsakes
          </span>
          <h1 className="mt-1 text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900">
            {selectedCategory
              ? categories.find((c) => c.slug === selectedCategory)?.name || 'Custom Gifts'
              : 'All Personalized Products'}
          </h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-stone-600 max-w-xl">
            Choose your preferred shape and size, upload your favorite picture, and experience true laser-crafted photo gifts.
          </p>
        </div>

        {/* Filter & Sort Bar */}
        <div className="mb-6 sm:mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-y border-stone-200 py-3 sm:py-4 bg-white/60 backdrop-blur-sm px-3 sm:px-4 rounded-2xl">
          {/* Search filter */}
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by keyword..."
              className="w-full rounded-full border border-stone-200 bg-stone-50 py-2 pl-9 pr-4 text-xs text-stone-900 focus:border-primary-600 focus:bg-white focus:outline-none"
            />
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center justify-between sm:justify-end gap-3">
            <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span>Sort:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-1 focus:ring-primary-600"
            >
              <option value="featured">Featured First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Customer Rated</option>
            </select>
          </div>
        </div>

        {/* Mobile Category Horizontal Pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 lg:hidden no-scrollbar">
          <button
            onClick={() => setSelectedCategory('')}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
              !selectedCategory
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
          >
            All ({categories.reduce((acc, c) => acc + (c.product_count || 0), 0)})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              {cat.name} ({cat.product_count || 0})
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left Sidebar: Category Filters (Desktop) */}
          <aside className="hidden lg:block lg:col-span-3 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <span className="text-xs font-extrabold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-primary-600" /> Categories
              </span>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory('')}
                  className="text-[11px] font-bold text-primary-600 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex flex-col space-y-1 text-xs">
              <button
                onClick={() => setSelectedCategory('')}
                className={`flex items-center justify-between rounded-xl px-3 py-2 font-semibold transition-colors ${
                  !selectedCategory
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <span>All Products</span>
                <span>{categories.reduce((acc, c) => acc + (c.product_count || 0), 0)}</span>
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 font-semibold transition-colors text-left ${
                    selectedCategory === cat.slug
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] opacity-75">{cat.product_count || 0}</span>
                </button>
              ))}
            </div>

            {/* Quality badge card in sidebar */}
            <div className="pt-4 border-t border-stone-100">
              <div className="rounded-2xl bg-gradient-to-br from-primary-50 to-secondary-50 p-4 border border-primary-100 text-center">
                <Sparkles className="h-6 w-6 text-primary-600 mx-auto mb-1.5" />
                <h4 className="text-xs font-bold text-stone-900">Custom Shapes & Cuts</h4>
                <p className="mt-1 text-[10px] text-stone-500">
                  Every product is customized with Japanese UV ink and laser contouring.
                </p>
              </div>
            </div>
          </aside>

          {/* Right Product Grid */}
          <main className="lg:col-span-9">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <RefreshCw className="h-8 w-8 text-primary-600 animate-spin mb-3" />
                <p className="text-xs font-semibold text-stone-500">Loading personalized items...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-12 text-center">
                <h3 className="text-base font-bold text-stone-900">No products found</h3>
                <p className="mt-1 text-xs text-stone-500">
                  Try clearing your search query or selecting a different category.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setSearchQuery('');
                  }}
                  className="mt-4 rounded-full bg-primary-500 px-5 py-2 text-xs font-bold text-white hover:bg-primary-600"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>

      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-stone-500">Loading catalog...</div>}>
      <ShopContent />
    </Suspense>
  );
}
