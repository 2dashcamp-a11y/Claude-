#!/usr/bin/env node
/**
 * Browser QA pass against a running site.
 *
 *   BASE_URL=http://localhost:3000 npm run test:e2e
 *
 * Checks: console errors, horizontal overflow at phone/tablet/desktop widths,
 * broken images, nav anchors, mobile menu, service preselection, form
 * validation, and a real submission (which WRITES one test entry — point it
 * at a local or staging database, not production).
 * Screenshots are written to SCREENSHOT_DIR (default ./qa-screenshots).
 */
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const SHOTS = process.env.SCREENSHOT_DIR ?? "qa-screenshots";
const TEST_EMAIL = process.env.E2E_EMAIL ?? `qa+${Date.now()}@example.com`;
mkdirSync(SHOTS, { recursive: true });

const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});

async function newPage(viewport) {
  const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (msg) => msg.type() === "error" && errors.push(msg.text()));
  page.on("pageerror", (err) => errors.push(err.message));
  return { page, errors, context };
}

// 1. Layout at three widths.
for (const [label, viewport] of [
  ["mobile", { width: 375, height: 812 }],
  ["tablet", { width: 768, height: 1024 }],
  ["desktop", { width: 1440, height: 900 }],
]) {
  const { page, errors, context } = await newPage(viewport);
  const res = await page.goto(BASE_URL, { waitUntil: "networkidle" });
  check(`${label}: page loads`, res?.status() === 200, `status ${res?.status()}`);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(`${label}: no horizontal overflow`, overflow <= 0, `${overflow}px`);
  const broken = await page.evaluate(() =>
    [...document.images].filter((img) => img.complete && img.naturalWidth === 0).map((i) => i.src),
  );
  check(`${label}: no broken images`, broken.length === 0, broken.join(", "));
  await page.screenshot({ path: `${SHOTS}/${label}-full.png`, fullPage: true });
  check(`${label}: no console errors`, errors.length === 0, errors.join(" | "));
  await context.close();
}

