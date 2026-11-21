"use client";

import Link from "next/link";
import { productSlot } from "@/lib/images";
import { categoryLabel, discountPct, money, weaveLabel, type Product } from "@/lib/products";
import Media from "./Media";
import { useStore } from "./StoreProvider";
import WishlistButton from "./WishlistButton";

/** Product tile: image, badge, wishlist heart, quick add, name and price. */
export default function ProductCard({ product, priority = false, detailed = false }: { product: Product; priority?: boolean; detailed?: boolean }) {
  const { add } = useStore();
  const pct = discountPct(product);
  return (
    <article className="pc group">
      <div className="relative">
        <Link href={`/product/${product.id}`} data-cursor="View" aria-label={product.name} className="block">
          <div className="zoom overflow-hidden">
            <Media tone={product.tone} className="aspect-[4/5] w-full" priority={priority} sizes="(min-width: 1024px) 25vw, 50vw" {...productSlot(product)} />
          </div>
        </Link>
        {product.badge && <span className="badge pointer-events-none absolute left-3 top-3">{product.badge}</span>}
        <WishlistButton id={product.id} name={product.name} className="pc-heart" />
        <button type="button" className="pc-quick" onClick={() => add(product.id)}>
          Quick add
        </button>
      </div>
      {detailed && <p className="pc-tag mt-4">{weaveLabel(product.weave) ?? categoryLabel(product.category)}</p>}
      <h3 className={`${detailed ? "mt-1.5" : "mt-4"} pc-name font-display text-[1rem] uppercase leading-snug tracking-[.04em] md:text-[1.05rem]`}>
        <Link href={`/product/${product.id}`}>{product.name}</Link>
      </h3>
      {detailed && <p className="pc-mute mt-1.5 line-clamp-2 text-[13px] leading-snug">{product.blurb}</p>}
      <p className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[15px]">
        <span className="pc-text font-medium">{money(product.price)}</span>
        {product.mrp && product.mrp > product.price && (
          <>
            <s className="pc-mute text-[13px]">{money(product.mrp)}</s>
            <span className="pc-accent text-[12px] font-medium uppercase tracking-[.1em]">{pct}% off</span>
          </>
        )}
      </p>
    </article>
  );
}