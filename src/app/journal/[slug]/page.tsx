import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import InfoPage from "@/components/InfoPage";
import JsonLd from "@/components/JsonLd";
import { abs } from "@/lib/seo";
import { articles, findArticle, niceDate } from "@/lib/journal";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const a = findArticle((await params).slug);
  return a ? { title: a.title, description: a.intro } : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const a = findArticle((await params).slug);
  if (!a) notFound();
  const others = articles.filter((x) => x.slug !== a.slug).slice(0, 2);
  return (
    <InfoPage eyebrow={a.kicker} title={a.title} intro={a.intro}>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: a.title, description: a.intro, datePublished: a.date, author: { "@type": "Organization", name: "RUPAARI" }, mainEntityOfPage: abs(`/journal/${a.slug}`) }} />
      <p className="info-date">{niceDate(a.date)} · {a.read}</p>
      {a.body.map((p, i) => <p key={i} className="info-p">{p}</p>)}
      <section className="info-sec">
        <h2>Keep reading</h2>
        <ul>{others.map((o) => <li key={o.slug}><Link href={`/journal/${o.slug}`}>{o.title}</Link></li>)}</ul>
        <p className="info-end"><Link href="/journal">All journal stories</Link></p>
      </section>
    </InfoPage>
  );
}
