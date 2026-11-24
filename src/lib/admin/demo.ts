// Demo catalogue for client presentations: ~110 products across the three categories,
// each with 2-4 colours and its own pictures (drawn in code, so nothing needs uploading).
import { KURTI_SIZES, type CategorySlug, type OccasionSlug, type WeaveSlug } from "@/lib/products";
import type { Tone } from "@/lib/content";
import type { AdminProduct, ProductImage, StockRow } from "./types";
import { blankProduct } from "./seed";

export const DEMO_PREFIX = "demo-";
export const isDemo = (id: string) => id.startsWith(DEMO_PREFIX);

/* ---------- colours: name (the filter reads this), body colour, zari/accent colour ---------- */
interface Col { name: string; body: string; deep: string; accent: string; tone: Tone }
const COLOURS: Col[] = [
  { name: "Burgundy", body: "#680f1a", deep: "#4a0b13", accent: "#c9a24d", tone: "burgundy" },
  { name: "Maroon", body: "#7a1426", deep: "#560c1a", accent: "#e0bc66", tone: "wine" },
  { name: "Wine", body: "#4a0b13", deep: "#30070c", accent: "#c9a24d", tone: "wine" },
  { name: "Emerald", body: "#0f7a4f", deep: "#09553a", accent: "#e8c872", tone: "gold" },
  { name: "Peacock", body: "#0f6b78", deep: "#094952", accent: "#e8c872", tone: "gold" },
  { name: "Mustard", body: "#d6a21a", deep: "#a87d0c", accent: "#680f1a", tone: "gold" },
  { name: "Rani", body: "#c2185b", deep: "#8e0f42", accent: "#f0d27a", tone: "burgundy" },
  { name: "Navy", body: "#16264f", deep: "#0d1833", accent: "#d9b45a", tone: "wine" },
  { name: "Teal", body: "#13827f", deep: "#0b5b59", accent: "#f0d27a", tone: "gold" },
  { name: "Mauve", body: "#a97b9a", deep: "#7e566f", accent: "#f7f1e7", tone: "taupe" },
  { name: "Olive", body: "#6b7a2e", deep: "#4a561c", accent: "#e8c872", tone: "gold" },
  { name: "Rust", body: "#a8441c", deep: "#7a2f10", accent: "#f0d27a", tone: "burgundy" },
  { name: "Ivory", body: "#f1e8d6", deep: "#d8c9a8", accent: "#c9a24d", tone: "ivory" },
  { name: "Lavender", body: "#b9a3d9", deep: "#8f78b8", accent: "#f7f1e7", tone: "taupe" },
  { name: "Plum", body: "#5d1f4a", deep: "#40122f", accent: "#e0bc66", tone: "wine" },
  { name: "Saffron", body: "#f08a1c", deep: "#c26a0c", accent: "#680f1a", tone: "gold" },
  { name: "Coral", body: "#ee6f5b", deep: "#c4503e", accent: "#f7f1e7", tone: "burgundy" },
  { name: "Sky", body: "#74b8e8", deep: "#4e94c6", accent: "#f7f1e7", tone: "taupe" },
  { name: "Black", body: "#1c1a1a", deep: "#0c0b0b", accent: "#c9a24d", tone: "wine" },
  { name: "Peach", body: "#f4b393", deep: "#d98f6c", accent: "#8a5a1c", tone: "taupe" },
];

