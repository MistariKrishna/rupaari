'use client';
import { useRef, type CSSProperties, type ReactNode } from 'react';
import { useRaf } from '@/hooks/useRaf';
import { useSite } from '@/components/site/SiteProvider';

/** Absolutely-positioned layer that drifts against the scroll. Parent must be position:relative + overflow:hidden. */
export function Parallax({ factor = 0.1, inset = '-12% 0', style, children }: { factor?: number; inset?: string; style?: CSSProperties; children?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { calm } = useSite();
  useRaf(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent || calm) return;
    const r = parent.getBoundingClientRect();
    const vh = window.innerHeight;
    if (r.bottom < -200 || r.top > vh + 200) return;
    el.style.transform = `translate3d(0,${(r.top + r.height / 2 - vh / 2) * -factor}px,0)`;
  });
  return (
    <div ref={ref} style={{ position: 'absolute', inset, willChange: 'transform', ...style }}>
      {children}
    </div>
  );
}
