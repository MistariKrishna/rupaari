import type { Tone } from "./content";
import type { KurtiInfo } from "./kurti";
import { fmtMoney } from "./currency";

// SAMPLE CATALOGUE. Names, prices and MRPs below are placeholders taken from the
// design reference. Replace with your real products (or load from your database)
// before launch: the design rule is never to invent product details or offers.

export type CategorySlug = "sarees" | "kurtis" | "gift-craft";
export type WeaveSlug = "kanjivaram" | "mysore" | "kasavu" | "gadwal" | "dharmavaram" | "pochampally" | "uppada" | "venkatagiri";
export type OccasionSlug = "wedding" | "festive" | "office" | "gifting";

export interface Product {
  id: string;
  name: string;
  category: CategorySlug;
  weave?: WeaveSlug;
  occasions: OccasionSlug[];
  price: number;
  mrp?: number;
  badge?: "Our Pick" | "New";
  /** shows the NEW tag on collection pages only (does not feed the home page) */
  fresh?: boolean;
  inStock?: boolean;
  /** kurtis only: sizes that are currently sold out (others in KURTI_SIZES are available) */
  soldOutSizes?: string[];
  tone: Tone;
  blurb: string;
  fabric: string;
  /** set for products published from the admin: the main picture (a data URL or link) */
  image?: string;
  /** all pictures for the product page (admin-published products); the first is the main one */
  gallery?: { src: string; alt?: string }[];
  /** extra facts from the admin, shown in the product page tabs */
  details?: ProductDetails;
  /** kurtis: style, neck, sleeve, length, fabric and wear tags */
  kurti?: KurtiInfo;
  /** colours of the piece (admin-published products): each has its own pictures and stock */
  colours?: ProductColour[];
}

export interface ProductColour {
  name: string;
  image?: string;
  gallery: { src: string; alt?: string }[];
  inStock: boolean;
}

export interface ProductDetails {
  description?: string;
  story?: string;
  region?: string;
  zariType?: string;
  border?: string;
  pallu?: string;
  motifs?: string;
  weaverCluster?: string;
  care?: string;
  weightG?: number;
  lengthM?: number;
  blouse?: boolean;
  marks?: string[];
  colour?: string;
}

export const weaves: { slug: WeaveSlug; label: string }[] = [
  { slug: "kanjivaram", label: "Kanjivaram Heritage" },
  { slug: "mysore", label: "Mysore Silk" },
  { slug: "kasavu", label: "Kerala Kasavu" },
  { slug: "gadwal", label: "Gadwal & Dharmavaram" },
  { slug: "pochampally", label: "Pochampally Ikat" },
  { slug: "uppada", label: "Uppada & Venkatagiri" },
];

/** Weave options in the collection filter sidebar (design: 8 checkboxes). */
export const weaveFilters: { slug: WeaveSlug; label: string }[] = [
  { slug: "kanjivaram", label: "Kanjivaram" },
  { slug: "mysore", label: "Mysore Silk" },
  { slug: "pochampally", label: "Pochampally Ikat" },
  { slug: "gadwal", label: "Gadwal" },
  { slug: "dharmavaram", label: "Dharmavaram" },
  { slug: "kasavu", label: "Kerala Kasavu" },
  { slug: "uppada", label: "Uppada" },
  { slug: "venkatagiri", label: "Venkatagiri" },
];

export interface Collection {
  slug: string;
  name: string;
  line: string;
  weaves: WeaveSlug[];
  tone: Tone;
}

/** The six weave collections shown on /collections (design order). Taglines other than Kanjivaram are placeholders. */
export const collections: Collection[] = [
  { slug: "kanjivaram", name: "Kanjivaram Heritage", line: "The art of pure silk. A legacy woven over centuries.", weaves: ["kanjivaram"], tone: "wine" },
  { slug: "mysore", name: "Mysore Silk", line: "Soft, light silk with a fine zari edge.", weaves: ["mysore"], tone: "burgundy" },
  { slug: "kasavu", name: "Kerala Kasavu", line: "Ivory handloom, framed in classic gold.", weaves: ["kasavu"], tone: "ivory" },
  { slug: "gadwal", name: "Gadwal & Dharmavaram", line: "Contrast borders and a rich pallu from Telangana and Andhra.", weaves: ["gadwal", "dharmavaram"], tone: "gold" },
  { slug: "pochampally", name: "Pochampally Ikat", line: "Tie-dyed patterns, resolved thread by thread.", weaves: ["pochampally"], tone: "taupe" },
  { slug: "uppada", name: "Uppada & Venkatagiri", line: "Featherlight handloom with delicate zari motifs.", weaves: ["uppada", "venkatagiri"], tone: "burgundy" },
];
/** Colour filter swatches. A product matches the colour of its `tone`. */
export const colours: { slug: Tone; label: string; hex: string }[] = [
  { slug: "burgundy", label: "Burgundy", hex: "#680f1a" },
  { slug: "ivory", label: "Ivory", hex: "#f7f1e7" },
  { slug: "wine", label: "Wine", hex: "#4a0b13" },
];
export const getCollection = (slug: string) => collections.find((c) => c.slug === slug);

