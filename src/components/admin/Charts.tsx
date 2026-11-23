"use client";

import { useState } from "react";

export interface Point {
  label: string;
  value: number;
}

/** Small responsive line chart (SVG). Hover or focus a point for its value. */
export function LineChart({ points, fmt = (n) => String(n), height = 200 }: { points: Point[]; fmt?: (n: number) => string; height?: number }) {
  const [hi, setHi] = useState<number | null>(null);
  const W = 640, H = height, pl = 8, pr = 8, pt = 14, pb = 22;
  const max = Math.max(1, ...points.map((p) => p.value));
  const x = (i: number) => pl + (points.length <= 1 ? 0 : (i / (points.length - 1)) * (W - pl - pr));
  const y = (v: number) => pt + (1 - v / max) * (H - pt - pb);
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const area = points.length ? `${path} L${x(points.length - 1).toFixed(1)},${H - pb} L${x(0).toFixed(1)},${H - pb} Z` : "";
  const step = Math.max(1, Math.ceil(points.length / 6));
  const h = hi != null ? points[hi] : null;
  return (
    <div className="adm-chart" style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Line chart" onMouseLeave={() => setHi(null)}>
        {[0, 0.5, 1].map((t) => (
          <line key={t} x1={pl} x2={W - pr} y1={y(max * t)} y2={y(max * t)} className="adm-grid" />
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
