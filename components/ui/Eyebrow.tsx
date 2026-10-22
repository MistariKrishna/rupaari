import type { ReactNode } from 'react';
import { C, F } from '@/lib/theme';

export function Eyebrow({ children, color = C.gold, line = false }: { children: ReactNode; color?: string; line?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      {line ? (
        <span style={{ width: 28, height: 1, background: color }} />
      ) : (
        <span style={{ width: 7, height: 7, background: color, transform: 'rotate(45deg)' }} />
      )}
      <span style={{ font: `400 11.5px ${F.sans}`, letterSpacing: '.26em', color }}>{children}</span>
    </div>
  );
}
