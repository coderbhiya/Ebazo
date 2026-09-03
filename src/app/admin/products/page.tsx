'use client';

import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Edit, Trash2, Sparkles, 
  X, Check, AlertCircle, RefreshCw 
} from 'lucide-react';
import { fetchAdminProducts, saveAdminProduct, deleteAdminProduct, AdminProduct } from '@/lib/admin-api';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);

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
    loadProducts();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteAdminProduct(id);
      loadProducts();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
            Catalog Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Product Offerings</h1>
          <p className="text-xs text-stone-400 mt-0.5">Add, edit pricing, and update shapes & photo frames</p>
        </div>

        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-violet-500 shadow-lg shadow-violet-600/30 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-8 w-8 text-violet-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => (
            <div
              key={p.id}
              className="rounded-3xl border border-stone-800 bg-stone-950 p-5 space-y-4 shadow-sm"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-stone-900 border border-stone-800">
                <img src={p.image_url} alt={p.title} className="h-full w-full object-cover" />
                <span className="absolute top-2.5 left-2.5 rounded-full bg-stone-950/80 px-2.5 py-0.5 text-[10px] font-bold text-violet-400 uppercase">
                  {p.category_slug}
                </span>
                <span className="absolute top-2.5 right-2.5 rounded-full bg-emerald-950/80 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                  Stock: {p.stock}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-white text-sm line-clamp-1">{p.title}</h3>
                <p className="text-xs text-stone-400 mt-1 line-clamp-2">{p.short_desc}</p>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-800">
                <div>
                  <span className="font-extrabold text-white text-sm">₹{p.price}</span>
                  <span className="text-stone-500 line-through ml-1.5 text-xs">₹{p.original_price}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal(p)}
                    className="p-2 rounded-lg bg-stone-900 text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
                    title="Edit Product"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 rounded-lg bg-stone-900 text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 transition-colors"
                    title="Delete Product"
                  >
                    <Trash2 className="h-4 w-4" />
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
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-full p-2 text-stone-400 hover:text-white"
              >
                ✕
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
                  className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-300 mb-1">Category Slug</label>
                  <select
                    value={categorySlug}
                    onChange={(e) => setCategorySlug(e.target.value)}
                    className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white"
                  >
                    <option value="fridge-magnet">Fridge Magnet</option>
                    <option value="key-chains">Key Chains</option>
                    <option value="car-hanging">Car Hanging</option>
                    <option value="car-stand">Car Stand</option>
                    <option value="carrycature">Carrycature</option>
                    <option value="mini-gallary">Mini Gallary</option>
                    <option value="photostand">Photostand</option>
                    <option value="wall-clock">Wall Clock</option>
                    <option value="wallet-card">Wallet Card</option>
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
                <label className="block font-bold text-stone-300 mb-1">Supported Shapes (comma-separated)</label>
                <input
                  type="text"
                  value={shapesStr}
                  onChange={(e) => setShapesStr(e.target.value)}
                  placeholder="Round, Heart, Square, Hexagon"
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
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestseller}
                    onChange={(e) => setIsBestseller(e.target.checked)}
                    className="rounded text-violet-600"
                  />
                  <span>Mark as Bestseller</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-violet-600"
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
                  className="rounded-xl bg-violet-600 px-6 py-2 font-bold text-white hover:bg-violet-500 disabled:opacity-60"
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
