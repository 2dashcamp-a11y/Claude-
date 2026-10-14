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
  experience: "var(--color-magenta)",
  creative: "var(--color-red)",
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

function Map({ layout, className }: { layout: Layout; className: string }) {
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
            fill="var(--color-ink-2)"
            stroke={disciplineColor[n.discipline]}
            strokeOpacity="0.55"
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

      {/* Connected core: echoes the wordmark */}
      <circle cx={hub.x} cy={hub.y} r={layout.hubR + 16} stroke="var(--color-purple)" strokeOpacity="0.5" />
      <circle cx={hub.x} cy={hub.y} r={layout.hubR} fill="var(--color-purple)" />
      <text
        x={hub.x}
        y={hub.y - 8}
        textAnchor="middle"
        fill="var(--color-cream)"
        fontSize={layout.hubR * 0.3}
        fontWeight="700"
        letterSpacing="1.5"
        className="font-display"
      >
        DASH
      </text>
      <rect x={hub.x - layout.hubR * 0.28} y={hub.y + 1} width={layout.hubR * 0.56} height="5" rx="1" fill="var(--color-red)" />
      <text
        x={hub.x}
        y={hub.y + layout.hubR * 0.46}
        textAnchor="middle"
        fill="var(--color-cream)"
        fontSize={layout.hubR * 0.27}
        className="font-serif"
        fontStyle="italic"
      >
        connected
      </text>
    </svg>
  );
}

export function SystemsDiagram({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <Map layout={desktop} className="hidden w-full sm:block" />
      <Map layout={mobile} className="mx-auto block w-full max-w-[420px] sm:hidden" />
    </div>
  );
}
