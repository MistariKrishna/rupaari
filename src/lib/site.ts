// Site-wide settings. Fill in real details; empty values are hidden on the site.
export const site = {
  name: "RUPAARI",
  tagline: "Rediscover Yourself",
  contact: {
    address: "",
    phone: "",
    email: "",
  },
  shopHref: "/collections/sarees", // point to your online shop when it exists
  social: [
    { name: "Instagram", icon: "instagram", href: "" },
    { name: "Facebook", icon: "facebook", href: "" },
    { name: "Pinterest", icon: "pinterest", href: "" },
    { name: "LinkedIn", icon: "linkedin", href: "" },
  ] as const,
};

export const menu = [
  { label: "Home", href: "/" },
  {
    label: "Collections",
    href: "/collections/sarees",
    children: [
      { label: "Sarees", href: "/collections/sarees" },
      { label: "Kurtis", href: "/collections/kurtis" },
      { label: "Gift Craft", href: "/collections/gift-craft" },
    ],
  },
  {
    label: "About Us",
    href: "/about",
    children: [
      { label: "Our Story", href: "/about" },
      { label: "Principles", href: "/about#principles" },
    ],
  },
  { label: "The Loom", href: "/craft" },
  { label: "Sustainability", href: "/sustainability" },
  { label: "Contact", href: "/contact" },
];

// Header navigation, matching the navigation design sheet.
// Journal and Book a Consultation point at existing pages until those pages exist.
export const nav = {
  sarees: {
    label: "Sarees",
    href: "/collections/sarees",
    discover: [
      { label: "All Sarees", href: "/collections/sarees" },
      { label: "New Arrivals", href: "/collections/sarees?sort=new" },
      { label: "Bridal Edit", href: "/collections/sarees?occasion=wedding" },
      { label: "View All Collections", href: "/collections" },
    ],
    weaves: [
      { label: "Kanjivaram Heritage", href: "/collections/kanjivaram" },
      { label: "Mysore Silk", href: "/collections/mysore" },
      { label: "Kerala Kasavu", href: "/collections/kasavu" },
      { label: "Gadwal & Dharmavaram", href: "/collections/gadwal" },
      { label: "Pochampally Ikat", href: "/collections/pochampally" },
      { label: "Uppada & Venkatagiri", href: "/collections/uppada" },
    ],
    feature: {
      title: "The Bridal Edit",
      line: "Silks for a new chapter, chosen with care.",
      href: "/collections/sarees?occasion=wedding",
    },
  },
  kurtis: {
    label: "Kurtis",
    href: "/collections/kurtis",
    discover: [
      { label: "All Kurtis", href: "/collections/kurtis" },
      { label: "New Arrivals", href: "/collections/kurtis?sort=new" },
      { label: "Pure Cotton Wear", href: "/collections/kurtis?wear=pure-cotton" },
      { label: "Silk Wear", href: "/collections/kurtis?wear=silk" },
      { label: "Daily & Casual Wear", href: "/collections/kurtis?wear=daily-casual" },
      { label: "Professional Wear", href: "/collections/kurtis?wear=professional" },
      { label: "Party Wear", href: "/collections/kurtis?wear=party" },
      { label: "Festive Wear", href: "/collections/kurtis?wear=festive" },
      { label: "Traditional & Cultural Wear", href: "/collections/kurtis?wear=traditional" },
      { label: "Seasonal Collection", href: "/collections/kurtis?wear=seasonal" },
    ],
    style: [
      { label: "Anarkali Kurti", href: "/collections/kurtis?style=anarkali" },
      { label: "A-Line Kurti", href: "/collections/kurtis?style=a-line" },
      { label: "Straight Cut Kurti", href: "/collections/kurtis?style=straight" },
      { label: "Kaftan Kurti", href: "/collections/kurtis?style=kaftan" },
      { label: "Peplum Kurti", href: "/collections/kurtis?style=peplum" },
      { label: "Chikankari Kurti", href: "/collections/kurtis?style=chikankari" },
      { label: "Jacket Or Cape Kurti", href: "/collections/kurtis?style=jacket-cape" },
      { label: "Corset - Style Kurti", href: "/collections/kurtis?style=corset" },
      { label: "Tunic - Style Kurti", href: "/collections/kurtis?style=tunic" },
      { label: "Angrakha Anarkali Kurti", href: "/collections/kurtis?style=angrakha-anarkali" },
    ],
    sleeveNeck: [
      { label: "Three-Quarter Sleeves", href: "/collections/kurtis?sleeve=three-quarter" },
      { label: "Long Sleeves", href: "/collections/kurtis?sleeve=long" },
      { label: "Sleeveless", href: "/collections/kurtis?sleeve=sleeveless" },
      { label: "Flared Sleeves", href: "/collections/kurtis?sleeve=flared" },
      { label: "V-Neck", href: "/collections/kurtis?neck=v" },
      { label: "Sweetheart Neck", href: "/collections/kurtis?neck=sweetheart" },
      { label: "Round Neck", href: "/collections/kurtis?neck=round" },
      { label: "Mandarin Collar", href: "/collections/kurtis?neck=mandarin" },
      { label: "Scoop Neck", href: "/collections/kurtis?neck=scoop" },
      { label: "High Neck", href: "/collections/kurtis?neck=high" },
    ],
    feature: {
      title: "The Banarasi Silk Kurti Edit",
      line: "Silks for a new chapter, chosen with care.",
      href: "/collections/kurtis?sort=new",
    },
  },
  occasions: {
    label: "Occasions",
    href: "/occasions",
    links: [
      { label: "Wedding", href: "/collections/sarees?occasion=wedding" },
      { label: "Festive", href: "/collections/sarees?occasion=festive" },
      { label: "Office & Celebration", href: "/collections/sarees?occasion=office" },
      { label: "Gifting", href: "/collections/sarees?occasion=gifting" },
      { label: "View All Occasions", href: "/occasions" },
    ],
  },
  about: {
    label: "About",
    href: "/about",
    links: [
      { label: "Our Story", href: "/about" },
      { label: "Our Craft", href: "/craft" },
      { label: "Journal", href: "/sustainability" },
    ],
    action: [
      { label: "Book a Consultation", href: "/contact" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
};

/** Sign-in pages are standalone screens: no header, footer or bottom nav. */
export const AUTH_PATHS = ["/login", "/signup", "/forgot-password"];
export const isAuthPath = (path: string) => AUTH_PATHS.some((p) => path === p || path.startsWith(p + "/"));