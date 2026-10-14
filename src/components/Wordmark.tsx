/**
 * Typographic wordmark for DASH OF DIGITAL — a placeholder lockup until a
 * founder-approved logo exists. Bold grotesk "DASH", a literal red dash,
 * an editorial italic "of", then "DIGITAL": systems precision meets
 * editorial voice in one line.
 */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-baseline gap-[0.32em] font-display text-[1.05rem] font-bold leading-none tracking-[0.08em] ${className}`}
    >
      <span>DASH</span>
      <span
        aria-hidden="true"
        className="inline-block h-[0.2em] w-[1em] -translate-y-[0.32em] rounded-[1px] bg-red"
      />
      <span className="sr-only"> </span>
      <span className="font-serif text-[1.18em] font-normal italic tracking-normal">of</span>
      <span className="sr-only"> </span>
      <span>DIGITAL</span>
    </span>
  );
}
