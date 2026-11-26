import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { images } from "@/lib/images";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Contact", description: "Get in touch with RUPAARI." };

export default function ContactPage() {
  const { address, phone, email } = site.contact;
  return (
    <>
      <PageHero eyebrow="Contact" title="Let's talk" intro="Questions about a saree or an order? Write to us." tone="burgundy" image={images.pages.contact} />

      <section className="sec-0 py-section">
        <div className="container-x grid gap-14 md:grid-cols-[1.4fr_1fr] md:gap-20">
          <Reveal>
            <ContactForm />
          </Reveal>
          <Reveal delay={140}>
            <h2 className="h-eyebrow mb-6">Details</h2>
            {address || phone || email ? (
              <address className="m-0 not-italic text-ink/80">
                {address && <p className="mb-2">{address}</p>}
                {phone && <p className="mb-2">{phone}</p>}
                {email && <p>{email}</p>}
              </address>
            ) : (
              <p className="text-ink/65">Add your address, phone and email in <code>src/lib/site.ts</code>.</p>
            )}
          </Reveal>
        </div>
      </section>
    </>
  );
}
