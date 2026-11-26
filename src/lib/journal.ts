import type { Tone } from "./content";

export interface Article {
  slug: string;
  title: string;
  kicker: string;
  date: string;
  read: string;
  tone: Tone;
  intro: string;
  body: string[];
}

export const articles: Article[] = [
  {
    slug: "how-to-choose-a-kanjivaram",
    title: "How to choose a Kanjivaram",
    kicker: "Guide",
    date: "2026-11-20",
    read: "4 min read",
    tone: "wine",
    intro: "A good Kanjivaram is bought with the hands as much as the eyes.",
    body: [
      "Start with the weight. A true Kanjivaram feels substantial because the silk is woven thick and the border is woven separately and joined to the body. Hold the saree up: it should fall in heavy, even folds.",
      "Look at the border and the pallu. The zari should sit in the weave and not look stuck on. Check that the motifs on both sides of the border match, and that the join between the border and the body is firm.",
      "Think about when you will wear it. A deep, saturated colour with a wide zari border suits weddings. A softer body with a slimmer border is easier for festivals and everyday occasions.",
      "Finally, ask for the weave and the maker. A piece with a story is easier to care for and to pass on.",
    ],
  },
  {
    slug: "styling-a-saree-for-a-modern-wedding",
    title: "Styling a saree for a modern wedding",
    kicker: "Style",
    date: "2026-11-12",
    read: "3 min read",
    tone: "taupe",
    intro: "Let the silk lead, and keep everything else quiet.",
    body: [
      "When the saree has a rich border, choose a plain blouse in a matching or contrasting solid. When the saree is simple, the blouse can carry the embroidery.",
      "Choose one focus for jewellery: either a statement necklace or statement earrings. Add small pieces to support it.",
      "Pleat neatly and drape the pallu so the best part of the design is visible when you sit. Wear comfortable footwear, because a wedding is long.",
    ],
  },
  {
    slug: "kurtis-for-every-occasion",
    title: "Kurtis for every occasion",
    kicker: "Kurtis",
    date: "2026-11-05",
    read: "3 min read",
    tone: "burgundy",
    intro: "From a long day at work to an evening with family.",
    body: [
      "For work, choose a straight or A-line kurti in cotton or linen with a simple neck and three-quarter sleeves. Pair with trousers or palazzos.",
      "For festivals, an anarkali or a kurti with embroidery in silk or georgette feels dressed up without being heavy.",
      "For gifting, choose a soft colour, a fabric that is easy to care for, and check the size guide on the product page.",
    ],
  },
  {
    slug: "the-craft-behind-the-weave",
    title: "The craft behind the weave",
    kicker: "Craft",
    date: "2026-10-28",
    read: "4 min read",
    tone: "wine",
    intro: "Every saree starts as thread, and as patience.",
    body: [
      "Handwoven silk begins with dyeing the thread, then setting up the loom with thousands of warp threads. A single saree can take days, and a heavy bridal piece can take weeks.",
      "The weaver passes the weft by hand and changes colours for each motif. Small differences in the pattern are the mark of a handwoven piece.",
      "When you buy handwoven, you support the families who keep these skills alive. Read more on the Our Craft page.",
    ],
  },
];

export const findArticle = (slug: string) => articles.find((a) => a.slug === slug);
export const niceDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
