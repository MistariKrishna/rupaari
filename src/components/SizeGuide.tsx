"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";

// Body measurements in inches. These are standard Indian kurti sizes: check them against your own measurements before launch.
const ROWS: { size: string; bust: number; waist: number; hip: number; shoulder: number }[] = [
  { size: "S", bust: 36, waist: 30, hip: 38, shoulder: 14 },
  { size: "M", bust: 38, waist: 32, hip: 40, shoulder: 14.5 },
  { size: "L", bust: 40, waist: 34, hip: 42, shoulder: 15 },
  { size: "XL", bust: 42, waist: 36, hip: 44, shoulder: 15.5 },
  { size: "XXL", bust: 44, waist: 38, hip: 46, shoulder: 16 },
  { size: "XXXL", bust: 46, waist: 40, hip: 48, shoulder: 16.5 },
];


/** Front view of a body with the four measuring lines marked */
function BodyFigure() {
  return (
<svg className="szg-fig" viewBox="0 -8 320 438" role="img" aria-label="Where to measure: 1 shoulder, 2 bust, 3 waist, 4 hip">
<defs><linearGradient id="szg-skin" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#dccab0"/><stop offset=".45" stopColor="#f1e5d1"/><stop offset="1" stopColor="#d8c4a8"/></linearGradient></defs>
<ellipse cx="110" cy="416" rx="58" ry="6" fill="#000" opacity=".09"/>
<g fill="url(#szg-skin)" stroke="#b9a58c" strokeWidth="1.3" strokeLinejoin="round">
<path d="M152 88C166 94 172 120 175 150C177 190 184 225 188 252C190 266 190 276 186 284C182 288 177 284 177 276C176 262 170 232 164 200C160 180 156 150 150 120Z"/><path d="M152 88C166 94 172 120 175 150C177 190 184 225 188 252C190 266 190 276 186 284C182 288 177 284 177 276C176 262 170 232 164 200C160 180 156 150 150 120Z" transform="translate(220 0) scale(-1 1)"/>
<rect x="103" y="50" width="14" height="28" rx="6"/>
<path d="M117 70C125 76 144 78 156 86C154 98 150 108 148 118C148 130 149 140 146 150C143 165 138 175 137 188C136 205 152 220 152 240C152 262 148 285 146 305C145 320 140 328 140 340C140 360 133 375 130 396C130 402 135 404 139 410L118 410C119 380 117 350 117 330C117 300 113 280 110 266C107 280 103 300 103 330C103 350 101 380 102 410L81 410C85 404 90 402 90 396C87 375 80 360 80 340C80 328 75 320 74 305C72 285 68 262 68 240C68 220 84 205 83 188C82 175 77 165 74 150C71 140 72 130 72 118C70 108 66 98 64 86C76 78 95 76 103 70Z"/>
<ellipse cx="110" cy="33" rx="17" ry="22"/>
</g>
<path d="M92 32C90 6 130 6 128 32C124 20 116 15 110 15C104 15 96 20 92 32Z" fill="#4a2f22"/><circle cx="110" cy="9" r="8" fill="#4a2f22"/>
<g><line x1="62" y1="84" x2="158" y2="84" stroke="#680f1a" strokeWidth="2" strokeDasharray="5 4"/><circle cx="62" cy="84" r="3" fill="#680f1a"/><circle cx="158" cy="84" r="3" fill="#680f1a"/><line x1="158" y1="84" x2="212" y2="84" stroke="#680f1a" strokeWidth="1" opacity=".45"/><circle cx="224" cy="84" r="10" fill="#680f1a"/><text x="224" y="88" textAnchor="middle" fontSize="12" fontWeight="600" fill="#f7f1e7">1</text><text x="240" y="88" fontSize="13" fill="#4a0b13">Shoulder</text></g>
<g><line x1="68" y1="140" x2="152" y2="140" stroke="#680f1a" strokeWidth="2" strokeDasharray="5 4"/><circle cx="68" cy="140" r="3" fill="#680f1a"/><circle cx="152" cy="140" r="3" fill="#680f1a"/><line x1="152" y1="140" x2="212" y2="140" stroke="#680f1a" strokeWidth="1" opacity=".45"/><circle cx="224" cy="140" r="10" fill="#680f1a"/><text x="224" y="144" textAnchor="middle" fontSize="12" fontWeight="600" fill="#f7f1e7">2</text><text x="240" y="144" fontSize="13" fill="#4a0b13">Bust</text></g>
<g><line x1="76" y1="188" x2="144" y2="188" stroke="#680f1a" strokeWidth="2" strokeDasharray="5 4"/><circle cx="76" cy="188" r="3" fill="#680f1a"/><circle cx="144" cy="188" r="3" fill="#680f1a"/><line x1="144" y1="188" x2="212" y2="188" stroke="#680f1a" strokeWidth="1" opacity=".45"/><circle cx="224" cy="188" r="10" fill="#680f1a"/><text x="224" y="192" textAnchor="middle" fontSize="12" fontWeight="600" fill="#f7f1e7">3</text><text x="240" y="192" fontSize="13" fill="#4a0b13">Waist</text></g>
<g><line x1="60" y1="238" x2="160" y2="238" stroke="#680f1a" strokeWidth="2" strokeDasharray="5 4"/><circle cx="60" cy="238" r="3" fill="#680f1a"/><circle cx="160" cy="238" r="3" fill="#680f1a"/><line x1="160" y1="238" x2="212" y2="238" stroke="#680f1a" strokeWidth="1" opacity=".45"/><circle cx="224" cy="238" r="10" fill="#680f1a"/><text x="224" y="242" textAnchor="middle" fontSize="12" fontWeight="600" fill="#f7f1e7">4</text><text x="240" y="242" fontSize="13" fill="#4a0b13">Hip</text></g>
</svg>
  );
}

