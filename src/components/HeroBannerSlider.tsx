'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, ImagePlus, ShoppingBag } from 'lucide-react';
import { HeroSlide, heroSlideLink } from '@/lib/api';

interface Props {
  slides: HeroSlide[];
  autoplay?: boolean;
  interval?: number;
}

// Full-width image hero (Admin > Hero Banners > "Full-Width Image Slider"): edge-to-edge banner
// images with optional text, buttons and an attached product card. Each slide links to its
// category, product or custom URL.
export default function HeroBannerSlider({ slides, autoplay = true, interval = 5000 }: Props) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = slides.length;

  useEffect(() => {
    if (!autoplay || paused || count <= 1) return;
    const t = setTimeout(() => setActive((i) => (i + 1) % count), interval);
    return () => clearTimeout(t);
  }, [active, autoplay, paused, count, interval]);

  if (count === 0) return null;
  const go = (i: number) => setActive((i + count) % count);

  return (
    <section
      className="relative w-full overflow-hidden bg-stone-900 select-none"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const d = touchX.current - e.changedTouches[0].clientX;
        if (Math.abs(d) > 50) go(active + (d > 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      {/* Tallest slide sets the height: 4:5 on phones (mobile image), wide banner on desktop */}
      <div className="relative aspect-[4/5] sm:aspect-[16/9] lg:aspect-[16/7] max-h-[680px] w-full">
        {slides.map((s, i) => (
          <Slide key={i} slide={s} index={i} active={i === active} />
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(active - 1)}
            aria-label="Previous slide"
            className="absolute left-2 sm:left-4 top-1/2 z-20 flex h-9 w-9 sm:h-11 sm:w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-stone-800 shadow-lg backdrop-blur hover:bg-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(active + 1)}
            aria-label="Next slide"
            className="absolute right-2 sm:right-4 top-1/2 z-20 flex h-9 w-9 sm:h-11 sm:w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-stone-800 shadow-lg backdrop-blur hover:bg-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/25 px-2.5 py-1.5 backdrop-blur">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === active ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function Slide({ slide: s, index, active }: { slide: HeroSlide; index: number; active: boolean }) {
  const href = heroSlideLink(s);
  const light = s.text_color !== 'dark';
  const align = s.text_align || 'left';
  const hasText = Boolean(s.title || s.subtitle || s.tag || s.button_text);
  const product = s.product;
  const Heading = index === 0 ? 'h1' : 'h2';

  const alignClass =
    align === 'center' ? 'items-center text-center' : align === 'right' ? 'items-end text-right' : 'items-start text-left';
  // Darken behind the text so it stays readable on any photo
  const overlayClass = !s.overlay
    ? ''
    : light
    ? align === 'center'
      ? 'bg-black/40'
      : align === 'right'
      ? 'bg-gradient-to-l from-black/70 via-black/30 to-transparent'
      : 'bg-gradient-to-r from-black/70 via-black/30 to-transparent'
    : align === 'center'
    ? 'bg-white/40'
    : align === 'right'
    ? 'bg-gradient-to-l from-white/80 via-white/40 to-transparent'
    : 'bg-gradient-to-r from-white/80 via-white/40 to-transparent';

  const price =
    product &&
    (product.has_variations && product.min_price != null
      ? `${product.max_price != null && product.max_price !== product.min_price ? 'From ' : ''}₹${Number(product.min_price)}`
      : `₹${Number(product.price)}`);

  return (
    <div
      className={`absolute inset-0 transition-opacity duration-700 ${active ? 'z-10 opacity-100' : 'pointer-events-none z-0 opacity-0'}`}
      aria-hidden={!active}
    >
      <picture>
        {s.mobile_image && <source media="(max-width: 639px)" srcSet={s.mobile_image} />}
        <img
          src={s.image}
          alt={s.title || 'Ebanzo banner'}
          loading={index === 0 ? 'eager' : 'lazy'}
          className={`h-full w-full object-cover transition-transform duration-[6000ms] ease-out ${active ? 'scale-105' : 'scale-100'}`}
        />
      </picture>

      {/* Image-only banner: the whole slide is the link */}
      {!hasText && !product && <Link href={href} className="absolute inset-0" aria-label={s.title || 'Open'} />}

      {overlayClass && <div className={`pointer-events-none absolute inset-0 ${overlayClass}`} />}

      {(hasText || product) && (
        <div
          className={`absolute inset-0 mx-auto flex max-w-7xl flex-col justify-end gap-4 px-4 pb-12 sm:justify-center sm:px-10 sm:pb-0 lg:px-16 ${
            align === 'center' ? 'items-center' : 'lg:flex-row lg:items-center lg:justify-between'
          }`}
        >
          {hasText && (
            <div
              className={`flex max-w-xl flex-col gap-2.5 sm:gap-4 ${alignClass} ${
                align === 'center' ? 'mx-auto' : align === 'right' ? 'ml-auto lg:order-2' : ''
              } ${light ? 'text-white' : 'text-stone-900'}`}
            >
              {s.tag && (
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold backdrop-blur ${
                    light ? 'bg-white/15 text-white ring-1 ring-white/30' : 'bg-white/80 text-primary-700 ring-1 ring-primary-200'
                  }`}
                >
                  {s.tag}
                  {s.badge && <span className="rounded-full bg-primary-500 px-2 py-0.5 text-[10px] font-extrabold uppercase text-white">{s.badge}</span>}
                </span>
              )}
              {s.title && (
                <Heading className="text-2xl font-black leading-tight tracking-tight drop-shadow-sm sm:text-4xl lg:text-5xl">{s.title}</Heading>
              )}
              {s.subtitle && (
                <p className={`text-xs leading-relaxed sm:text-base ${light ? 'text-white/85' : 'text-stone-700'}`}>{s.subtitle}</p>
              )}
              <div className={`flex flex-wrap items-center gap-2.5 pt-1 ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : ''}`}>
                {s.button_text && (
                  <Link
                    href={href}
                    className="group inline-flex items-center gap-2 rounded-full bg-primary-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-primary-600 sm:px-7 sm:py-3 sm:text-sm"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    {s.button_text}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                )}
                {s.secondary_button_text && (
                  <Link
                    href={s.secondary_button_link || '/shop'}
                    className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-bold backdrop-blur sm:py-3 sm:text-sm ${
                      light ? 'bg-white/15 text-white ring-1 ring-white/40 hover:bg-white/25' : 'bg-white/80 text-stone-800 ring-1 ring-stone-300 hover:bg-white'
                    }`}
                  >
                    {s.secondary_button_text}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
                {(s.price_text || s.price) && (
                  <span className={`rounded-full px-3 py-1.5 text-[11px] font-extrabold ${light ? 'bg-black/30 text-white' : 'bg-white/80 text-primary-700'}`}>
                    {s.price_text || s.price}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Attached product */}
          {product && (
            <div
              className={`flex w-full max-w-sm items-center gap-3 rounded-2xl bg-white/95 p-2.5 text-stone-900 shadow-2xl backdrop-blur sm:p-3 ${
                align === 'right' ? 'lg:order-1' : ''
              } ${align === 'center' ? 'mx-auto' : ''}`}
            >
              <Link href={`/product/${product.slug}`} className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-stone-300 via-stone-200 to-primary-100 sm:h-20 sm:w-20">
                <img src={product.image_url} alt={product.title} className="h-full w-full object-contain p-1.5 drop-shadow-[0_4px_6px_rgba(28,25,23,0.25)]" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/product/${product.slug}`} className="line-clamp-2 text-xs font-bold hover:text-primary-600 sm:text-sm">
                  {product.title}
                </Link>
                <p className="mt-0.5 text-sm font-black text-stone-900">{price}</p>
              </div>
              <Link
                href={`/product/${product.slug}?customize=1`}
                className="flex flex-shrink-0 items-center gap-1 rounded-full bg-stone-900 px-3 py-2 text-[11px] font-bold text-white hover:bg-primary-600"
              >
                <ImagePlus className="h-3.5 w-3.5" />
                Customize
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
