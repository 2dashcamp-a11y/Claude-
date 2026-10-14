import { services, type Service } from "@/lib/services";
import { Folio } from "./Folio";
import { ServiceCta } from "./ServiceCta";

function Arrow() {
  return (
    <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
      →
    </span>
  );
}

function ScopeList({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <ul className={`space-y-2.5 text-base leading-snug ${className}`}>
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span aria-hidden="true" className="mt-[0.62em] h-[2px] w-3 shrink-0 bg-current opacity-60" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Small line glyphs in the connected-node language of the hero diagram. */
function Glyph({ slug, color }: { slug: Service["slug"]; color: string }) {
  const common = { fill: "none", stroke: color, strokeWidth: 1.75, strokeLinecap: "round" as const };
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12" aria-hidden="true">
      {slug === "digital_infrastructure_audit" && (
        <>
          <circle cx="21" cy="21" r="11" {...common} />
          <path d="M29 29l9 9" {...common} />
          <circle cx="16" cy="19" r="2" fill={color} />
          <circle cx="25" cy="17" r="2" fill={color} />
          <circle cx="21" cy="26" r="2" fill={color} />
          <path d="M16 19l9-2-4 9z" {...common} strokeWidth={1} opacity={0.7} />
        </>
      )}
      {slug === "digital_experience_modernization" && (
        <>
          <rect x="6" y="9" width="36" height="28" rx="3" {...common} />
          <path d="M6 16h36" {...common} />
          <circle cx="10.5" cy="12.5" r="1" fill={color} />
          <circle cx="14" cy="12.5" r="1" fill={color} />
          <path d="M13 24h10M13 29h16" {...common} />
          <path d="M31 31l3 9 2-4 4-2z" fill={color} stroke="none" />
        </>
      )}
      {slug === "brand_creative_direction" && (
        <>
          <text x="5" y="34" fontSize="27" fill={color} className="font-serif" fontStyle="italic">
            Aa
          </text>
          <rect x="34" y="10" width="8" height="8" rx="1" fill="var(--color-red)" />
          <rect x="34" y="20" width="8" height="8" rx="1" fill="var(--color-magenta)" />
          <rect x="34" y="30" width="8" height="8" rx="1" fill="var(--color-purple)" />
        </>
      )}
    </svg>
  );
}

const accent: Record<string, { bar: string; text: string; color: string }> = {
  digital_infrastructure_audit: { bar: "bg-cream", text: "text-cream", color: "var(--color-cream)" },
  digital_experience_modernization: { bar: "bg-magenta", text: "text-rose", color: "var(--color-magenta)" },
  brand_creative_direction: { bar: "bg-red", text: "text-coral", color: "var(--color-red)" },
};

function ServiceCard({ service }: { service: Service }) {
  const a = accent[service.slug];
  return (
    <article
      className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-cream/15 bg-ink-2 p-7 transition-colors hover:border-cream/35 sm:p-8"
      aria-labelledby={`svc-${service.slug}`}
    >
      <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${a.bar}`} />
      <div className="flex items-start justify-between">
        <Glyph slug={service.slug} color={a.color} />
        <span aria-hidden="true" className="font-display text-5xl font-medium leading-none tracking-tight text-cream/40">
          {service.number}
        </span>
      </div>
      <p className={`eyebrow mt-8 ${a.text}`}>{service.discipline}</p>
      <h3 id={`svc-${service.slug}`} className="display mt-3 text-[1.85rem] leading-[1.05]">
        {service.title}
      </h3>
      <p className="mt-4 text-[1.0625rem] leading-relaxed text-cream/80">{service.summary}</p>
      <div className="mt-7 border-t border-cream/12 pt-6">
        <p className="eyebrow text-mist">What’s included</p>
        <ScopeList items={service.scope} className="mt-4 text-cream/80" />
      </div>
      <div className="mt-auto pt-8">
        <ServiceCta
          service={service.slug}
          className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-cream/30 px-6 text-[0.95rem] font-medium text-cream transition-colors hover:border-cream hover:bg-cream hover:text-ink"
        >
          Request early access <span className="sr-only">for {service.title}</span>
          <Arrow />
        </ServiceCta>
      </div>
    </article>
  );
}

export function Services() {
  const [audit, technical, experience, brand] = services;

  return (
    <section id="expertise" aria-labelledby="services-heading" className="bg-ink">
      <div className="mx-auto max-w-[1320px] px-5 py-20 sm:px-8 sm:py-24 lg:py-32">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Folio num="02" label="Expertise" className="text-lilac" />
            <h2 id="services-heading" className="display mt-6 text-[clamp(2.5rem,6vw,5rem)]" data-reveal>
              One partner. <span className="font-serif font-normal italic">Four ways forward.</span>
            </h2>
          </div>
          <p className="max-w-md text-[1.0625rem] leading-relaxed text-cream/75 lg:col-span-4 lg:col-start-9" data-reveal>
            Fintech and software implementation are where our technical work started — not where it ends. Bring us
            one problem, or the whole system.
          </p>
        </div>

        {/* Flagship: Technical Infrastructure Management */}
        <article
          className="relative mt-14 grid gap-10 overflow-hidden rounded-2xl bg-purple p-7 text-cream sm:p-10 lg:grid-cols-12 lg:gap-8 lg:p-12"
          aria-labelledby={`svc-${technical.slug}`}
          data-reveal
        >
          <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full border border-cream/20" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full border border-cream/15" />

          <div className="relative lg:col-span-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="eyebrow text-cream">{technical.number}</span>
              <span className="eyebrow rounded-full bg-ink px-3 py-1.5 text-cream">Flagship partnership</span>
            </div>
            <h3 id={`svc-${technical.slug}`} className="display mt-10 text-[clamp(2.1rem,4.2vw,3.5rem)]">
              {technical.title}
            </h3>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-cream/90">{technical.summary}</p>

            <div className="mt-10 rounded-xl bg-ink/25 p-6 ring-1 ring-cream/15">
              <p className="font-display text-2xl font-medium tracking-tight sm:text-[1.75rem]">
                Technical partnerships starting at <span className="whitespace-nowrap">$2,500/month.</span>
              </p>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-cream/85">
                Final scope and pricing depend on platforms, complexity, and support requirements.
              </p>
              <ServiceCta
                service={technical.slug}
                className="group mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-cream px-8 text-base font-semibold text-ink transition-colors hover:bg-ink hover:text-cream sm:w-auto"
              >
                Request early access <span className="sr-only">for {technical.title}</span>
                <Arrow />
              </ServiceCta>
            </div>
          </div>

          <div className="relative lg:col-span-5 lg:col-start-8 lg:pt-16">
            <p className="eyebrow text-cream">What’s included</p>
            <ScopeList items={technical.scope} className="mt-5 text-cream/95 sm:text-[1.0625rem]" />
          </div>
        </article>

        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[audit, experience, brand].map((s, i) => (
            <div key={s.slug} className={i === 2 ? "md:col-span-2 lg:col-span-1" : ""} data-reveal style={{ "--reveal-delay": `${i * 80}ms` } as React.CSSProperties}>
              <ServiceCard service={s} />
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-base text-cream/70" data-reveal>
          Not sure where you fit?{" "}
          <ServiceCta
            service="not_sure"
            className="inline-block py-2 font-medium text-cream underline underline-offset-4 hover:text-lilac"
          >
            Tell us what’s going on
          </ServiceCta>{" "}
          and we’ll help you figure it out.
        </p>
      </div>
    </section>
  );
}
