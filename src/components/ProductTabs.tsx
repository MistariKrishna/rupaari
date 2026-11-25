"use client";

import { useState } from "react";
import { categoryLabel, money, occasions, sizesFor, weaveLabel, type Product } from "@/lib/products";
import type { ShopInfo } from "@/lib/catalog";
import { fabricGroupLabel, lengthLabel, neckLabel, sleeveLabel, styleLabel, wearGroupsOf, WEAR } from "@/lib/kurti";

type Row = [string, string];
const TABS = ["Product Details", "Fabric & Zari", "Size & Care", "Shipping & Returns"] as const;

/** Four tabs of product facts. Only facts that exist are shown; nothing is filled in. */
export default function ProductTabs({ p, shop }: { p: Product; shop: ShopInfo }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>(TABS[0]);
  const d = p.details ?? {};
  const suits = p.occasions.map((o) => occasions.find((x) => x.slug === o)?.label ?? o).join(", ");
  const sizes = sizesFor(p);
  const k = p.kurti;
  const wearNames = k ? WEAR.filter((g) => wearGroupsOf(k.wear).includes(g.slug)).map((g) => g.label).join(", ") : "";
  const kRows: Row[] = k
    ? ([["Style", styleLabel(k.style)], ["Neck", neckLabel(k.neck)], ["Sleeve", sleeveLabel(k.sleeve)], ["Length", lengthLabel(k.length)], ["Wear", wearNames]] as [string, string | undefined][]).filter((r): r is Row => !!r[1])
    : [];

  const rows: Record<(typeof TABS)[number], Row[]> = {
    "Product Details": [["Category", categoryLabel(p.category)], ...(p.weave ? ([["Weave", weaveLabel(p.weave) ?? ""]] as Row[]) : []), ...(d.colour ? ([["Colour", d.colour]] as Row[]) : []), ...(suits ? ([["Suits", suits]] as Row[]) : []), ...kRows],
    "Fabric & Zari": [["Fabric", p.fabric], ...(k?.fabricGroup && fabricGroupLabel(k.fabricGroup) && fabricGroupLabel(k.fabricGroup) !== p.fabric ? ([["Fabric family", fabricGroupLabel(k.fabricGroup) as string]] as Row[]) : []), ...(d.zariType ? ([["Zari", d.zariType]] as Row[]) : []), ...(d.border ? ([["Border", d.border]] as Row[]) : []), ...(d.pallu ? ([["Pallu", d.pallu]] as Row[]) : []), ...(d.motifs ? ([["Motifs", d.motifs]] as Row[]) : []), ...(d.weaverCluster ? ([["Woven by", d.weaverCluster]] as Row[]) : []), ...(d.marks?.length ? ([["Marks", d.marks.join(", ")]] as Row[]) : [])],
    "Size & Care": [
      ...(sizes.length ? ([["Sizes", sizes.map((s) => s.label + (s.available ? "" : " (sold out)")).join(", ")]] as Row[]) : []),
      ...(d.lengthM ? ([["Length", `${d.lengthM} m`]] as Row[]) : []),
      ...(d.weightG ? ([["Weight", `${d.weightG} g`]] as Row[]) : []),
      ...(d.blouse !== undefined && p.category === "sarees" ? ([["Blouse piece", d.blouse ? "Included" : "Not included"]] as Row[]) : []),
      ...(d.care ? ([["Care", d.care]] as Row[]) : []),
    ],
    "Shipping & Returns": [
      ["Shipping in India", `${money(shop.indiaRate)}${shop.freeShipFrom ? `, free above ${money(shop.freeShipFrom)}` : ""}`],
      ["Delivery", shop.indiaEta],
      ["Returns", `Request within ${shop.returnWindow} days of delivery, from your order page.`],
    ],
  };
  const intro = tab === "Product Details" ? d.description || p.blurb : "";
  const list = rows[tab];

  return (
    <div className="pv-tabs">
      <div className="pv-tab-bar" role="tablist" aria-label="Product information">
        {TABS.map((t) => (
          <button key={t} type="button" role="tab" id={`pv-t-${t}`} aria-selected={tab === t} aria-controls="pv-panel" onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      <div id="pv-panel" role="tabpanel" aria-labelledby={`pv-t-${tab}`} className="pv-panel" key={tab}>
        {intro && <p className="pv-intro">{intro}</p>}
        {list.length > 0 ? (
          <dl>
            {list.map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
        ) : (
          <p className="pv-intro">Ask us and we will share more about this piece.</p>
        )}
      </div>
    </div>
  );
}
