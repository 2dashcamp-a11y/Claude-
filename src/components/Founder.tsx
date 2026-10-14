import Image from "next/image";
import { siteConfig } from "@/lib/site";
import { Folio } from "./Folio";

const ecosystems = ["BILL", "QuickBooks Online", "NetSuite", "Sage Intacct", "Xero"];

const creativeFoundation = ["Journalism & media", "Storytelling", "Design & creative direction"];

/** Typographic portrait placeholder: the technical × creative intersection. Replaced by siteConfig.founderPhoto. */
function PortraitPlaceholder() {
  return (
    <div className="absolute inset-0 flex flex-col justify-between p-7 sm:p-9">
      <div className="flex items-center justify-between">
        <span className="eyebrow text-mist">Founder</span>
        <span className="eyebrow text-mist">ATL / Remote</span>
      </div>

      <div aria-hidden="true">
        <p className="display text-[clamp(4rem,13vw,8rem)] leading-[0.82] text-cream">Dash</p>
        <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-lilac">Systems</span>
          <span className="flex items-center gap-1.5">
            <span className="h-[3px] w-8 bg-red" />
            <span className="h-[3px] w-3 bg-magenta" />
          </span>
          <span className="text-right font-serif text-xl italic text-cream">story</span>
        </div>
        <div className="mt-3 h-px bg-gradient-to-r from-lilac/70 via-magenta/70 to-red/70" />
      </div>

      <figcaption>
        <p className="font-display text-lg font-medium text-cream">Dashanay “Dash” Scott</p>
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
            <figure
              className="relative aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl border border-cream/15 bg-ink-2 sm:aspect-[4/5]"
              data-reveal
            >
              {siteConfig.founderPhoto ? (
                <Image
                  src={siteConfig.founderPhoto}
                  alt="Dashanay “Dash” Scott, founder of Dash of Digital"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <PortraitPlaceholder />
              )}
            </figure>
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
            <p className="border-l-[3px] border-red pl-5 text-cream">
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

            <div className="mt-5 grid gap-px overflow-hidden rounded-2xl border border-cream/15 bg-cream/15 sm:grid-cols-2">
              <div className="bg-ink p-6 sm:p-7">
                <p className="eyebrow text-lilac">Technical</p>
                <dl className="mt-5 grid grid-cols-2 gap-5">
                  <div>
                    <dt className="sr-only">Years of experience</dt>
                    <dd>
                      <span className="display block text-5xl text-cream">8</span>
                      <span className="mt-2 block text-[0.95rem] leading-snug text-cream/70">
                        years in IT & software implementation
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="sr-only">Migration engagements</dt>
                    <dd>
                      <span className="display block text-5xl text-cream">1,000+</span>
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
                <p className="eyebrow text-coral">Creative</p>
                <ul className="mt-5 space-y-4">
                  {creativeFoundation.map((c) => (
                    <li key={c} className="flex items-baseline gap-3 border-b border-cream/10 pb-4 last:border-0 last:pb-0">
                      <span aria-hidden="true" className="h-[3px] w-4 shrink-0 -translate-y-1 bg-red" />
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
