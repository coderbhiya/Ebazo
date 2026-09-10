import CMSPageViewer from '@/components/CMSPageViewer';

export const metadata = {
  title: 'Shipping & Delivery Policy | Ebanzo Express Pan-India',
  description: 'Learn about Ebanzo delivery timelines, free express shipping across 27,000+ pincodes, and live parcel tracking.',
};

export default function ShippingPolicyPage() {
  return <CMSPageViewer slug="shipping-policy" fallbackTitle="Shipping & Delivery Policy" />;
}
