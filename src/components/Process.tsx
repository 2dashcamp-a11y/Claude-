const stages = [
  {
    name: "Discover",
    body: "Understand the business, customer journey, technology, and goals.",
  },
  {
    name: "Design",
    body: "Develop the solution, roadmap, workflow, or experience.",
  },
  {
    name: "Implement",
    body: "Configure, connect, build, test, and launch.",
  },
  {
    name: "Optimize",
    body: "Improve performance and maintain the agreed infrastructure.",
  },
];

export function Process() {
  return (
    <section id="how-we-work" aria-labelledby="process-heading" className="on-cream bg-cream-2 text-ink">
      <div className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 lg:py-36">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="eyebrow text-purple" data-reveal>
              How we work
            </p>
            <h2 id="process-heading" className="display mt-6 text-[clamp(2.25rem,5.4vw,4.5rem)]" data-reveal>
              Strategy first. Systems that work.{" "}
              <em className="font-serif font-normal italic text-purple">Room to grow.</em>
            </h2>
          </div>
        </div>

        <ol className="relative mt-16 grid gap-0 md:grid-cols-4 md:gap-6">
          <div aria-hidden="true" className="absolute left-[11px] top-3 bottom-3 w-px bg-ink/20 md:left-0 md:right-0 md:top-[11px] md:bottom-auto md:h-px md:w-auto" />
          {stages.map((stage, i) => (
            <li key={stage.name} className="relative pb-10 pl-12 md:pb-0 md:pl-0 md:pt-14" data-reveal style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}>
              <span
                aria-hidden="true"
                className={`absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full border ${
                  i === 3 ? "border-purple bg-purple" : "border-ink/30 bg-cream-2"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${i === 3 ? "bg-cream" : "bg-ink"}`} />
              </span>
              <span className="eyebrow text-stone">Stage {String(i + 1).padStart(2, "0")}</span>
              <h3 className="display mt-3 text-3xl sm:text-4xl">{stage.name}</h3>
              <p className="mt-3 max-w-xs leading-relaxed text-stone">{stage.body}</p>
            </li>
          ))}
        </ol>

        <p className="mt-14 max-w-xl border-t border-ink/15 pt-6 text-sm text-stone" data-reveal>
          These are delivery stages, not packages. An engagement might start with an audit, go straight to
          implementation, or settle into ongoing optimization — scoped to what your business actually needs.
        </p>
      </div>
    </section>
  );
}
