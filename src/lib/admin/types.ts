import type { SiteContent } from "@/lib/siteContent";
import type { Tone } from "@/lib/content";
import type { CategorySlug, OccasionSlug, WeaveSlug } from "@/lib/products";
import type { Order } from "@/lib/orders";

export type Role = "owner" | "manager" | "catalogue" | "operations" | "support" | "marketing" | "finance";
export interface AdminSession {
  role: Role;
  name: string;
  email: string;
}

export type ProductStatus = "draft" | "live" | "archived";
export type StockModel = "one_of_one" | "multi" | "made_to_order";
export interface ProductImage {
  src: string;
  alt: string;
  primary: boolean;
}
export interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  shortLine: string;
  description: string;
  story: string;
  status: ProductStatus;
  category: CategorySlug;
  collection: string;
  weave?: WeaveSlug;
  region: string;
  zariType: string;
  border: string;
  pallu: string;
  motifs: string;
  occasions: OccasionSlug[];
  care: string;
  silkMark: boolean;
  handloomMark: boolean;
  giTag: boolean;
  weaverCluster: string;
  weightG: number | "";
  lengthM: number | "";
  blouse: boolean;
  images: ProductImage[];
  sku: string;
  colourName: string;
  colourHex: string;
  mrp: number | "";
  price: number;
  gstRate: number;
  hsn: string;
  stockModel: StockModel;
  leadTimeDays: number | "";
  sizes: string[];
  soldOutSizes: string[];
  tone: Tone;
  seoTitle: string;
  seoDescription: string;
  updatedAt: string;
}

export interface StockRow {
  id: string; // product id
  onHand: number;
  reserved: number;
  reorder: number;
  sizes?: Record<string, number>;
}
export type MoveType = "receive" | "reserve" | "release" | "sale" | "return" | "adjust";
export interface StockMovement {
  id: string;
  at: string;
  productId: string;
  size?: string;
  type: MoveType;
  qty: number;
  by: string;
  note?: string;
}

export interface AdminCollection {
  id: string;
  title: string;
  story: string;
  tone: Tone;
  heroImage: string;
  active: boolean;
  seoTitle: string;
  seoDescription: string;
  products: string[];
}
export interface Banner {
  id: string;
  heading: string;
  line: string;
  link: string;
  tone: Tone;
  image: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  type: "percent" | "flat" | "free_shipping";
  value: number;
  minBag: number | "";
  maxDiscount: number | "";
  startsAt: string;
  endsAt: string;
  usageLimit: number | "";
  perCustomerLimit: number | "";
  active: boolean;
  used: number;
}

export interface Note {
  at: string;
  by: string;
  text: string;
}
export interface CustMeta {
  id: string; // lower-case email or phone
  name: string;
  country: string;
  notes: Note[];
  consent: { email: boolean; sms: boolean; whatsapp: boolean; at: string };
}

export interface TimelineEntry {
  at: string;
  label: string;
  by: string;
  note?: string;
}
export interface OrderMeta {
  id: string;
  notes: Note[];
  timeline: TimelineEntry[];
  cancelled?: { at: string; reason: string; by: string };
  refunded?: boolean;
  courier?: string;
  tracking?: string;
  shippedAt?: string;
  packCheck?: { sku: boolean; quality: boolean; photo: boolean };
  rejectedReturns?: { itemKey: string; at: string; note: string; reason: string; by: string }[];
}

export interface Zone {
  id: string;
  name: string;
  countries: string;
  rate: number;
  eta: string;
}
export interface Settings {
  zones: Zone[];
  codEnabled: boolean;
  codMax: number;
  codPins: string;
  returnWindow: number;
  returnReasons: string[];
  refundLimit: number;
  freeShipFrom: number;
  giftWrapPrice: number;
  templates: { id: string; name: string; subject: string; body: string }[];
}
export interface TeamUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
}
export interface AuditEntry {
  id: string;
  at: string;
  by: string;
  role: Role;
  entity: string;
  ref: string;
  action: string;
  detail?: string;
}

export interface Data {
  products: AdminProduct[];
  stock: StockRow[];
  ledger: StockMovement[];
  collections: AdminCollection[];
  banners: Banner[];
  coupons: Coupon[];
  custMeta: CustMeta[];
  meta: Record<string, OrderMeta>;
  settings: Settings;
  team: TeamUser[];
  audit: AuditEntry[];
  site: SiteContent;
  orders: Order[];
}
