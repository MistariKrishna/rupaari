# Rupaari — Next.js + TypeScript

Production port of the **Rupaari Website v7** design: a home page with motion-led storytelling, a filterable sarees listing, and product detail pages, plus a bag, search, and menu.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run typecheck
```

Requires Node 18.18+ (Node 20 LTS recommended).

## Stack

- **Next.js 15 (App Router)**, **React 19**, **TypeScript (strict)**
- No UI or animation libraries. Motion uses a small `requestAnimationFrame` hook (`hooks/useRaf.ts`), the Web Animations API, and CSS transitions.
- Fonts load via `next/font/google`: Cormorant Garamond (serif), Jost (sans), and Allura (script).

## Routes

| Route | File |
| --- | --- |
| `/` | `app/page.tsx` → `components/home/*` |
| `/sarees` (`?weave=…`, `?occ=…`) | `app/sarees/page.tsx` → `components/shop/CollectionView.tsx` |
| `/sarees/[slug]` | `app/sarees/[slug]/page.tsx` → `components/shop/ProductView.tsx` (statically generated) |

## Structure

```
app/                 layout (fonts, providers), routes, globals.css (hover states + a few responsive rules)
components/site/     SiteProvider (bag, wishlist, toast, page-wipe navigation), Header, Menu, Search,
                     BagDrawer, Footer, Loader, Cursor, ScrollProgress, LivePopup, FloatingButtons, Toast
components/home/     Hero, Story, Marquee, Craft, Memory, Collections, Featured, NewArrivals, Journey, Why
components/shop/     CollectionView, ProductView
components/ui/       Reveal (scroll-in), Parallax, ProductCard, Eyebrow
lib/data.ts          products, slides, chapters, craft steps, copy — the single source of content
lib/theme.ts         colour + font tokens, easing curves
public/assets/       images + logo
```

## Motion inventory

- **Loader:** the logo scales in while a gold line fills.
- **Page wipe:** a maroon curtain plays between routes (`navigate()` in `SiteProvider`).
- **Hero:** a 3D arch carousel with autoplay, a progress bar, pause, arrow keys, swipe, and mouse tilt. It also has gold sparkles on a canvas that move away from the cursor, an animated silk ribbon (SVG), a rotating badge, and a blurred background that cross-fades.
- **Our Story:** pinned, with 4 chapters driven by scroll, a gold thread that draws itself, a photo frame that changes shape, and a chapter progress bar.
- **Marquee:** two counter-scrolling rows that speed up and skew with scroll velocity.
- **Our Craft:** pinned, with 6 steps that scroll sideways, a loom-thread background that fills in, a day counter from 01 to 42, and a moving shuttle on the progress bar.
- **Memory:** the headline fills with ink on scroll, and two columns of testimonial cards scroll endlessly.
- **Collections:** expanding panels with an autoplay timer; hover takes control.
- **Featured:** a magnifying lens that follows the cursor and drifts on its own when idle.
- **New Arrivals:** an endless, draggable strip with 3D tilt and a silk shine.
- **Journey:** "STORIES" filled with a photo that pans on scroll, and journal cards that fan out.
- **Why Rupaari:** tiles that flip in sequence, and a rotating seal.
- **Footer:** the RUPAARI letters rise with a gold shimmer, plus a live Kanchipuram clock with a loom status message.
- **Global:** a gold cursor ring (on mouse and trackpad devices only), magnetic CTAs (`data-mag`), a reading progress bar, a header that hides on scroll, and a fly-to-bag animation.

When the visitor has `prefers-reduced-motion` set, ambient motion drops to about 25% speed. Slide-up and lift effects become simple fades, and the page wipe, fly-to-bag animation, parallax, tilt and magnetic pull are switched off.

## Before going live

- **Images:** `public/assets/img-*.png` are crops from the low-resolution mock. Replace them with the real photography and consider moving to `next/image`.
- **Data:** content lives in `lib/data.ts`. Swap it for your CMS or commerce API, such as Shopify Storefront or Medusa.
- **Live popup:** `LIVE` in `lib/data.ts` is demo social proof. Wire it to real orders or remove `<LivePopup />` from `SiteChrome`.
- **Bag and wishlist:** both persist to `localStorage` only. Checkout, account, search indexing, and newsletter submission are stubs that show a toast.
- **Copy:** the story chapters 02–04, the craft step text, the testimonials, and the promise text are drafts.
