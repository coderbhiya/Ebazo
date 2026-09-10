import CMSPageViewer from '@/components/CMSPageViewer';

export const metadata = {
  title: 'Terms & Conditions | Ebanzo Store Policies',
  description: 'Review the terms and conditions for ordering bespoke photo gifts on Ebanzo.',
};

export default function TermsPage() {
  return <CMSPageViewer slug="terms-and-conditions" fallbackTitle="Terms & Conditions" />;
}
