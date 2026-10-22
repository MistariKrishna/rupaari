export const C = {
  cream: '#F6EEE2',
  ivory: '#FBF7F0',
  sand: '#F1E7D8',
  beige: '#EADFCF',
  line: '#E3D3B8',
  goldLight: '#D9C293',
  gold: '#B08A4E',
  maroon: '#5A1520',
  rose: '#7A2A36',
  wine: '#3B0D14',
  deep: '#2A080D',
  ink: '#2B2B2B',
  muted: '#7A6A60',
  soft: '#6b5a52',
  green: '#2F6B4F',
} as const;

export const F = {
  serif: "var(--font-serif), 'Cormorant Garamond', Georgia, serif",
  sans: "var(--font-sans), Jost, system-ui, sans-serif",
  script: 'var(--font-script), Allura, cursive',
} as const;

export const EASE = 'cubic-bezier(.2,.7,.1,1)';
export const EASE_IO = 'cubic-bezier(.7,0,.2,1)';

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const easeInOut = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
