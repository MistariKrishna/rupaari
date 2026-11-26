"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useCatalog } from "@/lib/catalog";
import { FABRICS, LENGTHS, NECKS, SLEEVES, STYLES, WEAR, wearGroupsOf, type Opt } from "@/lib/kurti";
import { occasions, weaveFilters, type CategorySlug, type Product } from "@/lib/products";
import CollectionProductCard from "./CollectionProductCard";
import { Icon } from "./Icon";

const SORTS = [
  { value: "new", label: "Sort: Newest" },
  { value: "featured", label: "Sort: Featured" },
  { value: "low", label: "Sort: Price, low–high" },
  { value: "high", label: "Sort: Price, high–low" },
];

/** Pieces per page. Raise to 12 once the catalogue is larger. */
const PAGE_SIZE = 6;

const colourKey = (v?: string) => (v ?? "").replace(/,/g, " ").trim().toLowerCase();
const colourLabel = (v: string) => v.trim().toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (_, a, b) => a + b.toUpperCase());

const colourNames = (p: Product) => (p.colours?.length ? p.colours.map((c) => c.name) : p.details?.colour ? [p.details.colour] : []);

/** Dot colour worked out from the colour name typed in the admin. */
const HEX: Record<string, string> = {
  red: "#c4161c", maroon: "#7a1426", burgundy: "#680f1a", wine: "#4a0b13", crimson: "#b0122c", ruby: "#a8112f", rani: "#c2185b", magenta: "#c2185b", pink: "#e8a0bf", rose: "#d9748f", peach: "#f4b393", coral: "#ee6f5b",
  orange: "#ef7d1a", saffron: "#f08a1c", rust: "#a8441c", mustard: "#d6a21a", yellow: "#f2c820", gold: "#c9a24d", golden: "#c9a24d", copper: "#b0662f", brown: "#6f4a32", beige: "#d9c6a5", cream: "#f3e9d2", ivory: "#f7f1e7", white: "#ffffff", "off white": "#f4efe6", offwhite: "#f4efe6",
  green: "#3f9b52", olive: "#6b7a2e", lime: "#9ccc3c", mint: "#9fd8b8", teal: "#13827f", bottle: "#0f4d33", emerald: "#0f7a4f", sage: "#9aae8c", parrot: "#5cb85c",
  blue: "#1f6fd0", navy: "#16264f", cobalt: "#1f4fb2", sky: "#74b8e8", turquoise: "#2bb5b0", peacock: "#0f6b78", aqua: "#6fd0d0",
  purple: "#6a3a9a", violet: "#7a4fb0", lavender: "#b9a3d9", lilac: "#c9b2de", mauve: "#a97b9a", plum: "#5d1f4a", wineberry: "#5d1f4a",
  black: "#1c1a1a", grey: "#8a8a8a", gray: "#8a8a8a", silver: "#c2c2c2", charcoal: "#3a3d42", taupe: "#bba99a", tan: "#c8a37a",
};
const dotFor = (name: string): string | null => {
  const k = colourKey(name);
  if (/multi|rainbow/.test(k)) return "conic-gradient(#e0402f 0 25%, #f2c820 0 50%, #3f9b52 0 75%, #1f6fd0 0)";
  if (HEX[k]) return HEX[k];
  const w = k.split(/[\s&/-]+/).filter(Boolean);
  for (const x of [...w].reverse()) if (HEX[x]) return HEX[x];
  return null;
};

/** The colour of a piece that matches the colours ticked in the filter (an in-stock one first). */
const pickColour = (p: Product, ticked: string[]) => {
  const hit = (p.colours ?? []).filter((c) => ticked.includes(colourKey(c.name)));
  return hit.find((c) => c.inStock) ?? hit[0];
};

const list = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);

