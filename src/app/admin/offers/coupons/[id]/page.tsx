"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Btn, Card, Empty, Field, PageHeader, Toggle, money, toNum, uid } from "@/components/admin/ui";
import { useAdmin } from "@/components/admin/AdminShell";
import { blankCoupon } from "@/lib/admin/seed";
import type { Coupon } from "@/lib/admin/types";

const say = (c: Coupon) => {
  const min = c.minBag ? ` over ${money(Number(c.minBag))}` : "";
  if (c.type === "free_shipping") return `Free shipping on bags${min || " of any size"}`;
  const what = c.type === "percent" ? `${c.value}% off` : `${money(c.value)} off`;
  return `${what} bags${min}${c.type === "percent" && c.maxDiscount ? `, up to ${money(Number(c.maxDiscount))}` : ""}`;
};

export default function CouponPage() {
  const { id } = useParams<{ id: string }>();
  const { d, set, can, why, log, toast, confirm } = useAdmin();
  const router = useRouter();
  const found = id === "new" ? undefined : d.coupons.find((c) => c.id === id);
  const [c, setC] = useState<Coupon>(() => found ?? { ...blankCoupon(), id: uid("cp") });
  const [err, setErr] = useState("");
  if (id !== "new" && !found) return <Empty title="Coupon not found" action={<Btn href="/admin/offers" variant="ghost">Back to offers</Btn>} />;
  const up = <K extends keyof Coupon>(k: K, v: Coupon[K]) => setC((x) => ({ ...x, [k]: v }));

  const save = () => {
    const code = c.code.trim().toUpperCase().replace(/\s+/g, "");
    if (!code) return setErr("Enter a code.");
    if (d.coupons.some((x) => x.id !== c.id && x.code === code)) return setErr("That code already exists.");
    if (c.type !== "free_shipping" && !(c.value > 0)) return setErr("Enter the discount value.");
    if (c.type === "percent" && c.value > 100) return setErr("A percentage cannot be above 100.");
    if (c.endsAt < c.startsAt) return setErr("The end date is before the start date.");
    const next = { ...c, code };
    set("coupons", (p) => (p.some((x) => x.id === next.id) ? p.map((x) => (x.id === next.id ? next : x)) : [next, ...p]));
    log("Coupon", code, found ? "Updated" : "Created");
    toast("Coupon saved");
    router.push("/admin/offers");
  };
  const remove = async () => {
    if (!(await confirm({ title: `Delete ${c.code}?`, label: "Delete", danger: true }))) return;
    set("coupons", (p) => p.filter((x) => x.id !== c.id));
    log("Coupon", c.code, "Deleted");
    router.replace("/admin/offers");
  };

  return (
    <>
      <PageHeader back={{ href: "/admin/offers", label: "Offers" }} title={found ? c.code : "New coupon"} actions={found && <Btn variant="danger" icon="trash" disabled={!can("delete")} title={why("delete")} onClick={remove}>Delete</Btn>} />
      {err && <div className="adm-alert adm-alert--red" role="alert">{err}</div>}
      <div className="adm-cols">
        <Card title="Coupon">
          <div className="adm-form">
            <Field label="Code"><input className="adm-in adm-mono" value={c.code} onChange={(e) => up("code", e.target.value.toUpperCase())} /></Field>
            <Field label="Type"><select className="adm-in" value={c.type} onChange={(e) => up("type", e.target.value as Coupon["type"])}><option value="percent">Percent off</option><option value="flat">Flat amount off</option><option value="free_shipping">Free shipping</option></select></Field>
            {c.type !== "free_shipping" && <Field label={c.type === "percent" ? "Percent (%)" : "Amount (₹)"}><input className="adm-in" type="number" min={0} value={c.value || ""} onChange={(e) => up("value", Number(toNum(e.target.value)) || 0)} /></Field>}
            <Field label="Minimum bag (₹)"><input className="adm-in" type="number" min={0} value={c.minBag} onChange={(e) => up("minBag", toNum(e.target.value))} /></Field>
            {c.type === "percent" && <Field label="Maximum discount (₹)"><input className="adm-in" type="number" min={0} value={c.maxDiscount} onChange={(e) => up("maxDiscount", toNum(e.target.value))} /></Field>}
            <Field label="Starts"><input className="adm-in" type="date" value={c.startsAt} onChange={(e) => up("startsAt", e.target.value)} /></Field>
            <Field label="Ends"><input className="adm-in" type="date" value={c.endsAt} onChange={(e) => up("endsAt", e.target.value)} /></Field>
            <Field label="Total uses allowed"><input className="adm-in" type="number" min={0} value={c.usageLimit} onChange={(e) => up("usageLimit", toNum(e.target.value))} /></Field>
            <Field label="Uses per customer"><input className="adm-in" type="number" min={0} value={c.perCustomerLimit} onChange={(e) => up("perCustomerLimit", toNum(e.target.value))} /></Field>
          </div>
          <div style={{ marginTop: 16 }}><Toggle checked={c.active} onChange={(v) => up("active", v)} label="Active" /></div>
        </Card>
        <div>
          <Card title="How customers see it">
            <p className="adm-mono" style={{ fontSize: 16, letterSpacing: "0.08em" }}>{c.code || "CODE"}</p>
            <p className="adm-sub" style={{ marginTop: 6 }}>{say(c)}</p>
            <p className="adm-hint" style={{ marginTop: 10 }}>Valid {c.startsAt} to {c.endsAt}. Used {c.used} times.</p>
          </Card>
          <div><Btn onClick={save}>Save coupon</Btn></div>
        </div>
      </div>
    </>
  );
}
