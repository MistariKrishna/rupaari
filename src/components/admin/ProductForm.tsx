"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { blankProduct, makeSku } from "@/lib/admin/seed";
import type { AdminProduct, ProductStatus, ProductVariant } from "@/lib/admin/types";
import { FABRICS, LENGTHS, NECKS, SLEEVES, STYLES, WEAR } from "@/lib/kurti";
import { KURTI_SIZES, categories, occasions, weaveFilters, type OccasionSlug, type WeaveSlug } from "@/lib/products";
import { useAdmin } from "./AdminShell";
import ImageUploader from "./ImageUploader";
import { Btn, Card, Check, Field, PageHeader, StatusBadge, Tabs, Toggle, money, slugify, toNum, uid } from "./ui";

type Tab = "basics" | "details" | "sizes" | "pricing" | "colours" | "media" | "seo";

/** Missing items that block publishing. */
export const missingFor = (p: AdminProduct): string[] => {
  const out: string[] = [];
  if (!p.name.trim()) out.push("Title");
  if (!p.shortLine.trim()) out.push("Short line");
  if (!p.description.trim()) out.push("Description");
  if (!p.sku.trim()) out.push("SKU");
  if (!(p.price > 0)) out.push("Price");
  if (p.category === "sarees" && !p.collection) out.push("Collection");
  if (p.images.length === 0) out.push("At least one image");
  if (p.category === "kurtis" && p.sizes.length === 0) out.push("Sizes offered");
  return out;
};

