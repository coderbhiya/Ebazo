import type { Metadata } from 'next';
import { cache } from 'react';
import { connection } from 'next/server';
import { fetchPageBySlug, fetchPublicSettings, parseJsonSetting } from './api';
import { SEO_PAGES, SeoEntry, productDescription } from './seo-pages';

// Server-side helpers for every page's <title> and meta description (see lib/seo-pages.ts)

// One settings request per render, shared by the layout and the page's metadata.
// connection(): only at request time — never during `next build`, so the build doesn't depend on
// reaching the API (a build that fetched settings for all ~40 pages failed on the host).
export const getSettings = cache(async () => {
  await connection();
  return fetchPublicSettings();
});

// Plain-text description: HTML stripped, whitespace collapsed, cut at a word near 160 chars
export function toDescription(text?: string | null, max = 160): string {
  const plain = (text || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ') > max * 0.6 ? cut.lastIndexOf(' ') : cut.length)}…`;
}

export function buildMetadata({
  title,
  description,
  image,
  noindex,
}: SeoEntry & { image?: string | null; noindex?: boolean }): Metadata {
  return {
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      siteName: 'Ebanzo',
      type: 'website',
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: { card: image ? 'summary_large_image' : 'summary', title, description, ...(image ? { images: [image] } : {}) },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

// Admin > SEO overrides, keyed by path
export async function seoOverrides(): Promise<Record<string, Partial<SeoEntry>>> {
  const settings = await getSettings();
  return parseJsonSetting<Record<string, Partial<SeoEntry>>>(settings.seo_pages, {});
}

// The website's own title (Admin > SEO > Home, else the default) — other titles build on it
export async function siteTitle(): Promise<string> {
  const o = (await seoOverrides())['/'] || {};
  return o.title?.trim() || SEO_PAGES.find((p) => p.path === '/')!.title;
}

// Default product-page SEO: "<product name> | <website title>", description from the name
export async function productSeoDefaults(name: string): Promise<SeoEntry> {
  return {
    title: `${name} | ${await siteTitle()}`,
    description: productDescription(name),
  };
}

// Metadata for one of the fixed storefront pages. Priority: Admin > SEO, then the CMS page's
// own meta fields (Admin > Pages), then the defaults in seo-pages.ts.
export async function pageMetadata(path: string): Promise<Metadata> {
  const def = SEO_PAGES.find((p) => p.path === path);
  if (!def) return {};
  await connection();
  const [overrides, cms] = await Promise.all([seoOverrides(), def.cmsSlug ? fetchPageBySlug(def.cmsSlug) : null]);
  const o = overrides[path] || {};
  return buildMetadata({
    title: o.title?.trim() || cms?.meta_title?.trim() || def.title,
    description: o.description?.trim() || toDescription(cms?.meta_description) || def.description,
    noindex: def.noindex,
  });
}
