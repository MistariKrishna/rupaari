"use client";

import { useState } from "react";
import { checkPin, shippingFor } from "@/lib/checkout";
import { money } from "@/lib/products";
import { Icon } from "./Icon";

/** Pincode check in the bag: delivery time, shipping charge and whether cash on delivery is available. */
export default function BagPin({ freeShip }: { freeShip: boolean }) {
  const [pin, setPin] = useState("");
  const [res, setRes] = useState<{ ok: boolean; text: string } | null>(null);
  const check = () => {
    const s = checkPin("India", pin);
    if (s === "ok") setRes({ ok: true, text: `Delivery in 4 to 7 days. Shipping ${freeShip ? "is free" : money(shippingFor("India"))}. Cash on delivery is available.` });
    else if (s === "unavailable") setRes({ ok: false, text: "Sorry, we do not deliver to this pincode yet." });
    else setRes({ ok: false, text: "Enter a valid 6-digit pincode." });
  };
  return (
    <div className="pv-pin bg-pin">
      <label htmlFor="bg-pin" className="pv-pin-l">Check delivery to your pincode</label>
      <div className="pv-pin-f">
        <Icon name="location" className="!h-[18px] !w-[18px]" />
        <input id="bg-pin" inputMode="numeric" maxLength={6} placeholder="Enter 6-digit pincode" value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setRes(null); }} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), check())} />
        <button type="button" onClick={check}>Check</button>
      </div>
      {res && <p className={`pv-pin-m ${res.ok ? "" : "is-bad"}`} role="status">{res.text}</p>}
    </div>
  );
}
