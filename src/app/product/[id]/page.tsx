import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ProductView from "@/components/ProductView";
import { abs } from "@/lib/seo";
import { categoryLabel, getProduct, products } from "@/lib/products";

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
  const p = getProduct(id);
  return (
    <>
      {p && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              { "@type": "Product", name: p.name, description: p.blurb, sku: p.id, category: categoryLabel(p.category), material: p.fabric, brand: { "@type": "Brand", name: "RUPAARI" }, url: abs(`/product/${p.id}`), offers: { "@type": "Offer", price: p.price, priceCurrency: "INR", availability: p.inStock === false ? "https://schema.org/OutOfStock" : "https://schema.org/InStock", url: abs(`/product/${p.id}`) } },
              { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: abs("/") }, { "@type": "ListItem", position: 2, name: categoryLabel(p.category), item: abs(`/collections/${p.category}`) }, { "@type": "ListItem", position: 3, name: p.name, item: abs(`/product/${p.id}`) }] },
            ],
          }}
        />
      )}
      <ProductView id={id} />
    </>
  );
}
