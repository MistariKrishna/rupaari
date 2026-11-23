"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type FocusEvent as ReactFocusEvent, type PointerEvent as ReactPointerEvent } from "react";
import { images } from "@/lib/images";
import { useCatalog } from "@/lib/catalog";
import { categoryLabel, money, weaveLabel } from "@/lib/products";
import { nav, isAuthPath } from "@/lib/site";
import { Icon } from "./Icon";
import Media from "./Media";
import Logo from "./Logo";
import MenuOverlay from "./MenuOverlay";
import { useStore } from "./StoreProvider";

type Key = "sarees" | "kurtis" | "occasions" | "about";

export default function Header() {
  const pathname = usePathname();
  const { count, wish, openBag } = useStore();
  const [open, setOpen] = useState<Key | null>(null); // desktop disclosure (only one at a time)
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [atTop, setAtTop] = useState(true);
  const heroMode = pathname === "/" && atTop; // minimal bar over the home video, full bar after scrolling
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});
  const burger = useRef<HTMLButtonElement>(null);
  const searchBtn = useRef<HTMLButtonElement>(null);
  const heroSearch = useRef<HTMLButtonElement>(null);
  const heroBurger = useRef<HTMLButtonElement>(null);
  const mSearchBtn = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Transparent over the home hero until the page is scrolled.
  useEffect(() => {
    const on = () => setAtTop(window.scrollY < 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // Everything closes on navigation.
  useEffect(() => {
    setOpen(null);
    setMobile(false);
    setSearch(false);
    setQuery("");
  }, [pathname]);

  // Lock page scroll behind the mobile menu.
  useEffect(() => {
    if (!mobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobile]);

  useEffect(() => {
    if (search) setTimeout(() => input.current?.focus(), 60);
  }, [search]);

  // Click outside closes desktop panels and search.
  useEffect(() => {
    if (!open && !search) return;
    const onDown = (e: MouseEvent) => {
      if (!(e.target as HTMLElement | null)?.closest("[data-header]")) {
        setOpen(null);
        setSearch(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, search]);

  const onKeyDown = (e: { key: string }) => {
    if (e.key !== "Escape") return;
    if (open) {
      triggers.current[open]?.focus();
      setOpen(null);
    } else if (search) {
      setSearch(false);
      (window.innerWidth >= 1024 ? (heroMode ? heroSearch.current : searchBtn.current) : mSearchBtn.current)?.focus();
    } else if (mobile) {
      setMobile(false);
      (window.innerWidth >= 1024 ? heroBurger.current : burger.current)?.focus();
    }
  };

  const active: Key | null = pathname.startsWith("/collections/kurtis") ? "kurtis" : pathname.startsWith("/occasions") ? "occasions" : pathname.startsWith("/collections") ? "sarees" : pathname === "/about" || pathname === "/craft" ? "about" : null;

  const hover = (k: Key) => ({
    onPointerEnter: (e: ReactPointerEvent) => {
      if (e.pointerType !== "mouse") return;
      clearTimeout(timer.current);
      setSearch(false);
      setOpen(k);
    },
    onPointerLeave: (e: ReactPointerEvent) => {
      if (e.pointerType !== "mouse") return;
      timer.current = setTimeout(() => setOpen((c) => (c === k ? null : c)), 140);
    },
    onBlur: (e: ReactFocusEvent<HTMLElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen((c) => (c === k ? null : c));
    },
  });

  const trigger = (k: Key, label: string) => (
    <button
      type="button"
      ref={(el) => {
        triggers.current[k] = el;
      }}
      className="nav-link"
      data-active={active === k}
      aria-expanded={open === k}
      aria-controls={`dd-${k}`}
      onClick={() => {
        setSearch(false);
        setOpen(open === k ? null : k);
      }}
    >
      {label}
      <Icon name="chevron-down" className="chev !h-3.5 !w-3.5" />
    </button>
  );

  const catalog = useCatalog();
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return catalog
      .filter((p) => `${p.name} ${weaveLabel(p.weave) ?? ""} ${categoryLabel(p.category)} ${p.fabric}`.toLowerCase().includes(q))
      .slice(0, 6);
  }, [query, catalog]);

  const logo = <Logo />;

  const toggleSearch = () => {
    setOpen(null);
    setMobile(false);
    setSearch((v) => !v);
  };

  const bagLabel = `Bag, ${count} ${count === 1 ? "item" : "items"}`;

  if (isAuthPath(pathname)) return null;

  return (
    <header data-header data-over={(heroMode || mobile) && !search} className="site-header" onKeyDown={onKeyDown}>
      <MenuOverlay open={mobile} onClose={() => setMobile(false)} />
      <div className="container-x relative z-[2]">
        {/* Desktop: minimal bar over the home video, crossfading into the full navbar on scroll */}
        <div className="relative hidden h-[84px] lg:block">
          <div className="bar" data-show={heroMode || mobile}>
            <div className="grid h-[84px] grid-cols-[1fr_auto_1fr] items-center">
              <button
                ref={heroBurger}
                type="button"
                className="util justify-self-start"
                aria-expanded={mobile}
                aria-controls="mobile-menu"
                onClick={() => {
                  setSearch(false);
                  setMobile((v) => !v);
                }}
              >
                <Icon name={mobile ? "close" : "menu"} />
                {mobile ? "Close" : "Menu"}
              </button>
              {logo}
              <div className="flex items-center gap-8 justify-self-end">
                <button ref={heroSearch} type="button" className="util" aria-expanded={search} aria-controls="site-search" onClick={toggleSearch}>
                  <Icon name="search" />
                  Search
                </button>
                <Link href="/account" className="util" aria-current={pathname.startsWith("/account") ? "page" : undefined}><Icon name="user" />Account</Link>
                <button type="button" className="util" aria-label={bagLabel} aria-current={pathname === "/bag" ? "page" : undefined} onClick={openBag}>
                  <Icon name="bag" />
                  Bag ({count})
                </button>
              </div>
            </div>
          </div>

          <div className="bar" data-show={!heroMode && !mobile}>
        <div className="grid h-[84px] grid-cols-[1fr_auto_1fr] items-center">
          <nav aria-label="Main">
            <ul className="m-0 flex h-[84px] list-none items-stretch gap-9 p-0">
              <li className="flex items-center" {...hover("sarees")}>
                {trigger("sarees", nav.sarees.label)}
                <div id="dd-sarees" className="dd dd-mega" data-open={open === "sarees"}>
                  <div className="mega">
                    <div>
                      <p className="dd-label">Discover</p>
                      <ul className="dd-list">
                        {nav.sarees.discover.map((l) => (
                          <li key={l.label}><Link href={l.href} className="dd-link">{l.label}</Link></li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="dd-label">Shop by weave</p>
                      <ul className="dd-list">
                        {nav.sarees.weaves.map((l) => (
                          <li key={l.label}><Link href={l.href} className="dd-link">{l.label}</Link></li>
                        ))}
                      </ul>
                    </div>
                    <Link href={nav.sarees.feature.href} className="mega-card group" data-cursor="Shop">
                      <div className="zoom overflow-hidden">
                        <Media tone="wine" className="aspect-[3/2] w-full" sizes="420px" {...images.nav.bridal} />
                      </div>
                      <span className="mt-4 flex items-center justify-between gap-4">
                        <span className="font-display text-[1.05rem] uppercase tracking-[.05em] text-wine">{nav.sarees.feature.title}</span>
                        <Icon name="arrow-right" className="!h-5 !w-5 text-burgundy transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                      <span className="mt-1.5 block text-[14px] text-ink/75">{nav.sarees.feature.line}</span>
                    </Link>
                  </div>
                </div>
              </li>

              <li className="relative flex items-center" {...hover("occasions")}>
                {trigger("occasions", nav.occasions.label)}
                <div id="dd-occasions" className="dd dd-sm" data-open={open === "occasions"}>
                  <ul className="dd-list">
                    {nav.occasions.links.map((l) => (
                      <li key={l.label}><Link href={l.href} className="dd-link">{l.label}</Link></li>
                    ))}
                  </ul>
                </div>
              </li>

              <li className="relative flex items-center" {...hover("about")}>
                {trigger("about", nav.about.label)}
                <div id="dd-about" className="dd dd-sm" data-open={open === "about"}>
                  <ul className="dd-list">
                    {nav.about.links.map((l) => (
                      <li key={l.label}><Link href={l.href} className="dd-link">{l.label}</Link></li>
                    ))}
                    <li className="dd-rule" aria-hidden="true" />
                    {nav.about.action.map((l) => (
                      <li key={l.label}><Link href={l.href} className="dd-link">{l.label}</Link></li>
                    ))}
                  </ul>
                </div>
              </li>

              <li className="flex items-center" {...hover("kurtis")}>
                {trigger("kurtis", nav.kurtis.label)}
                <div id="dd-kurtis" className="dd dd-mega" data-open={open === "kurtis"}>
                  <div className="mega mega--kurti">
                    <div>
                      <p className="dd-label">Discover</p>
                      <ul className="dd-list">
                        {nav.kurtis.discover.map((l) => (
                          <li key={l.label}><Link href={l.href} className="dd-link">{l.label}</Link></li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="dd-label">Style</p>
                      <ul className="dd-list">
                        {nav.kurtis.style.map((l) => (
                          <li key={l.label}><Link href={l.href} className="dd-link">{l.label}</Link></li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="dd-label">Sleeve & Neck</p>
                      <ul className="dd-list">
                        {nav.kurtis.sleeveNeck.map((l) => (
                          <li key={l.label}><Link href={l.href} className="dd-link">{l.label}</Link></li>
                        ))}
                      </ul>
                    </div>
                    <Link href={nav.kurtis.feature.href} className="mega-card group" data-cursor="Shop">
                      <div className="zoom overflow-hidden">
                        <Media tone="wine" className="aspect-[4/3] w-full" sizes="420px" {...images.nav.kurti} />
                      </div>
                      <span className="mt-4 flex items-center justify-between gap-4">
                        <span className="font-display text-[1.05rem] uppercase tracking-[.05em] text-wine">{nav.kurtis.feature.title}</span>
                        <Icon name="arrow-right" className="!h-5 !w-5 flex-none text-burgundy transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                      <span className="mt-1.5 block text-[14px] text-ink/75">{nav.kurtis.feature.line}</span>
                    </Link>
                  </div>
                </div>
              </li>
            </ul>
          </nav>

          {logo}

          <div className="flex items-center gap-7 justify-self-end">
            <button ref={searchBtn} type="button" className="util" aria-expanded={search} aria-controls="site-search" onClick={toggleSearch}>
              <Icon name="search" />
              Search
            </button>
            <Link href="/account" className="util" aria-current={pathname.startsWith("/account") ? "page" : undefined}><Icon name="user" />Account</Link>
            <Link href="/wishlist" className="util relative" aria-label={`Wishlist, ${wish.length} saved`}>
              <Icon name="heart" />
              {wish.length > 0 && <span className="absolute right-0 top-2 h-2 w-2 rounded-full bg-burgundy" aria-hidden="true" />}
            </Link>
            <button type="button" className="util" aria-label={bagLabel} aria-current={pathname === "/bag" ? "page" : undefined} onClick={openBag}>
              <Icon name="bag" />
              Bag ({count})
            </button>
          </div>
        </div>
          </div>
        </div>

        {/* Mobile bar */}
        <div className="grid h-[68px] grid-cols-[1fr_auto_1fr] items-center lg:hidden">
          <button ref={burger} type="button" className="flex h-11 w-11 items-center justify-start hc" aria-expanded={mobile} aria-controls="mobile-menu" aria-label={mobile ? "Close menu" : "Open menu"} onClick={() => { setSearch(false); setMobile((v) => !v); }}>
            <Icon name={mobile ? "close" : "menu"} />
          </button>
          {logo}
          <div className="flex items-center justify-end">
            <button ref={mSearchBtn} type="button" className="flex h-11 w-11 items-center justify-center hc" aria-label="Search" aria-expanded={search} aria-controls="site-search" onClick={toggleSearch}>
              <Icon name="search" />
            </button>
          </div>
        </div>
      </div>

      {/* Search panel */}
        <div id="site-search" className="dd dd-search" data-open={search} role="search">
          <div className="container-x"><div className="mx-auto w-full max-w-[860px] py-7">
            <label htmlFor="q" className="sr-only">Search the shop</label>
            <div className="flex items-center gap-3 border-b border-wine/40 pb-3">
              <Icon name="search" className="text-wine" />
              <input
                id="q"
                ref={input}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sarees, weaves, kurtis"
                autoComplete="off"
                className="w-full bg-transparent text-[18px] outline-none placeholder:text-ink/45"
              />
            </div>
            {query.trim() === "" ? (
              <div className="mt-5">
                <p className="dd-label">Popular</p>
                <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                  {nav.sarees.weaves.map((w) => (
                    <li key={w.label}><Link href={w.href} className="chip">{w.label}</Link></li>
                  ))}
                </ul>
              </div>
            ) : results.length === 0 ? (
              <p className="mt-5 text-ink/75">No matches for “{query}”. Try a weave such as Kanjivaram or Mysore.</p>
            ) : (
              <ul className="m-0 mt-3 list-none p-0">
                {results.map((p) => (
                  <li key={p.id}>
                    <Link href={`/product/${p.id}`} className="flex items-center justify-between gap-4 border-b border-gold/25 py-3 hover:text-burgundy">
                      <span>
                        <span className="block font-display text-[1rem] uppercase text-wine">{p.name}</span>
                        <span className="text-[13px] text-ink/65">{categoryLabel(p.category)}</span>
                      </span>
                      <span className="text-[15px]">{money(p.price)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        </div>

    </header>
  );
}