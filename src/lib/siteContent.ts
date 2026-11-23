// Site content: images, videos and text the admin can change without touching code.
// The admin saves overrides to localStorage ("rupaari.admin.site"); the storefront reads them here.
// Nothing is overridden until an admin changes something, so the site looks exactly as built.
import { useEffect, useState, useSyncExternalStore } from "react";
import { heroSlides } from "./content";
import { images, type Slot } from "./images";

export interface SiteMedia {
  image?: string;
  video?: string;
  poster?: string;
  alt?: string;
  /** file name of an uploaded video (the file itself is kept in IndexedDB) */
  videoName?: string;
  /** which one the website shows when both a picture and a video are set */
  mode?: "image" | "video";
}
export interface SiteContent {
  media: Record<string, SiteMedia>;
  text: Record<string, string>;
}

export const SITE_KEY = "rupaari.admin.site";
export const SITE_EVENT = "rupaari:admin";
const EMPTY: SiteContent = { media: {}, text: {} };
export const emptySite = (): SiteContent => ({ media: {}, text: {} });

let cacheVal: SiteContent = EMPTY;
let dirty = true;
const mark = () => { dirty = true; };
if (typeof window !== "undefined") {
  window.addEventListener("storage", mark);
  window.addEventListener(SITE_EVENT, mark);
}
/** Parses localStorage only when something changed (it can hold large pictures), never on every render. */
const snapshot = (): SiteContent => {
  if (dirty) {
    dirty = false;
    try {
      const raw = window.localStorage.getItem(SITE_KEY);
      const j = raw ? (JSON.parse(raw) as Partial<SiteContent>) : {};
      cacheVal = { media: j.media ?? {}, text: j.text ?? {} };
    } catch {
      cacheVal = EMPTY;
    }
  }
  return cacheVal;
};
const subscribe = (cb: () => void) => {
  const h = () => { mark(); cb(); };
  mark();
  window.addEventListener("storage", h);
  window.addEventListener(SITE_EVENT, h);
  return () => {
    window.removeEventListener("storage", h);
    window.removeEventListener(SITE_EVENT, h);
  };
};
/** false while the page is still the server-rendered one, true once it is running in the browser. */
export const useHydrated = (): boolean => useSyncExternalStore(() => () => {}, () => true, () => false);
/** Server and first client render use the defaults, so there is no hydration mismatch. */
export const useSite = (): SiteContent => useSyncExternalStore(subscribe, snapshot, () => EMPTY);

/** A slot is identified by its default file path (video first, else image). */
export const slotKey = (s: Slot): string => s.video ?? s.image ?? "";

export function applySlot(slot: Slot, site: SiteContent): Slot {
  const key = slotKey(slot);
  const o = key ? site.media[key] : undefined;
  if (!o) return slot;
  const useVideo = !!o.video && (o.mode === "video" || !o.image || !o.mode);
  if (useVideo) return { video: o.video, poster: o.poster || o.image || undefined, image: o.image, alt: o.alt ?? slot.alt };
  if (o.image) return { image: o.image, alt: o.alt ?? slot.alt };
  return slot;
}

