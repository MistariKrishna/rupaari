import { products, collections as weaveCollections, sampleProduct, hasSizes, KURTI_SIZES } from "@/lib/products";
import { STAGES, colourway, type Order, type OrderItem } from "@/lib/orders";
import { shippingFor } from "@/lib/checkout";
import type { AdminCollection, AdminProduct, Banner, Coupon, CustMeta, OrderMeta, Settings, StockMovement, StockRow, TeamUser } from "./types";

const iso = (ms: number) => new Date(ms).toISOString();
const ymd = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const DAY = 86_400_000;
const HEX: Record<string, string> = { wine: "#4a0b13", burgundy: "#680f1a", gold: "#c9a24d", taupe: "#bba99a", ivory: "#f7f1e7" };

export const makeSku = (name: string, n: number) => `RP-${name.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || "PRD"}-${String(n).padStart(3, "0")}`;

export const blankProduct = (): AdminProduct => ({
  id: "", slug: "", name: "", shortLine: "", description: "", story: "", status: "draft", category: "sarees", collection: "", region: "", zariType: "", border: "", pallu: "", motifs: "",
  occasions: [], care: "Dry clean only. Store folded in muslin.", silkMark: false, handloomMark: false, giTag: false, weaverCluster: "", weightG: "", lengthM: "", blouse: true,
  images: [], sku: "", colourName: "", colourHex: "#680f1a", colourSoldOut: false, variants: [], soldOut: false, mrp: "", price: 0, gstRate: 5, hsn: "5007", stockModel: "one_of_one", leadTimeDays: "", sizes: [], soldOutSizes: [],
  tone: "burgundy", seoTitle: "", seoDescription: "", updatedAt: iso(Date.now()),
});

export const seedProducts = (): AdminProduct[] =>
  products.map((p, i) => {
    const kurti = hasSizes(p);
    const made = p.id === "pochampally-ikat-saree";
    const multi = p.id === "kerala-kasavu-saree" || p.category === "gift-craft" || kurti;
    return {
      ...blankProduct(),
      id: p.id,
      slug: p.id,
      name: p.name,
      shortLine: p.blurb,
      description: p.blurb,
      status: p.id === "festive-gift-wrap" ? "draft" : "live",
      category: p.category,
      collection: weaveCollections.find((c) => p.weave && c.weaves.includes(p.weave))?.slug ?? "",
      weave: p.weave,
      region: p.weave === "kanjivaram" ? "Kanchipuram, Tamil Nadu" : p.weave === "mysore" ? "Mysuru, Karnataka" : p.weave === "kasavu" ? "Balaramapuram, Kerala" : p.weave ? "Telangana and Andhra Pradesh" : "",
      zariType: p.category === "sarees" ? "Silver-gold zari" : "",
      occasions: p.occasions,
      silkMark: p.fabric === "Silk" && p.category === "sarees",
      handloomMark: p.category === "sarees",
      giTag: p.weave === "kanjivaram" || p.weave === "pochampally",
      sku: makeSku(p.name, i + 1),
      colourName: p.tone === "burgundy" ? "Burgundy & Gold" : colourway(p.tone),
      colourHex: HEX[p.tone] ?? "#680f1a",
      mrp: p.mrp ?? "",
      price: p.price,
      gstRate: 5,
      stockModel: made ? "made_to_order" : multi ? "multi" : "one_of_one",
      leadTimeDays: made ? 21 : "",
      sizes: kurti ? [...KURTI_SIZES] : [],
      soldOutSizes: p.soldOutSizes ?? [],
      tone: p.tone,
      seoTitle: p.name,
      seoDescription: p.blurb,
      updatedAt: iso(Date.now() - (i + 2) * DAY),
    };
  });

export const seedStock = (): StockRow[] =>
  products.map((p) => {
    if (hasSizes(p)) {
      const sizes: Record<string, number> = { S: 8, M: 12, L: 10, XL: 6, XXL: 3, XXXL: 0 };
      if (p.id === "silk-kurti-olive") Object.assign(sizes, { S: 2, M: 3, L: 1, XL: 2, XXL: 0 });
      return { id: p.id, onHand: Object.values(sizes).reduce((a, b) => a + b, 0), reserved: 0, reorder: 12, sizes };
    }
    if (p.category === "gift-craft") return { id: p.id, onHand: 40, reserved: 0, reorder: 10 };
    if (p.id === "kerala-kasavu-saree") return { id: p.id, onHand: 4, reserved: 0, reorder: 2 };
    if (p.id === "pochampally-ikat-saree") return { id: p.id, onHand: 0, reserved: 0, reorder: 0 };
    return { id: p.id, onHand: p.inStock === false ? 0 : 1, reserved: 0, reorder: 0 };
  });

