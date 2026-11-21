# RUPAARI: draft 2 (davaris-style showcase)

Next.js (App Router) + TypeScript + Tailwind CSS. No animation libraries: everything is CSS and a few small hooks.
Colours, fonts and rules come from the RUPAARI Design System 01.0 (Trajan Pro / Cinzel headings, Montserrat body,
no bold display type, Burgundy / Wine / Gold / Ivory / Taupe / Soft Black).

## Run

```bash
npm install
npm run dev          # http://localhost:3000
npm run typecheck
npm run build && npm start
```
Use a NEW empty folder. Fonts are fetched by `next/font/google` on first run, so it needs internet.

## What is animated
- Hero: line-by-line headline reveal, staggered fade-up, background parallax, scroll cue.
- Everything below: `Reveal` (fade-up / scale / side / clip) on scroll, with stagger delays.
- Key figures count up when visible (`Counter`).
- Header: transparent over the hero, solid after scroll, hides on scroll down and returns on scroll up.
- Full-screen menu: circular clip-path reveal with staggered links; page scroll is locked; Esc closes.
- Cards zoom on hover; link arrows slide; route changes fade in (`template.tsx`).
- `prefers-reduced-motion` turns all of it off. Without JavaScript everything is simply visible.

## Replace the stand-ins
- Photos / videos: every image slot is the `Media` component. Put files in `public/images` or `public/videos` and pass
  `image="/images/x.jpg"` or `video="/videos/x.mp4"` (muted, looping, autoplay). Until then it shows animated woven art in brand colours.
- Copy and numbers: `src/lib/content.ts` (figures, collections, process steps are SAMPLE: verify or remove).
- Contact details and social links: `src/lib/site.ts` (empty values are hidden).
- Shop button target: `site.shopHref`.
