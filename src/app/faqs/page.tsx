import CMSPageViewer from '@/components/CMSPageViewer';

export const metadata = {
  title: 'Frequently Asked Questions (FAQs) | Ebanzo Help Center',
  description: 'Find answers to common questions about Ebanzo personalized photo gifts, photo resolution guidelines, and delivery.',
};

export default function FAQsPage() {
  return <CMSPageViewer slug="faqs" fallbackTitle="Frequently Asked Questions" />;
}
