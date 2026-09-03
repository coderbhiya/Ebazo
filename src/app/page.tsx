import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Flame, HeartHandshake } from 'lucide-react';
import { fetchCategories, fetchProducts } from '@/lib/api';
import HeroSection from '@/components/HeroSection';
import FeaturedCategories from '@/components/FeaturedCategories';
import ProductCard from '@/components/ProductCard';
import CraftsmanshipSection from '@/components/CraftsmanshipSection';
import CustomerReviews from '@/components/CustomerReviews';

export const revalidate = 0; // Fresh data

export default async function HomePage() {
  const [categories, products] = await Promise.all([
    fetchCategories(),
    fetchProducts({}),
  ]);

  const bestsellers = products.filter((p) => p.is_bestseller === 1);
  const featured = products.filter((p) => p.is_featured === 1);

  return (
    <div className="flex flex-col">
      {/* 1. Hero Showcase */}
      <HeroSection />

      {/* 2. Featured Categories Grid */}
      <FeaturedCategories categories={categories} />

      {/* 3. Bestsellers Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 mb-2">
                <Flame className="h-4 w-4 fill-rose-600" />
                <span>Trending Across India</span>
              </div>
              <h2 className="text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">
                Most Loved Keepsakes
              </h2>
              <p className="mt-2 text-sm text-stone-600 max-w-xl">
                Handpicked favorites customized by thousands of happy customers for birthdays, anniversaries, and personal collections.
              </p>
            </div>
            <Link
              href="/shop?bestseller=1"
              className="group mt-4 sm:mt-0 inline-flex items-center gap-1.5 text-sm font-bold text-primary-700 hover:text-primary-600 transition-colors"
            >
              <span>View All Bestsellers</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestsellers.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Interactive Customizer Highlight Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative overflow-hidden rounded-3xl bg-secondary-900 border border-stone-800 p-8 sm:p-12 text-white shadow-2xl">
          <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-primary-500/10 blur-3xl" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-500/20 px-3 py-1 text-xs font-bold text-primary-200 border border-primary-500/30">
                <Sparkles className="h-3.5 w-3.5" />
                No More Guesswork
              </span>
              <h3 className="text-2xl sm:text-4xl font-black text-white">
                Live Interactive Studio Customizer
              </h3>
              <p className="text-sm sm:text-base text-stone-300 max-w-xl leading-relaxed">
                Upload your picture and instantly preview it positioned, rotated, and scaled inside actual laser-cut contours before placing an order.
              </p>
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-xs sm:text-sm font-extrabold text-white hover:bg-primary-600 transition-all hover:scale-105 shadow-lg shadow-primary-950/20"
                >
                  <span>Select Any Product to Try</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="relative h-44 w-44 sm:h-52 sm:w-52 rounded-full border-4 border-primary-400/40 p-2 shadow-2xl bg-white/5 backdrop-blur-md">
                <img
                  src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500&auto=format&fit=crop&q=80"
                  alt="Customizer demo"
                  className="h-full w-full rounded-full object-cover"
                />
                <span className="absolute bottom-2 right-2 rounded-full bg-secondary-900/90 px-2.5 py-1 text-[10px] font-bold text-primary-200 shadow">
                  100% Live
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Featured Products Catalog */}
      <section className="py-16 sm:py-20 bg-stone-50/50 border-t border-stone-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
              Curated Gift Guide
            </span>
            <h2 className="mt-2 text-3xl font-black text-stone-900 sm:text-4xl">
              Fresh Arrivals & Premium Acrylic Works
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              Explore our diverse silhouettes tailored for every occasion and relationship.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-8 py-3.5 text-xs font-extrabold text-stone-900 shadow-sm hover:border-primary-600 hover:text-primary-600 transition-all hover:shadow"
            >
              <span>Explore All {products.length} Products</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Craftsmanship Section */}
      <CraftsmanshipSection />

      {/* 7. Customer Reviews */}
      <CustomerReviews />
    </div>
  );
}
