export const IMG = (k: string) => `/assets/img-${k}.png`;
export const inr = (n: number) => '₹ ' + n.toLocaleString('en-IN');
export const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
export const collHref = (weave?: string | null) =>
  weave ? `/sarees?weave=${encodeURIComponent(weave)}` : '/sarees';

export const WEAVES = [
  'Kanjivaram Heritage',
  'Mysore Silk',
  'Pochampally Ikat',
  'Gadwal & Dharmavaram',
  'Kerala Kasavu',
  'Uppada & Venkatagiri',
  'Bridal Edit',
] as const;

export type Colour = 'Maroon' | 'Ivory' | 'Gold';
export type Occasion = 'Wedding' | 'Festive' | 'Everyday';

export interface Product {
  id: number;
  slug: string;
  name: string;
  coll: string;
  region: string;
  price: number;
  colour: Colour;
  occ: Occasion;
  img: string;
  pos: string;
  img2: string;
  pos2: string;
  line: string;
  tag: string;
}

type Row = [string, string, string, number, Colour, Occasion, string, string, string, string, string, string];

const ROWS: Row[] = [
  ['Thamarai Temple Kanjivaram', 'Kanjivaram Heritage', 'Kanchipuram, Tamil Nadu', 48500, 'Maroon', 'Wedding', 'hero', '40% 75%', 'collections', '70% 50%', 'Lotus buttas on a temple border, in pure zari.', 'New'],
  ['Ambika Korvai Kanjivaram', 'Kanjivaram Heritage', 'Kanchipuram, Tamil Nadu', 62000, 'Maroon', 'Wedding', 'collections', '74% 60%', 'hero', '30% 85%', 'A contrast border joined thread by thread.', ''],
  ['Nila Mysore Crepe', 'Mysore Silk', 'Mysuru, Karnataka', 18900, 'Ivory', 'Festive', 'portrait', '40% 50%', 'kanji', '30% 40%', 'Featherlight silk with a soft gold edge.', 'New'],
  ['Chandrika Ivory Kanjivaram', 'Kanjivaram Heritage', 'Kanchipuram, Tamil Nadu', 54000, 'Ivory', 'Wedding', 'kanji', '26% 40%', 'portrait', '60% 75%', 'Ivory and gold, for mornings that matter.', 'Bestseller'],
  ['Rangoli Pochampally Ikat', 'Pochampally Ikat', 'Pochampally, Telangana', 14500, 'Maroon', 'Festive', 'collections', '12% 60%', 'hero', '10% 90%', 'Tie-dyed geometry, woven by hand.', ''],
  ['Onam Kasavu Set-Mundu', 'Kerala Kasavu', 'Balaramapuram, Kerala', 9800, 'Gold', 'Festive', 'journal', '62% 75%', 'portrait', '50% 95%', 'Cream, gold and the first light of Onam.', 'New'],
  ['Gadwal Contrast Pallu', 'Gadwal & Dharmavaram', 'Gadwal, Telangana', 22400, 'Maroon', 'Festive', 'hero', '85% 65%', 'collections', '40% 40%', 'Cotton body, silk border, a pallu that speaks.', ''],
  ['Uppada Jamdani Whisper', 'Uppada & Venkatagiri', 'Uppada, Andhra Pradesh', 16200, 'Ivory', 'Everyday', 'portrait', '72% 30%', 'journal', '30% 60%', 'So light it feels like a memory.', ''],
  ['The Bridal Korvai', 'Bridal Edit', 'Kanchipuram, Tamil Nadu', 125000, 'Maroon', 'Wedding', 'hero', '50% 40%', 'kanji', '60% 50%', 'Woven over 42 days for the day you begin.', 'Limited'],
  ['Kasturi Gold Tissue', 'Kerala Kasavu', 'Balaramapuram, Kerala', 27500, 'Gold', 'Wedding', 'kanji', '72% 72%', 'journal', '70% 30%', 'Tissue silk that catches every lamp.', ''],
];

export const PRODUCTS: Product[] = ROWS.map((a, id) => ({
  id,
  slug: slugify(a[0]),
  name: a[0],
  coll: a[1],
  region: a[2],
  price: a[3],
  colour: a[4],
  occ: a[5],
  img: IMG(a[6]),
  pos: a[7],
  img2: IMG(a[8]),
  pos2: a[9],
  line: a[10],
  tag: a[11],
}));

export const productBySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug);

