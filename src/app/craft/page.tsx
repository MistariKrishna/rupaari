import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import Media from "@/components/Media";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { images } from "@/lib/images";
import { loomSteps } from "@/lib/content";

export const metadata: Metadata = { title: "The loom", description: "How a RUPAARI piece is made." };

export default function CraftPage() {
  return (
    <>
      <PageHero eyebrow="The loom" title="Made slowly, by hand" intro="From yarn to border to pallu, built on the loom one pass of the shuttle at a time." tone="burgundy" image={images.pages.craft} />

      <section className="sec-0 py-section">
        <div className="container-x">
          <ol className="m-0 list-none p-0">
            {loomSteps.map((s, i) => (
              <li key={s.n}>
                <Reveal delay={60}>
                  <div className="grid items-baseline gap-4 border-t border-gold/50 py-9 transition-colors hover:border-burgundy md:grid-cols-[6rem_1fr_1.4fr] md:gap-10 md:py-12">
                    <span className="why-no !text-[3rem]">{s.n}</span>
                    <h2 className="f-serif text-[clamp(1.8rem,3vw,2.6rem)] leading-tight text-wine">{s.title}</h2>
                    <p className="max-w-[46ch] text-ink/80">{s.text}</p>
                  </div>
                </Reveal>
                {i === loomSteps.length - 1 && <div className="border-t border-gold/50" />}
              </li>
            ))}
          </ol>
          <p className="mt-6 text-[14px] text-ink/55">Replace these steps with your own process.</p>
        </div>
      </section>

      <section className="sec-0 pb-section">
        <div className="container-x grid gap-5 md:grid-cols-2 md:gap-6">
          <Reveal variant="clip"><Media tone="wine" className="aspect-[4/3] w-full" {...images.craft[0]} /></Reveal>
          <Reveal variant="clip" delay={160}><Media tone="gold" className="aspect-[4/3] w-full" {...images.craft[1]} /></Reveal>
        </div>
        <Reveal className="container-x mt-14">
          <Link href="/collections/sarees" className="link-arrow">
            See the collection <Icon name="arrow-right" />
          </Link>
        </Reveal>
      </section>
    </>
  );
}
