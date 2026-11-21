import Link from "next/link";
import NewsletterForm from "./NewsletterForm";

const cols = [
  { title: "Shop", links: [["All Sarees", "/collections/sarees"], ["New Arrivals", "/collections/sarees?sort=new"], ["Bridal Edit", "/collections/sarees?occasion=wedding"], ["Shop by Weave", "/collections"]] },
  { title: "RUPAARI", links: [["Our Story", "/about"], ["Our Craft", "/craft"], ["Journal", "/about"]] },
  { title: "Help", links: [["Contact Us", "/contact"], ["Shipping & Returns", "/contact"], ["Saree Care", "/contact"], ["FAQs", "/contact"]] },
];

/** Footer used on the collection pages, per the approved design. */
export default function CollectionsFooter() {
  return (
    <footer className="cf">
      <div className="cf-top">
        <div className="cf-news">
          <p className="cf-h">A new chapter, in silk.</p>
          <p className="cf-p">Notes on new sarees, enduring craft and the world of RUPAARI.</p>
          <NewsletterForm className="w-full" />
          <p className="cf-small">By subscribing, you agree to our Privacy Policy. Unsubscribe at any time.</p>
        </div>
        <div className="cf-cols">
          {cols.map((c) => (
            <nav key={c.title} aria-label={c.title} className="cf-col">
              <p className="cf-eyebrow">{c.title}</p>
              {c.links.map(([label, href]) => (
                <Link key={label} href={href}>{label}</Link>
              ))}
            </nav>
          ))}
        </div>
      </div>
      <div className="cf-rule" />
      <div className="cf-legal">
        <p>© 2026 RUPAARI. All rights reserved.</p>
        <p className="cf-pol">
          <Link href="/contact">Privacy Policy</Link>
          <Link href="/contact">Terms &amp; Conditions</Link>
        </p>
        <p>India · INR ₹</p>
      </div>
    </footer>
  );
}