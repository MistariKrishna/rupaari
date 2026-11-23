"use client";

import "@/lib/catalog";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getProduct, hasSizes } from "@/lib/products";

interface Line {
  id: string;
  qty: number;
  /** kurtis only */
  size?: string;
  /** colour name, for pieces sold in more than one colour */
  colour?: string;
}

/** Same saree in the bag twice is one line; the same kurti in two sizes is two lines. */
export const lineKey = (l: { id: string; size?: string; colour?: string }) => `${l.id}|${l.size ?? ""}|${l.colour ?? ""}`;

interface Store {
  lines: Line[];
  count: number;
  subtotal: number;
  wish: string[];
  bagOpen: boolean;
  openBag: () => void;
  closeBag: () => void;
  add: (id: string, qty?: number, openDrawer?: boolean, size?: string, colour?: string) => void;
  setQty: (id: string, qty: number, size?: string, colour?: string) => void;
  remove: (id: string, size?: string, colour?: string) => void;
  toggleWish: (id: string) => void;
  isWished: (id: string) => boolean;
  /** empty the bag (after an order is placed) */
  clear: () => void;
  /** true once the saved bag has been read from this device */
  ready: boolean;
}

const BAG_KEY = "rupaari2_bag";
const WISH_KEY = "rupaari2_wish";
const Ctx = createContext<Store | null>(null);

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [wish, setWish] = useState<string[]>([]);
  const [bagOpen, setBagOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load saved bag + wishlist after mount (keeps server and client markup identical).
  useEffect(() => {
    const savedBag = read<Line[]>(BAG_KEY, []).filter((l) => getProduct(l.id) && l.qty > 0);
    setLines(savedBag);
    setWish(read<string[]>(WISH_KEY, []).filter((id) => getProduct(id)));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(BAG_KEY, JSON.stringify(lines));
      localStorage.setItem(WISH_KEY, JSON.stringify(wish));
    } catch {
      /* storage unavailable: bag lasts for this visit only */
    }
  }, [lines, wish, loaded]);

  const add = useCallback((id: string, qty = 1, openDrawer = true, size?: string, colour?: string) => {
    const p = getProduct(id);
    if (!p) return;
    if (hasSizes(p) && !size) return; // a kurti needs a size
    const key = lineKey({ id, size, colour });
    setLines((cur) => {
      if (cur.some((l) => lineKey(l) === key)) return cur.map((l) => (lineKey(l) === key ? { ...l, qty: Math.min(10, l.qty + qty) } : l));
      return [...cur, { id, qty, ...(size ? { size } : {}), ...(colour ? { colour } : {}) }];
    });
    if (openDrawer) setBagOpen(true);
  }, []);

  const setQty = useCallback((id: string, qty: number, size?: string, colour?: string) => {
    const key = lineKey({ id, size, colour });
    setLines((cur) => (qty <= 0 ? cur.filter((l) => lineKey(l) !== key) : cur.map((l) => (lineKey(l) === key ? { ...l, qty: Math.min(10, qty) } : l))));
  }, []);

  const clear = useCallback(() => setLines([]), []);
  const remove = useCallback((id: string, size?: string, colour?: string) => setLines((cur) => cur.filter((l) => lineKey(l) !== lineKey({ id, size, colour }))), []);
  const toggleWish = useCallback((id: string) => setWish((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id])), []);

  const value = useMemo<Store>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = lines.reduce((sum, l) => sum + (getProduct(l.id)?.price ?? 0) * l.qty, 0);
    return {
      lines,
      count,
      subtotal,
      wish,
      bagOpen,
      openBag: () => setBagOpen(true),
      closeBag: () => setBagOpen(false),
      add,
      setQty,
      remove,
      toggleWish,
      isWished: (id) => wish.includes(id),
      clear,
      ready: loaded,
    };
  }, [lines, wish, bagOpen, loaded, add, setQty, remove, toggleWish, clear]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}