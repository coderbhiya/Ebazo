'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus, Edit, Trash2, RefreshCw, Search, CheckCircle2, ExternalLink,
  Image as ImageIcon, ArrowUp, ArrowDown, ArrowUpDown, Star, Sparkles, Layers,
} from 'lucide-react';
import { fetchAdminProducts, fetchAdminCategories, deleteAdminProduct, AdminProduct } from '@/lib/admin-api';
import { Category } from '@/lib/api';

type SortKey = 'title' | 'price' | 'stock' | 'id';
type SortState = { key: SortKey; dir: 'asc' | 'desc' };

function SortHeader({
  k, sort, onSort, children, right,
}: { k: SortKey; sort: SortState; onSort: (k: SortKey) => void; children: React.ReactNode; right?: boolean }) {
  return (
    <th className={`px-3 py-3 font-semibold ${right ? 'text-right' : ''}`}>
      <button onClick={() => onSort(k)} className={`inline-flex items-center gap-1 uppercase hover:text-white ${sort.key === k ? 'text-white' : ''}`}>
        {children}
        {sort.key !== k ? (
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        ) : sort.dir === 'asc' ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )}
      </button>
    </th>
  );
}

// WooCommerce-style product list: one row per product, editing happens on the full
// Add/Edit product pages (which also manage attributes & variations).
export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'simple' | 'variable'>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in' | 'low' | 'out'>('all');
  const [sort, setSort] = useState<SortState>({ key: 'id', dir: 'desc' });
  const [toastMessage, setToastMessage] = useState('');

  const loadProducts = () => {
    setLoading(true);
    fetchAdminProducts().then((res) => {
      setProducts(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadProducts();
    fetchAdminCategories().then(setCategories).catch(() => {});
  }, []);

  const handleDelete = async (p: AdminProduct) => {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    await deleteAdminProduct(p.id);
    setToastMessage('Product deleted');
    setTimeout(() => setToastMessage(''), 3000);
    loadProducts();
  };

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'title' ? 'asc' : 'desc' }));

  const isVariable = (p: AdminProduct) => Boolean(p.has_variations);
  const effectivePrice = (p: AdminProduct) => Number(isVariable(p) ? p.min_price : p.price) || 0;

  const q = searchQuery.trim().toLowerCase();
  const rows = products
    .filter((p) => categoryFilter === 'all' || p.category_slug === categoryFilter)
    .filter((p) => typeFilter === 'all' || (typeFilter === 'variable') === isVariable(p))
    .filter((p) =>
      stockFilter === 'all' ? true : stockFilter === 'out' ? p.stock <= 0 : stockFilter === 'low' ? p.stock > 0 && p.stock <= 15 : p.stock > 15
    )
    .filter((p) => !q || p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q) || String(p.id) === q)
    .sort((a, b) => {
      const dir = sort.dir === 'asc' ? 1 : -1;
      if (sort.key === 'title') return a.title.localeCompare(b.title) * dir;
      if (sort.key === 'price') return (effectivePrice(a) - effectivePrice(b)) * dir;
      if (sort.key === 'stock') return (a.stock - b.stock) * dir;
      return (a.id - b.id) * dir;
    });

  const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name || slug;

  const selectCls = 'rounded-lg border border-stone-800 bg-stone-950/70 px-3 py-1.5 text-xs text-stone-300 font-medium focus:outline-none';

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-800/60">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-primary-400">Catalog Management</span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">Products</h1>
          <p className="text-xs text-stone-400 mt-0.5">{products.length} products · pricing, stock, attributes and variations</p>
        </div>

        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary-500 shadow-sm transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add New Product</span>
        </Link>
      </div>

      {toastMessage && (
        <div className="rounded-lg bg-emerald-950/40 border border-emerald-500/30 px-3 py-2 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-xl border border-stone-800/70 bg-stone-900/40 p-3">
        <div className="relative flex-1 lg:max-w-xs">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, slug or ID..."
            className="w-full rounded-lg border border-stone-800 bg-stone-950/70 py-1.5 pl-8 pr-3 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-primary-500"
          />
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-500" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={selectCls}>
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)} className={selectCls}>
            <option value="all">All product types</option>
            <option value="simple">Simple</option>
            <option value="variable">Variable</option>
          </select>
          <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value as typeof stockFilter)} className={selectCls}>
            <option value="all">Any stock status</option>
            <option value="in">In stock</option>
            <option value="low">Low stock (≤15)</option>
            <option value="out">Out of stock</option>
          </select>
          <button
            onClick={loadProducts}
            className="p-1.5 rounded-lg border border-stone-800 bg-stone-950/70 text-stone-400 hover:text-white"
            title="Refresh List"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-primary-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-6 w-6 text-primary-400 animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-800 bg-stone-900/20 p-10 text-center text-stone-500 text-xs">
          No products match the current filters.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-stone-800 bg-stone-950">
            <table className="w-full min-w-[900px] text-left text-xs">
              <thead className="bg-stone-900/80 text-[10px] uppercase tracking-wider text-stone-400">
                <tr>
                  <th className="w-16 min-w-16 px-3 py-3" />
                  <SortHeader k="title" sort={sort} onSort={toggleSort}>Name</SortHeader>
                  <th className="px-3 py-3 font-semibold">Category</th>
                  <th className="px-3 py-3 font-semibold">Type</th>
                  <SortHeader k="stock" sort={sort} onSort={toggleSort}>Stock</SortHeader>
                  <SortHeader k="price" sort={sort} onSort={toggleSort} right>Price</SortHeader>
                  <th className="px-3 py-3 font-semibold">Tags</th>
                  <th className="px-3 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/70">
                {rows.map((p) => (
                  <tr key={p.id} className="align-middle hover:bg-stone-900/50 transition-colors">
                    <td className="px-3 py-2.5">
                      {p.image_url ? (
                        <img src={p.image_url} alt="" className="h-10 w-10 max-w-none rounded-md border border-stone-700 bg-stone-700 object-contain p-0.5" />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-md border border-stone-800 text-stone-700">
                          <ImageIcon className="h-4 w-4" />
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <Link href={`/admin/products/${p.id}/edit`} className="block max-w-[280px] truncate font-semibold text-white hover:text-primary-300">
                        {p.title}
                      </Link>
                      <span className="block text-[10px] text-stone-500">
                        ID {p.id} · /{p.slug}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-stone-300 whitespace-nowrap">{categoryName(p.category_slug)}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {isVariable(p) ? (
                        <span className="inline-flex items-center gap-1 rounded border border-sky-500/30 bg-sky-950/50 px-1.5 py-0.5 text-[10px] font-bold text-sky-300">
                          <Layers className="h-3 w-3" /> Variable
                        </span>
                      ) : (
                        <span className="text-[11px] text-stone-400">Simple</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {p.stock <= 0 ? (
                        <span className="font-bold text-rose-400">Out of stock</span>
                      ) : (
                        <span className={p.stock <= 15 ? 'font-bold text-amber-300' : 'text-emerald-400'}>
                          In stock <span className="text-stone-500">({p.stock})</span>
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right whitespace-nowrap">
                      {isVariable(p) ? (
                        <span className="font-bold text-white">
                          ₹{Number(p.min_price)}
                          {p.max_price !== p.min_price && <> – ₹{Number(p.max_price)}</>}
                        </span>
                      ) : (
                        <>
                          <span className="font-bold text-white">₹{p.price}</span>
                          {Number(p.original_price) > Number(p.price) && (
                            <span className="ml-1 text-[10px] text-stone-500 line-through">₹{p.original_price}</span>
                          )}
                        </>
                      )}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {p.is_featured === 1 && (
                          <span title="Featured" className="rounded bg-amber-500/15 p-1 text-amber-300"><Star className="h-3 w-3 fill-amber-300" /></span>
                        )}
                        {p.is_bestseller === 1 && (
                          <span title="Bestseller" className="rounded bg-primary-500/15 p-1 text-primary-300"><Sparkles className="h-3 w-3" /></span>
                        )}
                        {p.is_featured !== 1 && p.is_bestseller !== 1 && <span className="text-stone-600">—</span>}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="inline-flex items-center gap-1 rounded-lg bg-primary-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-primary-500"
                        >
                          <Edit className="h-3.5 w-3.5" /> Edit
                        </Link>
                        <Link
                          href={`/product/${p.slug}`}
                          target="_blank"
                          className="rounded-lg border border-stone-700 bg-stone-900 p-1.5 text-stone-300 hover:text-white"
                          title="View on store"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(p)}
                          className="rounded-lg border border-stone-700 bg-stone-900 p-1.5 text-rose-400 hover:bg-rose-950/40 hover:text-rose-300"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-stone-500">
            Showing {rows.length} of {products.length} products
          </p>
        </>
      )}
    </div>
  );
}
