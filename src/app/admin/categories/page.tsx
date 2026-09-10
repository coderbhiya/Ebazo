'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Layers, Plus, Edit, Trash2, Sparkles,
  X, Check, AlertCircle, RefreshCw, Search,
  CheckCircle2, Tag, ArrowUpDown, ExternalLink,
  Sliders, Wand2, Image as ImageIcon, Package, FileSpreadsheet,
  AlertTriangle, Upload, Loader2, CornerDownRight
} from 'lucide-react';
import {
  fetchAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  bulkDeleteAdminCategories,
  updateCategoryBgRemoval
} from '@/lib/admin-api';
import { Category, uploadCustomPhoto } from '@/lib/api';

export interface CategoryWithHierarchy extends Category {
  level: number;
  hierarchyName: string;
}

// Builds hierarchical tree list with indentation prefixes (Level 0: Main, Level 1: Sub, Level 2: Sub-sub)
function getCategoryHierarchy(cats: Category[]): CategoryWithHierarchy[] {
  const result: CategoryWithHierarchy[] = [];
  const childrenMap = new Map<number, Category[]>();

  cats.forEach((c) => {
    const pId = c.parent_id || 0;
    if (!childrenMap.has(pId)) childrenMap.set(pId, []);
    childrenMap.get(pId)!.push(c);
  });

  function traverse(pId: number, level: number) {
    const children = childrenMap.get(pId) || [];
    children.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    for (const child of children) {
      const prefix = level === 0 ? '' : '— '.repeat(level);
      result.push({
        ...child,
        level,
        hierarchyName: `${prefix}${child.name}`,
      });
      traverse(child.id, level + 1);
    }
  }

  traverse(0, 0);

  // Catch any orphan categories with parent_id not found in list
  const seenIds = new Set(result.map((r) => r.id));
  for (const c of cats) {
    if (!seenIds.has(c.id)) {
      result.push({ ...c, level: 0, hierarchyName: c.name });
    }
  }

  return result;
}

