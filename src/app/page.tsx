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
import { categories, discountPct, picks, products, weaves } from "@/lib/products";

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

      {/* Categories: two arched frames, the second set lower */}
      <section className="sec-1 py-[clamp(3.5rem,7vw,6.5rem)]" aria-labelledby="cat-title">
        <div className="container-x">
          <h2 id="cat-title" className="sr-only">Shop by category</h2>
          <ul className="cat2">
            {categories.filter((c) => c.slug !== "gift-craft").map((c, i) => (
              <li key={c.slug} className="cat2-item">
                <Reveal delay={i * 140}>
                  <Link href={`/collections/${c.slug}`} className="cat2-card group">
                    <div className="cat2-frame">
                      <div className="cat2-img zoom">
                        <Media tone={c.tone} className="h-full w-full" sizes="(min-width: 768px) 30vw, 100vw" {...images.collections[c.slug]} />
                      </div>
                    </div>
                    <div className="cat2-meta">
                      <div>
                        <span className="cat2-no">0{i + 1}</span>
                        <h3 className="cat2-title">{c.label}</h3>
                        <FromPrice category={c.slug} className="cat2-from" />
                      </div>
                      <span className="cat2-go" aria-hidden="true"><Icon name="arrow-right" /></span>
                    </div>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
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

      {/* Gifting: give our sarees and kurtis to someone, shown on its own and not as a category tile */}
      <section className="sec-0 py-[clamp(3rem,6vw,5.5rem)]" aria-labelledby="gift-title">
        <div className="container-x grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <Reveal>
            <Link href="/collections/sarees?occasion=gifting" className="zoom relative block aspect-[4/3] overflow-hidden" aria-label="Shop gifts">
              <Media tone="gold" className="h-full w-full" sizes="(min-width: 1024px) 50vw, 100vw" {...images.collections["gift-craft"]} />
            </Link>
          </Reveal>
          <div>
            <Reveal><p className="h-eyebrow mb-4">Gifting</p></Reveal>
            <SplitText as="h2" id="gift-title" text="Give something woven with care" className="h-display" />
            <Reveal delay={120}>
              <p className="mt-5 max-w-[32rem] text-ink/75">A silk saree or a handwoven kurti makes a gift that is kept and remembered. Choose for a wedding, a festival, a birthday or just because.</p>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <Link href="/collections/sarees?occasion=gifting" className="btn">Gift a saree <Icon name="arrow-right" /></Link>
                <Link href="/collections/kurtis?occasion=gifting" className="btn btn-secondary">Gift a kurti</Link>
              </div>
              <p className="mt-6 text-[13px] text-ink/65">Also see our <Link href="/collections/gift-craft" className="underline decoration-burgundy/50 underline-offset-4 hover:text-burgundy">gift boxes and wraps</Link></p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Help choosing */}
      <ConsultBand />
    </>
  );
}
