"use client";

import Link from "next/link";
import ArrivalsRail from "./ArrivalsRail";
import { Icon } from "./Icon";
import ProductCard from "./ProductCard";
import Reveal from "./Reveal";
import SplitText from "./SplitText";
import Media from "./Media";
import { useCatalog } from "@/lib/catalog";
import { STYLES, WEAR, wearGroupsOf } from "@/lib/kurti";
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
            <span className="sa-eyebrow">Explore</span>
            <span className="sa-title">See everything</span>
            <span className="sa-count">{catalog.length} {catalog.length === 1 ? "piece" : "pieces"}</span>
            <span className="sa-btn" aria-hidden="true"><Icon name="arrow-right" /></span>
          </Link>
        </div>
      </ArrivalsRail>
    </section>
  );
}

/** "From ₹x" line on a home category tile; shown only when that category has a published product. */
export function FromPrice({ category, className = "mb-1 text-[11px] uppercase tracking-[.22em] text-ivory/80" }: { category: CategorySlug; className?: string }) {
  const catalog = useCatalog();
  const prices = catalog.filter((p) => p.category === category).map((p) => p.price);
  if (!prices.length) return null;
  return <p className={className}>From {money(Math.min(...prices))}</p>;
}

const RING_TONES = ["wine", "burgundy", "gold", "taupe", "ivory"] as const;

/** Home "Kurtis" section: the newest kurtis, then ways to shop them (style and occasion). Hidden until a kurti is published. */
export function KurtiShowcase() {
  const catalog = useCatalog();
  const kurtis = catalog.filter((p) => p.category === "kurtis");
  if (kurtis.length === 0) return null;
  const rail = [...kurtis].sort((a, b) => Number(b.badge === "New") - Number(a.badge === "New")).slice(0, 8);
  const styles = STYLES.filter((st) => kurtis.some((p) => p.kurti?.style === st.slug)).slice(0, 10);
  const wears = WEAR.filter((g) => kurtis.some((p) => wearGroupsOf(p.kurti?.wear).includes(g.slug)));
  return (
    <section className="sec-1 py-[clamp(3rem,6vw,5.5rem)]" aria-labelledby="kurti-title">
      <div className="container-x">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div>
            <Reveal><p className="h-eyebrow mb-4">Kurtis</p></Reveal>
            <SplitText as="h2" id="kurti-title" text="Kurtis for every day and every occasion" className="h-display" />
          </div>
          <Reveal variant="fade" delay={150}>
            <Link href="/collections/kurtis" className="link-arrow">Shop all kurtis <Icon name="arrow-right" /></Link>
          </Reveal>
        </div>
      </div>
      <ArrivalsRail label="Kurtis, scroll sideways">
        {rail.map((p) => (
          <div key={p.id} className="snap-item">
            <ProductCard product={p} detailed />
          </div>
        ))}
        <div className="snap-item snap-end">
          <Link href="/collections/kurtis" className="snap-all group">
            <span className="sa-eyebrow">Explore</span>
            <span className="sa-title">All kurtis</span>
            <span className="sa-count">{kurtis.length} {kurtis.length === 1 ? "piece" : "pieces"}</span>
            <span className="sa-btn" aria-hidden="true"><Icon name="arrow-right" /></span>
          </Link>
        </div>
      </ArrivalsRail>
      <div className="container-x">
        {styles.length > 0 && (
          <div className="mt-[clamp(2.5rem,5vw,4rem)]">
            <p className="h-eyebrow mb-6">Shop kurtis by style</p>
            <ul className="m-0 grid list-none grid-cols-3 gap-x-4 gap-y-9 p-0 sm:grid-cols-5 lg:grid-cols-10">
              {styles.map((st, i) => (
                <li key={st.slug}>
                  <Reveal delay={(i % 10) * 50}>
                    <Link href={`/collections/kurtis?style=${st.slug}`} className="group block text-center">
                      <div className="weave-ring zoom">
                        <Media tone={RING_TONES[i % RING_TONES.length]} className="aspect-square w-full" sizes="(min-width: 1024px) 10vw, 30vw" />
                      </div>
                      <p className="mt-4 text-[12px] font-medium uppercase leading-snug tracking-[.12em] text-wine transition-colors group-hover:text-burgundy">{st.label}</p>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        )}
        {wears.length > 0 && (
          <div className="mt-[clamp(2.5rem,5vw,4rem)]">
            <p className="h-eyebrow mb-6">Shop kurtis by occasion</p>
            <ul className="m-0 flex list-none flex-wrap gap-3 p-0">
              {wears.map((g) => (
                <li key={g.slug}>
                  <Link href={`/collections/kurtis?wear=${g.slug}`} className="inline-block border border-burgundy/40 px-5 py-3 text-[12px] uppercase tracking-[.14em] text-wine transition-colors hover:bg-burgundy hover:text-ivory">{g.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
