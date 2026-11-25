import Link from "next/link";
import Hero from "@/components/Hero";
import { Icon } from "@/components/Icon";
import Media from "@/components/Media";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import { ConsultBand, FromPrice, KurtiShowcase, NewArrivals, OfferBand } from "@/components/SiteBands";
import SplitText from "@/components/SplitText";
import TrustStrip from "@/components/TrustStrip";
import { images } from "@/lib/images";
import { categories, discountPct, money, picks, products, weaves } from "@/lib/products";

const priceBands = [
  { label: "Under", big: "₹10,000", href: "/collections/sarees?max=10000" },
  { label: "From ₹10,000", big: "₹15,000", href: "/collections/sarees?min=10000&max=15000" },
  { label: "From ₹15,000", big: "₹20,000", href: "/collections/sarees?min=15000&max=20000" },
];

export default function HomePage() {
  const best = picks().slice(0, 4);
  const topDeal = Math.max(0, ...products.map((p) => discountPct(p) || 0));

  return (
    <>
      <Hero />
      <TrustStrip />

      {/* New arrivals: shows once products are published in the admin */}
      <NewArrivals />

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
                    <FromPrice category={c.slug} />
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

      {best.length > 0 && (
        <>
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

        </>
      )}

      {/* Offer band (figure comes from the product data; text from the admin) */}
      <OfferBand topDeal={topDeal} />

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

      {/* Kurtis: newest pieces, then by style and occasion */}
      <KurtiShowcase />

      {/* Help choosing */}
      <ConsultBand />
    </>
  );
}
