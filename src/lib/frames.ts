'use client';

import { useEffect, useState } from 'react';
import { Product } from './api';

// "1 Nos A" / "1_nos_a.png" / "/frames/x/1_nos_a.png" -> "1_nos_a"
function frameKey(value: string): string {
  const base = value.split('?')[0].split('/').pop() || value;
  return base.replace(/\.[a-z0-9]+$/i, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

// Candidate frame images for a shape, best first. Frames are matched by NAME — the old
// customizer picked gallery[indexOf(shape)], but the shapes list and the gallery are ordered
// independently, so e.g. "1 nos A" was cut with the 1_nos_b frame.
function candidatesForShape(product: Product, shape: string): string[] {
  const key = frameKey(shape);
  const images = [...(product.gallery || []), product.image_url].filter(Boolean) as string[];
  const out = images.filter((url) => frameKey(url) === key);
  // Catalog convention: /frames/<category-slug>/<shape_key>.png
  if (product.category_slug) out.push(`/frames/${product.category_slug}/${key}.png`);
  return Array.from(new Set(out));
}

// Human label for a frame file: "/frames/x/1_nos_b.png" -> "1 nos b"
export function frameLabel(url: string): string {
  return frameKey(url).replace(/_/g, ' ');
}

function imageLoads(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth > 0);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

export interface FrameOption {
  label: string; // shape name shown to the customer and recorded on the order
  url: string; // verified frame image the photo is cut with
}

export interface ShapeFrames {
  ready: boolean;
  // Only shapes whose frame file really exists. If the product's pictured frame isn't one of
  // its shapes, it's offered first as "As pictured" so the default is what the customer saw.
  options: FrameOption[];
  defaultLabel: string | null;
}

export const AS_PICTURED = 'As pictured';

// Resolves and verifies the real frame image for each of the product's shapes
export function useShapeFrames(product: Product): ShapeFrames {
  const [state, setState] = useState<ShapeFrames>({ ready: false, options: [], defaultLabel: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const resolved = await Promise.all(
        (product.shapes || []).map(async (shape) => {
          for (const url of candidatesForShape(product, shape)) {
            if (await imageLoads(url)) return { label: shape, url };
          }
          return null;
        })
      );
      const options = resolved.filter((o): o is FrameOption => o !== null);

      const pictured = product.image_url;
      const picturedMatch = pictured ? options.find((o) => frameKey(o.url) === frameKey(pictured)) : undefined;
      if (pictured && !picturedMatch && (await imageLoads(pictured))) {
        // Name it after its file ("1_nos_i.png" -> "1 nos i") so the order says exactly which frame
        options.unshift({ label: frameKey(pictured).replace(/_/g, ' ') || AS_PICTURED, url: pictured });
      }

      if (!cancelled) {
        setState({
          ready: true,
          options,
          defaultLabel: picturedMatch?.label ?? options[0]?.label ?? null,
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [product.id]);

  return state;
}
