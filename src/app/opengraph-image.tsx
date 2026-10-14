import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Dash of Digital — Your business has moving parts. We make them work together.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function svgDataUri(file: string) {
  const svg = await readFile(join(process.cwd(), "public/brand", file));
  return `data:image/svg+xml;base64,${svg.toString("base64")}`;
}

export default async function OpengraphImage() {
  const fontDir = join(process.cwd(), "src/app/fonts");
  const [logo, monogram, serif, serifItalic] = await Promise.all([
    svgDataUri("dod-logo-cream.svg"),
    svgDataUri("dod-monogram-cream.svg"),
    readFile(join(fontDir, "playfair-display-latin-500-normal.woff")),
    readFile(join(fontDir, "playfair-display-latin-500-italic.woff")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px 80px",
          color: "#F5EFE4",
          background:
            "radial-gradient(60% 80% at 85% 30%, rgba(118,38,60,0.55), transparent 70%), radial-gradient(40% 50% at 80% 55%, rgba(111,63,197,0.25), transparent 70%), #0B0B0D",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <img src={logo} width={420} height={94} alt="" />
          <img src={monogram} width={120} height={84} alt="" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontFamily: "Playfair", fontSize: 80, lineHeight: 1.06, letterSpacing: -1 }}>
          <span>Your business has moving parts.</span>
          <span style={{ display: "flex" }}>
            <span style={{ color: "rgba(245,239,228,0.6)" }}>We make them&nbsp;</span>
            <span style={{ fontStyle: "italic", color: "#B9A0EE" }}>work together.</span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 22, letterSpacing: 5, color: "#B6A79D" }}>
          <div style={{ width: 56, height: 2, background: "linear-gradient(90deg,#ffffff,#8f8a85,#e6e2dd)" }} />
          TECHNOLOGY × STRATEGY × CREATIVE
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Playfair", data: serif, style: "normal", weight: 500 },
        { name: "Playfair", data: serifItalic, style: "italic", weight: 500 },
      ],
    },
  );
}
