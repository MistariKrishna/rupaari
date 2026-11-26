import { useCallback, useEffect, useRef, useState } from "react";
import { loadOrders, orderEvent, saveOrders } from "@/lib/orders";
import { seedBanners, seedCollections, seedKurtiCollections, seedCoupons, seedCustMeta, seedLedger, seedOrders, seedProducts, seedSettings, seedStock, seedTeam } from "./seed";
import { SAMPLE_IDS } from "@/lib/products";
import { emptySite } from "@/lib/siteContent";
import type { AdminSession, AuditEntry, Data } from "./types";

const P = "rupaari.admin.";
export const ADMIN_EVENT = "rupaari:admin";

function readKey<T>(key: string, seed: () => T): T {
  try {
    const raw = localStorage.getItem(P + key);
    if (raw !== null) return JSON.parse(raw) as T;
  } catch {
    /* fall through to the seed */
  }
  const v = seed();
  try {
    localStorage.setItem(P + key, JSON.stringify(v));
  } catch {
    /* ignore */
  }
  return v;
}
const writeKey = (key: string, v: unknown): boolean => {
  try {
    localStorage.setItem(P + key, JSON.stringify(v));
    return true;
  } catch {
    return false; // storage full: usually a very large image
  }
};

export const readSession = (): AdminSession | null => {
  try {
    const raw = localStorage.getItem(P + "session");
    return raw ? (JSON.parse(raw) as AdminSession) : null;
  } catch {
    return null;
  }
};
export const writeSession = (s: AdminSession | null) => {
  try {
    if (s) localStorage.setItem(P + "session", JSON.stringify(s));
    else localStorage.removeItem(P + "session");
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(ADMIN_EVENT));
};

/** First visit: add demo orders next to any real orders placed on this device. */
export function loadDemoOrders(force = false) {
  const flag = P + "seeded";
  if (!force && localStorage.getItem(flag)) return;
  const { orders, meta } = seedOrders();
  const existing = loadOrders().filter((o) => !orders.some((d) => d.id === o.id));
  saveOrders([...existing, ...orders].sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()));
  const cur = (() => {
    try {
      return JSON.parse(localStorage.getItem(P + "meta") || "{}") as Data["meta"];
    } catch {
      return {} as Data["meta"];
    }
  })();
  writeKey("meta", { ...cur, ...meta });
  localStorage.setItem(flag, "1");
}

export function resetDemo() {
  ["products", "stock", "ledger", "collections", "banners", "coupons", "custMeta", "meta", "settings", "team", "audit", "site", "kurtiCols", "samplesGone", "seeded"].forEach((k) => localStorage.removeItem(P + k));
  const demoIds = new Set(seedOrders().orders.map((o) => o.id));
  saveOrders(loadOrders().filter((o) => !demoIds.has(o.id)));
  loadDemoOrders(true);
  window.dispatchEvent(new Event(ADMIN_EVENT));
}

/** Older saved data has no kurti collections: add them once so kurtis can be placed in a collection. */
function loadCollections(): Data["collections"] {
  const cols = readKey("collections", seedCollections);
  try {
    if (!localStorage.getItem(P + "kurtiCols")) {
      localStorage.setItem(P + "kurtiCols", "1");
      if (!cols.some((c) => c.category === "kurtis")) {
        const next = [...cols, ...seedKurtiCollections()];
        writeKey("collections", next);
        return next;
      }
    }
  } catch {
    /* ignore */
  }
  return cols;
}

/** One time: take the old built-in sample products out of data saved by an earlier version. */
function purgeSamples() {
  try {
    if (localStorage.getItem(P + "samplesGone")) return;
    localStorage.setItem(P + "samplesGone", "1");
    const get = <T,>(k: string): T | null => { const r = localStorage.getItem(P + k); return r ? (JSON.parse(r) as T) : null; };
    const prods = get<Data["products"]>("products");
    if (prods) writeKey("products", prods.filter((p) => !SAMPLE_IDS.has(p.id)));
    const stock = get<Data["stock"]>("stock");
    if (stock) writeKey("stock", stock.filter((r) => !SAMPLE_IDS.has(r.id)));
    const cols = get<Data["collections"]>("collections");
    if (cols) writeKey("collections", cols.map((c) => ({ ...c, products: c.products.filter((id) => !SAMPLE_IDS.has(id)) })));
  } catch {
    /* ignore */
  }
}

function loadAll(): Data {
  purgeSamples();
  loadDemoOrders();
  return {
    products: readKey("products", seedProducts),
    stock: readKey("stock", seedStock),
    ledger: readKey("ledger", seedLedger),
    collections: loadCollections(),
    banners: readKey("banners", seedBanners),
    coupons: readKey("coupons", seedCoupons),
    custMeta: readKey("custMeta", seedCustMeta),
    meta: readKey("meta", () => ({}) as Data["meta"]),
    settings: readKey("settings", seedSettings),
    team: readKey("team", seedTeam),
    audit: readKey("audit", () => [] as AuditEntry[]),
    site: readKey("site", emptySite),
    orders: loadOrders(),
  };
}

export type SetFn = <K extends keyof Data>(key: K, next: Data[K] | ((prev: Data[K]) => Data[K])) => boolean;

export function useAdminData() {
  const [d, setD] = useState<Data | null>(null);
  const ref = useRef<Data | null>(null);

  useEffect(() => {
    const read = () => {
      ref.current = loadAll();
      setD(ref.current);
    };
    read();
    window.addEventListener(ADMIN_EVENT, read);
    window.addEventListener(orderEvent, read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(ADMIN_EVENT, read);
      window.removeEventListener(orderEvent, read);
      window.removeEventListener("storage", read);
    };
  }, []);

  const set: SetFn = useCallback((key, next) => {
    const cur = ref.current;
    if (!cur) return false;
    const value = typeof next === "function" ? (next as (p: Data[typeof key]) => Data[typeof key])(cur[key]) : next;
    if (key === "orders") saveOrders(value as Data["orders"]);
    else if (!writeKey(key as string, value)) return false;
    ref.current = { ...cur, [key]: value };
    setD(ref.current);
    return true;
  }, []);

  return { d, set };
}
