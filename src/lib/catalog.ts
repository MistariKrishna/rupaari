// Bridges the admin and the storefront: products published in the admin (saved in this browser) appear on the store.
// Built-in products stay as they are until the admin edits or unpublishes them.
import { useEffect, useState, useSyncExternalStore } from "react";
import { catalogueHook, products, SAMPLE_IDS, setCatalogue, type Product, type ProductColour } from "./products";
import type { AdminProduct, StockRow } from "./admin/types";
import { fabricGroupLabel, fabricTypeLabel } from "./kurti";

const KEY = "rupaari.admin.";
const EVENT = "rupaari:admin";

const read = <T,>(k: string): T | null => {
  try {
    const raw = window.localStorage.getItem(KEY + k);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

const toProduct = (a: AdminProduct, base: Product | undefined, stock: StockRow | undefined): Product => {
  const available = stock ? Math.max(0, stock.onHand - stock.reserved) : 1;
  const gal = (imgs: AdminProduct["images"]) => [...imgs].sort((x, y) => Number(!!y.primary) - Number(!!x.primary)).map((i) => ({ src: i.src, alt: i.alt || undefined }));
  const image = a.images.find((i) => i.primary)?.src ?? a.images[0]?.src;
  const colours: ProductColour[] = [];
  const main = a.colourName.trim();
  if (main) colours.push({ name: main, image, gallery: gal(a.images), inStock: !a.colourSoldOut });
  (a.variants ?? []).forEach((v) => {
    const nm = v.name.trim();
    if (!nm || colours.some((c) => c.name.toLowerCase() === nm.toLowerCase())) return;
    colours.push({ name: nm, image: v.images.find((i) => i.primary)?.src ?? v.images[0]?.src, gallery: gal(v.images), inStock: !v.soldOut });
  });
  const stocked = a.stockModel === "made_to_order" ? true : available > 0;
  const inStock = !a.soldOut && stocked && (colours.length ? colours.some((c) => c.inStock) : true);
  const mrp = a.mrp === "" ? undefined : Number(a.mrp) || undefined;
  return {
    id: a.id,
    name: a.name,
    category: a.category,
    weave: a.weave,
    occasions: a.occasions,
    price: a.price,
    mrp,
    badge: base ? base.badge : "New",
    fresh: base?.fresh,
    inStock,
    soldOutSizes: a.soldOutSizes,
    tone: a.tone,
    blurb: a.shortLine || a.description || base?.blurb || "",
    fabric: (a.category === "kurtis" && (fabricTypeLabel(a.fabricGroup, a.fabricType) ?? fabricGroupLabel(a.fabricGroup))) || base?.fabric || (a.category === "gift-craft" ? "Paper and ribbon" : "Silk"),
    kurti: a.category === "kurtis" ? { style: a.style || undefined, neck: a.neck || undefined, sleeve: a.sleeve || undefined, length: a.length || undefined, fabricGroup: a.fabricGroup || undefined, fabricType: a.fabricType || undefined, wear: a.wearTags ?? [] } : undefined,
    image,
    gallery: gal(a.images),
    colours: colours.length ? colours : undefined,
    details: {
      description: a.description || undefined,
      story: a.story || undefined,
      region: a.region || undefined,
      zariType: a.zariType || undefined,
      border: a.border || undefined,
      pallu: a.pallu || undefined,
      motifs: a.motifs || undefined,
      weaverCluster: a.weaverCluster || undefined,
      care: a.care || undefined,
      weightG: a.weightG === "" ? undefined : Number(a.weightG) || undefined,
      lengthM: a.lengthM === "" ? undefined : Number(a.lengthM) || undefined,
      blouse: a.blouse,
      marks: [a.silkMark && "Silk Mark", a.handloomMark && "Handloom Mark", a.giTag && "GI tag"].filter(Boolean) as string[],
      colour: a.colourName || undefined,
    },
  };
};

let cache: Product[] = products;
let dirty = true;
const rebuild = (): Product[] => {
  // Old saved data may still hold the built-in sample products: never show them.
  const admin = read<AdminProduct[]>("products")?.filter((a) => !SAMPLE_IDS.has(a.id)) ?? null;
  if (!admin) {
    setCatalogue([], []);
    return products;
  }
  const stock = read<StockRow[]>("stock") ?? [];
  const live = admin.filter((a) => a.status === "live");
  const liveIds = new Set(live.map((a) => a.id));
  const mapped = live.map((a) => toProduct(a, products.find((p) => p.id === a.id), stock.find((s) => s.id === a.id)));
  // Built-in products the admin has set to draft or archived are hidden; built-in ones it has never seen stay.
  const hide = admin.filter((a) => !liveIds.has(a.id)).map((a) => a.id);
  setCatalogue(mapped, hide);
  const kept = products.filter((p) => !liveIds.has(p.id) && !hide.includes(p.id));
  const byId = new Map(mapped.map((m) => [m.id, m]));
  return [
    ...mapped.filter((m) => !products.some((p) => p.id === m.id)), // brand-new products first
    ...products.filter((p) => byId.has(p.id)).map((p) => byId.get(p.id)!),
    ...kept,
  ];
};
const snapshot = (): Product[] => {
  if (dirty) {
    dirty = false;
    cache = rebuild();
  }
  return cache;
};
catalogueHook.refresh = () => {
  if (dirty && typeof window !== "undefined") snapshot();
};
const mark = () => { dirty = true; };
if (typeof window !== "undefined") {
  window.addEventListener("storage", mark);
  window.addEventListener(EVENT, mark);
  snapshot();
}
const subscribe = (cb: () => void) => {
  const h = () => { mark(); cb(); };
  mark();
  window.addEventListener("storage", h);
  window.addEventListener(EVENT, h);
  return () => {
    window.removeEventListener("storage", h);
    window.removeEventListener(EVENT, h);
  };
};

/** Every product to show on the store. Server render and first paint use the built-in list, so there is no mismatch. */
export const useCatalog = (): Product[] => useSyncExternalStore(subscribe, snapshot, () => products);

/** Shipping and returns facts the admin has set (Settings), with the store's defaults until then. */
export interface ShopInfo { indiaRate: number; indiaEta: string; freeShipFrom: number; returnWindow: number }
export function useShopInfo(): ShopInfo {
  const [info, setInfo] = useState<ShopInfo>({ indiaRate: 150, indiaEta: "3 to 6 days", freeShipFrom: 0, returnWindow: 7 });
  useEffect(() => {
    const raw = read<{ zones?: { countries: string; rate: number; eta: string }[]; freeShipFrom?: number; returnWindow?: number }>("settings");
    if (!raw) return;
    const z = raw.zones?.find((x) => x.countries.toLowerCase().split(",").map((c) => c.trim()).includes("india"));
    setInfo({ indiaRate: z ? Number(z.rate) : 150, indiaEta: z?.eta || "3 to 6 days", freeShipFrom: Number(raw.freeShipFrom) || 0, returnWindow: Number(raw.returnWindow) || 7 });
  }, []);
  return info;
}
