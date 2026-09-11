'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Sparkles, ArrowRight, ShieldCheck, Truck, Star, 
  ChevronRight, ChevronLeft, ShoppingBag, Eye,
  Play, Pause, Award, Zap
} from 'lucide-react';
import { HeroSlide } from '@/lib/api';

export interface HeroSectionProps {
  initialSlides?: HeroSlide[];
  initialMode?: 'slider' | 'split';
  initialAutoplay?: boolean;
  interval?: number;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    tag: 'Trending • Pan-India Favorite',
    title: 'Laser Cut Acrylic Fridge Magnets',
    subtitle: 'From wavy artistic contours to floral and geometric shapes. Printed with Japanese fade-resistant UV ink technology.',
    price: 'Special Combo from ₹199',
    price_text: 'Special Combo from ₹199',
    image: '/banners/hero_fridge_magnets.jpg',
    categoryLink: '/shop?category=fridge-magnet',
    link: '/shop?category=fridge-magnet',
    badge: 'Best Seller',
    button_text: 'Customize Magnet',
    gradient: 'from-amber-500/20 via-primary-500/10 to-transparent'
  },
  {
    tag: 'Artisan Caricature Keepsakes',
    title: 'Custom Carrycature Portrait Stands',
    subtitle: 'Handcrafted fun caricatures on crystal-clear acrylic with laser-cut edges and natural wood base.',
    price: 'Starting at ₹449',
    price_text: 'Starting at ₹449',
    image: '/banners/hero_carrycature.jpg',
    categoryLink: '/shop?category=carrycature',
    link: '/shop?category=carrycature',
    badge: 'Popular',
    button_text: 'Create Portrait',
    gradient: 'from-rose-500/20 via-primary-500/10 to-transparent'
  },
  {
    tag: 'Car Interior Accessories',
    title: 'Custom Rearview Car Hanging & Dash Stands',
    subtitle: 'Heat-resistant, UV-stabilized acrylic charms with silky tassels and solid pedestals for your vehicle.',
    price: 'Starting at ₹299',
    price_text: 'Starting at ₹299',
    image: '/banners/hero_car_hanging.jpg',
    categoryLink: '/shop?category=car-hanging',
    link: '/shop?category=car-hanging',
    badge: 'New Launch',
    button_text: 'Personalize Charm',
    gradient: 'from-blue-500/20 via-primary-500/10 to-transparent'
  },
  {
    tag: 'Artisan Desktop Art',
    title: 'Geometric Mini Gallery & Diamond Photostands',
    subtitle: 'Modular hexagonal acrylic panels and crystal-clear photo blocks that turn your favorite snapshots into museum-grade art.',
    price: 'From ₹359',
    price_text: 'From ₹359',
    image: '/banners/hero_photostand.jpg',
    categoryLink: '/shop?category=photostand',
    link: '/shop?category=photostand',
    badge: 'Premium',
    button_text: 'Shop Gallery Blocks',
    gradient: 'from-emerald-500/20 via-primary-500/10 to-transparent'
  }
];

