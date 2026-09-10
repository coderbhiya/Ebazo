import CMSPageViewer from '@/components/CMSPageViewer';

export const metadata = {
  title: 'Refund & Replacement Policy | Ebanzo',
  description: 'Our 100% Free Replacement Guarantee for damaged transit items. Transparent refund and replacement policy.',
};

export default function RefundPolicyPage() {
  return <CMSPageViewer slug="refund-policy" fallbackTitle="Refund & Replacement Policy" />;
}
