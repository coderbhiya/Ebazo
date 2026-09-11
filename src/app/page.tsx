import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Flame } from 'lucide-react';
import { fetchCategories, fetchProducts, fetchPublicSettings, HeroSlide } from '@/lib/api';
import HeroSection from '@/components/HeroSection';
import FeaturedCategories from '@/components/FeaturedCategories';
import ProductCard from '@/components/ProductCard';
import PromoBannerSlider from '@/components/PromoBannerSlider';
import MidPromoBanner from '@/components/MidPromoBanner';
import CraftsmanshipSection from '@/components/CraftsmanshipSection';
import CustomerReviews from '@/components/CustomerReviews';

export const revalidate = 0; // Fresh data

export default async function HomePage() {
  const [categories, products, settings] = await Promise.all([
    fetchCategories(),
    fetchProducts({}),
    fetchPublicSettings(),
  ]);

  let parsedSlides: HeroSlide[] | undefined = undefined;
  if (settings?.hero_slides) {
    try {
      parsedSlides = typeof settings.hero_slides === 'string'
        ? JSON.parse(settings.hero_slides)
        : settings.hero_slides;
    } catch (e) {
      console.warn('Failed to parse hero_slides:', e);
    }
  }

  const bestsellers = products.filter((p) => p.is_bestseller === 1);
  const featured = products.filter((p) => p.is_featured === 1);

  return (
    <div className="flex flex-col">
      {/* 1. Dynamic Hero Showcase Slider */}
      <HeroSection
        initialSlides={parsedSlides}
        initialMode={(settings?.hero_mode as any) || 'slider'}
        initialAutoplay={settings?.hero_slider_autoplay !== 'false' && settings?.hero_slider_autoplay !== false}
        interval={settings?.hero_slider_interval ? Number(settings.hero_slider_interval) : 5000}
      />

      {/* 2. Featured Categories Grid */}
      <FeaturedCategories categories={categories} />

      {/* 3. New 300px Luxury Promotional Banner */}
      <MidPromoBanner />

      {/* 4. First Product Section: Bestsellers */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 mb-2">
                <Flame className="h-4 w-4 fill-rose-600" />
                <span>Trending Across India</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-stone-900">
                Most Loved Keepsakes
              </h2>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-stone-600 max-w-xl">
                Handpicked favorites customized by thousands of happy customers for birthdays, anniversaries, and personal collections.
              </p>
            </div>
            <Link
              href="/shop?bestseller=1"
              className="group mt-3 sm:mt-0 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary-700 hover:text-primary-600 transition-colors"
            >
              <span>View All Bestsellers</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {bestsellers.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Full-Width Promotional Banner Slider (Between 1st & 2nd Product Section) */}
      <PromoBannerSlider />

      {/* 5. Second Product Section: Fresh Arrivals & Featured Works */}
      <section className="py-10 sm:py-16 bg-stone-50/60 border-t border-stone-200/80">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
              Curated Gift Guide
            </span>
            <h2 className="mt-1 sm:mt-2 text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900">
              Fresh Arrivals & Premium Acrylic Works
            </h2>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-stone-600">
              Explore our diverse silhouettes tailored for every occasion and relationship.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-8 sm:mt-12 text-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-6 sm:px-8 py-3 sm:py-3.5 text-xs font-extrabold text-stone-900 shadow-sm hover:border-primary-600 hover:text-primary-600 transition-all hover:shadow"
            >
              <span>Explore All {products.length} Products</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Craftsmanship & Technology Section */}
      <CraftsmanshipSection />

      {/* 7. Real Customer Reviews */}
      <CustomerReviews />
    </div>
  );
}