export default function HeroSection({
  initialSlides,
  initialMode = 'slider',
  initialAutoplay = true,
  interval = 5000,
}: HeroSectionProps) {
  // Use passed initialSlides or fallback
  const slides: HeroSlide[] = (initialSlides && initialSlides.length > 0) ? initialSlides : DEFAULT_SLIDES;

  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  // Touch swipe support for mobile
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Safe active slide index
  const safeIndex = activeSlide >= slides.length ? 0 : activeSlide;
  const slide = slides[safeIndex] || DEFAULT_SLIDES[0];

  // Autoplay and progress bar
  useEffect(() => {
    if (!initialAutoplay || isPaused || slides.length <= 1) {
      setProgress(0);
      return;
    }

    const stepMs = 50;
    const increment = (stepMs / interval) * 100;

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveSlide((curr) => (curr + 1) % slides.length);
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);

    return () => clearInterval(progressTimer);
  }, [initialAutoplay, isPaused, interval, safeIndex, slides.length]);

  const handlePrev = () => {
    setProgress(0);
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setProgress(0);
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const goToSlide = (index: number) => {
    setProgress(0);
    setActiveSlide(index);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;
    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const currentLink = slide.categoryLink || slide.link || '/shop';
  const currentPrice = slide.price_text || slide.price || 'Special Edition';
  const currentButtonText = slide.button_text || 'Customize Now';
  const currentBadge = slide.badge || 'Featured';
  const currentTag = slide.tag || 'Handcrafted Precision';
  const currentGradient = slide.gradient || 'from-primary-500/20 via-primary-500/10 to-transparent';

  // Check if image is an uploaded full-banner URL vs product cutout
  const isCustomUploaded = slide.image.startsWith('http') || slide.image.startsWith('/uploads');

  return (
    <section 
      className="relative overflow-hidden bg-gradient-to-b from-stone-950 via-[#0f1015] to-stone-950 text-white select-none border-b border-stone-800/80"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Dynamic Background Ambient Glow */}
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-tr ${currentGradient} opacity-60 transition-all duration-1000`} />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[450px] w-[800px] -translate-x-1/2 rounded-full bg-primary-500/15 blur-[160px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-primary-600/10 blur-[120px]" />

      {/* Main Slide Presentation Container */}
      <div className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 min-h-[540px] sm:min-h-[600px] flex flex-col justify-between">
        
        {/* Slide Content Grid */}
        <div className="grid grid-cols-1 items-center gap-6 sm:gap-10 lg:grid-cols-12 lg:gap-12 flex-1">
          
          {/* Left Text & Actions Column */}
          <div className="space-y-4 sm:space-y-6 lg:col-span-7 transition-all duration-500 z-10 text-center lg:text-left">
            
            {/* Top Pill / Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-950/70 px-3.5 py-1.5 text-xs font-bold text-primary-200 backdrop-blur-md shadow-lg">
              <Sparkles className="h-3.5 w-3.5 text-primary-300 animate-pulse" />
              <span>{currentTag}</span>
              <span className="rounded-full bg-primary-500/30 px-2 py-0.5 text-[10px] text-white font-extrabold uppercase tracking-wider">
                {currentBadge}
              </span>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight text-white leading-[1.15] drop-shadow-md">
                {slide.title}
              </h1>
              <p className="max-w-xl mx-auto lg:mx-0 text-xs sm:text-base text-stone-300 leading-relaxed font-normal">
                {slide.subtitle}
              </p>
            </div>

            {/* Action CTA Buttons & Price */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-1 sm:pt-2">
              <Link
                href={currentLink}
                className="group inline-flex items-center gap-2 rounded-full bg-primary-500 px-6 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-sm font-extrabold text-white shadow-xl shadow-primary-950/60 hover:bg-primary-600 transition-all hover:scale-105"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>{currentButtonText}</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              {slide.secondary_button_text ? (
                <Link
                  href={slide.secondary_button_link || currentLink}
                  className="inline-flex items-center gap-2 rounded-full border border-stone-700 bg-stone-900/80 px-5 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-stone-200 backdrop-blur-md hover:bg-stone-800 hover:text-white transition-all"
                >
                  <span>{slide.secondary_button_text}</span>
                  <ChevronRight className="h-4 w-4 text-stone-400" />
                </Link>
              ) : (
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 rounded-full border border-stone-700 bg-stone-900/80 px-5 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-stone-200 backdrop-blur-md hover:bg-stone-800 hover:text-white transition-all"
                >
                  <span>Explore Catalog</span>
                  <ChevronRight className="h-4 w-4 text-stone-400" />
                </Link>
              )}

              {currentPrice && (
                <div className="inline-flex items-center rounded-2xl bg-stone-900/90 border border-stone-800 px-3.5 py-2">
                  <span className="text-xs font-extrabold text-primary-300 tracking-wide">
                    {currentPrice}
                  </span>
                </div>
              )}
            </div>

            {/* Quality & Trust Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 pt-3 sm:pt-4 border-t border-stone-800/80 text-[11px] sm:text-xs text-stone-400 font-semibold">
              <div className="flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-primary-400" />
                <span>Pan-India Safe Express Delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>100% Japanese Fade-Proof UV Inks</span>
              </div>
            </div>
          </div>

          {/* Right Image Showcase Card */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <div className="relative w-full max-w-[340px] sm:max-w-md">
              
              {/* Glass / Acrylic Card Container */}
              <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-stone-900/80 p-3 sm:p-4 backdrop-blur-2xl shadow-2xl shadow-black/80 group">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-stone-950/80 flex items-center justify-center">
                  
                  {/* Active Slide Image */}
                  <img
                    key={slide.image + safeIndex}
                    src={slide.image}
                    alt={slide.title}
                    className={`h-full w-full ${isCustomUploaded ? 'object-cover' : 'object-contain p-4'} transition-all duration-700 group-hover:scale-105`}
                  />
                  
                  {/* Subtle Gloss Reflection Flare */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
                  
                  {/* Top-Right Badge */}
                  <div className="absolute top-3 right-3 rounded-full bg-black/80 px-3 py-1 text-[11px] font-bold text-primary-200 backdrop-blur-md border border-white/15 shadow-lg flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-primary-400" />
                    <span>Live Studio Preview</span>
                  </div>

                  {/* Bottom Quick-Action Overlay Bar */}
                  <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-white/15 bg-black/85 p-2.5 sm:p-3 backdrop-blur-md flex items-center justify-between shadow-lg">
                    <div className="truncate pr-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary-400 block">
                        Featured Art
                      </span>
                      <h4 className="text-xs sm:text-sm font-black text-white truncate">
                        {slide.title}
                      </h4>
                    </div>
                    <Link
                      href={currentLink}
                      className="h-8 w-8 rounded-lg bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 transition-colors flex-shrink-0"
                      aria-label="View Product"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Prev / Next Floating Navigation Buttons */}
              {slides.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 h-9 w-9 sm:h-11 sm:w-11 rounded-full border border-stone-700 bg-stone-950/90 text-white shadow-2xl flex items-center justify-center hover:bg-primary-500 hover:border-primary-500 transition-all z-20 hover:scale-110 active:scale-95"
                    aria-label="Previous Slide"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <button
                    onClick={handleNext}
                    className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 h-9 w-9 sm:h-11 sm:w-11 rounded-full border border-stone-700 bg-stone-950/90 text-white shadow-2xl flex items-center justify-center hover:bg-primary-500 hover:border-primary-500 transition-all z-20 hover:scale-110 active:scale-95"
                    aria-label="Next Slide"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Slide Indicators, Thumbnails & Autoplay Progress Bar */}
        {slides.length > 1 && (
          <div className="mt-8 pt-4 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Quick Slide Navigation Mini Cards */}
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 max-w-full scrollbar-none">
              {slides.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`flex items-center gap-2 rounded-xl px-2.5 sm:px-3 py-1.5 border transition-all text-left flex-shrink-0 ${
                    safeIndex === idx 
                      ? 'border-primary-500 bg-primary-950/70 ring-1 ring-primary-500/50 scale-105' 
                      : 'border-stone-800 bg-stone-900/40 hover:bg-stone-800/60 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={s.image} 
                    alt={s.title} 
                    className="h-6 w-6 rounded-md object-cover bg-stone-950" 
                  />
                  <div className="text-[11px] pr-1 hidden sm:block">
                    <span className="font-bold text-white block leading-tight truncate max-w-[100px]">
                      {s.title.split(' ').slice(0, 2).join(' ')}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Pagination Dots & Autoplay Timer Progress */}
            <div className="flex items-center gap-3 self-center sm:self-auto">
              
              {/* Dots */}
              <div className="flex items-center gap-1.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      safeIndex === idx ? 'w-7 bg-primary-400' : 'w-2 bg-stone-700 hover:bg-stone-500'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Progress Bar & Pause Indicator */}
              {initialAutoplay && (
                <div className="flex items-center gap-2 pl-2 border-l border-stone-800">
                  <div className="w-12 h-1.5 bg-stone-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-500 rounded-full transition-all duration-75"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className="p-1 rounded-md text-stone-400 hover:text-white"
                    title={isPaused ? 'Resume autoplay' : 'Pause slider'}
                    aria-label={isPaused ? 'Resume autoplay' : 'Pause slider'}
                  >
                    {isPaused ? <Play className="h-3 w-3 text-primary-400" /> : <Pause className="h-3 w-3" />}
                  </button>
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </section>
  );
}
