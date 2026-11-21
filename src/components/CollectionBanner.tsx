import Link from "next/link";
import type { Tone } from "@/lib/content";
import { images } from "@/lib/images";
import Media from "./Media";

export interface Crumb {
  label: string;
  href?: string;
}

/** Editorial banner at the top of every collection page: breadcrumb, title, line, burgundy readability overlay. */
export default function CollectionBanner({ crumbs, title, line, tone = "wine" }: { crumbs: Crumb[]; title: string; line: string; tone?: Tone }) {
  return (
    <section className="cb">
      <div className="cb-media" aria-hidden="true">
        <Media tone={tone} className="h-full w-full" priority {...images.collectionBanner} />
      </div>
      <div className="cb-overlay" aria-hidden="true" />
      <div className="cb-in">
        <nav aria-label="Breadcrumb" className="cb-crumbs">
          <ol>
            {crumbs.map((c, i) => (
              <li key={c.label}>
                {i > 0 && <span aria-hidden="true"> / </span>}
                {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="cb-title">{title}</h1>
        <p className="cb-line">{line}</p>
      </div>
    </section>
  );
}