export default function WooCommerceAdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState('');

  // Status filter tab
  const [statusTab, setStatusTab] = useState<'all' | 'parents' | 'subcategories' | 'bg_removal'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Sorting (default is display_order which preserves hierarchical tree order)
  const [sortField, setSortField] = useState<'display_order' | 'name' | 'product_count' | 'id'>('display_order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Full Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [bgRemovalEnabled, setBgRemovalEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick Edit Inline Row
  const [quickEditId, setQuickEditId] = useState<number | null>(null);
  const [quickName, setQuickName] = useState('');
  const [quickSlug, setQuickSlug] = useState('');
  const [quickParentId, setQuickParentId] = useState<number | null>(null);
  const [quickOrder, setQuickOrder] = useState('0');
  const [quickBgRemoval, setQuickBgRemoval] = useState(false);

  // Delete Confirmation Modal
  const [deleteConfirmCat, setDeleteConfirmCat] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadCategories = async () => {
    setLoading(true);
    try {
      const cats = await fetchAdminCategories();
      setCategories(cats || []);
    } catch (err) {
      showToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadingImage(true);
      try {
        const res = await uploadCustomPhoto(file);
        if (res && res.url) {
          setImageUrl(res.url);
          showToast('Category image uploaded successfully');
        } else {
          showToast('Image upload failed', 'error');
        }
      } catch (err) {
        showToast('Error uploading image', 'error');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  // Pre-calculated hierarchical categories for dropdowns & default tree display
  const hierarchicalCategories = useMemo(() => {
    return getCategoryHierarchy(categories);
  }, [categories]);

  // Exclude current category and its descendants from parent dropdown when editing
  const availableParentOptions = useMemo(() => {
    if (!editingCategory) return hierarchicalCategories;

    // Collect descendants of editingCategory
    const descendants = new Set<number>([editingCategory.id]);
    let added = true;
    while (added) {
      added = false;
      categories.forEach((c) => {
        if (c.parent_id && descendants.has(c.parent_id) && !descendants.has(c.id)) {
          descendants.add(c.id);
          added = true;
        }
      });
    }

    return hierarchicalCategories.filter((c) => !descendants.has(c.id));
  }, [hierarchicalCategories, editingCategory, categories]);

  const availableQuickParentOptions = useMemo(() => {
    if (!quickEditId) return hierarchicalCategories;
    const descendants = new Set<number>([quickEditId]);
    let added = true;
    while (added) {
      added = false;
      categories.forEach((c) => {
        if (c.parent_id && descendants.has(c.parent_id) && !descendants.has(c.id)) {
          descendants.add(c.id);
          added = true;
        }
      });
    }
    return hierarchicalCategories.filter((c) => !descendants.has(c.id));
  }, [hierarchicalCategories, quickEditId, categories]);

  // Filtered and Sorted Categories for Table
  const filteredCategories = useMemo(() => {
    let baseList = [...categories];

    // Status Tab Filter
    if (statusTab === 'parents') {
      baseList = baseList.filter((c) => !c.parent_id);
    } else if (statusTab === 'subcategories') {
      baseList = baseList.filter((c) => Boolean(c.parent_id));
    } else if (statusTab === 'bg_removal') {
      baseList = baseList.filter((c) => c.bg_removal_enabled === 1);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      baseList = baseList.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q))
      );
      // When searching, sort matching items directly
      baseList.sort((a, b) => a.name.localeCompare(b.name));
      return baseList.map((c) => ({ ...c, level: 0, hierarchyName: c.name }));
    }

    // If sorting by display_order (default), use hierarchical tree ordering!
    if (sortField === 'display_order' && statusTab === 'all') {
      const tree = getCategoryHierarchy(baseList);
      if (sortOrder === 'desc') tree.reverse();
      return tree;
    }

    // Otherwise standard sorting
    const result: CategoryWithHierarchy[] = baseList.map((c) => {
      const treeItem = hierarchicalCategories.find((h) => h.id === c.id);
      return {
        ...c,
        level: treeItem?.level || 0,
        hierarchyName: treeItem?.hierarchyName || c.name,
      };
    });

    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'name') {
        valA = (valA || '').toLowerCase();
        valB = (valB || '').toLowerCase();
      } else {
        valA = Number(valA || 0);
        valB = Number(valB || 0);
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [categories, statusTab, searchQuery, sortField, sortOrder, hierarchicalCategories]);

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      all: categories.length,
      parents: categories.filter((c) => !c.parent_id).length,
      subcategories: categories.filter((c) => Boolean(c.parent_id)).length,
      bg_removal: categories.filter((c) => c.bg_removal_enabled === 1).length,
    };
  }, [categories]);

  // Checkbox selection
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCategories.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCategories.map((c) => c.id));
    }
  };

  const toggleSelectRow = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Bulk actions
  const handleApplyBulkAction = async () => {
    if (!bulkAction || selectedIds.length === 0) return;

    if (bulkAction === 'delete') {
      if (!confirm(`Are you sure you want to delete ${selectedIds.length} categories? Products and sub-categories will be unlinked safely.`)) {
        return;
      }
      setLoading(true);
      try {
        await bulkDeleteAdminCategories(selectedIds);
        showToast(`${selectedIds.length} categories deleted successfully`);
        setSelectedIds([]);
        setBulkAction('');
        loadCategories();
      } catch (err) {
        showToast('Failed to delete categories', 'error');
        setLoading(false);
      }
    } else if (bulkAction === 'enable_bg') {
      setLoading(true);
      for (const id of selectedIds) {
        await updateCategoryBgRemoval(id, true);
      }
      showToast(`AI BG Removal enabled for ${selectedIds.length} categories`);
      setSelectedIds([]);
      setBulkAction('');
      loadCategories();
    } else if (bulkAction === 'disable_bg') {
      setLoading(true);
      for (const id of selectedIds) {
        await updateCategoryBgRemoval(id, false);
      }
      showToast(`AI BG Removal disabled for ${selectedIds.length} categories`);
      setSelectedIds([]);
      setBulkAction('');
      loadCategories();
    }
  };

  // Inline BG Removal toggle
  const handleToggleBgRemoval = async (cat: Category) => {
    const newVal = cat.bg_removal_enabled === 1 ? false : true;
    setCategories((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, bg_removal_enabled: newVal ? 1 : 0 } : c))
    );
    try {
      await updateCategoryBgRemoval(cat.id, newVal);
      showToast(`BG Removal ${newVal ? 'enabled' : 'disabled'} for "${cat.name}"`);
    } catch (err) {
      showToast('Failed to update toggle', 'error');
      loadCategories();
    }
  };

  // Modal open
  const openModal = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat);
      setName(cat.name);
      setSlug(cat.slug);
      setParentId(cat.parent_id ?? null);
      setImageUrl(cat.image_url || '');
      setDescription(cat.description || '');
      setDisplayOrder(String(cat.display_order || 0));
      setBgRemovalEnabled(cat.bg_removal_enabled === 1);
    } else {
      setEditingCategory(null);
      setName('');
      setSlug('');
      setParentId(null); // By default: None (Parent Category)
      setImageUrl('');
      setDescription('');
      setDisplayOrder(String(categories.length + 1));
      setBgRemovalEnabled(false);
    }
    setModalOpen(true);
  };

  // Quick edit inline
  const startQuickEdit = (cat: Category) => {
    setQuickEditId(cat.id);
    setQuickName(cat.name);
    setQuickSlug(cat.slug);
    setQuickParentId(cat.parent_id ?? null);
    setQuickOrder(String(cat.display_order || 0));
    setQuickBgRemoval(cat.bg_removal_enabled === 1);
  };

  const saveQuickEdit = async (cat: Category) => {
    try {
      await updateAdminCategory(cat.id, {
        name: quickName.trim(),
        slug: quickSlug.trim(),
        parent_id: quickParentId,
        display_order: parseInt(quickOrder) || 0,
        bg_removal_enabled: quickBgRemoval ? 1 : 0,
      });
      showToast(`Category "${quickName}" updated`);
      setQuickEditId(null);
      loadCategories();
    } catch (err) {
      showToast('Failed to update category', 'error');
    }
  };

  // Save Modal
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        parent_id: parentId,
        image_url: imageUrl.trim(),
        description: description.trim(),
        display_order: parseInt(displayOrder) || 0,
        bg_removal_enabled: bgRemovalEnabled ? 1 : 0,
      };

      if (editingCategory) {
        await updateAdminCategory(editingCategory.id, payload);
        showToast(`Category "${name}" updated successfully`);
      } else {
        await createAdminCategory(payload);
        showToast(`Category "${name}" created successfully`);
      }

      setModalOpen(false);
      loadCategories();
    } catch (err) {
      showToast('Failed to save category', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete Category
  const confirmDelete = (cat: Category) => {
    setDeleteConfirmCat(cat);
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteConfirmCat) return;
    setDeleting(true);
    try {
      await deleteAdminCategory(deleteConfirmCat.id);
      showToast(`Category "${deleteConfirmCat.name}" deleted successfully`);
      setDeleteConfirmCat(null);
      loadCategories();
    } catch (err) {
      showToast('Failed to delete category', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Slug', 'Parent Category', 'Level', 'Display Order', 'Products Count', 'BG Removal Enabled', 'Description', 'Image URL'];
    const rows = filteredCategories.map((c) => [
      c.id,
      `"${c.name.replace(/"/g, '""')}"`,
      c.slug,
      `"${(c.parent_name || 'None (Parent)').replace(/"/g, '""')}"`,
      c.level || 0,
      c.display_order,
      c.product_count || 0,
      c.bg_removal_enabled === 1 ? 'Yes' : 'No',
      `"${(c.description || '').replace(/"/g, '""')}"`,
      `"${(c.image_url || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ebanzo-categories-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Categories CSV exported');
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Product Categories</span>
            <span className="rounded-full bg-stone-800 px-2.5 py-0.5 text-xs font-bold text-stone-400">
              {categories.length}
            </span>
          </h1>

          <button
            onClick={() => openModal()}
            className="flex items-center gap-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all active:scale-95"
          >
            <Plus className="h-3.5 w-3.5 stroke-[3]" />
            <span>Add Category</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-stone-800 bg-stone-900 px-3 py-2 text-xs font-semibold text-stone-300 hover:bg-stone-800 hover:text-white transition-colors"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-stone-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={loadCategories}
            className="rounded-lg border border-stone-800 bg-stone-900 p-2 text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            title="Reload Categories"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-primary-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`rounded-lg border px-3.5 py-2.5 text-xs flex items-center gap-2 transition-all ${toastMessage.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
            }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-400" />
          )}
          <span className="font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* WooCommerce subsubsub Status Tabs */}
      <div className="flex items-center gap-2 text-xs border-b border-stone-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setStatusTab('all')}
          className={`px-2.5 py-1 rounded transition-colors font-medium ${statusTab === 'all'
              ? 'text-primary-400 font-bold bg-primary-950/30'
              : 'text-stone-400 hover:text-stone-200'
            }`}
        >
          All <span className="text-stone-500">({counts.all})</span>
        </button>
        <span className="text-stone-700">|</span>
        <button
          onClick={() => setStatusTab('parents')}
          className={`px-2.5 py-1 rounded transition-colors font-medium ${statusTab === 'parents'
              ? 'text-primary-400 font-bold bg-primary-950/30'
              : 'text-stone-400 hover:text-stone-200'
            }`}
        >
          Parent Categories <span className="text-stone-500">({counts.parents})</span>
        </button>
        <span className="text-stone-700">|</span>
        <button
          onClick={() => setStatusTab('subcategories')}
          className={`px-2.5 py-1 rounded transition-colors font-medium ${statusTab === 'subcategories'
              ? 'text-amber-400 font-bold bg-amber-950/30'
              : 'text-stone-400 hover:text-stone-200'
            }`}
        >
          Sub-Categories <span className="text-stone-500">({counts.subcategories})</span>
        </button>
        <span className="text-stone-700">|</span>
        <button
          onClick={() => setStatusTab('bg_removal')}
          className={`px-2.5 py-1 rounded transition-colors font-medium flex items-center gap-1 ${statusTab === 'bg_removal'
              ? 'text-violet-400 font-bold bg-violet-950/30'
              : 'text-stone-400 hover:text-stone-200'
            }`}
        >
          <Wand2 className="h-3 w-3 text-violet-400" />
          <span>BG Removal Enabled</span> <span className="text-stone-500">({counts.bg_removal})</span>
        </button>
      </div>

      {/* Bulk Actions & Search Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Left: Bulk Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="rounded-md border border-stone-700 bg-stone-900 px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-primary-500"
          >
            <option value="">Bulk actions</option>
            <option value="delete">Delete Selected</option>
            <option value="enable_bg">Enable Auto BG Removal</option>
            <option value="disable_bg">Disable Auto BG Removal</option>
          </select>

          <button
            onClick={handleApplyBulkAction}
            disabled={!bulkAction || selectedIds.length === 0}
            className="rounded-md border border-stone-700 bg-stone-800 px-3 py-1.5 text-xs font-semibold text-stone-200 hover:bg-stone-700 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            Apply
          </button>

          {selectedIds.length > 0 && (
            <span className="text-xs text-stone-400 font-semibold ml-1">
              {selectedIds.length} item{selectedIds.length > 1 ? 's' : ''} selected
            </span>
          )}
        </div>

        {/* Right: Search Box */}
        <div className="relative min-w-[240px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories..."
            className="w-full rounded-md border border-stone-700 bg-stone-900 pl-8 pr-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-primary-500"
          />
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-stone-400" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2 text-stone-500 hover:text-stone-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Categories Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-stone-800 bg-stone-900/30">
          <RefreshCw className="h-6 w-6 text-primary-400 animate-spin" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-800 bg-stone-900/20 p-12 text-center text-stone-400 text-xs">
          <Layers className="mx-auto h-8 w-8 text-stone-600 mb-2" />
          <p className="font-semibold text-stone-300">No categories found</p>
          <p className="text-stone-500 mt-1">Try changing your search query or add a new category.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-800 bg-stone-900/60 shadow-md">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-[#121318] border-b border-stone-800 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
              <tr>
                <th scope="col" className="p-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredCategories.length && filteredCategories.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-stone-700 bg-stone-800 text-primary-600 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th scope="col" className="py-3 px-2 w-14">Image</th>
                <th scope="col" className="py-3 px-3">
                  <button
                    onClick={() => { setSortField('name'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    <span>Name</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th scope="col" className="py-3 px-3">Description</th>
                <th scope="col" className="py-3 px-3 w-36 text-center">
                  <span className="flex items-center justify-center gap-1">
                    <Wand2 className="h-3 w-3 text-violet-400" /> Auto BG Removal
                  </span>
                </th>
                <th scope="col" className="py-3 px-2 w-28 text-center">
                  <button
                    onClick={() => { setSortField('product_count'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                    className="flex items-center justify-center gap-1 hover:text-white mx-auto"
                  >
                    <span>Products</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th scope="col" className="py-3 px-2 w-24 text-center">
                  <button
                    onClick={() => { setSortField('display_order'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                    className="flex items-center justify-center gap-1 hover:text-white mx-auto"
                  >
                    <span>Order</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 font-medium">
              {filteredCategories.map((cat) => {
                const isSelected = selectedIds.includes(cat.id);
                const isQuickEditing = quickEditId === cat.id;

                if (isQuickEditing) {
                  return (
                    <tr key={`quick-${cat.id}`} className="bg-stone-950/90 border-y-2 border-primary-500/40">
                      <td colSpan={7} className="p-4 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                          <span className="font-bold text-primary-400 flex items-center gap-1.5">
                            <Sliders className="h-4 w-4" /> QUICK EDIT — {cat.name}
                          </span>
                          <span className="text-[10px] text-stone-500 font-mono">ID: {cat.id}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                          <div>
                            <label className="block text-stone-400 font-semibold mb-1">Name</label>
                            <input
                              type="text"
                              value={quickName}
                              onChange={(e) => setQuickName(e.target.value)}
                              className="w-full rounded-md border border-stone-700 bg-stone-900 px-2.5 py-1.5 text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-stone-400 font-semibold mb-1">Slug</label>
                            <input
                              type="text"
                              value={quickSlug}
                              onChange={(e) => setQuickSlug(e.target.value)}
                              className="w-full rounded-md border border-stone-700 bg-stone-900 px-2.5 py-1.5 text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-stone-400 font-semibold mb-1">Parent Category</label>
                            <select
                              value={quickParentId === null ? '' : String(quickParentId)}
                              onChange={(e) => setQuickParentId(e.target.value ? parseInt(e.target.value) : null)}
                              className="w-full rounded-md border border-stone-700 bg-stone-900 px-2.5 py-1.5 text-white text-xs"
                            >
                              <option value="">— None (Parent) —</option>
                              {availableQuickParentOptions.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.hierarchyName}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-stone-400 font-semibold mb-1">Display Order</label>
                            <input
                              type="number"
                              value={quickOrder}
                              onChange={(e) => setQuickOrder(e.target.value)}
                              className="w-full rounded-md border border-stone-700 bg-stone-900 px-2.5 py-1.5 text-white"
                            />
                          </div>

                          <div className="flex items-center pt-5">
                            <label className="flex items-center gap-2 cursor-pointer text-xs">
                              <input
                                type="checkbox"
                                checked={quickBgRemoval}
                                onChange={(e) => setQuickBgRemoval(e.target.checked)}
                                className="rounded text-violet-600 focus:ring-0"
                              />
                              <span className="text-violet-300 font-bold flex items-center gap-1">
                                <Wand2 className="h-3 w-3" /> Auto BG Removal
                              </span>
                            </label>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800/60">
                          <button
                            type="button"
                            onClick={() => setQuickEditId(null)}
                            className="rounded-md border border-stone-700 px-3 py-1 text-xs text-stone-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => saveQuickEdit(cat)}
                            className="rounded-md bg-primary-600 px-4 py-1 text-xs font-bold text-white hover:bg-primary-500"
                          >
                            Update
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                const level = cat.level || 0;

                return (
                  <tr
                    key={cat.id}
                    className={`group transition-colors ${isSelected ? 'bg-primary-950/20' : 'hover:bg-stone-800/40'
                      }`}
                  >
                    {/* Checkbox */}
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(cat.id)}
                        className="rounded border-stone-700 bg-stone-800 text-primary-600 focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* Image Thumbnail */}
                    <td className="py-2.5 px-2">
                      <div className="relative h-11 w-11 rounded-lg overflow-hidden border border-stone-700 bg-stone-950 flex-shrink-0 flex items-center justify-center">
                        {cat.image_url ? (
                          <img
                            src={cat.image_url}
                            alt={cat.name}
                            className="h-full w-full object-contain p-1"
                          />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-stone-600" />
                        )}
                      </div>
                    </td>

                    {/* Name + Hierarchy Indentation + WooCommerce Classic Hover Actions */}
                    <td className="py-2.5 px-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          {/* Indentation for Sub & Sub-sub categories */}
                          {level > 0 && (
                            <span className="text-stone-500 font-mono select-none font-bold">
                              {'— '.repeat(level)}
                            </span>
                          )}

                          <span
                            onClick={() => openModal(cat)}
                            className={`font-bold hover:text-primary-400 cursor-pointer text-xs ${level === 0 ? 'text-white' : level === 1 ? 'text-stone-200' : 'text-stone-300'
                              }`}
                          >
                            {cat.name}
                          </span>

                          {level > 0 && (
                            <span className="rounded bg-stone-800 border border-stone-700/60 px-1.5 py-0.2 text-[9px] font-semibold text-stone-400">
                              {level === 1 ? 'Sub' : 'Sub-sub'}
                            </span>
                          )}
                        </div>

                        {/* WooCommerce Classic Row Action Links on Hover */}
                        <div className="flex items-center gap-2 text-[11px] text-stone-500 opacity-90 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openModal(cat)}
                            className="text-primary-400 hover:text-primary-300 hover:underline font-semibold"
                          >
                            Edit
                          </button>
                          <span>|</span>
                          <button
                            onClick={() => startQuickEdit(cat)}
                            className="text-stone-400 hover:text-stone-200 hover:underline"
                          >
                            Quick Edit
                          </button>
                          <span>|</span>
                          <button
                            onClick={() => confirmDelete(cat)}
                            className="text-rose-400 hover:text-rose-300 hover:underline"
                          >
                            Trash
                          </button>
                          <span>|</span>
                          <Link
                            href={`/shop?category=${cat.slug}`}
                            target="_blank"
                            className="text-stone-400 hover:text-stone-200 hover:underline flex items-center gap-0.5"
                          >
                            View Store <ExternalLink className="h-2.5 w-2.5" />
                          </Link>
                        </div>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="py-2.5 px-3 text-stone-400">
                      <p className="line-clamp-2 text-xs leading-relaxed max-w-sm">
                        {cat.description || <span className="text-stone-600 italic">—</span>}
                      </p>
                    </td>

                    {/* Auto BG Removal Toggle */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleToggleBgRemoval(cat)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${cat.bg_removal_enabled === 1 ? 'bg-violet-600' : 'bg-stone-700'
                            }`}
                          title={cat.bg_removal_enabled === 1 ? 'Disable AI BG Removal' : 'Enable AI BG Removal'}
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${cat.bg_removal_enabled === 1 ? 'translate-x-4' : 'translate-x-0'
                              }`}
                          />
                        </button>
                      </div>
                    </td>

                    {/* Products Count */}
                    <td className="py-2.5 px-2 text-center">
                      <Link
                        href={`/admin/products?category=${cat.slug}`}
                        className="inline-flex items-center gap-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-200 px-2.5 py-0.5 text-[11px] font-bold transition-colors"
                        title="View products in this category"
                      >
                        <Package className="h-3 w-3 text-stone-400" />
                        <span>{cat.product_count || 0}</span>
                      </Link>
                    </td>

                    {/* Display Order */}
                    <td className="py-2.5 px-2 text-center font-mono text-stone-400">
                      {cat.display_order ?? 0}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── CREATE / EDIT CATEGORY MODAL ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-stone-800 bg-[#121318] p-6 text-stone-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary-400" />
                <h3 className="text-base font-bold text-white">
                  {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add New Product Category'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-300 mb-1">
                  Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingCategory) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                    }
                  }}
                  placeholder="e.g. Acrylic Wall Clocks"
                  className="w-full rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-white placeholder-stone-500 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-300 mb-1">
                  Slug (URL Key)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. acrylic-wall-clocks"
                  className="w-full rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-white font-mono placeholder-stone-500 focus:outline-none focus:border-primary-500"
                />
                <span className="text-[10px] text-stone-500 mt-1 block">
                  The “slug” is the URL-friendly version of the name. It is usually all lowercase and contains only letters, numbers, and hyphens.
                </span>
              </div>

              {/* Parent Category Dropdown (Hierarchical) */}
              <div>
                <label className="block font-bold text-stone-300 mb-1">
                  Parent Category
                </label>
                <select
                  value={parentId === null ? '' : String(parentId)}
                  onChange={(e) => setParentId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-white focus:outline-none focus:border-primary-500 text-xs"
                >
                  <option value="">— None (Parent Category) —</option>
                  {availableParentOptions.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.hierarchyName}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-stone-500 mt-1 block">
                  Select a parent to create a sub-category or sub-sub-category. Leave as "None" if this is a top-level parent category.
                </span>
              </div>

              {/* Image Upload & URL Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-stone-300">
                    Category Thumbnail / Frame Silhouette
                  </label>
                  {imageUrl && (
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Image Selected
                    </span>
                  )}
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {/* Image Preview & Upload Container */}
                <div className="rounded-xl border border-stone-700 bg-stone-900/80 p-3 space-y-3">
                  {imageUrl ? (
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-14 rounded-lg overflow-hidden border border-stone-600 bg-stone-950 flex-shrink-0 flex items-center justify-center">
                        <img
                          src={imageUrl}
                          alt="Category preview"
                          className="h-full w-full object-contain p-1"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-mono text-stone-300 truncate">
                          {imageUrl}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingImage}
                            className="flex items-center gap-1 text-[11px] font-bold text-primary-400 hover:text-primary-300 hover:underline"
                          >
                            {uploadingImage ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Upload className="h-3 w-3" />
                            )}
                            <span>Change Image</span>
                          </button>
                          <span className="text-stone-600">•</span>
                          <button
                            type="button"
                            onClick={() => setImageUrl('')}
                            className="text-[11px] font-bold text-rose-400 hover:text-rose-300 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Upload Dropzone / Button */
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center p-4 border border-dashed border-stone-700 rounded-lg hover:border-primary-500 hover:bg-stone-800/50 cursor-pointer transition-all group"
                    >
                      {uploadingImage ? (
                        <div className="flex flex-col items-center py-2 text-primary-400">
                          <Loader2 className="h-6 w-6 animate-spin mb-1" />
                          <span className="text-[11px] font-semibold">Uploading to server…</span>
                        </div>
                      ) : (
                        <>
                          <div className="h-9 w-9 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 group-hover:text-primary-400 group-hover:bg-primary-950/40 mb-1.5 transition-colors">
                            <Upload className="h-4 w-4" />
                          </div>
                          <span className="text-xs font-bold text-stone-200 group-hover:text-white">
                            Click to Upload Image File
                          </span>
                          <span className="text-[10px] text-stone-500 mt-0.5">
                            PNG, JPG, WebP supported
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Or Manual URL Input */}
                  <div className="pt-2 border-t border-stone-800/80">
                    <label className="block text-[10px] font-semibold text-stone-400 mb-1">
                      Or paste an existing image URL / path:
                    </label>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="e.g. /frames/wall-clock/1.png or https://..."
                      className="w-full rounded-md border border-stone-700 bg-stone-950 px-2.5 py-1.5 text-white placeholder-stone-500 text-xs focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of keepsake products in this category..."
                  className="w-full rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-white placeholder-stone-500 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-300 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    className="w-full rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <div className="rounded-lg border border-violet-900/50 bg-violet-950/20 p-2.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bgRemovalEnabled}
                        onChange={(e) => setBgRemovalEnabled(e.target.checked)}
                        className="rounded border-violet-800 text-violet-600 focus:ring-0"
                      />
                      <span className="font-bold text-violet-300 flex items-center gap-1">
                        <Wand2 className="h-3.5 w-3.5 text-violet-400" />
                        Auto BG Removal
                      </span>
                    </label>
                    <span className="text-[10px] text-stone-400 mt-1 block leading-tight">
                      Customer uploads will automatically have backgrounds removed.
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-stone-700 bg-stone-800 px-4 py-2 text-xs font-semibold text-stone-300 hover:bg-stone-700 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 px-5 py-2 text-xs font-bold text-white shadow-md transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  )}
                  <span>{editingCategory ? 'Save Changes' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deleteConfirmCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-stone-800 bg-[#121318] p-6 text-stone-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="rounded-full bg-rose-950/60 p-2.5 border border-rose-800/40">
                <AlertTriangle className="h-6 w-6 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Category</h3>
                <p className="text-xs text-stone-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-white">"{deleteConfirmCat.name}"</span>?
              {deleteConfirmCat.product_count && deleteConfirmCat.product_count > 0 ? (
                <span className="block mt-2 text-amber-300 font-semibold bg-amber-950/40 border border-amber-800/30 rounded-lg p-2">
                  ⚠️ Note: {deleteConfirmCat.product_count} product(s) currently linked to this category will be unassigned safely.
                </span>
              ) : null}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setDeleteConfirmCat(null)}
                className="rounded-lg border border-stone-700 bg-stone-800 px-4 py-2 text-xs font-semibold text-stone-300 hover:bg-stone-700 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirmed}
                disabled={deleting}
                className="flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-bold text-white shadow-md transition-all disabled:opacity-50"
              >
                {deleting ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                <span>Delete Category</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
