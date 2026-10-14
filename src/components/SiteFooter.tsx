import Link from "next/link";
import { navLinks, siteConfig } from "@/lib/site";
import { CopyrightYear } from "./CopyrightYear";
import { Wordmark } from "./Wordmark";

const BUILD_YEAR = 2026;

export function SiteFooter({ onHome = true }: { onHome?: boolean }) {
  const anchor = (href: string) => (onHome ? href : `/${href}`);

  return (
    <footer className="border-t border-cream/10 bg-ink text-cream">
      <div className="mx-auto max-w-[1320px] px-5 pb-10 pt-20 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <Wordmark className="text-lg" />
            <p className="mt-6 max-w-sm font-serif text-2xl leading-snug text-cream/85">{siteConfig.tagline}</p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream/60">
              A technology-led creative agency connecting the systems, experiences, and ideas that move businesses
              forward. U.S.-based, working remotely with clients everywhere.
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 lg:col-span-6">
            <div>
              <p className="eyebrow text-mist">Explore</p>
              <ul className="mt-5 space-y-3 text-sm">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a href={anchor(link.href)} className="text-cream/75 hover:text-cream">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow text-mist">Contact & legal</p>
              <ul className="mt-5 space-y-3 text-sm">
                <li>
                  {siteConfig.contactEmail ? (
                    <a href={`mailto:${siteConfig.contactEmail}`} className="break-all text-cream/75 hover:text-cream">
                      {siteConfig.contactEmail}
                    </a>
                  ) : (
                    <a href={anchor("#early-access")} className="text-cream/75 hover:text-cream">
                      Get in touch
                    </a>
                  )}
                </li>
                <li>
                  <Link href="/privacy" className="text-cream/75 hover:text-cream">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-cream/75 hover:text-cream">
                    Terms of Use
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="mt-20 flex flex-col gap-3 border-t border-cream/10 pt-6 text-xs text-cream/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CopyrightYear buildYear={BUILD_YEAR} /> {siteConfig.legalName}. All rights reserved.
          </p>
          <p className="eyebrow">Technology × Strategy × Creative</p>
        </div>
      </div>
    </footer>
  );
}
