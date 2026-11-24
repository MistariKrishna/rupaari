import { site } from "@/lib/site";
import { BrandIcon } from "./BrandIcon";

const MAIN = ["Instagram", "Facebook", "YouTube"];

/** The three main social pages (Instagram, Facebook, YouTube) as round icon buttons. */
export default function SocialLinks({ className = "" }: { className?: string }) {
  const list = site.social.filter((s) => MAIN.includes(s.name));
  return (
    <div className={`soc-row ${className}`.trim()}>
      {list.map((s) =>
        s.href ? (
          <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name} title={s.name} className="mo-soc">
            <BrandIcon name={s.icon} />
          </a>
        ) : (
          <span key={s.name} aria-label={s.name} title={s.name} className="mo-soc">
            <BrandIcon name={s.icon} />
          </span>
        ),
      )}
    </div>
  );
}