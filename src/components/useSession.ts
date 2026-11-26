"use client";

import { useEffect, useState } from "react";
import { SESSION_EVENT, getSession, type User } from "@/lib/auth";

export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const read = () => setUser(getSession());
    read();
    setReady(true);
    window.addEventListener(SESSION_EVENT, read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(SESSION_EVENT, read);
      window.removeEventListener("storage", read);
    };
  }, []);
  return { user, ready };
}
