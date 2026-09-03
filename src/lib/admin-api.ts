import { API_BASE } from './api';

export interface AdminStats {
  revenue: number;
  total_orders: number;
  pending_print: number;
  shipped_orders: number;
  total_products: number;
  recent_orders: Order[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_title: string;
  product_image: string;
  shape_selected: string;
  custom_photo_url: string;
  custom_text: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: number;
  order_number: string;
  tracking_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  city: string;
  state: string;
  pincode: string;
  subtotal: number;
  shipping_fee: number;
  discount: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: 'processing' | 'printing' | 'dispatched' | 'delivered';
  courier_name: string;
  notes: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface AdminProduct {
  id: number;
  title: string;
  slug: string;
  category_slug: string;
  original_price: number;
  price: number;
  short_desc: string;
  description: string;
  material: string;
  dimensions: string;
  shapes: string[];
  image_url: string;
  is_bestseller: number;
  is_featured: number;
  stock: number;
}

export interface Inquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

export async function adminLogin(username: string, password: string) {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
}

export async function fetchAdminStats(): Promise<AdminStats | null> {
  try {
    const res = await fetch(`${API_BASE}/admin/stats`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    return null;
  }
}

export async function fetchAdminOrders(status?: string): Promise<Order[]> {
  try {
    const url = status ? `${API_BASE}/admin/orders?status=${status}` : `${API_BASE}/admin/orders`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.error('Error fetching admin orders:', err);
    return [];
  }
}

export async function updateOrderStatus(id: number, status: string, courierName?: string) {
  const res = await fetch(`${API_BASE}/admin/orders/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_status: status, courier_name: courierName }),
  });
  return res.json();
}

export async function fetchAdminProducts(): Promise<AdminProduct[]> {
  try {
    const res = await fetch(`${API_BASE}/products`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.error('Error fetching admin products:', err);
    return [];
  }
}

export async function saveAdminProduct(productData: Partial<AdminProduct>, id?: number) {
  const url = id ? `${API_BASE}/admin/products/${id}` : `${API_BASE}/admin/products`;
  const method = id ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  return res.json();
}

export async function deleteAdminProduct(id: number) {
  const res = await fetch(`${API_BASE}/admin/products/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function fetchAdminInquiries(): Promise<Inquiry[]> {
  try {
    const res = await fetch(`${API_BASE}/admin/inquiries`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.error('Error fetching admin inquiries:', err);
    return [];
  }
}
