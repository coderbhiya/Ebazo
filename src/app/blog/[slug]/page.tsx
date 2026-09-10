'use client';


import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  BookOpen, ChevronRight, Clock, Eye, Share2, 
  MessageCircle, Copy, Check, ArrowLeft, Sparkles, 
  ShoppingBag, ShieldCheck, Heart, Tag, User 
} from 'lucide-react';
import { fetchBlogPostBySlug, BlogPost } from '@/lib/api';

export default function BlogPostReaderPage() {
  const params = useParams();
  const slug = (params?.slug as string) || '';

  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);

    fetchBlogPostBySlug(slug)
      .then((data) => {
        if (data) {
          setBlog(data);
        } else {
          setNotFound(true);
        }
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [slug]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    if (typeof window !== 'undefined' && blog) {
      const text = encodeURIComponent(`Read this article on Ebanzo: ${blog.title}\n${window.location.href}`);
      window.open(`https://wa.me/?text=${text}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center bg-stone-50/60 py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent mb-3" />
        <p className="text-xs font-semibold text-stone-500">Loading story...</p>
      </div>
    );
  }

  if (notFound || !blog) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center bg-stone-50/60 px-4 py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-200 text-stone-500 mb-4">
          <BookOpen className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-black text-stone-900">Article Not Found</h1>
        <p className="mt-2 text-xs text-stone-600 max-w-sm">
          The requested article <span className="font-mono text-primary-600 font-bold">/{slug}</span> does not exist or has been removed.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <Link
            href="/blog"
            className="rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-stone-800 transition-colors"
          >
            Back to Journal
          </Link>
          <Link
            href="/"
            className="rounded-xl bg-primary-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-500 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/70 py-10 sm:py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-stone-500 mb-6">
          <Link href="/" className="hover:text-stone-900 transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
          <Link href="/blog" className="hover:text-stone-900 transition-colors">The Journal</Link>
          <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
          <span className="font-bold text-stone-900 truncate max-w-xs">{blog.category}</span>
        </nav>

        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to All Articles</span>
        </Link>

        {/* Article Container Card */}
        <article className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-12 shadow-sm space-y-8">
          
          {/* Header Metadata */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-md bg-primary-50 border border-primary-200/60 px-3 py-1 text-xs font-black text-primary-700">
                {blog.category}
              </span>
              <span className="text-xs text-stone-400">•</span>
              <span className="text-xs text-stone-500 font-semibold flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{blog.read_time}</span>
              </span>
              <span className="text-xs text-stone-400">•</span>
              <span className="text-xs text-stone-500 font-medium">
                {new Date(blog.created_at).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight leading-tight">
              {blog.title}
            </h1>

            {blog.summary && (
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-medium pt-1">
                {blog.summary}
              </p>
            )}

            {/* Author bar & Share buttons */}
            <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-600 to-stone-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {blog.author_name ? blog.author_name.charAt(0) : 'E'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">{blog.author_name}</h4>
                  <p className="text-[11px] text-stone-500">Ebanzo Studio Craft Editor</p>
                </div>
              </div>

              {/* Social Share Bar */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors shadow-sm"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>Share on WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-2 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900 transition-colors"
                  title="Copy Article Link"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          {blog.featured_image && (
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-stone-100 border border-stone-100 shadow-inner">
              <img
                src={blog.featured_image}
                alt={blog.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* Formatted Article Body */}
          <div
            className="prose prose-stone prose-sm sm:prose-base max-w-none text-stone-800 leading-relaxed
              prose-headings:font-black prose-headings:text-stone-900
              prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-3 prose-h2:border-b prose-h2:border-stone-100 prose-h2:pb-2
              prose-h3:text-base sm:prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2 text-stone-900
              prose-p:text-xs sm:prose-p:text-sm prose-p:leading-relaxed prose-p:text-stone-600
              prose-ul:text-xs sm:prose-ul:text-sm prose-ul:text-stone-600 prose-ul:space-y-1.5
              prose-strong:text-stone-900 prose-strong:font-bold
              prose-a:text-primary-600 prose-a:font-semibold hover:prose-a:text-primary-700 hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Tags Chips */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="pt-6 border-t border-stone-100 space-y-2">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Tagged Topics:</span>
              <div className="flex flex-wrap gap-1.5">
                {blog.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700 border border-stone-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA Keepsake Showcase Banner */}
          <div className="rounded-2xl bg-gradient-to-br from-stone-950 via-[#16171d] to-stone-900 p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 border border-stone-800">
            <div className="space-y-1.5 text-center sm:text-left">
              <span className="inline-block rounded-full bg-primary-500/20 px-2.5 py-0.5 text-[10px] font-bold text-primary-300">
                ✨ Turn Inspiration Into Reality
              </span>
              <h3 className="text-base sm:text-lg font-black text-white">
                Customize Your Keepsake in Real-Time
              </h3>
              <p className="text-xs text-stone-400 max-w-md">
                Upload your favourite photograph, pick bespoke laser-cut shapes, and preview before ordering.
              </p>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-primary-500 transition-colors shadow-md flex-shrink-0"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Explore Keepsakes</span>
            </Link>
          </div>

        </article>

        {/* ======================================================== */}
        {/* RELATED ARTICLES */}
        {/* ======================================================== */}
        {blog.related && blog.related.length > 0 && (
          <div className="mt-14 space-y-6">
            <h3 className="text-xl font-black text-stone-900">
              More Stories You Might Like
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blog.related.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.slug}`}
                  className="rounded-3xl border border-stone-200/90 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                    <img
                      src={rel.featured_image}
                      alt={rel.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-primary-600 uppercase tracking-wider block">
                        {rel.category}
                      </span>
                      <h4 className="text-xs sm:text-sm font-black text-stone-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                        {rel.title}
                      </h4>
                    </div>
                    <span className="text-[11px] text-stone-400 font-medium">
                      {rel.read_time}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}