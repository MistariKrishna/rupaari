import PageHero from "./PageHero";
import Reveal from "./Reveal";
import { images } from "@/lib/images";

/** Shared frame for the text pages (FAQs, care, policies): hero, then a readable column. */
export default function InfoPage({ eyebrow, title, intro, updated, children }: { eyebrow: string; title: string; intro?: string; updated?: string; children: React.ReactNode }) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} intro={intro} compact image={images.pages.contact} />
      <section className="sec-0 py-section">
        <div className="container-x">
          <Reveal>
            <div className="info">
              {updated && <p className="info-date">Last updated {updated}</p>}
              {children}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}