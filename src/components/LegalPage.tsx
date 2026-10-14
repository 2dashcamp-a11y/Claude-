import Link from "next/link";
import type { ReactNode } from "react";
import { siteConfig } from "@/lib/site";
import { SiteFooter } from "./SiteFooter";
import { Wordmark } from "./Wordmark";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <header className="border-b border-cream/10 bg-ink">
        <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between px-5 sm:px-8 lg:h-[72px]">
          <Link href="/" aria-label="Dash of Digital — home">
            <Wordmark />
          </Link>
          <Link href="/#early-access" className="text-sm text-cream/75 hover:text-cream">
            Join Early Access
          </Link>
        </div>
      </header>
      <main id="main" className="on-cream bg-cream text-ink">
        <article className="mx-auto max-w-3xl px-5 py-20 sm:px-8 lg:py-28">
          <p className="eyebrow text-purple">Legal</p>
          <h1 className="display mt-5 text-5xl sm:text-6xl">{title}</h1>
          <p className="mt-5 text-sm text-stone">Last updated: {siteConfig.legalLastUpdated}</p>
          <div className="legal mt-12 space-y-5 leading-relaxed text-ink/85 [&_a]:font-medium [&_a]:text-purple [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mt-12 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:tracking-tight [&_h2]:text-ink [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
            {children}
          </div>
        </article>
      </main>
      <SiteFooter onHome={false} />
    </>
  );
}

/** The configured contact email, or the early-access form as a fallback. */
export function ContactMethod() {
  return siteConfig.contactEmail ? (
    <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
  ) : (
    <>
      replying to any email you have received from us, or by submitting the{" "}
      <Link href="/#early-access">early access form</Link> with “Privacy request” in the challenge field
    </>
  );
}
