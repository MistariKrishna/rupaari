"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import AIcon from "@/components/admin/AIcon";
import { Badge, Btn, Card, Field, PageHeader, Tabs, Toggle } from "@/components/admin/ui";
import { useAdmin } from "@/components/admin/AdminShell";
import { compressImage } from "@/lib/admin/export";
import { images, type Slot } from "@/lib/images";
import { applySlot, delBlob, isStoredVideo, listSlots, putBlob, TEXT_DEFAULTS as D, useResolvedSlot, type SiteContent, type SiteMedia } from "@/lib/siteContent";

type Tab = "hero" | "home" | "images";
const MAX_CHARS = 5_000_000;

/** Characters this site already keeps in the browser (the limit is roughly 5 million). */
const usedChars = () => {
  try {
    let n = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i) ?? "";
      if (k.startsWith("rupaari.")) n += k.length + (localStorage.getItem(k)?.length ?? 0);
    }
    return n;
  } catch {
    return 0;
  }
};

/** Shows what the visitor will see: an override if there is one, otherwise the built-in file. */
function Preview({ def, site, ratio = "16 / 9", children }: { def: Slot; site: SiteContent; ratio?: string; children?: ReactNode }) {
  const s = useResolvedSlot(applySlot(def, site));
  return (
    <div className="adm-stage" style={{ aspectRatio: ratio }}>
      {s.video ? (
        <video key={s.video} src={s.video} poster={s.poster} muted loop autoPlay playsInline />
      ) : s.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={s.image.slice(0, 80)} src={s.image} alt="" />
      ) : (
        <div className="adm-stage-empty"><AIcon name="image" /> Animated woven art</div>
      )}
      {children}
    </div>
  );
}

function Thumb({ def, site }: { def: Slot; site: SiteContent }) {
  const shown = useResolvedSlot(applySlot(def, site));
  if (shown.video) return <video src={shown.video} poster={shown.poster} muted loop autoPlay playsInline />;
  // eslint-disable-next-line @next/next/no-img-element
  if (shown.image) return <img src={shown.image} alt="" loading="lazy" />;
  return <span><AIcon name="image" /></span>;
}

/** Grab a still from the first second of a video so something shows while it loads. */
const grabPoster = (file: File): Promise<string | undefined> =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.muted = true;
    v.preload = "auto";
    v.playsInline = true;
    const done = (r?: string) => { URL.revokeObjectURL(url); resolve(r); };
    v.onloadeddata = () => { v.currentTime = Math.min(0.5, (v.duration || 1) / 2); };
    v.onseeked = () => {
      try {
        const k = Math.min(1, 1280 / (v.videoWidth || 1280));
        const c = document.createElement("canvas");
        c.width = Math.round((v.videoWidth || 1280) * k);
        c.height = Math.round((v.videoHeight || 720) * k);
        c.getContext("2d")?.drawImage(v, 0, 0, c.width, c.height);
        done(c.toDataURL("image/jpeg", 0.7));
      } catch { done(); }
    };
    v.onerror = () => done();
    v.src = url;
  });

function LinkInput({ placeholder, onApply }: { placeholder: string; onApply: (v: string) => void }) {
  const [v, setV] = useState("");
  const go = () => {
    if (!v.trim()) return;
    onApply(v.trim());
    setV("");
  };
  return (
    <div className="adm-linkrow">
      <input className="adm-in" value={v} placeholder={placeholder} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), go())} />
      <Btn size="sm" variant="ghost" onClick={go} disabled={!v.trim()}>Use</Btn>
    </div>
  );
}

/** Text fields read and write through this, so the field component keeps a stable identity (typing never loses focus). */
const TextCtx = createContext<{ text: (k: string) => string; setText: (k: string, v: string) => void; edited: (k: string) => boolean; resetText: (k: string) => void } | null>(null);
function T({ k, label, hint, area, wide }: { k: string; label: string; hint?: string; area?: boolean; wide?: boolean }) {
  const c = useContext(TextCtx)!;
  return (
    <Field label={label} hint={hint} wide={wide}>
      <div className="adm-fx">
        {area ? <textarea className="adm-in" value={c.text(k)} onChange={(e) => c.setText(k, e.target.value)} /> : <input className="adm-in" value={c.text(k)} onChange={(e) => c.setText(k, e.target.value)} />}
        {c.edited(k) && <button type="button" className="adm-reset" onClick={() => c.resetText(k)} title="Back to the original text">Reset</button>}
      </div>
    </Field>
  );
}

