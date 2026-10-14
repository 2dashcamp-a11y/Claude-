import Link from "next/link";
import { navLinks, siteConfig } from "@/lib/site";
import { CopyrightYear } from "./CopyrightYear";
import { Logo } from "./Logo";

const BUILD_YEAR = 2026;

export function SiteFooter({ onHome = true }: { onHome?: boolean }) {
  const anchor = (href: string) => (onHome ? href : `/${href}`);

  return (
    <footer className="border-t border-cream/10 bg-ink text-cream">
      <div className="mx-auto max-w-[1320px] px-5 pb-10 pt-16 sm:pt-20 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="flex items-end gap-6">
              <Logo variant="stacked" height={92} />
              <span aria-hidden="true" className="mb-1 h-20 w-px bg-gradient-to-b from-transparent via-stone/50 to-transparent" />
              <Logo variant="monogram" height={52} decorative className="mb-1 opacity-90" />
            </div>
            <p className="mt-6 max-w-sm font-serif text-2xl leading-snug text-cream/85">{siteConfig.tagline}</p>
            <p className="mt-4 max-w-sm text-[0.95rem] leading-relaxed text-cream/65">
              A creative-tech agency connecting strategy, systems, and creative direction into one cohesive business
              experience. U.S.-based, working remotely with clients everywhere.
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 lg:col-span-6">
            <div>
              <p className="eyebrow text-stone">Explore</p>
              <ul className="mt-4 space-y-1 text-[0.95rem]">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a href={anchor(link.href)} className="inline-block py-1.5 text-cream/75 hover:text-cream">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow text-stone">Contact & legal</p>
              <ul className="mt-4 space-y-1 text-[0.95rem]">
                <li>
                  {siteConfig.contactEmail ? (
                    <a href={`mailto:${siteConfig.contactEmail}`} className="inline-block break-all py-1.5 text-cream/75 hover:text-cream">
                      {siteConfig.contactEmail}
                    </a>
                  ) : (
                    <a href={anchor("#early-access")} className="inline-block py-1.5 text-cream/75 hover:text-cream">
                      Get in touch
                    </a>
                  )}
                </li>
                <li>
                  <Link href="/privacy" className="inline-block py-1.5 text-cream/75 hover:text-cream">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="inline-block py-1.5 text-cream/75 hover:text-cream">
                    Terms of Use
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-cream/10 pt-6 text-sm text-cream/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CopyrightYear buildYear={BUILD_YEAR} /> {siteConfig.legalName}. All rights reserved.
          </p>
          <p className="eyebrow">Technology × Strategy × Creative</p>
        </div>
      </div>
    </footer>
  );
}
