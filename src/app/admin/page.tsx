"use client";

import Link from "next/link";
import { useMemo } from "react";
import { BarList, LineChart } from "@/components/admin/Charts";
import { Card, PageHeader, Stat, StatusBadge, Thumb, money } from "@/components/admin/ui";
import { useAdmin } from "@/components/admin/AdminShell";
import { itemCount, statusOf } from "@/lib/admin/orders";
import { needsAttention, stockState } from "@/lib/admin/stock";
import { fmtShort } from "@/lib/orders";

const dayKey = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

export default function Dashboard() {
  const { d, role, session } = useAdmin();
  const x = useMemo(() => {
    const live = d.orders.filter((o) => !d.meta[o.id]?.cancelled);
    const today = dayKey(new Date().toISOString());
    const todaySales = live.filter((o) => dayKey(o.placedAt) === today).reduce((a, o) => a + o.total, 0);
    const toPack = d.orders.filter((o) => o.stage === 0 && !d.meta[o.id]?.cancelled);
    const transit = d.orders.filter((o) => (o.stage === 2 || o.stage === 3) && !d.meta[o.id]?.cancelled);
    const returns = d.orders.flatMap((o) => o.items.filter((i) => i.return && i.return.status !== "refunded").map((i) => ({ o, i })));
    const low = d.stock.map((r) => ({ r, p: d.products.find((p) => p.id === r.id) })).filter(({ r, p }) => needsAttention(r, p));
    const cancelled = d.orders.filter((o) => d.meta[o.id]?.cancelled && Date.now() - new Date(o.placedAt).getTime() < 30 * 86_400_000).length;
    const days = Array.from({ length: 30 }, (_, i) => {
      const dt = new Date(Date.now() - (29 - i) * 86_400_000);
      return { key: dayKey(dt.toISOString()), label: dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }), value: 0 };
    });
    live.forEach((o) => {
      const dd = days.find((k) => k.key === dayKey(o.placedAt));
      if (dd) dd.value += o.total;
    });
    const units = new Map<string, { name: string; qty: number; rev: number; tone: string }>();
    live.forEach((o) => o.items.forEach((i) => {
      const cur = units.get(i.id) ?? { name: i.name, qty: 0, rev: 0, tone: i.tone };
      cur.qty += i.qty;
      cur.rev += i.qty * i.price;
      units.set(i.id, cur);
    }));
    const top = [...units.values()].sort((a, b) => b.rev - a.rev).slice(0, 5);
    const total30 = days.reduce((a, k) => a + k.value, 0);
    return { todaySales, toPack, transit, returns, low, cancelled, days, top, total30 };
  }, [d]);

  const show = (...roles: string[]) => ["owner", "manager", ...roles].includes(role);
  const hello = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <PageHeader title={`${hello}`} sub={`Signed in as ${session.name}. Figures come from the orders on this device.`} />

      <div className="adm-stats">
        {show("marketing", "finance") && <Stat label="Today's sales" value={money(x.todaySales)} sub="Excludes cancelled" icon="chart" href="/admin/orders" />}
        {show("operations") && <Stat label="To pack" value={x.toPack.length} sub="Confirmed, waiting" icon="box" tone="amber" href="/admin/fulfilment" />}
        {show("operations", "support") && <Stat label="In transit" value={x.transit.length} sub="Shipped or out for delivery" icon="truck" tone="blue" href="/admin/orders?status=Shipped" />}
        {show("operations", "support") && <Stat label="Returns pending" value={x.returns.length} sub="Not yet refunded" icon="return" tone="gold" href="/admin/returns" />}
        {show("operations", "catalogue") && <Stat label="Low or out of stock" value={x.low.length} sub="Needs attention" icon="stock" tone="red" href="/admin/inventory?state=Low" />}
        {show("finance", "support") && <Stat label="Cancelled (30 days)" value={x.cancelled} sub="Orders cancelled" icon="alert" tone="grey" href="/admin/orders?status=Cancelled" />}
        {show("catalogue") && <Stat label="Draft products" value={d.products.filter((p) => p.status === "draft").length} sub="Not on the store" icon="tag" tone="gold" href="/admin/products?status=draft" />}
      </div>

      {show("marketing", "finance") && (
        <div className="adm-cols" style={{ marginBottom: 16 }}>
          <Card title="Sales, last 30 days" actions={<b>{money(x.total30)}</b>}>
            <LineChart points={x.days} fmt={money} />
          </Card>
          <Card title="Top products">
            <BarList items={x.top.map((t) => ({ label: t.name, value: t.rev, sub: `${t.qty} sold` }))} fmt={money} />
          </Card>
        </div>
      )}

      <div className="adm-g3">
        {show("operations") && (
          <Card title="Orders to pack" pad={false} actions={<Link href="/admin/fulfilment" className="adm-link">Open</Link>}>
            {x.toPack.length === 0 ? <p className="adm-card-b adm-sub">All caught up.</p> : (
              <ul className="adm-list">
                {x.toPack.slice(0, 5).map((o) => (
                  <li key={o.id}>
                    <Thumb tone={o.items[0].tone} />
                    <div>
                      <Link href={`/admin/orders/${o.id}`} className="adm-link">{o.id}</Link>
                      <small>{itemCount(o)} {itemCount(o) === 1 ? "item" : "items"} · {o.address.city}</small>
                    </div>
                    <small>{fmtShort(o.placedAt)}</small>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
        {show("operations", "support") && (
          <Card title="Returns to review" pad={false} actions={<Link href="/admin/returns" className="adm-link">Open</Link>}>
            {x.returns.length === 0 ? <p className="adm-card-b adm-sub">No open returns.</p> : (
              <ul className="adm-list">
                {x.returns.slice(0, 5).map(({ o, i }) => (
                  <li key={o.id + i.id}>
                    <div>
                      <Link href={`/admin/returns/${o.id}~${i.id}~${i.size ?? ""}`} className="adm-link">{o.id}</Link>
                      <small>{i.name}</small>
                    </div>
                    <StatusBadge s={i.return!.status} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
        {show("operations", "catalogue") && (
          <Card title="Stock to watch" pad={false} actions={<Link href="/admin/inventory" className="adm-link">Open</Link>}>
            {x.low.length === 0 ? <p className="adm-card-b adm-sub">Stock levels look fine.</p> : (
              <ul className="adm-list">
                {x.low.slice(0, 5).map(({ r, p }) => (
                  <li key={r.id}>
                    {p && <Thumb tone={p.tone} src={p.images[0]?.src} />}
                    <div>
                      <Link href={`/admin/inventory?q=${encodeURIComponent(p?.name ?? r.id)}`} className="adm-link">{p?.name ?? r.id}</Link>
                      <small>{r.onHand - r.reserved} available</small>
                    </div>
                    <StatusBadge s={stockState(r, p)} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
        {(role === "support") && (
          <Card title="Latest orders" pad={false} actions={<Link href="/admin/orders" className="adm-link">Open</Link>}>
            <ul className="adm-list">
              {d.orders.slice(0, 5).map((o) => (
                <li key={o.id}>
                  <div>
                    <Link href={`/admin/orders/${o.id}`} className="adm-link">{o.id}</Link>
                    <small>{o.address.name}</small>
                  </div>
                  <StatusBadge s={statusOf(o, d.meta[o.id])} />
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </>
  );
}
