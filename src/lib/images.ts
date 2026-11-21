// ONE place to wire every photo and video.
// 1. Put files in /public using the exact names below (see IMAGE_GUIDE.md for sizes + prompts).
// 2. Flip USE_PHOTOS (and USE_VIDEOS) to true. Until then the animated woven art shows.

import type { Product } from "./products";

export const USE_PHOTOS = true;
export const USE_VIDEOS = true;

export interface Slot {
  image?: string;
  video?: string;
  poster?: string;
  alt?: string;
}

const p = (image: string, alt = ""): Slot => (USE_PHOTOS ? { image, alt } : {});
const v = (video: string, poster: string, alt = ""): Slot =>
  USE_VIDEOS ? { video, poster } : USE_PHOTOS ? { image: poster, alt } : {};

/** Product photo slot: public/images/products/<product-id>.jpg */
export const productSlot = (product: Pick<Product, "id" | "name">): Slot => p(`/images/products/${product.id}.jpg`, product.name);

export const images = {
  /** Home hero: 16:9 (video 1920x1080, poster still 2560x1440) */
  hero: v("/videos/hero2.mp4", "Silk saree with gold zari border"),

  /** Header "Sarees" menu feature card (The Bridal Edit): 3:2 (1200x800) */
  nav: { bridal: p("/images/nav-bridal-edit.jpg", "The Bridal Edit") },

  /** Home category cards: 2:3 (1600x2400), keyed by category slug */
  collections: {
    sarees: p("/images/collection-sarees.png", "Silk sarees"),
    kurtis: p("/images/collection-kurtis.png", "Handwoven silk kurtis"),
    "gift-craft": p("/images/collection-gift-craft.png", "Saree gift packaging"),
  } as Record<string, Slot>,

  /** Home "shop by weave" tiles: 1:1 (1000x1000), keyed by weave slug */
  weaves: {
    kanjivaram: p("/images/weave-kanjivaram.jpg", "Kanjivaram silk"),
    mysore: p("/images/weave-mysore.jpg", "Mysore silk"),
    kasavu: p("/images/weave-kasavu.jpg", "Kerala Kasavu"),
    gadwal: p("/images/weave-gadwal.jpg", "Gadwal and Dharmavaram silk"),
    pochampally: p("/images/weave-pochampally.jpg", "Pochampally ikat"),
    uppada: p("/images/weave-uppada.jpg", "Uppada and Venkatagiri"),
  } as Record<string, Slot>,

  /** Home "shop by occasion" cards: 4:5 (1600x2000), keyed by occasion slug */
  occasions: {
    wedding: p("/images/occasion-wedding.jpg", "Wedding silk saree"),
    festive: p("/images/occasion-festive.jpg", "Festive silk saree"),
    office: p("/images/occasion-office.jpg", "Light handloom saree"),
    gifting: p("/images/occasion-gifting.jpg", "A saree prepared as a gift"),
  } as Record<string, Slot>,

  /** Collections pages: banner 2560x642 (burgundy overlay is added in code) */
  collectionBanner: p("/images/collections-banner.jpeg"),

  /** /collections cards: 4:5 (1600x2000), keyed by collection slug */
  collectionCards: {
    kanjivaram: p("/images/collection-kanjivaram.png", "Kanjivaram Heritage"),
    mysore: p("/images/collection-mysore.png", "Mysore Silk"),
    kasavu: p("/images/collection-kasavu.png", "Kerala Kasavu"),
    gadwal: p("/images/collection-gadwal.png", "Gadwal and Dharmavaram"),
    pochampally: p("/images/collection-pochampally.png", "Pochampally Ikat"),
    uppada: p("/images/collection-uppada.png", "Uppada and Venkatagiri"),
  } as Record<string, Slot>,

  /** Home closing consultation banner: 16:9 (2560x1440) */
  cta: p("/images/cta.jpg"),

  /** Inner page hero bands: 2:1 (2560x1280), subject in the centre */
  pages: {
    about: p("/images/page-about.jpg"),
    craft: p("/images/page-craft.jpg"),
    sustainability: p("/images/page-sustainability.jpg"),
    contact: p("/images/page-contact.jpg"),
    sarees: p("/images/page-sarees.jpg"),
    kurtis: p("/images/page-kurtis.jpg"),
    "gift-craft": p("/images/page-gift-craft.jpg"),
  } as Record<string, Slot>,

  /** About page portrait: 4:5 (1600x2000) */
  aboutStory: p("/images/about-story.jpg", "A RUPAARI weaver at work"),

  /** Craft page pair: 4:3 (1600x1200) */
  craft: [p("/images/craft-1.jpg", "Zari border being woven"), p("/images/craft-2.jpg", "Silk pallu detail")] as Slot[],

  /** Sustainability page pair: 4:5 (1600x2000) */
  sustainability: [p("/images/sustainability-1.jpg", "Natural dye ingredients"), p("/images/sustainability-2.jpg", "Handloom detail in daylight")] as Slot[],
};