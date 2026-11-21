import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import CollectionBanner, { type Crumb } from "@/components/CollectionBanner";
import CollectionGrid from "@/components/CollectionGrid";
import { categories, collections, getCollection, productsIn } from "@/lib/products";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return [...categories.map((c) => ({ slug: c.slug })), ...collections.map((c) => ({ slug: c.slug }))];
}

function resolve(slug: string) {
  const category = categories.find((c) => c.slug === slug);
  if (category) {
    const crumbs: Crumb[] = [{ label: "Home", href: "/" }, { label: category.label }];
    return { title: category.label, line: category.blurb, tone: category.tone, crumbs, items: productsIn(category.slug), showWeaves: category.slug === "sarees", defaultWeaves: [] as string[] };
  }
  const col = getCollection(slug);
  if (col) {
    const crumbs: Crumb[] = [{ label: "Home", href: "/" }, { label: "Sarees", href: "/collections/sarees" }, { label: col.name }];
    return { title: col.name, line: col.line, tone: col.tone, crumbs, items: productsIn("sarees"), showWeaves: true, defaultWeaves: col.weaves as string[] };
  }
  return null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const r = resolve(slug);
  return r ? { title: r.title, description: r.line } : { title: "Not found" };
}

export default async function CollectionPage({ params }: { params: Params }) {
  const { slug } = await params;
  const r = resolve(slug);
  if (!r) notFound();
  return (
    <div className="cp-page">
      <CollectionBanner crumbs={r.crumbs} title={r.title} line={r.line} tone={r.tone} />
      <Suspense fallback={<p className="py-24 text-center text-ink/60">Loading pieces…</p>}>
        <CollectionGrid items={r.items} showWeaves={r.showWeaves} defaultWeaves={r.defaultWeaves} />
      </Suspense>
    </div>
  );
}