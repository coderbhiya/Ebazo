import type { Metadata } from 'next';
import { fetchPageBySlug } from '@/lib/api';
import { buildMetadata, toDescription } from '@/lib/seo';

// CMS pages (Admin > Pages) are client-rendered; their meta title / description are set here
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await fetchPageBySlug(slug);
  if (!page) return {};
  return buildMetadata({
    title: page.meta_title?.trim() || `${page.title} | Ebanzo`,
    description: page.meta_description?.trim() || toDescription(page.subtitle || page.content),
  });
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
