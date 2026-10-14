"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** Current year, recomputed in the browser so a static build never goes stale. */
export function CopyrightYear({ buildYear }: { buildYear: number }) {
  const year = useSyncExternalStore(
    subscribe,
    () => new Date().getFullYear(),
    () => buildYear,
  );
  return <>{year}</>;
}
