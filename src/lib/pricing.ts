import { Product } from './api';

// Mini gallery pack pricing (Admin > Settings > Customization Pricing). The product's price
// covers `baseFrames` frames; each frame more/less adds/removes `perFramePrice`.
// Mirrored server-side in OrderController::resolveItemPrice — keep both in sync.
export interface MiniGalleryRules {
  counts: number[];
  baseFrames: number;
  perFramePrice: number;
}

export const DEFAULT_MINI_GALLERY_RULES: MiniGalleryRules = { counts: [2, 3, 4, 5, 6, 8], baseFrames: 4, perFramePrice: 99 };

export function parseMiniGalleryRules(s: Record<string, unknown>): MiniGalleryRules {
  const counts = String(s.mini_gallery_frame_counts ?? '')
    .split(',')
    .map((n) => parseInt(n.trim(), 10))
    .filter((n) => n >= 1 && n <= 12);
  const base = parseInt(String(s.mini_gallery_base_frames ?? ''), 10);
  const per = Number(s.mini_gallery_per_frame_price);
  return {
    counts: counts.length ? Array.from(new Set(counts)).sort((a, b) => a - b) : DEFAULT_MINI_GALLERY_RULES.counts,
    baseFrames: base >= 1 ? base : DEFAULT_MINI_GALLERY_RULES.baseFrames,
    perFramePrice: Number.isFinite(per) && per >= 0 && s.mini_gallery_per_frame_price !== undefined && s.mini_gallery_per_frame_price !== ''
      ? per
      : DEFAULT_MINI_GALLERY_RULES.perFramePrice,
  };
}

export function miniGalleryPrice(basePrice: number, frames: number, rules: MiniGalleryRules): number {
  return Math.max(0, Math.round(basePrice + (frames - rules.baseFrames) * rules.perFramePrice));
}

// Cart/order label for a pack size, parsed back by the server: "5 Frames"
export const framesLabel = (n: number) => `${n} Frames`;

// Same product-type detection the customizer uses (admin-set type wins, else legacy keywords)
export function isMiniGalleryProduct(product: Pick<Product, 'product_type' | 'category_slug' | 'title' | 'slug'>): boolean {
  const explicit = Boolean(product.product_type) && product.product_type !== 'standard';
  if (explicit) return product.product_type === 'mini_gallery';
  return Boolean(
    product.category_slug?.includes('mini-gallary') ||
      product.category_slug?.includes('gallery') ||
      product.title?.toLowerCase().includes('gallery') ||
      product.slug?.includes('gallery')
  );
}