export const occasions: { slug: OccasionSlug; label: string; line: string; tone: Tone; href: string }[] = [
  { slug: "wedding", label: "Wedding", line: "Heirloom silks for the day that matters.", tone: "wine", href: "/collections/sarees?occasion=wedding" },
  { slug: "festive", label: "Festive", line: "Colour and zari for gatherings and pooja.", tone: "burgundy", href: "/collections/sarees?occasion=festive" },
  { slug: "office", label: "Office & Celebration", line: "Light handloom for working days and small occasions.", tone: "taupe", href: "/collections/sarees?occasion=office" },
  { slug: "gifting", label: "Gifting", line: "A saree, given with care.", tone: "gold", href: "/collections/gift-craft" },
];

export const categories: { slug: CategorySlug; label: string; blurb: string; tone: Tone }[] = [
  { slug: "sarees", label: "Sarees", blurb: "Silk sarees with woven borders, made to be worn and passed on.", tone: "wine" },
  { slug: "kurtis", label: "Kurtis", blurb: "Handwoven silk kurtis with a clean, considered cut.", tone: "burgundy" },
  { slug: "gift-craft", label: "Gifting", blurb: "Considered packaging and gifts to give a saree with care.", tone: "gold" },
];

/**
 * The built-in sample catalogue. It is no longer shown on the store: products now come only from the admin.
 * Kept only so the demo orders in the admin have item names and prices.
 */
export const sampleProducts: Product[] = [
  { id: "kanjivaram-heritage-saree", name: "Kanjivaram Heritage Silk Saree", category: "sarees", weave: "kanjivaram", occasions: ["wedding", "festive"], price: 18500, mrp: 23100, badge: "Our Pick", tone: "wine", blurb: "A broad zari temple border on rich silk, woven to be worn and kept.", fabric: "Silk" },
  { id: "mysore-silk-saree", name: "Mysore Silk Saree", category: "sarees", weave: "mysore", occasions: ["festive", "office"], price: 16500, mrp: 20100, badge: "Our Pick", tone: "burgundy", blurb: "Soft, light silk with a fine zari edge for celebrations and long days.", fabric: "Silk" },
  { id: "kerala-kasavu-saree", name: "Kerala Kasavu Saree", category: "sarees", weave: "kasavu", occasions: ["festive", "office"], price: 9800, badge: "New", tone: "ivory", blurb: "Ivory handloom with a classic gold kasavu border.", fabric: "Cotton silk" },
  { id: "gadwal-dharmavaram-saree", name: "Gadwal & Dharmavaram Saree", category: "sarees", weave: "gadwal", occasions: ["wedding", "festive"], price: 19500, mrp: 23500, badge: "New", tone: "gold", blurb: "Contrast borders and a rich pallu in a traditional Telangana weave.", fabric: "Silk" },
  { id: "pochampally-ikat-saree", name: "Pochampally Ikat Saree", category: "sarees", weave: "pochampally", occasions: ["office", "festive"], price: 12500, tone: "taupe", blurb: "Tie-dyed ikat patterns, resolved thread by thread on the loom.", fabric: "Silk" },
  { id: "uppada-venkatagiri-saree", name: "Uppada & Venkatagiri Saree", category: "sarees", weave: "uppada", occasions: ["office", "gifting"], price: 14200, tone: "burgundy", blurb: "Featherlight handloom with delicate zari motifs.", fabric: "Silk" },
  { id: "silk-kurti-ruby", name: "Handwoven Silk Kurti in Ruby", category: "kurtis", soldOutSizes: ["XXXL"], occasions: ["festive", "office"], price: 1800, mrp: 2400, tone: "burgundy", blurb: "A clean cut in handwoven silk, in a deep ruby.", fabric: "Silk" },
  { id: "silk-kurti-cobalt", name: "Handwoven Silk Kurti in Cobalt", category: "kurtis", soldOutSizes: ["XXXL"], occasions: ["festive", "office"], price: 1800, mrp: 2400, tone: "wine", blurb: "A clean cut in handwoven silk, in cobalt.", fabric: "Silk" },
  { id: "silk-kurti-saffron", name: "Handwoven Silk Kurti in Saffron", category: "kurtis", soldOutSizes: ["XXXL"], occasions: ["festive", "office"], price: 1800, mrp: 2400, badge: "New", tone: "gold", blurb: "A clean cut in handwoven silk, in saffron.", fabric: "Silk" },
  { id: "silk-kurti-olive", name: "Handwoven Silk Kurti in Olive", category: "kurtis", soldOutSizes: ["XXXL"], occasions: ["festive", "office"], price: 1800, mrp: 2400, tone: "taupe", blurb: "A clean cut in handwoven silk, in olive.", fabric: "Silk" },
  { id: "saree-gift-box", name: "Saree Gift Box", category: "gift-craft", occasions: ["gifting"], price: 950, tone: "gold", blurb: "Ivory and gold packaging to present a saree with care.", fabric: "Paper and ribbon" },
  { id: "festive-gift-wrap", name: "Festive Gift Wrap", category: "gift-craft", occasions: ["gifting"], price: 450, tone: "burgundy", blurb: "A burgundy and gold wrap for festive gifting.", fabric: "Paper and ribbon" },
  { id: "thamarai-temple-kanjivaram", name: "Thamarai Temple Kanjivaram", category: "sarees", weave: "kanjivaram", occasions: ["wedding", "festive"], price: 48500, fresh: true, tone: "wine", blurb: "Lotus motifs on a temple-border silk.", fabric: "Silk" },
  { id: "ambika-korvai-kanjivaram", name: "Ambika Korvai Kanjivaram", category: "sarees", weave: "kanjivaram", occasions: ["wedding", "festive"], price: 62000, tone: "burgundy", blurb: "A crimson border, joined thread by thread.", fabric: "Silk" },
  { id: "chandrika-ivory-kanjivaram", name: "Chandrika Ivory Kanjivaram", category: "sarees", weave: "kanjivaram", occasions: ["wedding", "gifting"], price: 54000, inStock: false, tone: "ivory", blurb: "Ivory drapes, framed in luminous gold.", fabric: "Silk" },
];

