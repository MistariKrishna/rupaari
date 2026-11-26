"use client";

import { CURRENCIES, setCurrency, type Code } from "@/lib/currency";
import { useCurrency } from "./useCurrency";

/** Currency picker for the footer. Prices across the store update straight away. */
export default function CurrencySwitch() {
  const code = useCurrency();
  return (
    <label className="cur-sw">
      <span className="sr-only">Currency</span>
      <select value={code} onChange={(e) => setCurrency(e.target.value as Code)} aria-label="Currency">
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>{c.code} {c.symbol}</option>
        ))}
      </select>
    </label>
  );
}
