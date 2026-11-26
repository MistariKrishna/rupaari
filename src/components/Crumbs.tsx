import Link from "next/link";

/** "Home / Account / My orders" breadcrumb used on bag, checkout and account pages. */
export default function Crumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="rp-crumbs">
      <ol>
        {items.map((c, i) => (
          <li key={c.label}>
            {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
            {i < items.length - 1 && <span aria-hidden="true" className="rp-sl"> / </span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