export const seedLedger = (): StockMovement[] =>
  products
    .filter((p) => p.category !== "sarees" || p.id === "kerala-kasavu-saree")
    .slice(0, 6)
    .map((p, i) => ({ id: `mv-${i + 1}`, at: iso(Date.now() - (20 - i) * DAY), productId: p.id, type: "receive" as const, qty: hasSizes(p) ? 39 : p.category === "gift-craft" ? 40 : 4, by: "Operations", note: "Opening stock" }));

/** Kurti collections, so the Collection choice on a kurti is not empty. */
export const seedKurtiCollections = (): AdminCollection[] => {
  const kurtis = products.filter((p) => p.category === "kurtis").map((p) => p.id);
  return [
    { id: "kurtis-silk", title: "Handwoven Silk Kurtis", story: "A clean, considered cut in handwoven silk.", tone: "burgundy", heroImage: "", category: "kurtis", active: true, seoTitle: "Handwoven Silk Kurtis", seoDescription: "Handwoven silk kurtis with a clean, considered cut.", products: kurtis },
    { id: "kurti-banarasi", title: "The Banarasi Silk Kurti Edit", story: "Silks for a new chapter, chosen with care.", tone: "wine", heroImage: "", category: "kurtis", active: true, seoTitle: "The Banarasi Silk Kurti Edit", seoDescription: "The Banarasi silk kurti edit.", products: [] },
  ];
};

export const seedCollections = (): AdminCollection[] => [
  ...weaveCollections.map((c) => ({
    id: c.slug,
    category: "sarees" as const,
    title: c.name,
    story: c.line,
    tone: c.tone,
    heroImage: "",
    active: true,
    seoTitle: c.name,
    seoDescription: c.line,
    products: products.filter((p) => p.weave && c.weaves.includes(p.weave)).map((p) => p.id),
  })),
  ...seedKurtiCollections(),
];

export const seedBanners = (): Banner[] => [
  { id: "bn-1", heading: "New arrivals", line: "Fresh from the loom this month.", link: "/collections/sarees?sort=new", tone: "burgundy", image: "", startsAt: ymd(Date.now() - 10 * DAY), endsAt: ymd(Date.now() + 20 * DAY), active: true },
  { id: "bn-2", heading: "The Banarasi Silk Kurti Edit", line: "Silks for a new chapter, chosen with care.", link: "/collections/kurtis?sort=new", tone: "wine", image: "", startsAt: ymd(Date.now() + 5 * DAY), endsAt: ymd(Date.now() + 35 * DAY), active: true },
  { id: "bn-3", heading: "Wedding season", line: "Heirloom silks for the day that matters.", link: "/occasions", tone: "gold", image: "", startsAt: ymd(Date.now() - 60 * DAY), endsAt: ymd(Date.now() - 30 * DAY), active: false },
];

export const blankCoupon = (): Coupon => ({ id: "", code: "", type: "percent", value: 10, minBag: "", maxDiscount: "", startsAt: ymd(Date.now()), endsAt: ymd(Date.now() + 30 * DAY), usageLimit: "", perCustomerLimit: 1, active: true, used: 0 });
export const seedCoupons = (): Coupon[] => [
  { ...blankCoupon(), id: "cp-1", code: "WELCOME10", value: 10, minBag: 5000, maxDiscount: 2000, usageLimit: 500, used: 37 },
  { ...blankCoupon(), id: "cp-2", code: "FESTIVE20", value: 20, minBag: 15000, maxDiscount: 5000, endsAt: ymd(Date.now() + 14 * DAY), usageLimit: 100, used: 12 },
  { ...blankCoupon(), id: "cp-3", code: "FREESHIP", type: "free_shipping", value: 0, minBag: 20000, used: 9 },
  { ...blankCoupon(), id: "cp-4", code: "GIFT500", type: "flat", value: 500, minBag: 8000, active: false, endsAt: ymd(Date.now() - 5 * DAY), used: 21 },
];

