'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, ArrowRight, ShieldCheck, Truck, Star, 
  Layers, Palette, Award, ChevronRight, ChevronLeft,
  Flame, ShoppingBag, Eye
} from 'lucide-react';

export interface HeroSectionProps {
  initialMode?: 'split' | 'slider';
  initialAutoplay?: boolean;
  interval?: number;
}

const slides = [
  {
    tag: 'Trending • Pan-India Favorite',
    title: 'Laser Cut Fridge Magnets',
    subtitle: 'From wavy artistic contours to floral and geometric shapes. Printed with Japanese fade-resistant UV ink technology.',
    price: 'Special Combo from ₹199',
    image: '/frames/fridge-magnet/1_nos_a.png',
    categoryLink: '/shop?category=fridge-magnet',
    badge: 'Best Seller',
    gradient: 'from-amber-500/20 via-primary-500/10 to-transparent'
  },
  {
    tag: 'Artisan Caricature Keepsakes',
    title: 'Custom Carrycature Portrait Stands',
    subtitle: 'Handcrafted fun caricatures on crystal-clear acrylic with laser-cut edges and natural wood base.',
    price: 'Starting at ₹449',
    image: '/frames/carrycature/1_nos_a.png',
    categoryLink: '/shop?category=carrycature',
    badge: 'Popular',
    gradient: 'from-rose-500/20 via-primary-500/10 to-transparent'
  },
  {
    tag: 'Car Interior Accessories',
    title: 'Custom Rearview Car Hanging & Dash Stands',
    subtitle: 'Heat-resistant, UV-stabilized acrylic charms with silky tassels and solid pedestals for your vehicle.',
    price: 'Starting at ₹299',
    image: '/frames/car-hanging/2_nos_a.png',
    categoryLink: '/shop?category=car-hanging',
    badge: 'New Launch',
    gradient: 'from-blue-500/20 via-primary-500/10 to-transparent'
  },
  {
    tag: 'Artisan Desktop Art',
    title: 'Geometric Mini Gallery & Diamond Photostands',
    subtitle: 'Modular hexagonal acrylic panels and crystal-clear photo blocks that turn your favorite snapshots into museum-grade art.',
    price: 'From ₹359',
    image: '/frames/photostand/1_nos_a.png',
    categoryLink: '/shop?category=photostand',
    badge: 'Premium',
    gradient: 'from-emerald-500/20 via-primary-500/10 to-transparent'
  }
];

