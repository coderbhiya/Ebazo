import type { Metadata } from 'next';
import { fetchCategories } from '@/lib/api';
import { buildMetadata, pageMetadata, toDescription } from '@/lib/seo';
import ShopClient from './ShopClient';

// /shop?category=<slug> gets that category's title / description (Admin > Categories > SEO,
// else its name and description); plain /shop uses Admin > SEO
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { category } = await searchParams;
  const slug = typeof category === 'string' ? category : '';
  const cat = slug ? (await fetchCategories()).find((c) => c.slug === slug) : undefined;
  if (!cat) return pageMetadata('/shop');
  return buildMetadata({
    title: cat.meta_title?.trim() || `${cat.name} | Personalized Photo Gifts | Ebanzo`,
    description:
      cat.meta_description?.trim() ||
      toDescription(cat.description) ||
      `Shop personalized ${cat.name.toLowerCase()} from Ebanzo. Upload your photo, preview it live and get it delivered across India.`,
    image: cat.image_url,
  });
}

export default function ShopPage() {
  return <ShopClient />;
}
