"use client";

import { Icon } from "./Icon";
import { useStore } from "./StoreProvider";

export default function WishlistButton({ id, name, className = "" }: { id: string; name: string; className?: string }) {
  const { isWished, toggleWish } = useStore();
  const on = isWished(id);
  return (
    <button type="button" aria-pressed={on} aria-label={on ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`} onClick={() => toggleWish(id)} className={className}>
      <Icon name="heart" className={on ? "fill-current" : ""} />
    </button>
  );
}
