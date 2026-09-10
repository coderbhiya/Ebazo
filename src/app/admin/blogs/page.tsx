'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, Plus, Search, Edit3, Trash2, ExternalLink, 
  Check, X, Eye, Globe, Shield, Sparkles, AlertCircle, 
  ChevronRight, Save, Clock, ArrowLeft, HelpCircle,
  Heading1, Heading2, Heading3, Bold, Italic, List, ListOrdered, 
  Quote, Link as LinkIcon, RefreshCw, Star, Tag, Image as ImageIcon,
  CheckCircle2, Flame, User
} from 'lucide-react';
import { 
  fetchAdminBlogs, fetchAdminBlog, saveAdminBlog, deleteAdminBlog, 
  AdminBlogPost 
} from '@/lib/admin-api';

const SAMPLE_IMAGES = [
  { label: 'Fridge Magnet 1 nos a', url: '/frames/fridge-magnet/1_nos_a.png' },
  { label: 'Fridge Magnet 1 nos b', url: '/frames/fridge-magnet/1_nos_b.png' },
  { label: 'Fridge Magnet 1 nos c', url: '/frames/fridge-magnet/1_nos_c.png' },
  { label: 'Fridge Magnet 1 nos d', url: '/frames/fridge-magnet/1_nos_d.png' },
  { label: 'Car Hanging Keepsake', url: '/frames/car-hanging/1_nos_a.png' },
  { label: 'Dashboard Stand Frame', url: '/frames/car-stand/1_nos_a.png' },
];