export default function ProductForm({ id }: { id?: string }) {
  const { d, set, can, why, log, toast, confirm } = useAdmin();
  const router = useRouter();
  const existing = id ? d.products.find((p) => p.id === id) : undefined;
  const [p, setP] = useState<AdminProduct>(() => existing ?? { ...blankProduct(), id: uid("prd") });
  const [tab, setTab] = useState<Tab>("basics");
  const [dirty, setDirty] = useState(false);
  const [touchedSlug, setTouchedSlug] = useState(!!existing);
  const isNew = !existing;
  const priceLocked = !isNew && !can("price");
  const missing = useMemo(() => missingFor(p), [p]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const up = <K extends keyof AdminProduct>(k: K, v: AdminProduct[K]) => {
    setP((cur) => {
      const next = { ...cur, [k]: v };
      if (k === "name" && !touchedSlug) next.slug = slugify(String(v));
      return next;
    });
    setDirty(true);
  };

  const save = (status?: ProductStatus) => {
    const next: AdminProduct = { ...p, status: status ?? p.status, updatedAt: new Date().toISOString() };
    if (!next.name.trim()) return toast("Give the product a title first.", "err");
    if (!next.sku.trim()) next.sku = makeSku(next.name, d.products.length + 1);
    if (!next.slug) next.slug = slugify(next.name);
    if (next.status === "live") {
      const m = missingFor(next);
      if (m.length) return toast(`Cannot publish yet. Missing: ${m.join(", ")}.`, "err");
    }
    if (d.products.some((x) => x.id !== next.id && x.slug === next.slug)) return toast("Another product already uses this URL slug.", "err");
    const ok = set("products", (prev) => (prev.some((x) => x.id === next.id) ? prev.map((x) => (x.id === next.id ? next : x)) : [next, ...prev]));
    if (!ok) return toast("Storage is full. Use smaller or fewer images.", "err");
    if (isNew) {
      set("stock", (prev) => [...prev, { id: next.id, onHand: next.stockModel === "one_of_one" ? 1 : 0, reserved: 0, reorder: next.stockModel === "multi" ? 5 : 0, sizes: next.sizes.length ? Object.fromEntries(next.sizes.map((s) => [s, 0])) : undefined }]);
    }
    log("Product", next.name, isNew ? "Created" : "Updated", next.status);
    setDirty(false);
    setP(next);
    toast(next.status === "live" ? "Published to the store catalogue" : "Saved");
    if (isNew) router.replace(`/admin/products/${next.id}`);
  };
  const duplicate = () => {
    const copy: AdminProduct = { ...p, id: uid("prd"), name: `${p.name} (copy)`, slug: `${p.slug}-copy-${Date.now().toString(36).slice(-3)}`, sku: `${p.sku}-C`, status: "draft", updatedAt: new Date().toISOString() };
    set("products", (prev) => [copy, ...prev]);
    set("stock", (prev) => [...prev, { id: copy.id, onHand: 0, reserved: 0, reorder: 0, sizes: copy.sizes.length ? Object.fromEntries(copy.sizes.map((s) => [s, 0])) : undefined }]);
    log("Product", copy.name, "Duplicated");
    toast("Duplicated as a draft");
    router.push(`/admin/products/${copy.id}`);
  };
  const archive = async () => {
    if (await confirm({ title: `Archive ${p.name}?`, body: "It is hidden from the store. You can restore it later.", label: "Archive" })) save("archived");
  };
  const remove = async () => {
    if (!(await confirm({ title: `Delete ${p.name}?`, body: "This removes the product and its stock record. Past orders keep their own copy.", label: "Delete product", danger: true }))) return;
    set("products", (prev) => prev.filter((x) => x.id !== p.id));
    set("stock", (prev) => prev.filter((x) => x.id !== p.id));
    log("Product", p.name, "Deleted");
    setDirty(false);
    router.replace("/admin/products");
  };

  const toggle = <T extends string>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const tabs: { id: Tab; label: string }[] = [
    { id: "basics", label: "Basics" },
    { id: "details", label: "Details" },
    ...(p.category === "kurtis" ? [{ id: "sizes" as Tab, label: "Kurti details" }] : []),
    { id: "pricing", label: "Pricing and stock" },
    { id: "media", label: `Media (${p.images.length})` },
    { id: "colours", label: `Colours (${(p.colourName.trim() ? 1 : 0) + (p.variants ?? []).length})` },
    { id: "seo", label: "SEO" },
  ];
  const cur = tabs.some((t) => t.id === tab) ? tab : "basics";
  const tf = (props: { k: keyof AdminProduct; label: string; wide?: boolean; area?: boolean; hint?: string; type?: string; req?: boolean }) => (
    <Field label={props.label} wide={props.wide} hint={props.hint} required={props.req}>
      {props.area ? (
        <textarea className="adm-in" value={String(p[props.k] ?? "")} onChange={(e) => up(props.k, e.target.value as never)} />
      ) : (
        <input className="adm-in" type={props.type} value={String(p[props.k] ?? "")} onChange={(e) => up(props.k, (props.type === "number" ? toNum(e.target.value) : e.target.value) as never)} />
      )}
    </Field>
  );

  return (
    <>
      <PageHeader
        back={{ href: "/admin/products", label: "Products" }}
        title={isNew ? "New product" : p.name || "Product"}
        sub={isNew ? "Saved as a draft until you publish." : <>SKU {p.sku} · <StatusBadge s={p.status} /></>}
        actions={!isNew && (
          <>
            <Btn variant="ghost" icon="copy" onClick={duplicate}>Duplicate</Btn>
            {p.status !== "archived" && <Btn variant="ghost" onClick={archive}>Archive</Btn>}
            <Btn variant="danger" icon="trash" disabled={!can("delete")} title={why("delete")} onClick={remove}>Delete</Btn>
          </>
        )}
      />
      {p.status !== "live" && missing.length > 0 && (
        <div className="adm-alert adm-alert--blue"><span><b>Before this can go live:</b> {missing.join(", ")}.</span></div>
      )}
      <p className="adm-hint" style={{ marginBottom: 10 }}><span className="adm-req">*</span> Required to publish. You can save a draft without them.</p>
      <Tabs tabs={tabs} value={cur} onChange={setTab} />

      {cur === "basics" && (
        <Card title="Basics">
          <div className="adm-form">
            {tf({ k: "name", label: "Title", wide: true, req: true })}
            {tf({ k: "shortLine", label: "Short line", wide: true, req: true, hint: "One sentence shown on product cards." })}
            <Field label="Category">
              <select className="adm-in" value={p.category} onChange={(e) => { const c = e.target.value as AdminProduct["category"]; up("category", c); if (!d.collections.some((x) => x.id === p.collection && (x.category ?? "sarees") === c)) up("collection", ""); if (c === "kurtis" && p.sizes.length === 0) up("sizes", [...KURTI_SIZES]); if (c !== "kurtis" && p.sizes.length) up("sizes", []); }}>
                {categories.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Collection" required={p.category === "sarees"}>
              <select className="adm-in" value={p.collection} onChange={(e) => up("collection", e.target.value)}>
                <option value="">None</option>
                {d.collections.filter((c) => (c.category ?? "sarees") === p.category).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </Field>
            {tf({ k: "slug", label: "URL slug", hint: "Used in the product address." })}
            <Field label="Status"><select className="adm-in" value={p.status} onChange={(e) => up("status", e.target.value as ProductStatus)}><option value="draft">Draft</option><option value="live">Live</option><option value="archived">Archived</option></select></Field>
            {tf({ k: "description", label: "Description", wide: true, area: true, req: true })}
            {tf({ k: "story", label: "Story", wide: true, area: true, hint: "The weaver, the place, the making." })}
          </div>
        </Card>
      )}

      {cur === "details" && (
        <Card title="Product details">
          <div className="adm-form">
            <Field label="Weave"><select className="adm-in" value={p.weave ?? ""} onChange={(e) => up("weave", (e.target.value || undefined) as WeaveSlug | undefined)}><option value="">None</option>{weaveFilters.map((w) => <option key={w.slug} value={w.slug}>{w.label}</option>)}</select></Field>
            {tf({ k: "region", label: "Region" })}
            {tf({ k: "zariType", label: "Zari type" })}
            {tf({ k: "border", label: "Border" })}
            {tf({ k: "pallu", label: "Pallu" })}
            {tf({ k: "motifs", label: "Motifs" })}
            {tf({ k: "weaverCluster", label: "Weaver cluster" })}
            {tf({ k: "weightG", label: "Weight (g)", type: "number" })}
            {tf({ k: "lengthM", label: "Length (m)", type: "number" })}
            {tf({ k: "care", label: "Care", wide: true, area: true })}
            <Field label="Occasions" wide>
              <div className="adm-checks">{occasions.map((o) => <Check key={o.slug} checked={p.occasions.includes(o.slug)} onChange={() => up("occasions", toggle<OccasionSlug>(p.occasions, o.slug))} label={o.label} />)}</div>
            </Field>
            <Field label="Certification" wide>
              <div className="adm-checks">
                <Check checked={p.silkMark} onChange={(v) => up("silkMark", v)} label="Silk Mark" />
                <Check checked={p.handloomMark} onChange={(v) => up("handloomMark", v)} label="Handloom Mark" />
                <Check checked={p.giTag} onChange={(v) => up("giTag", v)} label="GI tag" />
                <Check checked={p.blouse} onChange={(v) => up("blouse", v)} label="Blouse piece included" />
              </div>
              <span className="adm-hint">Tick only what has been verified for this piece.</span>
            </Field>
          </div>
        </Card>
      )}

      {cur === "sizes" && p.category === "kurtis" && (
        <Card title="Style and fabric">
          <p className="adm-sub" style={{ marginBottom: 14 }}>These choices power the filters and the Kurtis menu on the store, and appear in the product details.</p>
          <div className="adm-form">
            <Field label="Style"><select className="adm-in" value={p.style ?? ""} onChange={(e) => up("style", e.target.value)}><option value="">Not set</option>{STYLES.map((o) => <option key={o.slug} value={o.slug}>{o.label}</option>)}</select></Field>
            <Field label="Neck"><select className="adm-in" value={p.neck ?? ""} onChange={(e) => up("neck", e.target.value)}><option value="">Not set</option>{NECKS.map((o) => <option key={o.slug} value={o.slug}>{o.label}</option>)}</select></Field>
            <Field label="Sleeve"><select className="adm-in" value={p.sleeve ?? ""} onChange={(e) => up("sleeve", e.target.value)}><option value="">Not set</option>{SLEEVES.map((o) => <option key={o.slug} value={o.slug}>{o.label}</option>)}</select></Field>
            <Field label="Length"><select className="adm-in" value={p.length ?? ""} onChange={(e) => up("length", e.target.value)}><option value="">Not set</option>{LENGTHS.map((o) => <option key={o.slug} value={o.slug}>{o.label}{o.inches ? ` (${o.inches} in)` : ""}</option>)}</select></Field>
            <Field label="Fabric">
              <select className="adm-in" value={p.fabricGroup ?? ""} onChange={(e) => { up("fabricGroup", e.target.value); up("fabricType", ""); }}><option value="">Not set</option>{FABRICS.map((g) => <option key={g.slug} value={g.slug}>{g.label}</option>)}</select>
            </Field>
            <Field label="Fabric type">
              <select className="adm-in" value={p.fabricType ?? ""} disabled={!p.fabricGroup} onChange={(e) => up("fabricType", e.target.value)}><option value="">Not set</option>{(FABRICS.find((g) => g.slug === p.fabricGroup)?.types ?? []).map((t) => <option key={t.slug} value={t.slug}>{t.label}</option>)}</select>
            </Field>
          </div>
        </Card>
      )}

      {cur === "sizes" && p.category === "kurtis" && (
        <Card title="Wear and occasion">
          <p className="adm-sub" style={{ marginBottom: 14 }}>Tick every occasion this kurti suits. Shoppers filter by the group (Daily & Casual, Party and so on).</p>
          {WEAR.map((g) => (
            <Field key={g.slug} label={g.label}>
              <div className="adm-checks">{g.items.map((i) => <Check key={i.slug} checked={(p.wearTags ?? []).includes(i.slug)} onChange={() => up("wearTags", toggle(p.wearTags ?? [], i.slug))} label={i.label} />)}</div>
            </Field>
          ))}
        </Card>
      )}

      {cur === "sizes" && p.category === "kurtis" && (
        <Card title="Kurti sizing">
          <p className="adm-sub" style={{ marginBottom: 14 }}>Sizes shown on the product page, bag, checkout and orders. Sold-out sizes stay visible but cannot be chosen.</p>
          <div className="adm-form">
            <Field label="Sizes offered" required><div className="adm-checks">{KURTI_SIZES.map((s) => <Check key={s} checked={p.sizes.includes(s)} onChange={() => { up("sizes", toggle(p.sizes, s)); if (p.sizes.includes(s)) up("soldOutSizes", p.soldOutSizes.filter((x) => x !== s)); }} label={s} />)}</div></Field>
            <Field label="Sold out"><div className="adm-checks">{p.sizes.map((s) => <Check key={s} checked={p.soldOutSizes.includes(s)} onChange={() => up("soldOutSizes", toggle(p.soldOutSizes, s))} label={s} />)}</div></Field>
          </div>
        </Card>
      )}

      {cur === "pricing" && (
        <Card title="Pricing and stock">
          {priceLocked && <div className="adm-alert"><span>{why("price")}. Price and MRP are locked for your role.</span></div>}
          <div className="adm-form">
            {tf({ k: "sku", label: "SKU", req: true })}
            <Field label="Price (₹)" required><input className="adm-in" type="number" min={0} disabled={priceLocked} value={p.price || ""} onChange={(e) => up("price", Number(toNum(e.target.value)) || 0)} /></Field>
            <Field label="MRP (₹)" hint="Leave empty when there is no discount."><input className="adm-in" type="number" min={0} disabled={priceLocked} value={p.mrp} onChange={(e) => up("mrp", toNum(e.target.value))} /></Field>
            <Field label="GST rate (%)"><input className="adm-in" type="number" min={0} value={p.gstRate} onChange={(e) => up("gstRate", Number(toNum(e.target.value)) || 0)} /></Field>
            {tf({ k: "hsn", label: "HSN code" })}
            <Field label="Stock model">
              <select className="adm-in" value={p.stockModel} onChange={(e) => up("stockModel", e.target.value as AdminProduct["stockModel"])}>
                <option value="one_of_one">One of one</option>
                <option value="multi">Multiple pieces</option>
                <option value="made_to_order">Made to order</option>
              </select>
            </Field>
            {p.stockModel === "made_to_order" && <Field label="Lead time (days)"><input className="adm-in" type="number" min={1} value={p.leadTimeDays} onChange={(e) => up("leadTimeDays", toNum(e.target.value))} /></Field>}
          </div>
          {typeof p.mrp === "number" && p.mrp > p.price && p.price > 0 && <p className="adm-hint" style={{ marginTop: 12 }}>Shows {Math.round((1 - p.price / p.mrp) * 100)}% off ({money(p.mrp)} to {money(p.price)}).</p>}
          <div style={{ marginTop: 16 }}>
            <Check checked={!!p.soldOut} onChange={(v) => up("soldOut", v)} label="Mark this whole product out of stock (all colours)" />
            <p className="adm-hint" style={{ marginTop: 6 }}>Shoppers can still open the page but cannot add it to the bag. To close one colour only, use the Colours tab.</p>
          </div>
          <p className="adm-hint" style={{ marginTop: 6 }}>Stock counts are managed on the Inventory screen.</p>
        </Card>
      )}

      {cur === "colours" && (
        <>
          <Card title="Colours">
            <p className="adm-sub" style={{ marginBottom: 14 }}>Same piece, same details and price. Each colour has its own pictures and its own out-of-stock switch. Shoppers pick a colour by name on the product page and the pictures change with it.</p>
            <div className="adm-form">
              <Field label="Main colour name" hint="Type the name, e.g. Maroon. Its pictures are on the Media tab."><input className="adm-in" value={p.colourName} onChange={(e) => up("colourName", e.target.value)} placeholder="e.g. Maroon" /></Field>
              <Field label="Stock"><Check checked={!!p.colourSoldOut} onChange={(v) => up("colourSoldOut", v)} label="This colour is out of stock" /></Field>
            </div>
          </Card>
          {(p.variants ?? []).map((v, n) => {
            const setV = (patch: Partial<ProductVariant>) => up("variants", (p.variants ?? []).map((x) => (x.id === v.id ? { ...x, ...patch } : x)));
            return (
              <Card key={v.id} title={v.name.trim() || `Colour ${n + 2}`}>
                <div className="adm-form">
                  <Field label="Colour name"><input className="adm-in" value={v.name} onChange={(e) => setV({ name: e.target.value })} placeholder="e.g. Ivory" /></Field>
                  <Field label="Stock"><Check checked={v.soldOut} onChange={(x) => setV({ soldOut: x })} label="This colour is out of stock" /></Field>
                </div>
                <div style={{ marginTop: 14 }}>
                  <ImageUploader images={v.images} onChange={(imgs) => setV({ images: imgs })} onError={(m) => toast(m, "err")} />
                </div>
                <div style={{ marginTop: 12 }}>
                  <Btn variant="danger" icon="trash" onClick={() => up("variants", (p.variants ?? []).filter((x) => x.id !== v.id))}>Remove this colour</Btn>
                </div>
              </Card>
            );
          })}
          <div style={{ marginTop: 14 }}>
            <Btn icon="plus" onClick={() => up("variants", [...(p.variants ?? []), { id: uid("var"), name: "", images: [], soldOut: false }])}>Add another colour</Btn>
          </div>
        </>
      )}

      {cur === "media" && (
        <Card title={<>Images{p.colourName.trim() ? ` · ${p.colourName.trim()}` : ""} <span className="adm-req">*</span></>}>
          <ImageUploader images={p.images} onChange={(v) => up("images", v)} onError={(m) => toast(m, "err")} />
          <p className="adm-hint" style={{ marginTop: 10 }}>Alt text is optional. If you add it, describe the piece, for example &ldquo;Burgundy Kanjivaram saree with a gold zari border&rdquo;; it helps screen readers and search.</p>
        </Card>
      )}

      {cur === "seo" && (
        <Card title="Search appearance">
          <div className="adm-form">
            {tf({ k: "seoTitle", label: "SEO title", wide: true })}
            {tf({ k: "seoDescription", label: "SEO description", wide: true, area: true })}
          </div>
          <div className="adm-note" style={{ marginTop: 14 }}>
            <b style={{ color: "#1a0dab", fontWeight: 500 }}>{p.seoTitle || p.name || "Product title"} | RUPAARI</b>
            <small>rupaari.com/product/{p.slug || "slug"}</small>
            <span>{p.seoDescription || p.shortLine || "Description shown in search results."}</span>
          </div>
        </Card>
      )}

      <div className="adm-savebar">
        {dirty && <span className="adm-hint">You have unsaved changes.</span>}
        <span className="adm-grow" />
        <Btn variant="ghost" onClick={() => router.push("/admin/products")}>Close</Btn>
        <Btn variant="ghost" onClick={() => save(p.status === "live" ? "draft" : undefined)}>{p.status === "live" ? "Unpublish" : "Save draft"}</Btn>
        <Btn onClick={() => save("live")}>{p.status === "live" ? "Save and publish" : "Publish"}</Btn>
      </div>
    </>
  );
}
