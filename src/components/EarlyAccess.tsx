import { WaitlistForm } from "./WaitlistForm";

const nextSteps = [
  "We review every request personally.",
  "If there’s a fit, we’ll reach out to schedule a conversation.",
  "Early clients help shape how we work — and get first access as spots open.",
];

export function EarlyAccess() {
  return (
    <section id="early-access" aria-labelledby="early-access-heading" className="on-cream bg-cream text-ink">
      <div className="mx-auto grid max-w-[1320px] gap-14 px-5 py-24 sm:px-8 lg:grid-cols-12 lg:gap-10 lg:py-36">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <p className="eyebrow flex items-center gap-3 text-purple" data-reveal>
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-red" />
              Early access — limited openings
            </p>
            <h2 id="early-access-heading" className="display mt-6 text-[clamp(2.5rem,5.6vw,4.75rem)]" data-reveal>
              Let’s make your next move <em className="font-serif font-normal italic text-purple">work.</em>
            </h2>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-stone" data-reveal>
              We’re opening a limited number of early client opportunities. Tell us what you’re building, what’s
              getting in the way, and where you need support.
            </p>
            <div className="mt-12 border-t border-ink/15 pt-8" data-reveal>
              <p className="eyebrow text-stone">What happens next</p>
              <ol className="mt-5 space-y-4">
                {nextSteps.map((step, i) => (
                  <li key={step} className="flex gap-4 text-[0.95rem] leading-relaxed">
                    <span className="eyebrow pt-1 text-purple">{String(i + 1).padStart(2, "0")}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
        <div className="lg:col-span-7" data-reveal>
          <WaitlistForm />
        </div>
      </div>
    </section>
  );
}
