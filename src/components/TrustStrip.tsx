import { trust } from "@/lib/content";
import { Icon } from "./Icon";
import Reveal from "./Reveal";

export default function TrustStrip() {
  return (
    <section className="sec-1 border-y border-gold/40 text-ink" aria-label="Why shop with us">
      <ul className="container-x m-0 grid list-none grid-cols-2 gap-x-6 gap-y-8 py-10 md:grid-cols-4 md:py-12">
        {trust.map((t, i) => (
          <li key={t.title}>
            <Reveal delay={i * 90} className="flex items-start gap-4">
              <Icon name={t.icon} className="mt-0.5 !h-7 !w-7 flex-none text-burgundy" />
              <div>
                <p className="text-[12px] font-medium uppercase tracking-[.16em] text-wine">{t.title}</p>
                <p className="mt-1 text-[13px] leading-snug text-ink/65">{t.line}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