export default function HeroSection({
  initialMode = 'split',
  initialAutoplay = true,
  interval = 5000,
}: HeroSectionProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!initialAutoplay || isPaused) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, interval);
    return () => clearInterval(timer);
  }, [initialAutoplay, isPaused, interval]);

  const slide = slides[activeSlide];

  const handlePrev = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  // ==========================================
  // MODE 1: FULL-WIDTH BANNER SLIDER CAROUSEL
  // ==========================================
  if (initialMode === 'slider') {
    return (
      <section 
        className="relative overflow-hidden bg-gradient-to-b from-stone-950 via-secondary-950 to-stone-900 text-white select-none border-b border-stone-800/80"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Dynamic Background Glow matching active slide */}
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-tr ${slide.gradient} opacity-70 transition-all duration-1000`} />
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[450px] w-[800px] -translate-x-1/2 rounded-full bg-primary-500/15 blur-[150px]" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20 min-h-[580px] sm:min-h-[640px] flex flex-col justify-center">
          
          {/* Main Slide Grid */}
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
            
            {/* Left Content */}
            <div className="space-y-6 lg:col-span-7 transition-all duration-500">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-primary-500/40 bg-primary-950/60 px-4 py-1.5 text-xs font-bold text-primary-200 backdrop-blur-md shadow-lg">
                <Sparkles className="h-3.5 w-3.5 text-primary-300 animate-pulse" />
                <span>{slide.tag}</span>
                <span className="rounded-full bg-primary-500/30 px-2.5 py-0.5 text-[10px] text-white font-extrabold uppercase tracking-wider">
                  {slide.badge}
                </span>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl text-white leading-tight">
                  {slide.title}
                </h1>
                <p className="max-w-xl text-base sm:text-lg text-stone-300 leading-relaxed font-normal">
                  {slide.subtitle}
                </p>
              </div>

              {/* Price & Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/shop"
                  className="group inline-flex items-center gap-2 rounded-full bg-primary-500 px-7 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-primary-950/50 hover:bg-primary-600 transition-all hover:scale-105"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Customize Now</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href={slide.categoryLink}
                  className="inline-flex items-center gap-2 rounded-full border border-stone-700 bg-stone-800/80 px-6 py-3.5 text-sm font-bold text-stone-200 backdrop-blur-md hover:bg-stone-700 hover:text-white transition-all"
                >
                  <span>Explore Category</span>
                  <ChevronRight className="h-4 w-4 text-stone-400" />
                </Link>

                <div className="inline-flex items-center rounded-2xl bg-stone-900/90 border border-stone-800 px-4 py-2">
                  <span className="text-xs font-extrabold text-primary-300 tracking-wide">
                    {slide.price}
                  </span>
                </div>
              </div>

              {/* Slider Feature Badges */}
              <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-stone-800/80 text-xs text-stone-400 font-semibold">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary-400" />
                  <span>Pan-India Safe Express Shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>100% Fade-Proof Japanese UV Print</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md">
                {/* Acrylic Glow Card */}
                <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-stone-900/70 p-3.5 backdrop-blur-2xl shadow-2xl shadow-black/80 group">
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-stone-950">
                    <img
                      key={slide.image}
                      src={slide.image}
                      alt={slide.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 animate-fadeIn"
                    />
                    
                    {/* Acrylic Gloss Flare */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
                    
                    {/* Live Preview Tag */}
                    <div className="absolute top-3.5 right-3.5 rounded-full bg-black/75 px-3 py-1 text-xs font-bold text-primary-200 backdrop-blur-md border border-white/15 shadow flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-primary-400" />
                      <span>Live Customizer Ready</span>
                    </div>

                    {/* Bottom Highlight */}
                    <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-white/10 bg-black/80 p-3 backdrop-blur-md flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary-400">Featured</span>
                        <h4 className="text-xs font-black text-white">{slide.title}</h4>
                      </div>
                      <Link
                        href={slide.categoryLink}
                        className="h-8 w-8 rounded-lg bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 transition-colors"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Floating Navigation Controls */}
                <button
                  onClick={handlePrev}
                  className="absolute -left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full border border-stone-700 bg-stone-950/90 text-white shadow-xl flex items-center justify-center hover:bg-primary-500 hover:border-primary-500 transition-all z-20"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <button
                  onClick={handleNext}
                  className="absolute -right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full border border-stone-700 bg-stone-950/90 text-white shadow-xl flex items-center justify-center hover:bg-primary-500 hover:border-primary-500 transition-all z-20"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Thumbnails & Dots Bar */}
          <div className="mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-stone-800/80 pt-6">
            
            {/* Quick Mini Thumbnails */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
              {slides.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`flex items-center gap-2.5 rounded-2xl px-3 py-1.5 border transition-all text-left ${
                    activeSlide === idx 
                      ? 'border-primary-500 bg-primary-950/60 ring-1 ring-primary-500/50' 
                      : 'border-stone-800 bg-stone-900/50 hover:bg-stone-800/60 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={s.image} alt={s.title} className="h-7 w-7 rounded-lg object-cover" />
                  <div className="text-[11px] pr-1">
                    <span className="font-bold text-white block leading-tight truncate max-w-[110px]">{s.title.split(' ')[0]} {s.title.split(' ')[1]}</span>
                    <span className="text-[9px] text-stone-400 block font-semibold">{s.price.replace('Starting at ', '').replace('Special Combo ', '')}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Pagination Dots */}
            <div className="flex items-center gap-2 self-center sm:self-auto">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeSlide === idx ? 'w-8 bg-primary-400' : 'w-2.5 bg-stone-700 hover:bg-stone-500'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>

          </div>

        </div>
      </section>
    );
  }

  // ==========================================
  // MODE 2: SPLIT STUDIO SHOWCASE (CURRENT)
  // ==========================================
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-secondary-950 via-secondary-900 to-primary-950 text-white">
      {/* Ambient decorative glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[700px] -translate-x-1/2 rounded-full bg-primary-600/20 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-primary-500/10 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          
          {/* Left Hero Content */}
          <div className="space-y-6 lg:col-span-7">
            {/* Top pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-900/30 px-3.5 py-1.5 text-xs font-semibold text-primary-200 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-primary-300" />
              <span>{slide.tag}</span>
              <span className="rounded-full bg-primary-400/20 px-2 py-0.5 text-[10px] text-primary-200">
                {slide.badge}
              </span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-stone-100">
              Turn Precious Memories Into{' '}
              <span className="bg-gradient-to-r from-primary-300 via-white to-primary-200 bg-clip-text text-transparent">
                Laser-Cut Keepsakes
              </span>
            </h1>

            <p className="max-w-xl text-base sm:text-lg text-stone-300 leading-relaxed">
              {slide.subtitle}
            </p>

            {/* Pricing & CTA buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/shop"
                className="group flex items-center gap-2 rounded-full bg-primary-500 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-primary-950/40 hover:bg-primary-600 transition-all hover:scale-105"
              >
                <span>Customize A Gift Now</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href={slide.categoryLink}
                className="flex items-center gap-2 rounded-full border border-stone-700 bg-stone-800/60 px-6 py-3.5 text-sm font-semibold text-stone-200 backdrop-blur-md hover:bg-stone-700/60 transition-colors"
              >
                <span>Browse This Category</span>
                <ChevronRight className="h-4 w-4 text-stone-400" />
              </Link>

              <div className="flex items-center gap-2 pl-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary-300">
                  {slide.price}
                </span>
              </div>
            </div>

            {/* Value Pillars */}
            <div className="grid grid-cols-2 gap-4 border-t border-stone-800/80 pt-6 sm:grid-cols-4">
              <div>
                <div className="flex items-center gap-1.5 text-primary-400 font-extrabold text-xl">
                  <span>7K+</span>
                </div>
                <p className="text-xs text-stone-400 font-medium">Stories Printed</p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-primary-300 font-extrabold text-xl">
                  <span>99.8%</span>
                </div>
                <p className="text-xs text-stone-400 font-medium">Print Precision</p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-primary-400 font-extrabold text-xl">
                  <span>2,000+</span>
                </div>
                <p className="text-xs text-stone-400 font-medium">Pincodes Served</p>
              </div>

              <div>
                <div className="flex items-center gap-1 text-primary-300 font-extrabold text-xl">
                  <span>4.9</span>
                  <Star className="h-4 w-4 fill-primary-400 text-primary-400" />
                </div>
                <p className="text-xs text-stone-400 font-medium">Customer Rating</p>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Showcase */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Glass Card Container */}
              <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-stone-900/60 p-3 backdrop-blur-xl shadow-2xl shadow-primary-950/50">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-stone-950">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="h-full w-full object-cover transition-all duration-700 hover:scale-105"
                  />
                  {/* Subtle Acrylic Sheen Overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-60" />
                  
                  {/* Live Photo Customizer Badge */}
                  <div className="absolute top-4 right-4 rounded-full bg-stone-950/80 px-3 py-1.5 text-xs font-semibold text-primary-200 backdrop-blur-md border border-white/10 shadow-lg flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-primary-300" />
                    <span>Live Photo Preview Available</span>
                  </div>

                  {/* Floating Product Highlight Card */}
                  <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/15 bg-stone-900/90 p-4 backdrop-blur-md shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary-400">Featured Highlight</span>
                        <h3 className="text-sm font-bold text-white">{slide.title}</h3>
                        <p className="text-xs text-stone-300 font-medium">Free photo upload & custom shape selection</p>
                      </div>
                      <Link
                        href={slide.categoryLink}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-white shadow hover:bg-primary-600 transition-colors flex-shrink-0"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slider Dots */}
              <div className="mt-4 flex justify-center gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`h-2 rounded-full transition-all ${
                      activeSlide === idx ? 'w-8 bg-primary-400' : 'w-2 bg-stone-700 hover:bg-stone-500'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

