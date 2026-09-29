import CMSPageViewer from '@/components/CMSPageViewer';
import { pageMetadata } from '@/lib/seo';

export function generateMetadata() {
  return pageMetadata('/about');
}

export default function AboutPage() {
  return <CMSPageViewer slug="about-us" fallbackTitle="About Us" />;
}
