import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import InfoPage from "@/components/InfoPage";
import Media from "@/components/Media";
import { articles, niceDate } from "@/lib/journal";

export const metadata: Metadata = { title: "Journal", description: "Guides, style notes and stories from RUPAARI." };

export default function Page() {
  return (
    <InfoPage eyebrow="Journal" title="Notes from RUPAARI" intro="Guides, style ideas and stories of the craft.">
      <div className="jr-grid">
        {articles.map((a) => (
          <Link key={a.slug} href={`/journal/${a.slug}`} className="jr-card">
            <Media tone={a.tone} className="jr-img" />
            <p className="jr-meta">{a.kicker} · {a.read}</p>
            <h2>{a.title}</h2>
            <p>{a.intro}</p>
            <span className="jr-go">Read <Icon name="arrow-right" /></span>
          </Link>
        ))}
      </div>
    </InfoPage>
  );
}