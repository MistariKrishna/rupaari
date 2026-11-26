import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = { title: "Size and drape guide", description: "How to measure for a blouse, how to drape a saree, and what sizes to expect." };

const drapes: [string, string][] = [
  ["Nivi (the classic)", "Tuck the plain end at the waist and wrap once. Make 5 to 7 even pleats and tuck them at the navel. Bring the rest over the left shoulder as the pallu."],
  ["Bengali", "Wrap without pleats, bring the pallu from the back over the left shoulder, then again over the right arm, so the border frames the body."],
  ["Gujarati (seedha pallu)", "Wrap and pleat as in Nivi, then bring the pallu from the back over the right shoulder to the front, spread to show the design."],
  ["Maharashtrian (nauvari)", "Use a longer saree. Pleat, then pass the pallu between the legs and tuck at the back to create a dhoti-like drape."],
  ["Modern, with a belt", "Drape as in Nivi and secure the pleats and pallu with a slim belt for an easy fit through a long day."],
];

export default function Page() {
  return (
    <InfoPage eyebrow="Guide" title="Size and drape guide" intro="Measure with confidence, and drape in your own way.">
      <section className="info-sec">
        <h2>About saree size</h2>
        <p>A saree is one piece of fabric that fits every body, so there is no size to choose. Most sarees are about 5.5 to 6.3 metres long. The product page lists the exact length, width and whether a blouse piece is included.</p>
      </section>
      <section className="info-sec">
        <h2>Measuring for the blouse</h2>
        <ul>
          <li><b>Bust:</b> around the fullest part, with the tape level at the back.</li>
          <li><b>Under bust:</b> directly below the bust.</li>
          <li><b>Waist:</b> at the narrowest part, for fitted styles.</li>
          <li><b>Shoulder:</b> from the edge of one shoulder to the other, across the back.</li>
          <li><b>Sleeve length and round:</b> from the shoulder to where you want the sleeve to end, and around the upper arm.</li>
          <li><b>Blouse length:</b> from the top of the shoulder to where you want the hem.</li>
        </ul>
        <p>Measure over light clothing, keep the tape snug but not tight, and ask a tailor to confirm before cutting.</p>
      </section>
      <section className="info-sec">
        <h2>Ways to drape</h2>
        {drapes.map(([t, d]) => (
          <details key={t} className="faq"><summary>{t}</summary><p>{d}</p></details>
        ))}
      </section>
      <section className="info-sec">
        <h2>Kurtis</h2>
        <p>Kurtis come in sizes XS to XXXL. Every kurti page has a Size guide with bust, waist, hip and shoulder measurements in inches or centimetres.</p>
      </section>
      <p className="info-end">Need help choosing? <Link href="/consultation">Book a consultation</Link>.</p>
    </InfoPage>
  );
}
