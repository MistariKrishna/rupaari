import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "@/components/InfoPage";
import JsonLd from "@/components/JsonLd";
import { faqGroups } from "@/lib/faq";

export const metadata: Metadata = { title: "FAQs", description: "Answers about orders, delivery, returns and care." };

export default function Page() {
  const all = faqGroups.flatMap((g) => g.items);
  return (
    <InfoPage eyebrow="Help" title="Frequently asked" intro="Quick answers. Cannot find yours? Write to us.">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: all.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />
      {faqGroups.map((g) => (
        <section key={g.title} className="info-sec">
          <h2>{g.title}</h2>
          {g.items.map((f) => (
            <details key={f.q} className="faq">
              <summary>{f.q}</summary>
              <p>{f.a}{f.link && <> <Link href={f.link.href}>{f.link.label}</Link>.</>}</p>
            </details>
          ))}
        </section>
      ))}
      <p className="info-end">Still need help? <Link href="/contact">Contact us</Link>.</p>
    </InfoPage>
  );
}
