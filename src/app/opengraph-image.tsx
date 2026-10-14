import { ImageResponse } from "next/og";

export const alt = "Dash of Digital — Your business has moving parts. We make them work together.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0B0B0D",
          color: "#F5EFE4",
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 30, letterSpacing: 6, fontWeight: 700 }}>
          <span>DASH</span>
          <span style={{ width: 40, height: 6, background: "#E33B30" }} />
          <span>OF DIGITAL</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 78, lineHeight: 1.02, letterSpacing: -2, fontWeight: 700, maxWidth: 980 }}>
            Your business has moving parts.
          </div>
          <div style={{ fontSize: 78, lineHeight: 1.02, letterSpacing: -2, fontWeight: 700, color: "#B9A0EE" }}>
            We make them work together.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 22, letterSpacing: 4, color: "#A7A19A" }}>
          <span style={{ width: 14, height: 14, borderRadius: 7, background: "#6F3FC5" }} />
          TECHNOLOGY × STRATEGY × CREATIVE
        </div>
      </div>
    ),
    size,
  );
}
