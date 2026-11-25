"use client";

import { useState } from "react";

export interface Point {
  label: string;
  value: number;
}

/** Round a maximum up to a tidy number that divides into four equal steps (1, 2, 4, 8 or 10 times a power of ten). */
const niceMax = (m: number) => {
  const e = Math.pow(10, Math.floor(Math.log10(m)));
  const f = m / e;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 4 ? 4 : f <= 8 ? 8 : 10) * e;
};
const trim = (n: number) => String(Math.round(n * 10) / 10);
/** Short axis numbers: 25K, 1.5L (lakh), 2Cr (crore). */
const compact = (n: number) => (n >= 1e7 ? `${trim(n / 1e7)}Cr` : n >= 1e5 ? `${trim(n / 1e5)}L` : n >= 1e3 ? `${trim(n / 1e3)}K` : trim(n));

/** Small responsive line chart (SVG) with a value axis on the left. Hover or focus a point for its value. */
export function LineChart({ points, fmt = (n) => String(n), height = 200 }: { points: Point[]; fmt?: (n: number) => string; height?: number }) {
  const [hi, setHi] = useState<number | null>(null);
  const W = 640, H = height, pl = 54, pr = 12, pt = 14, pb = 24;
  const max = niceMax(Math.max(1, ...points.map((p) => p.value)));
  const sym = fmt(1).trim().startsWith("₹") ? "₹" : "";
  const x = (i: number) => pl + (points.length <= 1 ? 0 : (i / (points.length - 1)) * (W - pl - pr));
  const y = (v: number) => pt + (1 - v / max) * (H - pt - pb);
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const area = points.length ? `${path} L${x(points.length - 1).toFixed(1)},${H - pb} L${x(0).toFixed(1)},${H - pb} Z` : "";
  const step = Math.max(1, Math.ceil(points.length / 6));
  const h = hi != null ? points[hi] : null;
  return (
    <div className="adm-chart" style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Line chart" onMouseLeave={() => setHi(null)}>
        <defs>
          <linearGradient id="admArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c8294f" stopOpacity="0.28" />
            <stop offset="1" stopColor="#c8294f" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line x1={pl} x2={W - pr} y1={y(max * t)} y2={y(max * t)} className="adm-grid" />
            <text x={pl - 10} y={y(max * t) + 4} textAnchor="end" className="adm-axis adm-axis-y">{`${sym}${compact(max * t)}`}</text>
          </g>
        ))}
        <path d={area} className="adm-area" />
        <path d={path} className="adm-line" />
        {points.map((p, i) => (
          <g key={i}>
            <rect x={x(i) - (W / points.length) / 2} y={0} width={W / points.length} height={H} fill="transparent" onMouseEnter={() => setHi(i)} onFocus={() => setHi(i)} tabIndex={0} aria-label={`${p.label}: ${fmt(p.value)}`} />
            {hi === i && <circle cx={x(i)} cy={y(p.value)} r={4.5} className="adm-dot" />}
          </g>
        ))}
        {points.map((p, i) => (i % step === 0 ? <text key={`t${i}`} x={x(i)} y={H - 6} textAnchor="middle" className="adm-axis">{p.label}</text> : null))}
      </svg>
      {h && (
        <div className="adm-tip" style={{ left: `${(x(hi!) / W) * 100}%` }}>
          <b>{fmt(h.value)}</b>
          <span>{h.label}</span>
        </div>
      )}
    </div>
  );
}

/** Horizontal bars with a label and value; the longest bar fills the row. */
export function BarList({ items, fmt = (n) => String(n), empty = "No data in this period" }: { items: { label: string; value: number; sub?: string }[]; fmt?: (n: number) => string; empty?: string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  if (!items.length) return <p className="adm-sub">{empty}</p>;
  return (
    <ul className="adm-bars">
      {items.map((i) => (
        <li key={i.label}>
          <div className="adm-bar-r">
            <span className="adm-bar-l">{i.label}</span>
            <span className="adm-bar-v">{fmt(i.value)}</span>
          </div>
          <div className="adm-bar-t">
            <span style={{ width: `${Math.max(2, (i.value / max) * 100)}%` }} />
          </div>
          {i.sub && <span className="adm-hint">{i.sub}</span>}
        </li>
      ))}
    </ul>
  );
}