const CATEGORY_OPTIONS = [
  'Gifting Inspiration',
  'Product Insights',
  'Care & Maintenance',
  'Car Accessories',
  'Behind the Scenes',
  'Customer Stories'
];

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<AdminBlogPost[]>([]);
  const [meta, setMeta] = useState({ total: 0, published: 0, drafts: 0, total_views: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<AdminBlogPost>>({
    title: '',
    slug: '',
    summary: '',
    content: '',
    featured_image: '/frames/fridge-magnet/1_nos_a.png',
    category: 'Gifting Inspiration',
    tags: ['Gifting', 'Acrylic Keepsakes'],
    author_name: 'Ebanzo Editorial Team',
    read_time: '4 min read',
    meta_title: '',
    meta_description: '',
    is_published: 1,
    is_featured: 0,
  });

  const [tagsInput, setTagsInput] = useState('Gifting, Acrylic Keepsakes');

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<AdminBlogPost | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminBlogs({ 
        search: searchQuery, 
        category: selectedCategory, 
        status: statusFilter 
      });
      setBlogs(res.blogs);
      setMeta(res.meta);
    } catch (err) {
      console.error('Failed to load blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, [searchQuery, selectedCategory, statusFilter]);

  const handleOpenCreate = () => {
    setEditingBlogId(null);
    const initialTags = ['Gifting Guide', 'Acrylic Decor'];
    setFormData({
      title: '',
      slug: '',
      summary: '',
      content: '<h2>Introduction</h2>\n<p>Share inspiring ideas, gift guides, or product craftsmanship details here...</p>\n\n<h3>Key Highlights</h3>\n<ul>\n  <li>Tip 1</li>\n  <li>Tip 2</li>\n</ul>',
      featured_image: '/frames/fridge-magnet/1_nos_a.png',
      category: 'Gifting Inspiration',
      tags: initialTags,
      author_name: 'Ebanzo Editorial Team',
      read_time: '4 min read',
      meta_title: '',
      meta_description: '',
      is_published: 1,
      is_featured: 0,
    });
    setTagsInput(initialTags.join(', '));
    setEditorTab('write');
    setFeedbackMsg(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = async (blog: AdminBlogPost) => {
    setEditingBlogId(blog.id);
    setFeedbackMsg(null);
    setIsEditorOpen(true);
    try {
      const full = await fetchAdminBlog(blog.id);
      const post = full || blog;
      setFormData({ ...post });
      setTagsInput(Array.isArray(post.tags) ? post.tags.join(', ') : '');
    } catch {
      setFormData({ ...blog });
      setTagsInput(Array.isArray(blog.tags) ? blog.tags.join(', ') : '');
    }
  };

  const handleTitleChange = (val: string) => {
    const updated: Partial<AdminBlogPost> = { title: val };
    if (!editingBlogId) {
      const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      updated.slug = autoSlug;
      updated.meta_title = `${val} | Ebanzo Blog`;
    }
    setFormData((prev) => ({ ...prev, ...updated }));
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Article title is required' });
      return;
    }

    setSaving(true);
    setFeedbackMsg(null);

    const parsedTags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const payload = {
      ...formData,
      tags: parsedTags,
    };

    try {
      const res = await saveAdminBlog(editingBlogId, payload);
      if (res.status === 'success') {
        setFeedbackMsg({ type: 'success', text: res.message || 'Article saved successfully!' });
        await loadBlogs();
        setTimeout(() => {
          setIsEditorOpen(false);
        }, 800);
      } else {
        setFeedbackMsg({ type: 'error', text: res.message || 'Failed to save article' });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Error connecting to server' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await deleteAdminBlog(deleteTarget.id);
      if (res.status === 'success') {
        setDeleteTarget(null);
        await loadBlogs();
      } else {
        alert(res.message || 'Failed to delete article');
      }
    } catch (err: any) {
      alert(err.message || 'Error connecting to server');
    } finally {
      setDeleting(false);
    }
  };

  const insertTag = (openTag: string, closeTag: string = '') => {
    const textarea = document.getElementById('blogContentTextarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = formData.content || '';
    const selected = current.substring(start, end);
    const replacement = `${openTag}${selected || 'Sample Text'}${closeTag}`;

    const nextContent = current.substring(0, start) + replacement + current.substring(end);
    setFormData((prev) => ({ ...prev, content: nextContent }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + openTag.length, start + openTag.length + (selected.length || 11));
    }, 50);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Blog & Article Studio
            </h1>
            <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">
              Content Marketing
            </span>
          </div>
          <p className="mt-1 text-xs text-stone-400">
            Publish gifting guides, product care tips, and customer stories to drive SEO traffic and customer engagement.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/blog"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-800 bg-stone-900/80 px-3 py-2 text-xs font-semibold text-stone-300 hover:bg-stone-800 hover:text-white transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>View Public Blog</span>
          </Link>

          <button
            type="button"
            onClick={loadBlogs}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-800 bg-stone-900/80 px-3 py-2 text-xs font-semibold text-stone-300 hover:bg-stone-800 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm shadow-primary-950/50 hover:bg-primary-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Write New Article</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-stone-800/80 bg-[#121318]/90 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-400">Total Articles</span>
            <div className="rounded-lg bg-stone-800/60 p-2 text-stone-300">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{meta.total}</p>
          <p className="mt-1 text-[11px] text-stone-500">In content repository</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-400">Published Live</span>
            <div className="rounded-lg bg-emerald-500/20 p-2 text-emerald-300">
              <Globe className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-300">{meta.published}</p>
          <p className="mt-1 text-[11px] text-emerald-500/80">Indexed on storefront</p>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-950/10 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-400">Drafts / In Review</span>
            <div className="rounded-lg bg-amber-500/20 p-2 text-amber-300">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-300">{meta.drafts}</p>
          <p className="mt-1 text-[11px] text-amber-500/80">Unpublished drafts</p>
        </div>

        <div className="rounded-2xl border border-primary-500/20 bg-primary-950/10 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-primary-400">Total Article Reads</span>
            <div className="rounded-lg bg-primary-500/20 p-2 text-primary-300">
              <Eye className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{meta.total_views.toLocaleString()}</p>
          <p className="mt-1 text-[11px] text-stone-500">Cumulative customer reads</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="rounded-2xl border border-stone-800/80 bg-[#121318]/90 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto flex-1">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by article title, slug, or summary..."
              className="w-full rounded-xl border border-stone-800 bg-stone-900/90 pl-9 pr-3.5 py-2 text-xs text-white placeholder-stone-500 focus:border-primary-500 focus:outline-none"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto rounded-xl border border-stone-800 bg-stone-900 px-3 py-2 text-xs text-stone-300 focus:border-primary-500 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {(['all', 'published', 'draft'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition-colors ${
                statusFilter === filter
                  ? 'bg-primary-600 text-white'
                  : 'bg-stone-900/80 text-stone-400 hover:bg-stone-800 hover:text-white'
              }`}
            >
              {filter === 'all' ? 'All Articles' : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Blogs Table */}
      <div className="rounded-2xl border border-stone-800/80 bg-[#121318]/90 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="border-b border-stone-800/80 bg-stone-900/50 text-[11px] font-bold uppercase tracking-wider text-stone-400">
              <tr>
                <th className="px-5 py-3.5">Article & Cover</th>
                <th className="px-4 py-3.5">Category & Tags</th>
                <th className="px-4 py-3.5">Author & Read Time</th>
                <th className="px-4 py-3.5">Reads / Views</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {loading && blogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-stone-500">
                    <RefreshCw className="mx-auto h-5 w-5 animate-spin mb-2 text-primary-400" />
                    Loading articles...
                  </td>
                </tr>
              ) : blogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-stone-500">
                    No articles found matching your filters.
                  </td>
                </tr>
              ) : (
                blogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-stone-800/30 transition-colors">
                    {/* Cover & Title */}
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3.5">
                        <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-stone-800 border border-stone-700/60 relative">
                          <img
                            src={blog.featured_image}
                            alt={blog.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm line-clamp-1">
                              {blog.title}
                            </span>
                            {blog.is_featured === 1 && (
                              <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/20">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                Featured
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-400 line-clamp-1 max-w-md">
                            {blog.summary}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category & Tags */}
                    <td className="px-4 py-4">
                      <div className="space-y-1.5">
                        <span className="inline-block rounded-md bg-stone-800 border border-stone-700 px-2 py-0.5 text-[11px] font-bold text-stone-300">
                          {blog.category}
                        </span>
                        {blog.tags && blog.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {blog.tags.slice(0, 2).map((t, idx) => (
                              <span key={idx} className="text-[10px] text-stone-400">
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Author & Read Time */}
                    <td className="px-4 py-4">
                      <div className="text-[11px] space-y-0.5">
                        <span className="font-semibold text-stone-300 block truncate max-w-[120px]">
                          {blog.author_name}
                        </span>
                        <span className="text-stone-500 block">
                          {blog.read_time}
                        </span>
                      </div>
                    </td>

                    {/* Views */}
                    <td className="px-4 py-4">
                      <div className="inline-flex items-center gap-1.5 font-bold text-white text-xs">
                        <Eye className="h-3.5 w-3.5 text-stone-400" />
                        <span>{blog.views_count.toLocaleString()}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      {blog.is_published === 1 ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-400 border border-emerald-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-400 border border-amber-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                          Draft
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/blog/${blog.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                          title="Preview on Live Site"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(blog)}
                          className="inline-flex items-center gap-1 rounded-lg bg-stone-800/80 hover:bg-stone-700 px-2.5 py-1 text-[11px] font-bold text-white transition-colors border border-stone-700/80"
                        >
                          <Edit3 className="h-3.5 w-3.5 text-primary-400" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(blog)}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
                          title="Delete Article"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* RICH BLOG EDITOR MODAL / DRAWER */}
      {/* ======================================================== */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-3xl border border-stone-800 bg-[#121318] text-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-900/60">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    {editingBlogId ? `Edit Article: ${formData.title || 'Untitled'}` : 'Write New Blog Article'}
                  </h3>
                  <p className="text-xs text-stone-400">
                    Live URL: <span className="text-primary-300 font-mono">/blog/{formData.slug || 'your-slug'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex rounded-xl bg-stone-950 border border-stone-800 p-0.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setEditorTab('write')}
                    className={`rounded-lg px-3 py-1 transition-colors ${
                      editorTab === 'write' ? 'bg-stone-800 text-white shadow-sm' : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorTab('preview')}
                    className={`rounded-lg px-3 py-1 transition-colors ${
                      editorTab === 'preview' ? 'bg-stone-800 text-white shadow-sm' : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    Live Reader Preview
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors ml-2"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveBlog} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {feedbackMsg && (
                <div
                  className={`rounded-xl p-3 text-xs font-medium flex items-center gap-2 ${
                    feedbackMsg.type === 'success'
                      ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
                  }`}
                >
                  {feedbackMsg.type === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
                  )}
                  <span>{feedbackMsg.text}</span>
                </div>
              )}

              {/* Title & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    Article Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. 5 Creative Anniversary Photo Gifts"
                    className="w-full rounded-xl border border-stone-800 bg-stone-900/90 px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:border-primary-500 focus:outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    URL Slug <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs text-stone-500 font-mono">/blog/</span>
                    <input
                      type="text"
                      required
                      value={formData.slug || ''}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-') })}
                      placeholder="5-creative-anniversary-photo-gifts"
                      className="w-full rounded-xl border border-stone-800 bg-stone-900/90 pl-16 pr-3.5 py-2.5 text-xs text-primary-300 font-mono focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Category, Author & Read Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    Category <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.category || 'Gifting Inspiration'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl border border-stone-800 bg-stone-900 px-3 py-2.5 text-xs text-white focus:border-primary-500 focus:outline-none"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={formData.author_name || ''}
                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                    placeholder="Ebanzo Editorial Team"
                    className="w-full rounded-xl border border-stone-800 bg-stone-900 px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:border-primary-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    Estimated Read Time
                  </label>
                  <input
                    type="text"
                    value={formData.read_time || ''}
                    onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                    placeholder="e.g. 4 min read"
                    className="w-full rounded-xl border border-stone-800 bg-stone-900 px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Featured Image URL & Quick Sample Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-300">
                  Featured Header Image URL <span className="text-rose-400">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.featured_image || ''}
                    onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                    placeholder="/frames/fridge-magnet/1_nos_a.png or https://..."
                    className="flex-1 rounded-xl border border-stone-800 bg-stone-900 px-3.5 py-2 text-xs text-white placeholder-stone-500 focus:border-primary-500 focus:outline-none font-mono"
                  />
                </div>

                {/* Quick Sample Image Picker */}
                <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1">
                  <span className="text-[10px] text-stone-500 flex-shrink-0">Sample Frames:</span>
                  {SAMPLE_IMAGES.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, featured_image: img.url })}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-900 border border-stone-800 hover:border-primary-500 text-[10px] text-stone-400 hover:text-white flex-shrink-0"
                    >
                      <ImageIcon className="h-3 w-3" />
                      <span>{img.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary / Excerpt */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  Article Summary / Short Excerpt (1-2 Sentences) <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.summary || ''}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="A concise overview shown on blog cards and search results..."
                  className="w-full rounded-xl border border-stone-800 bg-stone-900 px-3.5 py-2 text-xs text-white placeholder-stone-500 focus:border-primary-500 focus:outline-none"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Anniversary, Acrylic Decor, Custom Gifting"
                  className="w-full rounded-xl border border-stone-800 bg-stone-900 px-3.5 py-2 text-xs text-white placeholder-stone-500 focus:border-primary-500 focus:outline-none"
                />
              </div>

              {/* Editor / Preview Body */}
              {editorTab === 'write' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-300">
                      Article Content (HTML / Markdown Supported) <span className="text-rose-400">*</span>
                    </label>

                    {/* Toolbar */}
                    <div className="flex items-center gap-1 bg-stone-900 border border-stone-800 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => insertTag('<h2>', '</h2>')}
                        className="p-1 rounded hover:bg-stone-800 text-stone-400 hover:text-white"
                        title="Heading 2"
                      >
                        <Heading2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertTag('<h3>', '</h3>')}
                        className="p-1 rounded hover:bg-stone-800 text-stone-400 hover:text-white"
                        title="Heading 3"
                      >
                        <Heading3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertTag('<strong>', '</strong>')}
                        className="p-1 rounded hover:bg-stone-800 text-stone-400 hover:text-white"
                        title="Bold"
                      >
                        <Bold className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertTag('<em>', '</em>')}
                        className="p-1 rounded hover:bg-stone-800 text-stone-400 hover:text-white"
                        title="Italic"
                      >
                        <Italic className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertTag('<ul>\n  <li>', '</li>\n  <li>Point 2</li>\n</ul>')}
                        className="p-1 rounded hover:bg-stone-800 text-stone-400 hover:text-white"
                        title="Bullet List"
                      >
                        <List className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertTag('<div class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">\n  <strong>Pro Tip:</strong> ', '\n</div>')}
                        className="p-1 rounded hover:bg-stone-800 text-stone-400 hover:text-white"
                        title="Pro Tip Box"
                      >
                        <Quote className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertTag('<a href="/shop" class="text-primary-600 underline font-semibold">', '</a>')}
                        className="p-1 rounded hover:bg-stone-800 text-stone-400 hover:text-white"
                        title="Link"
                      >
                        <LinkIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    id="blogContentTextarea"
                    rows={12}
                    required
                    value={formData.content || ''}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="<h2>Main Section</h2><p>Article body...</p>"
                    className="w-full rounded-2xl border border-stone-800 bg-stone-950 px-4 py-3 text-xs text-stone-200 font-mono placeholder-stone-600 focus:border-primary-500 focus:outline-none leading-relaxed"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-stone-400">Live Reader View</span>
                  <div className="rounded-2xl border border-stone-800 bg-white text-stone-900 p-6 sm:p-8 max-h-96 overflow-y-auto shadow-inner space-y-4">
                    <span className="rounded-full bg-primary-100 text-primary-800 font-bold px-3 py-1 text-xs">
                      {formData.category}
                    </span>
                    <h1 className="text-2xl font-black text-stone-900">{formData.title || 'Untitled Article'}</h1>
                    <p className="text-xs text-stone-500 italic pb-3 border-b border-stone-200">
                      By {formData.author_name} • {formData.read_time}
                    </p>
                    <div 
                      className="prose prose-stone prose-sm max-w-none text-xs leading-relaxed space-y-3"
                      dangerouslySetInnerHTML={{ __html: formData.content || '<p>No content entered yet.</p>' }}
                    />
                  </div>
                </div>
              )}

              {/* SEO & Search Engine Snippet */}
              <div className="rounded-2xl border border-stone-800/80 bg-stone-900/40 p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary-400" />
                  <h4 className="text-xs font-bold text-white">Search Engine Optimization (SEO)</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                      Meta Title Tag
                    </label>
                    <input
                      type="text"
                      value={formData.meta_title || ''}
                      onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                      placeholder={`${formData.title || 'Article'} | Ebanzo Blog`}
                      className="w-full rounded-xl border border-stone-800 bg-stone-900 px-3 py-2 text-xs text-white placeholder-stone-500 focus:border-primary-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                      Meta Description Tag
                    </label>
                    <input
                      type="text"
                      value={formData.meta_description || ''}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      placeholder="Concise summary for search engines (150-160 chars)"
                      className="w-full rounded-xl border border-stone-800 bg-stone-900 px-3 py-2 text-xs text-white placeholder-stone-500 focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Google Snippet Card */}
                <div className="rounded-xl bg-white p-3.5 border border-stone-200 text-left">
                  <p className="text-[11px] text-emerald-800 truncate font-mono">
                    https://ebanzo.com/blog/{formData.slug || 'article-slug'}
                  </p>
                  <p className="text-sm font-semibold text-[#1a0dab] hover:underline cursor-pointer truncate mt-0.5">
                    {formData.meta_title || `${formData.title || 'Article'} | Ebanzo Blog`}
                  </p>
                  <p className="text-xs text-stone-600 line-clamp-2 mt-1">
                    {formData.meta_description || formData.summary || 'Personalized photo keepsakes, laser cut acrylic decor and custom photo gifts crafted with Japanese UV print precision.'}
                  </p>
                </div>
              </div>

              {/* Publishing Switches */}
              <div className="rounded-2xl border border-stone-800/80 bg-stone-900/40 p-4 space-y-4">
                <h4 className="text-xs font-bold text-white">Publishing Status & Visibility</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-stone-900/80 border border-stone-800 cursor-pointer hover:border-stone-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.is_published === 1}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked ? 1 : 0 })}
                      className="h-4 w-4 rounded border-stone-700 bg-stone-800 text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <span className="block text-xs font-bold text-white">Publish Live</span>
                      <span className="block text-[10px] text-stone-400">Visible on storefront blog</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-stone-900/80 border border-stone-800 cursor-pointer hover:border-stone-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.is_featured === 1}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked ? 1 : 0 })}
                      className="h-4 w-4 rounded border-stone-700 bg-stone-800 text-amber-500 focus:ring-amber-400"
                    />
                    <div>
                      <span className="block text-xs font-bold text-white">Featured Spotlight Article</span>
                      <span className="block text-[10px] text-stone-400">Pinned hero card on blog hub</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="rounded-xl border border-stone-800 px-4 py-2 text-xs font-semibold text-stone-400 hover:bg-stone-800 hover:text-white transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-primary-950/50 hover:bg-primary-500 disabled:opacity-50 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? 'Saving...' : editingBlogId ? 'Update Article' : 'Publish Article'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DELETE MODAL */}
      {/* ======================================================== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl border border-stone-800 bg-[#121318] p-6 text-stone-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Blog Article?</h3>
                <p className="text-xs text-stone-400">This will remove the article from the storefront.</p>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Are you sure you want to delete <strong>{deleteTarget.title}</strong>?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-stone-800 px-4 py-2 text-xs font-semibold text-stone-400 hover:bg-stone-800 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