/** The store catalogue. Empty on purpose: products are published from the admin (see lib/catalog.ts). */
export const products: Product[] = [];
export const sampleProduct = (id: string) => sampleProducts.find((p) => p.id === id);
export const SAMPLE_IDS = new Set(sampleProducts.map((p) => p.id));

export const money = (n: number) => fmtMoney(n);
export const discountPct = (p: Product) => (p.mrp && p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0);
/**
 * Products published in the admin (see lib/catalog.ts) are registered here in the browser:
 * `extra` holds every live admin product, `hidden` the built-in ones the admin has unpublished.
 */
let extra = new Map<string, Product>();
let hidden = new Set<string>();
export const catalogueHook: { refresh: null | (() => void) } = { refresh: null };
export const setCatalogue = (live: Product[], hide: string[]) => {
  extra = new Map(live.map((p) => [p.id, p]));
  hidden = new Set(hide);
};
export const getProduct = (id: string): Product | undefined => {
  catalogueHook.refresh?.();
  return extra.get(id) ?? (hidden.has(id) ? undefined : products.find((p) => p.id === id));
};
export const imageOf = (id: string): string | undefined => extra.get(id)?.image;
export const productsIn = (c: CategorySlug) => products.filter((p) => p.category === c);
export const fromPrice = (c: CategorySlug) => {
  const v = productsIn(c).map((p) => p.price);
  return v.length ? Math.min(...v) : 0;
};
export const picks = () => products.filter((p) => p.badge === "Our Pick");
export const weaveLabel = (s?: WeaveSlug) => weaves.find((w) => w.slug === s)?.label ?? weaveFilters.find((w) => w.slug === s)?.label;
export const categoryLabel = (s: CategorySlug) => categories.find((c) => c.slug === s)?.label ?? s;

/** Short weave name for card eyebrows, e.g. "Kanjivaram" (the collection name is "Kanjivaram Heritage"). */
export const weaveShort = (s?: WeaveSlug) => weaveFilters.find((w) => w.slug === s)?.label;

/** Size labels offered on kurtis. Sarees have no size. */
export const KURTI_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
export const hasSizes = (p: Pick<Product, "category">) => p.category === "kurtis";
export const sizesFor = (p: Pick<Product, "category" | "soldOutSizes">) =>
  hasSizes(p) ? KURTI_SIZES.map((label) => ({ label, available: !(p.soldOutSizes ?? []).includes(label) })) : [];