/* ---------- small deterministic random so the demo is the same every time ---------- */
const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/* ---------- pictures ---------- */
type Kind = "saree" | "kurti" | "box" | "potli" | "basket";
const svgUri = (inner: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f9f4ea"/><stop offset="1" stop-color="#eadfca"/></linearGradient><linearGradient id="sh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset=".18" stop-color="#000" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".12"/><stop offset=".82" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient></defs><rect width="400" height="500" fill="url(#bg)"/>${inner}</svg>`;
  // small and safe: single quotes, and only the characters a data link cannot hold are escaped
  return "data:image/svg+xml;utf8," + svg.replace(/"/g, "'").replace(/%/g, "%25").replace(/#/g, "%23").replace(/</g, "%3C").replace(/>/g, "%3E");
};

let patN = 0;
/** a repeating tile: tiny to store, however large the area it fills */
const tiled = (x: number, y: number, w: number, h: number, tw: number, th: number, tile: string) => {
  const id = `p${++patN}`;
  return `<pattern id="${id}" x="${x}" y="${y}" width="${tw}" height="${th}" patternUnits="userSpaceOnUse">${tile}</pattern><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id})"/>`;
};
const dia = (cx: number, cy: number, r: number, fill: string) => `<path d="M${cx} ${cy - r}L${cx + r} ${cy}L${cx} ${cy + r}L${cx - r} ${cy}Z" fill="${fill}"/>`;
/** a row of small diamonds, used for borders and motif bands */
const diamonds = (x: number, y: number, w: number, step: number, r: number, fill: string) => tiled(x, y - r, w, 2 * r, step, 2 * r, dia(step / 2, r, r, fill));
/** a paisley / buta motif */
const butaPath = (fill: string, op = 1) => `<path d="M0 -22C14 -22 20 -8 16 6C12 20 -2 24 -10 16C-4 18 4 12 4 4C4 -4 -4 -6 -8 -2C-10 -12 -6 -22 0 -22Z" fill="${fill}" opacity="${op}"/>`;
const buta = (cx: number, cy: number, s: number, fill: string, op = 1) => `<g transform="translate(${cx} ${cy}) scale(${s})">${butaPath(fill, op)}</g>`;
/** body pattern chosen by the style number */
const body = (m: number, c: Col, x: number, y: number, w: number, h: number, big = false) => {
  const k = big ? 1.5 : 1;
  if (m === 0) return tiled(x, y, w, h, 40 * k, 40 * k, dia(20 * k, 20 * k, 5 * k, c.accent));
  if (m === 1) return tiled(x, y, w, h, 56 * k, 54 * k, `<g transform="translate(${14 * k} ${20 * k}) scale(${0.6 * k})">${butaPath(c.accent, 0.85)}</g><g transform="translate(${42 * k} ${46 * k}) scale(${0.6 * k})">${butaPath(c.accent, 0.85)}</g>`);
  if (m === 2) return tiled(x, y, w, h, 44 * k, 44 * k, `<rect width="${3 * k}" height="${44 * k}" fill="${c.accent}" opacity=".55"/><rect width="${44 * k}" height="${3 * k}" fill="${c.accent}" opacity=".55"/>`);
  return tiled(x, y, w, h, 28 * k, 28 * k, `<circle cx="${7 * k}" cy="${7 * k}" r="${2.6 * k}" fill="${c.accent}" opacity=".75"/><circle cx="${21 * k}" cy="${21 * k}" r="${2.6 * k}" fill="${c.accent}" opacity=".75"/>`);
};

const sareeFlat = (c: Col, m: number) => {
  const x = 60, y = 46, w = 280, h = 410;
  return svgUri(
    `<ellipse cx="200" cy="470" rx="150" ry="12" fill="#000" opacity=".12"/>` +
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${c.body}"/>` +
      body(m, c, x, y + 36, w, 230) +
      `<rect x="${x}" y="${y}" width="${w}" height="30" fill="${c.deep}"/><rect x="${x}" y="${y + 30}" width="${w}" height="5" fill="${c.accent}"/>` +
      diamonds(x, y + 15, w, 20, 5, c.accent) +
      `<rect x="${x}" y="300" width="${w}" height="${y + h - 300}" fill="${c.deep}" opacity=".55"/>` +
      `<rect x="${x}" y="300" width="${w}" height="4" fill="${c.accent}"/>` +
      [0, 1, 2, 3, 4].map((i) => buta(x + 40 + i * 50, 352, 0.95, c.accent)).join("") +
      `<rect x="${x}" y="${y + h - 38}" width="${w}" height="5" fill="${c.accent}"/><rect x="${x}" y="${y + h - 32}" width="${w}" height="32" rx="0" fill="${c.deep}"/>` +
      diamonds(x, y + h - 16, w, 20, 5, c.accent) +
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="url(#sh)"/>` +
      `<path d="M${x} 190L${x + w} 150" stroke="#000" stroke-opacity=".08" stroke-width="14"/>`,
  );
};
const fabricClose = (c: Col, m: number, kind: Kind) => {
  let s = `<rect width="400" height="500" fill="${c.body}"/>`;
  if (kind === "kurti") {
    s += tiled(0, 0, 400, 500, 30, 30, `<rect width="30" height="1.4" fill="${c.deep}" opacity=".5"/><rect width="1.4" height="30" fill="${c.deep}" opacity=".35"/>`);
    s += buta(200, 250, 5.2, c.accent, 0.9) + buta(90, 120, 2.2, c.accent, 0.7) + buta(320, 400, 2.2, c.accent, 0.7);
  } else {
    s += body(m, c, 0, 90, 400, 320, true);
    s += `<rect x="0" y="0" width="400" height="70" fill="${c.deep}"/><rect x="0" y="70" width="400" height="8" fill="${c.accent}"/>` + diamonds(0, 35, 400, 34, 9, c.accent);
    s += buta(200, 300, 4.2, c.accent, 0.95);
    s += `<rect x="0" y="430" width="400" height="8" fill="${c.accent}"/><rect x="0" y="438" width="400" height="62" fill="${c.deep}"/>` + diamonds(0, 469, 400, 34, 9, c.accent);
  }
  return svgUri(s + `<rect width="400" height="500" fill="url(#sh)" opacity=".7"/>`);
};

const kurtiFlat = (c: Col, flare: number, m: number) => {
  const f = flare; // extra width at the hem
  const d = `M150 62Q200 108 250 62L300 76L352 214L316 230L288 142L${330 + f} 452L${70 - f} 452L112 142L84 230L48 214L100 76Z`;
  return svgUri(
    `<ellipse cx="200" cy="474" rx="${140 + f}" ry="10" fill="#000" opacity=".12"/>` +
      `<path d="${d}" fill="${c.body}"/>` +
      `<g clip-path="url(#k)"><clipPath id="k"><path d="${d}"/></clipPath>` +
      body(m, c, 60, 250, 280, 170) +
      `<rect x="0" y="425" width="400" height="30" fill="${c.deep}"/><rect x="0" y="421" width="400" height="4" fill="${c.accent}"/>` +
      diamonds(0, 440, 400, 22, 4.5, c.accent) +
      `</g>` +
      `<path d="M150 62Q200 108 250 62" fill="none" stroke="${c.accent}" stroke-width="5"/>` +
      `<path d="M158 70Q200 118 242 70L236 150Q200 178 164 150Z" fill="${c.deep}" opacity=".85"/>` +
      `<path d="M158 70Q200 118 242 70" fill="none" stroke="${c.accent}" stroke-width="2"/>` +
      [0, 1, 2].map((i) => buta(200, 112 + i * 18, 0.42, c.accent)).join("") +
      `<line x1="200" y1="150" x2="200" y2="250" stroke="${c.accent}" stroke-width="2"/>` +
      [0, 1, 2, 3].map((i) => `<circle cx="200" cy="${166 + i * 25}" r="3.4" fill="${c.accent}"/>`).join("") +
      `<path d="M48 214L100 76L112 142L84 230Z" fill="${c.deep}" opacity=".35"/><path d="M352 214L300 76L288 142L316 230Z" fill="${c.deep}" opacity=".35"/>` +
      `<path d="${d}" fill="url(#sh)"/>`,
  );
};

const giftBox = (c: Col) =>
  svgUri(
    `<ellipse cx="200" cy="440" rx="130" ry="12" fill="#000" opacity=".14"/>` +
      `<rect x="85" y="210" width="230" height="220" rx="6" fill="${c.body}"/><rect x="72" y="170" width="256" height="58" rx="6" fill="${c.deep}"/>` +
      `<rect x="85" y="236" width="230" height="4" fill="${c.accent}" opacity=".8"/>` +
      diamonds(85, 410, 230, 22, 5, c.accent) +
      `<rect x="186" y="170" width="28" height="260" fill="${c.accent}"/><rect x="72" y="188" width="256" height="22" fill="${c.accent}" opacity=".9"/>` +
      `<path d="M200 172C150 110 100 120 128 160C140 176 180 176 200 172Z" fill="${c.accent}"/><path d="M200 172C250 110 300 120 272 160C260 176 220 176 200 172Z" fill="${c.accent}"/><circle cx="200" cy="170" r="13" fill="${c.deep}" stroke="${c.accent}" stroke-width="3"/>` +
      `<rect x="72" y="170" width="256" height="260" rx="6" fill="url(#sh)"/>`,
  );
const potli = (c: Col) =>
  svgUri(
    `<ellipse cx="200" cy="450" rx="120" ry="12" fill="#000" opacity=".14"/>` +
      `<path d="M120 190C60 250 50 380 120 430C170 458 230 458 280 430C350 380 340 250 280 190Z" fill="${c.body}"/>` +
      `<path d="M120 190Q200 230 280 190L270 168Q200 200 130 168Z" fill="${c.deep}"/>` +
      `<path d="M150 168C140 90 260 90 250 168" fill="none" stroke="${c.accent}" stroke-width="6" stroke-linecap="round"/>` +
      buta(200, 330, 2.1, c.accent, 0.95) + diamonds(105, 392, 190, 20, 4.5, c.accent) +
      `<circle cx="200" cy="200" r="9" fill="${c.accent}"/><path d="M200 208L186 252M200 208L214 252" stroke="${c.accent}" stroke-width="4" stroke-linecap="round"/>` +
      `<path d="M120 190C60 250 50 380 120 430C170 458 230 458 280 430C350 380 340 250 280 190Z" fill="url(#sh)"/>`,
  );
const basket = (c: Col) =>
  svgUri(
    `<ellipse cx="200" cy="452" rx="150" ry="12" fill="#000" opacity=".14"/>` +
      `<path d="M92 220C92 70 308 70 308 220" fill="none" stroke="${c.deep}" stroke-width="10" stroke-linecap="round"/>` +
      `<rect x="150" y="170" width="46" height="70" rx="5" fill="${c.accent}"/><rect x="204" y="180" width="40" height="60" rx="20" fill="${c.body}" stroke="${c.accent}" stroke-width="3"/><circle cx="262" cy="206" r="28" fill="${c.deep}"/><circle cx="262" cy="206" r="16" fill="${c.accent}"/>` +
      `<path d="M70 236H330L304 440H96Z" fill="${c.body}"/>` +
      [0, 1, 2, 3, 4].map((i) => `<path d="M${74 + i * 4} ${268 + i * 34}H${326 - i * 4}" stroke="${c.deep}" stroke-width="3" opacity=".7"/>`).join("") +
      `<rect x="62" y="226" width="276" height="22" rx="5" fill="${c.deep}"/><rect x="62" y="248" width="276" height="4" fill="${c.accent}"/>` +
      diamonds(96, 340, 208, 24, 5, c.accent) +
      `<path d="M70 236H330L304 440H96Z" fill="url(#sh)"/>`,
  );

const pictures = (kind: Kind, c: Col, m: number, flare: number): string[] =>
  kind === "saree" ? [sareeFlat(c, m), fabricClose(c, m, "saree")]
  : kind === "kurti" ? [kurtiFlat(c, flare, m), fabricClose(c, m, "kurti")]
  : kind === "box" ? [giftBox(c), fabricClose(c, m, "kurti")]
  : kind === "potli" ? [potli(c), fabricClose(c, m, "kurti")]
  : [basket(c), fabricClose(c, m, "kurti")];

const imgs = (srcs: string[], alt: string): ProductImage[] => srcs.map((src, i) => ({ src, alt: i === 0 ? alt : `${alt}, close view`, primary: i === 0 }));

/* ---------- product lists ---------- */
const SAREE_WEAVES: { slug: WeaveSlug; label: string; coll: string; region: string; lo: number; hi: number }[] = [
  { slug: "kanjivaram", label: "Kanjivaram", coll: "kanjivaram", region: "Kanchipuram, Tamil Nadu", lo: 28000, hi: 95000 },
  { slug: "mysore", label: "Mysore Silk", coll: "mysore", region: "Mysuru, Karnataka", lo: 9000, hi: 22000 },
  { slug: "kasavu", label: "Kasavu", coll: "kasavu", region: "Balaramapuram, Kerala", lo: 6500, hi: 14000 },
  { slug: "gadwal", label: "Gadwal", coll: "gadwal", region: "Gadwal, Telangana", lo: 12000, hi: 32000 },
  { slug: "dharmavaram", label: "Dharmavaram", coll: "gadwal", region: "Dharmavaram, Andhra Pradesh", lo: 11000, hi: 28000 },
  { slug: "pochampally", label: "Pochampally Ikat", coll: "pochampally", region: "Pochampally, Telangana", lo: 6000, hi: 15000 },
  { slug: "uppada", label: "Uppada", coll: "uppada", region: "Uppada, Andhra Pradesh", lo: 8000, hi: 20000 },
  { slug: "venkatagiri", label: "Venkatagiri", coll: "uppada", region: "Venkatagiri, Andhra Pradesh", lo: 5500, hi: 12000 },
];
const SAREE_STYLES = ["Temple Border", "Peacock Motif", "Zari Checks", "Buta Pallu", "Pure Zari Tissue"];
const KURTI_STYLES: [string, number][] = [["Straight", 0], ["A-line", 14], ["Anarkali", 38], ["Angrakha", 10], ["Kalidar", 30], ["Long Jacket", 6], ["Pathani", 0], ["Tiered", 24]];
const KURTI_FABRICS = ["Silk", "Cotton Silk", "Chanderi", "Banarasi", "Linen"];
const GIFT_KINDS: { label: Kind; name: string; lo: number; hi: number }[] = [
  { label: "box", name: "Gift Box", lo: 650, hi: 3800 },
  { label: "potli", name: "Potli Bag", lo: 450, hi: 2400 },
  { label: "basket", name: "Hamper Basket", lo: 1400, hi: 5200 },
];
const GIFT_ADJ = ["Silk", "Brocade", "Velvet", "Zari", "Festive", "Wedding", "Diwali", "Heritage", "Classic", "Royal"];
const OCC: OccasionSlug[][] = [["wedding", "festive"], ["festive"], ["wedding"], ["office", "festive"], ["gifting", "festive"]];

const roundTo = (n: number, step: number) => Math.round(n / step) * step;

function pickColours(r: () => number, n: number): Col[] {
  const out: Col[] = [];
  while (out.length < n) {
    const c = COLOURS[Math.floor(r() * COLOURS.length)]!;
    if (!out.some((o) => o.name === c.name)) out.push(c);
  }
  return out;
}

interface Spec { category: CategorySlug; kind: Kind; name: string; weave?: WeaveSlug; collection: string; region: string; price: number; m: number; flare: number; fabric: string; style: string }

function specs(): Spec[] {
  const out: Spec[] = [];
  SAREE_WEAVES.forEach((w, wi) =>
    SAREE_STYLES.forEach((st, si) => {
      const r = rng(wi * 31 + si * 7 + 3);
      out.push({ category: "sarees", kind: "saree", name: `${w.label} ${st} Saree`, weave: w.slug, collection: w.coll, region: w.region, price: roundTo(w.lo + (w.hi - w.lo) * (si / 4 * 0.7 + r() * 0.3), 500), m: si % 4, flare: 0, fabric: "Silk", style: st });
    }),
  );
  KURTI_STYLES.forEach(([st, flare], si) =>
    KURTI_FABRICS.forEach((fb, fi) => {
      const r = rng(si * 17 + fi * 5 + 101);
      out.push({ category: "kurtis", kind: "kurti", name: `${fb} ${st} Kurti`, collection: "kurtis-silk", region: "", price: roundTo(1400 + r() * 3800 + fi * 220, 50), m: (si + fi) % 4, flare, fabric: fb, style: st });
    }),
  );
  GIFT_KINDS.forEach((k, ki) =>
    GIFT_ADJ.forEach((adj, ai) => {
      const r = rng(ki * 13 + ai * 3 + 211);
      out.push({ category: "gift-craft", kind: k.label, name: `${adj} ${k.name}`, collection: "", region: "", price: roundTo(k.lo + (k.hi - k.lo) * (ai / 9 * 0.6 + r() * 0.4), 50), m: ai % 4, flare: 0, fabric: adj, style: k.name });
    }),
  );
  return out;
}

export function demoCatalogue(): { products: AdminProduct[]; stock: StockRow[] } {
  const products: AdminProduct[] = [];
  const stock: StockRow[] = [];
  const now = Date.now();
  specs().forEach((s, i) => {
    const r = rng(i * 97 + 13);
    const cols = pickColours(r, 2 + Math.floor(r() * 3)); // 2 to 4 colours
    const [first, ...rest] = cols as [Col, ...Col[]];
    const id = `${DEMO_PREFIX}${s.category === "gift-craft" ? "gift" : s.category === "sarees" ? "saree" : "kurti"}-${String(i + 1).padStart(3, "0")}`;
    const alt = (c: Col) => `${s.name} in ${c.name}`;
    const mrp = roundTo(s.price * (1.12 + r() * 0.14), s.price > 5000 ? 500 : 50);
    const kurti = s.category === "kurtis";
    const sizes = kurti ? [...KURTI_SIZES] : [];
    const desc =
      s.category === "sarees"
        ? `A ${s.style.toLowerCase()} saree from ${s.region}, woven on the handloom with fine zari. The same design is available in ${cols.map((c) => c.name).join(", ")}.`
        : kurti
          ? `A ${s.style.toLowerCase()} kurti in ${s.fabric.toLowerCase()}, cut for an easy, flattering fall. Available in ${cols.map((c) => c.name).join(", ")}.`
          : `A ${s.name.toLowerCase()}, finished with zari trim and ready to gift. Available in ${cols.map((c) => c.name).join(", ")}.`;
    const p: AdminProduct = {
      ...blankProduct(),
      id,
      slug: id,
      name: s.name,
      shortLine: s.category === "sarees" ? `${s.style} in handwoven silk` : kurti ? `${s.fabric} ${s.style.toLowerCase()} cut` : "Wrapped and ready to gift",
      description: desc,
      story: s.region ? `Woven by weaver families of ${s.region}, where this design has been made for generations.` : "",
      status: "live",
      category: s.category,
      collection: s.collection,
      weave: s.weave,
      region: s.region,
      zariType: s.category === "sarees" ? "Silver-gold zari" : "",
      border: s.category === "sarees" ? s.style : "",
      occasions: OCC[i % OCC.length]!,
      silkMark: s.category === "sarees",
      handloomMark: s.category === "sarees",
      giTag: s.weave === "kanjivaram" || s.weave === "pochampally",
      weaverCluster: s.region,
      weightG: s.category === "sarees" ? 650 : "",
      lengthM: s.category === "sarees" ? 5.5 : "",
      blouse: s.category === "sarees",
      images: imgs(pictures(s.kind, first, s.m, s.flare), alt(first)),
      sku: `RP-D${s.category === "sarees" ? "S" : kurti ? "K" : "G"}-${String(i + 1).padStart(3, "0")}`,
      colourName: first.name,
      colourHex: first.body,
      colourSoldOut: false,
      variants: rest.map((c, k) => ({ id: `${id}-v${k + 1}`, name: c.name, images: imgs(pictures(s.kind, c, s.m, s.flare), alt(c)), soldOut: i % 11 === k + 3 })),
      soldOut: i % 29 === 28,
      mrp,
      price: s.price,
      gstRate: kurti || s.category === "gift-craft" ? 12 : 5,
      hsn: s.category === "sarees" ? "5007" : kurti ? "6204" : "4819",
      stockModel: "multi",
      sizes,
      soldOutSizes: kurti && i % 7 === 0 ? ["XXXL"] : [],
      tone: first.tone,
      seoTitle: s.name,
      seoDescription: desc,
      updatedAt: new Date(now - (i + 1) * 3_600_000).toISOString(),
    };
    products.push(p);
    stock.push(
      kurti
        ? { id, onHand: 0, reserved: 0, reorder: 12, sizes: Object.fromEntries(KURTI_SIZES.map((z) => [z, z === "XXXL" ? 0 : 3 + Math.floor(r() * 8)])) }
        : { id, onHand: s.category === "gift-craft" ? 20 + Math.floor(r() * 40) : 2 + Math.floor(r() * 5), reserved: 0, reorder: s.category === "gift-craft" ? 10 : 2 },
    );
  });
  // sized products keep their total on hand
  stock.forEach((row) => {
    if (row.sizes) row.onHand = Object.values(row.sizes).reduce((a, b) => a + b, 0);
  });
  return { products, stock };
}