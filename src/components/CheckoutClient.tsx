"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import CouponBox from "./CouponBox";
import { consumeCoupon, useCoupon } from "@/lib/coupons";
import { DEMO, checkPin, indiaOnly, sendCode, shippingFor, startPayment, verifyCode } from "@/lib/checkout";
import { COUNTRIES, guessCountry } from "@/lib/countries";
import { emptyIdent, identValue, idNoun, maskId, type Ident } from "@/lib/identity";
import { productSlot } from "@/lib/images";
import { colourway, getGift, getSavedAddress, loadOrders, nextOrderId, saveAddress, type Address, type Order, type PayMethod } from "@/lib/orders";
import { getProduct, money } from "@/lib/products";
import { IdentField } from "./AuthFields";
import Crumbs from "./Crumbs";
import { Icon } from "./Icon";
import Media from "./Media";
import OtpBoxes from "./OtpBoxes";
import { lineKey, useStore } from "./StoreProvider";
import { useOrders } from "./useOrders";
import { useSession } from "./useSession";

const blank: Address = { name: "", line1: "", area: "", pin: "", city: "", state: "", country: "United States", phone: "" };
type Step = 1 | 2 | 3;

export default function CheckoutClient() {
  const router = useRouter();
  const { lines, subtotal, clear, ready } = useStore();
  const { add } = useOrders(false);
  const { user, ready: sessionReady } = useSession();

  const [step, setStep] = useState<Step>(1);

  // 1 contact: email by default, mobile number as the second option
  const [ident, setIdent] = useState<Ident>(emptyIdent());
  const [stage, setStage] = useState<"enter" | "code" | "verified">("enter");
  const [contact, setContact] = useState("");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [busy, setBusy] = useState(false);
  const [contactErr, setContactErr] = useState("");

  // 2 address
  const [addr, setAddr] = useState<Address>(blank);
  const [addrDone, setAddrDone] = useState(false);
  const [saveAddr, setSaveAddr] = useState(false);

  // 3 payment
  const [pay, setPay] = useState<PayMethod | null>(null);
  const [payState, setPayState] = useState<"idle" | "processing" | "failed">("idle");
  const [failMsg, setFailMsg] = useState("");

  useEffect(() => {
    const g = guessCountry();
    setIdent((i) => ({ ...i, dial: g.dial }));
    const saved = getSavedAddress();
    setAddr(saved ?? { ...blank, country: g.name });
  }, []);

  // A signed-in customer skips verification.
  useEffect(() => {
    if (user && stage === "enter" && !contact) {
      setContact(user.id);
      setStage("verified");
      setStep(2);
    }
  }, [user, stage, contact]);

  const india = indiaOnly(addr.country);
  const pin = checkPin(addr.country, addr.pin);
  const { code: couponCode, discount, freeShip } = useCoupon(subtotal);
  const shipping = pin === "ok" ? (freeShip && indiaOnly(addr.country) ? 0 : shippingFor(addr.country)) : null;
  const total = subtotal - discount + (shipping ?? 0);
  const addrValid = addr.name.trim() && addr.line1.trim() && addr.city.trim() && addr.state.trim() && addr.country && pin === "ok";
  const id = identValue(ident);

  const items = useMemo(
    () => lines.map((l) => ({ l, p: getProduct(l.id) })).filter((x): x is { l: (typeof lines)[number]; p: NonNullable<ReturnType<typeof getProduct>> } => Boolean(x.p)),
    [lines],
  );

  // COD and UPI are India-only: drop a choice that no longer applies when the country changes.
  useEffect(() => {
    if (!india && (pay === "cod" || pay === "upi")) setPay(null);
  }, [india, pay]);

  /* ---- contact ---- */
  const send = async () => {
    if (!id) return setContactErr(ident.mode === "email" ? "Enter a valid email address." : "Enter a valid mobile number.");
    setBusy(true);
    setContactErr("");
    const r = await sendCode(id);
    setBusy(false);
    if (!r.ok) return setContactErr(r.message ?? "Couldn't send the code. Try again.");
    setDigits(["", "", "", "", "", ""]);
    setStage("code");
  };
  const verify = async () => {
    setBusy(true);
    setContactErr("");
    const r = await verifyCode(digits.join(""));
    setBusy(false);
    if (!r.ok) return setContactErr(r.message ?? "That code didn't work.");
    setContact(id);
    setStage("verified");
    setStep(2);
  };

  /* ---- order ---- */
  const place = async () => {
    if (!user || !pay || items.length === 0) return;
    setFailMsg("");
    if (pay !== "cod") {
      setPayState("processing");
      const r = await startPayment(pay, total);
      if (!r.ok) {
        setFailMsg(r.message ?? "");
        return setPayState("failed");
      }
    }
    const existing = loadOrders();
    const gift = getGift();
    const order: Order = {
      id: nextOrderId(existing),
      placedAt: new Date().toISOString(),
      stage: 0,
      items: items.map(({ l, p }) => ({ id: p.id, name: p.name, price: p.price, qty: l.qty, colour: l.colour || p.details?.colour || colourway(p.tone), tone: p.tone, ...(l.size ? { size: l.size } : {}) })),
      address: addr,
      contact,
      userId: user.id,
      payment: pay,
      subtotal,
      shipping: freeShip && indiaOnly(addr.country) ? 0 : shippingFor(addr.country),
      total,
      ...(discount > 0 ? { discount, coupon: couponCode } : {}),
      gift: gift.on ? gift.message || "Gift wrap requested" : undefined,
    };
    if (saveAddr) saveAddress(addr);
    add(order);
    if (couponCode && (discount > 0 || freeShip)) consumeCoupon(couponCode);
    clear();
    router.push(`/order-confirmation?order=${order.id}`);
  };

  if (ready && items.length === 0) {
    return (
      <div className="rp-page">
        <div className="rp-wrap">
          <Crumbs items={[{ label: "Home", href: "/" }, { label: "Bag", href: "/bag" }, { label: "Checkout" }]} />
          <h1 className="rp-title">Checkout</h1>
          <div className="rp-empty">
            <Icon name="bag" />
            <h2>Your bag is empty</h2>
            <p>Add a saree to your bag to begin checkout.</p>
            <Link href="/collections/sarees" className="btn">Explore Sarees</Link>
          </div>
        </div>
      </div>
    );
  }

  if (sessionReady && !user) {
    return (
      <div className="rp-page">
        <div className="rp-wrap">
          <Crumbs items={[{ label: "Home", href: "/" }, { label: "Bag", href: "/bag" }, { label: "Checkout" }]} />
          <h1 className="rp-title">Checkout</h1>
          <div className="rp-empty">
            <Icon name="user" />
            <h2>Sign in to place your order</h2>
            <p>An account is needed to confirm an order, so you can track it, return it and see it in My orders. Your bag stays as it is.</p>
            <Link href="/login?next=/checkout" className="btn">Sign in</Link>
            <p>New here? <Link href="/signup?next=/checkout" className="rp-link">Create an account</Link></p>
          </div>
        </div>
      </div>
    );
  }
  if (!sessionReady) return <div className="rp-page" />;

  const set = (k: keyof Address) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setAddr((a) => ({ ...a, [k]: k === "pin" && a.country === "India" ? e.target.value.replace(/\D/g, "").slice(0, 6) : e.target.value }));
  const payLabel = pay === "cod" ? "Due on delivery" : step === 3 ? "Total to pay" : "Estimated total";
  const placeLabel = pay === "cod" ? "Place order" : `Pay ${money(total)} securely`;
  const pinWord = india ? "PIN code" : "Postal / ZIP code";
  const options = ([
    ["card", "Credit or debit card", "Enter your card details in the next step."],
    ["upi", "UPI", "Pay with any UPI app."],
    ["cod", "Cash on delivery", `Pay ${money(total)} when your order is delivered.`],
  ] as [PayMethod, string, string][]).filter(([k]) => k === "card" || india);

  return (
    <div className="rp-page">
      <div className="rp-wrap">
        <Crumbs items={[{ label: "Home", href: "/" }, { label: "Bag", href: "/bag" }, { label: "Checkout" }]} />
        <h1 className="rp-title">Checkout</h1>
        {DEMO && <p className="ck-demo" role="note">Demo checkout: no email or SMS is sent and no payment is taken. Any 6-digit code works.</p>}

        <div className="ck-grid">
          <div className="rp-card ck-steps">
            {/* 1 CONTACT */}
            <section className="ck-sec" aria-labelledby="ck1">
              <div className="ck-head" id="ck1">
                <h2 className="rp-h2"><span className="ck-n">1</span>Contact details</h2>
                {stage === "verified" ? (
                  <>
                    <p className="ck-ver"><Icon name="check" /> Verified <span aria-hidden="true">|</span> {maskId(contact)}</p>
                    <button type="button" className="rp-link" onClick={() => { setStage("enter"); setContact(""); setStep(1); }}>Edit</button>
                  </>
                ) : (
                  <button type="button" className="ck-tog" aria-label="Contact details" aria-expanded disabled><Icon name="minus" /></button>
                )}
              </div>
              {stage !== "verified" && (
                <div className="ck-body">
                  {stage === "enter" ? (
                    <>
                      <IdentField id="ck-id" ident={ident} onChange={(i) => { setIdent(i); setContactErr(""); }} hint={ident.mode === "email" ? "We’ll send a 6-digit code to your email." : "We’ll send a 6-digit code by SMS."} />
                      {contactErr && <p className="rp-err" role="alert"><Icon name="warning" />{contactErr}</p>}
                      <button type="button" className="btn w-full" disabled={!id || busy} onClick={send}>{busy ? "Sending…" : "Send code"}</button>
                      {!user && <p className="ck-signin">Have an account? <Link href="/login?next=/checkout" className="rp-link">Sign in</Link></p>}
                    </>
                  ) : (
                    <>
                      <p className="ck-sent">Code sent to {maskId(id)} <button type="button" className="rp-link" onClick={() => setStage("enter")}>Change {idNoun(id)}</button></p>
                      <OtpBoxes value={digits} onChange={setDigits} onComplete={verify} />
                      <button type="button" className="rp-link ck-resend" onClick={send} disabled={busy}>Resend code</button>
                      {contactErr && <p className="rp-err" role="alert"><Icon name="warning" />{contactErr}</p>}
                      <button type="button" className="btn w-full" disabled={!digits.every(Boolean) || busy} onClick={verify}>{busy ? "Verifying…" : "Verify & continue"}</button>
                    </>
                  )}
                </div>
              )}
            </section>

            {/* 2 ADDRESS */}
            <section className="ck-sec" aria-labelledby="ck2">
              <div className="ck-head" id="ck2">
                <h2 className="rp-h2"><span className="ck-n">2</span>Delivery address</h2>
                {addrDone && step !== 2 ? (
                  <button type="button" className="rp-link" onClick={() => setStep(2)}>Edit</button>
                ) : (
                  <button type="button" className="ck-tog" aria-expanded={step === 2} aria-label={`${step === 2 ? "Collapse" : "Expand"} delivery address`} disabled={stage !== "verified"} onClick={() => setStep(step === 2 ? 1 : 2)}>
                    <Icon name={step === 2 ? "minus" : "plus"} />
                  </button>
                )}
              </div>
              {addrDone && step !== 2 && (
                <p className="ck-sum-addr">{addr.name}<br />{[addr.line1, addr.area, addr.city, `${addr.state} ${addr.pin}`, addr.country].filter(Boolean).join(", ")}</p>
              )}
              {step === 2 && stage === "verified" && (
                <form
                  className="ck-body"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!addrValid) return;
                    setAddrDone(true);
                    setStep(3);
                  }}
                >
                  <div className="rp-field">
                    <label htmlFor="a-country">Country / Region</label>
                    <div className="rp-select">
                      <select id="a-country" autoComplete="country-name" value={addr.country} onChange={set("country")}>
                        {COUNTRIES.map((c) => <option key={c.code}>{c.name}</option>)}
                      </select>
                      <Icon name="chevron-down" />
                    </div>
                  </div>
                  <div className="rp-field"><label htmlFor="a-name">Full name</label><input id="a-name" autoComplete="name" value={addr.name} onChange={set("name")} /></div>
                  <div className="rp-field"><label htmlFor="a-l1">{india ? "House / flat and street" : "Street address"}</label><input id="a-l1" autoComplete="address-line1" value={addr.line1} onChange={set("line1")} /></div>
                  <div className="ck-two">
                    <div className="rp-field"><label htmlFor="a-area">{india ? "Area or landmark (optional)" : "Apartment, suite, etc. (optional)"}</label><input id="a-area" autoComplete="address-line2" value={addr.area} onChange={set("area")} /></div>
                    <div className="rp-field" data-invalid={pin === "unavailable" || pin === "invalid"}>
                      <label htmlFor="a-pin">{pinWord}</label>
                      <input id="a-pin" inputMode={india ? "numeric" : "text"} autoComplete="postal-code" value={addr.pin} onChange={set("pin")} aria-invalid={pin === "unavailable" || pin === "invalid"} aria-describedby="a-pin-s" />
                      <p id="a-pin-s" className={pin === "ok" ? "rp-ok" : "rp-err"} role="status">
                        {pin === "ok" && (<><Icon name="check" />Delivery available</>)}
                        {pin === "unavailable" && (<><Icon name="warning" />Delivery unavailable for this {india ? "PIN" : "postal code"}. Try a different address.</>)}
                        {pin === "invalid" && (<><Icon name="warning" />Enter a valid {pinWord.toLowerCase()}.</>)}
                      </p>
                    </div>
                  </div>
                  <div className="ck-two">
                    <div className="rp-field"><label htmlFor="a-city">City</label><input id="a-city" autoComplete="address-level2" value={addr.city} onChange={set("city")} /></div>
                    <div className="rp-field"><label htmlFor="a-state">{india ? "State" : "State / Province / Region"}</label><input id="a-state" autoComplete="address-level1" value={addr.state} onChange={set("state")} /></div>
                  </div>
                  <div className="rp-field">
                    <label htmlFor="a-phone">Phone for delivery updates (optional)</label>
                    <input id="a-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+44 7700 900123" value={addr.phone ?? ""} onChange={set("phone")} />
                  </div>
                  <label className="rp-check">
                    <input type="checkbox" checked={saveAddr} onChange={(e) => setSaveAddr(e.target.checked)} />
                    <span className="rp-box" aria-hidden="true"><Icon name="check" /></span>
                    Save this address for future orders
                  </label>
                  <button type="submit" className="btn w-full" disabled={!addrValid}>Continue to payment</button>
                </form>
              )}
            </section>

            {/* 3 PAYMENT */}
            <section className="ck-sec" aria-labelledby="ck3">
              <div className="ck-head" id="ck3">
                <h2 className="rp-h2"><span className="ck-n">3</span>Payment</h2>
                <button type="button" className="ck-tog" aria-expanded={step === 3} aria-label={`${step === 3 ? "Collapse" : "Expand"} payment`} disabled={!addrDone} onClick={() => setStep(step === 3 ? 2 : 3)}>
                  <Icon name={step === 3 ? "minus" : "plus"} />
                </button>
              </div>
              {step === 3 && addrDone && payState !== "failed" && (
                <div className="ck-body">
                  <div role="radiogroup" aria-label="Payment method" className="ck-pay">
                    {options.map(([k, label, desc]) => (
                      <label key={k} className="ck-opt" data-on={pay === k}>
                        <input type="radio" name="pay" checked={pay === k} onChange={() => setPay(k)} />
                        <span className="ck-radio" aria-hidden="true" />
                        <span className="ck-opt-t">
                          <b>{label}</b>
                          {pay === k && k !== "upi" && <small>{desc}</small>}
                        </span>
                        {k === "cod" && (pay === "cod" ? <span className="ck-av"><Icon name="check" /> Available</span> : <button type="button" className="rp-link" onClick={(e) => { e.preventDefault(); setPay("cod"); }}>Check availability</button>)}
                      </label>
                    ))}
                  </div>
                  {!india && <p className="rp-hint">Cash on delivery and UPI are available for addresses in India only.</p>}
                  <button type="button" className="btn w-full" disabled={!pay || payState === "processing"} onClick={place}>
                    {payState === "processing" ? "Processing…" : placeLabel}
                  </button>
                </div>
              )}
              {step === 3 && addrDone && payState === "failed" && (
                <div className="ck-body ck-fail" role="alert">
                  <h3><Icon name="warning" />Payment unsuccessful</h3>
                  <p>{failMsg || `Your ${pay === "upi" ? "UPI" : "card"} payment was declined.`} Your bag and delivery address are saved.</p>
                  <button type="button" className="btn" onClick={place}>Retry {pay === "upi" ? "UPI" : "card"} payment</button>
                  <button type="button" className="rp-link" onClick={() => { setPayState("idle"); setPay(null); }}>Change payment method</button>
                </div>
              )}
            </section>
          </div>

          <aside className="rp-card ck-sum" aria-label="Order summary">
            <div className="ck-sum-h">
              <h2 className="rp-h2">Order Summary</h2>
              <Link href="/bag" className="rp-link">Edit bag</Link>
            </div>
            <ul className="ck-items">
              {items.map(({ l, p }) => (
                <li key={lineKey(l)}>
                  <div className="ck-thumb"><Media tone={p.tone} className="h-full w-full" sizes="112px" {...productSlot(p, l.colour)} /></div>
                  <div>
                    <h3>{p.name}</h3>
                    <p className="rp-colour">{l.colour || p.details?.colour || colourway(p.tone)}</p>
                    {l.size && <p className="rp-size">Size {l.size}</p>}
                    <p className="ck-q">Qty {l.qty}</p>
                  </div>
                  <p className="ck-pr">{money(p.price * l.qty)}</p>
                </li>
              ))}
            </ul>
            <CouponBox subtotal={subtotal} />
            <dl className="rp-rows rp-rows--lg">
              <div className="rp-bold"><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div>
              {discount > 0 && <div className="bd-save"><dt>Offer discount ({couponCode})</dt><dd>− {money(discount)}</dd></div>}
              <div>
                <dt>Shipping</dt>
                <dd>{shipping === 0 ? "Free" : shipping !== null ? money(shipping) : pin === "unavailable" ? "Unavailable for this address" : "After address entry"}</dd>
              </div>
              {shipping !== null && <div className="rp-bold rp-total"><dt>{payLabel}</dt><dd>{money(total)}</dd></div>}
            </dl>
          </aside>
        </div>
      </div>
    </div>
  );
}