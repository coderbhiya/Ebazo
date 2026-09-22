'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Upload, ZoomIn, ZoomOut, RotateCw, RotateCcw, Check, 
  Sparkles, Sliders, Image as ImageIcon, Loader2,
  Move, Type, RefreshCw, FileText, Wand2,
  FlipHorizontal, FlipVertical, Focus, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  Layers, Copy, Eye, Grid
} from 'lucide-react';
import { Product, uploadCustomPhoto, uploadPrintArtwork, CustomizationSettings } from '@/lib/api';
import { useCart } from '@/context/CartContext';

interface Props {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  selectedShape?: string;
  initialSetOption?: 'Set of 4' | 'Set of 6' | 'Set of 8';
  initialPrintType?: 'single' | 'dual';
  customPrice?: number;
}

interface MagnetSlotState {
  slot: number;
  name: string;
  imageFile: File | null;
  imagePreviewUrl: string | null;
  zoom: number;
  rotation: number;
  posX: number;
  posY: number;
  flipH: boolean;
  flipV: boolean;
  shape: string;
  frameUrl: string;
}

interface MiniGallerySlotState {
  slot: number;
  imageFile: File | null;
  imagePreviewUrl: string | null;
  zoom: number;
  rotation: number;
  posX: number;
  posY: number;
  flipH: boolean;
  flipV: boolean;
}

// High-precision AI Neural Background Removal Engine (Uses @imgly/background-removal with ISNet Neural Model)
async function removeBackgroundAI(
  source: string | File | Blob,
  onProgress?: (percent: number, statusText: string) => void
): Promise<{ blob: Blob; dataUrl: string }> {
  try {
    const { removeBackground } = await import('@imgly/background-removal');
    
    onProgress?.(15, 'Initializing Neural Model...');
    
    const blob = await removeBackground(source, {
      publicPath: 'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/',
      model: 'isnet_quint8',
      debug: false,
      output: {
        format: 'image/png',
        quality: 0.95,
      },
      progress: (key: string, current: number, total: number) => {
        if (total > 0) {
          const pct = Math.min(99, Math.round((current / total) * 100));
          const stepName = key.includes('fetch') ? 'Loading AI Model' : 'Detecting Subject';
          onProgress?.(pct, `${stepName} ${pct}%`);
        }
      },
    });

    onProgress?.(100, 'Finishing transparent cutout...');

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve({ blob, dataUrl: reader.result });
        } else {
          const url = URL.createObjectURL(blob);
          resolve({ blob, dataUrl: url });
        }
      };
      reader.onerror = () => {
        const url = URL.createObjectURL(blob);
        resolve({ blob, dataUrl: url });
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('AI background removal error:', error);
    throw error;
  }
}


// High-resolution Canvas generator for print-ready composite
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
  customText?: string,
  textStyle: 'gold' | 'frosted' | 'dark' = 'gold'
): Promise<string> {
  const canvas = document.createElement('canvas');
  const size = 1200;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

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

    ctx.drawImage(maskImg, maskX, maskY, maskW, maskH);
    ctx.globalCompositeOperation = 'source-in';

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
    ctx.globalCompositeOperation = 'source-over';
  } else {
    ctx.save();
    ctx.translate(size / 2, size / 2);
    const scaleRatio = size / (previewContainerSize || 300);
    ctx.translate(posX * scaleRatio, posY * scaleRatio);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom * (flipH ? -1 : 1), zoom * (flipV ? -1 : 1));
    ctx.drawImage(img, -size / 2, -size / 2, size, size);
    ctx.restore();
  }

  // Subtle gloss sheen for 3D acrylic proof
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.0)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0.08)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

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

