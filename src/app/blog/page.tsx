'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, Sparkles, Search, ChevronRight, Clock, 
  Eye, Tag, ArrowRight, Star, Filter, MessageCircle, 
  Gift, ShieldCheck, Heart 
} from 'lucide-react';
import { fetchBlogPosts, fetchBlogCategories, BlogPost } from '@/lib/api';

export default function BlogHubPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<{ category: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchBlogPosts({ category: selectedCategory, search: searchQuery }),
      fetchBlogCategories()
    ]).then(([posts, cats]) => {
      setBlogs(posts);
      setCategories(cats);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [selectedCategory, searchQuery]);

  // Separate featured article
  const featuredBlog = blogs.find(b => b.is_featured === 1) || blogs[0];
  const gridBlogs = featuredBlog ? blogs.filter(b => b.id !== featuredBlog.id) : blogs;

  return (
    <div className="min-h-screen bg-stone-50/70 py-10 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-stone-500 mb-6">
          <Link href="/" className="hover:text-stone-900 transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
          <span className="font-bold text-stone-900">The Ebanzo Journal</span>
        </nav>

        {/* Hero Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-950 via-[#15161c] to-stone-900 p-8 sm:p-14 text-white shadow-xl mb-12 border border-stone-800">
          <div className="absolute -right-10 -top-10 h-80 w-80 rounded-full bg-primary-600/15 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-3.5 py-1 text-xs font-bold text-primary-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Gifting Inspiration & Precision Artistry</span>
            </div>
            
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              The Ebanzo Journal
            </h1>

            <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-2xl font-normal pt-1">
              Explore bespoke gifting guides, acrylic care tutorials, and inspiration on turning your everyday photographs into eternal diamond-polished keepsakes.
            </p>
          </div>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              All Stories ({categories.reduce((acc, c) => acc + c.count, 0)})
            </button>

            {categories.map((cat) => (
              <button
                key={cat.category}
                type="button"
                onClick={() => setSelectedCategory(cat.category)}
                className={`rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.category
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                {cat.category} ({cat.count})
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides & articles..."
              className="w-full rounded-full border border-stone-200 bg-white pl-10 pr-4 py-2 text-xs text-stone-900 placeholder-stone-400 focus:border-primary-500 focus:outline-none shadow-sm"
            />
          </div>
        </div>

        {/* ======================================================== */}
        {/* FEATURED STORY SPOTLIGHT (If no search query active) */}
        {/* ======================================================== */}
        {!searchQuery && selectedCategory === 'all' && featuredBlog && !loading && (
          <div className="mb-14">
            <div className="rounded-3xl border border-stone-200/90 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow grid grid-cols-1 lg:grid-cols-12 group">
              
              {/* Cover Image */}
              <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto overflow-hidden bg-stone-100">
                <img
                  src={featuredBlog.featured_image}
                  alt={featuredBlog.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-600/90 backdrop-blur-md px-3 py-1 text-xs font-black text-white shadow-sm">
                    <Star className="h-3 w-3 fill-white" />
                    Featured Spotlight
                  </span>
                </div>
              </div>

              {/* Text Content */}
              <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-stone-100 px-2.5 py-1 text-[11px] font-bold text-stone-700">
                      {featuredBlog.category}
                    </span>
                    <span className="text-[11px] text-stone-400">•</span>
                    <span className="text-[11px] text-stone-500 font-medium">
                      {featuredBlog.read_time}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-stone-900 group-hover:text-primary-600 transition-colors leading-snug">
                    <Link href={`/blog/${featuredBlog.slug}`}>
                      {featuredBlog.title}
                    </Link>
                  </h2>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed line-clamp-3">
                    {featuredBlog.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div className="text-[11px] text-stone-500">
                    <span>By {featuredBlog.author_name}</span>
                  </div>

                  <Link
                    href={`/blog/${featuredBlog.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white hover:bg-primary-600 transition-colors"
                  >
                    <span>Read Full Story</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* GRID OF BLOG ARTICLES */}
        {/* ======================================================== */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-stone-900">
              {searchQuery ? `Search Results for "${searchQuery}"` : selectedCategory !== 'all' ? `${selectedCategory} Articles` : 'Latest Articles & Guides'}
            </h3>
            <span className="text-xs text-stone-500 font-medium">
              {blogs.length} {blogs.length === 1 ? 'Article' : 'Articles'}
            </span>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent mx-auto mb-3" />
              <p className="text-xs font-semibold text-stone-500">Loading stories from the journal...</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="rounded-3xl border border-stone-200 bg-white p-12 text-center max-w-md mx-auto shadow-sm">
              <BookOpen className="h-10 w-10 text-stone-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-stone-900">No articles found</h4>
              <p className="text-xs text-stone-500 mt-1">
                Try searching with different keywords or select a different category above.
              </p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="mt-4 rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white hover:bg-stone-800 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(searchQuery || selectedCategory !== 'all' ? blogs : gridBlogs).map((blog) => (
                <article
                  key={blog.id}
                  className="rounded-3xl border border-stone-200/90 bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col group"
                >
                  {/* Thumbnail Cover */}
                  <Link href={`/blog/${blog.slug}`} className="relative aspect-[16/10] overflow-hidden bg-stone-100 block">
                    <img
                      src={blog.featured_image}
                      alt={blog.title}
                      className="h-full w-full object-cover group-hover:scale-108 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="rounded-md bg-stone-900/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                        {blog.category}
                      </span>
                    </div>
                  </Link>

                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-[11px] text-stone-500">
                        <span>{blog.read_time}</span>
                        <span>•</span>
                        <span>{new Date(blog.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>

                      <h4 className="text-base font-black text-stone-900 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug">
                        <Link href={`/blog/${blog.slug}`}>
                          {blog.title}
                        </Link>
                      </h4>

                      <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                        {blog.summary}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                      <div className="text-[11px] text-stone-500 font-medium">
                        By {blog.author_name}
                      </div>

                      <Link
                        href={`/blog/${blog.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        <span>Read Story</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* VIP GIFTING CLUB NEWSLETTER BANNER */}
        {/* ======================================================== */}
        <div className="mt-16 rounded-3xl bg-stone-950 p-8 sm:p-12 text-white text-center relative overflow-hidden border border-stone-800">
          <div className="relative z-10 max-w-xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-500/20 px-3 py-1 text-xs font-bold text-primary-300">
              <Gift className="h-3.5 w-3.5" />
              <span>Join 12,000+ Memory Keepers</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Get Exclusive Gifting Guides & 10% Off
            </h3>
            <p className="text-xs text-stone-400">
              Receive curated photo inspiration, wedding keepsake ideas, and early bird discounts directly to your inbox.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 rounded-xl border border-stone-800 bg-stone-900 px-4 py-2.5 text-xs text-white placeholder-stone-500 focus:border-primary-500 focus:outline-none"
              />
              <button
                type="button"
                className="rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-primary-500 transition-colors"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
