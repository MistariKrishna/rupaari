import type { Metadata } from "next";
import ConsultationForm from "@/components/ConsultationForm";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { images } from "@/lib/images";

export const metadata: Metadata = { title: "Book a consultation", description: "Choose the right piece with help from our team." };

const points = ["Help choosing bridal and wedding-guest sarees", "Kurti and gifting suggestions within your budget", "Video, phone or a visit, whichever suits you"];

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Consultation" title="Choose with us" intro="Tell us the occasion. We will help you find the piece." tone="burgundy" image={images.pages.contact} compact />
      <section className="sec-0 py-section">
        <div className="container-x grid gap-14 md:grid-cols-[1.4fr_1fr] md:gap-20">
          <Reveal><ConsultationForm /></Reveal>
          <Reveal delay={140}>
            <h2 className="h-eyebrow mb-6">What you get</h2>
            <ul className="cs-points">{points.map((p) => <li key={p}>{p}</li>)}</ul>
          </Reveal>
        </div>
      </section>
    </>
  );
}