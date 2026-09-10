import { API_BASE } from './api';

export interface AdminUser {
  id: number;
  username: string;
  name: string;
  role: 'superadmin' | 'admin' | 'operator';
  created_at?: string;
}

export interface AdminStats {
  revenue: number;
  today_revenue: number;
  monthly_revenue: number;
  total_orders: number;
  pending_orders: number;
  pending_print: number;
  production_pending: number;
  ready_to_ship: number;
  shipped_orders: number;
  delivered_orders: number;
  unique_customers: number;
  total_products: number;
  low_stock_count: number;
  out_of_stock_count: number;
  unread_inquiries: number;
  pending_reviews: number;
  recent_orders: Order[];
  status_counts: {
    processing: number;
    printing: number;
    dispatched: number;
    delivered: number;
  };
  top_products: {
    product_id: number;
    product_title: string;
    product_image: string;
    units_sold: number;
    gross_revenue: number;
  }[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_title: string;
  product_image: string;
  shape_selected: string;
  custom_photo_url: string;
  print_ready_artwork_url?: string;
  customization_json?: string;
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
  payment_status: 'paid' | 'pending' | 'failed' | 'refunded';
  order_status: 'processing' | 'printing' | 'dispatched' | 'delivered';
  production_stage?: 'image_received' | 'design_proof' | 'laser_uv_print' | 'quality_check' | 'packaging' | 'dispatched';
  courier_name: string;
  notes: string;
  admin_notes?: string;
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
  gallery?: string[];
  is_bestseller: number;
  is_featured: number;
  stock: number;
  created_at?: string;
}

export interface Customer {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  city: string;
  state: string;
  total_orders: number;
  total_spent: number;
  last_order_date: string;
}

export interface InventoryItem {
  id: number;
  title: string;
  slug: string;
  category_slug: string;
  price: number;
  stock: number;
  image_url: string;
  dimensions: string;
  material: string;
}

export interface Coupon {
  id: number;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_spend: number;
  max_discount: number;
  usage_limit: number;
  used_count: number;
  expires_at?: string;
  is_active: number;
  created_at?: string;
}

export interface Review {
  id: number;
  product_id: number;
  product_title?: string;
  product_image?: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  title?: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  is_featured: number;
  created_at: string;
}

export interface Inquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'unread' | 'read';
  created_at: string;
}

export interface AnalyticsData {
  range: string;
  daily_series: {
    date: string;
    label: string;
    revenue: number;
    orders: number;
  }[];
  category_sales: {
    category_slug: string;
    units_sold: number;
    category_revenue: number;
  }[];
  period_revenue: number;
  period_orders: number;
  average_order_value: number;
}

// ==========================================
// API CLIENT FUNCTIONS
// ==========================================

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
    console.warn('Admin stats fetch notice:', err);
    return null;
  }
}

export async function fetchAdminOrders(params?: {
  page?: number;
  limit?: number;
  status?: string;
  payment_status?: string;
  production_stage?: string;
  search?: string;
  sort?: string;
}): Promise<{ data: Order[]; pagination: { total: number; page: number; limit: number; total_pages: number } }> {
  try {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.status && params.status !== 'all') q.set('status', params.status);
    if (params?.payment_status && params.payment_status !== 'all') q.set('payment_status', params.payment_status);
    if (params?.production_stage && params.production_stage !== 'all') q.set('production_stage', params.production_stage);
    if (params?.search) q.set('search', params.search);
    if (params?.sort) q.set('sort', params.sort);

    const res = await fetch(`${API_BASE}/admin/orders?${q.toString()}`, { cache: 'no-store' });
    if (!res.ok) return { data: [], pagination: { total: 0, page: 1, limit: 20, total_pages: 1 } };
    const data = await res.json();
    return {
      data: data.data || [],
      pagination: data.pagination || { total: 0, page: 1, limit: 20, total_pages: 1 },
    };
  } catch (err) {
    console.warn('Admin orders fetch notice:', err);
    return { data: [], pagination: { total: 0, page: 1, limit: 20, total_pages: 1 } };
  }
}

