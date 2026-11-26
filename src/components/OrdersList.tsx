"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { DEMO } from "@/lib/checkout";
import { PAY_LABEL, STAGES, demoOrder, fmtDate, itemKey, itemMeta, loadOrders, nextOrderId, saveOrders } from "@/lib/orders";
import { money } from "@/lib/products";
import Crumbs from "./Crumbs";
import { Icon } from "./Icon";
import { Thumb } from "./OrderParts";
import { useOrders } from "./useOrders";
import { useSession } from "./useSession";

export default function OrdersList() {
  const { orders, ready } = useOrders();
  const { user } = useSession();
  const sp = useSearchParams();
  const router = useRouter();

  // Demo only: /account/orders?seed=1 adds the sample order from the design so every state can be reviewed.
  useEffect(() => {
    if (DEMO && sp.get("seed") === "1") {
      const existing = loadOrders();
      saveOrders([{ ...demoOrder(nextOrderId(existing)), userId: user?.id }, ...existing]);
      router.replace("/account/orders");
    }
  }, [sp, router, user]);

  return (
    <div className="rp-page">
      <div className="rp-wrap">
        <Crumbs items={[{ label: "Home", href: "/" }, { label: "Account", href: "/account" }, { label: "My orders" }]} />
        <h1 className="rp-title">My Orders</h1>
        {ready && orders.length === 0 ? (
          <div className="rp-empty">
            <Icon name="bag" />
            <h2>No orders yet</h2>
            <p>Orders you place with this account will appear here.</p>
            <Link href="/collections/sarees" className="btn">Explore Sarees</Link>
          </div>
        ) : (
          <div className="ol-list">
            {orders.map((o) => (
              <article key={o.id} className="rp-card ol-card">
                <header className="ol-head">
                  <div>
                    <h2 className="ol-id">Order #{o.id}</h2>
                    <p>{fmtDate(o.placedAt)} · {o.items.reduce((n, i) => n + i.qty, 0)} items</p>
                  </div>
                  <span className="rp-badge rp-badge--dot"><i aria-hidden="true" />{STAGES[o.stage]}</span>
                </header>
                <div className="ol-body">
                  <ul className="ol-items">
                    {o.items.map((it) => (
                      <li key={itemKey(it)}>
                        <Thumb it={it} size={120} />
                        <div>
                          <h3>{it.name}</h3>
                          <p>{itemMeta(it)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="ol-side">
                    <p className="ol-due">{o.payment === "cod" && o.stage < 4 ? "Due on delivery" : "Order total"}</p>
                    <p className="ol-amt">{money(o.total)}</p>
                    <p>{PAY_LABEL[o.payment]}</p>
                    <Link href={`/account/orders/${o.id}`} className="btn">View order details <Icon name="arrow-right" /></Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
