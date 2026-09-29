import CMSPageViewer from '@/components/CMSPageViewer';
import { pageMetadata } from '@/lib/seo';

export function generateMetadata() {
  return pageMetadata('/privacy-policy');
}

export default function PrivacyPolicyPage() {
  return <CMSPageViewer slug="privacy-policy" fallbackTitle="Privacy Policy" />;
}
