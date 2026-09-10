import CMSPageViewer from '@/components/CMSPageViewer';

export const metadata = {
  title: 'About Us | Ebanzo - Bespoke Photo Keepsakes & Acrylic Gifting',
  description: 'Discover the craftsmanship and story behind Ebanzo personalized acrylic photo gifting.',
};

export default function AboutPage() {
  return <CMSPageViewer slug="about-us" fallbackTitle="About Us" />;
}
