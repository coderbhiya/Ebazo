'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, ArrowRight, ShieldCheck, Truck, Star, 
  Layers, Palette, Award, ChevronRight 
} from 'lucide-react';

const slides = [
  {
    tag: 'Trending • Pan-India Favorite',
    title: 'Personalized Photo Keychains',
    subtitle: 'Ultra-clear double-sided acrylic with diamond-bevelled edges. Keep your beloved memories right in your pocket.',
    price: 'Starting at ₹199',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1000&auto=format&fit=crop&q=80',
    categoryLink: '/shop?category=key-chains',
    badge: 'Best Seller'
  },
  {
    tag: 'Modern Home Decor',
    title: 'Laser Cut Fridge Magnets',
    subtitle: 'From wavy artistic contours to floral and geometric shapes. Printed with Japanese fade-resistant UV ink technology.',
    price: 'Special Combo from ₹199',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1000&auto=format&fit=crop&q=80',
    categoryLink: '/shop?category=fridge-magnet',
    badge: 'Popular'
  },
  {
    tag: 'Car Interior Accessories',
    title: 'Custom Rearview & Dashboard Stands',
    subtitle: 'Heat-resistant, UV-stabilized acrylic charms with silky tassels and solid wooden pedestals for your vehicle.',
    price: 'Starting at ₹299',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80',
    categoryLink: '/shop?category=car-hanging',
    badge: 'New Launch'
  },
  {
    tag: 'Artisan Desktop Art',
    title: 'Geometric Mini Gallery & Tabletop Stands',
    subtitle: 'Modular hexagonal acrylic panels and crystal-clear photo blocks that turn your favorite snapshots into museum-grade art.',
    price: 'From ₹359',
    image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1000&auto=format&fit=crop&q=80',
    categoryLink: '/shop?category=mini-gallary',
    badge: 'Premium'
  }
];

export default function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[activeSlide];

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
