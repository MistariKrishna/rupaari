'use client';
import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode, type MouseEventHandler } from 'react';
import { EASE } from '@/lib/theme';
import { useSite } from '@/components/site/SiteProvider';

interface RevealProps {
  as?: ElementType;
  delay?: number;
  style?: CSSProperties;
  className?: string;
  href?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  children?: ReactNode;
}

/** Fades + lifts its content in the first time it scrolls into view. */
export function Reveal({ as: Tag = 'div', delay = 0, style, children, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [on, setOn] = useState(false);
  const { calm } = useSite();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const base = style?.transform ?? '';
  const hidden = `${calm ? '' : 'translateY(28px)'} ${base}`.trim() || 'none';
  return (
    <Tag
      ref={ref}
      {...rest}
      style={{
        ...style,
        opacity: on ? 1 : 0,
        transform: on ? base || 'none' : hidden,
        transition: `opacity .9s ease ${delay}ms, transform 1s ${EASE} ${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}