export const seedSettings = (): Settings => ({
  zones: [
    { id: "z-in", name: "India", countries: "India", rate: 150, eta: "3 to 6 days" },
    { id: "z-na", name: "USA and Canada", countries: "United States, Canada", rate: 2500, eta: "7 to 10 days" },
    { id: "z-eu", name: "UK and Europe", countries: "United Kingdom, Germany, France, Netherlands, Ireland", rate: 2500, eta: "7 to 10 days" },
    { id: "z-me", name: "Middle East and Asia", countries: "UAE, Singapore, Malaysia, Qatar", rate: 2500, eta: "5 to 8 days" },
    { id: "z-row", name: "Rest of world", countries: "All other countries", rate: 2500, eta: "8 to 14 days" },
  ],
  codEnabled: true,
  codMax: 60000,
  codPins: "All India PIN codes except 560099",
  returnWindow: 7,
  returnReasons: ["Item arrived damaged", "Wrong item received", "Not as described", "Colour differs from the photographs", "Other"],
  refundLimit: 25000,
  freeShipFrom: 20000,
  giftWrapPrice: 450,
  templates: [
    { id: "t-1", name: "Order confirmed", subject: "Your RUPAARI order {{order}} is confirmed", body: "Thank you, {{name}}. We have received your order {{order}} and will pack it with care." },
    { id: "t-2", name: "Order shipped", subject: "Your order {{order}} is on its way", body: "Your order shipped with {{courier}}. Tracking number: {{tracking}}." },
    { id: "t-3", name: "Order delivered", subject: "Delivered: {{order}}", body: "Your saree has arrived. Care guide attached. Rediscover yourself." },
    { id: "t-4", name: "Return approved", subject: "Your return for {{order}} is approved", body: "We will arrange a pickup on {{date}}. Your refund follows after inspection." },
  ],
});

export const seedTeam = (): TeamUser[] => [
  { id: "u-1", name: "Owner", email: "owner@rupaari.example", role: "owner", active: true },
  { id: "u-2", name: "Store Manager", email: "manager@rupaari.example", role: "manager", active: true },
  { id: "u-3", name: "Catalogue Editor", email: "catalogue@rupaari.example", role: "catalogue", active: true },
  { id: "u-4", name: "Packing Lead", email: "operations@rupaari.example", role: "operations", active: true },
  { id: "u-5", name: "Customer Care", email: "support@rupaari.example", role: "support", active: true },
  { id: "u-6", name: "Marketing", email: "marketing@rupaari.example", role: "marketing", active: true },
  { id: "u-7", name: "Accounts", email: "finance@rupaari.example", role: "finance", active: false },
];

/* ---------- demo customers and orders ---------- */
const CUSTOMERS = [
  { name: "Meera Rao", email: "meera.rao@example.com", a: { line1: "Flat 3, 18 Lotus Lane", area: "Ashok Nagar", pin: "560001", city: "Bengaluru", state: "Karnataka", country: "India" } },
  { name: "Priya Nair", email: "priya.nair@example.com", a: { line1: "42 Maple Street", area: "", pin: "08817", city: "Edison", state: "New Jersey", country: "United States" } },
  { name: "Ananya Krishnan", email: "ananya.k@example.com", a: { line1: "9 Larch Road", area: "Wembley", pin: "HA9 7AB", city: "London", state: "England", country: "United Kingdom" } },
  { name: "Lakshmi Sundar", email: "lakshmi.s@example.com", a: { line1: "21 Orchard Ave", area: "", pin: "238858", city: "Singapore", state: "Singapore", country: "Singapore" } },
  { name: "Divya Reddy", email: "divya.reddy@example.com", a: { line1: "Plot 12, Road 5", area: "Jubilee Hills", pin: "500033", city: "Hyderabad", state: "Telangana", country: "India" } },
  { name: "Sarah Thomas", email: "sarah.thomas@example.com", a: { line1: "88 King Street W", area: "", pin: "M5H 1A1", city: "Toronto", state: "Ontario", country: "Canada" } },
  { name: "Kavya Menon", email: "kavya.m@example.com", a: { line1: "14 Harbour View", area: "", pin: "2000", city: "Sydney", state: "NSW", country: "Australia" } },
  { name: "Rhea Shah", email: "rhea.shah@example.com", a: { line1: "Villa 7, Palm Close", area: "Jumeirah", pin: "00000", city: "Dubai", state: "Dubai", country: "United Arab Emirates" } },
];

export const seedCustMeta = (): CustMeta[] =>
  CUSTOMERS.map((c, i) => ({
    id: c.email,
    name: c.name,
    country: c.a.country,
    notes: i === 1 ? [{ at: iso(Date.now() - 6 * DAY), by: "Customer Care", text: "Prefers WhatsApp for delivery updates." }] : [],
    consent: { email: true, sms: i % 3 === 0, whatsapp: i % 2 === 0, at: iso(Date.now() - (30 + i) * DAY) },
  }));

