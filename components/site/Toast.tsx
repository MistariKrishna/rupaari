'use client';
import { C, F, EASE } from '@/lib/theme';
import { useSite } from './SiteProvider';

export function Toast() {
  const { toastState } = useSite();
  return (
    <div
      aria-live="polite"
      style={{
        position: 'fixed', left: '50%', bottom: 28, zIndex: 120,
        transform: `translate(-50%, ${toastState.on ? 0 : 20}px)`, opacity: toastState.on ? 1 : 0,
        transition: `transform .5s ${EASE}, opacity .4s`,
        background: C.wine, color: C.sand, padding: '14px 22px', font: `400 13.5px ${F.sans}`, letterSpacing: '.04em',
        pointerEvents: 'none', boxShadow: '0 14px 40px rgba(59,13,20,.3)', whiteSpace: 'nowrap',
      }}
    >
      {toastState.msg}
    </div>
  );
}
