"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getProduct } from "@/lib/products";

interface Line {
  id: string;
  qty: number;
}

interface Store {
  lines: Line[];
  count: number;
  subtotal: number;
  wish: string[];
  bagOpen: boolean;
  openBag: () => void;
  closeBag: () => void;
  add: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  toggleWish: (id: string) => void;
  isWished: (id: string) => boolean;
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

  const add = useCallback((id: string, qty = 1) => {
    if (!getProduct(id)) return;
    setLines((cur) => {
      const found = cur.find((l) => l.id === id);
      if (found) return cur.map((l) => (l.id === id ? { ...l, qty: Math.min(10, l.qty + qty) } : l));
      return [...cur, { id, qty }];
    });
    setBagOpen(true);
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setLines((cur) => (qty <= 0 ? cur.filter((l) => l.id !== id) : cur.map((l) => (l.id === id ? { ...l, qty: Math.min(10, qty) } : l))));
  }, []);

  const remove = useCallback((id: string) => setLines((cur) => cur.filter((l) => l.id !== id)), []);
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
    };
  }, [lines, wish, bagOpen, add, setQty, remove, toggleWish]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}