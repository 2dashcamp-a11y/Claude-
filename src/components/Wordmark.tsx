/**
 * Typographic wordmark for DASH OF DIGITAL. A placeholder treatment until a
 * founder-approved logo exists — the "dash" is a literal red rule.
 */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-[0.4em] font-display text-[0.95rem] font-semibold tracking-[0.16em] ${className}`}
    >
      <span>DASH</span>
      <span aria-hidden="true" className="inline-block h-[0.16em] w-[1.1em] translate-y-[0.02em] bg-red" />
      <span className="sr-only"> </span>
      <span>OF DIGITAL</span>
    </span>
  );
}
