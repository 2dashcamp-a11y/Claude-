/**
 * Abstract map of a business's moving parts converging on one connected core.
 * Decorative: the hero copy carries the meaning, so the SVG is hidden from
 * assistive technology.
 */

type Node = { label: string; x: number; y: number; w: number; tone: "lilac" | "red" | "magenta" | "cream" };

const HUB = { x: 300, y: 270 };

const nodes: Node[] = [
  { label: "WEBSITE", x: 40, y: 48, w: 118, tone: "cream" },
  { label: "CRM", x: 248, y: 18, w: 80, tone: "lilac" },
  { label: "PAYMENTS", x: 420, y: 72, w: 130, tone: "cream" },
  { label: "BOOKING", x: 6, y: 224, w: 116, tone: "magenta" },
  { label: "ACCOUNTING", x: 446, y: 248, w: 146, tone: "lilac" },
  { label: "BRAND", x: 52, y: 424, w: 96, tone: "red" },
  { label: "AUTOMATIONS", x: 236, y: 496, w: 160, tone: "cream" },
  { label: "PORTAL", x: 460, y: 416, w: 104, tone: "magenta" },
];

const toneColor = {
  lilac: "var(--color-lilac)",
  red: "var(--color-red)",
  magenta: "var(--color-magenta)",
  cream: "var(--color-cream)",
};

function pathTo(node: Node) {
  const cx = node.x + node.w / 2;
  const cy = node.y + 18;
  const mx = (cx + HUB.x) / 2;
  return `M ${cx} ${cy} C ${mx} ${cy}, ${mx} ${HUB.y}, ${HUB.x} ${HUB.y}`;
}

export function SystemsDiagram({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 560"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
    >
      {/* Concentric guides */}
      <circle cx={HUB.x} cy={HUB.y} r="150" stroke="var(--color-cream)" strokeOpacity="0.08" />
      <circle cx={HUB.x} cy={HUB.y} r="228" stroke="var(--color-cream)" strokeOpacity="0.05" strokeDasharray="2 6" />

      {/* Static connections */}
      {nodes.map((n) => (
        <path key={`base-${n.label}`} d={pathTo(n)} stroke="var(--color-cream)" strokeOpacity="0.16" />
      ))}
      {/* Moving signal along every other connection */}
      {nodes.map((n, i) =>
        i % 2 === 0 ? (
          <path
            key={`sig-${n.label}`}
            d={pathTo(n)}
            stroke={toneColor[n.tone]}
            strokeOpacity="0.9"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="signal-path"
            style={{ animationDelay: `${i * -0.35}s` }}
          />
        ) : null,
      )}

      {/* Nodes */}
      {nodes.map((n, i) => (
        <g key={n.label}>
          <rect
            x={n.x}
            y={n.y}
            width={n.w}
            height="36"
            rx="18"
            fill="var(--color-ink-2)"
            stroke="var(--color-cream)"
            strokeOpacity="0.22"
          />
          <circle
            cx={n.x + 18}
            cy={n.y + 18}
            r="4"
            fill={toneColor[n.tone]}
            className="pulse-node"
            style={{ animationDelay: `${i * 0.4}s` }}
          />
          <text
            x={n.x + 32}
            y={n.y + 22.5}
            fill="var(--color-cream)"
            fillOpacity="0.85"
            fontSize="12"
            letterSpacing="1.4"
            className="font-mono"
          >
            {n.label}
          </text>
        </g>
      ))}

      {/* Hub */}
      <circle cx={HUB.x} cy={HUB.y} r="64" fill="var(--color-purple)" />
      <circle cx={HUB.x} cy={HUB.y} r="80" stroke="var(--color-purple)" strokeOpacity="0.45" />
      <rect x={HUB.x - 20} y={HUB.y - 3} width="40" height="6" fill="var(--color-red)" />
      <text
        x={HUB.x}
        y={HUB.y - 18}
        textAnchor="middle"
        fill="var(--color-cream)"
        fontSize="13"
        letterSpacing="2.5"
        className="font-display"
        fontWeight="600"
      >
        DASH
      </text>
      <text
        x={HUB.x}
        y={HUB.y + 28}
        textAnchor="middle"
        fill="var(--color-cream)"
        fontSize="10"
        letterSpacing="2"
        className="font-mono"
      >
        CONNECTED
      </text>
    </svg>
  );
}
