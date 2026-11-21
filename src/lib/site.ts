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
      { label: "Gifting", href: "/collections/gift-craft" },
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
    links: [
      { label: "All Kurtis", href: "/collections/kurtis" },
      { label: "New Arrivals", href: "/collections/kurtis?sort=new" },
      { label: "View All Collections", href: "/collections" },
    ],
  },
  occasions: {
    label: "Occasions",
    href: "/collections/sarees",
    links: [
      { label: "Wedding", href: "/collections/sarees?occasion=wedding" },
      { label: "Festive", href: "/collections/sarees?occasion=festive" },
      { label: "Office & Celebration", href: "/collections/sarees?occasion=office" },
      { label: "Gifting", href: "/collections/gift-craft" },
      { label: "View All Occasions", href: "/collections/sarees" },
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