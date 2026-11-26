// SAMPLE content. Replace everything marked SAMPLE with verified facts before launch
// (design rule: never invent certification or scarcity).
export type Tone = "wine" | "burgundy" | "gold" | "taupe" | "ivory";

export interface CollectionInfo {
  slug: string;
  title: string;
  blurb: string;
  tone: Tone;
  items: { name: string; note: string; tone: Tone }[];
}

export const collections: CollectionInfo[] = [
  {
    slug: "sarees",
    title: "Sarees",
    blurb: "Silk sarees with woven borders, made to be worn and passed on.",
    tone: "wine",
    items: [
      { name: "Kanchipuram silk saree", note: "Silk", tone: "wine" },
      { name: "Koramangala pure silk", note: "Silk", tone: "burgundy" },
      { name: "Mysore silk saree", note: "Silk", tone: "gold" },
      { name: "Chettinad silk saree", note: "Silk", tone: "burgundy" },
      { name: "Pochampally ikat saree", note: "Ikat", tone: "taupe" },
      { name: "Gadwal silk saree", note: "Silk", tone: "wine" },
    ],
  },
  {
    slug: "kurtis",
    title: "Kurtis",
    blurb: "Handwoven silk kurtis with a clean, considered cut.",
    tone: "burgundy",
    items: [
      { name: "Handwoven silk kurti in ruby", note: "Silk", tone: "burgundy" },
      { name: "Handwoven silk kurti in cobalt", note: "Silk", tone: "wine" },
      { name: "Handwoven silk kurti in saffron", note: "Silk", tone: "gold" },
      { name: "Handwoven silk kurti in olive", note: "Silk", tone: "taupe" },
      { name: "Ikat kurti", note: "Ikat", tone: "burgundy" },
      { name: "Silk stole", note: "Silk", tone: "wine" },
    ],
  },
  {
    slug: "gift-craft",
    title: "Gifting",
    blurb: "Considered packaging and gifts to give a saree with care.",
    tone: "gold",
    items: [
      { name: "Saree gift box", note: "Gift packaging", tone: "gold" },
      { name: "Festive gift wrap", note: "Gift packaging", tone: "burgundy" },
    ],
  },
];

export function getCollection(slug: string): CollectionInfo | undefined {
  return collections.find((c) => c.slug === slug);
}

// SAMPLE figures: replace with real numbers, or remove the section.
export const stats: { value: number; suffix?: string; label: string }[] = [
  { value: 12, suffix: "+", label: "Weaving clusters" },
  { value: 250, suffix: "+", label: "Weaver families" },
  { value: 1500, suffix: "+", label: "Designs in the archive" },
  { value: 10000, suffix: "+", label: "Customers" },
  { value: 120, label: "New pieces each season" },
];

export const edits = [
  { title: "Bridal", line: "Heirloom silks for the day that matters.", tone: "wine" as Tone },
  { title: "Festive", line: "Colour and zari for gatherings and pooja.", tone: "burgundy" as Tone },
  { title: "Everyday", line: "Light handloom for ordinary, lovely days.", tone: "taupe" as Tone },
  { title: "Gifting", line: "A saree, given with care.", tone: "gold" as Tone },
];

export const principles = [
  { n: "01", title: "Space before ornament", text: "Keep surfaces warm, edges precise and gold rules fine." },
  { n: "02", title: "Silk before spectacle", text: "Accurate colour, natural skin and considered crops." },
  { n: "03", title: "Clarity before claims", text: "Use verified product details; never invent certification or scarcity." },
];

// SAMPLE process copy: describe your own process.
export const loomSteps = [
  { n: "01", title: "Yarn", text: "Silk and zari yarn are chosen for the piece." },
  { n: "02", title: "Colour", text: "Yarn is dyed to the shade the design calls for." },
  { n: "03", title: "Warp", text: "Threads are prepared and set on the loom." },
  { n: "04", title: "Weave", text: "The weaver builds the body, border and pallu by hand." },
  { n: "05", title: "Finish", text: "Each piece is checked, finished and packed with care." },
];

// SAMPLE trust points: confirm every line is true for your business (returns window,
// delivery promise, etc.) and edit the wording before launch.
export const trust: { icon: "loom" | "shield" | "return" | "truck"; title: string; line: string }[] = [
  { icon: "loom", title: "Handwoven silk", line: "Made on the loom, piece by piece." },
  { icon: "shield", title: "Honest details", line: "Weave, fabric and care shown on every piece." },
  { icon: "return", title: "Easy returns", line: "A clear, simple return policy." },
  { icon: "truck", title: "Careful delivery", line: "Packed with care and tracked to your door." },
];

// SAMPLE reasons to buy: edit to match your real promises.
export const reasons = [
  { n: "01", title: "Woven by hand", text: "Each saree is built on the loom, one pass of the shuttle at a time." },
  { n: "02", title: "Clear, honest details", text: "Weave, fabric and care are stated plainly on every product page." },
  { n: "03", title: "Help when you need it", text: "Book a consultation and we will help you choose the right piece." },
];

// Hero carousel copy (SAMPLE wording: edit freely). `word` is the big outlined word behind the arches.
export const heroSlides: {
  word: string;
  eyebrow: string;
  title: string;
  line: string;
  cta: { label: string; href: string };
  kicker: string;
  caption: string;
  tone: Tone;
}[] = [
  { word: "REDISCOVER", eyebrow: "The New Collection 2026", title: "Rediscover yourself.", line: "South Indian silk sarees, for every chapter of you.", cta: { label: "Our Collection", href: "/collections" }, kicker: "2026", caption: "The New Collection", tone: "wine" },
  { word: "BRIDAL", eyebrow: "The Bridal Edit", title: "Silks for a new chapter.", line: "Heirloom Kanjivaram and Gadwal, chosen with care.", cta: { label: "Shop bridal", href: "/collections/sarees?occasion=wedding" }, kicker: "Bridal", caption: "The Bridal Edit", tone: "burgundy" },
  { word: "HERITAGE", eyebrow: "Kanjivaram Heritage", title: "Broad zari, woven to keep.", line: "Temple borders on rich silk, made to be passed on.", cta: { label: "Shop Kanjivaram", href: "/collections/sarees?weave=kanjivaram" }, kicker: "Heritage", caption: "Kanjivaram Silks", tone: "wine" },
  { word: "FESTIVE", eyebrow: "Festive", title: "Colour and zari for every gathering.", line: "Pooja, family and festival days, dressed in silk.", cta: { label: "Shop festive", href: "/collections/sarees?occasion=festive" }, kicker: "Festive", caption: "Festive Silks", tone: "gold" },
  { word: "EVERYDAY", eyebrow: "Everyday handloom", title: "Light silk for lovely days.", line: "Mysore, Kasavu and ikat for work and small celebrations.", cta: { label: "Shop everyday", href: "/collections/sarees?occasion=office" }, kicker: "Everyday", caption: "Light Handloom", tone: "taupe" },
];
