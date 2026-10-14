# QA checklist

**Final launch pass (October 14, 2026):** lint and typecheck are clean, unit tests are 25/25, and browser QA is 44/44 (including the axe accessibility audit at 375, 768 and 1440px). The real submission and duplicate handling were verified in Postgres. The full status, including unresolved items, is in [LAUNCH-CHECKLIST.md](LAUNCH-CHECKLIST.md).


## Design refinement pass — re-tested 2026-10-14

These checks were all re-run on the refined design, against a production build connected to Postgres + PostgREST:

- Lint, typecheck and build: clean.
- Unit tests: **25/25** pass. The backend code is unchanged.
- Browser QA (`scripts/e2e-check.mjs`): **44/44** checks pass. That's the original 38 plus these new ones:
  - **axe-core accessibility audit** at 375px, 768px and 1440px, with no serious or critical violations. The home page passed only after the contrast fixes; `/privacy` and `/terms` also came back clean.
  - The optional details step is collapsed by default.
  - An error in an optional field opens the details step and moves focus to that field.
- A real submission that included optional details was stored correctly. A duplicate submission kept the original entry and increased `submission_count`.
- Before/after screenshots are in [`screenshots/before-after/`](screenshots/before-after/). What changed is listed in [DESIGN-REFINEMENT.md](DESIGN-REFINEMENT.md).

---


Tested on 2026-10-14 against a production build (`next build && next start`).

**How it was tested:** the site was connected to a **real Postgres 16 database with PostgREST** (the same API layer Supabase uses), set up with Supabase's `anon` and `service_role` roles. A real Chromium browser drove the site with `scripts/e2e-check.mjs`. Screenshots are in [`docs/screenshots/`](screenshots/).

## Passed

| Area | Check | How |
|---|---|---|
| Build | `next build` succeeds, no TypeScript errors, no ESLint errors | `npm run build`, `npm run typecheck`, `npm run lint` |
| Unit tests | 25/25: validation, handler, duplicates, honeypot, timing, rate limit, Turnstile, storage failure, email failure, HTML escaping, Supabase RPC request, Resend request | `npm test` |
| Layout | No horizontal overflow at 375px, 768px and 1440px | e2e |
| Layout | Visually reviewed at mobile and desktop widths | screenshots |
| Images | No broken images | e2e |
| Console | No browser console errors (mobile, tablet, desktop, and during interactions) | e2e |
| Navigation | Every `#anchor` link resolves to a section. No links without an `href` | e2e |
| Navigation | Mobile menu opens, closes on link click and on Escape, and scrolls to the right section | e2e |
| CTAs | Service-card CTAs scroll to the form and preselect that service | e2e |
| Form | Empty submit flags all required fields with `aria-invalid`, shows an alert summary, and moves focus to the first invalid field | e2e |
| Form | A valid submission shows "You’re on the list. We’ll be in touch when the right opportunity opens up." | e2e |
| Form | Loading state (button disabled with "Submitting…") and failure state (alert with the server's message) | code path + unit tests |
| Database | The submission was written to Postgres with every field correct, the website URL normalized, and consent recorded with the policy version | `psql` |
| Duplicates | A re-submission with a different-case email returns the same 200 response, keeps the original data, and increments `submission_count` | e2e + `psql` |
| Errors | An invalid payload gets 422. Missing storage gets 503, and a database error gets 500. Neither shows a fake success | e2e + unit |
| Email failure | The lead is still saved and the visitor sees success. The failure is stored in `email_delivery_error` | e2e + unit |
| Security | The `anon` role can't read the table or call the RPC functions (checked through PostgREST and directly in SQL) | curl + psql |
| Security | Check constraints reject invalid option values at the database level | psql |
| Security | No service key, Resend key or Turnstile secret appears in the client JavaScript bundle | grep of `.next/static` |
| Security | Visitor input is HTML-escaped in emails, and line breaks are stripped from email subjects | unit |
| Migration | Runs cleanly twice in a row | psql |
| SEO | Title, meta description, Open Graph and Twitter tags, a single `h1`, and canonical URLs. `/robots.txt`, `/sitemap.xml`, `/icon.svg` and `/opengraph-image` all return 200 | e2e |
| Accessibility | The skip link is the first tab stop, focus outlines are visible, every field has a label, the timeline uses fieldset/legend, and reduced motion turns animations off | e2e + code review |
| Accessibility | Brand colors pass WCAG AA for body text: purple on cream is about 5.7:1. A lighter tint (`#B9A0EE`) is used for purple text on dark backgrounds | calculated |
| Export | `scripts/export-waitlist.mjs` produced a correct CSV from the database | run locally |

## Not verified

- **Real Supabase cloud project.** I tested against Postgres 16 plus PostgREST v12, not a hosted Supabase project. Run one real submission after deploying.
- **Real email delivery.** The Resend request format is unit-tested, but no email was actually sent. This needs your API key and a verified domain. Check spam placement too.
- **Cloudflare Turnstile widget.** The server check is unit-tested; the live widget needs real keys.
- **Vercel deployment**, the custom domain, and HTTPS headers in production.
- **Rate limiting across serverless instances.** It's tested per instance only (see README §5).
- **Real devices and browsers.** Only headless Chromium was used. Check Safari on iOS (the main mobile risk) and Firefox.
- **Screen reader pass** (VoiceOver/NVDA) and an automated audit (Lighthouse/axe) were not run.
- **Legal review** of `/privacy` and `/terms`.
