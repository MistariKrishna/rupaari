import Link from "next/link";
import Hero from "@/components/Hero";
import { Icon } from "@/components/Icon";
import Media from "@/components/Media";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import SplitText from "@/components/SplitText";
import TrustStrip from "@/components/TrustStrip";
import { images } from "@/lib/images";
import { categories, discountPct, fromPrice, money, picks, products, weaves } from "@/lib/products";

const priceBands = [
  { label: "Under", big: "₹10,000", href: "/collections/sarees?max=10000" },
  { label: "From ₹10,000", big: "₹15,000", href: "/collections/sarees?min=10000&max=15000" },
  { label: "From ₹15,000", big: "₹20,000", href: "/collections/sarees?min=15000&max=20000" },
];

export default function HomePage() {
  const fresh = [...products].sort((a, b) => Number(b.badge === "New") - Number(a.badge === "New")).slice(0, 8);
  const best = picks().slice(0, 4);
  const topDeal = Math.max(0, ...products.map((p) => discountPct(p) || 0));

  return (
    <>
      <Hero />
      <TrustStrip />

      {/* New arrivals: swipeable row */}
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
        <div className="snap" tabIndex={0} aria-label="New arrivals, scroll sideways">
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
        </div>
      </section>

      {/* Categories: three clean tiles */}
      <section className="sec-1 py-[clamp(3rem,6vw,5.5rem)]" aria-labelledby="cat-title">
        <div className="container-x">
          <h2 id="cat-title" className="sr-only">Shop by category</h2>
          <div className="grid gap-4 md:grid-cols-3 md:gap-5">
            {categories.map((c, i) => (
              <Reveal key={c.slug} delay={i * 110}>
                <Link href={`/collections/${c.slug}`} className="tile group">
                  <div className="zoom absolute inset-0">
                    <Media tone={c.tone} className="h-full w-full" sizes="(min-width: 768px) 33vw, 100vw" {...images.collections[c.slug]} />
                  </div>
                  <div className="tile-shade" aria-hidden="true" />
                  <div className="tile-copy">
                    <p className="mb-1 text-[11px] uppercase tracking-[.22em] text-ivory/80">From {money(fromPrice(c.slug))}</p>
                    <h3 className="f-serif text-[2.4rem] leading-none">{c.label}</h3>
                    <span className="link-arrow !text-ivory mt-2">Shop now <Icon name="arrow-right" /></span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by budget */}
      <section className="sec-0 py-[clamp(3rem,6vw,5.5rem)]" aria-labelledby="budget-title">
        <div className="container-x">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
            <div>
              <Reveal><p className="h-eyebrow mb-4">Your budget</p></Reveal>
              <SplitText as="h2" id="budget-title" text="Shop sarees by price" className="h-display" />
            </div>
          </div>
          <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-3 md:gap-5">
            {priceBands.map((b, i) => (
              <li key={b.big}>
                <Reveal delay={i * 100}>
                  <Link href={b.href} className="price-tile group">
                    <span className="text-[11px] uppercase tracking-[.22em]">{b.label}</span>
                    <span className="f-serif price-big">{b.big}</span>
                    <Icon name="arrow-right" className="price-arrow" />
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Best sellers */}
      <section className="sec-1 py-[clamp(3rem,6vw,5.5rem)]" aria-labelledby="picks-title">
        <div className="container-x">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
            <div>
              <Reveal><p className="h-eyebrow mb-4">Our picks</p></Reveal>
              <SplitText as="h2" id="picks-title" text="Loved this season" className="h-display" />
            </div>
            <Reveal variant="fade" delay={150}>
              <Link href="/collections/sarees" className="link-arrow">Shop all sarees <Icon name="arrow-right" /></Link>
            </Reveal>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-6 lg:grid-cols-4">
            {best.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 100}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Offer band (figure comes from the product data) */}
      {topDeal > 0 && (
        <section className="sec-wine on-dark" aria-label="Offer">
          <div className="container-x flex flex-wrap items-center justify-between gap-6 py-10 md:py-12">
            <p className="f-serif text-[clamp(1.8rem,4vw,3.2rem)] leading-tight">
              Up to <em className="text-[#e3c783]">{topDeal}% off</em> on selected sarees
            </p>
            <Link href="/collections/sarees" className="btn btn-light">Shop the offer <Icon name="arrow-right" /></Link>
          </div>
        </section>
      )}

      {/* Weaves: one clean row */}
      <section className="sec-0 py-[clamp(3rem,6vw,5.5rem)]" aria-labelledby="weave-title">
        <div className="container-x">
          <div className="mb-10">
            <Reveal><p className="h-eyebrow mb-4">Weaves</p></Reveal>
            <SplitText as="h2" id="weave-title" text="Shop by weave" className="h-display" />
          </div>
          <ul className="m-0 grid list-none grid-cols-3 gap-x-4 gap-y-9 p-0 lg:grid-cols-6">
            {weaves.map((w, i) => (
              <li key={w.slug}>
                <Reveal delay={(i % 6) * 70}>
                  <Link href={`/collections/sarees?weave=${w.slug}`} className="group block text-center">
                    <div className="weave-ring zoom">
                      <Media tone="wine" className="aspect-square w-full" sizes="(min-width: 1024px) 15vw, 30vw" {...images.weaves[w.slug]} />
                    </div>
                    <p className="mt-4 text-[12px] font-medium uppercase leading-snug tracking-[.12em] text-wine transition-colors group-hover:text-burgundy">{w.label}</p>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Help choosing */}
      <section className="sec-2 py-[clamp(3rem,6vw,5rem)]" aria-labelledby="cta-title">
        <div className="container-x flex flex-wrap items-center justify-between gap-8">
          <div>
            <h2 id="cta-title" className="f-serif text-[clamp(2rem,4vw,3.2rem)] leading-tight text-wine">Not sure which saree?</h2>
            <p className="mt-2 max-w-[34rem] text-ink/75">Tell us the occasion and your colours, and we will help you choose.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/contact" className="btn">Book a consultation <Icon name="arrow-right" /></Link>
            <Link href="/collections/sarees" className="btn btn-secondary">Browse sarees</Link>
          </div>
        </div>
      </section>
    </>
  );
}