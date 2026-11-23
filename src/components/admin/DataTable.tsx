"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { downloadCsv } from "@/lib/admin/export";
import AIcon from "./AIcon";
import { Btn, Empty, useQ } from "./ui";

export interface Col<T> {
  key: string;
  label: string;
  render: (r: T) => ReactNode;
  sort?: (r: T) => string | number;
  /** plain value for CSV export (defaults to the sort value) */
  csv?: (r: T) => string | number;
  className?: string;
  /** hidden on phones when the table turns into cards */
  hideOnMobile?: boolean;
}
interface Props<T> {
  rows: T[];
  cols: Col<T>[];
  rowKey: (r: T) => string;
  href?: (r: T) => string;
  pageSize?: number;
  bulk?: { label: string; danger?: boolean; run: (ids: string[]) => void }[];
  exportName?: string;
  defaultSort?: { key: string; dir: "asc" | "desc" };
  emptyTitle?: string;
  emptyText?: string;
  emptyAction?: ReactNode;
}

export default function DataTable<T>({ rows, cols, rowKey, href, pageSize = 10, bulk, exportName, defaultSort, emptyTitle = "Nothing here yet", emptyText, emptyAction }: Props<T>) {
  const router = useRouter();
  const q = useQ();
  const [sort, setSort] = useState(defaultSort ?? null);
  const [picked, setPicked] = useState<string[]>([]);

  const sorted = useMemo(() => {
    const col = cols.find((c) => c.key === sort?.key);
    if (!col?.sort || !sort) return rows;
    const f = col.sort;
    return [...rows].sort((a, b) => {
      const x = f(a), y = f(b);
      const r = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y));
      return sort.dir === "asc" ? r : -r;
    });
  }, [rows, cols, sort]);

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const page = Math.min(pages, Math.max(1, parseInt(q.get("page", "1"), 10) || 1));
  const view = sorted.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => {
    setPicked((p) => {
      const n = p.filter((id) => rows.some((r) => rowKey(r) === id));
      return n.length === p.length ? p : n;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  const allOn = view.length > 0 && view.every((r) => picked.includes(rowKey(r)));
  const toggleAll = () => setPicked((p) => (allOn ? p.filter((id) => !view.some((r) => rowKey(r) === id)) : Array.from(new Set([...p, ...view.map(rowKey)]))));
  const exportCsv = () =>
    downloadCsv(exportName ?? "export", [cols.map((c) => c.label), ...sorted.map((r) => cols.map((c) => c.csv?.(r) ?? c.sort?.(r) ?? ""))]);

  if (rows.length === 0) return <Empty title={emptyTitle} text={emptyText} action={emptyAction} />;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(sorted.length, page * pageSize);
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);

  return (
    <div className="adm-tbl">
      {(bulk || exportName) && (
        <div className="adm-tbl-bar">
          {bulk && picked.length > 0 ? (
            <>
              <span className="adm-tbl-sel">{picked.length} selected</span>
              {bulk.map((b) => (
                <Btn key={b.label} size="sm" variant={b.danger ? "danger" : "ghost"} onClick={() => b.run(picked)}>
                  {b.label}
                </Btn>
              ))}
              <Btn size="sm" variant="ghost" onClick={() => setPicked([])}>Clear</Btn>
            </>
          ) : (
            <span className="adm-tbl-count">{sorted.length} {sorted.length === 1 ? "result" : "results"}</span>
          )}
          <span className="adm-grow" />
          {exportName && (
            <Btn size="sm" variant="ghost" icon="download" onClick={exportCsv}>
              Export CSV
            </Btn>
          )}
        </div>
      )}
      <div className="adm-tbl-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              {bulk && (
                <th className="adm-cb">
                  <input type="checkbox" checked={allOn} onChange={toggleAll} aria-label="Select all on this page" />
                </th>
              )}
              {cols.map((c) => (
                <th key={c.key} className={`${c.className ?? ""} ${c.hideOnMobile ? "adm-hm" : ""}`} aria-sort={sort?.key === c.key ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}>
                  {c.sort ? (
                    <button type="button" className="adm-th" onClick={() => setSort((s) => (s?.key === c.key ? { key: c.key, dir: s.dir === "asc" ? "desc" : "asc" } : { key: c.key, dir: "asc" }))}>
                      {c.label}
                      <AIcon name={sort?.key === c.key ? (sort.dir === "asc" ? "arrow-up" : "arrow-down") : "chevron-down"} className={sort?.key === c.key ? "" : "adm-dim"} />
                    </button>
                  ) : (
                    c.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {view.map((r) => {
              const id = rowKey(r);
              const go = href?.(r);
              return (
                <tr
                  key={id}
                  className={go ? "is-link" : ""}
                  onClick={(e) => {
                    if (!go || (e.target as HTMLElement).closest("a,button,input,label,select,textarea")) return;
                    router.push(go);
                  }}
                >
                  {bulk && (
                    <td className="adm-cb">
                      <input type="checkbox" checked={picked.includes(id)} onChange={() => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))} aria-label="Select row" />
                    </td>
                  )}
                  {cols.map((c) => (
                    <td key={c.key} data-label={c.label} className={`${c.className ?? ""} ${c.hideOnMobile ? "adm-hm" : ""}`}>
                      {c.render(r)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="adm-pager">
          <span className="adm-tbl-count">
            {from}–{to} of {sorted.length}
          </span>
          <span className="adm-grow" />
          <button type="button" className="adm-pg" disabled={page <= 1} onClick={() => q.set({ page: String(page - 1) })} aria-label="Previous page">
            <AIcon name="chevron-left" />
          </button>
          {nums.map((n, i) => (
            <span key={n} className="adm-pgs">
              {i > 0 && n - nums[i - 1] > 1 && <span className="adm-dim">…</span>}
              <button type="button" className={`adm-pg ${n === page ? "is-on" : ""}`} aria-current={n === page ? "page" : undefined} onClick={() => q.set({ page: String(n) })}>
                {n}
              </button>
            </span>
          ))}
          <button type="button" className="adm-pg" disabled={page >= pages} onClick={() => q.set({ page: String(page + 1) })} aria-label="Next page">
            <AIcon name="chevron-right" />
          </button>
        </div>
      )}
    </div>
  );
}

/** Search box + filters, all stored in the URL so a view can be bookmarked. */
export function Toolbar({ placeholder = "Search", children }: { placeholder?: string; children?: ReactNode }) {
  const q = useQ();
  const [v, setV] = useState(q.get("q"));
  const cur = q.get("q");
  useEffect(() => setV(cur), [cur]);
  useEffect(() => {
    if (v === cur) return;
    const t = setTimeout(() => q.set({ q: v || undefined }), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v]);
  return (
    <div className="adm-toolbar">
      <div className="adm-search">
        <AIcon name="search" />
        <input value={v} onChange={(e) => setV(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
        {v && (
          <button type="button" className="adm-ibtn" aria-label="Clear search" onClick={() => setV("")}>
            <AIcon name="close" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

export function FilterSelect({ param, label, options }: { param: string; label: string; options: { value: string; label: string }[] }) {
  const q = useQ();
  return (
    <label className="adm-fsel">
      <span className="adm-sr">{label}</span>
      <select className="adm-in" value={q.get(param)} onChange={(e) => q.set({ [param]: e.target.value || undefined })}>
        <option value="">{label}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
