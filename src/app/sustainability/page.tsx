import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import Media from "@/components/Media";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { images } from "@/lib/images";

export const metadata: Metadata = { title: "Sustainability", description: "Our approach to making things slowly and well." };

export default function SustainabilityPage() {
  return (
    <>
      <PageHero eyebrow="Sustainability" title="Slow by design" intro="Handloom is made by hand, in small batches, to last." tone="taupe" image={images.pages.sustainability} />

      <section className="sec-0 py-section">
        <div className="container-x grid items-start gap-12 md:grid-cols-12 md:gap-8">
          <Reveal className="md:col-span-5">
            <p className="h-statement">Luxury is conveyed through <em>detail</em>, never visual noise.</p>
          </Reveal>
          <Reveal delay={140} className="md:col-span-6 md:col-start-7">
            <p className="mb-6 text-ink/80">
              This page is a placeholder. Add your verified sustainability commitments here: materials, dyes, packaging, fair work and any targets you can stand behind.
            </p>
            <p className="mb-8 text-[14px] text-ink/55">Only publish figures and certifications you can verify.</p>
            <Link href="/contact" className="link-arrow">
              Talk to us <Icon name="arrow-right" />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="sec-0 pb-section">
        <div className="container-x grid grid-cols-2 gap-4 md:gap-6">
          <Reveal variant="clip"><Media tone="taupe" className="aspect-[4/5] w-full" {...images.sustainability[0]} /></Reveal>
          <Reveal variant="clip" delay={160} className="mt-10 md:mt-20"><Media tone="gold" className="aspect-[4/5] w-full" {...images.sustainability[1]} /></Reveal>
        </div>
      </section>
    </>
  );
}
