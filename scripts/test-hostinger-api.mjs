#!/usr/bin/env node
/**
 * Contract tests for the Hostinger PHP waitlist endpoint (hostinger/api/waitlist.php).
 * Mirrors tests/handler.test.ts so both backends behave identically.
 *
 *   BASE_URL=http://localhost:8080 node scripts/test-hostinger-api.mjs
 *
 * WRITES test entries — run against a local/staging copy, not production.
 * Default phase uses exactly 6 rate-counted requests (the 6th must be limited).
 * PHASE=extra checks size and fill-time rejection (run after clearing the rate table).
 */
const BASE = (process.env.BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");
const URL_ = `${BASE}/api/waitlist`;
const stamp = Date.now();
const results = [];
const check = (name, ok, detail = "") => {
  results.push(ok);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

const valid = (over = {}) => ({
  fullName: "Ada Lovelace",
  email: `ada+${stamp}@example.com`,
  companyName: "Analytical Engines",
  serviceInterest: "digital_infrastructure_audit",
  websiteUrl: "analytical.example",
  budgetRange: "2500_4999",
  timeline: "within_30_days",
  biggestChallenge: "Our <b>CRM</b> and books don't sync.",
  privacyAcknowledged: true,
  marketingConsent: false,
  fax: "",
  startedAt: Date.now() - 30_000,
  ...over,
});

async function post(body, { contentType = "application/json", raw } = {}) {
  const res = await fetch(URL_, {
    method: "POST",
    headers: { "content-type": contentType },
    body: raw ?? JSON.stringify(body),
  });
  let json = null;
  try {
    json = await res.json();
  } catch {}
  return { status: res.status, json };
}

// Not counted by the rate limiter (rejected before it):
let r = await fetch(URL_);
check("GET is rejected (405)", r.status === 405, String(r.status));
r = await post(null, { contentType: "text/plain", raw: "x" });
check("non-JSON rejected (415)", r.status === 415, String(r.status));

if (process.env.PHASE === "extra") {
  // Separate phase (run after the rate-limit window resets or the rate table is cleared).
  r = await post(null, { raw: JSON.stringify({ a: "x".repeat(20_000) }) });
  check("oversized body rejected (413)", r.status === 413, String(r.status));
  r = await post(valid({ email: `fast+${stamp}@example.com`, startedAt: Date.now() - 500 }));
  check("too-fast submission rejected (400)", r.status === 400, String(r.status));
} else {
  // Counted requests 1–5, then the 6th must be rate limited.
  r = await post(null, { raw: "{not json" });
  check("malformed JSON rejected (400)", r.status === 400, String(r.status));

  r = await post({ email: "bad", privacyAcknowledged: false, serviceInterest: "hacking", websiteUrl: "javascript:alert(1)" });
  const fe = r.json?.fieldErrors ?? {};
  check(
    "invalid fields → 422 with field errors",
    r.status === 422 &&
      ["fullName", "email", "companyName", "serviceInterest", "websiteUrl", "privacyAcknowledged"].every((k) => fe[k]),
    JSON.stringify(Object.keys(fe)),
  );
  check("error message matches the site copy", fe.email === "Enter a valid email address, like name@company.com.", fe.email);

  r = await post(valid({ email: `bot+${stamp}@example.com`, fax: "buy now" }));
  check("honeypot → silent 200, nothing stored", r.status === 200 && r.json?.ok === true, String(r.status));

  r = await post(valid());
  check("valid submission → 200 ok", r.status === 200 && r.json?.ok === true, `${r.status} ${JSON.stringify(r.json)}`);

  r = await post(valid({ fullName: "Someone Else", email: `  ADA+${stamp}@EXAMPLE.com ` }));
  check("duplicate (different case) → identical 200", r.status === 200 && r.json?.ok === true, String(r.status));

  r = await post(valid({ email: `rate+${stamp}@example.com` }));
  check("6th request in 10 min → 429", r.status === 429, String(r.status));
}

console.log(`\n${results.filter(Boolean).length}/${results.length} checks passed. Test email: ada+${stamp}@example.com`);
process.exit(results.every(Boolean) ? 0 : 1);
