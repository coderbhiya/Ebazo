export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000/api';

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id?: number | null;
  parent_name?: string | null;
  image_url: string;
  description: string;
  display_order: number;
  product_count?: number;
  bg_removal_enabled: number; // 0 or 1
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
}

export interface CustomizationSettings {
  zoom: number;
  rotation: number;
  posX: number;
  posY: number;
  text?: string;
  textStyle?: 'gold' | 'frosted' | 'dark';
  shape?: string;
  frameImage?: string;
}

export interface CartItem {
  id: string; // unique cart item id
  productId: number;
  title: string;
  slug: string;
  price: number;
  image: string;
  shape: string;
  customPhotoUrl?: string;
  printReadyArtworkUrl?: string;
  customizationSettings?: CustomizationSettings;
  customPhotoData?: string;
  customText?: string;
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
  discount?: number;
  items: {
    product_id: number;
    product_title: string;
    product_image: string;
    shape_selected: string;
    custom_photo_url?: string;
    print_ready_artwork_url?: string;
    customization_json?: string | CustomizationSettings;
    custom_text?: string;
    quantity: number;
    price: number;
  }[];
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
    return data.data || [];
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
    return data.data || null;
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

export async function uploadPrintArtwork(base64Data: string): Promise<{ url: string; filename: string } | null> {
  try {
    const res = await fetch(`${API_BASE}/upload-artwork`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ artwork_data: base64Data }),
    });
    if (!res.ok) throw new Error('Artwork upload failed');
    const data = await res.json();
    return data.data || null;
  } catch (err) {
    console.warn('Artwork upload notice:', err);
    return null;
  }
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