export interface Slide {
  img: string; pos: string; word: string; cap: string; region: string;
  weave: string | null; eyebrow: string; lines: string[]; sub: string;
}
export const SLIDES: Slide[] = [
  { img: IMG('hero'), pos: '45% 60%', word: 'REDISCOVER', cap: 'The New Collection', region: '2026', weave: null, eyebrow: 'THE NEW COLLECTION 2026', lines: ['REDISCOVER', 'YOURSELF.'], sub: 'South Indian silk sarees, for every chapter of you.' },
  { img: IMG('collections'), pos: '72% 40%', word: 'KANJIVARAM', cap: 'Kanjivaram Heritage', region: 'TAMIL NADU', weave: 'Kanjivaram Heritage', eyebrow: 'KANJIVARAM HERITAGE', lines: ['WOVEN IN', 'KANCHIPURAM.'], sub: 'Pure mulberry silk, real zari, temple borders.' },
  { img: IMG('portrait'), pos: '40% 40%', word: 'MYSORE', cap: 'Mysore Silk', region: 'KARNATAKA', weave: 'Mysore Silk', eyebrow: 'MYSORE SILK', lines: ['LIGHT AS', 'A MEMORY.'], sub: 'Featherlight crepe silk with a quiet glow of zari.' },
  { img: IMG('kanji'), pos: '22% 40%', word: 'BRIDAL', cap: 'The Bridal Edit', region: 'TROUSSEAU', weave: 'Bridal Edit', eyebrow: 'THE BRIDAL EDIT 2026', lines: ['FOR THE DAY', 'YOU BEGIN.'], sub: 'Trousseau sarees chosen with your family, by video or WhatsApp.' },
  { img: IMG('journal'), pos: '45% 40%', word: 'KASAVU', cap: 'Kerala Kasavu', region: 'KERALA', weave: 'Kerala Kasavu', eyebrow: 'KERALA KASAVU', lines: ['SAME ROOTS.', 'NEW DREAMS.'], sub: 'Cream and gold for Onam mornings and temple evenings.' },
];

export interface Chapter {
  n: string; word: string; label: string; lines: string[]; body: string;
  towns?: string[]; quote?: string; img: string; pos: string; caption: string; radius: string;
}
export const CHAPTERS: Chapter[] = [
  { n: '01', word: 'ONE', label: 'ORIGIN', lines: ['WHERE', 'HERITAGE MEETS', 'THE MODERN.'], body: 'Rooted in the richness of South Indian textile traditions, Rupaari creates sarees that carry heritage into contemporary life — for the woman who honours her roots, yet crafts her own tomorrow.', img: IMG('portrait'), pos: '40% 40%', caption: 'THE HOUSE OF RUPAARI', radius: '50%' },
  { n: '02', word: 'TWO', label: 'THE ROOTS', lines: ['WOVEN IN', 'SIX TOWNS.'], body: 'Every saree begins in a weaving town with centuries of memory in its looms. We work directly with the families who keep them running.', towns: ['Kanchipuram', 'Mysuru', 'Pochampally', 'Gadwal', 'Balaramapuram', 'Uppada'], img: IMG('loom'), pos: '30% 50%', caption: 'A KANCHIPURAM PIT LOOM', radius: '999px 999px 0 0' },
  { n: '03', word: 'THREE', label: 'THE PEOPLE', lines: ['HANDS THAT', 'REMEMBER.'], body: 'One family, one saree, up to forty-two days on the loom. Their names travel with every piece, so you always know who wove your memory.', img: IMG('arch'), pos: 'center 40%', caption: 'THE TEMPLE TOWNS OF THE SOUTH', radius: '0 50% 0 50%' },
  { n: '04', word: 'FOUR', label: 'THE BELIEF', lines: ['REDISCOVER', 'YOURSELF.'], body: 'Sarees that heal, empower and celebrate you. Tradition is the foundation, not the limit — same roots, new dreams, for every chapter of you.', quote: 'More than a saree, it’s a feeling.', img: IMG('journal'), pos: '45% 40%', caption: 'FOR EVERY CHAPTER OF YOU', radius: '50% 50% 50% 50% / 42% 42% 58% 58%' },
];