export default function SitePage() {
  const { d, set, log, toast } = useAdmin();
  const [site, setSite] = useState<SiteContent>(d.site);
  const [dirty, setDirty] = useState(false);
  const [tab, setTab] = useState<Tab>("hero");
  const [group, setGroup] = useState("All");
  const [busy, setBusy] = useState<string | null>(null);
  const slots = useMemo(() => listSlots(), []);
  const groups = useMemo(() => ["All", ...Array.from(new Set(slots.map((s) => s.group)))], [slots]);

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const touch = (fn: (s: SiteContent) => SiteContent) => { setSite(fn); setDirty(true); };
  const text = (k: string) => site.text[k] ?? D[k];
  const setText = (k: string, v: string) => touch((s) => ({ ...s, text: { ...s.text, [k]: v } }));
  const resetText = (k: string) => touch((s) => { const t = { ...s.text }; delete t[k]; return { ...s, text: t }; });
  const edited = (k: string) => site.text[k] !== undefined && site.text[k] !== D[k];
  const setMedia = (id: string, patch: Partial<SiteMedia>) => touch((s) => ({ ...s, media: { ...s.media, [id]: { ...s.media[id], ...patch } } }));
  const resetMedia = (id: string) => touch((s) => { const m = { ...s.media }; delete m[id]; return { ...s, media: m }; });

  const upload = async (id: string, file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast("Choose an image file (JPG, PNG or WebP).", "err");
    setBusy(id);
    try {
      setMedia(id, { image: await compressImage(file, 2000) });
    } catch {
      toast("That image could not be read.", "err");
    }
    setBusy(null);
  };

  const uploadVideo = async (id: string, file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("video/")) return toast("Choose a video file (MP4 or WebM).", "err");
    if (file.size > 80 * 1024 * 1024) return toast("That video is over 80 MB. Compress it first (a 1080p hero is usually 5 to 15 MB).", "err");
    setBusy(id + "v");
    try {
      await putBlob(id, file);
      const poster = await grabPoster(file);
      setMedia(id, { video: `idb:${id}:${Date.now()}`, videoName: `${file.name} (${(file.size / 1048576).toFixed(1)} MB)`, ...(poster ? { image: poster } : {}) });
      if (file.size > 25 * 1024 * 1024) toast("Uploaded, but that is a heavy file for a hero. Under 15 MB loads faster.");
    } catch {
      toast("This browser could not store the video. Try a smaller file.", "err");
    }
    setBusy(null);
  };
  const removeVideo = (id: string) => { delBlob(id); setMedia(id, { video: undefined, videoName: undefined }); };

  const save = () => {
    if (!set("site", site)) return toast("Browser storage is full. Remove a few large images, or paste image links instead.", "err");
    const changed = Object.keys(site.media).length + Object.keys(site.text).length;
    log("Site content", "Website", "Updated", `${changed} change${changed === 1 ? "" : "s"} live`);
    setDirty(false);
    window.dispatchEvent(new Event("rupaari:admin"));
    toast("Saved. Reload the store to see it.");
  };
  const resetAll = () => { setSite({ media: {}, text: {} }); setDirty(true); };

  const used = usedChars();
  const pct = Math.min(100, Math.round((used / MAX_CHARS) * 100));
  const heroSlot = images.hero;
  const heroId = heroSlot.video ?? heroSlot.image ?? "hero";
  const hm = site.media[heroId] ?? {};
  const discountDemo = "30% off";
  const offerPreview = text("offer.text").includes("{discount}") ? text("offer.text").replace("{discount}", discountDemo) : text("offer.text");

  const list = tab === "images" ? slots.filter((s) => group === "All" || s.group === group) : [];

  return (
    <TextCtx.Provider value={{ text, setText, edited, resetText }}>
      <PageHeader
        title="Site content"
        sub="Change the pictures, videos and wording on the store. Nothing changes until you save."
        actions={<><a className="adm-btn adm-btn--ghost" href="/" target="_blank" rel="noreferrer"><AIcon name="external" /> View store</a><Btn variant="ghost" onClick={resetAll} disabled={!Object.keys(site.media).length && !Object.keys(site.text).length}>Reset everything</Btn></>}
      />
      <Tabs<Tab> tabs={[{ id: "hero", label: "Home hero" }, { id: "home", label: "Home sections" }, { id: "images", label: "All images", count: slots.length }]} value={tab} onChange={setTab} />

      {tab === "hero" && (
        <div className="adm-cols">
          <div>
            <Card title="Hero picture or video">
              <Preview def={heroSlot} site={site}>
                <div className="adm-stage-copy">
                  <small>{text("hero.eyebrow")}</small>
                  <b>{text("hero.title")}</b>
                  <span>{text("hero.line")}</span>
                  <i>{text("hero.cta")}</i>
                </div>
              </Preview>
              <div className="adm-slot-actions">
                <label className="adm-btn adm-btn--primary adm-btn--sm">
                  <AIcon name="upload" /> {busy === heroId ? "Working..." : "Upload picture"}
                  <input type="file" accept="image/*" className="adm-sr" onChange={(e) => { upload(heroId, e.target.files?.[0]); e.target.value = ""; }} />
                </label>
                <label className="adm-btn adm-btn--primary adm-btn--sm">
                  <AIcon name="upload" /> {busy === heroId + "v" ? "Saving video..." : "Upload video"}
                  <input type="file" accept="video/mp4,video/webm,video/*" className="adm-sr" onChange={(e) => { uploadVideo(heroId, e.target.files?.[0]); e.target.value = ""; }} />
                </label>
                {hm.video && <Btn size="sm" variant="ghost" onClick={() => removeVideo(heroId)}>Remove video</Btn>}
                {site.media[heroId] && <Btn size="sm" variant="ghost" onClick={() => { delBlob(heroId); resetMedia(heroId); }}>Back to original</Btn>}
              </div>
              {hm.videoName && <p className="adm-hint" style={{ marginTop: 10 }}>Uploaded video: {hm.videoName}</p>}
              <div style={{ display: "grid", gap: 14, marginTop: 16 }}>
                <Field label="Video link" hint="A path such as /videos/hero2.mp4 (file placed in the project's public/videos folder) or a full https:// link. Leave empty to use a picture only.">
                  <input className="adm-in" value={isStoredVideo(hm.video) ? "" : hm.video ?? ""} placeholder={heroSlot.video ?? "/videos/hero.mp4"} onChange={(e) => setMedia(heroId, { video: e.target.value.trim() || undefined, videoName: undefined })} />
                </Field>
                <Field label="Or paste a picture link" hint="Shown as the video's cover, or on its own when there is no video.">
                  <LinkInput placeholder="https://... or /images/hero.jpg" onApply={(v) => setMedia(heroId, { image: v })} />
                </Field>
              </div>
              <p className="adm-hint" style={{ marginTop: 12 }}>
                An uploaded video is kept in this browser (up to 80 MB; 5 to 15 MB loads fastest). To show it to every visitor, put the file in <code>public/videos</code> and paste its path in the link box above. Hero size: video 1920x1080, picture 2560x1440.
              </p>
            </Card>
          </div>
          <div>
            <Card title="Hero text">
              <div style={{ display: "grid", gap: 14 }}>
                <T k="hero.eyebrow" label="Small line above" />
                <T k="hero.title" label="Headline" />
                <T k="hero.line" label="Sentence under the headline" area />
                <T k="hero.cta" label="Button label" />
                <T k="hero.href" label="Button goes to" hint="For example /collections or /collections/sarees" />
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === "home" && (
        <div className="adm-g2">
          <Card title="Offer band" actions={<Toggle checked={text("offer.show") !== "0"} onChange={(v) => setText("offer.show", v ? "1" : "0")} label="Show" />}>
            <div className="adm-band adm-band--wine"><p>{offerPreview}</p><i>{text("offer.cta")}</i></div>
            <div style={{ display: "grid", gap: 14, marginTop: 16 }}>
              <T k="offer.text" label="Message" hint="Write {discount} where the percentage should appear. It is worked out from your products' discounts, so it always matches." area />
              <T k="offer.cta" label="Button label" />
              <T k="offer.href" label="Button goes to" />
            </div>
          </Card>
          <Card title="Closing banner: not sure which saree?">
            <div className="adm-band adm-band--ivory"><div><b>{text("consult.title")}</b><p>{text("consult.line")}</p></div><span><i>{text("consult.cta1")}</i><i className="is-o">{text("consult.cta2")}</i></span></div>
            <div style={{ display: "grid", gap: 14, marginTop: 16 }}>
              <T k="consult.title" label="Heading" />
              <T k="consult.line" label="Sentence" area />
              <T k="consult.cta1" label="First button" />
              <T k="consult.cta2" label="Second button" />
            </div>
          </Card>
        </div>
      )}

      {tab === "images" && (
        <>
          <div className="adm-chips" role="group" aria-label="Filter by area">
            {groups.map((g) => (
              <button key={g} type="button" className={`adm-chip ${group === g ? "is-on" : ""}`} onClick={() => setGroup(g)}>{g}</button>
            ))}
          </div>
          <div className="adm-slots">
            {list.map((s) => {
              const o = site.media[s.id];
              return (
                <div key={s.id} className="adm-slot">
                  <div className="adm-slot-img">
                    <Thumb def={s.def} site={site} />
                    {o && <span className="adm-slot-flag">Replaced</span>}
                  </div>
                  <div className="adm-slot-b">
                    <div className="adm-slot-t"><b>{s.label}</b><small>{s.group} · {s.hint}</small></div>
                    <div className="adm-slot-actions">
                      <label className="adm-btn adm-btn--ghost adm-btn--sm">
                        <AIcon name="upload" /> {busy === s.id ? "Working..." : "Replace"}
                        <input type="file" accept="image/*" className="adm-sr" onChange={(e) => { upload(s.id, e.target.files?.[0]); e.target.value = ""; }} />
                      </label>
                      {o && <Btn size="sm" variant="ghost" onClick={() => resetMedia(s.id)}>Original</Btn>}
                    </div>
                    <LinkInput placeholder="or paste an image link" onApply={(v) => setMedia(s.id, { image: v })} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="adm-savebar">
        <div className="adm-meter" title="Pictures you upload are kept in this browser. Large uploads fill it up.">
          <span><i style={{ width: `${pct}%` }} className={pct > 80 ? "is-hot" : ""} /></span>
          <small>Browser storage {pct}% used{pct > 80 ? ". Use image links for the rest." : ""}</small>
        </div>
        {dirty && <Badge tone="amber">Unsaved changes</Badge>}
        <span className="adm-grow" />
        <Btn onClick={save} disabled={!dirty}>Save changes</Btn>
      </div>
    </TextCtx.Provider>
  );
}
