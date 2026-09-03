'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Upload, ZoomIn, ZoomOut, RotateCw, Check, 
  Sparkles, Sliders, Image as ImageIcon, Loader2 
} from 'lucide-react';
import { Product, uploadCustomPhoto } from '@/lib/api';
import { useCart } from '@/context/CartContext';

interface Props {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  selectedShape?: string;
}

export default function LiveCustomizerModal({ product, isOpen, onClose, selectedShape: initialShape }: Props) {
  const { addToCart } = useCart();
  const [currentShape, setCurrentShape] = useState(initialShape || product.shapes[0] || 'Default');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [customText, setCustomText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialShape) {
      setCurrentShape(initialShape);
    } else if (product.shapes.length > 0) {
      setCurrentShape(product.shapes[0]);
    }
  }, [initialShape, product]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
      setZoom(1);
      setRotation(0);
      setPosX(0);
      setPosY(0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
    }
  };

  // Shape mask classes based on currentShape
  const getShapeMaskClass = () => {
    const shape = currentShape.toLowerCase();
    if (shape.includes('round') || shape.includes('circle')) {
      return 'rounded-full';
    }
    if (shape.includes('heart')) {
      return 'rounded-[2rem] [clip-path:polygon(50%_15%,65%_0,85%_0,100%_20%,100%_45%,50%_95%,0_45%,0_20%,15%_0,35%_0)]';
    }
    if (shape.includes('hexagon')) {
      return '[clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]';
    }
    if (shape.includes('wavy') || shape.includes('floral')) {
      return 'rounded-[2.5rem] ring-4 ring-amber-300/40';
    }
    return 'rounded-2xl'; // Soft Square / Rectangle default
  };

  const handleSaveAndAdd = async () => {
    setIsUploading(true);
    let uploadedUrl = '';

    if (imageFile) {
      const uploadRes = await uploadCustomPhoto(imageFile);
      if (uploadRes) {
        uploadedUrl = uploadRes.url;
      }
    }

    addToCart({
      productId: product.id,
      title: product.title,
      slug: product.slug,
      price: product.price,
      image: product.image_url,
      shape: currentShape,
      customPhotoUrl: uploadedUrl || imagePreviewUrl || undefined,
      customText: customText.trim() || undefined,
      quantity: 1,
    });

    setIsUploading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-700 text-white shadow-sm">
              <Sparkles className="h-4 w-4 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Ebanzo Live Studio Customizer</h2>
              <p className="text-xs text-stone-500">Preview your photo on laser-cut acrylic before printing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
          {/* Left Canvas Preview */}
          <div className="md:col-span-7 flex flex-col items-center justify-center rounded-2xl border border-stone-200 bg-gradient-to-b from-stone-100 to-stone-50 p-6">
            <div className="relative flex h-72 w-72 sm:h-80 sm:w-80 items-center justify-center">
              {/* Outer Laser Cut Acrylic Simulation Glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-violet-200/50 via-purple-100/30 to-amber-100/50 blur-xl opacity-70 pointer-events-none" />

              {/* The Mask Container */}
              <div 
                className={`relative h-64 w-64 sm:h-72 sm:w-72 overflow-hidden border-4 border-white/90 shadow-2xl bg-stone-200 transition-all duration-300 ${getShapeMaskClass()}`}
              >
                {imagePreviewUrl ? (
                  <div
                    className="h-full w-full"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg) translate(${posX}px, ${posY}px)`,
                      transition: 'transform 0.05s ease-out',
                    }}
                  >
                    <img
                      src={imagePreviewUrl}
                      alt="Uploaded customer preview"
                      className="h-full w-full object-cover pointer-events-none"
                    />
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-full w-full cursor-pointer flex-col items-center justify-center p-6 text-center hover:bg-stone-200/60 transition-colors"
                  >
                    <ImageIcon className="h-12 w-12 text-violet-400 mb-2 animate-pulse" />
                    <span className="text-xs font-bold text-stone-700">Click to Upload Photo</span>
                    <span className="text-[10px] text-stone-500 mt-0.5">High-resolution JPG or PNG</span>
                  </div>
                )}

                {/* Acrylic Gloss Reflection Highlight */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-70" />

                {/* Optional Custom Engraved Text Overlay */}
                {customText && (
                  <div className="absolute bottom-4 inset-x-2 text-center pointer-events-none">
                    <span className="rounded-full bg-stone-900/80 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm shadow">
                      {customText}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <span className="mt-4 text-[11px] font-medium text-stone-500 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
              Simulating 3mm Diamond Polished Cast Acrylic Finish
            </span>
          </div>

          {/* Right Controls */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-5">
            <div>
              {/* Product Info */}
              <div className="mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-violet-600">
                  {product.category_name || 'Custom Gift'}
                </span>
                <h3 className="text-lg font-extrabold text-stone-900">{product.title}</h3>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-base font-black text-violet-800">₹{product.price}</span>
                  <span className="text-xs text-stone-400 line-through">₹{product.original_price}</span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    Save {Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                  </span>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer rounded-2xl border-2 border-dashed p-4 text-center transition-all ${
                  isDragging ? 'border-violet-500 bg-violet-50' : 'border-stone-300 hover:border-violet-400 bg-stone-50/50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
                <Upload className="mx-auto h-6 w-6 text-violet-600 mb-1" />
                <p className="text-xs font-bold text-stone-800">
                  {imageFile ? imageFile.name : 'Select or drag your photo here'}
                </p>
                <p className="text-[10px] text-stone-500">Supports high-res photos up to 25MB</p>
              </div>

              {/* Shape Selectors */}
              {product.shapes && product.shapes.length > 0 && (
                <div className="mt-4">
                  <label className="text-xs font-bold text-stone-700 block mb-1.5">
                    Select Contour Cut Shape:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.shapes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setCurrentShape(s)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                          currentShape === s
                            ? 'bg-violet-700 text-white shadow-sm ring-2 ring-violet-700/20'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Adjustments: Zoom, Rotation, Pan */}
              {imagePreviewUrl && (
                <div className="mt-4 space-y-3 rounded-2xl border border-stone-200 bg-stone-50/60 p-3.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                    <span className="flex items-center gap-1">
                      <Sliders className="h-3.5 w-3.5 text-violet-600" /> Photo Scaling
                    </span>
                    <span>{zoom.toFixed(1)}x</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ZoomOut className="h-4 w-4 text-stone-400" />
                    <input
                      type="range"
                      min="0.8"
                      max="2.5"
                      step="0.05"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="w-full accent-violet-700 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                    />
                    <ZoomIn className="h-4 w-4 text-stone-400" />
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold text-stone-700 pt-1">
                    <span className="flex items-center gap-1">
                      <RotateCw className="h-3.5 w-3.5 text-violet-600" /> Angle Rotation
                    </span>
                    <span>{rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="-90"
                    max="90"
                    step="5"
                    value={rotation}
                    onChange={(e) => setRotation(parseInt(e.target.value))}
                    className="w-full accent-violet-700 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                  />
                </div>
              )}

              {/* Custom Text Inscription */}
              <div className="mt-4">
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Engraved Text / Name (Optional):
                </label>
                <input
                  type="text"
                  maxLength={30}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="e.g., Aakash & Priya • Forever"
                  className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-violet-600"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-stone-200 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-stone-300 py-3 text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isUploading}
                onClick={handleSaveAndAdd}
                className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-700 to-purple-800 py-3 text-xs font-extrabold text-white shadow-lg shadow-violet-700/20 hover:brightness-105 transition-all disabled:opacity-70"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing Photo...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Confirm & Add To Bag (₹{product.price})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
