"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { RETURN_REASONS, itemMeta, returnState, sameItem } from "@/lib/orders";
import { money } from "@/lib/products";
import Crumbs from "./Crumbs";
import { Icon } from "./Icon";
import { AddressBlock, Thumb } from "./OrderParts";
import { useOrders } from "./useOrders";

type Photo = { name: string; url: string };
const MAX = 4;

export default function ReturnRequest({ id }: { id: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const itemId = sp.get("item");
  const sizeParam = sp.get("size") ?? undefined;
  const { orders, ready, update } = useOrders();
  const o = orders.find((x) => x.id === id);
  const it = o?.items.find((i) => sameItem(i, { id: itemId ?? "", size: sizeParam })) ?? (o?.items.length === 1 ? o.items[0] : undefined);

  const [reason, setReason] = useState(RETURN_REASONS[0]);
  const [details, setDetails] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [err, setErr] = useState("");
  const file = useRef<HTMLInputElement>(null);
  useEffect(() => () => photos.forEach((p) => URL.revokeObjectURL(p.url)), []); // eslint-disable-line react-hooks/exhaustive-deps

  const crumbs = [{ label: "Home", href: "/" }, { label: "Account", href: "/account" }, { label: "My orders", href: "/account/orders" }, { label: `#${id}`, href: `/account/orders/${id}` }, { label: "Request a return" }];
  if (!ready) return <div className="rp-page" />;
  if (!o || !it || returnState(o, it) !== "eligible") {
    return (
      <div className="rp-page"><div className="rp-wrap">
        <Crumbs items={crumbs} />
        <div className="rp-empty">
          <h2>Return unavailable</h2>
          <p>This item can’t be returned right now. You can see the details on your order page.</p>
          <Link href={`/account/orders/${id}`} className="btn">Back to order</Link>
        </div>
      </div></div>
    );
  }

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    setErr("");
    const next = [...photos];
    for (const f of Array.from(list)) {
      if (!f.type.startsWith("image/")) { setErr("Please choose image files only."); continue; }
      if (f.size > 8 * 1024 * 1024) { setErr(`${f.name} is larger than 8 MB.`); continue; }
      if (next.length >= MAX) { setErr(`You can add up to ${MAX} photos.`); break; }
      next.push({ name: f.name, url: URL.createObjectURL(f) });
    }
    setPhotos(next);
    if (file.current) file.current.value = "";
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    update(o.id, (x) => ({
      ...x,
      items: x.items.map((y) => (sameItem(y, it) ? { ...y, return: { status: "requested", reason, details: details.trim(), photos: photos.map((p) => p.name), requestedAt: new Date().toISOString() } } : y)),
    }));
    router.push(`/account/orders/${o.id}`);
  };

  return (
    <div className="rp-page">
      <div className="rp-wrap">
        <Crumbs items={crumbs} />
        <header className="od-top">
          <h1 className="rp-title">Request a Return</h1>
          <p className="od-lead">Order #{o.id} · Delivered</p>
        </header>
        <div className="od-grid rt-grid">
          <form onSubmit={submit} className="rt-form">
            <div className="rp-field">
              <label htmlFor="rt-reason">Reason for return</label>
              <div className="rp-select">
                <select id="rt-reason" value={reason} onChange={(e) => setReason(e.target.value)}>{RETURN_REASONS.map((r) => <option key={r}>{r}</option>)}</select>
                <Icon name="chevron-down" />
              </div>
            </div>
            <div className="rp-field">
              <label htmlFor="rt-details">Additional details</label>
              <textarea id="rt-details" rows={3} maxLength={600} value={details} onChange={(e) => setDetails(e.target.value)} />
            </div>
            <div className="rp-field">
              <span className="rp-lbl">Photos</span>
              {photos.map((p) => (
                <div className="rt-photo" key={p.url}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt="" />
                  <div><p>{p.name}</p><button type="button" className="rp-link" onClick={() => { URL.revokeObjectURL(p.url); setPhotos(photos.filter((x) => x !== p)); }}>Remove</button></div>
                </div>
              ))}
              <input ref={file} type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.target.files)} />
              <button type="button" className="btn btn-secondary rt-add" onClick={() => file.current?.click()} disabled={photos.length >= MAX}>Add photos</button>
              {err && <p className="rp-err" role="alert"><Icon name="warning" />{err}</p>}
            </div>
            <p className="rt-note">We’ll review your request before arranging a pickup.</p>
            <button type="submit" className="btn w-full">Submit return request</button>
          </form>

          <aside className="rp-card rt-side" aria-label="Return summary">
            <h2 className="rp-h2">Item to return</h2>
            <div className="rt-item">
              <Thumb it={it} size={145} />
              <div>
                <h3>{it.name}</h3>
                <p>{itemMeta(it)}</p>
                <p className="rt-price"><span>Item price</span><b>{money(it.price * it.qty)}</b></p>
              </div>
            </div>
            <div className="rt-addr">
              <div className="rt-addr-h"><h2 className="rp-h2">Pickup address</h2><Link href="/contact" className="rp-link">Change</Link></div>
              <AddressBlock o={o} />
            </div>
            <Link href="/contact" className="rp-link rt-pol">Return policy</Link>
          </aside>
        </div>
      </div>
    </div>
  );
}