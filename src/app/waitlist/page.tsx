import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import WaitlistForm from "@/components/WaitlistForm";
import { images } from "@/lib/images";

export const metadata: Metadata = { title: "Join the waitlist", description: "Be the first to see the RUPAARI launch collection." };

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Waitlist" title="Be the first" intro="Early access to the new collection, before anyone else." tone="burgundy" image={images.pages.contact} compact />
      <section className="sec-0 py-section">
        <div className="container-x grid gap-14 md:grid-cols-[1.4fr_1fr] md:gap-20">
          <Reveal><WaitlistForm /></Reveal>
          <Reveal delay={140}>
            <h2 className="h-eyebrow mb-6">Why join</h2>
            <ul className="cs-points">
              <li>24 to 48 hours of early access before the public launch</li>
              <li>A first look at the founders&apos; preview collection</li>
              <li>Stories from the loom, and styling notes, now and then</li>
            </ul>
          </Reveal>
        </div>
      </section>
    </>
  );
}
