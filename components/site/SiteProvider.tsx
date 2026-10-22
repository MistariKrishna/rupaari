'use client';
import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
  type ReactNode, type RefObject,
} from 'react';
import { useRouter } from 'next/navigation';
import { PRODUCTS } from '@/lib/data';
import { EASE_IO } from '@/lib/theme';

export interface SiteContextValue {
  bag: number[];
  wish: Record<number, boolean>;
  bagOpen: boolean;
  menuOpen: boolean;
  searchOpen: boolean;
  /** true when the visitor prefers reduced motion */
  calm: boolean;
  toastState: { msg: string; on: boolean };
  setBagOpen: (v: boolean) => void;
  setMenuOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
  addToBag: (id: number, source?: HTMLElement | null) => void;
  removeFromBag: (id: number) => void;
  toggleWish: (id: number) => void;
  toast: (msg: string) => void;
  navigate: (href: string) => void;
  bagIconRef: RefObject<HTMLButtonElement | null>;
  bagCountRef: RefObject<HTMLSpanElement | null>;
  wipeRef: RefObject<HTMLDivElement | null>;
}

const SiteContext = createContext<SiteContextValue | null>(null);

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used inside <SiteProvider>');
  return ctx;
}

function scrollToId(id: string, smooth = true) {
  const el = document.getElementById(id);
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 60, behavior: smooth ? 'smooth' : 'auto' });
}

export function SiteProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [bag, setBag] = useState<number[]>([]);
  const [wish, setWish] = useState<Record<number, boolean>>({});
  const [bagOpen, setBagOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [calm, setCalm] = useState(false);
  const [toastState, setToastState] = useState({ msg: '', on: false });
  const toastTimer = useRef<number | undefined>(undefined);
  const bagIconRef = useRef<HTMLButtonElement>(null);
  const bagCountRef = useRef<HTMLSpanElement>(null);
  const wipeRef = useRef<HTMLDivElement>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setCalm(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('rupaari-bag');
      if (saved) setBag(JSON.parse(saved) as number[]);
      const w = localStorage.getItem('rupaari-wish');
      if (w) setWish(JSON.parse(w) as Record<number, boolean>);
    } catch {}
    hydrated.current = true;
  }, []);
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem('rupaari-bag', JSON.stringify(bag));
      localStorage.setItem('rupaari-wish', JSON.stringify(wish));
    } catch {}
  }, [bag, wish]);

  const toast = useCallback((msg: string) => {
    window.clearTimeout(toastTimer.current);
    setToastState({ msg, on: true });
    toastTimer.current = window.setTimeout(() => setToastState((s) => ({ ...s, on: false })), 2600);
  }, []);

  const navigate = useCallback(
    (href: string) => {
      setMenuOpen(false);
      setSearchOpen(false);
      setBagOpen(false);
      const [target, hash] = href.split('#');
      const path = target || '/';
      const current = window.location.pathname + window.location.search;
      if (path === current) {
        if (hash) scrollToId(hash);
        else window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const go = () => {
        router.push(href);
        if (hash) window.setTimeout(() => scrollToId(hash, false), 300);
      };
      const w = wipeRef.current;
      if (!w || calm) return go();
      w.animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], { duration: 520, easing: EASE_IO, fill: 'forwards' }).onfinish = () => {
        go();
        window.setTimeout(() => {
          w.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }], { duration: 620, easing: EASE_IO, fill: 'forwards' });
        }, 380);
      };
    },
    [router, calm],
  );

  const addToBag = useCallback(
    (id: number, source?: HTMLElement | null) => {
      const p = PRODUCTS[id];
      const bagEl = bagIconRef.current;
      const finish = () => {
        setBag((b) => (b.includes(id) ? b : [...b, id]));
        bagCountRef.current?.animate(
          [{ transform: 'scale(1)' }, { transform: 'scale(1.8)', color: '#B08A4E' }, { transform: 'scale(1)' }],
          { duration: 500 },
        );
        window.setTimeout(() => setBagOpen(true), 200);
      };
      if (!source || !bagEl || calm || !p) return finish();
      const r = source.getBoundingClientRect();
      const b = bagEl.getBoundingClientRect();
      const fly = document.createElement('div');
      Object.assign(fly.style, {
        position: 'fixed', left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`,
        backgroundImage: `url(${p.img})`, backgroundSize: 'cover', backgroundPosition: p.pos,
        zIndex: '200', pointerEvents: 'none', boxShadow: '0 24px 60px rgba(59,13,20,.35)',
      });
      document.body.appendChild(fly);
      const dx = b.left + b.width / 2 - (r.left + r.width / 2);
      const dy = b.top + b.height / 2 - (r.top + r.height / 2);
      fly.animate(
        [
          { transform: 'translate(0,0) scale(1)', borderRadius: '0%', opacity: 1 },
          { transform: `translate(${dx * 0.4}px,${dy * 0.4 - 60}px) scale(.45)`, borderRadius: '20%', opacity: 1, offset: 0.45 },
          { transform: `translate(${dx}px,${dy}px) scale(.04)`, borderRadius: '50%', opacity: 0.5 },
        ],
        { duration: 850, easing: 'cubic-bezier(.6,0,.25,1)' },
      ).onfinish = () => {
        fly.remove();
        finish();
      };
    },
    [calm],
  );

  const removeFromBag = useCallback((id: number) => setBag((b) => b.filter((x) => x !== id)), []);

  const toggleWish = useCallback(
    (id: number) => {
      const wasSaved = !!wish[id];
      setWish((w) => ({ ...w, [id]: !w[id] }));
      toast(wasSaved ? 'Removed from wishlist' : 'Saved to your wishlist');
    },
    [wish, toast],
  );

  const value = useMemo<SiteContextValue>(
    () => ({
      bag, wish, bagOpen, menuOpen, searchOpen, calm, toastState,
      setBagOpen, setMenuOpen, setSearchOpen, addToBag, removeFromBag, toggleWish, toast, navigate,
      bagIconRef, bagCountRef, wipeRef,
    }),
    [bag, wish, bagOpen, menuOpen, searchOpen, calm, toastState, addToBag, removeFromBag, toggleWish, toast, navigate],
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}
