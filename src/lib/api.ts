export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000/api';

export interface HeroSlide {
  id?: string;
  tag?: string;
  badge?: string;
  title: string;
  subtitle: string;
  price?: string;
  price_text?: string;
  image: string;
  mobile_image?: string;
  categoryLink?: string;
  link?: string;
  button_text?: string;
  secondary_button_text?: string;
  secondary_button_link?: string;
  layout?: 'full_banner' | 'split_card';
  text_color?: 'light' | 'dark';
  gradient?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id?: number | null;
  parent_name?: string | null;
  image_url: string;
  description: string;
  display_order: number;
  product_count?: number; // includes sub-categories' products
  own_product_count?: number; // this category's products only
  bg_removal_enabled: number; // 0 or 1
}

// WooCommerce-style attribute on a product (Admin > Products > edit > Attributes & Variations)
export interface ProductAttribute {
  id: number | null; // global attribute id, null for a product-only custom attribute
  name: string;
  type?: 'select' | 'image' | 'color';
  options: string[];
  options_meta?: { name: string; image_url: string | null; color: string | null }[];
  visible: boolean; // show in the product's specifications
  variation: boolean; // customer picks this to choose a variation
}

export interface ProductVariation {
  id?: number;
  attributes: Record<string, string>; // attribute name -> option ('' = any)
  sku: string;
  price: number;
  original_price: number | null;
  stock: number;
  image_url: string;
  frame_url: string; // cutout/mask used by the Live Customizer
  is_active: number;
}

export interface Product {
  id: number;
  title: string;
  slug: string;
  category_id: number;
  category_slug: string;
  category_name?: string;
  original_price: number;
  price: number;
  rating: number;
  reviews_count: number;
  short_desc: string;
  description: string;
  material: string;
  dimensions: string;
  shapes: string[];
  image_url: string;
  gallery: string[];
  is_bestseller: number;
  is_featured: number;
  stock: number;
  related?: Product[];
  category_bg_removal?: number; // 1 = auto bg removal enabled for this category
  product_type?: 'standard' | 'fridge_magnet' | 'dual_side' | 'mini_gallery';
  attributes?: ProductAttribute[];
  variations?: ProductVariation[];
  // Listing endpoint only: active variation price range
  has_variations?: number;
  min_price?: number | null;
  max_price?: number | null;
}

export interface CustomizationSettings {
  zoom: number;
  rotation: number;
  posX: number;
  posY: number;
  flipH?: boolean;
  flipV?: boolean;
  text?: string;
  textStyle?: 'gold' | 'frosted' | 'dark';
  shape?: string;
  frameImage?: string;
  printType?: 'single' | 'dual';
  dualSide?: boolean;
  frontPhotoUrl?: string;
  backPhotoUrl?: string;
  frontArtworkUrl?: string;
  backArtworkUrl?: string;
  setOption?: string;
  multiImages?: {
    slot: number;
    name?: string;
    photoUrl: string;
    artworkUrl?: string;
    shape?: string;
    frameUrl?: string; // the cutout this photo was printed in
    settings?: Partial<CustomizationSettings>;
  }[];
}

export interface CartItem {
  id: string; // unique cart item id
  productId: number;
  title: string;
  slug: string;
  price: number;
  image: string;
  shape: string;
  setOption?: string;
  printType?: 'single' | 'dual';
  customPhotoUrl?: string;
  printReadyArtworkUrl?: string;
  frontPhotoUrl?: string;
  backPhotoUrl?: string;
  frontArtworkUrl?: string;
  backArtworkUrl?: string;
  multiImages?: {
    slot: number;
    name?: string;
    photoUrl: string;
    artworkUrl?: string;
    shape?: string;
    frameUrl?: string; // the cutout this photo was printed in
  }[];
  customizationSettings?: CustomizationSettings;
  customPhotoData?: string;
  customText?: string;
  variationId?: number;
  variationLabel?: string; // e.g. "8x10 in / Gold"
  variationSelection?: Record<string, string>; // what the customer picked (resolves "Any" values)
  frameImage?: string; // cutout the photo was printed in (all customizer flows)
  quantity: number;
}

