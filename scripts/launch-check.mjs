/**
 * Launch smoke check: page weight, placeholder-text scan, and a status check of
 * every internal link on /, /privacy and /terms.
 *   BASE_URL=https://yourdomain.com node scripts/launch-check.mjs
 */
import { chromium } from "playwright";
const base = process.env.BASE_URL ?? "http://localhost:3000";
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
const p = await b.newPage();
let bytes = 0; const types = {};
p.on("response", async (r) => { try { const len = (await r.body()).length; bytes += len; const t = (r.headers()["content-type"] || "").split(";")[0]; types[t] = (types[t] || 0) + len; } catch {} });
const t0 = Date.now();
await p.goto(base, { waitUntil: "networkidle" });
console.log("home load (local, networkidle):", Date.now() - t0, "ms; transferred (uncompressed bytes):", Math.round(bytes / 1024), "KB");
console.log(Object.fromEntries(Object.entries(types).map(([k, v]) => [k, Math.round(v / 1024) + "KB"])));
const links = new Set();
for (const path of ["/", "/privacy", "/terms"]) {
  await p.goto(base + path, { waitUntil: "networkidle" });
  const text = await p.evaluate(() => document.body.innerText);
  const bad = text.match(/lorem|TODO|TBD|placeholder|example\.com|\[[A-Z ]+\]|undefined|null/gi);
  console.log(path, "placeholder scan:", bad ? bad : "clean");
  (await p.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")))).forEach((h) => links.add(h));
}
for (const h of links) {
  if (h.startsWith("#") || h.startsWith("mailto:")) continue;
  const url = new URL(h, base);
  const r = await p.request.get(url.toString());
  console.log(r.status(), url.pathname + url.hash);
}
await b.close();
