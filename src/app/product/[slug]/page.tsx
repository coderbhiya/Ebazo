import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchProduct } from '@/lib/api';
import { buildMetadata, productSeoDefaults } from '@/lib/seo';
import ProductDetailClient from './ProductDetailClient';

export const revalidate = 0;

// Admin > Products > SEO fields, else "<product name> | <website title>" and a description
// built from the product name
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) return {};
  const defaults = await productSeoDefaults(product.title);
  return buildMetadata({
    title: product.meta_title?.trim() || defaults.title,
    description: product.meta_description?.trim() || defaults.description,
    image: product.image_url,
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
