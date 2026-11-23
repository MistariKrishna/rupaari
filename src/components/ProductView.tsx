"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import Media from "@/components/Media";
import ProductBuy from "@/components/ProductBuy";
import ProductGallery from "@/components/ProductGallery";
import ProductTabs from "@/components/ProductTabs";
import "./product-view.css";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import { useCatalog, useShopInfo } from "@/lib/catalog";
import { productSlot } from "@/lib/images";
import { categoryLabel, discountPct, money, sizesFor, weaveLabel } from "@/lib/products";
import { useHydrated } from "@/lib/siteContent";

/** Product detail. Reads the catalogue in the browser so products published in the admin open here too. */
export default function ProductView({ id }: { id: string }) {
  const products = useCatalog();
  const shop = useShopInfo();
  const ready = useHydrated();
  const [pick, setPick] = useState("");
  // arriving from a colour filter: open on that colour
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("colour");
    if (c) setPick(c);
  }, [id]);
  const p = products.find((x) => x.id === id);
  if (!p) {
    return (
      <section className="sec-0 py-section">
        <div className="container-x py-24 text-center">
          {ready ? (
            <>
              <h1 className="h-display">This piece is not available</h1>
              <p className="mx-auto mt-4 max-w-[34rem] text-ink/75">It may have been taken off the store. Browse the collection to find something similar.</p>
              <Link href="/collections" className="btn mt-8 inline-flex">Browse collections</Link>
            </>
          ) : (
            <p className="text-ink/60">Loading…</p>
          )}
        </div>
      </section>
    );
  }

  const pct = discountPct(p);
  const others = products.filter((x) => x.id !== p.id);
  const related = [...others.filter((x) => x.category === p.category), ...others.filter((x) => x.category !== p.category)].slice(0, 4);
  const cols = p.colours ?? [];
  const sel = cols.find((c) => c.name.toLowerCase() === pick.toLowerCase()) ?? cols[0];
  const shownGallery = sel?.gallery.length ? sel.gallery : p.gallery;
  const gallery = shownGallery?.length ? shownGallery.map((g) => ({ image: g.src, alt: g.alt })) : [productSlot(p)];
  const eyebrow = weaveLabel(p.weave) ?? categoryLabel(p.category);
  const d = p.details;

  return (
    <>
      <div className="sec-0 pt-10">
        <div className="container-x">
          <nav aria-label="Breadcrumb" className="text-[13px] text-ink/65">
            <ol className="m-0 flex list-none flex-wrap items-center gap-2 p-0">
              <li><Link href="/" className="hover:text-burgundy">Home</Link></li>
              <li aria-hidden="true" className="grid place-items-center"><Icon name="chevron-right" className="!h-4 !w-4" /></li>
              <li><Link href={`/collections/${p.category}`} className="hover:text-burgundy">{categoryLabel(p.category)}</Link></li>
              <li aria-hidden="true" className="grid place-items-center"><Icon name="chevron-right" className="!h-4 !w-4" /></li>
              <li aria-current="page" className="text-wine">{p.name}</li>
            </ol>
          </nav>
        </div>
      </div>

      <section className="sec-0 pb-10 pt-8">
        <div className="container-x pv-top">
          <ProductGallery key={sel?.name ?? "main"} images={gallery} tone={p.tone} name={p.name} badge={p.badge} />

          <div className="pv-info">
            <p className="pv-eyebrow">{eyebrow}</p>
            <h1 className="pv-title">{p.name}</h1>
            <p className="pv-line">{p.blurb}</p>
            <p className="pv-price">
              <span>{money(p.price)}</span>
              {p.mrp && p.mrp > p.price && (
                <>
                  <s>{money(p.mrp)}</s>
                  <em>{pct}% off</em>
                </>
              )}
            </p>
            <p className="pv-tax">Inclusive of all taxes</p>
            <ProductBuy id={p.id} name={p.name} sizes={sizesFor(p)} inStock={p.inStock !== false && (sel ? sel.inStock : true)} shop={shop} colours={cols} colour={sel?.name ?? ""} onColour={setPick} />
          </div>
        </div>
      </section>

      <section className="pv-more-info">
        <div className="container-x pv-lower">
          <ProductTabs p={p} shop={shop} />
          {(d?.region || d?.story) && (
            <aside className="pv-craft" aria-label="Our craft">
              <div className="pv-craft-img"><Media tone={p.tone} className="h-full w-full" sizes="200px" image={gallery[1]?.image ?? gallery[0]?.image} alt="" /></div>
              <div>
                <p className="pv-craft-e">Our craft</p>
                <h2 className="pv-craft-t">{d.region ? `Woven in ${d.region}` : "How it is made"}</h2>
                {d.story && <p className="pv-craft-p">{d.story.length > 200 ? d.story.slice(0, 200).replace(/\s+\S*$/, "") + "…" : d.story}</p>}
                <Link href="/craft" className="link-arrow pv-craft-l">Read the full story <Icon name="arrow-right" /></Link>
              </div>
            </aside>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="sec-1 py-section" aria-labelledby="rel-title">
          <div className="container-x">
            <Reveal>
              <div className="pv-rel-h">
                <h2 id="rel-title" className="h-display">More from the loom</h2>
                <Link href={`/collections/${p.category}`} className="link-arrow">All {categoryLabel(p.category).toLowerCase()} <Icon name="arrow-right" /></Link>
              </div>
            </Reveal>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
              {related.map((r, n) => (
                <Reveal key={r.id} delay={n * 90}>
                  <ProductCard product={r} detailed />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}