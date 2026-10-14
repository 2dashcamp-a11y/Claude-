import { services } from "@/lib/services";
import { SystemsDiagram, disciplineColor, type Discipline } from "./SystemsDiagram";

const disciplines: { key: Discipline; name: string; detail: string }[] = [
  { key: "systems", name: "Systems", detail: "Software, integrations & automation" },
  { key: "experience", name: "Experiences", detail: "Websites, funnels & customer journeys" },
  { key: "creative", name: "Creative", detail: "Brand & creative direction" },
];

const delay = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as React.CSSProperties;

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-heading" className="relative overflow-hidden bg-ink">
      <div className="grid-lines pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_72%_45%,black,transparent_68%)]" />
      {/* Warm oxblood + violet atmosphere behind the diagram */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(42% 48% at 76% 42%, rgb(118 38 60 / 0.32), transparent 70%), radial-gradient(30% 36% at 70% 50%, rgb(111 63 197 / 0.16), transparent 70%)",
        }}
      />

      <div className="relative mx-auto grid max-w-[1320px] items-center gap-10 px-5 pb-14 pt-28 sm:px-8 lg:grid-cols-12 lg:gap-6 lg:pb-20 lg:pt-36">
        <div className="lg:col-span-6">
          <p className="eyebrow flex items-center gap-2 text-lilac sm:gap-3" data-reveal>
            <span aria-hidden="true" className="h-px w-8" style={{ background: "var(--chrome)" }} />
            Technology <span aria-hidden="true" className="text-rosewood">×</span> Strategy{" "}
            <span aria-hidden="true" className="text-rosewood">×</span> Creative
          </p>

          <h1
            id="hero-heading"
            className="display mt-7 text-[clamp(2.75rem,4.9vw,5.1rem)] text-cream"
            data-reveal
            style={delay(80)}
          >
            Your business has moving parts.{" "}
            <span className="mt-1 block">
              <span className="text-cream/55">We make them </span>
              <em className="whitespace-nowrap font-serif font-normal italic tracking-[-0.01em] text-cream">
                work together<span className="text-rosewood">.</span>
              </em>
            </span>
          </h1>

          <p className="mt-7 max-w-[34rem] text-lg leading-relaxed text-cream/80 sm:text-xl" data-reveal style={delay(160)}>
            Dash of Digital is a high-touch creative-tech partner for ambitious founders and established businesses. We
            connect your systems, digital experiences, and creative direction into one cohesive business experience.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4" data-reveal style={delay(240)}>
            <a
              href="#early-access"
              className="sheen group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-purple px-8 text-base font-semibold text-cream shadow-[inset_0_1px_0_rgb(255_255_255/0.25)] transition-colors hover:bg-purple-deep"
            >
              Get Early Access
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </a>
            <a
              href="#expertise"
              className="inline-flex h-14 items-center justify-center rounded-full border border-cream/30 px-8 text-base font-medium text-cream transition-colors hover:border-cream hover:bg-cream hover:text-ink"
            >
              Explore Our Expertise
            </a>
          </div>

          {/* Discipline key — doubles as the diagram legend */}
          <ul className="mt-10 grid grid-cols-3 gap-4 border-t border-cream/12 pt-6 sm:gap-5" data-reveal style={delay(300)}>
            {disciplines.map((d) => (
              <li key={d.key}>
                <span className="flex items-center gap-2 font-display text-[1.05rem] font-semibold text-cream sm:gap-2.5 sm:text-lg">
                  <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: disciplineColor[d.key] }} />
                  {d.name}
                </span>
                <span className="mt-1.5 block text-sm leading-snug text-cream/65 sm:text-[0.95rem]">{d.detail}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative lg:col-span-6" data-reveal style={delay(200)}>
          <SystemsDiagram className="mx-auto w-full max-w-[600px]" />
        </div>
      </div>

      {/* Contents strip */}
      <div className="relative border-t border-cream/10">
        <ol className="mx-auto grid max-w-[1320px] grid-cols-2 px-5 sm:px-8 md:grid-cols-4">
          {services.map((s, i) => (
            <li
              key={s.slug}
              className={`border-cream/10 ${i % 2 === 1 ? "border-l pl-4" : "pr-4"} ${i < 2 ? "border-b md:border-b-0" : ""} ${
                i === 2 ? "md:border-l md:pl-6" : ""
              } ${i > 0 ? "md:pl-6" : ""} md:pr-6`}
            >
              <a href="#expertise" className="group flex min-h-[44px] flex-col py-5">
                <span className="eyebrow text-stone">{s.number}</span>
                <span className="mt-2 block font-display text-base leading-snug text-cream/85 transition-colors group-hover:text-cream sm:text-[1.0625rem]">
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