interface Props {
  items: Product[];
  /** the category being shown: products published in the admin for it are added in the browser */
  category?: CategorySlug;
  /** show the Weave filter group (sarees only) */
  showWeaves: boolean;
  /** weaves ticked when the URL has no explicit weave choice (e.g. Kanjivaram on its own collection) */
  defaultWeaves?: string[];
}

/**
 * Sticky Filters / Sort toolbar, collapsible filter sidebar and product grid.
 * All choices live in the URL (weave, occasion, min, max, stock, sort) so links can deep-link.
 * Below 1024px the sidebar becomes a slide-in drawer.
 */
export default function CollectionGrid({ items: baseItems, category, showWeaves, defaultWeaves = [] }: Props) {
  const catalog = useCatalog();
  const items = useMemo(() => (category ? catalog.filter((p) => p.category === category) : baseItems), [catalog, category, baseItems]);
  // Colour options are the names typed in the admin for the products shown here.
  const colourOptions = useMemo(() => {
    const seen = new Map<string, { label: string; n: number }>();
    items.forEach((p) => {
      new Set(colourNames(p).map(colourKey)).forEach((k) => {
        if (!k) return;
        const cur = seen.get(k);
        if (cur) cur.n += 1;
        else seen.set(k, { label: colourLabel(k), n: 1 });
      });
    });
    return [...seen.entries()].sort((a, b) => b[1].n - a[1].n || a[1].label.localeCompare(b[1].label));
  }, [items]);
  const kp = category === "kurtis";
  // Kurti filter options: only choices that at least one piece has, with how many.
  const kOpts = useMemo(() => {
    const build = (all: Opt[], get: (p: Product) => string[]) => {
      const n = new Map<string, number>();
      items.forEach((p) => new Set(get(p)).forEach((v) => v && n.set(v, (n.get(v) ?? 0) + 1)));
      return all.filter((o) => n.has(o.slug)).map((o) => ({ ...o, n: n.get(o.slug) ?? 0 }));
    };
    return {
      style: build(STYLES, (p) => [p.kurti?.style ?? ""]),
      neck: build(NECKS, (p) => [p.kurti?.neck ?? ""]),
      sleeve: build(SLEEVES, (p) => [p.kurti?.sleeve ?? ""]),
      length: build(LENGTHS, (p) => [p.kurti?.length ?? ""]),
      fabric: build(FABRICS, (p) => [p.kurti?.fabricGroup ?? ""]),
      wear: build(WEAR, (p) => wearGroupsOf(p.kurti?.wear)),
    };
  }, [items]);
  const router = useRouter();
  const pathname = usePathname();
  const urlSp = useSearchParams();
  // Filters update on screen at once (local copy) and the address bar is updated quietly, so a tick never waits for the page to re-render.
  const [qs, setQs] = useState(urlSp.toString());
  const written = useRef<string[]>([]);
  useEffect(() => {
    const now = urlSp.toString();
    const at = written.current.indexOf(now);
    if (at >= 0) written.current.splice(0, at + 1); // our own change coming back
    else setQs(now); // back/forward or a link from elsewhere
  }, [urlSp]);
  const sp = useMemo(() => new URLSearchParams(qs), [qs]);
  const write = (next: URLSearchParams) => {
    const s = next.toString();
    written.current.push(s);
    setQs(s);
    try {
      window.history.replaceState(window.history.state, "", s ? `${pathname}?${s}` : pathname);
    } catch {
      router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
    }
  };
  const [open, setOpen] = useState(true); // desktop sidebar
  const [drawer, setDrawer] = useState(false); // mobile drawer
  const [desk, setDesk] = useState(true); // viewport >= 1024px
  const btnRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [opened, setOpened] = useState<Record<string, boolean>>({}); // every filter group starts closed

  const rawWeave = sp.get("weave");
  const weave = rawWeave === null ? defaultWeaves : rawWeave === "all" ? [] : list(rawWeave);
  const occasion = list(sp.get("occasion"));
  const colour = list(sp.get("colour"));
  const ks = { style: list(sp.get("style")), neck: list(sp.get("neck")), sleeve: list(sp.get("sleeve")), length: list(sp.get("length")), fabric: list(sp.get("fabric")), wear: list(sp.get("wear")) };
  const min = sp.get("min") ?? "";
  const max = sp.get("max") ?? "";
  const stock = sp.get("stock") === "1";
  const sort = sp.get("sort") ?? "new";
  const pageParam = Math.max(1, Math.floor(Number(sp.get("page"))) || 1);

  const go = (patch: Record<string, string>) => {
    const next = new URLSearchParams(qs);
    if (!("page" in patch)) next.delete("page"); // any filter or sort change returns to page 1
    Object.entries(patch).forEach(([k, v]) => (v && !(k === "page" && v === "1") ? next.set(k, v) : next.delete(k)));
    write(next);
  };
  const toggle = (key: string, current: string[], value: string) => {
    const next = current.includes(value) ? current.filter((x) => x !== value) : [...current, value];
    go({ [key]: next.length ? next.join(",") : key === "weave" ? "all" : "" });
  };
  const clearAll = () => write(new URLSearchParams(showWeaves && defaultWeaves.length ? "weave=all" : ""));

  const shown = useMemo(() => {
    const lo = Number(min) || 0;
    const hi = Number(max) || Infinity;
    let out = items.filter(
      (p) =>
        (!weave.length || (p.weave && weave.includes(p.weave))) &&
        (!occasion.length || occasion.some((o) => p.occasions.includes(o as never))) &&
        (!colour.length || colourNames(p).some((n) => colour.includes(colourKey(n)))) &&
        (!kp ||
          ((!ks.style.length || ks.style.includes(p.kurti?.style ?? "")) &&
            (!ks.neck.length || ks.neck.includes(p.kurti?.neck ?? "")) &&
            (!ks.sleeve.length || ks.sleeve.includes(p.kurti?.sleeve ?? "")) &&
            (!ks.length.length || ks.length.includes(p.kurti?.length ?? "")) &&
            (!ks.fabric.length || ks.fabric.includes(p.kurti?.fabricGroup ?? "")) &&
            (!ks.wear.length || wearGroupsOf(p.kurti?.wear).some((g) => ks.wear.includes(g))))) &&
        (!stock || (colour.length ? pickColour(p, colour)?.inStock ?? p.inStock !== false : p.inStock !== false)) &&
        p.price >= lo &&
        p.price <= hi,
    );
    if (sort === "low") out = [...out].sort((a, b) => a.price - b.price);
    else if (sort === "high") out = [...out].sort((a, b) => b.price - a.price);
    else if (sort === "new") out = [...out].sort((a, b) => Number(b.badge === "New" || !!b.fresh) - Number(a.badge === "New" || !!a.fresh));
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, qs]);

  const pages = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const page = Math.min(pageParam, pages);
  const visible = shown.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const goPage = (n: number) => {
    go({ page: String(n) });
    document.getElementById("cp-browse")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  // 1 … current-1 current current+1 … last
  const pageItems: (number | "gap-l" | "gap-r")[] = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1 || (page <= 2 && i <= 3) || (page >= pages - 1 && i >= pages - 2)) pageItems.push(i);
    else if (pageItems[pageItems.length - 1] !== "gap-l" && pageItems[pageItems.length - 1] !== "gap-r") pageItems.push(i < page ? "gap-l" : "gap-r");
  }

  const active = (showWeaves ? weave.length : 0) + (kp && kOpts.wear.length ? 0 : occasion.length) + (kp ? Object.values(ks).reduce((a, v) => a + v.length, 0) : 0) + colour.length + (min || max ? 1 : 0) + (stock ? 1 : 0);

  // drawer: lock page scroll + Escape to close
  useEffect(() => {
    if (!drawer) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const key = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    window.addEventListener("keydown", key);
    const t = window.setTimeout(() => closeRef.current?.focus(), 60);
    const opener = btnRef.current;
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", key);
      window.clearTimeout(t);
      opener?.focus();
    };
  }, [drawer]);
  // leaving the mobile breakpoint closes the drawer
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const f = () => {
      setDesk(mq.matches);
      if (mq.matches) setDrawer(false);
    };
    f();
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);

  const commitPrice = (form: HTMLFormElement) => {
    const d = new FormData(form);
    go({ min: String(d.get("min") ?? ""), max: String(d.get("max") ?? "") });
  };

  const group = (id: string, title: string, body: ReactNode) => {
    const shut = !opened[id];
    return (
      <div className="cp-group" data-open={!shut}>
        <button type="button" className="cp-trigger" aria-expanded={!shut} aria-controls={`cp-${id}`} onClick={() => setOpened((c) => ({ ...c, [id]: !c[id] }))}>
          <span>{title}</span>
          <Icon name={shut ? "plus" : "minus"} />
        </button>
        <div id={`cp-${id}`} className="cp-content">
          <div>
            <div className="cp-content-in">{body}</div>
          </div>
        </div>
      </div>
    );
  };

  const check = (label: string, on: boolean, onChange: () => void) => (
    <label key={label} className="cp-check">
      <input type="checkbox" checked={on} onChange={onChange} />
      <span className="cp-box" aria-hidden="true">
        <Icon name="check" />
      </span>
      <span>{label}</span>
    </label>
  );

  const filters = (
    <div className="cp-filters">
      <div className="cp-filter-head">
        <p>Filters</p>
        <button type="button" className="cp-textbtn" onClick={clearAll}>
          Clear all
        </button>
      </div>
      <div className="cp-sep" />
      {showWeaves && group("weave", "Weave", weaveFilters.map((w) => check(w.label, weave.includes(w.slug), () => toggle("weave", weave, w.slug))))}
      {kp && (["wear", "style", "neck", "sleeve", "length", "fabric"] as const).map((k) => {
        const opts = kOpts[k];
        if (!opts.length) return null;
        const title = { wear: "Occasion", style: "Style", neck: "Neck", sleeve: "Sleeve", length: "Length", fabric: "Fabric" }[k];
        return <div key={k}>{group(k, title, opts.map((o) => check(`${o.label} (${o.n})`, ks[k].includes(o.slug), () => toggle(k, ks[k], o.slug))))}</div>;
      })}
      {(!kp || kOpts.wear.length === 0) && group("occasion", "Occasion", occasions.map((o) => check(o.label, occasion.includes(o.slug), () => toggle("occasion", occasion, o.slug))))}
      {colourOptions.length > 0 && group("colour", "Colour", colourOptions.map(([k, o]) => {
        const dot = dotFor(k);
        return (
          <label key={k} className="cp-check">
            <input type="checkbox" checked={colour.includes(k)} onChange={() => toggle("colour", colour, k)} />
            <span className="cp-box" aria-hidden="true"><Icon name="check" /></span>
            <span className="cp-cdot" style={{ background: dot ?? "transparent" }} data-none={!dot} aria-hidden="true" />
            <span>{o.label} <small className="cp-cn">({o.n})</small></span>
          </label>
        );
      }))}
      {group(
        "price",
        "Price",
        <form
          key={`${min}-${max}`}
          className="cp-price"
          onSubmit={(e) => {
            e.preventDefault();
            commitPrice(e.currentTarget);
          }}
        >
          <label>
            <span>Min ₹</span>
            <input name="min" type="number" min={0} inputMode="numeric" defaultValue={min} placeholder="0" onBlur={(e) => e.currentTarget.form && commitPrice(e.currentTarget.form)} />
          </label>
          <label>
            <span>Max ₹</span>
            <input name="max" type="number" min={0} inputMode="numeric" defaultValue={max} placeholder="Any" onBlur={(e) => e.currentTarget.form && commitPrice(e.currentTarget.form)} />
          </label>
        </form>,
      )}
      {group("stock", "Availability", check("In stock", stock, () => go({ stock: stock ? "" : "1" })))}
    </div>
  );

  return (
    <>
      <div className="cp-toolbar">
        <button
          type="button"
          className="cp-filterbtn"
          ref={btnRef}
          aria-expanded={desk ? open : drawer}
          aria-controls="cp-sidebar"
          onClick={() => (desk ? setOpen((v) => !v) : setDrawer(true))}
        >
          <Icon name="filter" />
          <span>Filters{active ? ` (${active})` : ""}</span>
        </button>
        <p className="cp-count" aria-live="polite">
          {shown.length} {shown.length === 1 ? "piece" : "pieces"}
        </p>
        <div className="cp-sort">
          <label htmlFor="cp-sort" className="sr-only">Sort</label>
          <select id="cp-sort" value={sort} onChange={(e) => go({ sort: e.target.value === "new" ? "" : e.target.value })}>
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <Icon name="chevron-down" />
        </div>
      </div>

      <div id="cp-browse" className="cp-browse" data-sidebar={open}>
        {drawer && <button type="button" aria-label="Close filters" className="cp-scrim" onClick={() => setDrawer(false)} />}
        <aside id="cp-sidebar" aria-label="Filters" className="cp-sidebar" data-drawer={drawer} data-open={open} aria-hidden={!desk && !drawer ? true : undefined}>
          <div className="cp-drawer-top">
            <p>Filters</p>
            <button type="button" ref={closeRef} aria-label="Close filters" onClick={() => setDrawer(false)}>
              <Icon name="close" />
            </button>
          </div>
          <div className="cp-sidebar-scroll" data-native-scroll>{filters}</div>
          <div className="cp-drawer-foot">
            <button type="button" className="btn w-full" onClick={() => setDrawer(false)}>
              Show {shown.length} {shown.length === 1 ? "piece" : "pieces"}
            </button>
          </div>
        </aside>

        <div className="cp-merch">
          {shown.length === 0 ? (
            <div className="py-16 text-center">
              <p className="f-serif text-[2.2rem] text-wine">Nothing matches yet</p>
              <p className="mx-auto mt-3 max-w-[36ch] text-ink/70">Try removing a filter, or ask us to find something for you.</p>
              <div className="mt-7 flex flex-wrap justify-center gap-4">
                {active > 0 && (
                  <button type="button" className="btn" onClick={clearAll}>
                    Clear filters
                  </button>
                )}
                <Link href="/contact" className="btn btn-secondary">Ask us</Link>
              </div>
            </div>
          ) : (
            <>
              <div className="cp-products">
                {visible.map((p, i) => (
                  <CollectionProductCard key={p.id} product={p} priority={i < 3} colour={colour.length ? pickColour(p, colour)?.name : undefined} />
                ))}
              </div>
              {pages > 1 && (
                <nav className="cp-pager" aria-label="Pagination">
                  <button type="button" className="cp-pg cp-pg--arrow" aria-label="Previous page" disabled={page === 1} onClick={() => goPage(page - 1)}>
                    <Icon name="chevron-left" />
                  </button>
                  {pageItems.map((it) =>
                    typeof it === "number" ? (
                      <button key={it} type="button" className="cp-pg" aria-label={`Page ${it}`} aria-current={it === page ? "page" : undefined} onClick={() => goPage(it)}>
                        {it}
                      </button>
                    ) : (
                      <span key={it} className="cp-pg cp-pg--gap" aria-hidden="true">…</span>
                    ),
                  )}
                  <button type="button" className="cp-pg cp-pg--arrow" aria-label="Next page" disabled={page === pages} onClick={() => goPage(page + 1)}>
                    <Icon name="chevron-right" />
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
