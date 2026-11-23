"use client";

import { useCallback, useEffect, useState } from "react";
import { loadOrders, orderEvent, saveOrders, type Order } from "@/lib/orders";

/** Orders saved on this device. Re-reads when any tab changes them. */
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const read = () => setOrders(loadOrders());
    read();
    setReady(true);
    window.addEventListener(orderEvent, read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(orderEvent, read);
      window.removeEventListener("storage", read);
    };
  }, []);

  const update = useCallback((id: string, fn: (o: Order) => Order) => {
    saveOrders(loadOrders().map((o) => (o.id === id ? fn(o) : o)));
  }, []);
  const add = useCallback((o: Order) => saveOrders([o, ...loadOrders()]), []);

  return { orders, ready, update, add };
}