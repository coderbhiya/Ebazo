import { pageMetadata } from '@/lib/seo';

// The page is a client component, so its title / meta description live here (Admin > SEO)
export function generateMetadata() {
  return pageMetadata('/blog');
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
