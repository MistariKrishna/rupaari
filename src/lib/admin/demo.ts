// Demo catalogue for client presentations: ~110 products across the three categories,
// each with 2-4 colours and its own pictures (drawn in code, so nothing needs uploading).
import { KURTI_SIZES, type CategorySlug, type OccasionSlug, type WeaveSlug } from "@/lib/products";
import type { Tone } from "@/lib/content";
import type { AdminProduct, ProductImage, StockRow } from "./types";
import { blankProduct } from "./seed";
import { WEAR } from "@/lib/kurti";

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

/** What a kurti picture must show: the same choices the filters use */
interface KAttrs { style: string; neck: string; sleeve: string; length: string }

const HEM: Record<string, number> = { cropped: 300, short: 340, hip: 372, knee: 410, "below-knee": 430, calf: 448, ankle: 470, floor: 486, "high-low": 448, asymmetric: 448, layered: 448, slit: 448 };
/** [outer end y, cuff width, extra flare] per sleeve */
const SLEEVE: Record<string, [number, number, number]> = {
  cap: [112, 30, 0], short: [150, 34, 0], half: [182, 36, 0], elbow: [190, 36, 0], "three-quarter": [222, 36, 0], long: [262, 30, 0], "extra-long": [292, 28, 0],
  puff: [138, 40, 6], bell: [215, 36, 46], bishop: [250, 44, 0], balloon: [196, 36, 30], ruffle: [165, 36, 6], flared: [222, 36, 34], slit: [222, 36, 0], "cold-shoulder": [235, 34, 0], cape: [150, 36, 0], layered: [200, 36, 0],
};

/** neckline from the left neck point to the right one, plus whether a yoke panel hangs below it and any extra drawing */
function neckline(neck: string, c: Col): { nl: [number, number]; nr: [number, number]; d: string; panel: boolean; extra: string } {
  const A = c.accent;
  const std = { nl: [150, 62] as [number, number], nr: [250, 62] as [number, number] };
  const band = (y: number) => `<rect x="168" y="${y}" width="64" height="${64 - y}" rx="3" fill="${c.deep}" stroke="${A}" stroke-width="2"/>`;
  switch (neck) {
    case "v": return { ...std, d: "L200 122L250 62", panel: true, extra: "" };
    case "square": return { ...std, d: "L150 102L250 102L250 62", panel: true, extra: "" };
    case "boat": return { nl: [118, 66], nr: [282, 66], d: "Q200 92 282 66", panel: false, extra: "" };
    case "scoop": return { ...std, d: "Q200 142 250 62", panel: true, extra: "" };
    case "u": return { ...std, d: "L150 98Q200 146 250 98L250 62", panel: true, extra: "" };
    case "sweetheart": return { ...std, d: "C150 104 190 104 200 118C210 104 250 104 250 62", panel: true, extra: "" };
    case "keyhole": return { ...std, d: "Q200 96 250 62", panel: false, extra: `<circle cx="200" cy="112" r="9" fill="${c.deep}" stroke="${A}" stroke-width="2"/><path d="M200 96V112" stroke="${A}" stroke-width="2"/>` };
    case "notch": return { ...std, d: "L190 62L200 96L210 62L250 62", panel: false, extra: "" };
    case "collar": return { ...std, d: "L250 62", panel: false, extra: `<path d="M150 62L196 104L172 112Z M250 62L204 104L228 112Z" fill="${c.deep}" stroke="${A}" stroke-width="2" stroke-linejoin="round"/>` };
    case "mandarin": return { ...std, d: "L250 62", panel: false, extra: band(44) };
    case "high": return { ...std, d: "L250 62", panel: false, extra: band(36) };
    case "halter": return { nl: [168, 62], nr: [232, 62], d: "L232 62", panel: false, extra: `<path d="M168 62C170 44 176 36 184 30M232 62C230 44 224 36 216 30" stroke="${A}" stroke-width="3" fill="none"/>` };
    case "cowl": return { ...std, d: "Q200 128 250 62", panel: false, extra: `<path d="M158 70Q200 126 242 70M168 72Q200 112 232 72" fill="none" stroke="${c.deep}" stroke-width="3" opacity=".7"/>` };
    case "asymmetric":
    case "one-shoulder": return { nl: [150, 62], nr: [262, 112], d: "L262 112", panel: false, extra: `<path d="M150 62L262 112" stroke="${A}" stroke-width="3"/>` };
    case "angrakha": return { ...std, d: "L250 62", panel: false, extra: `<path d="M150 62L262 156M250 62L176 156" fill="none" stroke="${A}" stroke-width="3"/><path d="M150 62L262 156L240 160L150 70Z" fill="${c.deep}" opacity=".55"/>` };
    case "potli-button": return { ...std, d: "Q200 108 250 62", panel: true, extra: [168, 184, 200, 216, 232].map((x, i) => `<circle cx="${x}" cy="${80 + (i === 2 ? 14 : i % 4 === 0 || i === 4 ? -2 : 8)}" r="4" fill="${A}"/>`).join("") };
    case "slit": return { ...std, d: "Q200 108 250 62", panel: false, extra: `<path d="M200 98V190" stroke="${A}" stroke-width="3"/>` };
    case "embroidered": return { ...std, d: "Q200 108 250 62", panel: true, extra: `<path d="M150 62Q200 108 250 62" fill="none" stroke="${A}" stroke-width="6" stroke-dasharray="2 5" stroke-linecap="round"/>` };
    case "tie-up": return { ...std, d: "L200 112L250 62", panel: false, extra: `<path d="M200 112C186 140 182 164 188 190M200 112C214 140 218 164 212 190" fill="none" stroke="${A}" stroke-width="3"/><circle cx="188" cy="194" r="5" fill="${A}"/><circle cx="212" cy="194" r="5" fill="${A}"/>` };
    case "yoke": return { ...std, d: "Q200 108 250 62", panel: true, extra: `<path d="M118 150Q200 190 282 150" fill="none" stroke="${A}" stroke-width="3"/>` };
    default: return { ...std, d: "Q200 108 250 62", panel: true, extra: "" }; // round
  }
}

