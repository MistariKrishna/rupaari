import { BrandIcon } from "./BrandIcon";
import Link from "next/link";
import { site } from "@/lib/site";
import { Icon } from "./Icon";
import Logo from "./Logo";
import NewsletterForm from "./NewsletterForm";
import Reveal from "./Reveal";

const link = "inline-flex min-h-9 items-center text-[14px] text-ink/75 transition-colors hover:text-burgundy";
const head = "mb-4 text-[12px] font-medium uppercase tracking-[.22em] text-wine";

const cols = [
  {
    title: "Shop",
    links: [
      { label: "All Sarees", href: "/collections/sarees" },
      { label: "New Arrivals", href: "/collections/sarees?sort=new" },
      { label: "Bridal Edit", href: "/collections/sarees?occasion=wedding" },
      { label: "Kurtis", href: "/collections/kurtis" },
      { label: "Gift Craft", href: "/collections/gift-craft" },
    ],
  },
  {
    title: "Discover",
    links: [
      { label: "Our Story", href: "/about" },
      { label: "Our Craft", href: "/craft" },
      { label: "Sustainability", href: "/sustainability" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "Book a Consultation", href: "/contact" },
      { label: "Wishlist", href: "/wishlist" },
      { label: "Account", href: "/account" },
    ],
  },
];

export default function Footer() {
  const { address, phone, email } = site.contact;
  const socials = [...site.social];

  return (
    <footer className="sec-1 relative overflow-hidden border-t border-gold/50 pb-8 pt-20 text-ink">
      <div className="container-x">
        <Reveal>
          <div className="grid gap-14 pb-14 lg:grid-cols-[1.3fr_2fr] lg:gap-20">
            <div>
              <Logo size="lg" className="mb-10 !items-start" />
              <p className="h-statement mb-4 max-w-[14ch]">
                A new chapter, <em>in silk.</em>
              </p>
              <p className="mb-7 max-w-[34ch] text-[14px] text-ink/70">Notes on new sarees, enduring craft and the world of RUPAARI.</p>
              <NewsletterForm />
              <p className="mt-4 max-w-[34ch] text-[12px] text-ink/55">By subscribing, you agree to our privacy policy. Unsubscribe at any time.</p>
            </div>

            <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
              {cols.map((c) => (
                <div key={c.title}>
                  <h2 className={head + " !font-sans"}>{c.title}</h2>
                  <ul className="m-0 list-none p-0">
                    {c.links.map((l) => (
                      <li key={l.label}>
                        <Link href={l.href} className={link}>{l.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {(address || phone || email || socials.length > 0) && (
                <div className="col-span-2 sm:col-span-3">
                  {(address || phone || email) && (
                    <address className="m-0 text-[14px] not-italic text-ink/75">
                      {address && <p>{address}</p>}
                      {phone && <p>{phone}</p>}
                      {email && <p>{email}</p>}
                    </address>
                  )}
                  {socials.length > 0 && (
                    <ul className="m-0 mt-5 flex list-none gap-2 p-0">
                      {socials.map((s) => (
                        <li key={s.name}>
                          {s.href ? (
                            <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name} title={s.name} className="flex h-10 w-10 items-center justify-center rounded-full border border-burgundy/40 text-burgundy transition-colors hover:bg-burgundy hover:text-ivory">
                              <BrandIcon name={s.icon} className="!h-[18px] !w-[18px]" />
                            </a>
                          ) : (
                            <span aria-label={s.name} title={s.name} className="flex h-10 w-10 items-center justify-center rounded-full border border-burgundy/40 text-burgundy">
                              <BrandIcon name={s.icon} className="!h-[18px] !w-[18px]" />
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </Reveal>

        <div className="ft-big mb-8 mt-2" aria-hidden="true">Rupaari</div>

        <div className="flex flex-wrap justify-between gap-3 border-t border-gold/40 pt-6 text-[13px] text-ink/60">
          <span>&copy; {new Date().getFullYear()} RUPAARI. All rights reserved.</span>
          <span>{site.tagline}</span>
        </div>
      </div>
    </footer>
  );
}