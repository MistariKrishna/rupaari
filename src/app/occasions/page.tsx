import type { Metadata } from "next";
import Link from "next/link";
import CollectionBanner from "@/components/CollectionBanner";
import { Icon } from "@/components/Icon";
import Media from "@/components/Media";
import Reveal from "@/components/Reveal";
import { images } from "@/lib/images";
import { occasions } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop by Occasion",
  description: "A saree for every moment that matters.",
};

const captions: Record<string, string> = {
  wedding: "For your most treasured celebrations.",
  festive: "Colour and craft for days of celebration.",
  office: "Grace that moves through your day.",
  gifting: "A thoughtful gift, woven with care.",
};

export default function OccasionsPage() {
  return (
    <div className="cp-page">
      <CollectionBanner crumbs={[{ label: "Home", href: "/" }, { label: "Occasions" }]} title="Shop by Occasion" line="A saree for every moment that matters." />
      <section className="oc-grid" aria-label="Occasions">
        {occasions.map((o, i) => (
          <Reveal key={o.slug} delay={(i % 2) * 90}>
            {/* one focusable link per card; weave filter starts unchecked, this occasion starts selected */}
            <Link href={`/collections/sarees?occasion=${o.slug}&weave=all`} className="oc-card group" data-cursor="View">
              <div className="oc-photo zoom">
                <Media tone={o.tone} className="h-full w-full" sizes="(min-width: 1024px) 50vw, 100vw" priority={i < 2} {...images.occasionCards[o.slug]} />
              </div>
              <h2 className="co-name">{o.label}</h2>
              <p className="oc-cap">{captions[o.slug]}</p>
              <span className="co-explore">
                Explore sarees <Icon name="arrow-right" />
              </span>
            </Link>
          </Reveal>
        ))}
      </section>
    </div>
  );
}