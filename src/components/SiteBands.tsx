"use client";

import Link from "next/link";
import ArrivalsRail from "./ArrivalsRail";
import { Icon } from "./Icon";
import ProductCard from "./ProductCard";
import Reveal from "./Reveal";
import SplitText from "./SplitText";
import { useCatalog } from "@/lib/catalog";
import { discountPct, money, type CategorySlug } from "@/lib/products";
import { TEXT_DEFAULTS as D, useText } from "@/lib/siteContent";

/** Wine offer band on the home page. Text, button and visibility come from the admin (Site content). */
export function OfferBand({ topDeal: baseDeal }: { topDeal: number }) {
  const catalog = useCatalog();
  const topDeal = Math.max(0, ...catalog.map((p) => discountPct(p) || 0));
  const show = useText("offer.show", D["offer.show"]);
  const text = useText("offer.text", D["offer.text"]);
  const cta = useText("offer.cta", D["offer.cta"]);
  const href = useText("offer.href", D["offer.href"]);
  if (topDeal <= 0 || show === "0") return null;
  const parts = text.split("{discount}");
  return (
    <section className="sec-wine on-dark" aria-label="Offer">
      <div className="container-x flex flex-wrap items-center justify-between gap-6 py-10 md:py-12">
        <p className="f-serif text-[clamp(1.8rem,4vw,3.2rem)] leading-tight">
          {parts.length > 1 ? (
            <>
              {parts[0]}
              <em className="text-[#e3c783]">{topDeal}% off</em>
              {parts.slice(1).join("")}
            </>
          ) : (
            text
          )}
        </p>
        <Link href={href} className="btn btn-light">{cta} <Icon name="arrow-right" /></Link>
      </div>
    </section>
  );
}

/** "Not sure which saree?" band at the bottom of the home page. */
export function ConsultBand() {
  const title = useText("consult.title", D["consult.title"]);
  const line = useText("consult.line", D["consult.line"]);
  const c1 = useText("consult.cta1", D["consult.cta1"]);
  const c2 = useText("consult.cta2", D["consult.cta2"]);
  return (
    <section className="sec-2 py-[clamp(3rem,6vw,5rem)]" aria-labelledby="cta-title">
      <div className="container-x flex flex-wrap items-center justify-between gap-8">
        <div>
          <h2 id="cta-title" className="f-serif text-[clamp(2rem,4vw,3.2rem)] leading-tight text-wine">{title}</h2>
          <p className="mt-2 max-w-[34rem] text-ink/75">{line}</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/contact" className="btn">{c1} <Icon name="arrow-right" /></Link>
          <Link href="/collections/sarees" className="btn btn-secondary">{c2}</Link>
        </div>
      </div>
    </section>
  );
}

/** Home "New arrivals" section: newest published pieces first. Hidden until there is something to show. */
export function NewArrivals() {
  const catalog = useCatalog();
  if (catalog.length === 0) return null;
  const fresh = [...catalog].sort((a, b) => Number(b.badge === "New") - Number(a.badge === "New")).slice(0, 8);
  return (
    <section className="sec-0 pb-[clamp(3rem,6vw,5.5rem)] pt-[clamp(3.5rem,7vw,6rem)]" aria-labelledby="new-title">
      <div className="container-x">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div>
            <Reveal><p className="h-eyebrow mb-4">Just in</p></Reveal>
            <SplitText as="h2" id="new-title" text="New arrivals" className="h-display" />
          </div>
          <Reveal variant="fade" delay={150}>
            <Link href="/collections/sarees?sort=new" className="link-arrow">Shop new <Icon name="arrow-right" /></Link>
          </Reveal>
        </div>
      </div>
      <ArrivalsRail label="New arrivals, scroll sideways">
        {fresh.map((p, i) => (
          <div key={p.id} className="snap-item" style={{ marginTop: i % 2 ? "2.5rem" : 0 }}>
            <ProductCard product={p} detailed />
          </div>
        ))}
        <div className="snap-item snap-end">
          <Link href="/collections/sarees" className="snap-all group">
            <span className="f-serif text-[2rem] leading-tight text-wine">See everything</span>
            <span className="mt-4 inline-flex h-14 w-14 items-center justify-center rounded-full border border-burgundy text-burgundy transition-colors group-hover:bg-burgundy group-hover:text-ivory">
              <Icon name="arrow-right" />
            </span>
          </Link>
        </div>
      </ArrivalsRail>
    </section>
  );
}

/** "From ₹x" line on a home category tile; shown only when that category has a published product. */
export function FromPrice({ category }: { category: CategorySlug }) {
  const catalog = useCatalog();
  const prices = catalog.filter((p) => p.category === category).map((p) => p.price);
  if (!prices.length) return null;
  return <p className="mb-1 text-[11px] uppercase tracking-[.22em] text-ivory/80">From {money(Math.min(...prices))}</p>;
}