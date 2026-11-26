"use client";

import { Icon } from "./Icon";
import { useStore } from "./StoreProvider";

export default function AddToBag({ id, className = "btn w-full", label = "Add to bag" }: { id: string; className?: string; label?: string }) {
  const { add } = useStore();
  return (
    <button type="button" className={className} onClick={() => add(id)}>
      {label} <Icon name="bag" />
    </button>
  );
}
