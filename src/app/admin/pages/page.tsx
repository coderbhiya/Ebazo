'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, Plus, Search, Edit3, Trash2, ExternalLink, 
  Check, X, Eye, Globe, Shield, Sparkles, AlertCircle, 
  ChevronRight, Save, Clock, ArrowLeft, HelpCircle,
  Heading1, Heading2, Heading3, Bold, Italic, List, ListOrdered, 
  Quote, Link as LinkIcon, RefreshCw, Layers, CheckCircle2
} from 'lucide-react';
import { 
  fetchAdminPages, fetchAdminPage, saveAdminPage, deleteAdminPage, 
  AdminCMSPage 
} from '@/lib/admin-api';

export default function AdminPagesPage() {
  const [pages, setPages] = useState<AdminCMSPage[]>([]);
  const [meta, setMeta] = useState({ total: 0, published: 0, drafts: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Editor Modal / Drawer state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPageId, setEditingPageId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<AdminCMSPage>>({
    title: '',
    slug: '',
    subtitle: '',
    content: '',
    meta_title: '',
    meta_description: '',
    is_published: 1,
    show_in_header: 0,
    show_in_footer: 1,
    display_order: 0,
  });

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<AdminCMSPage | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadPages = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminPages({ search: searchQuery, status: statusFilter });
      setPages(res.pages);
      setMeta(res.meta);
    } catch (err) {
      console.error('Failed to load pages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, [searchQuery, statusFilter]);

  const handleOpenCreate = () => {
    setEditingPageId(null);
    setFormData({
      title: '',
      slug: '',
      subtitle: '',
      content: '<h2>New Section</h2>\n<p>Start writing your rich page content here...</p>',
      meta_title: '',
      meta_description: '',
      is_published: 1,
      show_in_header: 0,
      show_in_footer: 1,
      display_order: (pages.length + 1) * 10,
    });
    setEditorTab('write');
    setFeedbackMsg(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = async (page: AdminCMSPage) => {
    setEditingPageId(page.id);
    setFeedbackMsg(null);
    setIsEditorOpen(true);
    // Fetch fresh page from API
    try {
      const full = await fetchAdminPage(page.id);
      if (full) {
        setFormData({ ...full });
      } else {
        setFormData({ ...page });
      }
    } catch {
      setFormData({ ...page });
    }
  };

  const handleTitleChange = (val: string) => {
    const updated: Partial<AdminCMSPage> = { title: val };
    // Auto-generate slug for new pages if slug hasn't been manually edited
    if (!editingPageId) {
      const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      updated.slug = autoSlug;
      updated.meta_title = `${val} | Ebanzo`;
    }
    setFormData((prev) => ({ ...prev, ...updated }));
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Page title is required' });
      return;
    }

    setSaving(true);
    setFeedbackMsg(null);

    try {
      const res = await saveAdminPage(editingPageId, formData);
      if (res.status === 'success') {
        setFeedbackMsg({ type: 'success', text: res.message || 'Page saved successfully!' });
        await loadPages();
        setTimeout(() => {
          setIsEditorOpen(false);
        }, 800);
      } else {
        setFeedbackMsg({ type: 'error', text: res.message || 'Failed to save page' });
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
      const res = await deleteAdminPage(deleteTarget.id);
      if (res.status === 'success') {
        setDeleteTarget(null);
        await loadPages();
      } else {
        alert(res.message || 'Failed to delete page');
      }
    } catch (err: any) {
      alert(err.message || 'Error connecting to server');
    } finally {
      setDeleting(false);
    }
  };

  // Helper to insert markdown/HTML snippets in editor
  const insertTag = (openTag: string, closeTag: string = '') => {
    const textarea = document.getElementById('pageContentTextarea') as HTMLTextAreaElement;
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Pages & Policy CMS
            </h1>
            <span className="inline-flex items-center rounded-md bg-primary-500/10 px-2 py-0.5 text-xs font-semibold text-primary-400 border border-primary-500/20">
              Live Content Suite
            </span>
          </div>
          <p className="mt-1 text-xs text-stone-400">
            Create, edit, and publish store policies (Privacy, Terms, Refund, Shipping), About Us, FAQs, and custom landing pages.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadPages}
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
            <span>Create New Page</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-stone-800/80 bg-[#121318]/90 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-400">Total Pages</span>
            <div className="rounded-lg bg-stone-800/60 p-2 text-stone-300">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{meta.total}</p>
          <p className="mt-1 text-[11px] text-stone-500">Active in database</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-400">Published Live</span>
            <div className="rounded-lg bg-emerald-500/20 p-2 text-emerald-300">
              <Globe className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-300">{meta.published}</p>
          <p className="mt-1 text-[11px] text-emerald-500/80">Visible on storefront</p>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-950/10 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-400">Drafts / Inactive</span>
            <div className="rounded-lg bg-amber-500/20 p-2 text-amber-300">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-300">{meta.drafts}</p>
          <p className="mt-1 text-[11px] text-amber-500/80">Hidden from customers</p>
        </div>

        <div className="rounded-2xl border border-stone-800/80 bg-[#121318]/90 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-400">Core Policies</span>
            <div className="rounded-lg bg-primary-500/20 p-2 text-primary-300">
              <Shield className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">
            {pages.filter(p => p.is_system === 1).length}
          </p>
          <p className="mt-1 text-[11px] text-stone-500">Protected legal pages</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="rounded-2xl border border-stone-800/80 bg-[#121318]/90 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, URL slug, or subtitle..."
            className="w-full rounded-xl border border-stone-800 bg-stone-900/90 pl-9 pr-3.5 py-2 text-xs text-white placeholder-stone-500 focus:border-primary-500 focus:outline-none"
          />
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
              {filter === 'all' ? 'All Pages' : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Pages Table */}
      <div className="rounded-2xl border border-stone-800/80 bg-[#121318]/90 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="border-b border-stone-800/80 bg-stone-900/50 text-[11px] font-bold uppercase tracking-wider text-stone-400">
              <tr>
                <th className="px-5 py-3.5">Page Title & Details</th>
                <th className="px-4 py-3.5">Storefront URL Slug</th>
                <th className="px-4 py-3.5">Nav Visibility</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Last Updated</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {loading && pages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-stone-500">
                    <RefreshCw className="mx-auto h-5 w-5 animate-spin mb-2 text-primary-400" />
                    Loading pages from CMS...
                  </td>
                </tr>
              ) : pages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-stone-500">
                    No pages found matching your search.
                  </td>
                </tr>
              ) : (
                pages.map((page) => (
                  <tr key={page.id} className="hover:bg-stone-800/30 transition-colors">
                    {/* Title & Subtitle */}
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-stone-800/80 text-primary-400 border border-stone-700/60 mt-0.5">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">
                              {page.title}
                            </span>
                            {page.is_system === 1 && (
                              <span className="inline-flex items-center rounded-md bg-stone-800 px-1.5 py-0.5 text-[10px] font-bold text-stone-400 border border-stone-700">
                                Core Policy
                              </span>
                            )}
                          </div>
                          {page.subtitle && (
                            <p className="text-[11px] text-stone-400 mt-0.5 max-w-md line-clamp-1">
                              {page.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="px-4 py-4">
                      <div className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 border border-stone-800 px-2.5 py-1 font-mono text-[11px] text-primary-300">
                        <span>/{page.slug}</span>
                      </div>
                    </td>

                    {/* Navigation placement */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-[11px]">
                        {page.show_in_header === 1 && (
                          <span className="rounded bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 font-semibold text-blue-300">
                            Header
                          </span>
                        )}
                        {page.show_in_footer === 1 && (
                          <span className="rounded bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 font-semibold text-purple-300">
                            Footer
                          </span>
                        )}
                        {page.show_in_header === 0 && page.show_in_footer === 0 && (
                          <span className="text-stone-500 text-[11px]">Direct Link</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      {page.is_published === 1 ? (
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

                    {/* Date */}
                    <td className="px-4 py-4 text-stone-400 text-[11px]">
                      {new Date(page.updated_at || page.created_at).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/pages/${page.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                          title="Preview on Live Site"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(page)}
                          className="inline-flex items-center gap-1 rounded-lg bg-stone-800/80 hover:bg-stone-700 px-2.5 py-1 text-[11px] font-bold text-white transition-colors border border-stone-700/80"
                        >
                          <Edit3 className="h-3.5 w-3.5 text-primary-400" />
                          <span>Edit</span>
                        </button>

                        {page.is_system === 0 && (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(page)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
                            title="Delete Page"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
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
      {/* RICH PAGE EDITOR MODAL / DRAWER */}
      {/* ======================================================== */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-3xl border border-stone-800 bg-[#121318] text-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-900/60">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-primary-600/20 text-primary-400 flex items-center justify-center border border-primary-500/30">
                  <Edit3 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    {editingPageId ? `Edit Page: ${formData.title || 'Untitled'}` : 'Create New Custom Page'}
                  </h3>
                  <p className="text-xs text-stone-400">
                    Live URL: <span className="text-primary-300 font-mono">/pages/{formData.slug || 'your-slug'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Mode Switcher */}
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
                    Live Preview
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

            {/* Modal Body (Scrollable) */}
            <form onSubmit={handleSavePage} className="flex-1 overflow-y-auto p-6 space-y-6">
              
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

              {/* Title & Slug Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    Page Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Corporate Gifting Guide"
                    className="w-full rounded-xl border border-stone-800 bg-stone-900/90 px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:border-primary-500 focus:outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    URL Slug <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs text-stone-500 font-mono">/pages/</span>
                    <input
                      type="text"
                      required
                      value={formData.slug || ''}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-') })}
                      placeholder="corporate-gifting"
                      className="w-full rounded-xl border border-stone-800 bg-stone-900/90 pl-18 pr-3.5 py-2.5 text-xs text-primary-300 font-mono focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  Subtitle / Banner Tagline
                </label>
                <input
                  type="text"
                  value={formData.subtitle || ''}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g. Custom Laser-Cut Acrylic Solutions for Businesses & Events"
                  className="w-full rounded-xl border border-stone-800 bg-stone-900/90 px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:border-primary-500 focus:outline-none"
                />
              </div>

              {/* Editor & Preview Area */}
              {editorTab === 'write' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-300">
                      Page Content (HTML / Markdown Supported) <span className="text-rose-400">*</span>
                    </label>

                    {/* Toolbar buttons */}
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
                        onClick={() => insertTag('<ul>\n  <li>', '</li>\n  <li>Second Item</li>\n</ul>')}
                        className="p-1 rounded hover:bg-stone-800 text-stone-400 hover:text-white"
                        title="Bullet List"
                      >
                        <List className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertTag('<div class="callout-box bg-stone-100 p-4 rounded-xl border">\n  ', '\n</div>')}
                        className="p-1 rounded hover:bg-stone-800 text-stone-400 hover:text-white"
                        title="Callout Box"
                      >
                        <Quote className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertTag('<a href="https://..." class="text-primary-600 underline">', '</a>')}
                        className="p-1 rounded hover:bg-stone-800 text-stone-400 hover:text-white"
                        title="Link"
                      >
                        <LinkIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    id="pageContentTextarea"
                    rows={12}
                    required
                    value={formData.content || ''}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="<h2>Heading</h2><p>Your content here...</p>"
                    className="w-full rounded-2xl border border-stone-800 bg-stone-950 px-4 py-3 text-xs text-stone-200 font-mono placeholder-stone-600 focus:border-primary-500 focus:outline-none leading-relaxed"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-stone-400">Live Customer View Simulation</span>
                  <div className="rounded-2xl border border-stone-800 bg-white text-stone-900 p-6 sm:p-8 max-h-96 overflow-y-auto shadow-inner">
                    <h1 className="text-2xl font-black text-stone-900 mb-1">{formData.title || 'Untitled Page'}</h1>
                    {formData.subtitle && (
                      <p className="text-xs text-stone-500 mb-6 pb-4 border-b border-stone-200">{formData.subtitle}</p>
                    )}
                    <div 
                      className="prose prose-stone prose-sm max-w-none text-xs leading-relaxed space-y-4"
                      dangerouslySetInnerHTML={{ __html: formData.content || '<p>No content entered yet.</p>' }}
                    />
                  </div>
                </div>
              )}

              {/* SEO & Search Engine Preview */}
              <div className="rounded-2xl border border-stone-800/80 bg-stone-900/40 p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary-400" />
                  <h4 className="text-xs font-bold text-white">Search Engine Optimization (SEO) & Google Preview</h4>
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
                      placeholder={`${formData.title || 'Page'} | Ebanzo`}
                      className="w-full rounded-xl border border-stone-800 bg-stone-900 px-3 py-2 text-xs text-white placeholder-stone-500 focus:border-primary-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                      Meta Description
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
                    https://ebanzo.com/pages/{formData.slug || 'page-slug'}
                  </p>
                  <p className="text-sm font-semibold text-[#1a0dab] hover:underline cursor-pointer truncate mt-0.5">
                    {formData.meta_title || `${formData.title || 'Untitled'} | Ebanzo`}
                  </p>
                  <p className="text-xs text-stone-600 line-clamp-2 mt-1">
                    {formData.meta_description || 'Personalized photo keepsakes, laser cut acrylic decor and custom photo gifts crafted with Japanese UV print precision.'}
                  </p>
                </div>
              </div>

              {/* Visibility & Publishing Settings */}
              <div className="rounded-2xl border border-stone-800/80 bg-stone-900/40 p-4 space-y-4">
                <h4 className="text-xs font-bold text-white">Publishing & Navigation Placement</h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Published Toggle */}
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-stone-900/80 border border-stone-800 cursor-pointer hover:border-stone-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.is_published === 1}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked ? 1 : 0 })}
                      className="h-4 w-4 rounded border-stone-700 bg-stone-800 text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <span className="block text-xs font-bold text-white">Publish Live</span>
                      <span className="block text-[10px] text-stone-400">Visible to customers</span>
                    </div>
                  </label>

                  {/* Show in Footer */}
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-stone-900/80 border border-stone-800 cursor-pointer hover:border-stone-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.show_in_footer === 1}
                      onChange={(e) => setFormData({ ...formData, show_in_footer: e.target.checked ? 1 : 0 })}
                      className="h-4 w-4 rounded border-stone-700 bg-stone-800 text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <span className="block text-xs font-bold text-white">Show in Footer</span>
                      <span className="block text-[10px] text-stone-400">Quick Links column</span>
                    </div>
                  </label>

                  {/* Show in Header */}
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-stone-900/80 border border-stone-800 cursor-pointer hover:border-stone-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.show_in_header === 1}
                      onChange={(e) => setFormData({ ...formData, show_in_header: e.target.checked ? 1 : 0 })}
                      className="h-4 w-4 rounded border-stone-700 bg-stone-800 text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <span className="block text-xs font-bold text-white">Show in Header</span>
                      <span className="block text-[10px] text-stone-400">Top Navigation Bar</span>
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
                  <span>{saving ? 'Saving Page...' : editingPageId ? 'Update & Publish' : 'Create & Publish Page'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ======================================================== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl border border-stone-800 bg-[#121318] p-6 text-stone-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Custom Page?</h3>
                <p className="text-xs text-stone-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Are you sure you want to permanently delete <strong>{deleteTarget.title}</strong> (<span className="text-primary-300 font-mono">/pages/{deleteTarget.slug}</span>)?
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
