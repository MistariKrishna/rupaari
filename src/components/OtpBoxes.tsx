"use client";

import { useEffect, useRef } from "react";

/** Six single-digit boxes with auto-advance, backspace and paste. */
export default function OtpBoxes({ value, onChange, onComplete, label = "Verification code" }: { value: string[]; onChange: (v: string[]) => void; onComplete?: () => void; label?: string }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => refs.current[0]?.focus(), []);
  const set = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    onChange(value.map((x, k) => (k === i ? d : x)));
    if (d && i < 5) refs.current[i + 1]?.focus();
  };
  return (
    <div className="rp-field">
      <span className="rp-lbl" id="otp-l">{label}</span>
      <div
        className="ck-otp"
        role="group"
        aria-labelledby="otp-l"
        onPaste={(e) => {
          const t = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
          if (!t) return;
          e.preventDefault();
          onChange(Array.from({ length: 6 }, (_, k) => t[k] ?? ""));
          refs.current[Math.min(t.length, 5)]?.focus();
        }}
      >
        {value.map((d, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            value={d}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            aria-label={`Digit ${i + 1}`}
            onChange={(e) => set(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !d && i > 0) refs.current[i - 1]?.focus();
              if (e.key === "Enter" && value.every(Boolean)) onComplete?.();
            }}
          />
        ))}
      </div>
    </div>
  );
}