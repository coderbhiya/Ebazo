'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Upload, ZoomIn, ZoomOut, RotateCw, RotateCcw, Check, 
  Sparkles, Sliders, Image as ImageIcon, Loader2,
  Move, Type, RefreshCw, FileText, Wand2,
  FlipHorizontal, FlipVertical, Focus, ArrowUp, ArrowDown, ArrowLeft, ArrowRight
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
  flipH: boolean,
  flipV: boolean,
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
    ctx.scale(zoom * (flipH ? -1 : 1), zoom * (flipV ? -1 : 1));

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
    ctx.scale(zoom * (flipH ? -1 : 1), zoom * (flipV ? -1 : 1));
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
  const [activeTab, setActiveTab] = useState<'adjust' | 'text' | 'shape'>('adjust');
  
  // Customization transforms (Canva-grade)
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [customText, setCustomText] = useState('');
  const [textStyle, setTextStyle] = useState<'gold' | 'frosted' | 'dark'>('gold');
  const [isUploading, setIsUploading] = useState(false);
  const [isBgRemoving, setIsBgRemoving] = useState(false);
  const bgRemovalEnabled = product.category_bg_removal === 1;
  
  // Interactive gesture tracking
  const [isDragging, setIsDragging] = useState(false);
  const [interactionType, setInteractionType] = useState<'pan' | 'scale-corner' | 'rotate-stem' | null>(null);
  
  const interactionStartRef = useRef<{
    clientX: number;
    clientY: number;
    initialPosX: number;
    initialPosY: number;
    initialZoom: number;
    initialRotation: number;
    centerX: number;
    centerY: number;
    initialDist: number;
  }>({
    clientX: 0,
    clientY: 0,
    initialPosX: 0,
    initialPosY: 0,
    initialZoom: 1,
    initialRotation: 0,
    centerX: 0,
    centerY: 0,
    initialDist: 0
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialShape) {
      setCurrentShape(initialShape);
    } else if (product.shapes && product.shapes.length > 0) {
      setCurrentShape(product.shapes[0]);
    }
  }, [initialShape, product]);

  // Non-passive wheel listener for smooth Canva-like mouse scroll zooming
  useEffect(() => {
    const el = previewBoxRef.current;
    if (!el || !imagePreviewUrl) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      setZoom((prev) => {
        const next = Math.round(Math.min(3.5, Math.max(0.4, prev * zoomFactor)) * 100) / 100;
        return next;
      });
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [imagePreviewUrl]);

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
      setFlipH(false);
      setFlipV(false);

      if (bgRemovalEnabled) {
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
        } finally {
          setIsBgRemoving(false);
        }
      } else {
        const url = URL.createObjectURL(file);
        setImagePreviewUrl(url);
      }
    }
  };

  // Panning & Direct Canva Canvas Gestures
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, type: 'pan' | 'scale-corner' | 'rotate-stem' = 'pan') => {
    if (!imagePreviewUrl) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    
    const rect = previewBoxRef.current?.getBoundingClientRect();
    const centerX = rect ? rect.left + rect.width / 2 : 0;
    const centerY = rect ? rect.top + rect.height / 2 : 0;
    const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);

    setIsDragging(true);
    setInteractionType(type);
    
    interactionStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initialPosX: posX,
      initialPosY: posY,
      initialZoom: zoom,
      initialRotation: rotation,
      centerX,
      centerY,
      initialDist: dist,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !interactionType) return;
    const start = interactionStartRef.current;

    if (interactionType === 'pan') {
      const dx = e.clientX - start.clientX;
      const dy = e.clientY - start.clientY;
      setPosX(start.initialPosX + dx);
      setPosY(start.initialPosY + dy);
    } else if (interactionType === 'scale-corner') {
      const currentDist = Math.hypot(e.clientX - start.centerX, e.clientY - start.centerY);
      if (start.initialDist > 0) {
        const scaleChange = currentDist / start.initialDist;
        const newZoom = Math.min(3.5, Math.max(0.4, start.initialZoom * scaleChange));
        setZoom(Math.round(newZoom * 100) / 100);
      }
    } else if (interactionType === 'rotate-stem') {
      const initialAngle = Math.atan2(start.clientY - start.centerY, start.clientX - start.centerX);
      const currentAngle = Math.atan2(e.clientY - start.centerY, e.clientX - start.centerX);
      const angleDelta = (currentAngle - initialAngle) * (180 / Math.PI);
      let newRot = Math.round(start.initialRotation + angleDelta);
      while (newRot > 180) newRot -= 360;
      while (newRot < -180) newRot += 360;
      setRotation(newRot);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    setInteractionType(null);
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch (_) {}
  };

  // Touch pinch support
  const touchDistRef = useRef<number | null>(null);
  const touchZoomStartRef = useRef<number>(1);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      touchDistRef.current = dist;
      touchZoomStartRef.current = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && touchDistRef.current !== null) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      const ratio = dist / touchDistRef.current;
      const newZoom = Math.min(3.5, Math.max(0.4, touchZoomStartRef.current * ratio));
      setZoom(Math.round(newZoom * 100) / 100);
    }
  };

  const handleTouchEnd = () => {
    touchDistRef.current = null;
  };

  const resetTransforms = () => {
    setZoom(1);
    setRotation(0);
    setPosX(0);
    setPosY(0);
    setFlipH(false);
    setFlipV(false);
  };

  const nudge = (dx: number, dy: number) => {
    setPosX((prev) => prev + dx);
    setPosY((prev) => prev + dy);
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
          flipH,
          flipV,
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
        flipH,
        flipV,
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

      {/* Slide-over Drawer Container */}
      <div className="relative w-full max-w-lg bg-white text-stone-900 h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
        
        {/* Clean Luxury Header (Ebanzo / FNP Style) */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-stone-200 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3.5 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onClose}
              className="flex-shrink-0 rounded-full p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-extrabold text-stone-900 truncate">
                Upload Personalize Image
              </h2>
              <p className="text-[11px] font-medium text-stone-500 hidden xs:block truncate">
                {hasPhoto ? 'Crop, zoom & fit inside the frame' : 'Step 1 of 2: Select your photo'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="inline-flex items-center rounded-full bg-stone-100 px-3 py-1 text-[11px] font-bold text-stone-700 border border-stone-200">
              {hasPhoto ? 'Step 2/2' : 'Step 1/2'}
            </span>
          </div>
        </div>

        {/* Main Content Body */}
        <div className="flex-1 p-4 sm:p-6 space-y-5 bg-stone-50/50">
          
          {/* Acrylic Studio Canvas Stage */}
          <div className="relative rounded-3xl border border-stone-200/90 bg-gradient-to-b from-stone-100 via-stone-50 to-stone-100 p-4 sm:p-6 flex flex-col items-center justify-center min-h-[350px] select-none shadow-inner overflow-hidden">
            
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
                    className="absolute inset-0 bg-stone-200/90 border-2 border-dashed border-stone-400 group-hover:border-[#5c6b24] group-hover:bg-stone-300/60 transition-all"
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
                    <div className="h-14 w-14 rounded-full bg-white shadow-lg flex items-center justify-center text-[#5c6b24] mb-2 group-hover:scale-110 transition-transform">
                      <ImageIcon className="h-7 w-7 animate-pulse" />
                    </div>
                    <span className="text-sm font-black text-stone-900 drop-shadow-sm">
                      Upload & Fit Inside Frame
                    </span>
                    <span className="text-[11px] text-stone-600 mt-1 font-semibold">
                      Click here to choose your photo
                    </span>
                  </div>
                </div>
              ) : (
                /* When photo is uploaded: Canva Interactive Frame Cutout Stage */
                <div 
                  ref={previewBoxRef}
                  className="relative h-64 w-64 sm:h-72 sm:w-72 select-none touch-none"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {/* Masked Photo Container */}
                  <div
                    className="relative w-full h-full overflow-hidden"
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
                    onPointerDown={(e) => handlePointerDown(e, 'pan')}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                  >
                    {/* The transformed customer photo */}
                    <div
                      className={`h-full w-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                      style={{
                        transform: `translate(${posX}px, ${posY}px) rotate(${rotation}deg) scale(${zoom * (flipH ? -1 : 1)}, ${zoom * (flipV ? -1 : 1)})`,
                        transformOrigin: 'center center',
                        transition: isDragging ? 'none' : 'transform 0.08s ease-out',
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

                  {/* Canva Interactive Selection Transform Box Overlay */}
                  <div className="absolute inset-0 pointer-events-none rounded-2xl border border-sky-500/50">
                    {/* Top Stem Rotation Handle */}
                    <div 
                      className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto cursor-grab active:cursor-grabbing group"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        handlePointerDown(e, 'rotate-stem');
                      }}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerUp}
                      title="Drag to rotate angle"
                    >
                      <div className="w-5 h-5 rounded-full bg-sky-500 text-white shadow-md flex items-center justify-center ring-2 ring-white hover:scale-110 transition-transform">
                        <RotateCw className="w-3 h-3 group-hover:rotate-45 transition-transform" />
                      </div>
                      <div className="w-0.5 h-2.5 bg-sky-400" />
                    </div>

                    {/* 4 Corner Resize Scale Handles */}
                    {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map((pos) => {
                      const posClasses = {
                        'top-left': '-top-2 -left-2 cursor-nwse-resize',
                        'top-right': '-top-2 -right-2 cursor-nesw-resize',
                        'bottom-left': '-bottom-2 -left-2 cursor-nesw-resize',
                        'bottom-right': '-bottom-2 -right-2 cursor-nwse-resize',
                      }[pos];

                      return (
                        <div
                          key={pos}
                          className={`absolute ${posClasses} w-4 h-4 rounded-full bg-white border-2 border-sky-500 shadow-md pointer-events-auto hover:scale-125 transition-transform`}
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            handlePointerDown(e, 'scale-corner');
                          }}
                          onPointerMove={handlePointerMove}
                          onPointerUp={handlePointerUp}
                          onPointerCancel={handlePointerUp}
                          title="Drag corner to zoom / scale"
                        />
                      );
                    })}
                  </div>

                </div>
              )}

            </div>

            {/* Canva Quick Floating Pill Toolbar (When photo is uploaded) */}
            {hasPhoto && (
              <div className="mt-4 z-20 flex flex-wrap items-center justify-center gap-1.5 bg-white/95 backdrop-blur-md border border-stone-200/90 px-3 py-1.5 rounded-full shadow-lg">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(2)))}
                  className="p-1.5 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="text-[11px] font-mono font-bold text-stone-800 px-1 min-w-[42px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(3.5, +(z + 0.1).toFixed(2)))}
                  className="p-1.5 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>

                <div className="h-4 w-[1px] bg-stone-200 mx-0.5" />

                <button
                  type="button"
                  onClick={() => setRotation((r) => ((r + 90) % 360))}
                  className="p-1.5 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                  title="Rotate 90°"
                >
                  <RotateCw className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setFlipH((f) => !f)}
                  className={`p-1.5 rounded-full transition-colors ${flipH ? 'bg-sky-100 text-sky-700' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'}`}
                  title="Flip Horizontal"
                >
                  <FlipHorizontal className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setFlipV((f) => !f)}
                  className={`p-1.5 rounded-full transition-colors ${flipV ? 'bg-sky-100 text-sky-700' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'}`}
                  title="Flip Vertical"
                >
                  <FlipVertical className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => { setPosX(0); setPosY(0); }}
                  className="p-1.5 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                  title="Center Photo"
                >
                  <Focus className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={resetTransforms}
                  className="p-1.5 rounded-full text-stone-500 hover:text-amber-600 hover:bg-stone-100 transition-colors"
                  title="Reset Adjustments"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Gesture Helper text badge */}
            {hasPhoto && (
              <p className="mt-2 text-[11px] text-stone-500 font-medium flex items-center gap-1">
                <Move className="h-3 w-3 text-[#5c6b24]" />
                <span>Drag photo to move • Scroll to zoom • Corner handles to scale</span>
              </p>
            )}

          </div>

          {/* STEP 1: If No Photo Uploaded Yet */}
          {!hasPhoto ? (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#5c6b24] hover:bg-[#4d5a1e] py-4 text-sm font-extrabold text-white shadow-xl shadow-[#5c6b24]/20 transition-all active:scale-[0.99]"
              >
                <ImageIcon className="h-5 w-5" />
                <span>Select & Upload Photo</span>
              </button>

              {/* Instructions Card */}
              <div className="rounded-2xl border border-stone-200 bg-white p-4 space-y-2 text-xs text-stone-600 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-stone-900 flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-stone-700" />
                    Instructions
                  </h4>
                  {bgRemovalEnabled && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 border border-violet-200 px-2.5 py-0.5 text-[10px] font-bold text-violet-800">
                      <Wand2 className="h-3 w-3 text-violet-600" />
                      Auto Cutout / BG Removal
                    </span>
                  )}
                </div>
                <ul className="space-y-1.5 text-[11px] list-disc list-inside text-stone-600">
                  <li>Supported formats: JPEG, PNG or WebP (up to 25 MB)</li>
                  <li>Upload a sharp, bright photo for high-definition UV printing</li>
                  <li>Canva-style interactive tools let you move, zoom and rotate photo inside the frame</li>
                </ul>
              </div>
            </div>
          ) : (
            /* STEP 2: Photo Uploaded - Canva Tool Tabs */
            <div className="space-y-4">
              
              {/* Tabs Navigation */}
              <div className="flex items-center gap-1 p-1 bg-stone-200/70 rounded-2xl border border-stone-300/80">
                <button
                  type="button"
                  onClick={() => setActiveTab('adjust')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'adjust'
                      ? 'bg-white text-stone-900 shadow-sm ring-1 ring-stone-300'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Sliders className="h-3.5 w-3.5 text-[#5c6b24]" />
                  <span>Adjust</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('text')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'text'
                      ? 'bg-white text-stone-900 shadow-sm ring-1 ring-stone-300'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Type className="h-3.5 w-3.5 text-amber-600" />
                  <span>Engraved Text</span>
                </button>

                {product.shapes && product.shapes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('shape')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'shape'
                        ? 'bg-white text-stone-900 shadow-sm ring-1 ring-stone-300'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[#5c6b24]" />
                    <span>Shape</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1 rounded-xl transition-colors hover:bg-white/80"
                  title="Choose another image"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Re-Upload</span>
                </button>
              </div>

              {/* Tab 1: Adjust (Canva Tool Suite) */}
              {activeTab === 'adjust' && (
                <div className="rounded-2xl border border-stone-200 bg-white p-4 space-y-4 shadow-sm animate-in fade-in duration-150">
                  
                  {/* Zoom Slider + Presets */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-stone-800">
                      <span className="flex items-center gap-1.5">
                        <ZoomIn className="h-3.5 w-3.5 text-[#5c6b24]" />
                        Photo Scale / Zoom
                      </span>
                      <span className="font-mono text-stone-600 font-bold">{Math.round(zoom * 100)}%</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        type="button" 
                        onClick={() => setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(2)))} 
                        className="p-1.5 rounded-lg border border-stone-300 bg-stone-50 text-stone-700 hover:bg-stone-100"
                      >
                        <ZoomOut className="h-3.5 w-3.5" />
                      </button>
                      <input
                        type="range"
                        min="0.4"
                        max="3.0"
                        step="0.05"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-full accent-[#5c6b24] h-2 bg-stone-200 rounded-lg cursor-pointer"
                      />
                      <button 
                        type="button" 
                        onClick={() => setZoom((z) => Math.min(3.0, +(z + 0.1).toFixed(2)))} 
                        className="p-1.5 rounded-lg border border-stone-300 bg-stone-50 text-stone-700 hover:bg-stone-100"
                      >
                        <ZoomIn className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Quick Zoom Presets */}
                    <div className="flex items-center gap-1.5 pt-1">
                      {[
                        { label: 'Fit', val: 0.85 },
                        { label: '100%', val: 1.0 },
                        { label: '125%', val: 1.25 },
                        { label: '150%', val: 1.5 },
                        { label: '200%', val: 2.0 },
                      ].map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => setZoom(p.val)}
                          className={`flex-1 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                            Math.abs(zoom - p.val) < 0.05
                              ? 'bg-[#5c6b24]/15 border-[#5c6b24] text-[#5c6b24]'
                              : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rotation Slider */}
                  <div className="space-y-2 pt-3 border-t border-stone-200">
                    <div className="flex justify-between items-center text-xs font-bold text-stone-800">
                      <span className="flex items-center gap-1.5">
                        <RotateCw className="h-3.5 w-3.5 text-amber-600" />
                        Angle Rotation
                      </span>
                      <span className="font-mono text-stone-600 font-bold">{rotation}°</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        step="1"
                        value={rotation}
                        onChange={(e) => setRotation(parseInt(e.target.value))}
                        className="w-full accent-[#5c6b24] h-2 bg-stone-200 rounded-lg cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {[-90, 0, 90, 180].map((deg) => (
                        <button
                          key={deg}
                          type="button"
                          onClick={() => setRotation(deg)}
                          className={`flex-1 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                            rotation === deg
                              ? 'bg-[#5c6b24]/15 border-[#5c6b24] text-[#5c6b24]'
                              : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                          }`}
                        >
                          {deg === 0 ? '0° (Reset)' : `${deg > 0 ? '+' : ''}${deg}°`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Position Nudge D-pad + Flip */}
                  <div className="pt-3 border-t border-stone-200 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold text-stone-600 block mb-1.5">
                        Pixel Nudge:
                      </span>
                      <div className="inline-grid grid-cols-3 gap-1 p-1 bg-stone-100 rounded-xl border border-stone-200">
                        <div />
                        <button
                          type="button"
                          onClick={() => nudge(0, -10)}
                          className="p-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 shadow-2xs"
                          title="Nudge Up"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <div />
                        <button
                          type="button"
                          onClick={() => nudge(-10, 0)}
                          className="p-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 shadow-2xs"
                          title="Nudge Left"
                        >
                          <ArrowLeft className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => { setPosX(0); setPosY(0); }}
                          className="p-1.5 rounded-lg bg-[#5c6b24] text-white hover:bg-[#4d5a1e] shadow-2xs"
                          title="Center"
                        >
                          <Focus className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => nudge(10, 0)}
                          className="p-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 shadow-2xs"
                          title="Nudge Right"
                        >
                          <ArrowRight className="h-3 w-3" />
                        </button>
                        <div />
                        <button
                          type="button"
                          onClick={() => nudge(0, 10)}
                          className="p-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 shadow-2xs"
                          title="Nudge Down"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                        <div />
                      </div>
                    </div>

                    {/* Flip & Reset Actions */}
                    <div className="flex-1 space-y-1.5">
                      <span className="text-[11px] font-bold text-stone-600 block">
                        Transform:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setFlipH((f) => !f)}
                          className={`flex items-center justify-center gap-1 py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                            flipH 
                              ? 'bg-[#5c6b24]/15 border-[#5c6b24] text-[#5c6b24]' 
                              : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          <FlipHorizontal className="h-3.5 w-3.5" />
                          <span>Flip H</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFlipV((f) => !f)}
                          className={`flex items-center justify-center gap-1 py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                            flipV 
                              ? 'bg-[#5c6b24]/15 border-[#5c6b24] text-[#5c6b24]' 
                              : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          <FlipVertical className="h-3.5 w-3.5" />
                          <span>Flip V</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={resetTransforms}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-[11px] font-bold text-stone-600 hover:text-amber-700 bg-stone-100 border border-stone-200 hover:bg-stone-200 transition-colors"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Reset All Positions</span>
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* Tab 2: Engraved Text */}
              {activeTab === 'text' && (
                <div className="rounded-2xl border border-stone-200 bg-white p-4 space-y-3.5 shadow-sm animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <Type className="h-3.5 w-3.5 text-[#5c6b24]" />
                      Engraved Name / Date Inscription (Optional):
                    </label>
                  </div>

                  <input
                    type="text"
                    maxLength={35}
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="e.g. Rahul & Sneha • Forever"
                    className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:border-[#5c6b24] focus:bg-white focus:outline-none"
                  />

                  {/* Badge Style Selector */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-stone-600 block">
                      Plate Metallic Style:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'gold', label: 'Royal Gold', bg: 'bg-amber-950 text-amber-200 border-amber-500/50' },
                        { id: 'frosted', label: 'Frosted White', bg: 'bg-stone-100 text-stone-900 border-stone-300' },
                        { id: 'dark', label: 'Midnight Black', bg: 'bg-stone-900 text-white border-stone-700' },
                      ].map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setTextStyle(st.id as any)}
                          className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${st.bg} ${
                            textStyle === st.id ? 'ring-2 ring-[#5c6b24] scale-[1.02]' : 'opacity-70 hover:opacity-100'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Shape Selector */}
              {activeTab === 'shape' && product.shapes && product.shapes.length > 1 && (
                <div className="rounded-2xl border border-stone-200 bg-white p-4 space-y-2.5 shadow-sm animate-in fade-in duration-150">
                  <span className="text-xs font-bold text-stone-900 block">
                    Choose Acrylic Frame Shape:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {product.shapes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setCurrentShape(s)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                          currentShape === s
                            ? 'bg-[#5c6b24] text-white border-[#5c6b24] shadow-md ring-2 ring-[#5c6b24]/30'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quality Guarantee Badge */}
              <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200/80 p-3 text-xs text-emerald-800">
                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>3mm Cast Acrylic with High-Definition Japanese UV cured direct print</span>
              </div>

            </div>
          )}

        </div>

        {/* Sticky Bottom Bar (Save & Continue Button) */}
        <div className="sticky bottom-0 z-30 border-t border-stone-200 bg-white p-4 sm:p-5 shadow-lg">
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
