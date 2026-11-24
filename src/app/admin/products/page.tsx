"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import DataTable, { FilterSelect, Toolbar, type Col } from "@/components/admin/DataTable";
import { missingFor } from "@/components/admin/ProductForm";
import { Btn, Field, Modal, PageHeader, StatusBadge, money, productThumb, slugify, uid, useQ } from "@/components/admin/ui";
import { useAdmin } from "@/components/admin/AdminShell";
import { parseCsv } from "@/lib/admin/export";
import { blankProduct, makeSku } from "@/lib/admin/seed";
import { demoCatalogue, isDemo } from "@/lib/admin/demo";
import { availableOf } from "@/lib/admin/stock";
import type { AdminProduct, ProductStatus } from "@/lib/admin/types";
import { categories, type CategorySlug } from "@/lib/products";
import { fmtShort } from "@/lib/orders";

interface ImportRow { cells: Record<string, string>; error?: string }

export default function Products() {
  const { d, set, can, why, log, toast, confirm } = useAdmin();
  const q = useQ();
  const term = q.get("q").toLowerCase();
  const [status, cat, col] = [q.get("status"), q.get("category"), q.get("collection")];
  const [imp, setImp] = useState(false);
  const [text, setText] = useState("");

  const stockOf = (p: AdminProduct) => {
    const r = d.stock.find((s) => s.id === p.id);
    return !r ? 0 : p.stockModel === "made_to_order" ? -1 : availableOf(r);
  };
  const rows = useMemo(
    () => d.products.filter((p) => (!status || p.status === status) && (!cat || p.category === cat) && (!col || p.collection === col) && (!term || `${p.name} ${p.sku}`.toLowerCase().includes(term))),
    [d.products, status, cat, col, term],
  );

  const setStatus = (ids: string[], next: ProductStatus) => {
    if (next === "live") {
      const blocked = ids.map((id) => d.products.find((p) => p.id === id)).filter((p): p is AdminProduct => !!p && missingFor(p).length > 0);
      if (blocked.length) toast(`${blocked.length} could not go live: ${blocked.map((b) => b.name).slice(0, 2).join(", ")}${blocked.length > 2 ? "…" : ""} need images, alt text or details.`, "err");
      ids = ids.filter((id) => !blocked.some((b) => b.id === id));
    }
    if (!ids.length) return;
    set("products", (prev) => prev.map((p) => (ids.includes(p.id) ? { ...p, status: next, updatedAt: new Date().toISOString() } : p)));
    log("Product", `${ids.length} products`, `Set ${next}`);
    toast(`${ids.length} ${ids.length === 1 ? "product" : "products"} set to ${next}`);
  };
  const del = async (ids: string[]) => {
    if (!(await confirm({ title: `Delete ${ids.length} ${ids.length === 1 ? "product" : "products"}?`, body: "This cannot be undone. Past orders keep their own copy.", label: "Delete", danger: true }))) return;
    set("products", (prev) => prev.filter((p) => !ids.includes(p.id)));
    set("stock", (prev) => prev.filter((s) => !ids.includes(s.id)));
    log("Product", `${ids.length} products`, "Deleted");
    toast("Deleted");
  };
  const hasDemo = d.products.some((p) => isDemo(p.id));
  const loadDemo = () => {
    const { products: dp, stock: ds } = demoCatalogue();
    const have = new Set(d.products.map((p) => p.id));
    const add = dp.filter((p) => !have.has(p.id));
    const addStock = ds.filter((r) => add.some((p) => p.id === r.id));
    if (!add.length) return toast("The demo products are already loaded");
    if (!set("products", (prev) => [...add, ...prev])) return toast("Not enough browser storage for the demo products. Delete some large images and try again.", "err");
    set("stock", (prev) => [...prev, ...addStock]);
    set("collections", (prev) => prev.map((c) => ({ ...c, products: [...c.products, ...add.filter((p) => p.collection === c.id).map((p) => p.id)] })));
    log("Product", `${add.length} demo products`, "Loaded demo catalogue");
    toast(`${add.length} demo products added and live on the store`);
  };
  const removeDemo = async () => {
    if (!(await confirm({ title: "Remove the demo products?", body: "Only the demo products are removed. Your own products stay as they are.", label: "Remove", danger: true }))) return;
    set("products", (prev) => prev.filter((p) => !isDemo(p.id)));
    set("stock", (prev) => prev.filter((r) => !isDemo(r.id)));
    set("collections", (prev) => prev.map((c) => ({ ...c, products: c.products.filter((id) => !isDemo(id)) })));
    log("Product", "Demo products", "Removed");
    toast("Demo products removed");
  };
  const duplicate = (p: AdminProduct) => {
    const copy: AdminProduct = { ...p, id: uid("prd"), name: `${p.name} (copy)`, slug: `${p.slug}-copy-${Date.now().toString(36).slice(-3)}`, sku: `${p.sku}-C`, status: "draft", updatedAt: new Date().toISOString() };
    set("products", (prev) => [copy, ...prev]);
    set("stock", (prev) => [...prev, { id: copy.id, onHand: 0, reserved: 0, reorder: 0, sizes: copy.sizes.length ? Object.fromEntries(copy.sizes.map((s) => [s, 0])) : undefined }]);
    log("Product", copy.name, "Duplicated");
    toast("Duplicated as a draft");
  };

  /* CSV import with a preview before anything is saved */
  const parsed = useMemo<ImportRow[]>(() => {
    if (!text.trim()) return [];
    const [head, ...body] = parseCsv(text);
    if (!head) return [];
    const keys = head.map((h) => h.trim().toLowerCase());
    return body.map((r) => {
      const cells: Record<string, string> = {};
      keys.forEach((k, i) => (cells[k] = (r[i] ?? "").trim()));
      let error: string | undefined;
      if (!cells.name) error = "Missing name";
      else if (!(Number(cells.price) > 0)) error = "Price must be a number above 0";
      else if (cells.category && !categories.some((c) => c.slug === cells.category)) error = "Category must be sarees, kurtis or gift-craft";
      return { cells, error };
    });
  }, [text]);
  const good = parsed.filter((r) => !r.error);
  const runImport = () => {
    const made = good.map((r, i): AdminProduct => {
      const c = r.cells;
      const category = (c.category || "sarees") as CategorySlug;
      return { ...blankProduct(), id: uid("prd"), name: c.name, slug: slugify(c.name) + "-" + Date.now().toString(36).slice(-3), shortLine: c.shortline ?? "", description: c.description ?? "", category, collection: c.collection ?? "", price: Number(c.price), mrp: Number(c.mrp) > 0 ? Number(c.mrp) : "", sku: c.sku || makeSku(c.name, d.products.length + i + 1), status: "draft", sizes: category === "kurtis" ? ["S", "M", "L", "XL", "XXL", "XXXL"] : [] };
    });
    set("products", (prev) => [...made, ...prev]);
    set("stock", (prev) => [...prev, ...made.map((m) => ({ id: m.id, onHand: 0, reserved: 0, reorder: 0, sizes: m.sizes.length ? Object.fromEntries(m.sizes.map((s) => [s, 0])) : undefined }))]);
    log("Product", `${made.length} products`, "CSV import");
    toast(`${made.length} products imported as drafts`);
    setImp(false);
    setText("");
  };

  const cols: Col<AdminProduct>[] = [
    { key: "name", label: "Product", sort: (p) => p.name, csv: (p) => p.name, render: (p) => (<div className="adm-cell-main">{productThumb(p)}<div><Link href={`/admin/products/${p.id}`} className="adm-link">{p.name}</Link><small>{p.sku}</small></div></div>) },
    { key: "cat", label: "Category", sort: (p) => p.category, hideOnMobile: true, render: (p) => categories.find((c) => c.slug === p.category)?.label },
    { key: "col", label: "Collection", sort: (p) => p.collection, hideOnMobile: true, csv: (p) => p.collection, render: (p) => d.collections.find((c) => c.id === p.collection)?.title ?? "None" },
    { key: "price", label: "Price", sort: (p) => p.price, className: "r", render: (p) => money(p.price) },
    { key: "stock", label: "Available", sort: stockOf, className: "r", csv: stockOf, render: (p) => (stockOf(p) < 0 ? "Made to order" : stockOf(p)) },
    { key: "status", label: "Status", sort: (p) => p.status, render: (p) => <StatusBadge s={p.status} /> },
    { key: "upd", label: "Updated", sort: (p) => p.updatedAt, hideOnMobile: true, csv: (p) => p.updatedAt, render: (p) => fmtShort(p.updatedAt) },
    { key: "act", label: "", csv: () => "", render: (p) => (<div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}><Btn size="sm" variant="ghost" icon="copy" onClick={() => duplicate(p)}>Duplicate</Btn><Btn size="sm" variant="danger" icon="trash" disabled={!can("delete")} title={why("delete")} onClick={() => del([p.id])}>Delete</Btn></div>) },
  ];

  return (
    <>
      <PageHeader title="Products" sub="Everything you sell. Drafts stay off the store until published." actions={<>{hasDemo ? <Btn variant="ghost" icon="trash" onClick={removeDemo}>Remove demo products</Btn> : <Btn variant="ghost" icon="plus" onClick={loadDemo}>Load demo catalogue</Btn>}<Btn variant="ghost" icon="upload" onClick={() => setImp(true)}>Import CSV</Btn><Btn href="/admin/products/new" icon="plus">New product</Btn></>} />
      <Toolbar placeholder="Search title or SKU">
        <FilterSelect param="status" label="All statuses" options={[{ value: "live", label: "Live" }, { value: "draft", label: "Draft" }, { value: "archived", label: "Archived" }]} />
        <FilterSelect param="category" label="All categories" options={categories.map((c) => ({ value: c.slug, label: c.label }))} />
        <FilterSelect param="collection" label="All collections" options={d.collections.map((c) => ({ value: c.id, label: c.title }))} />
      </Toolbar>
      <DataTable
        rows={rows}
        cols={cols}
        rowKey={(p) => p.id}
        href={(p) => `/admin/products/${p.id}`}
        exportName="products"
        defaultSort={{ key: "upd", dir: "desc" }}
        bulk={[
          { label: "Publish", run: (ids) => setStatus(ids, "live") },
          { label: "Unpublish", run: (ids) => setStatus(ids, "draft") },
          { label: "Archive", run: (ids) => setStatus(ids, "archived") },
          ...(can("delete") ? [{ label: "Delete", danger: true, run: del }] : []),
        ]}
        emptyTitle="No products match"
        emptyAction={<Btn href="/admin/products/new" icon="plus">New product</Btn>}
      />
      <Modal open={imp} onClose={() => setImp(false)} wide title="Import products from CSV" footer={<><Btn variant="ghost" onClick={() => setImp(false)}>Cancel</Btn><Btn disabled={good.length === 0} onClick={runImport}>Import {good.length || ""} {good.length === 1 ? "row" : "rows"}</Btn></>}>
        <p className="adm-sub" style={{ marginBottom: 12 }}>Columns: <span className="adm-mono">name, price, category, mrp, sku, collection, shortline, description</span>. Name and price are required. Imported products start as drafts.</p>
        <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <label className="adm-btn adm-btn--ghost adm-btn--sm" style={{ cursor: "pointer" }}>
            Choose a CSV file
            <input type="file" accept=".csv,text/csv" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) setText(await f.text()); }} />
          </label>
          <Btn size="sm" variant="ghost" onClick={() => setText("name,price,category,mrp,collection\nKanjivaram Temple Border Saree,52000,sarees,60000,kanjivaram\nHandwoven Silk Kurti in Plum,1900,kurtis,2400,\nBroken row,abc,sarees,,")}>Use a sample</Btn>
        </div>
        <Field label="Or paste CSV"><textarea className="adm-in adm-mono" value={text} onChange={(e) => setText(e.target.value)} style={{ minHeight: 110 }} /></Field>
        {parsed.length > 0 && (
          <div className="adm-tbl-wrap" style={{ marginTop: 14, border: "1px solid var(--line)", borderRadius: 4 }}>
            <table className="adm-table"><thead><tr><th>Name</th><th>Price</th><th>Category</th><th>Check</th></tr></thead>
              <tbody>{parsed.slice(0, 8).map((r, i) => <tr key={i}><td data-label="Name">{r.cells.name || "—"}</td><td data-label="Price">{r.cells.price}</td><td data-label="Category">{r.cells.category || "sarees"}</td><td data-label="Check">{r.error ? <span style={{ color: "#9b1c1c" }}>{r.error}</span> : <span style={{ color: "#1f6b3a" }}>Ready</span>}</td></tr>)}</tbody>
            </table>
          </div>
        )}
        {parsed.length > 8 && <p className="adm-hint" style={{ marginTop: 6 }}>Showing the first 8 of {parsed.length} rows.</p>}
      </Modal>
    </>
  );
}