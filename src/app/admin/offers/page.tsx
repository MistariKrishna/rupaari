"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge, Btn, Card, Field, PageHeader, Toggle, money, toNum } from "@/components/admin/ui";
import DataTable, { type Col } from "@/components/admin/DataTable";
import { useAdmin } from "@/components/admin/AdminShell";
import type { Coupon } from "@/lib/admin/types";

const describe = (c: Pick<Coupon, "type" | "value" | "minBag" | "maxDiscount">) => {
  const min = c.minBag ? ` over ${money(Number(c.minBag))}` : "";
  if (c.type === "free_shipping") return `Free shipping on bags${min || " of any size"}`;
  const what = c.type === "percent" ? `${c.value}% off` : `${money(c.value)} off`;
  return `${what} bags${min}${c.type === "percent" && c.maxDiscount ? `, up to ${money(Number(c.maxDiscount))}` : ""}`;
};
const state = (c: Coupon) => {
  const t = new Date().toISOString().slice(0, 10);
  return !c.active ? "Inactive" : c.endsAt < t ? "Expired" : c.startsAt > t ? "Scheduled" : "Active";
};

export default function Offers() {
  const { d, set, log, toast } = useAdmin();
  const [free, setFree] = useState(String(d.settings.freeShipFrom));
  const [gift, setGift] = useState(String(d.settings.giftWrapPrice));

  const saveRules = () => {
    set("settings", (s) => ({ ...s, freeShipFrom: Number(toNum(free)) || 0, giftWrapPrice: Number(toNum(gift)) || 0 }));
    log("Offers", "Rules", "Updated free shipping and gift wrap");
    toast("Rules saved");
  };
  const cols: Col<Coupon>[] = [
    { key: "code", label: "Code", sort: (c) => c.code, csv: (c) => c.code, render: (c) => <div><Link href={`/admin/offers/coupons/${c.id}`} className="adm-link adm-mono">{c.code}</Link><small>{describe(c)}</small></div> },
    { key: "type", label: "Type", sort: (c) => c.type, hideOnMobile: true, render: (c) => ({ percent: "Percent", flat: "Flat amount", free_shipping: "Free shipping" })[c.type] },
    { key: "dates", label: "Runs", hideOnMobile: true, csv: (c) => `${c.startsAt} to ${c.endsAt}`, render: (c) => `${c.startsAt} to ${c.endsAt}` },
    { key: "used", label: "Used", sort: (c) => c.used, className: "r", render: (c) => `${c.used}${c.usageLimit ? ` / ${c.usageLimit}` : ""}` },
    { key: "st", label: "State", sort: state, render: (c) => <Badge tone={state(c) === "Active" ? "green" : state(c) === "Scheduled" ? "blue" : state(c) === "Expired" ? "red" : "grey"}>{state(c)}</Badge> },
    { key: "on", label: "On", csv: () => "", render: (c) => <Toggle checked={c.active} onChange={(v) => { set("coupons", (p) => p.map((x) => (x.id === c.id ? { ...x, active: v } : x))); log("Coupon", c.code, v ? "Activated" : "Deactivated"); }} /> },
  ];
  return (
    <>
      <PageHeader title="Offers" sub="Coupons, free shipping and gift wrap." actions={<Btn href="/admin/offers/coupons/new" icon="plus">New coupon</Btn>} />
      <div className="adm-cols">
        <div>
          <h2 className="adm-card-t" style={{ marginBottom: 10 }}>Coupons</h2>
          <DataTable rows={d.coupons} cols={cols} rowKey={(c) => c.id} href={(c) => `/admin/offers/coupons/${c.id}`} exportName="coupons" emptyTitle="No coupons yet" emptyAction={<Btn href="/admin/offers/coupons/new">New coupon</Btn>} />
        </div>
        <div>
          <Card title="Shipping and gift wrap">
            <div style={{ display: "grid", gap: 14 }}>
              <Field label="Free shipping from (₹)" hint="Bag value that earns free shipping. 0 turns it off."><input className="adm-in" type="number" min={0} value={free} onChange={(e) => setFree(e.target.value)} /></Field>
              <Field label="Gift wrap price (₹)"><input className="adm-in" type="number" min={0} value={gift} onChange={(e) => setGift(e.target.value)} /></Field>
              <div><Btn onClick={saveRules}>Save rules</Btn></div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
