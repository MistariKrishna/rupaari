"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { loadOrders, orderEvent, saveOrders, type Order } from "@/lib/orders";
import { useSession } from "./useSession";

/**
 * Orders of the signed-in account, saved on this device. Re-reads when any tab changes them.
 * With guard (the default) a visitor who is not signed in is sent to sign in and returns to the same page.
 */
export function useOrders(guard = true) {
  const { user, ready: sessionReady } = useSession();
  const router = useRouter();
  const path = usePathname();
  const [all, setAll] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const read = () => setAll(loadOrders());
    read();
    setLoaded(true);
    window.addEventListener(orderEvent, read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(orderEvent, read);
      window.removeEventListener("storage", read);
    };
  }, []);

  useEffect(() => {
    if (guard && sessionReady && !user) {
      const qs = typeof window !== "undefined" ? window.location.search : "";
      router.replace(`/login?next=${encodeURIComponent(path + qs)}`);
    }
  }, [guard, sessionReady, user, path, router]);

  const orders = useMemo(
    () => (user ? all.filter((o) => (o.userId ? o.userId === user.id : o.contact === user.id)) : []),
    [all, user],
  );

  const update = useCallback((id: string, fn: (o: Order) => Order) => {
    saveOrders(loadOrders().map((o) => (o.id === id ? fn(o) : o)));
  }, []);
  const add = useCallback((o: Order) => saveOrders([o, ...loadOrders()]), []);

  return { orders, ready: loaded && sessionReady && (!guard || Boolean(user)), update, add };
}