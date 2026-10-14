import { Folio } from "./Folio";

const frictions = [
  {
    title: "Disconnected software",
    body: "Your CRM, payments, accounting and booking tools each hold part of the picture — and none of them talk.",
  },
  {
    title: "Repetitive manual tasks",
    body: "Re-keying data, chasing status updates and copying records between platforms eat hours every week.",
  },
  {
    title: "Failed integrations",
    body: "Syncs that quietly stop, duplicate records, and errors nobody owns until something downstream breaks.",
  },
  {
    title: "Confusing customer journeys",
    body: "Inquiry, booking, purchase and onboarding feel like separate businesses to the people trying to buy.",
  },
  {
    title: "Inefficient digital experiences",
    body: "A website that looks fine but doesn’t convert, connect, or tell you what’s actually happening.",
  },
  {
    title: "Tools that don’t scale",
    body: "Workarounds that made sense at ten clients become bottlenecks at a hundred.",
  },
];

export function Problem() {
  return (
    <section id="about" aria-labelledby="problem-heading" className="on-cream bg-cream text-ink">
      <div className="mx-auto grid max-w-[1320px] gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-12 lg:gap-8 lg:py-32">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <Folio num="01" label="The insight" className="text-purple" />
            <h2
              id="problem-heading"
              className="display mt-6 text-[clamp(2.25rem,5vw,4.25rem)]"
              data-reveal
            >
              Your business shouldn’t have to work <em className="font-serif font-normal italic">around</em> its
              technology.
            </h2>
            <blockquote className="mt-10 border-l-2 border-oxblood pl-6" data-reveal>
              <p className="font-serif text-2xl leading-snug sm:text-[1.75rem]">
                Better technology isn’t always about adding another platform. Sometimes it’s about making what you
                already have work.
              </p>
            </blockquote>
          </div>
        </div>

        <ol className="lg:col-span-6 lg:col-start-7">
          {frictions.map((f, i) => (
            <li
              key={f.title}
              className="grid grid-cols-[3rem_1fr] gap-x-4 border-t border-ink/15 py-6 last:border-b sm:grid-cols-[4rem_1fr] sm:py-7"
              data-reveal
            >
              <span className="eyebrow pt-1.5 text-purple">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="font-display text-xl font-medium tracking-tight sm:text-2xl">{f.title}</h3>
                <p className="mt-2 max-w-md text-[1.0625rem] leading-relaxed text-graphite">{f.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