export interface OrderPayload {
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  shipping_address: string;
  city: string;
  state: string;
  pincode: string;
  payment_method: string;
  notes?: string;
  coupon_code?: string; // Admin > Coupons code; the discount is computed by the server
  items: {
    product_id: number;
    product_title: string;
    product_image: string;
    shape_selected: string;
    variation_id?: number;
    variation_selection?: Record<string, string>;
    custom_photo_url?: string;
    print_ready_artwork_url?: string;
    customization_json?: string | CustomizationSettings | any;
    custom_text?: string;
    quantity: number;
    price: number;
  }[];
}

export function formatProductTitle(title?: string): string {
  if (!title) return '';
  return title
    .replace(/\\u2014/g, '—')
    .replace(/\\u002d/g, '-')
    .replace(/\s*—\s*/g, ' — ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE}/categories`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch categories');
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.warn('Categories API fetch notice:', err);
    return [];
  }
}

export async function fetchProducts(params?: { category?: string; search?: string; featured?: number; bestseller?: number }): Promise<Product[]> {
  try {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.featured !== undefined) query.set('featured', String(params.featured));
    if (params?.bestseller !== undefined) query.set('bestseller', String(params.bestseller));

    const res = await fetch(`${API_BASE}/products?${query.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch products');
    const data = await res.json();
    const list: Product[] = data.data || [];
    // MySQL DECIMAL columns come back as JSON strings (e.g. "349.00"), not numbers — coerce here
    // so every downstream `+`/`.toFixed()` on price/original_price behaves as arithmetic, not
    // string concatenation (that bug silently produced prices like "349.0049").
    return list.map(p => ({
      ...p,
      title: formatProductTitle(p.title),
      short_desc: formatProductTitle(p.short_desc),
      price: Number(p.price),
      original_price: Number(p.original_price),
    }));
  } catch (err) {
    console.warn('Products API fetch notice:', err);
    return [];
  }
}

export async function fetchProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE}/products/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.data) return null;
    const p: Product = data.data;
    return {
      ...p,
      title: formatProductTitle(p.title),
      short_desc: formatProductTitle(p.short_desc),
      price: Number(p.price),
      original_price: Number(p.original_price),
      related: (p.related || []).map(r => ({
        ...r,
        title: formatProductTitle(r.title),
        short_desc: formatProductTitle(r.short_desc),
        price: Number(r.price),
        original_price: Number(r.original_price),
      })),
    };
  } catch (err) {
    console.warn('Product detail API fetch notice:', err);
    return null;
  }
}

export async function uploadCustomPhoto(file: File): Promise<{ url: string; filename: string } | null> {
  try {
    const formData = new FormData();
    formData.append('photo', file);

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.data || null;
  } catch (err) {
    console.warn('Upload API notice:', err);
    return null;
  }
}

// Uploads the print-ready PNG as a binary multipart file (like photo uploads) rather than a
// base64 JSON body, which is ~33% bigger and was being rejected in production — orders then
// reached the admin with only the raw photo and no cut-out print file. Retries once.
export async function uploadPrintArtwork(dataUrl: string): Promise<{ url: string; filename: string } | null> {
  let blob: Blob;
  try {
    blob = await (await fetch(dataUrl)).blob();
  } catch (err) {
    console.warn('Artwork encode notice:', err);
    return null;
  }
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const formData = new FormData();
      formData.append('artwork', blob, 'artwork.png');
      const res = await fetch(`${API_BASE}/upload-artwork`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error(`Artwork upload failed (${res.status})`);
      const data = await res.json();
      if (data?.data?.url) return data.data;
      throw new Error(data?.message || 'Artwork upload failed');
    } catch (err) {
      console.warn(`Artwork upload attempt ${attempt} notice:`, err);
    }
  }
  return null;
}

export async function createOrder(payload: OrderPayload) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('ebanzo_user_token') : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function trackOrder(trackingNumber: string) {
  const res = await fetch(`${API_BASE}/orders/track/${encodeURIComponent(trackingNumber)}`, {
    cache: 'no-store',
  });
  return res.json();
}

export async function submitInquiry(data: { name: string; email: string; phone?: string; subject?: string; message: string }) {
  const res = await fetch(`${API_BASE}/inquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

// ============================================
// USER AUTH & MY ACCOUNT
// ============================================

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

export interface UserAddress {
  id: number;
  user_id: number;
  type: 'shipping' | 'billing';
  first_name?: string;
  last_name?: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  pincode: string;
  phone?: string;
  is_default: number;
}

export interface UserOrder {
  id: number;
  order_number: string;
  tracking_number: string;
  order_status: string;
  payment_status: string;
  payment_method: string;
  total_amount: number;
  subtotal: number;
  shipping_fee: number;
  discount: number;
  created_at: string;
  customer_name: string;
  customer_email: string;
  city: string;
  state: string;
  pincode: string;
  shipping_address: string;
  items?: UserOrderItem[];
  production_stage?: string;
}

export interface UserOrderItem {
  id: number;
  product_title: string;
  product_image?: string;
  shape_selected?: string;
  custom_photo_url?: string;
  print_ready_artwork_url?: string;
  custom_text?: string;
  quantity: number;
  price: number;
  total: number;
}

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('ebanzo_user_token') : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function userRegister(data: { name: string; email: string; phone?: string; password: string }) {
  const res = await fetch(`${API_BASE}/user/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function userLogin(data: { email: string; password: string }) {
  const res = await fetch(`${API_BASE}/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function userMe(): Promise<{ user: User; addresses: UserAddress[]; order_count: number } | null> {
  try {
    const res = await fetch(`${API_BASE}/user/me`, { headers: authHeaders(), cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || null;
  } catch {
    return null;
  }
}

export async function userUpdateProfile(data: { name: string; phone?: string; current_password?: string; new_password?: string }) {
  const res = await fetch(`${API_BASE}/user/profile`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function userOrders(): Promise<UserOrder[]> {
  try {
    const res = await fetch(`${API_BASE}/user/orders`, { headers: authHeaders(), cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function userOrderDetail(id: number): Promise<UserOrder | null> {
  try {
    const res = await fetch(`${API_BASE}/user/orders/${id}`, { headers: authHeaders(), cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || null;
  } catch {
    return null;
  }
}

export async function userAddresses(): Promise<UserAddress[]> {
  try {
    const res = await fetch(`${API_BASE}/user/addresses`, { headers: authHeaders(), cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function userSaveAddress(data: Partial<UserAddress>) {
  const res = await fetch(`${API_BASE}/user/addresses`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export interface PublicSettings {
  hero_mode?: 'split' | 'slider';
  hero_slider_autoplay?: string | boolean;
  hero_slider_interval?: string | number;
  hero_slides?: string | HeroSlide[];
  razorpay_enabled?: string | boolean;
  razorpay_mode?: 'test' | 'live';
  razorpay_key_id?: string;
  razorpay_currency?: string;
  free_shipping_threshold?: string | number;
  shipping_fee?: string | number;
  support_phone?: string;
  support_email?: string;
  store_gst?: string;
  [key: string]: any;
}

export async function fetchPublicSettings(): Promise<PublicSettings> {
  try {
    const res = await fetch(`${API_BASE}/settings`, { cache: 'no-store' });
    if (!res.ok) return { hero_mode: 'split', razorpay_enabled: 'true', razorpay_mode: 'test' };
    const data = await res.json();
    return data.data || { hero_mode: 'split' };
  } catch (err) {
    console.warn('Settings fetch fallback:', err);
    return { hero_mode: 'split', razorpay_enabled: 'true', razorpay_mode: 'test' };
  }
}

// ── Storefront content (Admin > Homepage) ──
export interface BannerContent {
  enabled?: boolean;
  image: string;
  mobile_image?: string;
  link: string;
  alt?: string;
  title?: string;
}

export interface CraftPillar {
  title: string;
  desc: string;
}

export function parseJsonSetting<T>(value: unknown, fallback: T): T {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value !== 'string') return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

// WhatsApp chat link from the admin's number (digits only) and an optional prefilled message
export function whatsappLink(number?: string, message?: string): string {
  const digits = String(number || '').replace(/\D/g, '');
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export type HomeBlockType =
  | 'hero' | 'categories' | 'mid_banner' | 'bestsellers' | 'promo_slider'
  | 'category' | 'featured' | 'craftsmanship' | 'reviews';

export interface HomeReview {
  id: number;
  customer_name: string;
  rating: number;
  title?: string;
  comment: string;
  created_at: string;
  product_title?: string;
  product_slug?: string;
}

export interface HomeBlock {
  id: string;
  type: HomeBlockType;
  enabled: boolean;
  category_id: number | null;
  eyebrow: string;
  title: string;
  subtitle: string;
  limit: number;
  category?: Category;
  products?: Product[];
  reviews?: HomeReview[];
  stats?: { count: number; average: number | null };
}

const toListing = (p: Product): Product => ({
  ...p,
  title: formatProductTitle(p.title),
  short_desc: formatProductTitle(p.short_desc),
  price: Number(p.price),
  original_price: Number(p.original_price),
});

// Ordered homepage sections. `all` also returns disabled ones (for the admin editor).
export async function fetchHome(all = false): Promise<HomeBlock[]> {
  try {
    const res = await fetch(`${API_BASE}/home${all ? '?all=1' : ''}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch homepage');
    const data = await res.json();
    const blocks: HomeBlock[] = data.data?.blocks || [];
    return blocks.map((b) => (b.products ? { ...b, products: b.products.map(toListing) } : b));
  } catch (err) {
    console.warn('Homepage API fetch notice:', err);
    return [];
  }
}

export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<{ ok: boolean; message: string; code?: string; discount?: number }> {
  try {
    const res = await fetch(`${API_BASE}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal }),
    });
    const data = await res.json();
    return data.status === 'success'
      ? { ok: true, message: data.message, code: data.data.code, discount: Number(data.data.discount) }
      : { ok: false, message: data.message || 'This coupon code is not valid.' };
  } catch {
    return { ok: false, message: 'Could not check the coupon. Please try again.' };
  }
}

export interface CMSPage {
  id: number;
  title: string;
  slug: string;
  subtitle?: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  is_published: number;
  is_system: number;
  show_in_header: number;
  show_in_footer: number;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export async function fetchPages(): Promise<CMSPage[]> {
  try {
    const res = await fetch(`${API_BASE}/pages`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.warn('Pages fetch fallback:', err);
    return [];
  }
}

export async function fetchPageBySlug(slug: string): Promise<CMSPage | null> {
  try {
    const res = await fetch(`${API_BASE}/pages/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || null;
  } catch (err) {
    console.warn('Page by slug fetch fallback:', err);
    return null;
  }
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  featured_image: string;
  category: string;
  tags?: string[];
  tags_json?: string;
  author_name: string;
  read_time: string;
  meta_title?: string;
  meta_description?: string;
  is_published: number;
  is_featured: number;
  views_count: number;
  created_at: string;
  updated_at: string;
  related?: Partial<BlogPost>[];
}

export async function fetchBlogPosts(params?: { category?: string; search?: string; tag?: string }): Promise<BlogPost[]> {
  try {
    const q = new URLSearchParams();
    if (params?.category && params.category !== 'all') q.append('category', params.category);
    if (params?.search) q.append('search', params.search);
    if (params?.tag) q.append('tag', params.tag);

    const res = await fetch(`${API_BASE}/blogs?${q.toString()}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.warn('Blog posts fetch fallback:', err);
    return [];
  }
}

export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API_BASE}/blogs/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || null;
  } catch (err) {
    console.warn('Blog post by slug fetch fallback:', err);
    return null;
  }
}

export async function fetchBlogCategories(): Promise<{ category: string; count: number }[]> {
  try {
    const res = await fetch(`${API_BASE}/blogs/categories`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.warn('Blog categories fetch fallback:', err);
    return [];
  }
}





