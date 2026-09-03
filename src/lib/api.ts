export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000/api';

export interface Category {
  id: number;
  name: string;
  slug: string;
  image_url: string;
  description: string;
  display_order: number;
  product_count?: number;
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
    console.error('Error fetching categories:', err);
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
    console.error('Error fetching products:', err);
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
    console.error('Error fetching product:', err);
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
    console.error('Upload error:', err);
    return null;
  }
}

export async function createOrder(payload: OrderPayload) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
