// Storefront pages with their own title / meta description. Admin > SEO overrides these
// (settings.seo_pages = { "<path>": { title, description } }); these are the defaults.
// Titles are complete (brand included) and used as-is.

export interface SeoEntry {
  title: string;
  description: string;
}

export interface SeoPageDef extends SeoEntry {
  path: string;
  label: string;
  // Checkout / account / login pages are kept out of search results
  noindex?: boolean;
  // Content comes from Admin > Pages; that page's own meta title/description is used when set
  cmsSlug?: string;
}

export const SEO_PAGES: SeoPageDef[] = [
  {
    path: '/',
    label: 'Home',
    title: 'Ebanzo | Premium Personalized Photo Gifting & Acrylic Keepsakes',
    description:
      'Custom acrylic photo frames, photo stands, fridge magnets, wall clocks, keychains and car accessories. Fused with Japanese UV print technology and delivered across India.',
  },
  {
    path: '/shop',
    label: 'Shop (all products)',
    title: 'Shop Personalized Photo Gifts & Acrylic Frames | Ebanzo',
    description:
      'Browse personalized acrylic photo frames, photo stands, mini galleries, fridge magnets, wall clocks, keychains, car stands and wallet cards. Upload your photo and preview it live.',
  },
  {
    path: '/about',
    label: 'About Us',
    cmsSlug: 'about-us',
    title: 'About Us | Ebanzo - Bespoke Photo Keepsakes & Acrylic Gifting',
    description: 'Discover the craftsmanship and story behind Ebanzo personalized acrylic photo gifting.',
  },
  {
    path: '/contact',
    label: 'Contact',
    title: 'Contact Us | Ebanzo Customer Support',
    description: 'Questions about an order or a custom photo gift? Reach the Ebanzo team on WhatsApp, phone or email.',
  },
  {
    path: '/faqs',
    label: 'FAQs',
    cmsSlug: 'faqs',
    title: 'Frequently Asked Questions (FAQs) | Ebanzo Help Center',
    description: 'Find answers to common questions about Ebanzo personalized photo gifts, photo resolution guidelines, and delivery.',
  },
  {
    path: '/blog',
    label: 'Blog',
    title: 'Gifting Ideas, Guides & Stories | Ebanzo Blog',
    description: 'Personalized gift ideas, acrylic photo care guides and stories from the Ebanzo studio.',
  },
  {
    path: '/track',
    label: 'Track Order',
    title: 'Track Your Order | Ebanzo',
    description: 'Track your Ebanzo order with your order or tracking number and see live delivery status.',
  },
  {
    path: '/privacy-policy',
    label: 'Privacy Policy',
    cmsSlug: 'privacy-policy',
    title: 'Privacy Policy & Photo Security | Ebanzo',
    description: 'Read our comprehensive privacy policy. Learn how Ebanzo protects your photos and personal data.',
  },
  {
    path: '/terms-and-conditions',
    label: 'Terms & Conditions',
    cmsSlug: 'terms-and-conditions',
    title: 'Terms & Conditions | Ebanzo Store Policies',
    description: 'Review the terms and conditions for ordering bespoke photo gifts on Ebanzo.',
  },
  {
    path: '/refund-policy',
    label: 'Refund Policy',
    cmsSlug: 'refund-policy',
    title: 'Refund & Replacement Policy | Ebanzo',
    description: 'Our 100% Free Replacement Guarantee for damaged transit items. Transparent refund and replacement policy.',
  },
  {
    path: '/shipping-policy',
    label: 'Shipping Policy',
    cmsSlug: 'shipping-policy',
    title: 'Shipping & Delivery Policy | Ebanzo Express Pan-India',
    description: 'Learn about Ebanzo delivery timelines, free express shipping across 27,000+ pincodes, and live parcel tracking.',
  },
  {
    path: '/auth',
    label: 'Login / Sign up',
    noindex: true,
    title: 'Login or Create Account | Ebanzo',
    description: 'Sign in to your Ebanzo account to track orders, save addresses and check out faster.',
  },
  {
    path: '/checkout',
    label: 'Checkout',
    noindex: true,
    title: 'Secure Checkout | Ebanzo',
    description: 'Complete your Ebanzo order with secure payment and pan-India delivery.',
  },
  {
    path: '/account',
    label: 'My Account',
    noindex: true,
    title: 'My Account | Ebanzo',
    description: 'Your Ebanzo orders, addresses and profile.',
  },
];

// Recommended lengths shown in the admin (Google truncates beyond roughly these)
export const TITLE_LIMIT = 60;
export const DESCRIPTION_LIMIT = 160;

// Default product-page meta description, built from the product name
export function productDescription(name: string): string {
  return `Buy ${name} online at Ebanzo. Personalize it with your photo, preview it live and get it delivered across India.`;
}
