import { services } from "@/lib/services";
import { SystemsDiagram } from "./SystemsDiagram";

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-heading" className="relative overflow-hidden bg-ink">
      <div className="grid-lines pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_70%_40%,black,transparent_70%)]" />

      <div className="relative mx-auto grid max-w-[1320px] gap-12 px-5 pb-16 pt-32 sm:px-8 lg:grid-cols-12 lg:gap-8 lg:pb-24 lg:pt-40">
        <div className="lg:col-span-7">
          <p className="eyebrow flex items-center gap-3 text-lilac" data-reveal>
            <span aria-hidden="true" className="h-px w-8 bg-red" />
            Technology <span aria-hidden="true" className="text-red">×</span> Strategy{" "}
            <span aria-hidden="true" className="text-red">×</span> Creative
          </p>

          <h1
            id="hero-heading"
            className="display mt-8 text-[clamp(2.6rem,6.4vw,6rem)] text-cream"
            data-reveal
            style={{ "--reveal-delay": "80ms" } as React.CSSProperties}
          >
            Your business has moving parts.{" "}
            <span className="block text-cream/55">
              We make them{" "}
              <em className="font-serif font-normal italic tracking-[-0.01em] text-cream">work together.</em>
            </span>
          </h1>

          <p
            className="mt-8 max-w-xl text-lg leading-relaxed text-cream/75 sm:text-xl"
            data-reveal
            style={{ "--reveal-delay": "160ms" } as React.CSSProperties}
          >
            From software implementation and automation to digital experiences and creative direction, Dash of
            Digital connects what your business needs to operate better and grow.
          </p>

          <div
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
            data-reveal
            style={{ "--reveal-delay": "240ms" } as React.CSSProperties}
          >
            <a
              href="#early-access"
              className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-purple px-8 text-base font-medium text-cream transition-colors hover:bg-purple-deep"
            >
              Get Early Access
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </a>
            <a
              href="#expertise"
              className="inline-flex h-14 items-center justify-center rounded-full border border-cream/25 px-8 text-base font-medium text-cream transition-colors hover:border-cream hover:bg-cream hover:text-ink"
            >
              Explore Our Expertise
            </a>
          </div>
        </div>

        <div className="relative lg:col-span-5 lg:-mr-6" data-reveal style={{ "--reveal-delay": "200ms" } as React.CSSProperties}>
          <SystemsDiagram className="mx-auto w-full max-w-[520px]" />
        </div>
      </div>

      {/* Contents strip */}
      <div className="relative border-t border-cream/10">
        <ol className="mx-auto grid max-w-[1320px] grid-cols-2 px-5 sm:px-8 md:grid-cols-4">
          {services.map((s, i) => (
            <li
              key={s.slug}
              className={`border-cream/10 py-5 md:py-6 ${i % 2 === 1 ? "pl-4 md:pl-6" : "pr-4 md:pr-6"} ${
                i > 0 ? "md:border-l md:pl-6" : ""
              } ${i % 2 === 1 ? "border-l" : ""} ${i < 2 ? "border-b md:border-b-0" : ""}`}
            >
              <a href="#expertise" className="group block">
                <span className="eyebrow text-mist">{s.number}</span>
                <span className="mt-2 block font-display text-sm leading-snug text-cream/85 transition-colors group-hover:text-cream sm:text-base">
                  {s.title}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
