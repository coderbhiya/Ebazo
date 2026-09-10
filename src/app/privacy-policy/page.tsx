import CMSPageViewer from '@/components/CMSPageViewer';

export const metadata = {
  title: 'Privacy Policy & Photo Security | Ebanzo',
  description: 'Read our comprehensive privacy policy. Learn how Ebanzo protects your photos and personal data.',
};

export default function PrivacyPolicyPage() {
  return <CMSPageViewer slug="privacy-policy" fallbackTitle="Privacy Policy" />;
}
