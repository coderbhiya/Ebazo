'use client';

import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Edit, Trash2, Sparkles, 
  X, Check, AlertCircle, RefreshCw, Search,
  Eye, CheckCircle2, Tag, Layers
} from 'lucide-react';
import { fetchAdminProducts, saveAdminProduct, deleteAdminProduct, AdminProduct } from '@/lib/admin-api';

const CATEGORIES = [
  { slug: 'fridge-magnet', name: 'Fridge Magnet' },
  { slug: 'key-chains', name: 'Key Chains' },
  { slug: 'car-hanging', name: 'Car Hanging' },
  { slug: 'car-stand', name: 'Car Stand' },
  { slug: 'carrycature', name: 'Carrycature' },
  { slug: 'mini-gallary', name: 'Mini Gallary' },
  { slug: 'photostand', name: 'Photostand' },
  { slug: 'wall-clock', name: 'Wall Clock' },
  { slug: 'wallet-card', name: 'Wallet Card' },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [categorySlug, setCategorySlug] = useState('fridge-magnet');
  const [price, setPrice] = useState('199');
  const [originalPrice, setOriginalPrice] = useState('299');
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('3mm Cast Acrylic + UV Print');
  const [dimensions, setDimensions] = useState('3.5 x 3.5 inches');
  const [shapesStr, setShapesStr] = useState('Round, Square, Heart');
  const [imageUrl, setImageUrl] = useState('');
  const [isBestseller, setIsBestseller] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [stock, setStock] = useState('100');
  const [saving, setSaving] = useState(false);

  const loadProducts = () => {
    setLoading(true);
    fetchAdminProducts().then((res) => {
      setProducts(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openModal = (product?: AdminProduct) => {
    if (product) {
      setEditingProduct(product);
      setTitle(product.title);
      setCategorySlug(product.category_slug);
      setPrice(String(product.price));
      setOriginalPrice(String(product.original_price));
      setShortDesc(product.short_desc || '');
      setDescription(product.description || '');
      setMaterial(product.material || '');
      setDimensions(product.dimensions || '');
      setShapesStr((product.shapes || []).join(', '));
      setImageUrl(product.image_url || '');
      setIsBestseller(product.is_bestseller === 1);
      setIsFeatured(product.is_featured === 1);
      setStock(String(product.stock || 100));
    } else {
      setEditingProduct(null);
      setTitle('');
      setCategorySlug('fridge-magnet');
      setPrice('199');
      setOriginalPrice('299');
      setShortDesc('');
      setDescription('');
      setMaterial('3mm Cast Acrylic + UV Print');
      setDimensions('3.5 x 3.5 inches');
      setShapesStr('Round, Heart, Square');
      setImageUrl('https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80');
      setIsBestseller(false);
      setIsFeatured(true);
      setStock('100');
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const shapes = shapesStr.split(',').map((s) => s.trim()).filter(Boolean);

    const payload = {
      title,
      category_slug: categorySlug,
      price: parseFloat(price) || 0,
      original_price: parseFloat(originalPrice) || 0,
      short_desc: shortDesc,
      description,
      material,
      dimensions,
      shapes,
      image_url: imageUrl,
      is_bestseller: isBestseller ? 1 : 0,
      is_featured: isFeatured ? 1 : 0,
      stock: parseInt(stock) || 100,
    };

    await saveAdminProduct(payload as any, editingProduct?.id);
    setSaving(false);
    setModalOpen(false);
    setToastMessage(editingProduct ? 'Product updated successfully!' : 'New product created!');
    setTimeout(() => setToastMessage(''), 3000);
    loadProducts();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteAdminProduct(id);
      setToastMessage('Product deleted successfully');
      setTimeout(() => setToastMessage(''), 3000);
      loadProducts();
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = categoryFilter === 'all' || p.category_slug === categoryFilter;
    const matchesSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.category_slug.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-800/60">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-primary-400">
            Catalog Management
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">Product Offerings</h1>
          <p className="text-xs text-stone-400 mt-0.5">Manage pricing, shape variations, dimensions, and specifications</p>
        </div>

        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary-500 shadow-sm transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="rounded-lg bg-emerald-950/40 border border-emerald-500/30 px-3 py-2 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-stone-800/70 bg-stone-900/40 p-3">
        <div className="relative flex-1 sm:max-w-xs">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search product title or slug..."
            className="w-full rounded-lg border border-stone-800 bg-stone-950/70 py-1.5 pl-8 pr-3 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-primary-500"
          />
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-500" />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-stone-800 bg-stone-950/70 px-3 py-1.5 text-xs text-stone-300 font-medium focus:outline-none"
          >
            <option value="all">All Categories ({products.length})</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.slug} value={cat.slug}>{cat.name}</option>
            ))}
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

      {/* Product Cards Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-6 w-6 text-primary-400 animate-spin" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-800 bg-stone-900/20 p-10 text-center text-stone-500 text-xs">
          No products found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-stone-800/70 bg-stone-900/40 p-4 space-y-3 shadow-sm hover:border-stone-700/80 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-stone-950 border border-stone-800/60">
                  <img src={p.image_url} alt={p.title} className="h-full w-full object-cover" />
                  <span className="absolute top-2 left-2 rounded-md bg-stone-950/80 backdrop-blur-sm px-2 py-0.5 text-[9px] font-semibold text-primary-400 uppercase">
                    {p.category_slug}
                  </span>
                  <span className={`absolute top-2 right-2 rounded-md px-2 py-0.5 text-[9px] font-semibold ${
                    p.stock <= 15 ? 'bg-rose-950/90 text-rose-300 border border-rose-500/30' : 'bg-stone-950/80 text-stone-300'
                  }`}>
                    Stock: {p.stock}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    {p.is_bestseller === 1 && (
                      <span className="rounded bg-amber-500/15 text-amber-300 border border-amber-500/25 px-1.5 py-0.2 text-[9px] font-bold uppercase">
                        Bestseller
                      </span>
                    )}
                    {p.is_featured === 1 && (
                      <span className="rounded bg-primary-500/15 text-primary-300 border border-primary-500/25 px-1.5 py-0.2 text-[9px] font-bold uppercase">
                        Featured
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-white text-xs line-clamp-1">{p.title}</h3>
                  <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-2">{p.short_desc || p.description}</p>
                </div>

                {/* Specs */}
                <div className="rounded-lg bg-stone-950/50 p-2 border border-stone-800/60 text-[10px] text-stone-400 space-y-0.5">
                  <p className="truncate"><strong className="text-stone-300">Material:</strong> {p.material || 'Acrylic'}</p>
                  <p className="truncate"><strong className="text-stone-300">Dimensions:</strong> {p.dimensions || 'Standard'}</p>
                  <p className="truncate text-primary-300/90"><strong className="text-stone-300">Shapes:</strong> {(p.shapes || []).join(', ')}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2.5 border-t border-stone-800/60">
                <div>
                  <span className="font-bold text-white text-sm">₹{p.price}</span>
                  <span className="text-stone-500 line-through ml-1 text-xs">₹{p.original_price}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openModal(p)}
                    className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
                    title="Edit Product"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
                    title="Delete Product"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl rounded-3xl border border-stone-800 bg-stone-900 p-6 sm:p-8 shadow-2xl text-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <h3 className="text-lg font-black text-white">
                {editingProduct ? 'Edit Product Offering' : 'Add New Keepsake Product'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-full p-2 text-stone-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 py-4 text-xs">
              <div>
                <label className="block font-bold text-stone-300 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Abstract Wavy Edge Photo Fridge Magnet"
                  className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-300 mb-1">Category</label>
                  <select
                    value={categorySlug}
                    onChange={(e) => setCategorySlug(e.target.value)}
                    className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-300 mb-1">Sale Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-300 mb-1">Original Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-300 mb-1">Image URL *</label>
                  <input
                    type="url"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-300 mb-1">Stock Units</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-300 mb-1">Supported Shapes (comma-separated)</label>
                <input
                  type="text"
                  value={shapesStr}
                  onChange={(e) => setShapesStr(e.target.value)}
                  placeholder="Round, Heart, Square, Arch, Hexagon"
                  className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-300 mb-1">Material Details</label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-300 mb-1">Dimensions</label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-300 mb-1">Short Tagline Description</label>
                <input
                  type="text"
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-300 mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white"
                />
              </div>

              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={isBestseller}
                    onChange={(e) => setIsBestseller(e.target.checked)}
                    className="rounded text-primary-500"
                  />
                  <span>Mark as Bestseller</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-primary-500"
                  />
                  <span>Mark as Featured</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl bg-stone-800 px-4 py-2 text-stone-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-primary-600 px-6 py-2 font-bold text-white hover:bg-primary-500 disabled:opacity-60 shadow-md"
                >
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
