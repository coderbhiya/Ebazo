'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Package, Check, X, Sparkles, Star, 
  Tag, Layers, CheckCircle2, AlertCircle, Shapes, 
  Wand2, RefreshCw, Upload, Image as ImageIcon, ExternalLink,
  DollarSign, Box, ShieldCheck, Trash2, Plus
} from 'lucide-react';
import { 
  fetchAdminProductById, 
  saveAdminProduct, 
  deleteAdminProduct, 
  fetchAdminCategories, 
  AdminProduct 
} from '@/lib/admin-api';
import { Category, uploadCustomPhoto } from '@/lib/api';

const DEFAULT_SHAPES_SUGGESTIONS = [
  'Round', 'Square', 'Heart', 'Hexagon', 'Oval', 
  '1 nos A', '1 nos B', '1 nos c', '1 nos d', '1 nos e'
];

export default function AdminProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [categorySlug, setCategorySlug] = useState('fridge-magnet');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState('100');
  const [sku, setSku] = useState('');
  const [material, setMaterial] = useState('3mm Cast Acrylic + UV Print');
  const [dimensions, setDimensions] = useState('3.5 x 3.5 inches');
  const [shapesList, setShapesList] = useState<string[]>([]);
  const [newShapeInput, setNewShapeInput] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [newGalleryInput, setNewGalleryInput] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const [prodData, catsData] = await Promise.all([
        fetchAdminProductById(productId),
        fetchAdminCategories(),
      ]);

      if (catsData) setCategories(catsData);

      if (prodData) {
        setTitle(prodData.title);
        setSlug(prodData.slug);
        setCategorySlug(prodData.category_slug || 'fridge-magnet');
        setPrice(String(prodData.price));
        setOriginalPrice(String(prodData.original_price || ''));
        setStock(String(prodData.stock));
        setMaterial(prodData.material || '3mm Cast Acrylic + UV Print');
        setDimensions(prodData.dimensions || '3.5 x 3.5 inches');
        setShapesList(prodData.shapes || []);
        setShortDesc(prodData.short_desc || '');
        setDescription(prodData.description || '');
        setImageUrl(prodData.image_url || '');
        setGalleryUrls(prodData.gallery || []);
        setIsFeatured(prodData.is_featured === 1);
        setIsBestseller(prodData.is_bestseller === 1);
      } else {
        showToast('Product not found', 'error');
      }
    } catch (err) {
      showToast('Error loading product details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [productId]);

  const handleAddShape = (shapeToAdd?: string) => {
    const s = (shapeToAdd || newShapeInput).trim();
    if (!s) return;
    if (!shapesList.includes(s)) {
      setShapesList([...shapesList, s]);
    }
    setNewShapeInput('');
  };

  const handleRemoveShape = (indexToRemove: number) => {
    setShapesList(shapesList.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddGalleryUrl = () => {
    const url = newGalleryInput.trim();
    if (!url) return;
    if (!galleryUrls.includes(url)) {
      setGalleryUrls([...galleryUrls, url]);
    }
    setNewGalleryInput('');
  };

  const handleRemoveGallery = (indexToRemove: number) => {
    setGalleryUrls(galleryUrls.filter((_, idx) => idx !== indexToRemove));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadingImage(true);
      try {
        const res = await uploadCustomPhoto(file);
        if (res && res.url) {
          setImageUrl(res.url);
          showToast('Product image uploaded successfully');
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Product title is required', 'error');
      return;
    }
    if (!price || isNaN(parseFloat(price))) {
      showToast('Valid selling price is required', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<AdminProduct> = {
        title: title.trim(),
        slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        category_slug: categorySlug,
        price: parseFloat(price),
        original_price: parseFloat(originalPrice) || parseFloat(price),
        stock: parseInt(stock) || 0,
        material: material.trim(),
        dimensions: dimensions.trim(),
        shapes: shapesList,
        short_desc: shortDesc.trim(),
        description: description.trim(),
        image_url: imageUrl.trim(),
        gallery: galleryUrls,
        is_featured: isFeatured ? 1 : 0,
        is_bestseller: isBestseller ? 1 : 0,
      };

      await saveAdminProduct(payload, parseInt(productId));
      showToast('Product updated successfully!');
      setTimeout(() => {
        router.push(`/admin/products/${productId}`);
      }, 800);
    } catch (err) {
      showToast('Failed to save product changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteAdminProduct(parseInt(productId));
      showToast('Product deleted');
      router.push('/admin/products');
    } catch (err) {
      showToast('Failed to delete product', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3 text-stone-400">
        <RefreshCw className="h-8 w-8 animate-spin text-primary-400" />
        <p className="text-sm font-medium">Loading product editor...</p>
      </div>
    );
  }

  const selectedCatObj = categories.find((c) => c.slug === categorySlug);
  const discountPercent = parseFloat(originalPrice) > parseFloat(price)
    ? Math.round(((parseFloat(originalPrice) - parseFloat(price)) / parseFloat(originalPrice)) * 100)
    : 0;

  return (
    <form onSubmit={handleSave} className="space-y-6 pb-20">
      {/* Toast */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 rounded-lg border px-4 py-3 text-xs flex items-center gap-2 shadow-2xl transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
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

      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4 sticky top-0 bg-[#0a0b0e]/95 backdrop-blur z-20 pt-1">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-400 mb-1">
            <Link href="/admin/products" className="hover:text-white flex items-center gap-1 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Products</span>
            </Link>
            <span className="text-stone-600">/</span>
            <Link href={`/admin/products/${productId}`} className="hover:text-white transition-colors truncate max-w-xs">
              {title || 'Details'}
            </Link>
            <span className="text-stone-600">/</span>
            <span className="text-amber-400 font-semibold">Edit Mode</span>
          </div>

          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-white">Edit Product: {title}</h1>
            <span className="font-mono text-xs text-stone-400 bg-stone-900 border border-stone-800 px-2 py-0.5 rounded">
              ID #{productId}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={`/admin/products/${productId}`}
            className="rounded-lg border border-stone-700 bg-stone-800/80 px-4 py-2 text-xs font-semibold text-stone-300 hover:bg-stone-700 hover:text-white transition-colors"
          >
            Cancel
          </Link>

          <Link
            href={`/product/${slug}`}
            target="_blank"
            className="flex items-center gap-1.5 rounded-lg border border-stone-700 bg-stone-800/80 hover:bg-stone-700 px-3.5 py-2 text-xs font-semibold text-stone-200 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5 text-stone-400" />
            <span className="hidden sm:inline">Storefront</span>
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 px-5 py-2 text-xs font-bold text-white shadow-md transition-all disabled:opacity-50"
          >
            {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5 stroke-[3]" />}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Main Form Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Title, Pricing, Shapes, Specs, Descriptions */}
        <div className="lg:col-span-8 space-y-6">
          {/* General Information Card */}
          <div className="rounded-2xl border border-stone-800 bg-[#121318] p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-stone-800 pb-3">
              <Package className="h-4 w-4 text-primary-400" />
              General Information
            </h3>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1.5">
                Product Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Fridge Magnet Bespoke Frame"
                className="w-full rounded-xl border border-stone-700 bg-stone-900 px-4 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-400 mb-1">
                Permalink / URL Slug
              </label>
              <div className="flex items-center rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-xs text-stone-400">
                <span className="text-stone-500 select-none">/product/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="product-slug"
                  className="w-full bg-transparent text-amber-300 font-mono focus:outline-none pl-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-400 mb-1.5">
                Short Description / Summary
              </label>
              <textarea
                rows={2}
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="Brief single-paragraph summary displayed in product cards and previews..."
                className="w-full rounded-xl border border-stone-700 bg-stone-900 p-3 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-primary-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-400 mb-1.5">
                Full Product Description
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description, features, laser cut craftsmanship, and gifting guide..."
                className="w-full rounded-xl border border-stone-700 bg-stone-900 p-3 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          {/* Pricing & Inventory Card */}
          <div className="rounded-2xl border border-stone-800 bg-[#121318] p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-stone-800 pb-3">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              Pricing & Stock Inventory
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  Selling Price (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-stone-500 text-xs">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-xl border border-stone-700 bg-stone-900 pl-7 pr-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-400 mb-1.5">
                  Original Price / MRP (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-stone-500 text-xs">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full rounded-xl border border-stone-700 bg-stone-900 pl-7 pr-3 py-2 text-sm text-stone-300 focus:outline-none focus:border-primary-500"
                  />
                </div>
                {discountPercent > 0 && (
                  <span className="text-[10px] text-emerald-400 font-bold block mt-1">
                    {discountPercent}% OFF customer discount
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  Stock Units Available
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-primary-500"
                  />
                </div>
                <span className="text-[10px] text-stone-500 block mt-1">
                  {parseInt(stock) === 0 ? 'Marked as Out of Stock' : `${stock} units currently available`}
                </span>
              </div>
            </div>
          </div>

          {/* TAGS & CUTOUT SHAPES CARD (Full Interactive Chip Editor) */}
          <div className="rounded-2xl border border-stone-800 bg-[#121318] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Shapes className="h-4 w-4 text-amber-400" />
                Tags & Cutout Shapes
              </h3>
              <span className="text-[11px] font-semibold text-stone-400 bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
                {shapesList.length} Shape Options
              </span>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed">
              These are the custom cutout shapes or variant tags that customers can choose in the Live Customizer (e.g. 1 nos A, 1 nos B, Round, Square, Heart, etc.).
            </p>

            {/* Existing Shape Chips with Remove Button */}
            <div className="flex flex-wrap gap-2 min-h-[42px] p-3 rounded-xl border border-stone-800 bg-stone-950/70">
              {shapesList.length === 0 ? (
                <span className="text-xs text-stone-600 italic">No shapes added yet. Add one below.</span>
              ) : (
                shapesList.map((shape, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-950/40 text-amber-200 px-3 py-1.5 text-xs font-semibold shadow-sm"
                  >
                    <span>{shape}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveShape(idx)}
                      className="text-amber-400 hover:text-white p-0.5 rounded transition-colors"
                      title="Remove Shape"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Custom Shape Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newShapeInput}
                onChange={(e) => setNewShapeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddShape();
                  }
                }}
                placeholder="Enter shape name (e.g. 1 nos C, Hexagon, Arch)..."
                className="flex-1 rounded-xl border border-stone-700 bg-stone-900 px-3.5 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => handleAddShape()}
                className="flex items-center gap-1 rounded-xl bg-amber-600 hover:bg-amber-500 px-4 py-2 text-xs font-bold text-white transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Shape</span>
              </button>
            </div>

            {/* Quick Suggestions */}
            <div>
              <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider block mb-1.5">
                Quick Suggestions (Click to Add):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {DEFAULT_SHAPES_SUGGESTIONS.filter((s) => !shapesList.includes(s)).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleAddShape(s)}
                    className="rounded-md border border-stone-800 bg-stone-900/90 hover:bg-stone-800 hover:border-stone-700 text-stone-400 hover:text-white px-2.5 py-1 text-[11px] font-medium transition-colors"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Physical Specifications Card */}
          <div className="rounded-2xl border border-stone-800 bg-[#121318] p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-stone-800 pb-3">
              <ShieldCheck className="h-4 w-4 text-violet-400" />
              Physical & Manufacturing Specifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Material Formulation
                </label>
                <input
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="e.g. 3mm Cast Acrylic + UV Print"
                  className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Dimensions
                </label>
                <input
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  placeholder="e.g. 3.5 x 3.5 inches"
                  className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Category, Image Upload, Gallery, Flags */}
        <div className="lg:col-span-4 space-y-6">
          {/* Publish / Action Card */}
          <div className="rounded-2xl border border-stone-800 bg-[#121318] p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-stone-800 pb-3">
              Publish & Flags
            </h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-2.5 rounded-xl border border-stone-800 bg-stone-900/60 cursor-pointer">
                <span className="text-xs font-semibold text-stone-300 flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  Featured Product
                </span>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl border border-stone-800 bg-stone-900/60 cursor-pointer">
                <span className="text-xs font-semibold text-stone-300 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary-400" />
                  Bestseller Badge
                </span>
                <input
                  type="checkbox"
                  checked={isBestseller}
                  onChange={(e) => setIsBestseller(e.target.checked)}
                  className="rounded text-primary-500 focus:ring-0"
                />
              </label>
            </div>

            <div className="pt-2 border-t border-stone-800 flex flex-col gap-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-500 p-2.5 text-xs font-bold text-white shadow-md transition-all disabled:opacity-50"
              >
                {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 stroke-[3]" />}
                <span>{saving ? 'Saving...' : 'Save Product'}</span>
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-rose-900/40 text-rose-400 hover:bg-rose-950/40 p-2 text-xs font-semibold transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Product</span>
              </button>
            </div>
          </div>

          {/* Category Card */}
          <div className="rounded-2xl border border-stone-800 bg-[#121318] p-5 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-stone-800 pb-3">
              <Layers className="h-4 w-4 text-primary-400" />
              Category Assignment
            </h3>

            <div>
              <label className="block text-xs font-semibold text-stone-400 mb-1.5">
                Select Category
              </label>
              <select
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-primary-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedCatObj && (
              <div className="rounded-xl border border-stone-800 bg-stone-900/70 p-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">AI Background Removal:</span>
                  {selectedCatObj.bg_removal_enabled === 1 ? (
                    <span className="text-violet-300 font-bold flex items-center gap-1 text-[10px]">
                      <Wand2 className="h-3 w-3" /> Enabled
                    </span>
                  ) : (
                    <span className="text-stone-500 text-[10px]">Disabled</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Featured Image Card */}
          <div className="rounded-2xl border border-stone-800 bg-[#121318] p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-stone-800 pb-3">
              <ImageIcon className="h-4 w-4 text-amber-400" />
              Featured Image
            </h3>

            {/* Image Preview Box */}
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-stone-950 border border-stone-800 flex items-center justify-center">
              {imageUrl ? (
                <img src={imageUrl} alt={title} className="h-full w-full object-contain p-2" />
              ) : (
                <ImageIcon className="h-12 w-12 text-stone-700" />
              )}
            </div>

            {/* Upload or URL */}
            <div className="space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-stone-700 bg-stone-800 hover:bg-stone-700 py-2 px-3 text-xs font-semibold text-stone-200 transition-colors disabled:opacity-50"
              >
                {uploadingImage ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary-400" />
                ) : (
                  <Upload className="h-3.5 w-3.5 text-primary-400" />
                )}
                <span>{uploadingImage ? 'Uploading Image...' : 'Upload Image File'}</span>
              </button>

              <div className="pt-1">
                <label className="block text-[11px] text-stone-400 mb-1">Or enter image URL:</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Gallery Images Card */}
          <div className="rounded-2xl border border-stone-800 bg-[#121318] p-5 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-stone-800 pb-3">
              Product Gallery
            </h3>

            {galleryUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {galleryUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg border border-stone-800 overflow-hidden group">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveGallery(idx)}
                      className="absolute top-1 right-1 rounded bg-black/80 text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newGalleryInput}
                onChange={(e) => setNewGalleryInput(e.target.value)}
                placeholder="Add gallery image URL..."
                className="flex-1 rounded-xl border border-stone-700 bg-stone-900 px-3 py-1.5 text-xs text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddGalleryUrl}
                className="rounded-xl bg-stone-800 hover:bg-stone-700 px-3 py-1.5 text-xs font-semibold text-stone-300"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
