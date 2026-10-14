"use client";

import { useEffect, useState } from "react";
import { navLinks } from "@/lib/site";
import { Wordmark } from "./Wordmark";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300 ${
        solid ? "border-b border-cream/10 bg-ink/90 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between px-5 sm:px-8 lg:h-[72px]">
        <a href="#top" className="text-cream" onClick={() => setOpen(false)}>
          <Wordmark />
          <span className="sr-only">, back to top</span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-9 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-cream/75 transition-colors hover:text-cream"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#early-access"
            className="rounded-full bg-cream px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-lilac"
          >
            Join Early Access
          </a>
        </nav>

        <button
          type="button"
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="relative block h-3 w-6" aria-hidden="true">
            <span
              className={`absolute left-0 top-0 h-px w-6 bg-cream transition-transform duration-300 ${open ? "translate-y-1.5 rotate-45" : ""}`}
            />
            <span
              className={`absolute bottom-0 left-0 h-px w-6 bg-cream transition-transform duration-300 ${open ? "-translate-y-1.5 -rotate-45" : ""}`}
            />
          </span>
        </button>
      </div>

      <div
        id="mobile-nav"
        hidden={!open}
        className="h-[calc(100dvh-4rem)] overflow-y-auto border-t border-cream/10 bg-ink px-5 pb-10 pt-6 sm:px-8 lg:hidden"
      >
        <nav aria-label="Mobile">
          <ol className="divide-y divide-cream/10 border-b border-cream/10">
            {navLinks.map((link, i) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline gap-4 py-5 font-display text-3xl tracking-tight text-cream"
                >
                  <span className="eyebrow text-mist">0{i + 1}</span>
                  {link.label}
                </a>
              </li>
            ))}
          </ol>
          <a
            href="#early-access"
            onClick={() => setOpen(false)}
            className="mt-8 flex h-14 items-center justify-center rounded-full bg-purple text-base font-medium text-cream"
          >
            Join Early Access
          </a>
        </nav>
      </div>
    </header>
  );
}
