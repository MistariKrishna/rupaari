"use client";

import { useSyncExternalStore } from "react";
import { currencyCode, subscribeCurrency, type Code } from "@/lib/currency";

/** The selected currency. The server and the first render use rupees so the page matches before the saved choice loads. */
export const useCurrency = () => useSyncExternalStore(subscribeCurrency, currencyCode, () => "INR" as Code);
