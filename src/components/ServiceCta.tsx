"use client";

import type { ReactNode } from "react";
import type { ServiceInterest } from "@/lib/waitlist/options";

export const SELECT_SERVICE_EVENT = "dod:select-service";

/**
 * Link to the waitlist that also preselects a service. Without JavaScript it
 * still jumps to the form.
 */
export function ServiceCta({
  service,
  className,
  children,
}: {
  service: ServiceInterest;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href="#early-access"
      className={className}
      onClick={() => {
        window.dispatchEvent(new CustomEvent(SELECT_SERVICE_EVENT, { detail: service }));
      }}
    >
      {children}
    </a>
  );
}
