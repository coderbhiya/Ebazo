'use client';

import React from 'react';
import { Star, CheckCircle2, Quote } from 'lucide-react';

const reviews = [
  {
    name: 'Pooja K.',
    city: 'Mumbai',
    product: 'Abstract Wavy Edge Photo Fridge Magnet',
    rating: 5,
    date: '3 days ago',
    comment: 'The print quality is breathtaking! My husband and I were stunned by how vibrant the colors came out on our wedding photo. The wavy edge looks so chic on our fridge!',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Rohan Sharma',
    city: 'Bengaluru',
    product: 'Personalized Round Photo Keychain',
    rating: 5,
    date: '1 week ago',
    comment: 'Got 3 matching keychains for my college buddies. Double-sided photo clarity is 10/10 and the acrylic is solid and thick. Shipped in just 3 days to Whitefield!',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Ananya Deshmukh',
    city: 'Pune',
    product: 'Geometric Hexagon Photo Mini Gallery',
    rating: 5,
    date: '2 weeks ago',
    comment: 'Ordered the hexagon set of 3 for my work desk. Everyone at office stopped by to ask where I got it from. The live preview tool was super helpful to adjust the framing.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Karan Mehra',
    city: 'Delhi NCR',
    product: 'Custom Rearview Car Hanging Charm',
    rating: 5,
    date: '2 weeks ago',
    comment: 'The tassel and acrylic charm look so classy in my new car. It has already survived extreme Delhi heat without any fading or yellowing. Top-notch gifting brand!',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  }
];

export default function CustomerReviews() {
  return (
    <section className="py-20 bg-stone-50 border-b border-stone-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-violet-700">
            Real Stories, Real Smiles
          </span>
          <h2 className="mt-2 text-3xl font-black text-stone-900 sm:text-4xl">
            Loved by Over 7,000+ Gift Givers
          </h2>
          <div className="mt-3 flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-2 text-sm font-bold text-stone-800">4.9 out of 5</span>
            <span className="text-xs text-stone-500">(1,400+ Verified Reviews)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-3xl border border-stone-200 bg-white p-6 shadow-sm hover:shadow-xl hover:border-violet-300 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-stone-400">{rev.date}</span>
                </div>

                <p className="text-xs text-stone-700 italic leading-relaxed mb-4">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.avatar}
                    alt={rev.name}
                    className="h-10 w-10 rounded-full object-cover border border-violet-200"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <h4 className="text-xs font-bold text-stone-900">{rev.name}</h4>
                      <span title="Verified Buyer">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-500">{rev.city} • Verified Buyer</p>
                    <p className="text-[10px] font-semibold text-violet-700 truncate max-w-[150px]">
                      {rev.product}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