export async function fetchAdminOrder(id: number | string): Promise<Order | null> {
  try {
    const res = await fetch(`${API_BASE}/admin/orders/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || null;
  } catch (err) {
    console.warn('Admin single order fetch notice:', err);
    return null;
  }
}

export async function updateOrderStatus(
  id: number,
  payload: {
    order_status?: string;
    production_stage?: string;
    courier_name?: string;
    tracking_number?: string;
    payment_status?: string;
    admin_notes?: string;
    notes?: string;
  }
) {
  const res = await fetch(`${API_BASE}/admin/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function bulkUpdateOrderStatus(orderIds: number[], orderStatus?: string, productionStage?: string) {
  const res = await fetch(`${API_BASE}/admin/orders/bulk-status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_ids: orderIds, order_status: orderStatus, production_stage: productionStage }),
  });
  return res.json();
}

export async function fetchProductionOrders(stage?: string): Promise<{ data: Order[]; stages: Record<string, number> }> {
  try {
    const url = stage && stage !== 'all' ? `${API_BASE}/admin/production?stage=${stage}` : `${API_BASE}/admin/production`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return { data: [], stages: {} };
    const data = await res.json();
    return { data: data.data || [], stages: data.stages || {} };
  } catch (err) {
    console.warn('Production orders fetch notice:', err);
    return { data: [], stages: {} };
  }
}

export async function fetchAdminProducts(): Promise<AdminProduct[]> {
  try {
    const res = await fetch(`${API_BASE}/products`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.warn('Admin products fetch notice:', err);
    return [];
  }
}

export async function fetchAdminProductById(id: string | number): Promise<AdminProduct | null> {
  try {
    const res = await fetch(`${API_BASE}/products/${id}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.data) return data.data;
    }
    // Fallback: search in all products
    const all = await fetchAdminProducts();
    return all.find((p) => String(p.id) === String(id) || p.slug === String(id)) || null;
  } catch (err) {
    console.warn('Fetch admin product by ID notice:', err);
    return null;
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

export async function fetchAdminInventory(filter: string = 'all'): Promise<{ data: InventoryItem[]; summary: any }> {
  try {
    const res = await fetch(`${API_BASE}/admin/inventory?filter=${filter}`, { cache: 'no-store' });
    if (!res.ok) return { data: [], summary: { total_items: 0, low_stock: 0, out_of_stock: 0 } };
    const data = await res.json();
    return { data: data.data || [], summary: data.summary || {} };
  } catch (err) {
    console.warn('Admin inventory fetch notice:', err);
    return { data: [], summary: { total_items: 0, low_stock: 0, out_of_stock: 0 } };
  }
}

export async function updateInventoryStock(id: number, stock: number) {
  const res = await fetch(`${API_BASE}/admin/inventory/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stock }),
  });
  return res.json();
}

export async function fetchAdminCustomers(search?: string): Promise<Customer[]> {
  try {
    const url = search ? `${API_BASE}/admin/customers?search=${encodeURIComponent(search)}` : `${API_BASE}/admin/customers`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.warn('Admin customers fetch notice:', err);
    return [];
  }
}

export async function fetchCustomerOrders(query: string): Promise<Order[]> {
  try {
    const res = await fetch(`${API_BASE}/admin/customers/orders?query=${encodeURIComponent(query)}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.warn('Customer orders fetch notice:', err);
    return [];
  }
}

export async function fetchAdminShipping(status?: string): Promise<{ data: any[]; summary: any }> {
  try {
    const url = status && status !== 'all' ? `${API_BASE}/admin/shipping?status=${status}` : `${API_BASE}/admin/shipping`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return { data: [], summary: {} };
    const data = await res.json();
    return { data: data.data || [], summary: data.summary || {} };
  } catch (err) {
    console.warn('Admin shipping fetch notice:', err);
    return { data: [], summary: {} };
  }
}

export async function fetchAdminPayments(status?: string): Promise<{ data: any[]; summary: any }> {
  try {
    const url = status && status !== 'all' ? `${API_BASE}/admin/payments?status=${status}` : `${API_BASE}/admin/payments`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return { data: [], summary: {} };
    const data = await res.json();
    return { data: data.data || [], summary: data.summary || {} };
  } catch (err) {
    console.warn('Admin payments fetch notice:', err);
    return { data: [], summary: {} };
  }
}

export async function fetchAdminCoupons(): Promise<Coupon[]> {
  try {
    const res = await fetch(`${API_BASE}/admin/coupons`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.warn('Admin coupons fetch notice:', err);
    return [];
  }
}

export async function saveAdminCoupon(couponData: Partial<Coupon>, id?: number) {
  const url = id ? `${API_BASE}/admin/coupons/${id}` : `${API_BASE}/admin/coupons`;
  const method = id ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(couponData),
  });
  return res.json();
}

export async function deleteAdminCoupon(id: number) {
  const res = await fetch(`${API_BASE}/admin/coupons/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function fetchAdminReviews(): Promise<Review[]> {
  try {
    const res = await fetch(`${API_BASE}/admin/reviews`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.warn('Admin reviews fetch notice:', err);
    return [];
  }
}

export async function updateAdminReview(id: number, data: { status?: string; is_featured?: number }) {
  const res = await fetch(`${API_BASE}/admin/reviews/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteAdminReview(id: number) {
  const res = await fetch(`${API_BASE}/admin/reviews/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function fetchAdminAnalytics(range: string = '30d'): Promise<AnalyticsData | null> {
  try {
    const res = await fetch(`${API_BASE}/admin/analytics?range=${range}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || null;
  } catch (err) {
    console.warn('Admin analytics fetch notice:', err);
    return null;
  }
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  try {
    const res = await fetch(`${API_BASE}/admin/users`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.warn('Admin users fetch notice:', err);
    return [];
  }
}

export async function saveAdminUser(userData: Partial<AdminUser> & { password?: string }, id?: number) {
  const url = id ? `${API_BASE}/admin/users/${id}` : `${API_BASE}/admin/users`;
  const method = id ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
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
    console.warn('Admin inquiries fetch notice:', err);
    return [];
  }
}

export async function updateInquiryStatus(id: number, status: string = 'read') {
  const res = await fetch(`${API_BASE}/admin/inquiries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

// ── Category Settings & Management ──
export async function fetchAdminCategories(): Promise<import('./api').Category[]> {
  const res = await fetch(`${API_BASE}/admin/categories`, {
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  return data.data || [];
}

export async function createAdminCategory(payload: {
  name: string;
  slug?: string;
  parent_id?: number | null;
  image_url?: string;
  description?: string;
  display_order?: number;
  bg_removal_enabled?: number;
}) {
  const res = await fetch(`${API_BASE}/admin/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateAdminCategory(
  id: number,
  payload: Partial<import('./api').Category>
) {
  const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateCategoryBgRemoval(id: number, enabled: boolean) {
  const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bg_removal_enabled: enabled ? 1 : 0 }),
  });
  return res.json();
}

export async function deleteAdminCategory(id: number) {
  const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function bulkDeleteAdminCategories(ids: number[]) {
  const res = await fetch(`${API_BASE}/admin/categories/bulk-delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  return res.json();
}

export interface AdminSettingsData {
  hero_mode?: 'split' | 'slider';
  hero_slider_autoplay?: string | boolean;
  hero_slider_interval?: string | number;
  razorpay_enabled?: string | boolean;
  razorpay_mode?: 'test' | 'live';
  razorpay_key_id?: string;
  razorpay_key_secret?: string;
  razorpay_webhook_secret?: string;
  razorpay_currency?: string;
  razorpay_auto_capture?: string | boolean;
  // Shiprocket settings
  shiprocket_enabled?: string | boolean;
  shiprocket_mode?: 'sandbox' | 'live';
  shiprocket_email?: string;
  shiprocket_password?: string;
  shiprocket_token?: string;
  shiprocket_pickup_location?: string;
  shiprocket_channel_id?: string;
  shiprocket_default_courier?: string;
  shiprocket_default_weight?: string | number;
  shiprocket_default_length?: string | number;
  shiprocket_default_breadth?: string | number;
  shiprocket_default_height?: string | number;
  shiprocket_auto_push?: string | boolean;
  store_name?: string;
  free_shipping_threshold?: string | number;
  shipping_fee?: string | number;
  support_phone?: string;
  support_email?: string;
  store_gst?: string;
  [key: string]: any;
}

export async function fetchAdminSettings(): Promise<AdminSettingsData> {
  try {
    const res = await fetch(`${API_BASE}/admin/settings`, { cache: 'no-store' });
    if (!res.ok) return {};
    const data = await res.json();
    return data.data || {};
  } catch (err) {
    console.warn('Admin settings fetch notice:', err);
    return {};
  }
}

export async function saveAdminSettings(settings: Partial<AdminSettingsData>) {
  const res = await fetch(`${API_BASE}/admin/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  return res.json();
}

export async function testRazorpayCredentials(payload: {
  razorpay_key_id: string;
  razorpay_key_secret?: string;
  razorpay_mode: 'test' | 'live';
}) {
  const res = await fetch(`${API_BASE}/admin/payments/test-razorpay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function testShiprocketCredentials(payload: {
  shiprocket_email: string;
  shiprocket_password?: string;
  shiprocket_mode: 'sandbox' | 'live';
  shiprocket_pickup_location?: string;
}) {
  const res = await fetch(`${API_BASE}/admin/shipping/test-shiprocket`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function createShiprocketShipment(orderId: number) {
  const res = await fetch(`${API_BASE}/admin/shipping/shiprocket/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_id: orderId }),
  });
  return res.json();
}

// ----------------------------------------------------
// CMS & STOREFRONT PAGES ADMIN API
// ----------------------------------------------------

export interface AdminCMSPage {
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

export async function fetchAdminPages(params?: { search?: string; status?: string }): Promise<{
  pages: AdminCMSPage[];
  meta: { total: number; published: number; drafts: number };
}> {
  try {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.status && params.status !== 'all') q.append('status', params.status);

    const res = await fetch(`${API_BASE}/admin/pages?${q.toString()}`, { cache: 'no-store' });
    if (!res.ok) return { pages: [], meta: { total: 0, published: 0, drafts: 0 } };
    const data = await res.json();
    return {
      pages: data.data || [],
      meta: data.meta || { total: 0, published: 0, drafts: 0 },
    };
  } catch (err) {
    console.warn('Admin pages fetch notice:', err);
    return { pages: [], meta: { total: 0, published: 0, drafts: 0 } };
  }
}

export async function fetchAdminPage(id: number): Promise<AdminCMSPage | null> {
  try {
    const res = await fetch(`${API_BASE}/admin/pages/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || null;
  } catch (err) {
    console.warn('Admin page fetch notice:', err);
    return null;
  }
}

export async function saveAdminPage(id: number | null, payload: Partial<AdminCMSPage>) {
  const url = id ? `${API_BASE}/admin/pages/${id}` : `${API_BASE}/admin/pages`;
  const method = id ? 'PUT' : 'POST';
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteAdminPage(id: number) {
  const res = await fetch(`${API_BASE}/admin/pages/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}

// ----------------------------------------------------
// BLOGS & ARTICLES ADMIN API
// ----------------------------------------------------

export interface AdminBlogPost {
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
}

export async function fetchAdminBlogs(params?: { search?: string; category?: string; status?: string }): Promise<{
  blogs: AdminBlogPost[];
  meta: { total: number; published: number; drafts: number; total_views: number };
}> {
  try {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.category && params.category !== 'all') q.append('category', params.category);
    if (params?.status && params.status !== 'all') q.append('status', params.status);

    const res = await fetch(`${API_BASE}/admin/blogs?${q.toString()}`, { cache: 'no-store' });
    if (!res.ok) return { blogs: [], meta: { total: 0, published: 0, drafts: 0, total_views: 0 } };
    const data = await res.json();
    return {
      blogs: data.data || [],
      meta: data.meta || { total: 0, published: 0, drafts: 0, total_views: 0 },
    };
  } catch (err) {
    console.warn('Admin blogs fetch notice:', err);
    return { blogs: [], meta: { total: 0, published: 0, drafts: 0, total_views: 0 } };
  }
}

export async function fetchAdminBlog(id: number): Promise<AdminBlogPost | null> {
  try {
    const res = await fetch(`${API_BASE}/admin/blogs/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || null;
  } catch (err) {
    console.warn('Admin blog fetch notice:', err);
    return null;
  }
}

export async function saveAdminBlog(id: number | null, payload: Partial<AdminBlogPost>) {
  const url = id ? `${API_BASE}/admin/blogs/${id}` : `${API_BASE}/admin/blogs`;
  const method = id ? 'PUT' : 'POST';
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteAdminBlog(id: number) {
  const res = await fetch(`${API_BASE}/admin/blogs/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}




