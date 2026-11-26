"use client";

import Link from "next/link";
import { useState } from "react";
import { images } from "@/lib/images";
import { Icon } from "./Icon";
import Media from "./Media";

/** The two-panel account screen: photograph with caption on the left, form on the right (stacked on phones). */
export default function AuthShell({ title, lead, eyebrow = "Account · 01", children, foot }: { title: string; lead: string; eyebrow?: string; children: React.ReactNode; foot?: React.ReactNode }) {
  const slides = images.auth;
  const [i, setI] = useState(0);
  const s = slides[i];
  const go = (d: number) => setI((n) => (n + d + slides.length) % slides.length);

  return (
    <main className="au-page">
      <div className="au-card">
        <aside className="au-art" aria-label="RUPAARI">
          <div className="au-img"><Media tone="wine" className="h-full w-full" sizes="(min-width: 1024px) 45vw, 100vw" priority image={s.image} alt={s.alt} /></div>
          <div className="au-shade" aria-hidden="true" />
          <Link href="/" className="au-back"><Icon name="arrow-left" /> Back to RUPAARI</Link>
          <div className="au-cap">
            <div aria-live="polite">
              <p className="au-kick">{s.kicker}</p>
              <p className="au-line">{s.line}</p>
            </div>
            <div className="au-arrows">
              <button type="button" aria-label="Previous image" onClick={() => go(-1)}><Icon name="arrow-left" /></button>
              <button type="button" aria-label="Next image" onClick={() => go(1)}><Icon name="arrow-right" /></button>
            </div>
          </div>
        </aside>

        <section className="au-form">
          <div className="au-in">
            <p className="au-eyebrow">{eyebrow}</p>
            <h1 className="au-title">{title}</h1>
            <p className="au-lead">{lead}</p>
            {children}
          </div>
          <div className="au-foot">
            {foot}
            <p className="au-cert"><i aria-hidden="true" /> Silk Mark Certified · GI-Tagged Weaves</p>
          </div>
        </section>
      </div>
    </main>
  );
}