const kurtiFlat = (c: Col, flare: number, m: number, k: KAttrs) => {
  const hemY = HEM[k.length] ?? 448;
  const nk = neckline(k.neck, c);
  const slope = (42 + flare) / 310;
  const xr = (y: number) => 288 + (42 + flare) * ((y - 142) / 310) * (k.style === "peplum" || k.style === "anarkali" || k.style === "angrakha-anarkali" ? 0.85 : 1);
  let side = "";
  if (k.style === "anarkali" || k.style === "angrakha-anarkali") side = `L${284} 190L${xr(hemY) + 22} ${hemY}`;
  else if (k.style === "peplum") side = `L${280} 210L${xr(hemY) + 36} ${hemY}`;
  else side = `L${xr(hemY)} ${hemY}`;
  const mirrorSide = (str: string) => str.replace(/L([\d.]+) ([\d.]+)/g, (_m, x, y) => `L${400 - Number(x)} ${y}`);
  const rightPts = side.match(/L[\d.]+ [\d.]+/g) ?? [];
  const leftPts = rightPts.map((t) => mirrorSide(t)).reverse();
  const hemRight = rightPts[rightPts.length - 1] ?? "";
  void hemRight; void slope;
  const sleeveless = k.sleeve === "sleeveless" || k.neck === "halter";
  const shoulderR = sleeveless ? "L284 76" : "L300 76";
  const shoulderL = sleeveless ? "L116 76" : "L100 76";
  const body_d = `M${nk.nl[0]} ${nk.nl[1]}${nk.d}${shoulderR}L288 142${rightPts.join("")}${leftPts.join("")}L112 142${shoulderL}Z`;
  // sleeves (right one drawn, the left is its mirror)
  const sp = SLEEVE[k.sleeve];
  let sleeve = "";
  if (sp && !sleeveless) {
    const [ey, w, extra] = sp;
    const ox = Math.min(300 + Math.min(65, (52 * (ey - 76)) / 138), 372 - extra) + extra;
    const poly = `M300 76L${ox} ${ey}L${ox - w - extra} ${ey + 14}L288 142Z`;
    sleeve = `<path d="${poly}" fill="${c.body}"/><path d="${poly}" fill="${c.deep}" opacity=".35"/>`;
    if (k.sleeve === "puff") sleeve += `<ellipse cx="316" cy="104" rx="30" ry="26" fill="${c.body}"/><ellipse cx="316" cy="104" rx="30" ry="26" fill="${c.deep}" opacity=".25"/>`;
    if (k.sleeve === "ruffle") sleeve += [0, 1, 2, 3].map((i) => `<circle cx="${ox - 6 - i * ((w + extra) / 3.2)}" cy="${ey + 8 + i * 4}" r="7" fill="${c.accent}"/>`).join("");
    if (k.sleeve === "slit") sleeve += `<path d="M${ox - 14} ${ey - 40}L${ox - 14} ${ey + 8}" stroke="${c.accent}" stroke-width="2"/>`;
    if (k.sleeve === "layered") sleeve += `<path d="M300 76L${ox - 6} ${ey - 56}L${ox - w - 6} ${ey - 42}L288 120Z" fill="${c.accent}" opacity=".45"/>`;
    if (k.sleeve === "cape") sleeve += `<path d="M300 76L${ox + 20} ${ey + 20}L${ox - 60} ${ey + 52}L288 142Z" fill="${c.accent}" opacity=".3" stroke="${c.accent}" stroke-width="1.5"/>`;
    if (k.sleeve === "cold-shoulder") sleeve += `<ellipse cx="312" cy="96" rx="24" ry="13" fill="#f1e8d8" stroke="${c.accent}" stroke-width="2" stroke-dasharray="4 3"/>`;
    sleeve += `<path d="M${ox - w - extra} ${ey + 14}L${ox} ${ey}" stroke="${c.accent}" stroke-width="4"/>`;
  }
  const sleeves = sleeve ? `<g>${sleeve}</g><g transform="translate(400 0) scale(-1 1)">${sleeve}</g>` : "";
  const bandY = hemY - 30;
  const panel = nk.panel && k.style !== "jacket-cape" ? `<path d="M${nk.nl[0] + 8} ${nk.nl[1] + 8}${nk.d.replace(/Q/g, "Q")}L238 160Q200 182 162 160Z" fill="${c.deep}" opacity=".6"/>` : "";
  const jacket = k.style === "jacket-cape" ? `<path d="M200 92L200 ${hemY}" stroke="${c.accent}" stroke-width="3"/><path d="M200 92L${(200 + xr(hemY) - 200) * 0.18 + 200 - 28} ${hemY}L${200 + 28 - (xr(hemY) - 200) * 0.18} ${hemY}Z" fill="${c.deep}" opacity=".5"/>` : "";
  const seam = k.style === "anarkali" || k.style === "angrakha-anarkali" ? `<path d="M${nk.nl[0] > 150 ? 112 : 114} 188L286 188" stroke="${c.accent}" stroke-width="3" opacity=".9"/>` : k.style === "peplum" ? `<path d="M118 210L282 210" stroke="${c.accent}" stroke-width="3"/>` : "";
  const placket = ["angrakha", "collar", "halter", "tie-up", "slit", "asymmetric", "one-shoulder"].includes(k.neck) || k.style === "jacket-cape" ? "" : `<line x1="200" y1="150" x2="200" y2="${k.style === "peplum" ? 210 : 250}" stroke="${c.accent}" stroke-width="2"/>` + [0, 1, 2, 3].map((i) => `<circle cx="200" cy="${166 + i * 22}" r="3.2" fill="${c.accent}"/>`).join("");
  const patH = Math.max(0, bandY - 20 - 250);
  return svgUri(
    `<g transform="translate(0 ${Math.round(250 - (30 + hemY + 14) / 2)})"><ellipse cx="200" cy="${hemY + 14}" rx="${130 + flare}" ry="9" fill="#000" opacity=".12"/>` +
      sleeves +
      `<path d="${body_d}" fill="${c.body}"/>` +
      `<g clip-path="url(#k)"><clipPath id="k"><path d="${body_d}"/></clipPath>` +
      (patH > 20 ? body(m, c, 60, 236, 280, bandY - 236) : "") +
      `<rect x="0" y="${bandY}" width="400" height="30" fill="${c.deep}"/><rect x="0" y="${bandY - 4}" width="400" height="4" fill="${c.accent}"/>` +
      diamonds(0, bandY + 15, 400, 22, 4.5, c.accent) +
      (k.length === "layered" ? `<rect x="0" y="${bandY - 60}" width="400" height="6" fill="${c.accent}" opacity=".8"/>` : "") +
      `</g>` +
      panel + jacket + seam + nk.extra + placket +
      (nk.panel || ["round", "scoop", "v", "u", "square", "sweetheart", "boat", "embroidered", "yoke", "potli-button", "cowl", "keyhole"].includes(k.neck) ? `<path d="M${nk.nl[0]} ${nk.nl[1]}${nk.d}" fill="none" stroke="${c.accent}" stroke-width="4"/>` : "") +
      `<path d="${body_d}" fill="url(#sh)"/></g>`,
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

const pictures = (kind: Kind, c: Col, m: number, flare: number, k?: KAttrs): string[] =>
  kind === "saree" ? [sareeFlat(c, m), fabricClose(c, m, "saree")]
  : kind === "kurti" ? [kurtiFlat(c, flare, m, k ?? { style: "straight", neck: "round", sleeve: "three-quarter", length: "knee" }), fabricClose(c, m, "kurti")]
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
// [name, flare, style slug, usual lengths, usual necks, usual sleeves]
const KURTI_STYLES: [string, number, string, string[], string[], string[]][] = [
  ["Straight Cut", 0, "straight", ["knee", "calf", "below-knee", "hip"], ["round", "v", "mandarin", "notch", "collar", "keyhole", "high", "yoke"], ["three-quarter", "long", "short", "half", "slit"]],
  ["A-Line", 14, "a-line", ["knee", "below-knee", "calf"], ["round", "scoop", "boat", "v", "u", "square", "embroidered"], ["three-quarter", "elbow", "flared", "short", "cap"]],
  ["Anarkali", 38, "anarkali", ["floor", "ankle"], ["round", "sweetheart", "keyhole", "high", "u", "potli-button"], ["long", "three-quarter", "bell", "bishop", "balloon"]],
  ["Angrakha Anarkali", 30, "angrakha-anarkali", ["ankle", "floor", "calf"], ["angrakha", "collar"], ["long", "three-quarter", "bell"]],
  ["Kaftan", 20, "kaftan", ["calf", "ankle", "below-knee"], ["boat", "round", "cowl", "asymmetric", "tie-up"], ["bell", "cap", "balloon", "cold-shoulder", "flared"]],
  ["Jacket", 6, "jacket-cape", ["calf", "knee", "ankle"], ["collar", "mandarin", "v", "high"], ["long", "sleeveless", "cape", "layered"]],
  ["Peplum", 10, "peplum", ["hip", "short", "cropped"], ["square", "sweetheart", "v", "halter", "one-shoulder"], ["puff", "cap", "short", "ruffle", "sleeveless"]],
  ["Tunic", 4, "tunic", ["short", "hip", "knee"], ["round", "tie-up", "yoke", "slit", "scoop"], ["short", "half", "ruffle", "puff", "extra-long"]],
];
// [name used in titles, fabric group, fabric type]
const KURTI_FABRICS: [string, string, string][] = [
  ["Cotton", "cotton", "pure-cotton"],
  ["Chanderi", "silk", "chanderi-silk"],
  ["Rayon", "rayon", "rayon-slub"],
  ["Georgette", "georgette", "pure-georgette"],
  ["Banarasi", "silk", "banarasi-silk"],
];
const GIFT_KINDS: { label: Kind; name: string; lo: number; hi: number }[] = [
  { label: "box", name: "Gift Box", lo: 650, hi: 3800 },
  { label: "potli", name: "Potli Bag", lo: 450, hi: 2400 },
  { label: "basket", name: "Hamper Basket", lo: 1400, hi: 5200 },
];
const GIFT_ADJ = ["Silk", "Brocade", "Velvet", "Zari", "Festive", "Wedding", "Diwali", "Heritage", "Classic", "Royal"];
const OCC: OccasionSlug[][] = [["wedding", "festive"], ["festive"], ["wedding"], ["office", "festive"], ["gifting", "festive"]];

/** a few wear tags: always the group matching the fabric, plus two others, so every group is covered across the catalogue */
const wearFor = (i: number, fabricGroup: string, r: () => number): string[] => {
  const base = fabricGroup === "cotton" || fabricGroup === "rayon" ? [0, 1] : fabricGroup === "silk" ? [3, 4, 5] : [2, 3];
  const groups = new Set<number>([base[i % base.length]!, i % 7, (i + 3) % 7]);
  return [...groups].flatMap((g) => {
    const items = WEAR[g]!.items;
    const a = items[Math.floor(r() * items.length)]!;
    return [WEAR[g]!.items[0]!.slug, a.slug];
  }).filter((v, k, arr) => arr.indexOf(v) === k);
};
const roundTo = (n: number, step: number) => Math.round(n / step) * step;

function pickColours(r: () => number, n: number): Col[] {
  const out: Col[] = [];
  while (out.length < n) {
    const c = COLOURS[Math.floor(r() * COLOURS.length)]!;
    if (!out.some((o) => o.name === c.name)) out.push(c);
  }
  return out;
}

interface Spec { kStyle?: string; kLengths?: string[]; kNecks?: string[]; kSleeves?: string[]; kFabric?: [string, string, string]; category: CategorySlug; kind: Kind; name: string; weave?: WeaveSlug; collection: string; region: string; price: number; m: number; flare: number; fabric: string; style: string }

function specs(): Spec[] {
  const out: Spec[] = [];
  SAREE_WEAVES.forEach((w, wi) =>
    SAREE_STYLES.forEach((st, si) => {
      const r = rng(wi * 31 + si * 7 + 3);
      out.push({ category: "sarees", kind: "saree", name: `${w.label} ${st} Saree`, weave: w.slug, collection: w.coll, region: w.region, price: roundTo(w.lo + (w.hi - w.lo) * (si / 4 * 0.7 + r() * 0.3), 500), m: si % 4, flare: 0, fabric: "Silk", style: st });
    }),
  );
  KURTI_STYLES.forEach(([st, flare, slugS, len, necks, sleeves], si) =>
    KURTI_FABRICS.forEach((fb, fi) => {
      const r = rng(si * 17 + fi * 5 + 101);
      out.push({ category: "kurtis", kind: "kurti", name: `${fb[0]} ${st} Kurti`, collection: "kurtis-silk", region: "", price: roundTo(1400 + r() * 3800 + fi * 220, 50), m: (si + fi) % 4, flare, fabric: fb[0], style: st, kStyle: slugS, kLengths: len, kNecks: necks, kSleeves: sleeves, kFabric: fb });
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
    const pick = <T,>(arr: T[]) => arr[Math.floor(r() * arr.length)]!;
    const ka = kurti ? { style: s.kStyle!, neck: pick(s.kNecks!), sleeve: pick(s.kSleeves!), length: pick(s.kLengths!) } : undefined;
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
      shortLine: s.category === "sarees" ? `${s.style} in handwoven silk` : kurti ? `${s.fabric} ${s.style.toLowerCase()} kurti` : "Wrapped and ready to gift",
      description: desc,
      story: s.region ? `Woven by weaver families of ${s.region}, where this design has been made for generations.` : "",
      status: "live",
      category: s.category,
      collection: s.collection,
      weave: s.weave,
      region: s.region,
      zariType: s.category === "sarees" ? "Silver-gold zari" : "",
      ...(kurti
        ? {
            style: s.kStyle,
            neck: ka!.neck,
            sleeve: ka!.sleeve,
            length: ka!.length,
            fabricGroup: s.kFabric![1],
            fabricType: s.kFabric![2],
            wearTags: wearFor(i, s.kFabric![1], r),
          }
        : {}),
      border: s.category === "sarees" ? s.style : "",
      occasions: OCC[i % OCC.length]!,
      silkMark: s.category === "sarees",
      handloomMark: s.category === "sarees",
      giTag: s.weave === "kanjivaram" || s.weave === "pochampally",
      weaverCluster: s.region,
      weightG: s.category === "sarees" ? 650 : "",
      lengthM: s.category === "sarees" ? 5.5 : "",
      blouse: s.category === "sarees",
      images: imgs(pictures(s.kind, first, s.m, s.flare, ka), alt(first)),
      sku: `RP-D${s.category === "sarees" ? "S" : kurti ? "K" : "G"}-${String(i + 1).padStart(3, "0")}`,
      colourName: first.name,
      colourHex: first.body,
      colourSoldOut: false,
      variants: rest.map((c, k) => ({ id: `${id}-v${k + 1}`, name: c.name, images: imgs(pictures(s.kind, c, s.m, s.flare, ka), alt(c)), soldOut: i % 11 === k + 3 })),
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
