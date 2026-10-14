import Image from "next/image";
import { siteConfig } from "@/lib/site";

const credentials = [
  { figure: "8", unit: "years", label: "in IT, software implementation and technical consulting" },
  { figure: "1,000+", unit: "", label: "ERP and software migration engagements supported" },
  { figure: "Fintech", unit: "", label: "Deep roots in financial systems, sync troubleshooting and integrations" },
  { figure: "Media", unit: "", label: "A journalism, storytelling and design background shaping every experience" },
];

const ecosystems = ["BILL", "QuickBooks Online", "NetSuite", "Sage Intacct", "Xero"];

export function Founder() {
  return (
    <section aria-labelledby="founder-heading" className="relative overflow-hidden bg-ink">
      <div className="mx-auto grid max-w-[1320px] gap-14 px-5 py-24 sm:px-8 lg:grid-cols-12 lg:gap-8 lg:py-36">
        {/* Portrait slot: typographic composition until a verified photo is supplied (siteConfig.founderPhoto). */}
        <div className="lg:col-span-5" data-reveal>
          <figure className="relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-2xl border border-cream/12 bg-ink-2">
            {siteConfig.founderPhoto ? (
              <Image
                src={siteConfig.founderPhoto}
                alt="Dashanay “Dash” Scott, founder of Dash of Digital"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col justify-between p-8 sm:p-10">
                <div className="flex items-center justify-between">
                  <span className="eyebrow text-mist">Founder</span>
                  <span className="eyebrow text-mist">ATL / Remote</span>
                </div>
                <div aria-hidden="true">
                  <p className="display text-[clamp(5rem,15vw,9rem)] leading-[0.82] text-cream">Dash</p>
                  <div className="mt-5 flex items-center gap-4">
                    <span className="h-2 w-16 bg-red" />
                    <span className="h-2 w-6 bg-magenta" />
                    <span className="h-2 w-3 bg-purple" />
                  </div>
                </div>
                <figcaption>
                  <p className="font-display text-lg text-cream">Dashanay “Dash” Scott</p>
                  <p className="mt-1 text-sm text-cream/60">Founder, Dash of Digital</p>
                </figcaption>
              </div>
            )}
          </figure>
        </div>

        <div className="lg:col-span-7">
          <p className="eyebrow text-lilac" data-reveal>
            The founder
          </p>
          <h2 id="founder-heading" className="display mt-6 text-[clamp(2.25rem,5vw,4.25rem)]" data-reveal>
            Built by someone who knows what happens{" "}
            <em className="font-serif font-normal italic text-lilac">behind the screen.</em>
          </h2>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-cream/80" data-reveal>
            After years helping businesses navigate software migrations, integrations, and the messy realities of
            technology, Dash founded Dash of Digital to bridge the gap between strategy, systems, and execution.
          </p>

          <dl className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-cream/12 bg-cream/12 sm:grid-cols-2">
            {credentials.map((c) => (
              <div key={c.label} className="bg-ink p-6 sm:p-7" data-reveal>
                <dt className="sr-only">{c.label}</dt>
                <dd>
                  <span className="display block text-4xl text-cream sm:text-5xl">
                    {c.figure}
                    {c.unit && <span className="ml-2 font-serif text-2xl font-normal italic text-cream/70">{c.unit}</span>}
                  </span>
                  <span className="mt-3 block text-sm leading-relaxed text-cream/65">{c.label}</span>
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-10" data-reveal>
            <p className="eyebrow text-mist">Hands-on with ecosystems including</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {ecosystems.map((e) => (
                <li key={e} className="rounded-full border border-cream/15 px-4 py-2 font-mono text-xs text-cream/80">
                  {e}
                </li>
              ))}
            </ul>
            <p className="mt-6 max-w-2xl text-xs leading-relaxed text-cream/50">
              Experience described here was gained across the founder’s career, including in prior roles at BILL.
              Dash of Digital is an independent agency and is not affiliated with, endorsed by, or a certified
              partner of BILL, Intuit, Oracle NetSuite, Sage, Xero, or any other software vendor. Product names are
              trademarks of their respective owners.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
