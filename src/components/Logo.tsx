/**
 * Founder-provided Dash of Digital logo artwork (traced to SVG from the
 * supplied files in /brand-source; see docs/BRAND-ASSETS.md). Never re-typeset
 * the logo in a web font.
 */

const variants = {
  primary: { file: "dod-logo", w: 2702, h: 606 },
  alternate: { file: "dod-logo-alt", w: 2740, h: 540 },
  stacked: { file: "dod-logo-stacked", w: 2530, h: 1526 },
  monogram: { file: "dod-monogram", w: 1680, h: 1182 },
} as const;

export function Logo({
  variant = "primary",
  tone = "cream",
  height,
  className = "",
  decorative = false,
}: {
  variant?: keyof typeof variants;
  tone?: "cream" | "ink";
  /** Rendered height in px; width follows the artwork's aspect ratio. */
  height: number;
  className?: string;
  /** Hide from assistive tech when adjacent text already names the brand. */
  decorative?: boolean;
}) {
  const v = variants[variant];
  const width = Math.round((height * v.w) / v.h);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static SVG; no optimization needed
    <img
      src={`/brand/${v.file}-${tone}.svg`}
      width={width}
      height={height}
      alt={decorative ? "" : "Dash of Digital"}
      className={`block h-auto max-w-full select-none ${className}`}
      style={{ height, width: "auto" }}
      draggable={false}
    />
  );
}
