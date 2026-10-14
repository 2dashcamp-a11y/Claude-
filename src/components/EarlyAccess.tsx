import { Folio } from "./Folio";
import { WaitlistForm } from "./WaitlistForm";

const nextSteps = [
  "We review every request personally.",
  "If there’s a fit, we’ll reach out to schedule a conversation.",
  "Early clients get first access as openings become available.",
];

export function EarlyAccess() {
  return (
    <section id="early-access" aria-labelledby="early-access-heading" className="on-cream bg-cream text-ink">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-12 lg:gap-12 lg:py-32">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <Folio num="05" label="Early access" className="text-purple" />
            <h2 id="early-access-heading" className="display mt-6 text-[clamp(2.5rem,5.4vw,4.5rem)]" data-reveal>
              Let’s make your next move <em className="font-serif font-normal italic text-purple">work.</em>
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-stone" data-reveal>
              We’re opening a limited number of early client opportunities. Tell us what you’re building, what’s
              getting in the way, and where you need support.
            </p>
            <p className="mt-4 flex items-start gap-2.5 text-[0.95rem] font-medium text-ink" data-reveal>
              <span aria-hidden="true" className="mt-[0.45em] h-2 w-2 shrink-0 rounded-full bg-red" />
              Takes about a minute: four quick fields and a privacy confirmation. Everything else is optional.
            </p>

            <div className="mt-10 hidden border-t border-ink/15 pt-7 lg:block" data-reveal>
              <p className="eyebrow text-stone">What happens next</p>
              <ol className="mt-5 space-y-3.5">
                {nextSteps.map((step, i) => (
                  <li key={step} className="flex gap-4 text-base leading-relaxed">
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
          {/* On small screens the next steps follow the form instead of preceding it. */}
          <div className="mt-8 border-t border-ink/15 pt-6 lg:hidden">
            <p className="eyebrow text-stone">What happens next</p>
            <ol className="mt-4 space-y-3">
              {nextSteps.map((step, i) => (
                <li key={step} className="flex gap-4 text-base leading-relaxed">
                  <span className="eyebrow pt-1 text-purple">{String(i + 1).padStart(2, "0")}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