type Spec = { d: number; h?: number; c: number; items: [string, string?, number?][]; stage: number; pay: "upi" | "card" | "cod"; gift?: string; ret?: "requested" | "approved" | "received" | "refunded"; cancelled?: boolean };
const SPECS: Spec[] = [
  { d: 0, h: 2, c: 1, items: [["kanjivaram-heritage-saree"]], stage: 0, pay: "card" },
  { d: 0, h: 5, c: 4, items: [["silk-kurti-ruby", "M", 2]], stage: 0, pay: "upi" },
  { d: 1, h: 3, c: 2, items: [["mysore-silk-saree"], ["saree-gift-box"]], stage: 0, pay: "card", gift: "For Amma, with love." },
  { d: 2, c: 0, items: [["gadwal-dharmavaram-saree"]], stage: 1, pay: "cod" },
  { d: 3, c: 3, items: [["thamarai-temple-kanjivaram"]], stage: 2, pay: "card" },
  { d: 4, c: 5, items: [["silk-kurti-saffron", "L"], ["silk-kurti-cobalt", "S"]], stage: 2, pay: "card" },
  { d: 5, c: 7, items: [["uppada-venkatagiri-saree"]], stage: 3, pay: "card" },
  { d: 6, c: 4, items: [["kerala-kasavu-saree"]], stage: 3, pay: "cod" },
  { d: 8, c: 0, items: [["ambika-korvai-kanjivaram"]], stage: 4, pay: "upi" },
  { d: 9, c: 1, items: [["pochampally-ikat-saree"]], stage: 4, pay: "card", ret: "requested" },
  { d: 11, c: 6, items: [["kanjivaram-heritage-saree"]], stage: 4, pay: "card", ret: "approved" },
  { d: 13, c: 2, items: [["silk-kurti-ruby", "XL"]], stage: 4, pay: "card", ret: "refunded" },
  { d: 16, c: 3, items: [["mysore-silk-saree"]], stage: 4, pay: "card" },
  { d: 19, c: 5, items: [["gadwal-dharmavaram-saree"]], stage: 4, pay: "card" },
  { d: 22, c: 7, items: [["silk-kurti-olive", "M"], ["festive-gift-wrap"]], stage: 4, pay: "card" },
  { d: 25, c: 4, items: [["uppada-venkatagiri-saree"]], stage: 4, pay: "upi" },
  { d: 27, c: 6, items: [["pochampally-ikat-saree"]], stage: 0, pay: "card", cancelled: true },
];

export function seedOrders(): { orders: Order[]; meta: Record<string, OrderMeta> } {
  const now = Date.now();
  const orders: Order[] = [];
  const meta: Record<string, OrderMeta> = {};
  SPECS.forEach((s, i) => {
    const id = `RP-${10401 + i}`;
    const placed = now - s.d * DAY - (s.h ?? 6) * 3_600_000;
    const cu = CUSTOMERS[s.c];
    const items: OrderItem[] = s.items.map(([pid, size, qty]) => {
      const p = sampleProduct(pid);
      return { id: pid, name: p?.name ?? pid, price: p?.price ?? 0, qty: qty ?? 1, colour: colourway(p?.tone ?? "gold"), size, tone: p?.tone ?? "gold", nonReturnable: p?.category === "gift-craft" };
    });
    const subtotal = items.reduce((a, it) => a + it.price * it.qty, 0);
    const shipping = shippingFor(cu.a.country);
    const delivered = s.stage === 4 ? placed + 4 * DAY : undefined;
    if (s.ret) {
      const base = { reason: s.ret === "requested" ? "Colour differs from the photographs" : "Item arrived damaged", details: "Seeded demo return.", photos: [] as string[], requestedAt: iso((delivered ?? now) + DAY) };
      const st = s.ret;
      items[0].return =
        st === "requested" ? { ...base, status: "requested" }
        : st === "approved" ? { ...base, status: "approved", pickupDate: iso(now + DAY) }
        : { ...base, status: "refunded", pickupDate: iso(now - 4 * DAY), pickedUpAt: iso(now - 3 * DAY), receivedAt: iso(now - 2 * DAY), refundedAt: iso(now - DAY) };
    }
    orders.push({
      id, placedAt: iso(placed), stage: s.stage, deliveredAt: delivered ? iso(delivered) : undefined, items, address: { name: cu.name, ...cu.a }, contact: cu.email, payment: s.pay,
      subtotal, shipping, total: subtotal + shipping, gift: s.gift,
    });
    const tl = [{ at: iso(placed), label: "Order placed", by: cu.name }, { at: iso(placed + 5 * 60_000), label: "Confirmed", by: "System" }];
    for (let st = 1; st <= s.stage; st++) tl.push({ at: iso(placed + st * 0.9 * DAY), label: STAGES[st], by: "Operations" });
    const m: OrderMeta = { id, notes: [], timeline: s.cancelled ? [...tl.slice(0, 2), { at: iso(placed + 0.2 * DAY), label: "Cancelled", by: "Support" }] : tl };
    if (s.cancelled) m.cancelled = { at: iso(placed + 0.2 * DAY), reason: "Customer asked to cancel", by: "Support" };
    if (s.stage >= 2) {
      m.courier = cu.a.country === "India" ? "Delhivery" : "DHL Express";
      m.tracking = (cu.a.country === "India" ? "DLV" : "DHL") + String(48201000 + i * 137);
      m.shippedAt = iso(placed + 1.8 * DAY);
    }
    meta[id] = m;
  });
  return { orders, meta };
}