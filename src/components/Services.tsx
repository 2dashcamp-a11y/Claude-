import { services, type Service } from "@/lib/services";
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
    <ul className={`space-y-2.5 text-[0.95rem] ${className}`}>
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span aria-hidden="true" className="mt-[0.6em] h-px w-3 shrink-0 bg-current opacity-50" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function StandardCard({ service, accent }: { service: Service; accent: string }) {
  return (
    <article
      className="group/card relative flex h-full flex-col rounded-2xl border border-cream/12 bg-ink-2 p-7 transition-colors hover:border-cream/30 sm:p-9"
      aria-labelledby={`svc-${service.slug}`}
    >
      <div className="flex items-center justify-between">
        <span className="eyebrow text-mist">{service.number}</span>
        <span aria-hidden="true" className={`h-2 w-2 rounded-full ${accent}`} />
      </div>
      <h3 id={`svc-${service.slug}`} className="display mt-10 text-[1.75rem] sm:text-3xl">
        {service.title}
      </h3>
      <p className="mt-4 text-cream/75">{service.summary}</p>
      <ScopeList items={service.scope} className="mt-7 text-cream/70" />
      <ServiceCta
        service={service.slug}
        className="group mt-auto inline-flex items-center gap-2 pt-9 text-sm font-medium text-cream underline decoration-cream/30 underline-offset-[6px] hover:decoration-cream"
      >
        Request early access <span className="sr-only">for {service.title}</span>
        <Arrow />
      </ServiceCta>
    </article>
  );
}

export function Services() {
  const [audit, technical, experience, brand] = services;

  return (
    <section id="expertise" aria-labelledby="services-heading" className="bg-ink">
      <div className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 lg:py-36">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow text-lilac" data-reveal>
              Expertise
            </p>
            <h2 id="services-heading" className="display mt-6 text-[clamp(2.5rem,6vw,5rem)]" data-reveal>
              One partner. <span className="font-serif font-normal italic">Four ways forward.</span>
            </h2>
          </div>
          <p className="max-w-md text-cream/70 lg:col-span-4 lg:col-start-9" data-reveal>
            Fintech and software implementation are where our technical work started — not where it ends. Bring us
            one problem, or the whole system.
          </p>
        </div>

        <div className="mt-16 grid gap-5 lg:grid-cols-12">
          {/* Flagship: Technical Infrastructure Management */}
          <article
            className="relative overflow-hidden rounded-2xl bg-purple p-7 text-cream sm:p-10 lg:col-span-7 lg:row-span-2 lg:p-12"
            aria-labelledby={`svc-${technical.slug}`}
            data-reveal
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-cream/20"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full border border-cream/15"
            />
            <div className="flex flex-wrap items-center gap-3">
              <span className="eyebrow text-cream/80">{technical.number}</span>
              <span className="eyebrow rounded-full bg-ink px-3 py-1.5 text-cream">Flagship partnership</span>
            </div>
            <h3 id={`svc-${technical.slug}`} className="display mt-12 max-w-lg text-[clamp(2rem,4vw,3.25rem)]">
              {technical.title}
            </h3>
            <p className="mt-5 max-w-lg text-lg text-cream/90">{technical.summary}</p>

            <ScopeList items={technical.scope} className="mt-8 grid gap-x-8 text-cream/90 sm:grid-cols-2 sm:space-y-0 sm:gap-y-3" />

            <div className="mt-12 flex flex-col gap-6 border-t border-cream/25 pt-8 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
                  Technical partnerships starting at $2,500/month.
                </p>
                <p className="mt-2 max-w-sm text-sm text-cream/80">
                  Final scope and pricing depend on platforms, complexity, and support requirements.
                </p>
              </div>
              <ServiceCta
                service={technical.slug}
                className="group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-cream px-6 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-cream"
              >
                Request early access <span className="sr-only">for {technical.title}</span>
                <Arrow />
              </ServiceCta>
            </div>
          </article>

          <div className="lg:col-span-5" data-reveal>
            <StandardCard service={audit} accent="bg-lilac" />
          </div>
          <div className="lg:col-span-5" data-reveal>
            <StandardCard service={experience} accent="bg-magenta" />
          </div>

          {/* Brand & Creative: full-width editorial band */}
          <article
            className="group/card relative grid gap-8 overflow-hidden rounded-2xl border border-cream/12 bg-ink-2 p-7 sm:p-10 lg:col-span-12 lg:grid-cols-12 lg:p-12"
            aria-labelledby={`svc-${brand.slug}`}
            data-reveal
          >
            <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-red to-magenta" />
            <div className="lg:col-span-5">
              <span className="eyebrow text-mist">{brand.number}</span>
              <h3 id={`svc-${brand.slug}`} className="display mt-10 text-[clamp(1.9rem,3.6vw,3rem)]">
                {brand.title}
              </h3>
              <p className="mt-4 max-w-md text-cream/75">{brand.summary}</p>
            </div>
            <div className="lg:col-span-4 lg:col-start-7 lg:pt-16">
              <ScopeList items={brand.scope} className="text-cream/70" />
            </div>
            <div className="flex items-end lg:col-span-2 lg:col-start-11 lg:justify-end">
              <ServiceCta
                service={brand.slug}
                className="group inline-flex items-center gap-2 text-sm font-medium text-cream underline decoration-cream/30 underline-offset-[6px] hover:decoration-cream"
              >
                Request early access <span className="sr-only">for {brand.title}</span>
                <Arrow />
              </ServiceCta>
            </div>
            <p
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-6 right-6 hidden select-none font-serif text-[9rem] italic leading-none text-cream/[0.04] lg:block"
            >
              creative
            </p>
          </article>
        </div>

        <p className="mt-10 text-center text-sm text-cream/60" data-reveal>
          Not sure where you fit?{" "}
          <ServiceCta service="not_sure" className="text-cream underline underline-offset-4 hover:text-lilac">
            Tell us what’s going on
          </ServiceCta>{" "}
          and we’ll help you figure it out.
        </p>
      </div>
    </section>
  );
}
