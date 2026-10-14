/** Editorial section marker: number, red dash, label. */
export function Folio({ num, label, className = "" }: { num: string; label: string; className?: string }) {
  return (
    <p className={`folio ${className}`} data-reveal>
      <span className="folio-num">{num}</span>
      <span aria-hidden="true" className="folio-dash" />
      <span>{label}</span>
    </p>
  );
}
