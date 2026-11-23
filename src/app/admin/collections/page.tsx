"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge, Btn, Card, Empty, Field, Modal, PageHeader, Thumb, Toggle, slugify } from "@/components/admin/ui";
import { useAdmin } from "@/components/admin/AdminShell";
import AIcon from "@/components/admin/AIcon";
import type { AdminCollection } from "@/lib/admin/types";

export default function Collections() {
  const { d, set, log, toast, confirm, can, why } = useAdmin();
  const [from, setFrom] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");

  const move = (i: number, to: number) => {
    if (to < 0 || to >= d.collections.length || i === to) return;
    set("collections", (prev) => {
      const n = [...prev];
      const [m] = n.splice(i, 1);
      n.splice(to, 0, m);
      return n;
    });
    log("Collection", d.collections[i].title, "Reordered");
  };
  const create = () => {
    const id = slugify(title);
    if (!id) return;
    if (d.collections.some((c) => c.id === id)) return toast("A collection with that name exists.", "err");
    const c: AdminCollection = { id, title: title.trim(), story: "", tone: "burgundy", heroImage: "", active: false, seoTitle: title.trim(), seoDescription: "", products: [] };
    set("collections", (prev) => [...prev, c]);
    log("Collection", c.title, "Created");
    setOpen(false);
    setTitle("");
    toast("Collection created as inactive");
  };
  const remove = async (c: AdminCollection) => {
    if (!(await confirm({ title: `Delete ${c.title}?`, body: "Products stay in the catalogue but lose this collection.", label: "Delete", danger: true }))) return;
    set("collections", (prev) => prev.filter((x) => x.id !== c.id));
    set("products", (prev) => prev.map((p) => (p.collection === c.id ? { ...p, collection: "" } : p)));
    log("Collection", c.title, "Deleted");
  };

  return (
    <>
      <PageHeader title="Collections" sub="Drag to change the order they appear in on the store." actions={<><Btn variant="ghost" href="/admin/collections/banners" icon="image">Banners</Btn><Btn icon="plus" onClick={() => setOpen(true)}>New collection</Btn></>} />
      {d.collections.length === 0 ? <Empty title="No collections" action={<Btn onClick={() => setOpen(true)}>New collection</Btn>} /> : (
        <Card pad={false}>
          <ul className="adm-list">
            {d.collections.map((c, i) => (
              <li key={c.id} draggable onDragStart={() => setFrom(i)} onDragEnd={() => setFrom(null)} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (from != null) move(from, i); setFrom(null); }} style={{ opacity: from === i ? 0.45 : 1 }}>
                <span className="adm-drag" aria-hidden="true"><AIcon name="drag" /></span>
                <Thumb tone={c.tone} src={c.heroImage || undefined} />
                <div>
                  <Link href={`/admin/collections/${c.id}`} className="adm-link">{c.title}</Link>
                  <small>{c.products.length} {c.products.length === 1 ? "product" : "products"}</small>
                </div>
                <Badge tone={c.active ? "green" : "grey"}>{c.active ? "Active" : "Inactive"}</Badge>
                <Toggle checked={c.active} onChange={(v) => { set("collections", (prev) => prev.map((x) => (x.id === c.id ? { ...x, active: v } : x))); log("Collection", c.title, v ? "Activated" : "Deactivated"); }} />
                <button type="button" className="adm-ibtn" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={`Move ${c.title} up`}><AIcon name="arrow-up" /></button>
                <button type="button" className="adm-ibtn" onClick={() => move(i, i + 1)} disabled={i === d.collections.length - 1} aria-label={`Move ${c.title} down`}><AIcon name="arrow-down" /></button>
                <button type="button" className="adm-ibtn" onClick={() => remove(c)} disabled={!can("delete")} title={why("delete")} aria-label={`Delete ${c.title}`}><AIcon name="trash" /></button>
              </li>
            ))}
          </ul>
        </Card>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="New collection" footer={<><Btn variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn><Btn disabled={!title.trim()} onClick={create}>Create</Btn></>}>
        <Field label="Title"><input className="adm-in" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus /></Field>
      </Modal>
    </>
  );
}
