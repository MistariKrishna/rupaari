"use client";

import { useMemo } from "react";
import { BarList, LineChart } from "@/components/admin/Charts";
import { Btn, Card, PageHeader, Stat, Tabs, money, useQ } from "@/components/admin/ui";
import { useAdmin } from "@/components/admin/AdminShell";
import { downloadCsv, downloadXls } from "@/lib/admin/export";
import { gstOf, itemCount, payStatus, statusOf } from "@/lib/admin/orders";
import { fmtShort } from "@/lib/orders";

type Range = "7" | "30" | "90" | "month" | "custom";
const DAY = 86_400_000;
const MAX_DAYS = 366;
const dayKey = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
const startOf = (s: string) => new Date(`${s}T00:00:00+05:30`).getTime();
const endOf = (s: string) => new Date(`${s}T23:59:59.999+05:30`).getTime();
const niceDate = (s: string) => new Date(startOf(s)).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

export default function Reports() {
  const { d } = useAdmin();
  const q = useQ();
  const range = (q.get("range", "30") as Range);
  const today = dayKey(new Date().toISOString());
  const rawFrom = q.get("from", dayKey(new Date(Date.now() - 29 * DAY).toISOString()));
  const rawTo = q.get("to", today);
  const validDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(startOf(s));
  const okFrom = validDate(rawFrom) ? rawFrom : dayKey(new Date(Date.now() - 29 * DAY).toISOString());
  const okTo = validDate(rawTo) ? rawTo : today;
  const [from, to] = okFrom <= okTo ? [okFrom, okTo] : [okTo, okFrom];

  const r = useMemo(() => {
    const now = new Date();
    const custom = range === "custom";
    const start = custom ? startOf(from) : range === "month" ? new Date(now.getFullYear(), now.getMonth(), 1).getTime() : Date.now() - Number(range) * DAY;
    const end = custom ? endOf(to) : Infinity;
    const inRange = d.orders.filter((o) => { const t = new Date(o.placedAt).getTime(); return t >= start && t <= end; });
    const live = inRange.filter((o) => !d.meta[o.id]?.cancelled);
    const revenue = live.reduce((a, o) => a + o.total, 0);
    const units = live.reduce((a, o) => a + itemCount(o), 0);

    const dayCount = custom ? Math.min(Math.round((startOf(to) - startOf(from)) / DAY) + 1, MAX_DAYS) : Math.min(range === "month" ? now.getDate() : Number(range), 90);
    const days = Array.from({ length: dayCount }, (_, i) => {
      const dt = custom ? new Date(startOf(from) + i * DAY) : new Date(Date.now() - (dayCount - 1 - i) * DAY);
      return { key: dayKey(dt.toISOString()), label: dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }), value: 0, orders: 0, units: 0 };
    });
    live.forEach((o) => { const x = days.find((k) => k.key === dayKey(o.placedAt)); if (x) { x.value += o.total; x.orders += 1; x.units += itemCount(o); } });

    const group = (f: (o: (typeof live)[number], it: (typeof live)[number]["items"][number]) => string) => {
      const m = new Map<string, number>();
      live.forEach((o) => o.items.forEach((it) => m.set(f(o, it), (m.get(f(o, it)) ?? 0) + it.price * it.qty)));
      return [...m.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
    };
    const byCollection = group((_, it) => {
      const p = d.products.find((x) => x.id === it.id);
      return d.collections.find((c) => c.id === p?.collection)?.title ?? (p?.category === "kurtis" ? "Kurtis" : p?.category === "gift-craft" ? "Gifting" : "Other");
    });
    const byCountry = group((o) => o.address.country);
    const byCity = group((o) => `${o.address.city}, ${o.address.country}`).slice(0, 8);

    const reasons = new Map<string, number>();
    let refunded = 0, returnsN = 0;
    inRange.forEach((o) => o.items.forEach((it) => { if (it.return) { returnsN++; reasons.set(it.return.reason, (reasons.get(it.return.reason) ?? 0) + 1); if (it.return.status === "refunded") refunded += it.price * it.qty; } }));
    const returnReasons = [...reasons.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);

    const rates = new Map<number, { taxable: number; gst: number }>();
    live.forEach((o) => {
      const rate = 5;
      const g = gstOf(o, rate);
      const cur = rates.get(rate) ?? { taxable: 0, gst: 0 };
      cur.gst += g; cur.taxable += o.total - g;
      rates.set(rate, cur);
    });
    const cod = inRange.filter((o) => o.payment === "cod" && !d.meta[o.id]?.cancelled);
    const codCollected = cod.filter((o) => o.stage === 4).reduce((a, o) => a + o.total, 0);
    const codPending = cod.filter((o) => o.stage < 4).reduce((a, o) => a + o.total, 0);
    return { inRange, live, revenue, units, days, byCollection, byCountry, byCity, returnReasons, refunded, returnsN, rates, codCollected, codPending, codN: cod.length };
  }, [d, range, from, to]);

  const salesRows = () => [
    ["Order", "Date", "Customer", "Email", "Country", "Items", "Subtotal", "Shipping", "GST (5% incl.)", "Total", "Payment", "Status"],
    ...r.inRange.map((o) => [o.id, fmtShort(o.placedAt), o.address.name, o.contact, o.address.country, itemCount(o), o.subtotal, o.shipping, gstOf(o), o.total, payStatus(o, d.meta[o.id]), statusOf(o, d.meta[o.id])]),
  ];
  const gstRows = () => [["Rate %", "Taxable value", "GST"], ...[...r.rates.entries()].map(([k, v]) => [k, v.taxable, v.gst])];
  const aov = r.live.length ? r.revenue / r.live.length : 0;
  const label = range === "custom" ? `${niceDate(from)} to ${niceDate(to)}` : range === "month" ? "this month" : `last ${range} days`;
  const tag = range === "custom" ? `${from}_to_${to}` : range;
  const tooLong = range === "custom" && Math.round((startOf(to) - startOf(from)) / DAY) + 1 > MAX_DAYS;
  const bestDay = r.days.reduce((b, x) => (x.value > b.value ? x : b), { key: "", label: "", value: 0, orders: 0, units: 0 });
  const dailyRows = () => [["Date", "Orders", "Units", "Sales"], ...r.days.map((x) => [x.key, x.orders, x.units, x.value]), ["Total", r.live.length, r.units, r.revenue]];

  return (
    <>
      <PageHeader
        title="Reports"
        sub={`Figures for ${label}, from the orders on this device.`}
        actions={<><Btn variant="ghost" icon="download" onClick={() => downloadCsv(`sales-${tag}`, salesRows())}>Sales CSV</Btn><Btn variant="ghost" icon="download" onClick={() => downloadXls(`sales-${tag}`, salesRows())}>Excel</Btn></>}
      />
      <Tabs<Range> tabs={[{ id: "7", label: "7 days" }, { id: "30", label: "30 days" }, { id: "90", label: "90 days" }, { id: "month", label: "This month" }, { id: "custom", label: "Custom dates" }]} value={range} onChange={(v) => q.set({ range: v, ...(v === "custom" ? { from, to } : {}) })} />
      {range === "custom" && (
        <div className="adm-toolbar" style={{ marginTop: 14 }}>
          <label className="adm-field" style={{ maxWidth: 190 }}>
            <span className="adm-label">From</span>
            <input className="adm-in" type="date" value={from} max={to} onChange={(e) => e.target.value && q.set({ range: "custom", from: e.target.value, to })} />
          </label>
          <label className="adm-field" style={{ maxWidth: 190 }}>
            <span className="adm-label">To</span>
            <input className="adm-in" type="date" value={to} min={from} max={today} onChange={(e) => e.target.value && q.set({ range: "custom", from, to: e.target.value })} />
          </label>
          <Btn variant="ghost" size="sm" onClick={() => q.set({ range: "custom", from: dayKey(new Date(Date.now() - 6 * DAY).toISOString()), to: today })}>Last 7 days</Btn>
          <Btn variant="ghost" size="sm" onClick={() => q.set({ range: "custom", from: `${today.slice(0, 8)}01`, to: today })}>This month</Btn>
          <Btn variant="ghost" size="sm" onClick={() => q.set({ range: "custom", from: `${today.slice(0, 4)}-01-01`, to: today })}>This year</Btn>
        </div>
      )}
      {tooLong && <p className="adm-hint" style={{ marginBottom: 10 }}>The chart and daily table show the first {MAX_DAYS} days. The totals and the Sales CSV and Excel cover the whole range.</p>}
      <div className="adm-stats">
        <Stat label="Revenue" value={money(r.revenue)} icon="chart" sub="Excludes cancelled" />
        <Stat label="Orders" value={r.live.length} icon="orders" tone="blue" sub={`${r.inRange.length - r.live.length} cancelled`} />
        <Stat label="Average order" value={money(aov)} icon="tag" tone="gold" />
        <Stat label="Units sold" value={r.units} icon="box" tone="green" />
        <Stat label="Refunded" value={money(r.refunded)} icon="return" tone="red" sub={`${r.returnsN} return requests`} />
      </div>
      <Card title="Sales by day" actions={<Btn size="sm" variant="ghost" icon="download" onClick={() => downloadCsv(`sales-by-day-${tag}`, [["Date", "Sales"], ...r.days.map((x) => [x.key, x.value])])}>CSV</Btn>}>
        <LineChart points={r.days} fmt={money} />
      </Card>
      {range === "custom" && (
        <Card title="Daily sales" actions={<Btn size="sm" variant="ghost" icon="download" onClick={() => downloadCsv(`daily-sales-${tag}`, dailyRows())}>CSV</Btn>} pad={false}>
          <div className="adm-tbl-wrap" style={{ maxHeight: 420, overflow: "auto" }}>
            <table className="adm-table">
              <thead><tr><th>Date</th><th className="r">Orders</th><th className="r">Units</th><th className="r">Sales</th></tr></thead>
              <tbody>
                {r.days.map((x) => <tr key={x.key}><td data-label="Date">{x.label}</td><td className="r" data-label="Orders">{x.orders}</td><td className="r" data-label="Units">{x.units}</td><td className="r" data-label="Sales">{money(x.value)}</td></tr>)}
                <tr><td><strong>Total</strong></td><td className="r"><strong>{r.live.length}</strong></td><td className="r"><strong>{r.units}</strong></td><td className="r"><strong>{money(r.revenue)}</strong></td></tr>
              </tbody>
            </table>
          </div>
          <p className="adm-hint adm-card-b">{bestDay.value > 0 ? `Best day: ${bestDay.label}, ${money(bestDay.value)} from ${bestDay.orders} order${bestDay.orders === 1 ? "" : "s"}.` : "No sales on these dates."}</p>
        </Card>
      )}
      <div className="adm-g2" style={{ marginTop: 16 }}>
        <Card title="By collection" actions={<Btn size="sm" variant="ghost" icon="download" onClick={() => downloadCsv("sales-by-collection", [["Collection", "Sales"], ...r.byCollection.map((x) => [x.label, x.value])])}>CSV</Btn>}><BarList items={r.byCollection} fmt={money} /></Card>
        <Card title="By country" actions={<Btn size="sm" variant="ghost" icon="download" onClick={() => downloadCsv("sales-by-country", [["Country", "Sales"], ...r.byCountry.map((x) => [x.label, x.value])])}>CSV</Btn>}><BarList items={r.byCountry} fmt={money} /></Card>
        <Card title="Top cities"><BarList items={r.byCity} fmt={money} /></Card>
        <Card title="Return reasons"><BarList items={r.returnReasons} empty="No returns in this period" /></Card>
      </div>
      <div className="adm-g2" style={{ marginTop: 16 }}>
        <Card title="GST summary" actions={<Btn size="sm" variant="ghost" icon="download" onClick={() => downloadCsv("gst-summary", gstRows())}>CSV</Btn>} pad={false}>
          <div className="adm-tbl-wrap"><table className="adm-table"><thead><tr><th>Rate</th><th className="r">Taxable value</th><th className="r">GST</th></tr></thead>
            <tbody>{[...r.rates.entries()].map(([k, v]) => <tr key={k}><td data-label="Rate">{k}%</td><td className="r" data-label="Taxable">{money(v.taxable)}</td><td className="r" data-label="GST">{money(v.gst)}</td></tr>)}
              {r.rates.size === 0 && <tr><td colSpan={3}>No sales in this period.</td></tr>}</tbody></table></div>
          <p className="adm-hint adm-card-b">GST is taken as 5% included in the price, the rate on the products. Confirm rates with your accountant.</p>
        </Card>
        <Card title="Cash on delivery">
          <dl className="adm-kv">
            <div><dt>COD orders</dt><dd>{r.codN}</dd></div>
            <div><dt>Collected by courier (delivered)</dt><dd>{money(r.codCollected)}</dd></div>
            <div><dt>Waiting for delivery</dt><dd>{money(r.codPending)}</dd></div>
          </dl>
          <p className="adm-hint" style={{ marginTop: 10 }}>Matching these to the courier&apos;s weekly remittance statement needs the courier integration.</p>
        </Card>
      </div>
    </>
  );
}
