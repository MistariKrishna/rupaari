import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToBag from "@/components/AddToBag";
import { Icon } from "@/components/Icon";
import Media from "@/components/Media";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import WishlistButton from "@/components/WishlistButton";
import { trust } from "@/lib/content";
import { productSlot } from "@/lib/images";
import { categoryLabel, discountPct, getProduct, money, occasions, products, weaveLabel } from "@/lib/products";

type Params = Promise<{ id: string }>;

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const p = getProduct(id);
  return p ? { title: p.name, description: p.blurb } : { title: "Not found" };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { id } = await params;
  const p = getProduct(id);
  if (!p) notFound();

  const pct = discountPct(p);
  const related = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
  const details: [string, string][] = [
    ["Category", categoryLabel(p.category)],
    ...(p.weave ? ([["Weave", weaveLabel(p.weave) ?? ""]] as [string, string][]) : []),
    ["Fabric", p.fabric],
    ["Suits", p.occasions.map((o) => occasions.find((x) => x.slug === o)?.label ?? o).join(", ")],
  ];

  return (
    <>
      <div className="sec-0 pt-10">
        <div className="container-x">
          <nav aria-label="Breadcrumb" className="text-[13px] text-ink/65">
            <ol className="m-0 flex list-none flex-wrap items-center gap-2 p-0">
              <li><Link href="/" className="hover:text-burgundy">Home</Link></li>
              <li aria-hidden="true">›</li>
              <li><Link href={`/collections/${p.category}`} className="hover:text-burgundy">{categoryLabel(p.category)}</Link></li>
              <li aria-hidden="true">›</li>
              <li aria-current="page" className="text-wine">{p.name}</li>
            </ol>
          </nav>
        </div>
      </div>

      <section className="sec-0 pb-[clamp(3rem,6vw,6rem)] pt-8">
        <div className="container-x grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div className="relative px-3">
            <div className="pdp-img"><Media tone={p.tone} className="aspect-[4/5] w-full" priority sizes="(min-width: 1024px) 55vw, 100vw" {...productSlot(p)} /></div>
            {p.badge && <span className="badge absolute left-4 top-4">{p.badge}</span>}
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="h-eyebrow mb-5">{categoryLabel(p.category)}</p>
            <h1 className="h-display !text-[clamp(1.8rem,3.4vw,3rem)]">{p.name}</h1>
            <p className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="font-display text-[1.9rem] text-wine">{money(p.price)}</span>
              {p.mrp && p.mrp > p.price && (
                <>
                  <s className="text-[16px] text-ink/55">{money(p.mrp)}</s>
                  <span className="text-[13px] font-medium uppercase tracking-[.1em] text-burgundy">{pct}% off</span>
                </>
              )}
            </p>
            <p className="mt-6 max-w-[48ch] text-ink/80">{p.blurb}</p>

            <div className="mt-8 flex gap-3">
              <AddToBag id={p.id} className="btn flex-1" />
              <WishlistButton id={p.id} name={p.name} className="icon-btn" />
            </div>
            <Link href="/contact" className="link-arrow mt-4">
              Ask about this piece <Icon name="arrow-right" />
            </Link>

            <dl className="m-0 mt-10 border-t border-gold/50">
              {details.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[8rem_1fr] gap-4 border-b border-gold/30 py-3.5 text-[15px]">
                  <dt className="text-[12px] font-medium uppercase tracking-[.14em] text-ink/65">{k}</dt>
                  <dd className="m-0">{v}</dd>
                </div>
              ))}
            </dl>

            <ul className="m-0 mt-8 grid list-none gap-4 p-0 sm:grid-cols-2">
              {trust.slice(1).map((t) => (
                <li key={t.title} className="flex items-start gap-3">
                  <Icon name={t.icon} className="mt-0.5 !h-6 !w-6 flex-none text-burgundy" />
                  <div>
                    <p className="text-[12px] font-medium uppercase tracking-[.12em] text-wine">{t.title}</p>
                    <p className="mt-0.5 text-[13px] text-ink/70">{t.line}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="sec-1 py-section" aria-labelledby="rel-title">
          <div className="container-x">
            <Reveal>
              <h2 id="rel-title" className="h-display mb-14">You may also like</h2>
            </Reveal>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
              {related.map((r, i) => (
                <Reveal key={r.id} delay={i * 90}>
                  <ProductCard product={r} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}