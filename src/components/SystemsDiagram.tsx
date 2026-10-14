/**
 * The DOD connected-systems map: a business's moving parts, grouped by the
 * three disciplines (systems, experiences, creative), converging on one
 * connected core. Decorative — the hero copy carries the meaning — so it is
 * hidden from assistive technology.
 *
 * Two compositions: a full map for tablet/desktop and a simplified,
 * larger-type map for phones.
 */

export type Discipline = "systems" | "experience" | "creative";

export const disciplineColor: Record<Discipline, string> = {
  systems: "var(--color-lilac)",
  experience: "var(--color-stone)",
  creative: "var(--color-rosewood)",
};

type NodeSpec = { label: string; angle: number; discipline: Discipline };

type Layout = {
  width: number;
  height: number;
  rx: number;
  ry: number;
  hubR: number;
  font: number;
  chipH: number;
  nodes: NodeSpec[];
};

const desktop: Layout = {
  width: 600,
  height: 540,
  rx: 212,
  ry: 205,
  hubR: 64,
  font: 13,
  chipH: 38,
  nodes: [
    { label: "CRM", angle: -62, discipline: "systems" },
    { label: "PAYMENTS", angle: -24, discipline: "systems" },
    { label: "ACCOUNTING", angle: 14, discipline: "systems" },
    { label: "AUTOMATIONS", angle: 54, discipline: "systems" },
    { label: "CAMPAIGNS", angle: 100, discipline: "creative" },
    { label: "BRAND", angle: 138, discipline: "creative" },
    { label: "BOOKING", angle: 180, discipline: "experience" },
    { label: "PORTAL", angle: -144, discipline: "experience" },
    { label: "WEBSITE", angle: -106, discipline: "experience" },
  ],
};

const mobile: Layout = {
  width: 360,
  height: 340,
  rx: 116,
  ry: 128,
  hubR: 50,
  font: 13,
  chipH: 36,
  nodes: [
    { label: "CRM", angle: -58, discipline: "systems" },
    { label: "PAYMENTS", angle: -4, discipline: "systems" },
    { label: "AUTOMATIONS", angle: 56, discipline: "systems" },
    { label: "BRAND", angle: 128, discipline: "creative" },
    { label: "BOOKING", angle: 180, discipline: "experience" },
    { label: "WEBSITE", angle: -122, discipline: "experience" },
  ],
};

function place(layout: Layout) {
  const hub = { x: layout.width / 2, y: layout.height / 2 };
  return layout.nodes.map((n) => {
    const rad = (n.angle * Math.PI) / 180;
    const w = Math.round(44 + n.label.length * layout.font * 0.72);
    const cx = hub.x + layout.rx * Math.cos(rad);
    const cy = hub.y + layout.ry * Math.sin(rad);
    const x = Math.min(Math.max(cx - w / 2, 2), layout.width - w - 2);
    const y = Math.min(Math.max(cy - layout.chipH / 2, 2), layout.height - layout.chipH - 2);
    // Connect from the chip edge that faces the hub.
    const ex = x + w / 2;
    const ey = y + layout.chipH / 2;
    const mx = (ex + hub.x) / 2;
    const path = `M ${ex.toFixed(1)} ${ey.toFixed(1)} C ${mx.toFixed(1)} ${ey.toFixed(1)}, ${mx.toFixed(1)} ${hub.y}, ${hub.x} ${hub.y}`;
    return { ...n, x, y, w, path };
  });
}

