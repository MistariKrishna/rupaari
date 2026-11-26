import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = { title: "Authenticity promise", description: "How RUPAARI describes, sources and certifies every saree honestly." };

const pillars: [string, string][] = [
  ["Honest labels", "We say exactly what a piece is. Pure silk, silk-cotton and tussar are named as such. Zari is described as real, tested or imitation. We never call imitation zari real."],
  ["Marks only when we hold them", "Silk Mark, Handloom Mark and GI tag are shown on a product page only when that piece carries the certification. If a mark is not listed, the piece does not have it."],
  ["Maker and region", "Each product page names the weave, the region and, where we can, the weaver or cluster. Handwoven work is traceable to where it was made."],
  ["True colour", "We photograph in natural daylight. Slight variation in colour is natural in handloom, and screens differ. If you need more photos before you buy, ask us."],
  ["Checked before it ships", "Every saree is inspected, and packed with a care card. For high-value orders we photograph the packed piece before sealing it."],
  ["Easy to put right", "If a piece is not as described, write to us within 48 hours of delivery. We will replace it or refund you."],
];

export default function Page() {
  return (
    <InfoPage eyebrow="Our promise" title="Authenticity promise" intro="What we promise about every piece we sell.">
      {pillars.map(([t, d]) => (
        <section key={t} className="info-sec"><h2>{t}</h2><p>{d}</p></section>
      ))}
      <section className="info-sec">
        <h2>How to check a saree yourself</h2>
        <ul>
          <li>Look for the Silk Mark or Handloom Mark label, and the weaver or cluster name on the product page.</li>
          <li>Real zari has a soft, even shine. Imitation zari looks brighter and may feel stiff.</li>
          <li>Handwoven pieces may have tiny differences in the pattern. This is a mark of the craft, not a fault.</li>
          <li>Read <Link href="/journal/how-to-choose-a-kanjivaram">how to choose a Kanjivaram</Link> for more.</li>
        </ul>
      </section>
      <p className="info-end">Have a question about a piece? <Link href="/contact">Ask us</Link> or <Link href="/consultation">book a consultation</Link>.</p>
    </InfoPage>
  );
}
