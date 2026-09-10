'use client';


import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { userOrderDetail, UserOrder } from '@/lib/api';
import { ChevronLeft, Package, Truck, CheckCircle, Clock, XCircle, Image as ImageIcon } from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: '#92400e', bg: '#fef3c7' },
  processing: { label: 'Processing', color: '#1d4ed8', bg: '#dbeafe' },
  printing: { label: 'Printing', color: '#6d28d9', bg: '#f5f3ff' },
  shipped: { label: 'Shipped', color: '#065f46', bg: '#d1fae5' },
  delivered: { label: 'Delivered', color: '#14532d', bg: '#bbf7d0' },
  cancelled: { label: 'Cancelled', color: '#991b1b', bg: '#fee2e2' },
};

const STAGES = ['pending', 'processing', 'printing', 'shipped', 'delivered'];

export default function OrderDetailPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<UserOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth?redirect=/account/orders');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && params?.id) {
      userOrderDetail(Number(params?.id)).then(data => { setOrder(data); setLoading(false); });
    }
  }, [isAuthenticated, params?.id]);

  if (isLoading || loading) {
    return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#7c3aed' }}>Loading order...</span></div>;
  }

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <p style={{ fontSize: 18, fontWeight: 700, color: '#374151' }}>Order not found</p>
        <Link href="/account/orders" style={{ color: '#7c3aed' }}>← Back to Orders</Link>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[order.order_status] || { label: order.order_status, color: '#374151', bg: '#f3f4f6' };
  const currentStageIdx = STAGES.indexOf(order.order_status);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <Link href="/account/orders" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#7c3aed', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
          <ChevronLeft size={16} /> My Orders
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>Order #{order.order_number}</h1>
        <span style={{ padding: '4px 12px', borderRadius: 20, background: statusCfg.bg, color: statusCfg.color, fontSize: 12, fontWeight: 600 }}>
          {statusCfg.label}
        </span>
      </div>

      {/* Progress Tracker */}
      {order.order_status !== 'cancelled' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '24px 28px', marginBottom: 20 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: '#374151', marginBottom: 20 }}>Order Progress</p>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {STAGES.map((stage, i) => {
              const done = i <= currentStageIdx;
              const active = i === currentStageIdx;
              const icons = [<Clock key="c" size={16} />, <Package key="p1" size={16} />, <Package key="p2" size={16} />, <Truck key="t" size={16} />, <CheckCircle key="ch" size={16} />];
              return (
                <div key={stage} style={{ display: 'flex', alignItems: 'center', flex: i < STAGES.length - 1 ? 1 : 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: done ? (active ? '#7c3aed' : '#e9d5ff') : '#f3f4f6',
                      color: done ? (active ? '#fff' : '#7c3aed') : '#9ca3af',
                      fontWeight: 700, transition: 'all 0.3s',
                      boxShadow: active ? '0 0 0 4px rgba(124,58,237,0.2)' : 'none',
                    }}>
                      {icons[i]}
                    </div>
                    <span style={{ fontSize: 10, color: done ? '#7c3aed' : '#9ca3af', fontWeight: done ? 700 : 400, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                      {stage}
                    </span>
                  </div>
                  {i < STAGES.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: i < currentStageIdx ? '#7c3aed' : '#e5e7eb', margin: '0 4px', marginBottom: 20 }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Shipping Details */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '20px 22px' }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: '#374151', marginBottom: 12 }}>Delivery Address</p>
          <p style={{ fontSize: 14, color: '#374151', margin: 0, fontWeight: 600 }}>{order.customer_name}</p>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '6px 0 0' }}>{order.shipping_address}</p>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '2px 0 0' }}>{order.city}, {order.state} — {order.pincode}</p>
          {order.tracking_number && (
            <Link href={`/track?id=${order.tracking_number}`} style={{ display: 'inline-block', marginTop: 12, color: '#7c3aed', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
              🚚 Track: {order.tracking_number}
            </Link>
          )}
        </div>

        {/* Payment Details */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '20px 22px' }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: '#374151', marginBottom: 12 }}>Payment Summary</p>
          {([
            ['Subtotal', `₹${Number(order.subtotal || 0).toFixed(2)}`],
            ['Shipping', order.shipping_fee > 0 ? `₹${Number(order.shipping_fee).toFixed(2)}` : 'FREE'],
            order.discount > 0 ? ['Discount', `-₹${Number(order.discount).toFixed(2)}`] : null,
          ].filter((x): x is string[] => x !== null)).map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>{label}</span>
              <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{value}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 10, marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Total</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#7c3aed' }}>₹{Number(order.total_amount).toFixed(2)}</span>
          </div>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '8px 0 0' }}>Paid via {order.payment_method?.replace('_', ' ')}</p>
        </div>
      </div>

      {/* Order Items */}
      {order.items && order.items.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '20px 24px' }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: '#374151', marginBottom: 16 }}>Items Ordered</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {order.items.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 14, borderBottom: '1px solid #f9fafb' }}>
                {item.product_image || item.custom_photo_url ? (
                  <img src={item.print_ready_artwork_url || item.custom_photo_url || item.product_image} alt={item.product_title} style={{ width: 60, height: 60, borderRadius: 10, objectFit: 'cover', border: '1px solid #e5e7eb' }} />
                ) : (
                  <div style={{ width: 60, height: 60, borderRadius: 10, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ImageIcon size={22} color="#9ca3af" />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, color: '#111827', margin: 0 }}>{item.product_title}</p>
                  {item.shape_selected && <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0' }}>Shape: {item.shape_selected}</p>}
                  {item.custom_text && <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0' }}>Text: {item.custom_text}</p>}
                  <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0' }}>Qty: {item.quantity}</p>
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>₹{Number(item.total).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}