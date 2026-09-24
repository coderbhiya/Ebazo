import React from 'react';
import {
  BannerContent, CraftPillar, HeroSlide, fetchCategories, fetchHome, fetchPublicSettings, parseJsonSetting,
} from '@/lib/api';
import HeroSection from '@/components/HeroSection';
import FeaturedCategories from '@/components/FeaturedCategories';
import PromoBannerSlider from '@/components/PromoBannerSlider';
import MidPromoBanner from '@/components/MidPromoBanner';
import CraftsmanshipSection from '@/components/CraftsmanshipSection';
import CustomerReviews from '@/components/CustomerReviews';
import ProductRail from '@/components/home/ProductRail';

export const revalidate = 0; // Fresh data

// Every section, its order, texts and product counts come from Admin > Homepage
export default async function HomePage() {
  const [blocks, categories, settings] = await Promise.all([fetchHome(), fetchCategories(), fetchPublicSettings()]);

  const slides = parseJsonSetting<HeroSlide[] | undefined>(settings.hero_slides, undefined);
  const midBanner = parseJsonSetting<BannerContent>(settings.home_mid_banner, { image: '', link: '/shop' });
  const promoSlides = parseJsonSetting<BannerContent[]>(settings.home_promo_slides, []);
  const pillars = parseJsonSetting<CraftPillar[]>(settings.home_craft_pillars, []);

  // A category without its own image uses the first product photo from its homepage section
  const categoryImages: Record<number, string> = {};
  for (const b of blocks) {
    if (b.type === 'category' && b.category_id && b.products?.[0]?.image_url) {
      categoryImages[b.category_id] = b.products[0].image_url;
    }
  }

  let railIndex = 0;

  return (
    <div className="flex flex-col">
      {blocks.map((b) => {
        switch (b.type) {
          case 'hero':
            return (
              <HeroSection
                key={b.id}
                initialSlides={slides}
                initialMode={(settings.hero_mode as 'split' | 'slider') || 'slider'}
                initialAutoplay={settings.hero_slider_autoplay !== 'false' && settings.hero_slider_autoplay !== false}
                interval={settings.hero_slider_interval ? Number(settings.hero_slider_interval) : 5000}
              />
            );
          case 'categories':
            return (
              <FeaturedCategories
                key={b.id}
                categories={categories}
                eyebrow={b.eyebrow}
                title={b.title || 'Shop by Category'}
                subtitle={b.subtitle}
                fallbackImages={categoryImages}
              />
            );
          case 'mid_banner':
            return <MidPromoBanner key={b.id} banner={midBanner} />;
          case 'promo_slider':
            return <PromoBannerSlider key={b.id} slides={promoSlides} />;
          case 'craftsmanship':
            return (
              <CraftsmanshipSection key={b.id} eyebrow={b.eyebrow} title={b.title} subtitle={b.subtitle} pillars={pillars} />
            );
          case 'reviews':
            return (
              <CustomerReviews
                key={b.id}
                eyebrow={b.eyebrow}
                title={b.title || 'What Our Customers Say'}
                subtitle={b.subtitle}
                reviews={b.reviews || []}
                stats={b.stats}
              />
            );
          case 'bestsellers':
          case 'featured':
          case 'category': {
            const products = b.products || [];
            if (products.length === 0) return null;
            // Alternate backgrounds so consecutive product sections stay distinct
            const shaded = railIndex++ % 2 === 1;
            const isCategory = b.type === 'category' && b.category;
            return (
              <ProductRail
                key={b.id}
                eyebrow={b.eyebrow}
                // Empty title/subtitle on a category section = the category's own name/description
                title={b.title || (isCategory ? b.category!.name : '')}
                subtitle={b.subtitle || (isCategory ? b.category!.description : '')}
                href={
                  isCategory
                    ? `/shop?category=${b.category!.slug}`
                    : b.type === 'bestsellers'
                    ? '/shop?bestseller=1'
                    : '/shop?featured=1'
                }
                products={products}
                shaded={shaded}
              />
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
}
