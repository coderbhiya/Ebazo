import CMSPageViewer from '@/components/CMSPageViewer';
import { pageMetadata } from '@/lib/seo';

export function generateMetadata() {
  return pageMetadata('/refund-policy');
}

export default function RefundPolicyPage() {
  return <CMSPageViewer slug="refund-policy" fallbackTitle="Refund & Replacement Policy" />;
}
