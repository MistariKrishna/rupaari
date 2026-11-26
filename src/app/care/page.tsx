import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = { title: "Saree and kurti care", description: "How to look after silk sarees and kurtis." };

const sec: { title: string; points: string[] }[] = [
  { title: "Silk sarees", points: ["Dry clean the first few times, and always for heavy zari and Kanjivaram.", "Never wring, scrub or use hot water. Keep away from bleach and strong perfume.", "Air the saree in shade after wearing before you fold it.", "Spray perfume on yourself first, not on the silk.", "Iron on the reverse, on a low silk setting, with a thin cloth in between."] },
  { title: "Storing sarees", points: ["Wrap each saree in soft muslin or cotton. Avoid plastic bags.", "Refold along different lines every few months so the zari does not crack at the creases.", "Add neem leaves or a cotton bag of dried lavender. Avoid mothballs touching the silk."] },
  { title: "Kurtis", points: ["Check the label. Cotton kurtis can be machine washed gently in cold water, inside out.", "Wash dark and bright colours separately for the first few washes.", "Dry in shade. Sun fades colour and weakens thread.", "Silk, embroidered and mirror-work kurtis are best dry cleaned.", "Iron inside out, and avoid pressing directly on embroidery."] },
  { title: "Stains and damage", points: ["Blot, never rub. Take the piece to a good dry cleaner quickly and point out the stain.", "Do not try home remedies on silk or zari.", "If a thread pulls, do not cut it. Tuck it back with a needle or ask a tailor."] },
];

export default function Page() {
  return (
    <InfoPage eyebrow="Help" title="Saree and kurti care" intro="Simple habits that keep your pieces beautiful for years.">
      {sec.map((s) => (
        <section key={s.title} className="info-sec">
          <h2>{s.title}</h2>
          <ul>{s.points.map((p) => <li key={p}>{p}</li>)}</ul>
        </section>
      ))}
      <p className="info-end">Unsure about a piece? <Link href="/contact">Ask us</Link> before you wash it.</p>
    </InfoPage>
  );
}
