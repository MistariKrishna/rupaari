import type { Metadata } from "next";
import GiftCardForm from "@/components/GiftCardForm";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { images } from "@/lib/images";

export const metadata: Metadata = { title: "Gift cards", description: "Give the gift of choice with a RUPAARI gift card." };

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Gifting" title="Gift cards" intro="Let her choose the silk she loves." tone="wine" image={images.pages.contact} compact />
      <section className="sec-0 py-section">
        <div className="container-x grid gap-14 md:grid-cols-[1.4fr_1fr] md:gap-20">
          <Reveal><GiftCardForm /></Reveal>
          <Reveal delay={140}>
            <h2 className="h-eyebrow mb-6">How it works</h2>
            <ul className="cs-points">
              <li>Choose an amount and tell us who it is for</li>
              <li>We email the gift card on the day you pick, with your message</li>
              <li>The recipient uses it on any saree, kurti or gifting piece</li>
            </ul>
          </Reveal>
        </div>
      </section>
    </>
  );
}
