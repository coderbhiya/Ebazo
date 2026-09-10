'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, Upload, ZoomIn, ZoomOut, RotateCw, Check, 
  Sparkles, Sliders, Image as ImageIcon, Loader2,
  Move, RotateCcw, Type, Eye, RefreshCw, FileText, Wand2
} from 'lucide-react';
import { Product, uploadCustomPhoto, uploadPrintArtwork, CustomizationSettings } from '@/lib/api';
import { useCart } from '@/context/CartContext';

interface Props {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  selectedShape?: string;
}

async function generatePrintArtworkBlob(
  imageSrc: string,
  frameMaskSrc: string,
  zoom: number,
  rotation: number,
  posX: number,
  posY: number,
  previewContainerSize: number,
  customText: string,
  textStyle: 'gold' | 'frosted' | 'dark'
): Promise<string> {
  const canvas = document.createElement('canvas');
  const size = 1200;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. Load customer image and frame mask image
  const [img, maskImg] = await Promise.all([
    new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.crossOrigin = 'anonymous';
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = imageSrc;
    }),
    new Promise<HTMLImageElement | null>((resolve) => {
      if (!frameMaskSrc) return resolve(null);
      const m = new Image();
      m.crossOrigin = 'anonymous';
      m.onload = () => resolve(m);
      m.onerror = () => resolve(null);
      m.src = frameMaskSrc;
    }),
  ]);

  ctx.clearRect(0, 0, size, size);

  if (maskImg) {
    // Fit mask inside 1200x1200 with small margin
    const padding = 30;
    const avail = size - padding * 2;
    const maskAspect = maskImg.width / maskImg.height;
    let maskW = avail;
    let maskH = avail;
    let maskX = padding;
    let maskY = padding;
    if (maskAspect > 1) {
      maskH = avail / maskAspect;
      maskY = padding + (avail - maskH) / 2;
    } else {
      maskW = avail * maskAspect;
      maskX = padding + (avail - maskW) / 2;
    }

    // Step A: Draw frame mask into canvas
    ctx.drawImage(maskImg, maskX, maskY, maskW, maskH);

    // Step B: Mask customer photo directly to frame silhouette
    ctx.globalCompositeOperation = 'source-in';

    // Step C: Draw transformed photo
    ctx.save();
    ctx.translate(size / 2, size / 2);

    const scaleRatio = size / (previewContainerSize || 300);
    ctx.translate(posX * scaleRatio, posY * scaleRatio);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    const imgAspect = img.width / img.height;
    let drawW = size;
    let drawH = size;
    if (imgAspect > 1) {
      drawW = size * imgAspect;
      drawH = size;
    } else {
      drawW = size;
      drawH = size / imgAspect;
    }
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // Step D: Normal composite for gloss, highlights & text
    ctx.globalCompositeOperation = 'source-over';
  } else {
    // Fallback if mask is missing
    ctx.save();
    ctx.translate(size / 2, size / 2);
    const scaleRatio = size / (previewContainerSize || 300);
    ctx.translate(posX * scaleRatio, posY * scaleRatio);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.drawImage(img, -size / 2, -size / 2, size, size);
    ctx.restore();
  }

  // 3. Subtle gloss sheen for 3D acrylic proof
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.0)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0.08)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // 4. Draw engraved text badge if present
  if (customText && customText.trim()) {
    const text = customText.trim();
    ctx.save();
    ctx.font = 'bold 36px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const textMetrics = ctx.measureText(text);
    const badgeW = Math.min(size * 0.85, textMetrics.width + 60);
    const badgeH = 64;
    const badgeX = size / 2 - badgeW / 2;
    const badgeY = size * 0.82;

    ctx.beginPath();
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(badgeX, badgeY, badgeW, badgeH, badgeH / 2);
    } else {
      ctx.rect(badgeX, badgeY, badgeW, badgeH);
    }

    if (textStyle === 'gold') {
      ctx.fillStyle = 'rgba(69, 26, 3, 0.92)';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
      ctx.stroke();
      ctx.fillStyle = '#fef08a';
    } else if (textStyle === 'frosted') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.9)';
      ctx.stroke();
      ctx.fillStyle = '#0f172a';
    } else {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
    }

    ctx.fillText(text, size / 2, badgeY + badgeH / 2);
    ctx.restore();
  }

  return canvas.toDataURL('image/png', 0.95);
}

