const download = (name: string, mime: string, body: string) => {
  const blob = new Blob(["﻿" + body], { type: mime + ";charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
const cell = (v: unknown) => {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
export const downloadCsv = (name: string, rows: unknown[][]) => download(name.endsWith(".csv") ? name : `${name}.csv`, "text/csv", rows.map((r) => r.map(cell).join(",")).join("\n"));

const esc = (v: unknown) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
/** Excel opens an HTML table saved as .xls; no library needed in the demo. */
export const downloadXls = (name: string, rows: unknown[][]) =>
  download(
    name.endsWith(".xls") ? name : `${name}.xls`,
    "application/vnd.ms-excel",
    `<table>${rows.map((r, i) => `<tr>${r.map((c) => (i === 0 ? `<th>${esc(c)}</th>` : `<td>${esc(c)}</td>`)).join("")}</tr>`).join("")}</table>`,
  );

/** Open a print-ready page (invoice, label) in a new window. */
export const printHtml = (title: string, body: string) => {
  const w = window.open("", "_blank", "width=860,height=960");
  if (!w) return false;
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>
*{box-sizing:border-box}
body{font:14px/1.55 "Montserrat",system-ui,-apple-system,"Segoe UI",sans-serif;color:#1c1a1a;margin:0;background:#efe9de;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.sheet{max-width:780px;margin:24px auto;padding:44px 48px 40px;background:#fffdf9;border-top:6px solid #680f1a;box-shadow:0 10px 40px rgba(28,26,26,.12)}
.doc-head{display:flex;justify-content:space-between;align-items:flex-start;gap:24px}
.logo img{display:block;height:48px;width:auto;max-width:240px}
.logo-fb{font:500 28px Georgia,"Times New Roman",serif;letter-spacing:.28em;color:#680f1a}
.doc-title{text-align:right}
.doc-title h1{margin:0 0 6px;font:500 13px "Montserrat",system-ui,sans-serif;letter-spacing:.28em;text-transform:uppercase;color:#680f1a}
.doc-title p{margin:0;font-size:13px;color:#6f6560}.doc-title b{color:#1c1a1a}
.rule{height:2px;margin:22px 0 26px;background:linear-gradient(90deg,#c9a24d,#c9a24d 40%,rgba(201,162,77,.15))}
h2{margin:0 0 8px;font:600 11px "Montserrat",system-ui,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#a07f2f}
p{margin:0}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:28px}
.cols p{font-size:14px}
table{width:100%;border-collapse:collapse}
.items{margin-bottom:6px}
.items th{background:#680f1a;color:#f7f1e7;font:600 11px "Montserrat",system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase;padding:11px 12px;text-align:left}
.items td{padding:14px 12px;border-bottom:1px solid #e8dfd0;vertical-align:top}
.items tbody tr:nth-child(even) td{background:#faf5ec}
td.r,th.r{text-align:right}
.sum{width:290px;margin:14px 0 0 auto}
.sum td{padding:7px 12px;font-size:14px}
.sum .grand td{border-top:2px solid #680f1a;padding-top:12px;font:600 18px "Montserrat",system-ui,sans-serif;color:#680f1a}
.muted{color:#6f6560}.small{font-size:12.5px;margin-top:18px}
.doc-foot{margin-top:34px;padding-top:16px;border-top:1px solid #e8dfd0;text-align:center;font-size:12.5px;color:#6f6560}
.doc-foot b{color:#680f1a;font:500 15px Georgia,serif;letter-spacing:.04em}
.box{border:1.5px dashed #680f1a;padding:18px 20px;margin:16px 0}
.addr{font-size:17px;line-height:1.6}
.big{font:600 28px ui-monospace,Consolas,monospace;letter-spacing:.1em;color:#1c1a1a}
.actions{max-width:780px;margin:0 auto 28px;text-align:right}
.actions button{padding:11px 22px;border:0;border-radius:2px;background:#680f1a;color:#f7f1e7;font:600 12px "Montserrat",system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase;cursor:pointer}
.actions button:hover{background:#4a0b13}
@media print{body{background:#fff}.sheet{margin:0;max-width:none;box-shadow:none}.actions{display:none}@page{margin:12mm}}
@media (max-width:560px){.sheet{padding:28px 22px}.cols{grid-template-columns:1fr}.doc-head{flex-direction:column}.doc-title{text-align:left}}
</style></head><body><div class="sheet">${body}</div><div class="actions"><button onclick="window.print()">Print or save as PDF</button></div></body></html>`);
  w.document.close();
  return true;
};

/** Read a file, shrink it and return a small JPEG data URL (keeps localStorage small). */
export const compressImage = (file: File, max = 720): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode"));
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * k);
        c.height = Math.round(img.height * k);
        c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", 0.72));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });

/** Minimal CSV reader (quotes, commas and line breaks inside quotes). */
export const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"' && text[i + 1] === '"') (cur += '"'), i++;
      else if (ch === '"') q = false;
      else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") (row.push(cur), (cur = ""));
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cur);
      cur = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else cur += ch;
  }
  row.push(cur);
  if (row.some((c) => c.trim() !== "")) rows.push(row);
  return rows;
};
