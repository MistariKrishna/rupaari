"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";

/** Static, swipeable row with left / right buttons. */
export default function ArrivalsRail({ children, label }: { children: React.ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update]);

  const go = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const item = el.querySelector<HTMLElement>(".snap-item");
    const step = (item?.offsetWidth ?? 300) + 24;
    el.scrollBy({ left: dir * step * 2, behavior: "smooth" });
  };

  return (
    <div className="rail">
      <button type="button" className="rail-btn rail-prev" onClick={() => go(-1)} disabled={atStart} aria-label="Previous products">
        <Icon name="chevron-left" />
      </button>
      <div className="snap" ref={ref} onScroll={update} tabIndex={0} aria-label={label}>
        {children}
      </div>
      <button type="button" className="rail-btn rail-next" onClick={() => go(1)} disabled={atEnd} aria-label="Next products">
        <Icon name="chevron-right" />
      </button>
    </div>
  );
}