export default function LiveCustomizerModal({ 
  product, 
  isOpen, 
  onClose, 
  selectedShape: initialShape,
  initialSetOption = 'Set of 4',
  initialPrintType = 'single',
  customPrice
}: Props) {
  const { addToCart } = useCart();
  const effectivePrice = customPrice || product.price;

  // Product classification — admin-set product_type (Admin > Products > Customization Type)
  // is authoritative when present; products left as/defaulted to 'standard' fall back to the
  // legacy title/category keyword matching so existing untagged products keep working.
  const hasExplicitProductType = Boolean(product.product_type) && product.product_type !== 'standard';

  const isFridgeMagnet = hasExplicitProductType
    ? product.product_type === 'fridge_magnet'
    : Boolean(
        product.category_slug?.includes('magnet') ||
        product.title.toLowerCase().includes('magnet') ||
        product.slug?.includes('magnet')
      );

  const isMiniGallery = hasExplicitProductType
    ? product.product_type === 'mini_gallery'
    : Boolean(
        product.category_slug?.includes('mini-gallary') ||
        product.category_slug?.includes('gallery') ||
        product.title.toLowerCase().includes('gallery') ||
        product.slug?.includes('gallery')
      );

  const isDualSideEligible = hasExplicitProductType
    ? product.product_type === 'dual_side'
    : Boolean(
        product.category_slug?.includes('car-stand') ||
        product.category_slug?.includes('car-hanging') ||
        product.category_slug?.includes('key') ||
        product.title.toLowerCase().includes('car stand') ||
        product.title.toLowerCase().includes('car hanging') ||
        product.title.toLowerCase().includes('keychain') ||
        product.title.toLowerCase().includes('charm') ||
        product.slug?.includes('keychain')
      );

  // Background removal eligibility is driven ENTIRELY by the admin's per-category toggle
  // (Categories > BG Removal Enabled) — no hardcoded category list here, so admin stays in control.
  const isTransparentAcrylicFrame = product.category_bg_removal === 1;
  const bgRemovalEnabled = isTransparentAcrylicFrame && !isFridgeMagnet && !isDualSideEligible && !isMiniGallery;

  // State: Standard / Single Photo
  const [currentShape, setCurrentShape] = useState(initialShape || product.shapes?.[0] || 'Standard');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);
  const [isBgRemoved, setIsBgRemoved] = useState(false);
  const [isBgRemoving, setIsBgRemoving] = useState(false);

  // Transform states
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [customText, setCustomText] = useState('');
  const [textStyle, setTextStyle] = useState<'gold' | 'frosted' | 'dark'>('gold');
  const [activeTab, setActiveTab] = useState<'adjust' | 'text' | 'shape'>('adjust');

  // State: Dual-Side (Side A = Front, Side B = Back)
  const [printType, setPrintType] = useState<'single' | 'dual'>(initialPrintType);
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [isFlipped3D, setIsFlipped3D] = useState(false);
  // Front Side
  const [frontImageFile, setFrontImageFile] = useState<File | null>(null);
  const [frontPreviewUrl, setFrontPreviewUrl] = useState<string | null>(null);
  const [frontZoom, setFrontZoom] = useState(1);
  const [frontRotation, setFrontRotation] = useState(0);
  const [frontPosX, setFrontPosX] = useState(0);
  const [frontPosY, setFrontPosY] = useState(0);
  const [frontFlipH, setFrontFlipH] = useState(false);
  const [frontFlipV, setFrontFlipV] = useState(false);
  // Back Side
  const [backImageFile, setBackImageFile] = useState<File | null>(null);
  const [backPreviewUrl, setBackPreviewUrl] = useState<string | null>(null);
  const [backZoom, setBackZoom] = useState(1);
  const [backRotation, setBackRotation] = useState(0);
  const [backPosX, setBackPosX] = useState(0);
  const [backPosY, setBackPosY] = useState(0);
  const [backFlipH, setBackFlipH] = useState(false);
  const [backFlipV, setBackFlipV] = useState(false);

  // State: Fridge Magnet Sets
  const [magnetSetOption, setMagnetSetOption] = useState<'Set of 4' | 'Set of 6' | 'Set of 8'>(initialSetOption);
  const magnetCount = magnetSetOption === 'Set of 8' ? 8 : magnetSetOption === 'Set of 6' ? 6 : 4;
  const [activeMagnetIdx, setActiveMagnetIdx] = useState(0);
  const [magnetViewMode, setMagnetViewMode] = useState<'single' | 'grid'>('single');
  
  // Available magnet frames/shapes
  const magnetFrames = [
    '/frames/fridge-magnet/1_nos_a.png',
    '/frames/fridge-magnet/1_nos_b.png',
    '/frames/fridge-magnet/1_nos_c.png',
    '/frames/fridge-magnet/1_nos_d.png',
    '/frames/fridge-magnet/1_nos_e.png',
    '/frames/fridge-magnet/1_nos_f.png',
    '/frames/fridge-magnet/1_nos_g.png',
    '/frames/fridge-magnet/1_nos_h.png',
  ];

  const [magnetSlots, setMagnetSlots] = useState<MagnetSlotState[]>(() => 
    Array.from({ length: 8 }, (_, idx) => ({
      slot: idx + 1,
      name: `Magnet ${idx + 1}`,
      imageFile: null,
      imagePreviewUrl: null,
      zoom: 1,
      rotation: 0,
      posX: 0,
      posY: 0,
      flipH: false,
      flipV: false,
      shape: `Shape ${idx + 1}`,
      frameUrl: magnetFrames[idx % magnetFrames.length]
    }))
  );

  // State: Mini Gallery Multi-Frame Collage (4 slots)
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);
  const [miniGallerySlots, setMiniGallerySlots] = useState<MiniGallerySlotState[]>(() =>
    Array.from({ length: 4 }, (_, idx) => ({
      slot: idx + 1,
      imageFile: null,
      imagePreviewUrl: null,
      zoom: 1,
      rotation: 0,
      posX: 0,
      posY: 0,
      flipH: false,
      flipV: false,
    }))
  );

  const [galleryViewMode, setGalleryViewMode] = useState<'single' | 'grid'>('single');

  // Upload and gesture refs
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [interactionType, setInteractionType] = useState<'pan' | 'scale-corner' | 'rotate-stem' | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const magnetFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const previewBoxRef = useRef<HTMLDivElement>(null);

  const interactionStartRef = useRef({
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

  // Sync initial props
  useEffect(() => {
    if (initialShape) setCurrentShape(initialShape);
    if (initialSetOption) setMagnetSetOption(initialSetOption);
    if (initialPrintType) setPrintType(initialPrintType);
  }, [initialShape, initialSetOption, initialPrintType, isOpen]);

  // Frame URL lookup
  const getFrameUrlForShape = (shape: string) => {
    if (product.gallery && product.gallery.length > 0) {
      const shapeIdx = product.shapes?.indexOf(shape);
      if (shapeIdx !== undefined && shapeIdx >= 0 && product.gallery[shapeIdx]) {
        return product.gallery[shapeIdx];
      }
    }
    return product.image_url || '/frames/photostand/1_nos_a.png';
  };

  const activeFrameUrl = getFrameUrlForShape(currentShape);

  // Handle Standard Single-File Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);

      if (isDualSideEligible && printType === 'dual') {
        if (activeSide === 'front') {
          setFrontImageFile(file);
          setFrontPreviewUrl(url);
          setFrontZoom(1);
          setFrontRotation(0);
          setFrontPosX(0);
          setFrontPosY(0);
          if (!backPreviewUrl) {
            setBackImageFile(file);
            setBackPreviewUrl(url);
          }
        } else {
          setBackImageFile(file);
          setBackPreviewUrl(url);
          setBackZoom(1);
          setBackRotation(0);
          setBackPosX(0);
          setBackPosY(0);
        }
      } else {
        setImageFile(file);
        setOriginalFile(file);
        setImagePreviewUrl(url);
        setOriginalPreviewUrl(url);
        setIsBgRemoved(false);
        setZoom(1);
        setRotation(0);
        setPosX(0);
        setPosY(0);
        setFlipH(false);
        setFlipV(false);
      }
    }
  };

  // Handle Individual Fridge Magnet Upload
  const handleMagnetFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setMagnetSlots((prev) => {
        const copy = [...prev];
        copy[activeMagnetIdx] = {
          ...copy[activeMagnetIdx],
          imageFile: file,
          imagePreviewUrl: url,
          zoom: 1,
          rotation: 0,
          posX: 0,
          posY: 0,
          flipH: false,
          flipV: false,
        };
        return copy;
      });
    }
  };

  // Handle Mini Gallery Slot Upload
  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setMiniGallerySlots((prev) => {
        const copy = [...prev];
        copy[activeGalleryIdx] = {
          ...copy[activeGalleryIdx],
          imageFile: file,
          imagePreviewUrl: url,
          zoom: 1,
          rotation: 0,
          posX: 0,
          posY: 0,
          flipH: false,
          flipV: false,
        };
        return copy;
      });
    }
  };

  // Background Removal Action (Available ONLY for transparent acrylic frames)
  const [bgRemoveStatus, setBgRemoveStatus] = useState<string>('');
  const [bgRemovePercent, setBgRemovePercent] = useState<number>(0);
  const [bgRemoveError, setBgRemoveError] = useState<string>('');

  const handleToggleBgRemoval = async () => {
    if (!originalFile && !imageFile) return;

    if (isBgRemoved) {
      // Restore original
      if (originalPreviewUrl && originalFile) {
        setImagePreviewUrl(originalPreviewUrl);
        setImageFile(originalFile);
        setIsBgRemoved(false);
      }
      return;
    }

    // Execute high-precision AI Neural Background Removal
    setIsBgRemoving(true);
    setBgRemoveError('');
    setBgRemoveStatus('Analyzing subject...');
    setBgRemovePercent(10);
    const targetSource = originalFile || imageFile || originalPreviewUrl || imagePreviewUrl!;
    try {
      const timeoutMs = 45000;
      const { blob, dataUrl } = await Promise.race([
        removeBackgroundAI(targetSource, (percent, status) => {
          setBgRemovePercent(percent);
          setBgRemoveStatus(status);
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Background removal timed out. Please check your internet connection and try again.')), timeoutMs)
        ),
      ]);
      setImagePreviewUrl(dataUrl);
      const filename = (originalFile?.name || 'custom').replace(/\.[^/.]+$/, '') + '-nobg.png';
      const processedFile = new File([blob], filename, { type: 'image/png' });
      setImageFile(processedFile);
      setIsBgRemoved(true);
    } catch (err) {
      console.error('AI background removal error:', err);
      setBgRemoveError(
        err instanceof Error && err.message.includes('timed out')
          ? err.message
          : 'Could not remove background — please check your internet connection and try again.'
      );
    } finally {
      setIsBgRemoving(false);
      setBgRemoveStatus('');
      setBgRemovePercent(0);
    }
  };

  // Gestures for Standard Photo
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, type: 'pan' | 'scale-corner' | 'rotate-stem' = 'pan') => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    const rect = previewBoxRef.current?.getBoundingClientRect();
    const centerX = rect ? rect.left + rect.width / 2 : 0;
    const centerY = rect ? rect.top + rect.height / 2 : 0;
    const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);

    setIsDragging(true);
    setInteractionType(type);

    let curPosX = posX, curPosY = posY, curZoom = zoom, curRot = rotation;
    if (isDualSideEligible && printType === 'dual') {
      if (activeSide === 'front') {
        curPosX = frontPosX; curPosY = frontPosY; curZoom = frontZoom; curRot = frontRotation;
      } else {
        curPosX = backPosX; curPosY = backPosY; curZoom = backZoom; curRot = backRotation;
      }
    } else if (isFridgeMagnet) {
      const activeMagnet = magnetSlots[activeMagnetIdx];
      curPosX = activeMagnet.posX; curPosY = activeMagnet.posY; curZoom = activeMagnet.zoom; curRot = activeMagnet.rotation;
    } else if (isMiniGallery) {
      const activeSlot = miniGallerySlots[activeGalleryIdx];
      curPosX = activeSlot.posX; curPosY = activeSlot.posY; curZoom = activeSlot.zoom; curRot = activeSlot.rotation;
    }

    interactionStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initialPosX: curPosX,
      initialPosY: curPosY,
      initialZoom: curZoom,
      initialRotation: curRot,
      centerX,
      centerY,
      initialDist: dist,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !interactionType) return;
    const start = interactionStartRef.current;
    const dx = e.clientX - start.clientX;
    const dy = e.clientY - start.clientY;

    if (interactionType === 'pan') {
      const newX = start.initialPosX + dx;
      const newY = start.initialPosY + dy;

      if (isDualSideEligible && printType === 'dual') {
        if (activeSide === 'front') { setFrontPosX(newX); setFrontPosY(newY); }
        else { setBackPosX(newX); setBackPosY(newY); }
      } else if (isFridgeMagnet) {
        setMagnetSlots((prev) => {
          const copy = [...prev];
          copy[activeMagnetIdx] = { ...copy[activeMagnetIdx], posX: newX, posY: newY };
          return copy;
        });
      } else if (isMiniGallery) {
        setMiniGallerySlots((prev) => {
          const copy = [...prev];
          copy[activeGalleryIdx] = { ...copy[activeGalleryIdx], posX: newX, posY: newY };
          return copy;
        });
      } else {
        setPosX(newX);
        setPosY(newY);
      }
    } else if (interactionType === 'scale-corner') {
      const currentDist = Math.hypot(e.clientX - start.centerX, e.clientY - start.centerY);
      if (start.initialDist > 0) {
        const scaleChange = currentDist / start.initialDist;
        const newZoom = Math.min(3.5, Math.max(0.4, Math.round(start.initialZoom * scaleChange * 100) / 100));

        if (isDualSideEligible && printType === 'dual') {
          if (activeSide === 'front') setFrontZoom(newZoom);
          else setBackZoom(newZoom);
        } else if (isFridgeMagnet) {
          setMagnetSlots((prev) => {
            const copy = [...prev];
            copy[activeMagnetIdx] = { ...copy[activeMagnetIdx], zoom: newZoom };
            return copy;
          });
        } else if (isMiniGallery) {
          setMiniGallerySlots((prev) => {
            const copy = [...prev];
            copy[activeGalleryIdx] = { ...copy[activeGalleryIdx], zoom: newZoom };
            return copy;
          });
        } else {
          setZoom(newZoom);
        }
      }
    } else if (interactionType === 'rotate-stem') {
      const initialAngle = Math.atan2(start.clientY - start.centerY, start.clientX - start.centerX);
      const currentAngle = Math.atan2(e.clientY - start.centerY, e.clientX - start.centerX);
      const angleDelta = (currentAngle - initialAngle) * (180 / Math.PI);
      let newRot = Math.round(start.initialRotation + angleDelta);
      while (newRot > 180) newRot -= 360;
      while (newRot < -180) newRot += 360;

      if (isDualSideEligible && printType === 'dual') {
        if (activeSide === 'front') setFrontRotation(newRot);
        else setBackRotation(newRot);
      } else if (isFridgeMagnet) {
        setMagnetSlots((prev) => {
          const copy = [...prev];
          copy[activeMagnetIdx] = { ...copy[activeMagnetIdx], rotation: newRot };
          return copy;
        });
      } else if (isMiniGallery) {
        setMiniGallerySlots((prev) => {
          const copy = [...prev];
          copy[activeGalleryIdx] = { ...copy[activeGalleryIdx], rotation: newRot };
          return copy;
        });
      } else {
        setRotation(newRot);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    setInteractionType(null);
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch (_) {}
  };

  // Reset transforms
  const resetTransforms = () => {
    if (isDualSideEligible && printType === 'dual') {
      if (activeSide === 'front') {
        setFrontZoom(1); setFrontRotation(0); setFrontPosX(0); setFrontPosY(0); setFrontFlipH(false); setFrontFlipV(false);
      } else {
        setBackZoom(1); setBackRotation(0); setBackPosX(0); setBackPosY(0); setBackFlipH(false); setBackFlipV(false);
      }
    } else if (isFridgeMagnet) {
      setMagnetSlots((prev) => {
        const copy = [...prev];
        copy[activeMagnetIdx] = {
          ...copy[activeMagnetIdx],
          zoom: 1, rotation: 0, posX: 0, posY: 0, flipH: false, flipV: false,
        };
        return copy;
      });
    } else if (isMiniGallery) {
      setMiniGallerySlots((prev) => {
        const copy = [...prev];
        copy[activeGalleryIdx] = {
          ...copy[activeGalleryIdx],
          zoom: 1, rotation: 0, posX: 0, posY: 0, flipH: false, flipV: false,
        };
        return copy;
      });
    } else {
      setZoom(1); setRotation(0); setPosX(0); setPosY(0); setFlipH(false); setFlipV(false);
    }
  };

  // Save & Add To Cart
  const handleSaveAndAdd = async () => {
    setIsUploading(true);

    try {
      const previewBoxWidth = previewBoxRef.current?.offsetWidth || 300;

      // 1. Fridge Magnet Multi-Image Flow
      if (isFridgeMagnet) {
        const uploadedSlots = [];
        const activeSlots = magnetSlots.slice(0, magnetCount);

        for (const slot of activeSlots) {
          let photoUrl = slot.imagePreviewUrl || '';
          let artworkUrl = '';

          if (slot.imageFile) {
            const upRes = await uploadCustomPhoto(slot.imageFile);
            if (upRes) photoUrl = upRes.url;
          }

          if (slot.imagePreviewUrl) {
            const artBase64 = await generatePrintArtworkBlob(
              slot.imagePreviewUrl,
              slot.frameUrl,
              slot.zoom,
              slot.rotation,
              slot.posX,
              slot.posY,
              slot.flipH,
              slot.flipV,
              previewBoxWidth
            );
            if (artBase64) {
              const artRes = await uploadPrintArtwork(artBase64);
              if (artRes) artworkUrl = artRes.url;
            }
          }

          uploadedSlots.push({
            slot: slot.slot,
            name: slot.name,
            photoUrl: photoUrl || slot.frameUrl,
            artworkUrl: artworkUrl || undefined,
            shape: slot.shape,
          });
        }

        addToCart({
          productId: product.id,
          title: product.title,
          slug: product.slug,
          price: effectivePrice,
          image: uploadedSlots[0]?.artworkUrl || uploadedSlots[0]?.photoUrl || product.image_url,
          shape: currentShape,
          setOption: magnetSetOption,
          multiImages: uploadedSlots,
          quantity: 1,
        });

        setIsUploading(false);
        onClose();
        return;
      }

      // 2. Dual-Side Printing Flow (Car Stand / Car Hanging / Keychain)
      if (isDualSideEligible && printType === 'dual') {
        let frontUrl = frontPreviewUrl || '';
        let backUrl = backPreviewUrl || frontPreviewUrl || '';
        let frontArt = '';
        let backArt = '';

        if (frontImageFile) {
          const upRes = await uploadCustomPhoto(frontImageFile);
          if (upRes) frontUrl = upRes.url;
        }
        if (backImageFile) {
          const upRes = await uploadCustomPhoto(backImageFile);
          if (upRes) backUrl = upRes.url;
        }

        if (frontPreviewUrl) {
          const fArt = await generatePrintArtworkBlob(
            frontPreviewUrl,
            activeFrameUrl,
            frontZoom,
            frontRotation,
            frontPosX,
            frontPosY,
            frontFlipH,
            frontFlipV,
            previewBoxWidth,
            customText,
            textStyle
          );
          if (fArt) {
            const artRes = await uploadPrintArtwork(fArt);
            if (artRes) frontArt = artRes.url;
          }
        }

        if (backPreviewUrl) {
          const bArt = await generatePrintArtworkBlob(
            backPreviewUrl,
            activeFrameUrl,
            backZoom,
            backRotation,
            backPosX,
            backPosY,
            backFlipH,
            backFlipV,
            previewBoxWidth
          );
          if (bArt) {
            const artRes = await uploadPrintArtwork(bArt);
            if (artRes) backArt = artRes.url;
          }
        }

        addToCart({
          productId: product.id,
          title: product.title,
          slug: product.slug,
          price: effectivePrice,
          image: frontArt || activeFrameUrl || product.image_url,
          shape: currentShape,
          printType: 'dual',
          frontPhotoUrl: frontUrl || undefined,
          backPhotoUrl: backUrl || undefined,
          frontArtworkUrl: frontArt || undefined,
          backArtworkUrl: backArt || undefined,
          customText: customText.trim() || undefined,
          quantity: 1,
        });

        setIsUploading(false);
        onClose();
        return;
      }

      // 3. Mini Gallery Collage Flow
      if (isMiniGallery) {
        const uploadedMiniSlots = [];
        for (const slot of miniGallerySlots) {
          let photoUrl = slot.imagePreviewUrl || '';
          if (slot.imageFile) {
            const upRes = await uploadCustomPhoto(slot.imageFile);
            if (upRes) photoUrl = upRes.url;
          }
          uploadedMiniSlots.push({
            slot: slot.slot,
            photoUrl: photoUrl || activeFrameUrl,
          });
        }

        let mainArtUrl = '';
        const firstPhoto = miniGallerySlots.find((s) => s.imagePreviewUrl)?.imagePreviewUrl;
        if (firstPhoto) {
          const artBase64 = await generatePrintArtworkBlob(
            firstPhoto,
            activeFrameUrl,
            1, 0, 0, 0, false, false,
            previewBoxWidth
          );
          if (artBase64) {
            const artRes = await uploadPrintArtwork(artBase64);
            if (artRes) mainArtUrl = artRes.url;
          }
        }

        addToCart({
          productId: product.id,
          title: product.title,
          slug: product.slug,
          price: effectivePrice,
          image: mainArtUrl || activeFrameUrl || product.image_url,
          shape: currentShape,
          multiImages: uploadedMiniSlots,
          quantity: 1,
        });

        setIsUploading(false);
        onClose();
        return;
      }

      // 4. Standard Single Photo Flow
      let originalPhotoUrl = '';
      let printReadyArtworkUrl = '';

      if (imageFile) {
        const uploadRes = await uploadCustomPhoto(imageFile);
        if (uploadRes) originalPhotoUrl = uploadRes.url;
      }

      if (imagePreviewUrl) {
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
          if (artworkRes) printReadyArtworkUrl = artworkRes.url;
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
        price: effectivePrice,
        image: printReadyArtworkUrl || activeFrameUrl || product.image_url,
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
      console.error('Customizer add-to-cart error:', err);
      setIsUploading(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  // Active transform variables for canvas display
  const getActiveDisplayState = () => {
    if (isFridgeMagnet) {
      const s = magnetSlots[activeMagnetIdx];
      return {
        url: s?.imagePreviewUrl,
        zoom: s?.zoom ?? 1,
        rot: s?.rotation ?? 0,
        x: s?.posX ?? 0,
        y: s?.posY ?? 0,
        flipH: s?.flipH ?? false,
        flipV: s?.flipV ?? false,
        frameUrl: s?.frameUrl || activeFrameUrl,
      };
    }
    if (isDualSideEligible && printType === 'dual') {
      if (activeSide === 'front') {
        return {
          url: frontPreviewUrl,
          zoom: frontZoom,
          rot: frontRotation,
          x: frontPosX,
          y: frontPosY,
          flipH: frontFlipH,
          flipV: frontFlipV,
          frameUrl: activeFrameUrl,
        };
      } else {
        return {
          url: backPreviewUrl,
          zoom: backZoom,
          rot: backRotation,
          x: backPosX,
          y: backPosY,
          flipH: backFlipH,
          flipV: backFlipV,
          frameUrl: activeFrameUrl,
        };
      }
    }
    if (isMiniGallery) {
      const s = miniGallerySlots[activeGalleryIdx];
      return {
        url: s?.imagePreviewUrl,
        zoom: s?.zoom ?? 1,
        rot: s?.rotation ?? 0,
        x: s?.posX ?? 0,
        y: s?.posY ?? 0,
        flipH: s?.flipH ?? false,
        flipV: s?.flipV ?? false,
        frameUrl: activeFrameUrl,
      };
    }
    return {
      url: imagePreviewUrl,
      zoom,
      rot: rotation,
      x: posX,
      y: posY,
      flipH,
      flipV,
      frameUrl: activeFrameUrl,
    };
  };

  const activeState = getActiveDisplayState();
  const hasCurrentPhoto = Boolean(activeState.url);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/70 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />
      <input
        type="file"
        ref={magnetFileInputRef}
        onChange={handleMagnetFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />
      <input
        type="file"
        ref={galleryFileInputRef}
        onChange={handleGalleryFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      {/* Slide-over Drawer Container */}
      <div className="relative w-full max-w-lg bg-white text-stone-900 h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
        
        {/* Header */}
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
                {isFridgeMagnet 
                  ? `Customize Magnet Pack (${magnetSetOption})` 
                  : isDualSideEligible && printType === 'dual'
                  ? `Dual-Side 3D Customizer`
                  : isMiniGallery
                  ? `Mini Gallery Multi-Photo Collage`
                  : `Upload Personalize Photo`}
              </h2>
              <p className="text-[11px] font-medium text-stone-500 hidden xs:block truncate">
                {isFridgeMagnet 
                  ? `Magnet ${activeMagnetIdx + 1} of ${magnetCount} Selected`
                  : isDualSideEligible && printType === 'dual'
                  ? `Editing ${activeSide === 'front' ? 'Front Side' : 'Back Side'}`
                  : hasCurrentPhoto 
                  ? 'Move, scale and align inside frame' 
                  : 'Select your high-definition photo'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-[11px] font-extrabold text-primary-800">
              ₹{effectivePrice} (Free Ship)
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 space-y-4 bg-stone-50/50">
          
          {/* FRIDGE MAGNET MULTI-SLOT HEADER TABS */}
          {isFridgeMagnet && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <Grid className="h-4 w-4 text-primary-600" />
                  Select Magnet to Edit:
                </span>
                <div className="flex items-center gap-1 bg-stone-200/80 p-0.5 rounded-lg text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setMagnetViewMode('single')}
                    className={`px-2 py-0.5 rounded-md ${magnetViewMode === 'single' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'}`}
                  >
                    Edit Single
                  </button>
                  <button
                    type="button"
                    onClick={() => setMagnetViewMode('grid')}
                    className={`px-2 py-0.5 rounded-md ${magnetViewMode === 'grid' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'}`}
                  >
                    Set Preview
                  </button>
                </div>
              </div>

              {/* Magnet Slot Buttons */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                {magnetSlots.slice(0, magnetCount).map((slot, idx) => {
                  const hasImg = Boolean(slot.imagePreviewUrl);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setActiveMagnetIdx(idx);
                        setMagnetViewMode('single');
                      }}
                      className={`relative flex flex-col items-center justify-center p-1.5 rounded-xl border transition-all ${
                        activeMagnetIdx === idx
                          ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-600/30'
                          : 'border-stone-200 bg-white hover:bg-stone-50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 flex items-center justify-center">
                        {hasImg ? (
                          <img src={slot.imagePreviewUrl!} alt={`M${idx+1}`} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-stone-400" />
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-stone-800 mt-1">M{idx + 1}</span>
                      {hasImg && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[8px] font-bold">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* DUAL-SIDE CONTROLS (FRONT / BACK TABS & 3D FLIP) */}
          {isDualSideEligible && printType === 'dual' && (
            <div className="rounded-2xl border border-stone-200 bg-white p-3 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-primary-600" />
                  Dual-Side Print Studio
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsFlipped3D((f) => !f);
                    setActiveSide((s) => (s === 'front' ? 'back' : 'front'));
                  }}
                  className="flex items-center gap-1 rounded-lg bg-stone-900 text-amber-300 px-2.5 py-1 text-xs font-bold hover:bg-stone-800 transition-all shadow-xs"
                >
                  <RotateCw className="h-3 w-3" />
                  <span>Flip to {activeSide === 'front' ? 'Back' : 'Front'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveSide('front');
                    setIsFlipped3D(false);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                    activeSide === 'front'
                      ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  Side A (Front) {frontPreviewUrl ? '✓' : ''}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveSide('back');
                    setIsFlipped3D(true);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                    activeSide === 'back'
                      ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  Side B (Back) {backPreviewUrl ? '✓' : ''}
                </button>
              </div>
            </div>
          )}

          {/* MINI GALLERY MULTI-FRAME SLOTS */}
          {isMiniGallery && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900 block">
                  Mini Gallery Collage Slots (Select Frame to Customize):
                </span>
                <div className="flex items-center gap-1 bg-stone-200/80 p-0.5 rounded-lg text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setGalleryViewMode('single')}
                    className={`px-2 py-0.5 rounded-md ${galleryViewMode === 'single' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'}`}
                  >
                    Edit Single
                  </button>
                  <button
                    type="button"
                    onClick={() => setGalleryViewMode('grid')}
                    className={`px-2 py-0.5 rounded-md ${galleryViewMode === 'grid' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'}`}
                  >
                    Collage Preview
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {miniGallerySlots.map((slot, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveGalleryIdx(idx);
                      setGalleryViewMode('single');
                    }}
                    className={`flex flex-col items-center p-2 rounded-xl border transition-all ${
                      activeGalleryIdx === idx && galleryViewMode === 'single'
                        ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-600/30'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 flex items-center justify-center">
                      {slot.imagePreviewUrl ? (
                        <img src={slot.imagePreviewUrl} alt={`F${idx+1}`} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-stone-400" />
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-stone-700 mt-1">Frame {idx + 1}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CANVAS STAGE */}
          {isFridgeMagnet && magnetViewMode === 'grid' ? (
            /* Complete Refrigerator Set Preview */
            <div className="relative rounded-3xl border border-stone-300 bg-gradient-to-b from-slate-200 via-slate-100 to-slate-200 p-6 min-h-[350px] flex flex-col items-center justify-center shadow-inner select-none">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-3">
                Refrigerator Door Preview ({magnetSetOption})
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-sm">
                {magnetSlots.slice(0, magnetCount).map((slot, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      setActiveMagnetIdx(idx);
                      setMagnetViewMode('single');
                    }}
                    className="relative aspect-square rounded-2xl overflow-hidden border-2 border-white/80 bg-white shadow-lg cursor-pointer hover:scale-105 transition-transform group"
                  >
                    {slot.imagePreviewUrl ? (
                      <img src={slot.imagePreviewUrl} alt={slot.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 text-stone-400 p-2 text-center">
                        <ImageIcon className="w-5 h-5 mb-1" />
                        <span className="text-[9px] font-bold">Add Photo</span>
                      </div>
                    )}
                    <span className="absolute bottom-1 right-1 rounded bg-stone-900/80 px-1 py-0.5 text-[8px] font-bold text-white">
                      M{idx+1}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[11px] text-slate-500 font-medium">
                Click any magnet above to upload or adjust its photo
              </p>
            </div>
          ) : isMiniGallery && galleryViewMode === 'grid' ? (
            /* Complete Mini Gallery Collage Preview — shows all 4 frames together */
            <div className="relative rounded-3xl border border-stone-300 bg-gradient-to-b from-slate-200 via-slate-100 to-slate-200 p-6 min-h-[350px] flex flex-col items-center justify-center shadow-inner select-none">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-3">
                Mini Gallery Collage Preview (4 Frames)
              </span>
              <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                {miniGallerySlots.map((slot, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setActiveGalleryIdx(idx);
                      setGalleryViewMode('single');
                    }}
                    className="relative aspect-square rounded-2xl overflow-hidden border-2 border-white/80 bg-white shadow-lg cursor-pointer hover:scale-105 transition-transform group"
                  >
                    {slot.imagePreviewUrl ? (
                      <img src={slot.imagePreviewUrl} alt={`Frame ${idx + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 text-stone-400 p-2 text-center">
                        <ImageIcon className="w-5 h-5 mb-1" />
                        <span className="text-[9px] font-bold">Add Photo</span>
                      </div>
                    )}
                    <span className="absolute bottom-1 right-1 rounded bg-stone-900/80 px-1 py-0.5 text-[8px] font-bold text-white">
                      F{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[11px] text-slate-500 font-medium">
                Click any frame above to upload or adjust its photo
              </p>
            </div>
          ) : (
            /* Single Interactive Studio Stage */
            <div className="relative rounded-3xl border border-stone-200/90 bg-gradient-to-b from-stone-100 via-stone-50 to-stone-100 p-4 sm:p-6 flex flex-col items-center justify-center min-h-[350px] select-none shadow-inner overflow-hidden">
              
              {/* Top Keyring Loop if charm */}
              {(product.category_slug?.includes('key') || product.title.toLowerCase().includes('keychain')) && (
                <div className="flex flex-col items-center -mb-2 z-20 pointer-events-none">
                  <div className="w-10 h-10 rounded-full border-4 border-slate-300 bg-transparent shadow-md ring-1 ring-slate-400/40 relative">
                    <div className="absolute inset-0.5 rounded-full border border-slate-200" />
                  </div>
                  <div className="w-2.5 h-4 border-2 border-slate-400 bg-slate-200 rounded-full -mt-1 shadow-sm" />
                </div>
              )}

              {/* Interactive Stage Frame */}
              <div 
                className="relative flex h-72 w-72 sm:h-80 sm:w-80 items-center justify-center drop-shadow-2xl transition-transform duration-500"
                style={{
                  perspective: 1000,
                  transform: isFlipped3D ? 'rotateY(180deg)' : 'none',
                }}
              >
                {!hasCurrentPhoto ? (
                  <div 
                    onClick={() => {
                      if (isFridgeMagnet) magnetFileInputRef.current?.click();
                      else if (isMiniGallery) galleryFileInputRef.current?.click();
                      else fileInputRef.current?.click();
                    }}
                    className="relative h-64 w-64 sm:h-72 sm:w-72 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group"
                  >
                    <div 
                      className="absolute inset-0 bg-stone-200/90 border-2 border-dashed border-stone-400 group-hover:border-primary-600 group-hover:bg-stone-300/60 transition-all"
                      style={{
                        WebkitMaskImage: `url("${activeState.frameUrl}")`,
                        maskImage: `url("${activeState.frameUrl}")`,
                        WebkitMaskSize: 'contain',
                        maskSize: 'contain',
                        WebkitMaskRepeat: 'no-repeat',
                        maskRepeat: 'no-repeat',
                        WebkitMaskPosition: 'center',
                        maskPosition: 'center',
                      }}
                    />

                    <div className="relative z-10 flex flex-col items-center justify-center p-4 text-center pointer-events-none">
                      <div className="h-14 w-14 rounded-full bg-white shadow-lg flex items-center justify-center text-primary-600 mb-2 group-hover:scale-110 transition-transform">
                        <ImageIcon className="h-7 w-7 animate-pulse" />
                      </div>
                      <span className="text-sm font-black text-stone-900 drop-shadow-sm">
                        {isFridgeMagnet ? `Upload Magnet ${activeMagnetIdx + 1} Photo` : 'Upload & Fit Inside Frame'}
                      </span>
                      <span className="text-[11px] text-stone-600 mt-1 font-semibold">
                        Click here to choose photo
                      </span>
                    </div>
                  </div>
                ) : (
                  <div 
                    ref={previewBoxRef}
                    className="relative h-64 w-64 sm:h-72 sm:w-72 select-none touch-none"
                  >
                    {/* Masked Photo */}
                    <div
                      className="relative w-full h-full overflow-hidden"
                      style={{
                        WebkitMaskImage: `url("${activeState.frameUrl}")`,
                        maskImage: `url("${activeState.frameUrl}")`,
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
                      <div
                        className={`h-full w-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                        style={{
                          transform: `translate(${activeState.x}px, ${activeState.y}px) rotate(${activeState.rot}deg) scale(${activeState.zoom * (activeState.flipH ? -1 : 1)}, ${activeState.zoom * (activeState.flipV ? -1 : 1)})`,
                          transformOrigin: 'center center',
                          transition: isDragging ? 'none' : 'transform 0.08s ease-out',
                        }}
                      >
                        <img
                          src={activeState.url!}
                          alt="Custom preview"
                          className="h-full w-full object-cover pointer-events-none select-none"
                          draggable={false}
                        />
                      </div>

                      {/* Acrylic Reflection */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-white/10 opacity-70" />
                      <div className="pointer-events-none absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/30 blur-2xl" />

                      {/* Engraved Name Inscription */}
                      {customText.trim() && !isFridgeMagnet && (
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

                      {/* BG Removal Processing Overlay */}
                      {isBgRemoving && (
                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                          <Wand2 className="h-6 w-6 text-violet-400 animate-pulse mb-2" />
                          <p className="text-[11px] font-semibold text-violet-200 text-center">Removing background…</p>
                        </div>
                      )}
                    </div>

                    {/* Transform Handles Overlay */}
                    <div className="absolute inset-0 pointer-events-none rounded-2xl border border-sky-500/50">
                      <div 
                        className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto cursor-grab active:cursor-grabbing group"
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          handlePointerDown(e, 'rotate-stem');
                        }}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                        title="Drag to rotate"
                      >
                        <div className="w-5 h-5 rounded-full bg-sky-500 text-white shadow-md flex items-center justify-center ring-2 ring-white hover:scale-110 transition-transform">
                          <RotateCw className="w-3 h-3 group-hover:rotate-45 transition-transform" />
                        </div>
                        <div className="w-0.5 h-2.5 bg-sky-400" />
                      </div>

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
                            title="Drag corner to scale"
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Floating Quick Action Toolbar */}
              {hasCurrentPhoto && (
                <div className="mt-4 z-20 flex flex-wrap items-center justify-center gap-1.5 bg-white/95 backdrop-blur-md border border-stone-200/90 px-3 py-1.5 rounded-full shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      const newZ = Math.max(0.4, +(activeState.zoom - 0.1).toFixed(2));
                      if (isDualSideEligible && printType === 'dual') {
                        if (activeSide === 'front') setFrontZoom(newZ); else setBackZoom(newZ);
                      } else if (isFridgeMagnet) {
                        setMagnetSlots((prev) => {
                          const c = [...prev]; c[activeMagnetIdx] = { ...c[activeMagnetIdx], zoom: newZ }; return c;
                        });
                      } else { setZoom(newZ); }
                    }}
                    className="p-1.5 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="text-[11px] font-mono font-bold text-stone-800 px-1 min-w-[42px] text-center">
                    {Math.round(activeState.zoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const newZ = Math.min(3.5, +(activeState.zoom + 0.1).toFixed(2));
                      if (isDualSideEligible && printType === 'dual') {
                        if (activeSide === 'front') setFrontZoom(newZ); else setBackZoom(newZ);
                      } else if (isFridgeMagnet) {
                        setMagnetSlots((prev) => {
                          const c = [...prev]; c[activeMagnetIdx] = { ...c[activeMagnetIdx], zoom: newZ }; return c;
                        });
                      } else { setZoom(newZ); }
                    }}
                    className="p-1.5 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>

                  <div className="h-4 w-[1px] bg-stone-200 mx-0.5" />

                  <button
                    type="button"
                    onClick={() => {
                      const newR = (activeState.rot + 90) % 360;
                      if (isDualSideEligible && printType === 'dual') {
                        if (activeSide === 'front') setFrontRotation(newR); else setBackRotation(newR);
                      } else if (isFridgeMagnet) {
                        setMagnetSlots((prev) => {
                          const c = [...prev]; c[activeMagnetIdx] = { ...c[activeMagnetIdx], rotation: newR }; return c;
                        });
                      } else { setRotation(newR); }
                    }}
                    className="p-1.5 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                    title="Rotate 90°"
                  >
                    <RotateCw className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={resetTransforms}
                    className="p-1.5 rounded-full text-stone-500 hover:text-amber-600 hover:bg-stone-100 transition-colors"
                    title="Reset Photo Transforms"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 1: Upload Prompt If No Photo */}
          {!hasCurrentPhoto ? (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  if (isFridgeMagnet) magnetFileInputRef.current?.click();
                  else if (isMiniGallery) galleryFileInputRef.current?.click();
                  else fileInputRef.current?.click();
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-700 py-3 text-sm font-bold text-white shadow-md shadow-primary-600/20 hover:shadow-lg transition-all active:scale-[0.99]"
              >
                <ImageIcon className="h-5 w-5" />
                <span>
                  {isFridgeMagnet 
                    ? `Upload Photo for Magnet ${activeMagnetIdx + 1}` 
                    : isDualSideEligible && printType === 'dual'
                    ? `Upload ${activeSide === 'front' ? 'Front' : 'Back'} Photo`
                    : `Select & Upload Photo`}
                </span>
              </button>

              {/* Instructions */}
              <div className="rounded-2xl border border-stone-200 bg-white p-4 space-y-2 text-xs text-stone-600 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-stone-900 flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-stone-700" />
                    Print Guidelines
                  </h4>
                  {bgRemovalEnabled && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 border border-violet-200 px-2.5 py-0.5 text-[10px] font-bold text-violet-800">
                      <Wand2 className="h-3 w-3 text-violet-600" />
                      Auto Cutout Available
                    </span>
                  )}
                </div>
                <ul className="space-y-1.5 text-[11px] list-disc list-inside text-stone-600">
                  <li>Supported formats: High-Res JPEG, PNG or WebP</li>
                  <li>Photos are directly UV-cured on high-clarity cast acrylic</li>
                  <li>Interactive controls allow full zoom, rotate, and center alignment</li>
                </ul>
              </div>
            </div>
          ) : (
            /* STEP 2: Photo Customizer Tools */
            <div className="space-y-3">
              {/* Background Removal Action (ONLY for transparent acrylic photo frames) */}
              {bgRemovalEnabled && (
                <div className="rounded-2xl border border-violet-200 bg-violet-50/70 p-3 flex flex-col gap-2 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-violet-950 block flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-violet-600" />
                        AI Background Cutout Tool
                      </span>
                      <span className="text-[10px] text-violet-700">
                        {isBgRemoving
                          ? bgRemoveStatus || 'Detecting subject cleanly...'
                          : isBgRemoved
                          ? 'Transparent cutout applied (Subject preserved cleanly)'
                          : 'Remove backdrop for crystal transparent look'}
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={isBgRemoving}
                      onClick={handleToggleBgRemoval}
                      className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 disabled:opacity-60 ${
                        isBgRemoved
                          ? 'bg-white text-stone-800 border border-stone-300 hover:bg-stone-50'
                          : 'bg-violet-600 text-white hover:bg-violet-700 shadow-violet-600/20'
                      }`}
                    >
                      {isBgRemoving ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                          <span>{bgRemovePercent > 0 ? `${bgRemovePercent}% Cutout` : 'Processing AI...'}</span>
                        </>
                      ) : isBgRemoved ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 text-stone-600" />
                          <span>Restore Original</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-3.5 w-3.5 text-violet-200" />
                          <span>{bgRemoveError ? 'Retry Cutout' : 'Auto Cutout BG'}</span>
                        </>
                      )}
                    </button>
                  </div>
                  {bgRemoveError && !isBgRemoving && (
                    <p className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5">
                      ⚠️ {bgRemoveError}
                    </p>
                  )}
                </div>
              )}

              {/* Tools Tabs */}
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
                  <Sliders className="h-3.5 w-3.5 text-primary-600" />
                  <span>Adjust Photo</span>
                </button>

                {!isFridgeMagnet && (
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
                    <span>Plate Text</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (isFridgeMagnet) magnetFileInputRef.current?.click();
                    else if (isMiniGallery) galleryFileInputRef.current?.click();
                    else fileInputRef.current?.click();
                  }}
                  className="px-3 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1 rounded-xl transition-colors hover:bg-white/80"
                  title="Choose another image"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Swap Photo</span>
                </button>
              </div>

              {/* Tab 1: Adjust Details */}
              {activeTab === 'adjust' && (
                <div className="rounded-2xl border border-stone-200 bg-white p-4 space-y-3.5 shadow-sm">
                  {/* Zoom controls */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold text-stone-800">
                      <span className="flex items-center gap-1.5">
                        <ZoomIn className="h-3.5 w-3.5 text-primary-600" />
                        Scale / Zoom
                      </span>
                      <span className="font-mono text-stone-600">{Math.round(activeState.zoom * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0.4"
                        max="3.0"
                        step="0.05"
                        value={activeState.zoom}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (isDualSideEligible && printType === 'dual') {
                            if (activeSide === 'front') setFrontZoom(val); else setBackZoom(val);
                          } else if (isFridgeMagnet) {
                            setMagnetSlots((prev) => {
                              const c = [...prev]; c[activeMagnetIdx] = { ...c[activeMagnetIdx], zoom: val }; return c;
                            });
                          } else { setZoom(val); }
                        }}
                        className="w-full accent-primary-600 h-2 bg-stone-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Rotation controls */}
                  <div className="space-y-1.5 pt-2 border-t border-stone-100">
                    <div className="flex justify-between items-center text-xs font-bold text-stone-800">
                      <span className="flex items-center gap-1.5">
                        <RotateCw className="h-3.5 w-3.5 text-amber-600" />
                        Rotation Angle
                      </span>
                      <span className="font-mono text-stone-600">{activeState.rot}°</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        step="1"
                        value={activeState.rot}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (isDualSideEligible && printType === 'dual') {
                            if (activeSide === 'front') setFrontRotation(val); else setBackRotation(val);
                          } else if (isFridgeMagnet) {
                            setMagnetSlots((prev) => {
                              const c = [...prev]; c[activeMagnetIdx] = { ...c[activeMagnetIdx], rotation: val }; return c;
                            });
                          } else { setRotation(val); }
                        }}
                        className="w-full accent-primary-600 h-2 bg-stone-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Engraved Plate Text */}
              {activeTab === 'text' && !isFridgeMagnet && (
                <div className="rounded-2xl border border-stone-200 bg-white p-4 space-y-3 shadow-sm">
                  <label className="text-xs font-bold text-stone-900 block">
                    Custom Plate Inscription (Optional):
                  </label>
                  <input
                    type="text"
                    maxLength={35}
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="e.g. Always & Forever ❤️"
                    className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:border-primary-600 focus:bg-white focus:outline-none"
                  />
                  <div className="grid grid-cols-3 gap-2 pt-1">
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
                          textStyle === st.id ? 'ring-2 ring-primary-600 scale-[1.02]' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Sticky Bottom Save Action Bar */}
        <div className="sticky bottom-0 z-30 border-t border-stone-200 bg-white p-4 sm:p-5 shadow-lg">
          <button
            type="button"
            disabled={isUploading}
            onClick={handleSaveAndAdd}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-700 py-3 text-sm font-bold text-white shadow-md shadow-primary-600/20 hover:shadow-lg transition-all disabled:opacity-60 active:scale-[0.99]"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating High-Res Proof & Saving...</span>
              </>
            ) : hasCurrentPhoto ? (
              <>
                <Check className="h-5 w-5" />
                <span>Save & Continue (₹{effectivePrice})</span>
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                <span>Upload Photo & Continue</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
