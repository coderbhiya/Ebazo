import React from 'react';
import { notFound } from 'next/navigation';
import { fetchProduct } from '@/lib/api';
import ProductDetailClient from './ProductDetailClient';

export const revalidate = 0;

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
