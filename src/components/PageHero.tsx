import type { CSSProperties } from "react";
import type { Tone } from "@/lib/content";
import type { Slot } from "@/lib/images";
import Media from "./Media";
import Parallax from "./Parallax";
import SplitText from "./SplitText";

interface Props {
  eyebrow: string;
  title: string;
  intro?: string;
  tone?: Tone;
  image?: Slot;
  /** shorter band for shop pages so products start sooner */
  compact?: boolean;
}

/** Cinematic full-width intro at the top of every inner page (sits under the glass header). */
export default function PageHero({ eyebrow, title, intro, tone = "wine", image, compact = false }: Props) {
  return (
    <section className={`ph on-dark text-ivory ${compact ? "ph--compact" : ""}`}>
      <Parallax speed={0.1} className="absolute inset-0">
        <Media tone={tone} className="h-full w-full" priority {...image} />
      </Parallax>
      <div className="ph-shade" aria-hidden="true" />
      <span className="ph-num f-serif" aria-hidden="true">{eyebrow.slice(0, 1)}</span>
      <div className="container-x relative z-10 pb-[clamp(2.5rem,8vh,5.5rem)] pt-32">
        <p className="h-eyebrow hero-in mb-6" style={{ "--d": "100ms" } as CSSProperties}>{eyebrow}</p>
        <SplitText as="h1" text={title} instant delay={200} className="h-display max-w-[16ch]" />
        {intro && (
          <p className="t-lead hero-in mt-6 max-w-[40rem] text-ivory/85" style={{ "--d": "800ms" } as CSSProperties}>
            {intro}
          </p>
        )}
      </div>
    </section>
  );
}