/** "Size guide" link and a chart in a dialog. Used for kurtis only. */
export default function SizeGuide() {
  const [open, setOpen] = useState(false);
  const [cm, setCm] = useState(false);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const v = (n: number) => (cm ? String(Math.round(n * 2.54 * 10) / 10) : String(n));

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const btn = opener.current;
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      btn?.focus();
    };
  }, [open]);

  return (
    <>
      <button ref={opener} type="button" className="szg-link" onClick={() => setOpen(true)}>
        Size guide
      </button>
      {open && (
        <div className="szg-back" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div className="szg" role="dialog" aria-modal="true" aria-label="Kurti size guide">
            <div className="szg-head">
              <h2>Size guide</h2>
              <button ref={closeBtn} type="button" className="szg-x" aria-label="Close size guide" onClick={() => setOpen(false)}>
                <Icon name="close" />
              </button>
            </div>
            <div className="szg-unit" role="group" aria-label="Unit">
              <button type="button" data-on={!cm} onClick={() => setCm(false)}>Inches</button>
              <button type="button" data-on={cm} onClick={() => setCm(true)}>Centimetres</button>
            </div>
            <div className="szg-grid">
            <BodyFigure />
            <div className="szg-scroll">
              <table className="szg-table">
                <thead>
                  <tr><th>Size</th><th>Bust</th><th>Waist</th><th>Hip</th><th>Shoulder</th></tr>
                </thead>
                <tbody>
                  {ROWS.map((r) => (
                    <tr key={r.size}><th scope="row">{r.size}</th><td>{v(r.bust)}</td><td>{v(r.waist)}</td><td>{v(r.hip)}</td><td>{v(r.shoulder)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
            <p className="szg-note">These are body measurements. Kurtis are cut with a little ease, so pick the size that matches your bust first.</p>
            <ul className="szg-how">
              <li><b>1 Shoulder:</b> from one shoulder edge to the other, across the back.</li>
              <li><b>2 Bust:</b> around the fullest part, keeping the tape level.</li>
              <li><b>3 Waist:</b> around the narrowest part of your waist.</li>
              <li><b>4 Hip:</b> around the fullest part of your hips.</li>
            </ul>
            <p className="szg-note">Between two sizes? Choose the larger one.</p>
          </div>
        </div>
      )}
    </>
  );
}