"use client";

import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import { Btn, Card, Empty, Field, PageHeader, Thumb, Toggle } from "@/components/admin/ui";
import { useAdmin } from "@/components/admin/AdminShell";
import AIcon from "@/components/admin/AIcon";
import { compressImage } from "@/lib/admin/export";
import type { AdminCollection } from "@/lib/admin/types";
import type { CategorySlug } from "@/lib/products";
import type { Tone } from "@/lib/content";

const TONE_BG: Record<string, string> = { wine: "linear-gradient(135deg,#4a0b13,#7a1f2b)", burgundy: "linear-gradient(135deg,#680f1a,#9a2b38)", gold: "linear-gradient(135deg,#a07b2a,#c9a24d)", taupe: "linear-gradient(135deg,#8c7b6d,#bba99a)", ivory: "linear-gradient(135deg,#d8cbb4,#f1e8d8)" };

export default function EditCollection() {
  const { slug } = useParams<{ slug: string }>();
  const { d, set, log, toast } = useAdmin();
  const found = d.collections.find((c) => c.id === slug);
  const [c, setC] = useState<AdminCollection | null>(found ?? null);
  const [dirty, setDirty] = useState(false);
  const [from, setFrom] = useState<number | null>(null);
  const file = useRef<HTMLInputElement>(null);

  if (!c) return <Empty title="Collection not found" action={<Btn href="/admin/collections" variant="ghost">Back to collections</Btn>} />;
  const up = <K extends keyof AdminCollection>(k: K, v: AdminCollection[K]) => { setC((cur) => (cur ? { ...cur, [k]: v } : cur)); setDirty(true); };
  const move = (i: number, to: number) => {
    if (to < 0 || to >= c.products.length || i === to) return;
    const n = [...c.products];
    const [m] = n.splice(i, 1);
    n.splice(to, 0, m);
    up("products", n);
  };
  const save = () => {
    if (!set("collections", (prev) => prev.map((x) => (x.id === c.id ? c : x)))) return toast("Storage is full. Use a smaller image.", "err");
    // keep each product's collection field in step with this list
    set("products", (prev) => prev.map((p) => (c.products.includes(p.id) ? { ...p, collection: c.id } : p.collection === c.id ? { ...p, collection: "" } : p)));
    log("Collection", c.title, "Updated");
    setDirty(false);
    toast("Collection saved");
  };
  const addable = d.products.filter((p) => !c.products.includes(p.id));

  return (
    <>
      <PageHeader back={{ href: "/admin/collections", label: "Collections" }} title={c.title} actions={<Toggle checked={c.active} onChange={(v) => up("active", v)} label={c.active ? "Active" : "Inactive"} />} />
      <div className="adm-cols">
        <div>
          <Card title="Details">
            <div className="adm-form">
              <Field label="Title" wide><input className="adm-in" value={c.title} onChange={(e) => up("title", e.target.value)} /></Field>
              <Field label="Story" wide><textarea className="adm-in" value={c.story} onChange={(e) => up("story", e.target.value)} /></Field>
              <Field label="Holds">
                <select className="adm-in" value={c.category ?? "sarees"} onChange={(e) => up("category", e.target.value as CategorySlug)}>
                  <option value="sarees">Sarees</option><option value="kurtis">Kurtis</option><option value="gift-craft">Gifting</option>
                </select>
              </Field>
              <Field label="Colour when there is no image">
                <select className="adm-in" value={c.tone} onChange={(e) => up("tone", e.target.value as Tone)}>{["wine", "burgundy", "gold", "taupe", "ivory"].map((t) => <option key={t}>{t}</option>)}</select>
              </Field>
              <Field label="SEO title"><input className="adm-in" value={c.seoTitle} onChange={(e) => up("seoTitle", e.target.value)} /></Field>
              <Field label="SEO description" wide><textarea className="adm-in" value={c.seoDescription} onChange={(e) => up("seoDescription", e.target.value)} /></Field>
            </div>
          </Card>
          <Card title="Products in this collection" actions={
            <select className="adm-in" style={{ minHeight: 34, width: 220 }} value="" aria-label="Add a product" onChange={(e) => { if (e.target.value) up("products", [...c.products, e.target.value]); }}>
              <option value="">Add a product…</option>
              {addable.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          } pad={false}>
            {c.products.length === 0 ? <p className="adm-card-b adm-sub">No products yet.</p> : (
              <ul className="adm-list">
                {c.products.map((id, i) => {
                  const p = d.products.find((x) => x.id === id);
                  return (
                    <li key={id} draggable onDragStart={() => setFrom(i)} onDragEnd={() => setFrom(null)} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (from != null) move(from, i); setFrom(null); }} style={{ opacity: from === i ? 0.45 : 1 }}>
                      <span className="adm-drag" aria-hidden="true"><AIcon name="drag" /></span>
                      <Thumb tone={p?.tone} src={p?.images[0]?.src} />
                      <div><b>{p?.name ?? id}</b><small>{p?.sku}</small></div>
                      <button type="button" className="adm-ibtn" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Move up"><AIcon name="arrow-up" /></button>
                      <button type="button" className="adm-ibtn" onClick={() => move(i, i + 1)} disabled={i === c.products.length - 1} aria-label="Move down"><AIcon name="arrow-down" /></button>
                      <button type="button" className="adm-ibtn" onClick={() => up("products", c.products.filter((x) => x !== id))} aria-label="Remove from collection"><AIcon name="close" /></button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
        <div>
          <Card title="Hero image">
            <div className="adm-ban" style={{ background: c.heroImage ? `center / cover url(${c.heroImage})` : TONE_BG[c.tone] }}>
              <b>{c.title}</b><span>{c.story}</span>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <Btn size="sm" variant="ghost" icon="upload" onClick={() => file.current?.click()}>Choose image</Btn>
              {c.heroImage && <Btn size="sm" variant="ghost" onClick={() => up("heroImage", "")}>Remove</Btn>}
              <input ref={file} type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) up("heroImage", await compressImage(f, 1100)); }} />
            </div>
          </Card>
        </div>
      </div>
      <div className="adm-savebar">
        {dirty && <span className="adm-hint">You have unsaved changes.</span>}
        <span className="adm-grow" />
        <Btn variant="ghost" href="/admin/collections">Close</Btn>
        <Btn onClick={save} disabled={!dirty}>Save collection</Btn>
      </div>
    </>
  );
}
