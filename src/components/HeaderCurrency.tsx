"use client";

import { CURRENCIES, setCurrency, type Code } from "@/lib/currency";
import { Icon } from "./Icon";
import { useCurrency } from "./useCurrency";

/** Currency picker for the navbar. Prices across the store update straight away. */
export default function HeaderCurrency({ compact = false }: { compact?: boolean }) {
  const code = useCurrency();
  const cur = CURRENCIES.find((c) => c.code === code)!;
  return (
    <label className={`util hc-cur ${compact ? "hc-cur--sm" : ""}`}>
      <span className="hc-cur-t" aria-hidden="true">{compact ? cur.symbol : `${cur.code} ${cur.symbol}`}</span>
      <Icon name="chevron-down" />
      <select value={code} aria-label="Currency" onChange={(e) => setCurrency(e.target.value as Code)}>
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>{c.code} {c.symbol} · {c.name}</option>
        ))}
      </select>
    </label>
  );
}
