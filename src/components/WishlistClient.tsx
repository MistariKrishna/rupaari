"use client";

import Link from "next/link";
import { getProduct } from "@/lib/products";
import ProductCard from "./ProductCard";
import { useStore } from "./StoreProvider";

export default function WishlistClient() {
  const { wish } = useStore();
  const items = wish.map((id) => getProduct(id)).filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (items.length === 0) {
    return (
      <div className="py-16">
        <p className="f-serif text-[2.4rem] text-wine">Nothing saved yet</p>
        <p className="mt-3 max-w-[40ch] text-ink/70">Tap the heart on any piece to keep it here.</p>
        <Link href="/collections/sarees" className="btn mt-7 inline-flex">Shop sarees</Link>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
      {items.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}