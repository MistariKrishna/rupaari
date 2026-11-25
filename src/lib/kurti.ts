// Kurti options: used by the admin form, the product page, the collection filters and the menu.
export interface Opt { slug: string; label: string }

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** Cut / style (the same slugs the Kurtis menu links use) */
export const STYLES: Opt[] = [
  { slug: "anarkali", label: "Anarkali" },
  { slug: "a-line", label: "A-Line" },
  { slug: "straight", label: "Straight Cut" },
  { slug: "kaftan", label: "Kaftan" },
  { slug: "peplum", label: "Peplum" },
  { slug: "chikankari", label: "Chikankari" },
  { slug: "jacket-cape", label: "Jacket or Cape" },
  { slug: "corset", label: "Corset Style" },
  { slug: "tunic", label: "Tunic Style" },
  { slug: "angrakha-anarkali", label: "Angrakha Anarkali" },
];

const NECK_NAMES = ["Round Neck", "V Neck", "Square Neck", "Boat Neck", "Scoop Neck", "U Neck", "Sweetheart Neck", "Keyhole Neck", "Notch Neck", "Collar Neck", "Mandarin Neck", "High Neck", "Halter Neck", "Cowl Neck", "Asymmetric Neck", "One Shoulder Neck", "Angrakha Neck", "Potli Button Neck", "Slit Neck", "Embroidered Neck", "Tie-Up Neck", "Yoke Neck"];
export const NECKS: Opt[] = NECK_NAMES.map((l) => ({ slug: slug(l.replace(/ neck$/i, "")), label: l }));

export const SLEEVES: Opt[] = [
  ["sleeveless", "Sleeveless"], ["cap", "Cap Sleeves"], ["short", "Short Sleeves"], ["half", "Half Sleeves"], ["elbow", "Elbow Sleeves"], ["three-quarter", "3/4 Sleeves"],
  ["long", "Full Sleeves"], ["extra-long", "Extra Long Sleeves"], ["puff", "Puff Sleeves"], ["bell", "Bell Sleeves"], ["bishop", "Bishop Sleeves"], ["balloon", "Balloon Sleeves"],
  ["ruffle", "Ruffle Sleeves"], ["flared", "Flared Sleeves"], ["slit", "Slit Sleeves"], ["cold-shoulder", "Cold Shoulder"], ["cape", "Cape Sleeves"], ["layered", "Layered Sleeves"],
].map(([slug, label]) => ({ slug: slug as string, label: label as string }));

/** Length, with the usual measure in inches where there is one */
export const LENGTHS: (Opt & { inches?: string })[] = [
  { slug: "cropped", label: "Cropped Length" },
  { slug: "short", label: "Short Length", inches: "30–32" },
  { slug: "hip", label: "Hip Length", inches: "32–34" },
  { slug: "knee", label: "Knee Length", inches: "40–42" },
  { slug: "below-knee", label: "Below Knee Length", inches: "42–44" },
  { slug: "calf", label: "Calf Length", inches: "44–46" },
  { slug: "ankle", label: "Ankle Length", inches: "48–52" },
  { slug: "floor", label: "Floor Length", inches: "54–60" },
  { slug: "high-low", label: "High-Low Length" },
  { slug: "asymmetric", label: "Asymmetric Length" },
  { slug: "layered", label: "Layered Length" },
  { slug: "slit", label: "Slit Style" },
];

export interface FabricGroup { slug: string; label: string; types: Opt[] }
const types = (names: string[]): Opt[] => names.map((l) => ({ slug: slug(l), label: l }));
export const FABRICS: FabricGroup[] = [
  { slug: "cotton", label: "Cotton", types: types(["Pure Cotton", "Cambric Cotton", "Mul Cotton", "Cotton Slub", "Kota Cotton", "Handloom Cotton", "Flex Cotton"]) },
  { slug: "silk", label: "Silk", types: types(["Chanderi Silk", "Banarasi Silk", "Art Silk", "Tussar Silk", "Raw Silk", "Soft Silk"]) },
  { slug: "rayon", label: "Rayon", types: types(["Rayon", "Rayon Slub", "Rayon Flex", "Rayon Printed"]) },
  { slug: "georgette", label: "Georgette", types: types(["Pure Georgette", "Faux Georgette", "Chiffon Georgette"]) },
  { slug: "chiffon", label: "Chiffon", types: types(["Pure Chiffon", "Soft Chiffon", "Printed Chiffon"]) },
  { slug: "other", label: "Other fabrics", types: types(["Crepe", "Muslin", "Modal", "Linen", "Velvet", "Organza", "Jacquard", "Satin", "Terry Rayon", "Polyester"]) },
];

export interface WearGroup { slug: string; label: string; items: Opt[] }
export const WEAR: WearGroup[] = [
  { slug: "daily-casual", label: "Daily & Casual Wear", items: types(["Daily Wear", "Casual Wear", "Regular Wear", "Home Wear", "Comfortable Wear", "Travel Wear", "College Wear"]) },
  { slug: "professional", label: "Professional Wear", items: types(["Office Wear", "Formal Wear", "Business Wear", "Work Wear", "Meeting Wear"]) },
  { slug: "party", label: "Party Wear", items: types(["Party Wear", "Birthday Party", "Cocktail Party", "Evening Wear", "Dinner Wear", "Club Wear"]) },
  { slug: "festive", label: "Festive Wear", items: types(["Festive Wear", "Diwali", "Navratri", "Raksha Bandhan", "Karwa Chauth", "Eid", "Holi", "Ganesh Chaturthi", "Durga Puja", "Janmashtami"]) },
  { slug: "wedding", label: "Wedding Wear", items: types(["Wedding Wear", "Bridal Wear", "Engagement", "Reception", "Sangeet", "Mehendi", "Haldi", "Wedding Guest Wear", "Anniversary"]) },
  { slug: "traditional", label: "Traditional & Cultural Wear", items: types(["Traditional Wear", "Ethnic Wear", "Pooja Wear", "Temple Wear", "Family Function", "Cultural Events"]) },
  { slug: "seasonal", label: "Seasonal Collection", items: types(["Summer Wear", "Winter Wear", "Monsoon Wear", "Spring Collection"]) },
];

const find = (list: Opt[], s?: string) => list.find((o) => o.slug === s);
export const styleLabel = (s?: string) => find(STYLES, s)?.label;
export const neckLabel = (s?: string) => find(NECKS, s)?.label;
export const sleeveLabel = (s?: string) => find(SLEEVES, s)?.label;
export const lengthLabel = (s?: string, withInches = true) => {
  const l = LENGTHS.find((o) => o.slug === s);
  return l ? (withInches && l.inches ? `${l.label} (${l.inches} in)` : l.label) : undefined;
};
export const fabricGroupLabel = (s?: string) => FABRICS.find((g) => g.slug === s)?.label;
export const fabricTypeLabel = (group?: string, type?: string) => FABRICS.find((g) => g.slug === group)?.types.find((t) => t.slug === type)?.label;
export const wearTagLabel = (tag: string) => WEAR.flatMap((g) => g.items).find((i) => i.slug === tag)?.label ?? tag;
/** the wear groups a set of detailed tags belongs to */
export const wearGroupsOf = (tags: string[] = []) => WEAR.filter((g) => g.items.some((i) => tags.includes(i.slug))).map((g) => g.slug);

/** What the store keeps for a kurti */
export interface KurtiInfo {
  style?: string;
  neck?: string;
  sleeve?: string;
  length?: string;
  fabricGroup?: string;
  fabricType?: string;
  wear: string[];
}
