import Image from "next/image";
import { siteConfig } from "@/lib/site";
import { Folio } from "./Folio";
import { Logo } from "./Logo";

const ecosystems = ["BILL", "QuickBooks Online", "NetSuite", "Sage Intacct", "Xero"];

const creativeFoundation = ["Journalism & media", "Storytelling", "Design & creative direction"];

/**
 * Typographic composition shown on the retro monitor until a verified founder
 * photo is set in siteConfig.founderPhoto: the (D) mark plus the
 * systems × story pairing.
 */
function ScreenComposition() {
  return (
    <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <span className="eyebrow text-stone">Founder</span>
        <span className="eyebrow text-stone">ATL / Remote</span>
      </div>

      <div aria-hidden="true" className="flex flex-col items-center text-center">
        <Logo variant="monogram" height={92} decorative className="drop-shadow-[0_0_24px_rgba(185,160,238,0.35)]" />
        <div className="mt-6 flex items-center gap-4">
          <span className="font-mono text-xs uppercase tracking-[0.16em] text-lilac">Systems</span>
          <span className="h-px w-10" style={{ background: "var(--chrome)" }} />
          <span className="font-serif text-2xl italic text-rosewood">story</span>
        </div>
      </div>

      <figcaption className="text-center">
        <p className="font-display text-xl font-medium text-cream">Dashanay “Dash” Scott</p>
        <p className="mt-1 text-[0.95rem] text-cream/65">Founder, Dash of Digital</p>
      </figcaption>
    </div>
  );
}

export function Founder() {
  return (
    <section aria-labelledby="founder-heading" className="relative overflow-hidden bg-ink">
      <div className="mx-auto grid max-w-[1320px] gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-12 lg:gap-10 lg:py-32">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            {/* Retro monitor: chrome bezel, CRT screen */}
            <div className="mx-auto w-full max-w-md lg:mx-0" data-reveal>
            <figure
              className="relative rounded-[2rem] p-[10px] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)]"
              style={{ background: "var(--chrome)" }}
            >
              <div className="crt relative aspect-square overflow-hidden rounded-[1.4rem] shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] sm:aspect-[5/4]">
              {siteConfig.founderPhoto ? (
                <Image
                  src={siteConfig.founderPhoto}
                  alt="Dashanay “Dash” Scott, founder of Dash of Digital"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <ScreenComposition />
              )}
              {/* Glass reflection */}
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(155deg,rgba(255,255,255,0.10)_0%,transparent_38%)]" />
              </div>
            </figure>
            <div aria-hidden="true" className="mx-auto h-4 w-16" style={{ background: "linear-gradient(90deg,#6d6864,#cfcac5,#6d6864)" }} />
            <div aria-hidden="true" className="mx-auto h-2 w-40 rounded-full" style={{ background: "var(--chrome)" }} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <Folio num="04" label="The founder" className="text-lilac" />
          <h2 id="founder-heading" className="display mt-6 text-[clamp(2.25rem,5vw,4.25rem)]" data-reveal>
            Built by someone who knows what happens{" "}
            <em className="font-serif font-normal italic text-lilac">behind the screen.</em>
          </h2>

          <div className="mt-8 max-w-2xl space-y-5 text-[1.0625rem] leading-relaxed text-cream/80 sm:text-lg" data-reveal>
            <p>
              Dash spent eight years on the technical side of business software: implementing platforms, untangling
              integrations, and supporting more than 1,000 ERP and software migration engagements, including senior
              implementation work at BILL.
            </p>
            <p>
              Dash also brings a background in journalism, media, storytelling, and design, and an instinct for how
              people read, decide, and trust. That combination is rare: someone who can fix the sync error{" "}
              <em className="font-serif text-[1.1em] italic text-cream">and</em> rewrite the page your customers bounce
              from.
            </p>
            <p className="border-l-[3px] border-oxblood pl-5 text-cream">
              After years helping businesses navigate software migrations, integrations, and the messy realities of
              technology, Dash founded Dash of Digital to bridge the gap between strategy, systems, and execution.
            </p>
          </div>

          {/* Founder's professional record — explicitly not company results */}
          <div className="mt-12" data-reveal>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <h3 className="eyebrow text-cream">Founder’s professional track record</h3>
              <p className="text-sm text-cream/60">Earned in prior roles, before Dash of Digital</p>
            </div>

            <div className="chrome-border mt-5 grid divide-y divide-cream/15 overflow-hidden rounded-2xl [--surface:var(--color-ink)] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              <div className="bg-ink p-6 sm:p-7">
                <p className="eyebrow text-lilac">Technical</p>
                <dl className="mt-5 grid grid-cols-2 gap-5">
                  <div>
                    <dt className="sr-only">Years of experience</dt>
                    <dd>
                      <span className="chrome-text display inline-block text-[2.6rem] leading-none">8</span>
                      <span className="mt-2 block text-[0.95rem] leading-snug text-cream/70">
                        years in IT & software implementation
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="sr-only">Migration engagements</dt>
                    <dd>
                      <span className="chrome-text display inline-block whitespace-nowrap text-[2.6rem] leading-none">1,000+</span>
                      <span className="mt-2 block text-[0.95rem] leading-snug text-cream/70">
                        ERP & software migration engagements
                      </span>
                    </dd>
                  </div>
                </dl>
                <ul className="mt-6 flex flex-wrap gap-2" aria-label="Ecosystems worked with">
                  {ecosystems.map((e) => (
                    <li key={e} className="rounded-full border border-cream/20 px-3 py-1.5 font-mono text-[0.8rem] text-cream/85">
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-ink p-6 sm:p-7">
                <p className="eyebrow text-rosewood">Creative</p>
                <ul className="mt-5 space-y-4">
                  {creativeFoundation.map((c) => (
                    <li key={c} className="flex items-baseline gap-3 border-b border-cream/10 pb-4 last:border-0 last:pb-0">
                      <span aria-hidden="true" className="h-px w-5 shrink-0 -translate-y-1.5 bg-rosewood" />
                      <span className="font-serif text-2xl italic leading-tight text-cream">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Company record — honest about being new */}
          <div className="mt-5 rounded-2xl border border-dashed border-cream/25 p-6 sm:p-7" data-reveal>
            <h3 className="font-display text-xl font-medium tracking-tight text-cream">
              Dash of Digital’s own track record starts now.
            </h3>
            <p className="mt-2 max-w-2xl text-[0.95rem] leading-relaxed text-cream/70">
              Dash of Digital is a new agency opening to its first clients. The experience above belongs to the
              founder’s career. We won’t publish client results we haven’t earned yet, so early-access clients will be the
              first.
            </p>
          </div>

          <p className="mt-6 max-w-2xl text-[0.8125rem] leading-relaxed text-cream/55">
            Dash of Digital is an independent agency and is not affiliated with, endorsed by, or a certified partner of
            BILL, Intuit, Oracle NetSuite, Sage, Xero, or any other software vendor. Product names are trademarks of their
            respective owners.
          </p>
        </div>
      </div>
    </section>
  );
}
