import CMSPageViewer from '@/components/CMSPageViewer';
import { pageMetadata } from '@/lib/seo';

export function generateMetadata() {
  return pageMetadata('/terms-and-conditions');
}

export default function TermsPage() {
  return <CMSPageViewer slug="terms-and-conditions" fallbackTitle="Terms & Conditions" />;
}
