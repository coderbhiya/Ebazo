import CMSPageViewer from '@/components/CMSPageViewer';
import { pageMetadata } from '@/lib/seo';

export function generateMetadata() {
  return pageMetadata('/shipping-policy');
}

export default function ShippingPolicyPage() {
  return <CMSPageViewer slug="shipping-policy" fallbackTitle="Shipping & Delivery Policy" />;
}
