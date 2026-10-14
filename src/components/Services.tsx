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
          <rect x="34" y="10" width="8" height="8" rx="1" fill="var(--color-oxblood)" stroke="var(--color-rosewood)" strokeWidth="0.75" />
          <rect x="34" y="20" width="8" height="8" rx="1" fill="var(--color-purple)" />
          <rect x="34" y="30" width="8" height="8" rx="1" fill="var(--color-stone)" />
        </>
      )}
    </svg>
  );
}

const accent: Record<string, { bar: string; text: string; color: string }> = {
  digital_infrastructure_audit: { bar: "var(--chrome)", text: "text-cream", color: "var(--color-cream)" },
  digital_experience_modernization: { bar: "var(--color-stone)", text: "text-stone", color: "var(--color-stone)" },
  brand_creative_direction: {
    bar: "linear-gradient(90deg, var(--color-oxblood), var(--color-rosewood))",
    text: "text-rosewood",
    color: "var(--color-rosewood)",
  },
};

function ServiceCard({ service }: { service: Service }) {
  const a = accent[service.slug];
  return (
    <article
      className="chrome-border lift relative flex h-full flex-col overflow-hidden rounded-2xl p-7 sm:p-8"
      aria-labelledby={`svc-${service.slug}`}
    >
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1" style={{ background: a.bar }} />
      <div className="flex items-start justify-between">
        <Glyph slug={service.slug} color={a.color} />
        <span aria-hidden="true" className="chrome-text inline-block pr-1 font-display text-6xl font-medium italic leading-none">
          {service.number}
        </span>
      </div>
      <p className={`eyebrow mt-8 ${a.text}`}>{service.discipline}</p>
      <h3 id={`svc-${service.slug}`} className="display mt-3 text-[2rem] leading-[1.08]">
        {service.title}
      </h3>
      <p className="mt-4 text-[1.0625rem] leading-relaxed text-cream/80">{service.summary}</p>
      <div className="mt-7 border-t border-cream/12 pt-6">
        <p className="eyebrow text-stone">What’s included</p>
        <ScopeList items={service.scope} className="mt-4 text-cream/80" />
      </div>
      <div className="mt-auto pt-8">
        <ServiceCta
          service={service.slug}
          className="sheen group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-cream/30 px-6 text-[0.95rem] font-medium text-cream transition-colors hover:border-cream hover:bg-cream hover:text-ink"
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
          className="relative mt-14 grid gap-10 overflow-hidden rounded-2xl p-7 text-cream shadow-[inset_0_1px_0_rgb(255_255_255/0.22)] sm:p-10 lg:grid-cols-12 lg:gap-8 lg:p-12"
          style={{
            background:
              "radial-gradient(70% 90% at 100% 0%, rgb(118 38 60 / 0.55), transparent 60%), linear-gradient(135deg, #7c4ad4 0%, #6f3fc5 45%, #5a2fa8 100%)",
          }}
          aria-labelledby={`svc-${technical.slug}`}
          data-reveal
        >
          {/* Sculptural parenthesis curve */}
          <svg aria-hidden="true" viewBox="0 0 200 600" className="pointer-events-none absolute -right-6 top-1/2 hidden h-[130%] -translate-y-1/2 opacity-60 lg:block" fill="none">
            <path d="M40 10 C 190 160, 190 440, 40 590" stroke="url(#flag-chrome)" strokeWidth="2" strokeLinecap="round" />
            <defs>
              <linearGradient id="flag-chrome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fff" stopOpacity="0" />
                <stop offset="0.35" stopColor="#fff" stopOpacity="0.8" />
                <stop offset="0.6" stopColor="#b6a79d" stopOpacity="0.6" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          <div className="relative lg:col-span-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="eyebrow text-cream">{technical.number}</span>
              <span className="eyebrow rounded-full bg-ink px-3 py-1.5 text-cream">Flagship partnership</span>
            </div>
            <h3 id={`svc-${technical.slug}`} className="display mt-10 text-[clamp(2.1rem,4.2vw,3.5rem)]">
              {technical.title}
            </h3>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-cream/90">{technical.summary}</p>

            <div className="glass mt-10 rounded-xl p-6">
              <p className="font-display text-2xl font-medium tracking-tight sm:text-[1.75rem]">
                Technical partnerships starting at <span className="whitespace-nowrap">$2,500/month.</span>
              </p>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-cream/85">
                Final scope and pricing depend on platforms, complexity, and support requirements.
              </p>
              <ServiceCta
                service={technical.slug}
                className="sheen group mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-cream px-8 text-base font-semibold text-ink transition-colors hover:bg-ink hover:text-cream sm:w-auto"
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