function Map({ layout, className, id }: { layout: Layout; className: string; id: string }) {
  const hub = { x: layout.width / 2, y: layout.height / 2 };
  const nodes = place(layout);
  const r = layout.chipH / 2;

  return (
    <svg
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
    >
      <defs>
        <linearGradient id={`chrome-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.3" stopColor="#d8d4cf" />
          <stop offset="0.52" stopColor="#8f8a85" />
          <stop offset="0.7" stopColor="#e6e2dd" />
          <stop offset="1" stopColor="#a39d97" />
        </linearGradient>
        <radialGradient id={`core-${id}`} cx="0.38" cy="0.32" r="0.8">
          <stop offset="0" stopColor="#8a5ad8" />
          <stop offset="0.55" stopColor="#6f3fc5" />
          <stop offset="1" stopColor="#3e1f78" />
        </radialGradient>
      </defs>
      <ellipse cx={hub.x} cy={hub.y} rx={layout.rx * 0.68} ry={layout.ry * 0.68} stroke="var(--color-cream)" strokeOpacity="0.09" />
      <ellipse
        cx={hub.x}
        cy={hub.y}
        rx={layout.rx}
        ry={layout.ry}
        stroke="var(--color-cream)"
        strokeOpacity="0.07"
        strokeDasharray="2 7"
      />

      {nodes.map((n) => (
        <path key={`base-${n.label}`} d={n.path} stroke={disciplineColor[n.discipline]} strokeOpacity="0.28" />
      ))}
      {nodes.map((n, i) =>
        i % 2 === 0 ? (
          <path
            key={`sig-${n.label}`}
            d={n.path}
            stroke={disciplineColor[n.discipline]}
            strokeWidth="1.75"
            strokeLinecap="round"
            className="signal-path"
            style={{ animationDelay: `${i * -0.4}s` }}
          />
        ) : null,
      )}

      {nodes.map((n, i) => (
        <g key={n.label}>
          <rect
            x={n.x}
            y={n.y}
            width={n.w}
            height={layout.chipH}
            rx={r}
            fill="rgb(28 26 32 / 0.85)"
            stroke={disciplineColor[n.discipline]}
            strokeOpacity="0.6"
          />
          <circle
            cx={n.x + r}
            cy={n.y + r}
            r="4.5"
            fill={disciplineColor[n.discipline]}
            className="pulse-node"
            style={{ animationDelay: `${i * 0.35}s` }}
          />
          <text
            x={n.x + r + 12}
            y={n.y + r + layout.font * 0.36}
            fill="var(--color-cream)"
            fontSize={layout.font}
            letterSpacing="1.1"
            fontWeight="500"
            className="font-mono"
          >
            {n.label}
          </text>
        </g>
      ))}

      {/* Connected core: the (D) monogram, framed by chrome parentheses */}
      {(() => {
        const R = layout.hubR + 30;
        const arc = (a0: number, a1: number) => {
          const p = (a: number) => `${(hub.x + R * Math.cos((a * Math.PI) / 180)).toFixed(1)} ${(hub.y + R * Math.sin((a * Math.PI) / 180)).toFixed(1)}`;
          return `M ${p(a0)} A ${R} ${R} 0 0 ${a1 > a0 ? 1 : 0} ${p(a1)}`;
        };
        const logoW = layout.hubR * 1.25;
        const logoH = (logoW * 1182) / 1680;
        return (
          <>
            <path d={arc(122, 238)} stroke={`url(#chrome-${id})`} strokeWidth="2.5" strokeLinecap="round" />
            <path d={arc(-58, 58)} stroke={`url(#chrome-${id})`} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx={hub.x} cy={hub.y} r={layout.hubR + 10} stroke={`url(#chrome-${id})`} strokeOpacity="0.55" />
            <circle cx={hub.x} cy={hub.y} r={layout.hubR} fill={`url(#core-${id})`} />
            <circle cx={hub.x} cy={hub.y} r={layout.hubR - 0.5} stroke="rgb(255 255 255 / 0.25)" />
            <image
              href="/brand/dod-monogram-cream.svg"
              x={hub.x - logoW / 2}
              y={hub.y - logoH / 2}
              width={logoW}
              height={logoH}
            />
          </>
        );
      })()}
    </svg>
  );
}

export function SystemsDiagram({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <Map layout={desktop} id="lg" className="hidden w-full sm:block" />
      <Map layout={mobile} id="sm" className="mx-auto block w-full max-w-[420px] sm:hidden" />
    </div>
  );
}
