import type { Metadata } from "next";
import ProductView from "@/components/ProductView";
import { getProduct, products } from "@/lib/products";

type Params = Promise<{ id: string }>;

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const p = getProduct(id);
  return p ? { title: p.name, description: p.blurb } : { title: "Product" };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { id } = await params;
  return <ProductView id={id} />;
}