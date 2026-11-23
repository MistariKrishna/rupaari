"use client";

import Link from "next/link";
import { productSlot } from "@/lib/images";
import { categoryLabel, money, weaveShort, type Product } from "@/lib/products";
import Media from "./Media";
import WishlistButton from "./WishlistButton";

/** Saree product card from the approved collection design (4:5 photo, NEW tag, wishlist, tag, name, line, price). */
export default function CollectionProductCard({ product, priority = false, colour }: { product: Product; priority?: boolean; colour?: string }) {
  const isNew = product.badge === "New" || product.fresh;
  const href = `/product/${product.id}${colour ? `?colour=${encodeURIComponent(colour)}` : ""}`;
  return (
    <article className="cpc group">
      <div className="cpc-media">
        <Link href={href} aria-label={product.name} className="block h-full">
          <div className="zoom h-full overflow-hidden">
            <Media tone={product.tone} className="h-full w-full" priority={priority} sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw" {...productSlot(product, colour)} />
          </div>
        </Link>
        {isNew && <span className="cpc-new">NEW</span>}
        <WishlistButton id={product.id} name={product.name} className="cpc-heart" />
      </div>
      <div className="cpc-info">
        <p className="cpc-tag">{weaveShort(product.weave) ?? categoryLabel(product.category)}{colour ? ` · ${colour}` : ""}</p>
        <h3 className="cpc-name">
          <Link href={href}>{product.name}</Link>
        </h3>
        <p className="cpc-line">{product.blurb}</p>
        <p className="cpc-price">{money(product.price)}</p>
      </div>
    </article>
  );
}