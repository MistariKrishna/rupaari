import type { MetadataRoute } from "next";
import { articles } from "@/lib/journal";
import { categories, products } from "@/lib/products";
import { abs } from "@/lib/seo";

const pages = ["", "/about", "/craft", "/sustainability", "/journal", "/contact", "/consultation", "/collections", "/occasions", "/faq", "/care", "/size-drape-guide", "/authenticity", "/shipping-returns", "/privacy", "/terms", "/gift-cards", "/waitlist", "/stores"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    ...pages.map((p) => ({ url: abs(p || "/"), lastModified: now, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.6 })),
    ...categories.map((c) => ({ url: abs(`/collections/${c.slug}`), lastModified: now, changeFrequency: "daily" as const, priority: 0.8 })),
    ...products.map((p) => ({ url: abs(`/product/${p.id}`), lastModified: now, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...articles.map((a) => ({ url: abs(`/journal/${a.slug}`), lastModified: new Date(a.date), changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
