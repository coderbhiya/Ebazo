'use client';

import React from 'react';
import { Sparkles, ShieldCheck, Cpu, PackageCheck, HeartHandshake } from 'lucide-react';

export default function CraftsmanshipSection() {
  const pillars = [
    {
      icon: Cpu,
      title: 'Precision UV Ink Technology',
      desc: 'Cured instantaneously with ultraviolet light. Yields 1200+ DPI photographic depth that resists fading, moisture, and sunlight for years.'
    },
    {
      icon: Sparkles,
      title: 'Diamond-Polished Cast Acrylic',
      desc: 'We strictly use optical-grade 3mm and 5mm cast acrylic sheets. Smooth, flame-polished crystal edges without burrs or jagged lines.'
    },
    {
      icon: ShieldCheck,
      title: 'Neodymium & Heavy-Duty Hardware',
      desc: 'Fridge magnets boast grade-N52 neodymium cores with 10x magnetic pull. Keychains feature 304 anti-rust stainless steel connectors.'
    },
    {
      icon: PackageCheck,
      title: 'Damage-Proof Gift Packaging',
      desc: 'Every finished piece undergoes rigorous quality checks before being secured in shock-absorbent foam and high-grade unboxing sleeves.'
    }
  ];

  return (
    <section className="py-20 bg-stone-900 text-stone-100 relative overflow-hidden">
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-violet-700/20 blur-3xl" />
      <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-purple-600/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/60 px-3.5 py-1 text-xs font-bold text-violet-300 backdrop-blur-md mb-3">
            <HeartHandshake className="h-3.5 w-3.5 text-amber-400" />
            <span>The Ebanzo Difference</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl text-white">
            Obsessive Craftsmanship in Every Millimeter
          </h2>
          <p className="mt-3 text-sm text-stone-400">
            Unlike cheap laminated paper prints that peel within weeks, Ebanzo keepsakes are fused directly into durable acrylic and engineered to last a lifetime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((p, i) => (
            <div
              key={i}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:border-violet-400/50 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-800 text-white shadow-lg mb-5">
                <p.icon className="h-6 w-6 text-amber-300" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{p.title}</h3>
              <p className="text-xs text-stone-400 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
