import React from 'react';
import { Product } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import SectionHeader from './SectionHeader';
import Carousel from './Carousel';

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  href?: string;
  products: Product[];
  shaded?: boolean;
}

// A homepage product section: swipeable carousel on mobile, grid on larger screens
export default function ProductRail({ eyebrow, title, subtitle, href, products, shaded }: Props) {
  if (products.length === 0) return null;
  return (
    <section className={`py-8 sm:py-14 ${shaded ? 'bg-stone-50/70 border-y border-stone-200/70' : 'bg-white'}`}>
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <SectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} href={href} />
        <Carousel className="-mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 scroll-px-3 pb-2 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-x-5 sm:gap-y-8 sm:overflow-visible sm:px-0 sm:scroll-px-0 lg:grid-cols-4">
          {products.map((product) => (
            <div key={product.id} className="w-[46%] flex-shrink-0 snap-start sm:w-auto">
              <ProductCard product={product} />
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