// 2. Desktop interactions.
{
  const { page, errors, context } = await newPage({ width: 1440, height: 900 });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });

  check("title", (await page.title()) === "Dash of Digital | Technology, Systems & Creative Agency");
  check("single h1", (await page.locator("h1").count()) === 1);
  const metaDesc = await page.locator('meta[name="description"]').getAttribute("content");
  check("meta description", !!metaDesc && metaDesc.startsWith("Dash of Digital helps"));
  check("og:image", (await page.locator('meta[property="og:image"]').count()) > 0);

  // Every in-page anchor resolves to an element.
  const anchors = await page.evaluate(() =>
    [...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute("href")),
  );
  const missing = await page.evaluate(
    (hrefs) => [...new Set(hrefs)].filter((h) => h !== "#" && !document.querySelector(h)),
    anchors,
  );
  check("all anchor targets exist", missing.length === 0, missing.join(", "));

  // No dead links/buttons.
  const dead = await page.evaluate(() =>
    [...document.querySelectorAll("a")].filter((a) => !a.getAttribute("href")).length,
  );
  check("no links without href", dead === 0);

  // Legal pages.
  for (const path of ["/privacy", "/terms", "/robots.txt", "/sitemap.xml", "/icon.svg", "/opengraph-image"]) {
    const r = await page.request.get(BASE_URL + path);
    check(`GET ${path}`, r.status() === 200, `status ${r.status()}`);
  }

  // Empty submit shows accessible errors.
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(300);
  const invalid = await page.locator('[aria-invalid="true"]').count();
  check("empty submit flags required fields", invalid >= 4, `${invalid} invalid`);
  check("error summary announced", (await page.locator('[role="alert"]').count()) > 0);
  const focused = await page.evaluate(() => document.activeElement?.getAttribute("name"));
  check("focus moves to first invalid field", focused === "fullName", String(focused));
  await page.locator("#early-access").screenshot({ path: `${SHOTS}/form-errors.png` });

  // Service CTA preselects interest.
  await page.locator('#expertise a:has-text("Request early access")').filter({ hasText: "Brand" }).first().click();
  await page.waitForTimeout(400);
  const selected = await page.locator('select[name="serviceInterest"]').inputValue();
  check("service CTA preselects interest", selected === "brand_creative_direction", selected);

  // Real submission.
  await page.locator('input[name="fullName"]').fill("QA Tester");
  await page.locator('input[name="email"]').fill(TEST_EMAIL);
  await page.locator('input[name="companyName"]').fill("QA Co");
  await page.locator('input[name="websiteUrl"]').fill("qa-example.com");
  await page.locator('select[name="serviceInterest"]').selectOption("technical_infrastructure_management");
  await page.locator('select[name="businessStage"]').selectOption("established");
  await page.locator('select[name="budgetRange"]').selectOption("2500_4999");
  await page.locator('label:has-text("Within 30 days")').click();
  await page.locator('textarea[name="biggestChallenge"]').fill("Our CRM and accounting tools don't sync.");
  await page.locator('input[name="privacyAcknowledged"]').check();
  await page.waitForTimeout(2600); // past the minimum fill time
  await page.locator('button[type="submit"]').click();
  const success = page.locator('[role="status"]:has-text("You’re on the list.")');
  await success.waitFor({ timeout: 15000 }).catch(() => {});
  check("successful submission shows confirmation", await success.isVisible());
  await page.locator("#early-access").screenshot({ path: `${SHOTS}/form-success.png` });

  // Duplicate: same response.
  const dup = await page.request.post(`${BASE_URL}/api/waitlist`, {
    headers: { "content-type": "application/json", "x-forwarded-for": "192.0.2.50" },
    data: {
      fullName: "Someone Else",
      email: TEST_EMAIL.toUpperCase(),
      companyName: "Other",
      serviceInterest: "not_sure",
      privacyAcknowledged: true,
      startedAt: Date.now() - 10000,
    },
  });
  check("duplicate returns identical success", dup.status() === 200 && (await dup.json()).ok === true);

  const badRes = await page.request.post(`${BASE_URL}/api/waitlist`, {
    headers: { "content-type": "application/json", "x-forwarded-for": "192.0.2.51" },
    data: { email: "x" },
  });
  check("server rejects invalid payload", badRes.status() === 422);

  check("desktop interactions: no console errors", errors.length === 0, errors.join(" | "));
  await context.close();
}

// 3. Mobile menu.
{
  const { page, errors, context } = await newPage({ width: 375, height: 812 });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  const toggle = page.locator('button[aria-controls="mobile-nav"]');
  await toggle.click();
  check("mobile menu opens", (await toggle.getAttribute("aria-expanded")) === "true");
  await page.screenshot({ path: `${SHOTS}/mobile-menu.png` });
  await page.locator('#mobile-nav a:has-text("How We Work")').click();
  await page.waitForTimeout(500);
  check("mobile menu closes after navigation", (await toggle.getAttribute("aria-expanded")) === "false");
  const inView = await page.evaluate(() => {
    const r = document.querySelector("#how-we-work").getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  });
  check("mobile nav scrolls to section", inView);
  await toggle.click();
  await page.keyboard.press("Escape");
  check("Escape closes mobile menu", (await toggle.getAttribute("aria-expanded")) === "false");
  check("mobile interactions: no console errors", errors.length === 0, errors.join(" | "));
  await context.close();
}

// 4. Keyboard: skip link is first focusable.
{
  const { page, context } = await newPage({ width: 1440, height: 900 });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.keyboard.press("Tab");
  const text = await page.evaluate(() => document.activeElement?.textContent?.trim());
  check("skip link is first tab stop", text === "Skip to content", String(text));
  await context.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed. Test email: ${TEST_EMAIL}`);
process.exit(failed.length ? 1 : 0);