export default function LiveCustomizerModal({ product, isOpen, onClose, selectedShape: initialShape }: Props) {
  const { addToCart } = useCart();
  const [currentShape, setCurrentShape] = useState(initialShape || product.shapes?.[0] || 'Default');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Customization transforms
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [customText, setCustomText] = useState('');
  const [textStyle, setTextStyle] = useState<'gold' | 'frosted' | 'dark'>('gold');
  const [isUploading, setIsUploading] = useState(false);
  const [isBgRemoving, setIsBgRemoving] = useState(false);
  const bgRemovalEnabled = product.category_bg_removal === 1;
  
  // Panning controls
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number; initialPosX: number; initialPosY: number }>({ x: 0, y: 0, initialPosX: 0, initialPosY: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialShape) {
      setCurrentShape(initialShape);
    } else if (product.shapes && product.shapes.length > 0) {
      setCurrentShape(product.shapes[0]);
    }
  }, [initialShape, product]);

  const isKeychainOrCharm = Boolean(
    product.category_slug?.toLowerCase().includes('key') || 
    product.category_slug?.toLowerCase().includes('car-hanging') ||
    product.title.toLowerCase().includes('keychain') || 
    product.title.toLowerCase().includes('charm') ||
    product.slug?.toLowerCase().includes('keychain')
  );

  // Determine the active frame mask URL based on selected shape
  const getFrameUrlForShape = (shape: string) => {
    if (product.gallery && product.gallery.length > 0) {
      const shapeIdx = product.shapes?.indexOf(shape);
      if (shapeIdx !== undefined && shapeIdx >= 0 && product.gallery[shapeIdx]) {
        return product.gallery[shapeIdx];
      }
    }
    return product.image_url || '/frames/photostand/1_nos_e.png';
  };

  const activeFrameUrl = getFrameUrlForShape(currentShape);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setZoom(1);
      setRotation(0);
      setPosX(0);
      setPosY(0);

      if (bgRemovalEnabled) {
        // Show original first as placeholder, then replace with BG-removed version
        const originalUrl = URL.createObjectURL(file);
        setImagePreviewUrl(originalUrl);
        setIsBgRemoving(true);
        try {
          const { removeBackground } = await import('@imgly/background-removal');
          const resultBlob = await removeBackground(file, {
            debug: false,
            output: { format: 'image/png', quality: 0.9 },
          });
          const transparentUrl = URL.createObjectURL(resultBlob);
          setImagePreviewUrl(transparentUrl);
          const processedFile = new File([resultBlob], file.name.replace(/\.[^/.]+$/, "") + "-nobg.png", { type: "image/png" });
          setImageFile(processedFile);
        } catch (err) {
          console.warn('BG removal failed, using original:', err);
          // already showing original, no action needed
        } finally {
          setIsBgRemoving(false);
        }
      } else {
        const url = URL.createObjectURL(file);
        setImagePreviewUrl(url);
      }
    }
  };

  const handlePanStart = (clientX: number, clientY: number) => {
    if (!imagePreviewUrl || !isEditMode) return;
    setIsPanning(true);
    panStartRef.current = {
      x: clientX,
      y: clientY,
      initialPosX: posX,
      initialPosY: posY,
    };
  };

  const handlePanMove = useCallback((clientX: number, clientY: number) => {
    if (!isPanning) return;
    const dx = clientX - panStartRef.current.x;
    const dy = clientY - panStartRef.current.y;
    setPosX(panStartRef.current.initialPosX + dx);
    setPosY(panStartRef.current.initialPosY + dy);
  }, [isPanning]);

  const handlePanEnd = () => {
    setIsPanning(false);
  };

  const resetTransforms = () => {
    setZoom(1);
    setRotation(0);
    setPosX(0);
    setPosY(0);
  };

  const handleSaveAndAdd = async () => {
    if (!imagePreviewUrl && !imageFile) {
      fileInputRef.current?.click();
      return;
    }

    setIsUploading(true);
    let originalPhotoUrl = '';
    let printReadyArtworkUrl = '';

    try {
      // 1. Upload original raw photo
      if (imageFile) {
        const uploadRes = await uploadCustomPhoto(imageFile);
        if (uploadRes) {
          originalPhotoUrl = uploadRes.url;
        }
      }

      // 2. Generate and upload 1200x1200px print-ready composite artwork
      if (imagePreviewUrl) {
        const previewBoxWidth = previewBoxRef.current?.offsetWidth || 300;
        const artworkBase64 = await generatePrintArtworkBlob(
          imagePreviewUrl,
          activeFrameUrl,
          zoom,
          rotation,
          posX,
          posY,
          previewBoxWidth,
          customText,
          textStyle
        );

        if (artworkBase64) {
          const artworkRes = await uploadPrintArtwork(artworkBase64);
          if (artworkRes) {
            printReadyArtworkUrl = artworkRes.url;
          }
        }
      }

      const customizationSettings: CustomizationSettings = {
        zoom,
        rotation,
        posX,
        posY,
        text: customText.trim() || undefined,
        textStyle,
        shape: currentShape,
        frameImage: activeFrameUrl,
      };

      addToCart({
        productId: product.id,
        title: product.title,
        slug: product.slug,
        price: product.price,
        image: activeFrameUrl || product.image_url,
        shape: currentShape,
        customPhotoUrl: originalPhotoUrl || imagePreviewUrl || undefined,
        printReadyArtworkUrl: printReadyArtworkUrl || undefined,
        customizationSettings,
        customText: customText.trim() || undefined,
        quantity: 1,
      });

      setIsUploading(false);
      onClose();
    } catch (err) {
      console.error('Customizer processing error:', err);
      addToCart({
        productId: product.id,
        title: product.title,
        slug: product.slug,
        price: product.price,
        image: activeFrameUrl || product.image_url,
        shape: currentShape,
        customPhotoUrl: originalPhotoUrl || imagePreviewUrl || undefined,
        customText: customText.trim() || undefined,
        quantity: 1,
      });
      setIsUploading(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  const hasPhoto = Boolean(imagePreviewUrl);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/70 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      {/* Slide-over Drawer / Modal Container */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header (FNP Style) */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-stone-200 bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-base font-extrabold text-stone-900">
              Upload Personalize Image
            </h2>
          </div>
          <span className="rounded-md bg-stone-100 px-2.5 py-1 text-[11px] font-bold text-stone-600">
            {hasPhoto ? 'Step 2/2' : 'Step 1/2'}
          </span>
        </div>

        {/* Main Content Body */}
        <div className="flex-1 p-6 space-y-6">
          
          {/* 3D Realistic Acrylic Frame Stage */}
          <div className="relative rounded-3xl border border-stone-200/90 bg-gradient-to-b from-stone-100 via-stone-50 to-stone-100 p-6 flex flex-col items-center justify-center min-h-[360px] select-none shadow-inner">
            
            {/* Top Keyring Loop if charm */}
            {isKeychainOrCharm && (
              <div className="flex flex-col items-center -mb-2 z-20 pointer-events-none">
                <div className="w-10 h-10 rounded-full border-4 border-slate-300 bg-transparent shadow-md ring-1 ring-slate-400/40 relative">
                  <div className="absolute inset-0.5 rounded-full border border-slate-200" />
                </div>
                <div className="w-2.5 h-4 border-2 border-slate-400 bg-slate-200 rounded-full -mt-1 shadow-sm" />
              </div>
            )}

            {/* Acrylic Frame Stage */}
            <div className="relative flex h-72 w-72 sm:h-80 sm:w-80 items-center justify-center drop-shadow-2xl">
              
              {/* When no photo is uploaded: show frame silhouette outline & prompt */}
              {!hasPhoto ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative h-64 w-64 sm:h-72 sm:w-72 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group"
                >
                  {/* Frame shape background */}
                  <div 
                    className="absolute inset-0 bg-stone-200/90 border-2 border-dashed border-stone-400/80 group-hover:border-[#5c6b24] group-hover:bg-stone-300/60 transition-all"
                    style={{
                      WebkitMaskImage: `url("${activeFrameUrl}")`,
                      maskImage: `url("${activeFrameUrl}")`,
                      WebkitMaskSize: 'contain',
                      maskSize: 'contain',
                      WebkitMaskRepeat: 'no-repeat',
                      maskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                      maskPosition: 'center',
                    }}
                  />

                  {/* Center CTA inside the frame shape */}
                  <div className="relative z-10 flex flex-col items-center justify-center p-4 text-center pointer-events-none">
                    <div className="h-14 w-14 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-[#5c6b24] mb-2 group-hover:scale-110 transition-transform">
                      <ImageIcon className="h-7 w-7 animate-pulse" />
                    </div>
                    <span className="text-sm font-black text-stone-900 drop-shadow-sm">
                      Upload & Fit Inside Frame
                    </span>
                    <span className="text-[11px] text-stone-600 mt-1 font-semibold">
                      Click here or the button below
                    </span>
                  </div>
                </div>
              ) : (
                /* When photo is uploaded: Mask the photo inside the exact frame shape */
                <div 
                  ref={previewBoxRef}
                  className="relative h-64 w-64 sm:h-72 sm:w-72 overflow-hidden select-none"
                  style={{
                    WebkitMaskImage: `url("${activeFrameUrl}")`,
                    maskImage: `url("${activeFrameUrl}")`,
                    WebkitMaskSize: 'contain',
                    maskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskPosition: 'center',
                  }}
                  onMouseDown={(e) => handlePanStart(e.clientX, e.clientY)}
                  onMouseMove={(e) => handlePanMove(e.clientX, e.clientY)}
                  onMouseUp={handlePanEnd}
                  onMouseLeave={handlePanEnd}
                  onTouchStart={(e) => {
                    if (e.touches[0]) handlePanStart(e.touches[0].clientX, e.touches[0].clientY);
                  }}
                  onTouchMove={(e) => {
                    if (e.touches[0]) handlePanMove(e.touches[0].clientX, e.touches[0].clientY);
                  }}
                  onTouchEnd={handlePanEnd}
                >
                  {/* The transformed customer photo */}
                  <div
                    className={`h-full w-full ${isPanning ? 'cursor-grabbing' : isEditMode ? 'cursor-grab' : 'cursor-default'}`}
                    style={{
                      transform: `translate(${posX}px, ${posY}px) rotate(${rotation}deg) scale(${zoom})`,
                      transformOrigin: 'center center',
                      transition: isPanning ? 'none' : 'transform 0.08s ease-out',
                    }}
                  >
                    <img
                      src={imagePreviewUrl!}
                      alt="Uploaded customer preview"
                      className="h-full w-full object-cover pointer-events-none select-none"
                      draggable={false}
                    />
                  </div>

                  {/* Realistic 3D Cast Acrylic Surface Glass Reflection */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-white/10 opacity-70" />
                  <div className="pointer-events-none absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/30 blur-2xl" />

                  {/* Laser Engraved Name Inscription */}
                  {customText.trim() && (
                    <div className="absolute bottom-6 inset-x-4 flex justify-center pointer-events-none z-30">
                      <div className={`inline-flex items-center gap-1.5 max-w-[85%] rounded-full px-3 py-1 shadow-lg backdrop-blur-md border ${
                        textStyle === 'gold' 
                          ? 'bg-amber-950/85 text-amber-200 border-amber-400/40 shadow-amber-950/40' 
                          : textStyle === 'frosted'
                          ? 'bg-white/85 text-stone-900 border-white/80 shadow-stone-900/20'
                          : 'bg-stone-950/85 text-white border-white/20 shadow-black/50'
                      }`}>
                        <span className="truncate text-[11px] font-bold tracking-wide">
                          {customText}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* BG Removing Overlay */}
                  {isBgRemoving && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-none">
                      <Wand2 className="h-6 w-6 text-violet-400 animate-pulse mb-2" />
                      <p className="text-[11px] font-semibold text-violet-200 text-center">Removing background…</p>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Shape selection pills if product has multiple frame shapes */}
            {product.shapes && product.shapes.length > 1 && (
              <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5 z-10">
                {product.shapes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setCurrentShape(s)}
                    className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all ${
                      currentShape === s
                        ? 'bg-stone-900 text-white shadow-sm ring-2 ring-[#5c6b24]'
                        : 'bg-white/90 text-stone-700 border border-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* STEP 1: If No Photo Uploaded Yet (FNP Style Upload Button + Instructions) */}
          {!hasPhoto ? (
            <div className="space-y-6">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#5c6b24] hover:bg-[#4d5a1e] py-4 text-sm font-extrabold text-white shadow-lg transition-colors active:scale-[0.99]"
              >
                <ImageIcon className="h-5 w-5" />
                <span>Upload Image</span>
              </button>

              {/* Instructions Card (Exact FNP Requirements) */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 space-y-2 text-xs text-stone-600">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-stone-900 flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-stone-700" />
                    Instructions
                  </h4>
                  {bgRemovalEnabled && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] font-bold text-violet-800 border border-violet-200">
                      <Wand2 className="h-3 w-3 text-violet-600" />
                      Auto Cutout / BG Remove
                    </span>
                  )}
                </div>
                <ul className="space-y-1.5 text-[11px] list-disc list-inside text-stone-600">
                  <li>File size should be 100 KB-25 MB only</li>
                  <li>Upload only JPEG, PNG or WebP</li>
                  <li>Please upload a good quality image for sharp UV printing</li>
                  {bgRemovalEnabled && (
                    <li className="text-violet-700 font-semibold">
                      Background will be automatically removed to create a clean acrylic cutout
                    </li>
                  )}
                </ul>
              </div>
            </div>
          ) : (
            /* STEP 2: Photo Uploaded (Re-Upload & Edit Image Buttons) */
            <div className="space-y-4">
              {/* Dual Action Buttons (FNP exact style) */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border border-stone-300 bg-white py-3 text-xs font-bold text-stone-800 hover:bg-stone-50 hover:border-stone-400 transition-colors shadow-sm"
                >
                  <RefreshCw className="h-4 w-4 text-stone-600" />
                  <span>Re-Upload</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`w-full flex items-center justify-center gap-2 rounded-2xl border py-3 text-xs font-bold transition-all shadow-sm ${
                    isEditMode
                      ? 'border-[#5c6b24] bg-[#5c6b24]/10 text-[#5c6b24]'
                      : 'border-stone-300 bg-white text-stone-800 hover:bg-stone-50'
                  }`}
                >
                  <Sliders className="h-4 w-4" />
                  <span>{isEditMode ? 'Done Editing' : 'Edit Image'}</span>
                </button>
              </div>

              {/* Collapsible Edit Tools when "Edit Image" is clicked */}
              {isEditMode && (
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <span className="text-xs font-extrabold text-stone-900 flex items-center gap-1.5">
                      <Sliders className="h-3.5 w-3.5 text-[#5c6b24]" />
                      Crop, Zoom & Rotate
                    </span>
                    <button
                      type="button"
                      onClick={resetTransforms}
                      className="flex items-center gap-1 text-[11px] font-bold text-[#5c6b24] hover:underline"
                    >
                      <RotateCcw className="h-3 w-3" /> Reset
                    </button>
                  </div>

                  {/* Zoom Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-stone-700">
                      <span>Photo Zoom / Scale</span>
                      <span className="text-stone-500">{zoom.toFixed(1)}x</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        type="button" 
                        onClick={() => setZoom(Math.max(0.6, +(zoom - 0.1).toFixed(2)))} 
                        className="p-1 rounded-lg border border-stone-300 bg-white text-stone-600 hover:bg-stone-100"
                      >
                        <ZoomOut className="h-3.5 w-3.5" />
                      </button>
                      <input
                        type="range"
                        min="0.6"
                        max="3.0"
                        step="0.05"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-full accent-[#5c6b24] h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                      />
                      <button 
                        type="button" 
                        onClick={() => setZoom(Math.min(3.0, +(zoom + 0.1).toFixed(2)))} 
                        className="p-1 rounded-lg border border-stone-300 bg-white text-stone-600 hover:bg-stone-100"
                      >
                        <ZoomIn className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Rotation Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-stone-700">
                      <span>Angle Rotation</span>
                      <span className="text-stone-500">{rotation}°</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        step="5"
                        value={rotation}
                        onChange={(e) => setRotation(parseInt(e.target.value))}
                        className="w-full accent-[#5c6b24] h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => setRotation((r) => (r + 90) % 360)}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-100 flex-shrink-0"
                      >
                        +90°
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] text-stone-500 flex items-center gap-1">
                    <Move className="h-3 w-3 text-stone-400" />
                    Tip: Click and drag image directly inside the frame to adjust placement.
                  </p>

                  {/* Name Inscription Input */}
                  <div className="pt-2 border-t border-stone-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-800 flex items-center gap-1">
                        <Type className="h-3.5 w-3.5 text-[#5c6b24]" />
                        Engraved Text / Names (Optional):
                      </label>
                      {customText && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setTextStyle('gold')}
                            className={`w-3.5 h-3.5 rounded-full bg-amber-600 transition-transform ${textStyle === 'gold' ? 'ring-2 ring-primary-500 scale-110' : 'opacity-60'}`}
                            title="Gold Inscription"
                          />
                          <button
                            type="button"
                            onClick={() => setTextStyle('frosted')}
                            className={`w-3.5 h-3.5 rounded-full bg-stone-200 border border-stone-400 transition-transform ${textStyle === 'frosted' ? 'ring-2 ring-primary-500 scale-110' : 'opacity-60'}`}
                            title="Frosted White"
                          />
                          <button
                            type="button"
                            onClick={() => setTextStyle('dark')}
                            className={`w-3.5 h-3.5 rounded-full bg-stone-900 transition-transform ${textStyle === 'dark' ? 'ring-2 ring-primary-500 scale-110' : 'opacity-60'}`}
                            title="Midnight Dark"
                          />
                        </div>
                      )}
                    </div>
                    <input
                      type="text"
                      maxLength={35}
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="e.g. Rahul & Sneha • Forever"
                      className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs text-stone-900 placeholder-stone-400 focus:border-[#5c6b24] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Quality Guarantee badge */}
              <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200/60 p-3 text-xs text-emerald-800">
                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>3mm Cast Acrylic with High-Definition Japanese UV cured direct print</span>
              </div>
            </div>
          )}

        </div>

        {/* Sticky Bottom Bar (Save & Continue Button like FNP) */}
        <div className="sticky bottom-0 z-20 border-t border-stone-200 bg-white p-4 sm:p-5 shadow-lg">
          <button
            type="button"
            disabled={isUploading}
            onClick={handleSaveAndAdd}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#5c6b24] hover:bg-[#4d5a1e] py-4 text-sm font-extrabold text-white shadow-xl shadow-[#5c6b24]/20 transition-all disabled:opacity-60 active:scale-[0.99]"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating High-Res Proof & Saving...</span>
              </>
            ) : hasPhoto ? (
              <>
                <Check className="h-5 w-5" />
                <span>Save & Continue (₹{product.price})</span>
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                <span>Upload Image & Continue</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

