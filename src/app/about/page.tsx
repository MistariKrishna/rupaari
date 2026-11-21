import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import Media from "@/components/Media";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { images } from "@/lib/images";
import { principles } from "@/lib/content";

export const metadata: Metadata = { title: "Our story", description: "The story behind RUPAARI." };

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="Our story" title="A living heritage" intro="Heirloom spirit. Contemporary ease." image={images.pages.about} />

      <section className="sec-0 py-section">
        <div className="container-x grid items-center gap-14 md:grid-cols-2 md:gap-20">
          <Reveal variant="clip">
            <div className="pdp-img">
              <Media tone="taupe" className="aspect-[4/5] w-full" {...images.aboutStory} />
            </div>
          </Reveal>
          <Reveal delay={150}>
            <p className="h-eyebrow mb-6">Woven to endure</p>
            <p className="h-statement mb-8">
              Let the silk lead. Luxury is conveyed through <em>detail</em>, never visual noise.
            </p>
            <p className="mb-6 max-w-[48ch] text-ink/80">
              RUPAARI is a warm, considered language for South Indian silk sarees: heritage in character, clarity in every interaction.
            </p>
            <p className="text-[14px] text-ink/55">Replace this copy with your approved brand story.</p>
          </Reveal>
        </div>
      </section>

      <section id="principles" className="on-dark sec-wine scroll-mt-24 py-section text-ivory">
        <div className="container-x">
          <Reveal>
            <p className="h-eyebrow mb-6">Principles</p>
            <h2 className="h-display mb-16 max-w-[14ch]">How we work</h2>
          </Reveal>
          <div className="grid gap-10 md:grid-cols-3">
            {principles.map((p, i) => (
              <Reveal key={p.n} delay={i * 120}>
                <div>
                  <div className="rule-draw mb-8" />
                  <p className="why-no">{p.n}</p>
                  <h3 className="t-title mb-3 mt-5">{p.title}</h3>
                  <p className="text-ivory/75">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="sec-1 py-section text-center">
        <Reveal className="container-x">
          <h2 className="h-statement mx-auto mb-10 max-w-[16ch]">See the <em>collection</em></h2>
          <Link href="/collections/sarees" className="btn">
            Explore sarees <Icon name="arrow-right" />
          </Link>
        </Reveal>
      </section>
    </>
  );
}