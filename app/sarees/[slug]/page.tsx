import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PRODUCTS, productBySlug } from '@/lib/data';
import { ProductView } from '@/components/shop/ProductView';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const p = productBySlug(slug);
  return { title: p ? `${p.name} — Rupaari` : 'Rupaari', description: p?.line };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const p = productBySlug(slug);
  if (!p) notFound();
  return <ProductView id={p.id} />;
}
