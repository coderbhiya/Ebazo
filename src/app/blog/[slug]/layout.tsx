import type { Metadata } from 'next';
import { API_BASE, BlogPost } from '@/lib/api';
import { buildMetadata, toDescription } from '@/lib/seo';

// The article page is a client component, so its metadata lives here: the post's own meta
// title / description (Admin > Blogs), else its title and summary
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  // ?meta=1 so this lookup doesn't count as a view
  const res = await fetch(`${API_BASE}/blogs/${encodeURIComponent(slug)}?meta=1`, { cache: 'no-store' }).catch(() => null);
  const post: BlogPost | null = res?.ok ? (await res.json()).data ?? null : null;
  if (!post) return {};
  return buildMetadata({
    title: post.meta_title?.trim() || `${post.title} | Ebanzo Blog`,
    description: post.meta_description?.trim() || toDescription(post.summary || post.content),
    image: post.featured_image,
  });
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
