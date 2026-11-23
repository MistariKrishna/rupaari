"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { productSlot } from "@/lib/images";
import { getProduct, money } from "@/lib/products";
import { Icon } from "./Icon";
import Media from "./Media";
import { lineKey, useStore } from "./StoreProvider";

/** Slide-in shopping bag. Opens automatically when something is added. */
export default function BagDrawer() {
  const { bagOpen, closeBag, lines, subtotal, count, setQty, remove } = useStore();
  const closeRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Any navigation (including the animated page transition) closes the drawer.
  useEffect(() => {
    closeBag();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!bagOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeBag();
    };
    document.addEventListener("keydown", onKey);
    const t = setTimeout(() => closeRef.current?.focus(), 250);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [bagOpen, closeBag]);

  return (
    <div className="drawer" data-open={bagOpen} aria-hidden={!bagOpen}>
      <div className="drawer-scrim" onClick={closeBag} />
      <aside className="drawer-panel" role="dialog" aria-modal="true" aria-label="Shopping bag">
        <div className="flex items-center justify-between border-b border-gold/40 px-6 py-5">
          <h2 className="font-display text-[1.15rem] uppercase tracking-[.08em] text-wine">Your bag ({count})</h2>
          <button ref={closeRef} type="button" onClick={closeBag} aria-label="Close bag" tabIndex={bagOpen ? 0 : -1} className="flex h-11 w-11 items-center justify-center text-wine">
            <Icon name="close" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-start justify-center gap-5 px-6">
            <p className="font-display text-[1.5rem] uppercase text-wine">Your bag is empty</p>
            <p className="text-ink/75">Find a saree you love and it will wait for you here.</p>
            <Link href="/collections/sarees" onClick={closeBag} tabIndex={bagOpen ? 0 : -1} className="btn">
              Shop sarees <Icon name="arrow-right" />
            </Link>
          </div>
        ) : (
          <>
            <ul className="m-0 flex-1 list-none overflow-y-auto p-0 px-6" data-native-scroll>
              {lines.map((l) => {
                const p = getProduct(l.id);
                if (!p) return null;
                return (
                  <li key={lineKey(l)} className="grid grid-cols-[88px_1fr] gap-4 border-b border-gold/25 py-5">
                    <Link href={`/product/${p.id}`} onClick={closeBag} tabIndex={bagOpen ? 0 : -1} aria-label={p.name}>
                      <Media tone={p.tone} className="aspect-[4/5] w-full" {...productSlot(p, l.colour)} sizes="88px" />
                    </Link>
                    <div className="min-w-0">
                      <Link href={`/product/${p.id}`} onClick={closeBag} tabIndex={bagOpen ? 0 : -1} className="font-display text-[1rem] uppercase leading-tight text-wine">
                        {p.name}
                      </Link>
                      <p className="mt-1 text-[14px] text-ink/80">{money(p.price)}</p>
                      {l.colour && <p className="mt-1 text-[13px] text-ink/70">Colour: {l.colour}</p>}
                      {l.size && <p className="mt-1 text-[13px] text-ink/70">Size: {l.size}</p>}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center border border-taupe">
                          <button type="button" aria-label={`Decrease quantity of ${p.name}`} tabIndex={bagOpen ? 0 : -1} className="flex h-10 w-10 items-center justify-center hover:bg-wine/5" onClick={() => setQty(l.id, l.qty - 1, l.size, l.colour)}>
                            <Icon name="minus" className="!h-4 !w-4" />
                          </button>
                          <span className="min-w-8 text-center text-[14px]" aria-live="polite">{l.qty}</span>
                          <button type="button" aria-label={`Increase quantity of ${p.name}`} tabIndex={bagOpen ? 0 : -1} className="flex h-10 w-10 items-center justify-center hover:bg-wine/5" onClick={() => setQty(l.id, l.qty + 1, l.size, l.colour)}>
                            <Icon name="plus" className="!h-4 !w-4" />
                          </button>
                        </div>
                        <button type="button" tabIndex={bagOpen ? 0 : -1} className="text-[12px] uppercase tracking-[.14em] text-burgundy underline underline-offset-4" onClick={() => remove(l.id, l.size, l.colour)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-gold/40 px-6 py-5">
              <div className="mb-4 flex items-baseline justify-between">
                <span className="text-[12px] font-medium uppercase tracking-[.16em]">Subtotal</span>
                <span className="font-display text-[1.4rem] text-wine">{money(subtotal)}</span>
              </div>
              <Link href="/checkout" onClick={closeBag} tabIndex={bagOpen ? 0 : -1} className="btn w-full">Checkout</Link>
              <Link href="/bag" onClick={closeBag} tabIndex={bagOpen ? 0 : -1} className="mt-4 block text-center text-[12px] uppercase tracking-[.16em] text-burgundy underline underline-offset-8">View bag</Link>
              <button type="button" onClick={closeBag} tabIndex={bagOpen ? 0 : -1} className="mt-4 text-[12px] uppercase tracking-[.16em] text-burgundy underline underline-offset-8">
                Continue shopping
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}