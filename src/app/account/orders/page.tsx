'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { userOrders, UserOrder } from '@/lib/api';
import { ShoppingBag, ChevronLeft, Package, Truck, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: '#92400e', bg: '#fef3c7', icon: <Clock size={13} /> },
  processing: { label: 'Processing', color: '#1d4ed8', bg: '#dbeafe', icon: <Package size={13} /> },
  printing: { label: 'Printing', color: '#6d28d9', bg: '#f5f3ff', icon: <Package size={13} /> },
  shipped: { label: 'Shipped', color: '#065f46', bg: '#d1fae5', icon: <Truck size={13} /> },
  delivered: { label: 'Delivered', color: '#14532d', bg: '#bbf7d0', icon: <CheckCircle size={13} /> },
  cancelled: { label: 'Cancelled', color: '#991b1b', bg: '#fee2e2', icon: <XCircle size={13} /> },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: '#374151', bg: '#f3f4f6', icon: <Clock size={13} /> };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: cfg.bg, color: cfg.color, fontSize: 12, fontWeight: 600 }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

export default function OrdersPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth?redirect=/account/orders');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      userOrders().then(data => { setOrders(data); setLoading(false); });
    }
  }, [isAuthenticated]);

  if (isLoading || loading) {
    return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#7c3aed' }}>Loading orders...</span></div>;
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <Link href="/account" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#7c3aed', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
          <ChevronLeft size={16} /> Back
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0 }}>My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f9fafb', borderRadius: 16 }}>
          <ShoppingBag size={48} color="#d1d5db" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: 18, fontWeight: 700, color: '#374151' }}>No orders yet</p>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>Start shopping to see your orders here.</p>
          <Link href="/shop" style={{ background: '#7c3aed', color: '#fff', padding: '10px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
            Shop Now
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map(order => (
            <div key={order.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>#{order.order_number}</p>
                  <p style={{ fontSize: 12, color: '#9ca3af', margin: '3px 0 0' }}>{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <StatusBadge status={order.order_status} />
                  <Link href={`/account/orders/${order.id}`} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#7c3aed', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                    <Eye size={14} /> View
                  </Link>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
                    Ship to: <strong style={{ color: '#111827' }}>{order.city}, {order.state} — {order.pincode}</strong>
                  </p>
                  {order.tracking_number && (
                    <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>
                      Tracking: <Link href={`/track?id=${order.tracking_number}`} style={{ color: '#7c3aed', fontWeight: 600, textDecoration: 'none' }}>{order.tracking_number}</Link>
                    </p>
                  )}
                </div>
                <p style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>₹{Number(order.total_amount).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
