"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { colours, occasions, weaveFilters, type Product } from "@/lib/products";
import CollectionProductCard from "./CollectionProductCard";
import { Icon } from "./Icon";

const SORTS = [
  { value: "new", label: "Sort: Newest" },
  { value: "featured", label: "Sort: Featured" },
  { value: "low", label: "Sort: Price, low–high" },
  { value: "high", label: "Sort: Price, high–low" },
];

const list = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);

interface Props {
  items: Product[];
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
export default function CollectionGrid({ items, showWeaves, defaultWeaves = [] }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [open, setOpen] = useState(true); // desktop sidebar
  const [drawer, setDrawer] = useState(false); // mobile drawer
  const [desk, setDesk] = useState(true); // viewport >= 1024px
  const btnRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [closed, setClosed] = useState<Record<string, boolean>>({});

  const rawWeave = sp.get("weave");
  const weave = rawWeave === null ? defaultWeaves : rawWeave === "all" ? [] : list(rawWeave);
  const occasion = list(sp.get("occasion"));
  const colour = list(sp.get("colour"));
  const min = sp.get("min") ?? "";
  const max = sp.get("max") ?? "";
  const stock = sp.get("stock") === "1";
  const sort = sp.get("sort") ?? "new";

  const go = (patch: Record<string, string>) => {
    const next = new URLSearchParams(sp.toString());
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
  const toggle = (key: "weave" | "occasion" | "colour", current: string[], value: string) => {
    const next = current.includes(value) ? current.filter((x) => x !== value) : [...current, value];
    go({ [key]: next.length ? next.join(",") : key === "weave" ? "all" : "" });
  };
  const clearAll = () => router.replace(showWeaves && defaultWeaves.length ? `${pathname}?weave=all` : pathname, { scroll: false });

  const shown = useMemo(() => {
    const lo = Number(min) || 0;
    const hi = Number(max) || Infinity;
    let out = items.filter(
      (p) =>
        (!weave.length || (p.weave && weave.includes(p.weave))) &&
        (!occasion.length || occasion.some((o) => p.occasions.includes(o as never))) &&
        (!colour.length || colour.includes(p.tone)) &&
        (!stock || p.inStock !== false) &&
        p.price >= lo &&
        p.price <= hi,
    );
    if (sort === "low") out = [...out].sort((a, b) => a.price - b.price);
    else if (sort === "high") out = [...out].sort((a, b) => b.price - a.price);
    else if (sort === "new") out = [...out].sort((a, b) => Number(b.badge === "New" || !!b.fresh) - Number(a.badge === "New" || !!a.fresh));
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, sp.toString()]);

  const active = (showWeaves ? weave.length : 0) + occasion.length + colour.length + (min || max ? 1 : 0) + (stock ? 1 : 0);

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
    const shut = !!closed[id];
    return (
      <div className="cp-group" data-open={!shut}>
        <button type="button" className="cp-trigger" aria-expanded={!shut} aria-controls={`cp-${id}`} onClick={() => setClosed((c) => ({ ...c, [id]: !c[id] }))}>
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
      {group("occasion", "Occasion", occasions.map((o) => check(o.label, occasion.includes(o.slug), () => toggle("occasion", occasion, o.slug))))}
      {group(
        "colour",
        "Colour",
        <div className="cp-swatches">
          {colours.map((c) => {
            const on = colour.includes(c.slug);
            return (
              <button key={c.slug} type="button" className="cp-sw" aria-pressed={on} onClick={() => toggle("colour", colour, c.slug)}>
                <span className="cp-sw-ring">
                  <span className="cp-sw-dot" style={{ background: c.hex }} />
                </span>
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>,
      )}
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

      <div className="cp-browse" data-sidebar={open}>
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
            <div className="cp-products">
              {shown.map((p, i) => (
                <CollectionProductCard key={p.id} product={p} priority={i < 3} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}