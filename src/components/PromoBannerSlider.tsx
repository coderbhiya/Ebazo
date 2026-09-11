'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PromoSlide {
  id: string;
  image: string;
  link: string;
  title: string;
}

const PROMO_SLIDES: PromoSlide[] = [
  {
    id: 'promo-1',
    title: 'Celebrate Love with Laser-Cut Keepsakes - Flat 15% OFF',
    image: '/banners/promo_couple_love.jpg',
    link: '/shop?category=carrycature',
  },
  {
    id: 'promo-2',
    title: 'Festive Gift Hampers & Corporate Combos',
    image: '/banners/promo_festive_gifts.jpg',
    link: '/shop',
  },
  {
    id: 'promo-3',
    title: 'Custom Acrylic Car Charms & Dashboard Stands',
    image: '/banners/promo_car_accessories.jpg',
    link: '/shop?category=car-hanging',
  }
];

export default function PromoBannerSlider() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % PROMO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveSlide((prev) => (prev - 1 + PROMO_SLIDES.length) % PROMO_SLIDES.length);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveSlide((prev) => (prev + 1) % PROMO_SLIDES.length);
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
    if (distance > 40) {
      handleNext();
    } else if (distance < -40) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const current = PROMO_SLIDES[activeSlide];

  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
      <div
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-stone-200/80 bg-stone-100 shadow-sm hover:shadow-md transition-shadow group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Full Clickable Clean Banner */}
        <Link
          href={current.link}
          className="block relative aspect-[16/9] sm:aspect-[21/9] lg:aspect-[24/9] w-full overflow-hidden bg-stone-950"
          aria-label={current.title}
        >
          <img
            key={current.image}
            src={current.image}
            alt={current.title}
            className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          />
        </Link>

        {/* Desktop-Only Subtle Side Arrow Buttons (Hidden on Mobile for zero clutter) */}
        <button
          onClick={handlePrev}
          className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70 hover:scale-110 z-10"
          aria-label="Previous Banner"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          onClick={handleNext}
          className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70 hover:scale-110 z-10"
          aria-label="Next Banner"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Clean, Subtle Bottom Center Dots */}
        <div className="absolute bottom-2.5 sm:bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-sm z-10 pointer-events-auto">
          {PROMO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setActiveSlide(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${activeSlide === idx ? 'w-5 bg-white shadow' : 'w-1.5 bg-white/50 hover:bg-white/80'
                }`}
              aria-label={`Go to banner ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
