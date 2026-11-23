import type { AdminProduct, StockRow } from "./types";

export type StockState = "OK" | "Low" | "Out";
export const availableOf = (r: StockRow) => Math.max(0, r.onHand - r.reserved);
export const stockState = (r: StockRow, p?: AdminProduct): StockState => {
  if (p?.stockModel === "made_to_order") return "OK";
  const a = availableOf(r);
  if (a <= 0) return "Out";
  if (p?.stockModel === "one_of_one") return "OK";
  return a <= r.reorder ? "Low" : "OK";
};
export const needsAttention = (r: StockRow, p?: AdminProduct) => p?.status !== "archived" && stockState(r, p) !== "OK" && p?.stockModel !== "made_to_order";