export interface CraftStep { t: string; b: string; img: string; pos: string; days: string; radius: string; filter: string }
export const CRAFT_STEPS: CraftStep[] = [
  { t: 'The Silk', b: 'Pure mulberry silk from Karnataka, tested by hand for strength and sheen.', img: IMG('portrait'), pos: '60% 80%', days: 'DAY 01', radius: '999px 999px 0 0', filter: 'none' },
  { t: 'The Dyeing', b: 'Yarn is boiled, dyed in small batches and dried in shade so colour settles deep.', img: IMG('collections'), pos: '10% 60%', days: 'DAY 03', radius: '0', filter: 'saturate(1.3)' },
  { t: 'The Warping', b: 'Thousands of threads are stretched along the street outside the weaver’s home.', img: IMG('loom'), pos: '70% 30%', days: 'DAY 06', radius: '50% 50% 0 0 / 30% 30% 0 0', filter: 'none' },
  { t: 'The Weaving', b: 'Body and border are woven separately on a pit loom, then interlocked by hand.', img: IMG('loom'), pos: '20% 60%', days: 'DAY 10', radius: '999px 999px 0 0', filter: 'none' },
  { t: 'The Zari', b: 'Silver thread dipped in gold forms the temple border, one pass at a time.', img: IMG('hero'), pos: '40% 85%', days: 'DAY 30', radius: '0', filter: 'contrast(1.05)' },
  { t: 'The Finishing', b: 'Checked under daylight, Silk Mark tagged, folded in muslin and signed by the weaver.', img: IMG('kanji'), pos: '30% 50%', days: 'DAY 42', radius: '50% 50% 0 0 / 30% 30% 0 0', filter: 'none' },
];

export interface Memory { q: string; who: string; saree: string; img: string; pos: string }
export const MEMORIES: Memory[] = [
  { q: 'I wore my mother’s colours on my wedding day, in a saree that felt like mine alone.', who: 'MEERA · CHENNAI', saree: 'Thamarai Kanjivaram', img: IMG('hero'), pos: '40% 30%' },
  { q: 'The first saree I bought in ten years. It reminded me who I was before the rush.', who: 'ANJALI · BENGALURU', saree: 'Nila Mysore Crepe', img: IMG('portrait'), pos: '40% 30%' },
  { q: 'Sent to my amma in Kochi. She called to ask who taught me to choose so well.', who: 'DIVYA · LONDON', saree: 'Onam Kasavu', img: IMG('journal'), pos: '50% 30%' },
  { q: 'My grandmother touched the border and said, this is how they used to weave.', who: 'LAKSHMI · HYDERABAD', saree: 'Gadwal Contrast Pallu', img: IMG('collections'), pos: '75% 20%' },
  { q: 'Light enough for a full day of meetings, beautiful enough for the evening.', who: 'PRIYA · MUMBAI', saree: 'Uppada Jamdani', img: IMG('kanji'), pos: '25% 30%' },
  { q: 'Our video consultation felt like shopping with family. Every piece had a story.', who: 'NANDINI · SINGAPORE', saree: 'The Bridal Korvai', img: IMG('arch'), pos: 'center' },
];

export interface Collection { name: string; region: string; weave: string; d: string; img: string; pos: string }
export const COLLECTIONS: Collection[] = [
  { name: 'Kanjivaram Heritage', region: 'TAMIL NADU', weave: 'Kanjivaram Heritage', d: 'Pure mulberry silk, real zari, temple borders woven in Kanchipuram.', img: IMG('collections'), pos: '70% 40%' },
  { name: 'Mysore Silk', region: 'KARNATAKA', weave: 'Mysore Silk', d: 'Featherlight crepe silk with a quiet glow of zari.', img: IMG('portrait'), pos: '40% 40%' },
  { name: 'The Bridal Edit', region: 'TROUSSEAU', weave: 'Bridal Edit', d: 'Chosen with you, for the day you begin.', img: IMG('kanji'), pos: '25% 40%' },
  { name: 'Kerala Kasavu', region: 'KERALA', weave: 'Kerala Kasavu', d: 'Cream and gold for Onam mornings and temple evenings.', img: IMG('journal'), pos: '50% 40%' },
  { name: 'Gadwal & Dharmavaram', region: 'TELANGANA · ANDHRA', weave: 'Gadwal & Dharmavaram', d: 'Contrast borders and pallus that speak across a room.', img: IMG('hero'), pos: '50% 70%' },
];

