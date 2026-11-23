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
  const w = window.open("", "_blank", "width=820,height=900");
  if (!w) return false;
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>
body{font:14px/1.5 system-ui,sans-serif;color:#1c1a1a;margin:32px}h1{font:500 22px Georgia,serif;letter-spacing:.12em;color:#680f1a;margin:0}
table{width:100%;border-collapse:collapse;margin:16px 0}th,td{border-bottom:1px solid #ddd;padding:8px;text-align:left}td.r,th.r{text-align:right}
.muted{color:#6f6560}.box{border:1px dashed #1c1a1a;padding:16px;margin:12px 0}.big{font:500 26px monospace;letter-spacing:.1em}
@media print{button{display:none}}</style></head><body>${body}<p><button onclick="window.print()">Print</button></p></body></html>`);
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
