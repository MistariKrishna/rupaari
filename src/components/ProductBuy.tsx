"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "./Icon";
import { useStore } from "./StoreProvider";
import SizeGuide from "./SizeGuide";
import WishlistButton from "./WishlistButton";
import { money } from "@/lib/products";
import type { ShopInfo } from "@/lib/catalog";
import type { ProductColour } from "@/lib/products";

/** Size picker, Add to bag, Buy now, wishlist, share and a delivery check. Sarees have no size. */
export default function ProductBuy({ id, name, sizes, inStock = true, shop, colours = [], colour = "", onColour }: { id: string; name: string; sizes: { label: string; available: boolean }[]; inStock?: boolean; shop: ShopInfo; colours?: ProductColour[]; colour?: string; onColour?: (name: string) => void }) {
  const { add } = useStore();
  const router = useRouter();
  const [size, setSize] = useState("");
  const [err, setErr] = useState(false);
  const [pin, setPin] = useState("");
  const [pinMsg, setPinMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [shared, setShared] = useState(false);
  const needSize = sizes.length > 0;

  const guard = () => {
    if (needSize && !size) { setErr(true); return false; }
    return true;
  };
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: name, url });
      else { await navigator.clipboard.writeText(url); setShared(true); setTimeout(() => setShared(false), 2000); }
    } catch { /* cancelled */ }
  };
  const check = () => {
    if (!/^\d{6}$/.test(pin.trim())) return setPinMsg({ ok: false, text: "Enter a valid 6-digit pincode." });
    setPinMsg({ ok: true, text: `Delivery to ${pin.trim()} usually takes ${shop.indiaEta}. Shipping ${money(shop.indiaRate)}${shop.freeShipFrom ? `, free above ${money(shop.freeShipFrom)}` : ""}.` });
  };

  const col = colour || undefined;
  const picked = colours.find((c) => c.name === colour);
  const stockText = inStock ? "In stock." : picked && !picked.inStock ? `${picked.name} is currently out of stock.` : "Currently out of stock.";

  return (
    <div className="pv-buy">
      {colours.length > 1 && (
        <div className="sz pv-cols" role="radiogroup" aria-label="Colour">
          <p className="pv-cols-l">Colour: <b>{picked?.name ?? colours[0].name}</b></p>
          <div className="sz-row">
            {colours.map((c) => (
              <button key={c.name} type="button" role="radio" aria-checked={(picked ?? colours[0]).name === c.name} title={c.inStock ? undefined : "Out of stock"} className="sz-b pv-col-b" data-on={(picked ?? colours[0]).name === c.name} data-out={!c.inStock} onClick={() => onColour?.(c.name)}>
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}
      {needSize && (
        <div className="sz" role="radiogroup" aria-label="Size" data-invalid={err}>
          <div className="sz-row">
            {sizes.map((s) => (
              <button key={s.label} type="button" role="radio" aria-checked={size === s.label} disabled={!s.available} title={s.available ? undefined : "Sold out"} className="sz-b" data-on={size === s.label} onClick={() => { setSize(s.label); setErr(false); }}>
                {s.label}
              </button>
            ))}
          </div>
          {err && <p className="rp-err sz-err" role="alert"><Icon name="warning" />Please select a size.</p>}
          <SizeGuide />
        </div>
      )}

      <div className="pv-row">
        <button type="button" className="btn pv-cta" disabled={!inStock} onClick={() => guard() && add(id, 1, true, size || undefined, col)}>
          Add to bag
        </button>
        <button type="button" className="icon-btn" aria-label="Share this piece" onClick={share}><Icon name="share" /></button>
      </div>
      <div className="pv-row">
        <button type="button" className="btn btn-secondary pv-cta" disabled={!inStock} onClick={() => { if (!guard()) return; add(id, 1, false, size || undefined, col); router.push("/checkout"); }}>
          Buy now
        </button>
        <WishlistButton id={id} name={name} className="icon-btn" />
      </div>
      <p className="pv-stock" role="status">{shared ? "Link copied." : stockText}</p>

      <div className="pv-pin">
        <label htmlFor="pv-pin" className="pv-pin-l">Check delivery to your pincode</label>
        <div className="pv-pin-f">
          <Icon name="location" className="!h-[18px] !w-[18px]" />
          <input id="pv-pin" inputMode="numeric" maxLength={6} placeholder="Enter 6-digit pincode" value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setPinMsg(null); }} onKeyDown={(e) => e.key === "Enter" && check()} />
          <button type="button" onClick={check}>Check</button>
        </div>
        {pinMsg && <p className={`pv-pin-m ${pinMsg.ok ? "" : "is-bad"}`} role="status">{pinMsg.text}</p>}
      </div>

      <ul className="pv-notes">
        <li><Icon name="truck" className="!h-5 !w-5" /> Delivery in {shop.indiaEta} within India. Shipping {money(shop.indiaRate)}{shop.freeShipFrom ? `, free above ${money(shop.freeShipFrom)}` : ""}.</li>
        <li><Icon name="return" className="!h-5 !w-5" /> Returns can be requested within {shop.returnWindow} days of delivery.</li>
      </ul>
    </div>
  );
}
