'use client';

import React from 'react';
import { Sparkles, ShieldCheck, Cpu, PackageCheck, HeartHandshake } from 'lucide-react';
import { CraftPillar } from '@/lib/api';
import Carousel from './home/Carousel';

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  pillars: CraftPillar[];
}

const ICONS = [Cpu, Sparkles, ShieldCheck, PackageCheck];

// "Why us" section (Admin > Homepage > Craftsmanship)
export default function CraftsmanshipSection({ eyebrow, title, subtitle, pillars: items }: Props) {
  if (items.length === 0) return null;
  const pillars = items.map((p, i) => ({ ...p, icon: ICONS[i % ICONS.length] }));

  return (
    <section className="py-12 sm:py-20 bg-secondary-900 text-stone-100 relative overflow-hidden">
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-primary-600/20 blur-3xl" />
      <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-primary-500/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
          {eyebrow && <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-950/60 px-3.5 py-1 text-xs font-bold text-primary-300 backdrop-blur-md mb-3">
            <HeartHandshake className="h-3.5 w-3.5 text-primary-400" />
            <span>{eyebrow}</span>
          </div>}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
            {title}
          </h2>
          {subtitle && <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-stone-400">{subtitle}</p>}
        </div>

        <Carousel className="-mx-3 flex snap-x snap-mandatory gap-4 overflow-x-auto px-3 scroll-px-3 pb-2 no-scrollbar md:mx-0 md:grid md:grid-cols-2 md:gap-8 md:overflow-visible md:px-0 md:scroll-px-0 lg:grid-cols-4">
          {pillars.map((p, i) => (
            <div
              key={i}
              className="w-[80%] flex-shrink-0 snap-start md:w-auto rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:border-primary-400/50 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg mb-5">
                <p.icon className="h-6 w-6 text-primary-200" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{p.title}</h3>
              <p className="text-xs text-stone-400 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
