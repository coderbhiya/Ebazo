'use client';


import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Package, Edit, Trash2, ExternalLink, 
  Sparkles, Star, Tag, Layers, CheckCircle2, AlertCircle,
  Shapes, Wand2, RefreshCw, Copy, Check, Eye, Clock,
  DollarSign, Box, ShieldCheck, Image as ImageIcon, Sliders
} from 'lucide-react';
import { 
  fetchAdminProductById, 
  saveAdminProduct, 
  deleteAdminProduct, 
  AdminProduct 
} from '@/lib/admin-api';

export default function AdminProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const [copiedSku, setCopiedSku] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadProduct = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const data = await fetchAdminProductById(productId);
      if (data) {
        setProduct(data);
        setActiveImage(data.image_url);
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
    loadProduct();
  }, [productId]);

  const handleCopySku = (sku: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(sku);
      setCopiedSku(true);
      showToast('SKU copied to clipboard');
      setTimeout(() => setCopiedSku(false), 2000);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    if (!confirm(`Are you sure you want to delete "${product.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteAdminProduct(product.id);
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
        <p className="text-sm font-medium">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center text-stone-400">
        <Package className="mx-auto h-12 w-12 text-stone-600 mb-3" />
        <h2 className="text-lg font-bold text-white">Product Not Found</h2>
        <p className="text-xs text-stone-400 mt-1 mb-6">
          The product ID #{productId} could not be located in the catalog.
        </p>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-xs font-bold text-white hover:bg-primary-500 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Product Offerings
        </Link>
      </div>
    );
  }

  const skuCode = `EBZ-${(product.category_slug || 'GFT').toUpperCase().slice(0, 3)}-${String(product.id).padStart(3, '0')}`;
  const discountPercent = product.original_price > product.price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const galleryImages = [
    product.image_url,
    ...(product.gallery || [])
  ].filter(Boolean);

  return (
    <div className="space-y-6 pb-16">
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

      {/* Top Breadcrumbs & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-400 mb-1">
            <Link href="/admin/products" className="hover:text-white flex items-center gap-1 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Product Offerings</span>
            </Link>
            <span className="text-stone-600">/</span>
            <span className="text-stone-300 font-medium truncate max-w-xs">{product.title}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-bold text-white">{product.title}</h1>
            <span className="font-mono text-xs text-stone-400 bg-stone-900 border border-stone-800 px-2 py-0.5 rounded">
              ID #{product.id}
            </span>
            {product.is_bestseller === 1 && (
              <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 text-[10px] font-bold uppercase flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Bestseller
              </span>
            )}
            {product.is_featured === 1 && (
              <span className="rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-2.5 py-0.5 text-[10px] font-bold uppercase flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400" /> Featured
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href={`/product/${product.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 rounded-lg border border-stone-700 bg-stone-800/80 hover:bg-stone-700 px-3.5 py-2 text-xs font-semibold text-stone-200 transition-colors"
          >
            <Eye className="h-3.5 w-3.5 text-primary-400" />
            <span>Storefront View</span>
            <ExternalLink className="h-3 w-3 text-stone-400" />
          </Link>

          <Link
            href={`/admin/products/${product.id}/edit`}
            className="flex items-center gap-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 px-4 py-2 text-xs font-bold text-white shadow-md transition-all"
          >
            <Edit className="h-3.5 w-3.5" />
            <span>Edit Product</span>
          </Link>

          <button
            onClick={handleDelete}
            className="rounded-lg border border-rose-900/50 p-2 text-rose-400 hover:bg-rose-950/40 hover:border-rose-800 transition-colors"
            title="Delete Product"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left (Media & Gallery) + Right (Specs & Details) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Product Image & Media Gallery */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Showcase Image */}
          <div className="rounded-2xl border border-stone-800 bg-[#121318] p-4 text-center">
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-stone-950 border border-stone-800/80 flex items-center justify-center group shadow-inner">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.title}
                  className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <ImageIcon className="h-16 w-16 text-stone-700" />
              )}
            </div>

            {/* Gallery Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4 overflow-x-auto scrollbar-none">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`relative h-14 w-14 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      activeImage === img
                        ? 'border-primary-500 ring-2 ring-primary-500/20'
                        : 'border-stone-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Gallery ${idx + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SKU & Identifier Card */}
          <div className="rounded-xl border border-stone-800 bg-[#121318] p-4 space-y-3 text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-amber-400" /> Product Identifiers
            </span>

            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg bg-stone-900/80 border border-stone-800 p-2.5">
                <span className="text-stone-400 font-semibold">SKU Code:</span>
                <div className="flex items-center gap-1.5 font-mono text-amber-300 font-bold">
                  <span>{skuCode}</span>
                  <button
                    type="button"
                    onClick={() => handleCopySku(skuCode)}
                    className="p-1 rounded hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
                    title="Copy SKU"
                  >
                    {copiedSku ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-stone-900/80 border border-stone-800 p-2.5">
                <span className="text-stone-400 font-semibold">Storefront Slug:</span>
                <span className="font-mono text-stone-300">{product.slug}</span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-stone-900/80 border border-stone-800 p-2.5">
                <span className="text-stone-400 font-semibold">Date Added:</span>
                <span className="text-stone-300 font-mono">
                  {product.created_at ? product.created_at.split(' ')[0] : '2026-09-08'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Product Specifications, Shapes, Pricing & Inventory */}
        <div className="lg:col-span-7 space-y-4 text-xs">
          {/* Pricing & Stock Card */}
          <div className="rounded-2xl border border-stone-800 bg-[#121318] p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Selling Price */}
              <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-3.5 space-y-1">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" /> Selling Price
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">₹{product.price}</span>
                  {product.original_price > product.price && (
                    <span className="text-xs text-stone-500 line-through">₹{product.original_price}</span>
                  )}
                </div>
                {discountPercent > 0 && (
                  <span className="inline-block text-[10px] font-bold text-emerald-400">
                    {discountPercent}% OFF customer discount
                  </span>
                )}
              </div>

              {/* Stock Inventory */}
              <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-3.5 space-y-1">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                  <Box className="h-3.5 w-3.5 text-blue-400" /> Stock Level
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">{product.stock}</span>
                  <span className="text-xs text-stone-400">units in stock</span>
                </div>
                <div>
                  {product.stock === 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 px-2 py-0.5 text-[10px] font-bold">
                      Out of Stock
                    </span>
                  ) : product.stock <= 15 ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 px-2 py-0.5 text-[10px] font-bold">
                      Low Stock Alert
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                      In Stock & Ready to Ship
                    </span>
                  )}
                </div>
              </div>

              {/* Category */}
              <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-3.5 space-y-1 sm:col-span-2 md:col-span-1">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5 text-primary-400" /> Category
                </span>
                <p className="text-base font-bold text-white capitalize">
                  {product.category_slug.replace(/-/g, ' ')}
                </p>
                <Link
                  href={`/admin/products?category=${product.category_slug}`}
                  className="inline-block text-[11px] text-primary-400 hover:underline font-semibold"
                >
                  Filter all in category →
                </Link>
              </div>
            </div>
          </div>

          {/* TAGS / SHAPES CARD (Full View) */}
          <div className="rounded-2xl border border-stone-800 bg-[#121318] p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-2">
                <Shapes className="h-4 w-4 text-amber-400" />
                Tags & Cutout Shapes
              </span>
              <span className="rounded bg-stone-800 px-2 py-0.5 text-[10px] font-bold text-stone-400">
                {(product.shapes || []).length} Shape Options
              </span>
            </div>

            {product.shapes && product.shapes.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {product.shapes.map((shape, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-lg border border-stone-700 bg-stone-900/90 px-3 py-2 text-xs text-stone-200 font-semibold shadow-sm hover:border-amber-500/50 transition-colors"
                  >
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <span>{shape}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-stone-800 p-4 text-center text-stone-500">
                No specific shape variants assigned to this product. Default silhouette will be used.
              </div>
            )}
          </div>

          {/* Physical Specifications Card */}
          <div className="rounded-2xl border border-stone-800 bg-[#121318] p-5 space-y-3">
            <div className="border-b border-stone-800 pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Physical & Manufacturing Specifications
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="rounded-lg bg-stone-900/70 border border-stone-800 p-3 space-y-1">
                <span className="text-[11px] text-stone-400 font-semibold block">Material Formulation</span>
                <p className="font-bold text-white text-xs">{product.material || '3mm Cast Acrylic + UV Print'}</p>
              </div>

              <div className="rounded-lg bg-stone-900/70 border border-stone-800 p-3 space-y-1">
                <span className="text-[11px] text-stone-400 font-semibold block">Dimensions</span>
                <p className="font-bold text-white text-xs">{product.dimensions || '3.5 x 3.5 inches'}</p>
              </div>

              <div className="rounded-lg bg-stone-900/70 border border-stone-800 p-3 space-y-1">
                <span className="text-[11px] text-stone-400 font-semibold block">Personalization Type</span>
                <p className="font-bold text-violet-300 text-xs flex items-center gap-1.5">
                  <Wand2 className="h-3.5 w-3.5 text-violet-400" />
                  Custom Photo Upload & Frame Cutout
                </p>
              </div>

              <div className="rounded-lg bg-stone-900/70 border border-stone-800 p-3 space-y-1">
                <span className="text-[11px] text-stone-400 font-semibold block">Laser Cutting Technology</span>
                <p className="font-bold text-white text-xs">High-Precision CO2 Laser Contour</p>
              </div>
            </div>
          </div>

          {/* Descriptions Card */}
          <div className="rounded-2xl border border-stone-800 bg-[#121318] p-5 space-y-4">
            {/* Short Description */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Short Summary</span>
              <div className="rounded-lg bg-stone-900/70 border border-stone-800 p-3 text-stone-300 leading-relaxed">
                {product.short_desc || <span className="text-stone-500 italic">No short summary provided.</span>}
              </div>
            </div>

            {/* Full Description */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Detailed Description</span>
              <div className="rounded-lg bg-stone-900/70 border border-stone-800 p-3.5 text-stone-300 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-line">
                {product.description || <span className="text-stone-500 italic">No full description provided.</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}