/* ---------- uploaded videos: too big for localStorage, so they live in IndexedDB (this browser only) ---------- */
const DB = "rupaari-site";
const STORE = "blobs";
const openDb = () =>
  new Promise<IDBDatabase>((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
export async function putBlob(key: string, blob: Blob): Promise<void> {
  const db = await openDb();
  await new Promise<void>((res, rej) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blob, key);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}
export async function getBlob(key: string): Promise<Blob | undefined> {
  const db = await openDb();
  return new Promise((res, rej) => {
    const r = db.transaction(STORE).objectStore(STORE).get(key);
    r.onsuccess = () => res(r.result as Blob | undefined);
    r.onerror = () => rej(r.error);
  });
}
export async function delBlob(key: string): Promise<void> {
  try {
    const db = await openDb();
    db.transaction(STORE, "readwrite").objectStore(STORE).delete(key);
  } catch {
    /* ignore */
  }
}
/** A video value like "idb:hero:1700000000" points at a file in IndexedDB. */
export const isStoredVideo = (v?: string): v is string => !!v && v.startsWith("idb:");
const urlCache = new Map<string, string>();
const lost = new Set<string>();
function useStoredUrl(ref?: string): string | undefined {
  const [url, setUrl] = useState<string | undefined>(ref ? urlCache.get(ref) : undefined);
  const [, bump] = useState(0);
  useEffect(() => {
    if (!ref) return setUrl(undefined);
    const hit = urlCache.get(ref);
    if (hit) return setUrl(hit);
    let live = true;
    getBlob(ref.split(":")[1])
      .then((b) => {
        if (!live) return;
        if (!b) { lost.add(ref); bump((n) => n + 1); return; } // the file is gone from this browser
        const u = URL.createObjectURL(b);
        urlCache.set(ref, u);
        setUrl(u);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [ref]);
  return url;
}
/** Turns an uploaded-video reference into a playable address (the picture shows until it is ready). */
export function useResolvedSlot(s: Slot): Slot {
  const ref = isStoredVideo(s.video) ? s.video : undefined;
  const url = useStoredUrl(ref);
  if (!ref) return s;
  if (url) return { ...s, video: url };
  // still loading, or the uploaded file is no longer in this browser: show the picture instead of an empty hero
  return { ...s, video: undefined, image: s.image ?? s.poster };
}
export const useSlot = (slot: Slot): Slot => useResolvedSlot(applySlot(slot, useSite()));
export const useText = (key: string, fallback: string): string => {
  const v = useSite().text[key];
  return v !== undefined && v.trim() !== "" ? v : fallback;
};

/* ---------- what the admin can edit ---------- */
const hero = heroSlides[0];
export const TEXT_DEFAULTS: Record<string, string> = {
  "hero.eyebrow": hero.eyebrow,
  "hero.title": hero.title,
  "hero.line": hero.line,
  "hero.cta": hero.cta.label,
  "hero.href": hero.cta.href,
  "offer.show": "1",
  "offer.text": "Up to {discount} on selected sarees",
  "offer.cta": "Shop the offer",
  "offer.href": "/collections/sarees",
  "consult.title": "Not sure which saree?",
  "consult.line": "Tell us the occasion and your colours, and we will help you choose.",
  "consult.cta1": "Book a consultation",
  "consult.cta2": "Browse sarees",
};

export interface SlotInfo {
  id: string;
  group: string;
  label: string;
  /** recommended size */
  hint: string;
  /** where visitors see it */
  where: string;
  def: Slot;
}
const title = (s: string) => s.replace(/[-_]/g, " ").replace(/^./, (c) => c.toUpperCase());
const rec = (group: string, hint: string, where: (k: string) => string, r: Record<string, Slot>): SlotInfo[] =>
  Object.entries(r).map(([k, def]) => ({ id: slotKey(def), group, label: title(k), hint, where: where(title(k)), def }));

export const SLOT_GROUPS: { name: string; note: string }[] = [
  { name: "Home page", note: "The first thing visitors see." },
  { name: "Menu", note: "Pictures that appear beside the menu when a visitor hovers it." },
  { name: "Collections", note: "The collections pages and their banner." },
  { name: "Page headers", note: "The wide picture at the top of each inner page." },
  { name: "About, craft and care", note: "Pictures inside the About, Craft and Sustainability pages." },
  { name: "Sign in pages", note: "The side picture on sign in, sign up and password pages." },
];

/** Every photo and video slot in src/lib/images.ts, grouped for the admin. */
export function listSlots(): SlotInfo[] {
  const all: SlotInfo[] = [
    { id: slotKey(images.hero), group: "Home page", label: "Hero (full screen)", hint: "Video 1920x1080 or a still 2560x1440", where: "Home page, the full-screen top section", def: images.hero },
    ...rec("Home page", "2:3 portrait, 1600x2400", (k) => `Home page, "Shop by category" tile: ${k}`, images.collections),
    ...rec("Home page", "1:1 square, 1000x1000", (k) => `Home page, "Shop by weave" circle: ${k}`, images.weaves),
    ...rec("Home page", "4:5, 1600x2000", (k) => `Home page and Occasions page, card: ${k}`, images.occasions),
    { id: slotKey(images.cta), group: "Home page", label: "Closing banner", hint: "16:9, 2560x1440", where: "Home page, the closing banner", def: images.cta },
    { id: slotKey(images.nav.bridal), group: "Menu", label: "Sarees menu picture", hint: "3:2, 1200x800", where: "Menu: picture on the right when a visitor hovers Sarees", def: images.nav.bridal },
    { id: slotKey(images.nav.kurti), group: "Menu", label: "Kurtis menu picture", hint: "4:3, 1200x900", where: "Menu: picture on the right when a visitor hovers Kurtis", def: images.nav.kurti },
    { id: slotKey(images.collectionBanner), group: "Collections", label: "Collections banner", hint: "2560x642", where: "Banner at the top of every collection page", def: images.collectionBanner },
    ...rec("Collections", "4:5, 1600x2000", (k) => `Collections page, card: ${k}`, images.collectionCards),
    ...rec("Page headers", "2:1, 2560x1280, subject in the centre", (k) => `Top banner of the ${k} page`, images.pages),
    { id: slotKey(images.aboutStory), group: "About, craft and care", label: "About story", hint: "4:5, 1600x2000", where: "About page, the story picture", def: images.aboutStory },
    ...images.craft.map((def, i) => ({ id: slotKey(def), group: "About, craft and care", label: `Craft photo ${i + 1}`, hint: "4:3, 1600x1200", where: "Craft page, picture pair", def })),
    ...images.sustainability.map((def, i) => ({ id: slotKey(def), group: "About, craft and care", label: `Sustainability photo ${i + 1}`, hint: "4:5, 1600x2000", where: "Sustainability page, picture pair", def })),
    ...images.auth.map((def, i) => ({ id: slotKey(def), group: "Sign in pages", label: `Sign in photo ${i + 1}`, hint: "4:5, 1200x1500", where: "Side picture on sign in, sign up and password pages", def })),
  ];
  const seen = new Set<string>();
  return all.filter((s) => s.id && !seen.has(s.id) && seen.add(s.id));
}