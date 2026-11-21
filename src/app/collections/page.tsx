import type { Metadata } from "next";
import Link from "next/link";
import CollectionBanner from "@/components/CollectionBanner";
import { Icon } from "@/components/Icon";
import Media from "@/components/Media";
import Reveal from "@/components/Reveal";
import { images } from "@/lib/images";
import { categories, collections } from "@/lib/products";

export const metadata: Metadata = {
  title: "Our Collections",
  description: "Find your next chapter in silk. Six weaves, each with its own story.",
};

export default function CollectionsPage() {
  return (
    <div className="cp-page">
      <CollectionBanner crumbs={[{ label: "Home", href: "/" }, { label: "Sarees", href: "/collections/sarees" }, { label: "Collections" }]} title="Our Collections" line="Find your next chapter in silk." />
      <section className="co-grid" aria-label="Collections">
        {collections.map((c, i) => (
          <Reveal key={c.slug} delay={(i % 3) * 90}>
            <Link href={`/collections/${c.slug}`} className="co-card group" data-cursor="View">
              <div className="co-photo zoom">
                <Media tone={c.tone} className="h-full w-full" sizes="(min-width: 1024px) 32vw, 50vw" priority={i < 3} {...images.collectionCards[c.slug]} />
              </div>
              <h2 className="co-name">{c.name}</h2>
              <span className="co-explore">
                Explore collection <Icon name="arrow-right" />
              </span>
            </Link>
          </Reveal>
        ))}
      </section>

      <section className="co-more" aria-labelledby="co-more-title">
        <h2 id="co-more-title" className="co-more-title">Shop by category</h2>
        <div className="co-more-grid">
          {categories.map((c, i) => (
            <Reveal key={c.slug} delay={i * 90}>
              <Link href={`/collections/${c.slug}`} className="co-card group" data-cursor="View">
                <div className="co-photo zoom">
                  <Media tone={c.tone} className="h-full w-full" sizes="(min-width: 1024px) 32vw, 50vw" {...images.collections[c.slug]} />
                </div>
                <h3 className="co-name">{c.label}</h3>
                <span className="co-explore">
                  Explore collection <Icon name="arrow-right" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}