export interface Featured { l1: string; l2: string; weave: string; d: string; img: string; pos: string }
export const FEATURED: Featured[] = [
  { l1: 'KANJIVARAM', l2: 'HERITAGE', weave: 'Kanjivaram Heritage', d: 'The art of pure silk. A legacy woven over centuries.', img: IMG('kanji'), pos: '30% 40%' },
  { l1: 'MYSORE', l2: 'SILK', weave: 'Mysore Silk', d: 'Featherlight crepe silk with a quiet glow of zari.', img: IMG('portrait'), pos: '40% 40%' },
  { l1: 'POCHAMPALLY', l2: 'IKAT', weave: 'Pochampally Ikat', d: 'Geometry dyed into every thread before it meets the loom.', img: IMG('collections'), pos: '60% 40%' },
  { l1: 'KERALA', l2: 'KASAVU', weave: 'Kerala Kasavu', d: 'Cream and gold for Onam mornings and temple evenings.', img: IMG('journal'), pos: '50% 50%' },
  { l1: 'THE BRIDAL', l2: 'EDIT', weave: 'Bridal Edit', d: 'Trousseau pieces chosen with you, for the day you begin.', img: IMG('hero'), pos: '50% 60%' },
];

export const JOURNAL = [
  { t: 'The six yards my grandmother left me', cat: 'MEMORY', min: '6 MIN', img: IMG('portrait'), pos: '50% 30%' },
  { t: 'Inside a Kanchipuram pit loom', cat: 'CRAFT', min: '8 MIN', img: IMG('loom'), pos: '30% 50%' },
  { t: 'How to care for pure silk, for decades', cat: 'CARE', min: '4 MIN', img: IMG('arch'), pos: 'center 30%' },
];

export const PROMISES = [
  { a: 'Premium', b: 'Quality Fabrics', body: 'Pure mulberry silk and real zari, Silk Mark certified and checked by hand.', img: IMG('kanji'), pos: '30% 50%' },
  { a: 'Authentic', b: 'Handloom Weaves', body: 'Woven on pit looms by weaving families we know by name.', img: IMG('loom'), pos: '30% 50%' },
  { a: 'Elegant', b: 'Designs', body: 'Temple borders and motifs drawn for decades, not seasons.', img: IMG('arch'), pos: 'center' },
  { a: 'Comfort', b: 'All Day Long', body: 'Drape, weight and feel chosen to last from muhurtham to reception.', img: IMG('portrait'), pos: '40% 60%' },
  { a: 'Easy', b: 'Returns & Exchange', body: 'Seven days to decide, with free pickup across India.', img: IMG('collections'), pos: '70% 40%' },
];

/** Demo data — replace with real, consented order events or remove. */
export const LIVE = [
  { id: 0, city: 'CHENNAI' }, { id: 3, city: 'BENGALURU' }, { id: 8, city: 'HYDERABAD' },
  { id: 5, city: 'KOCHI' }, { id: 2, city: 'DUBAI' }, { id: 1, city: 'PUNE' },
];

export const MARQUEE_A = ['Kanjivaram', 'Mysore Silk', 'Pochampally Ikat', 'Gadwal', 'Narayanpet', 'Dharmavaram', 'Kerala Kasavu', 'Uppada', 'Venkatagiri', 'Mangalagiri'];
export const MARQUEE_B = ['Pure Silk', 'Real Zari', 'Handloom', 'Silk Mark', 'Temple Borders', 'Korvai', 'Pallu', 'Muhurtham', 'Trousseau'];

export const SWATCHES = [
  { n: 'Temple Maroon', c: '#5A1520' },
  { n: 'Peacock Teal', c: '#1F4D4A' },
  { n: 'Turmeric Gold', c: '#B8862E' },
];

export const TRUST = ['Silk Mark certified', 'Authentic handloom', 'Free shipping', '7-day returns'];

export const ACCORDION_TITLES = ['THE WEAVE', 'FABRIC & ZARI', 'DIMENSIONS', 'CARE', 'SHIPPING & RETURNS'];
export const accordionBody = (p: Product) => [
  `Woven in ${p.region} on a traditional pit loom. Body and border are woven separately and interlocked by hand (korvai), so the border never fades into the body.`,
  'Pure mulberry silk with real silver zari dipped in gold. Silk Mark certified. Each saree weighs around 700–850 g.',
  'Saree 5.5 m, with an unstitched 0.8 m running blouse piece. Width 47 inches.',
  'Dry clean only. Store folded in a muslin cloth and refold every three months. Keep zari away from perfume.',
  'Free shipping across India. Dispatched within 48 hours. 7-day returns on unworn sarees with the tag intact.',
];

export const FREE_SHIPPING_AT = 10000;
export const GIFT_WRAP = 250;
