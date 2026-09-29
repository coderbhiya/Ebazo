import CMSPageViewer from '@/components/CMSPageViewer';
import { pageMetadata } from '@/lib/seo';

export function generateMetadata() {
  return pageMetadata('/faqs');
}

export default function FAQsPage() {
  return <CMSPageViewer slug="faqs" fallbackTitle="Frequently Asked Questions" />;
}
