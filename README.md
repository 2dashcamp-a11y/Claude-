# Dash of Digital — landing page & early-access waitlist

Production-ready, single-page agency site for **Dash of Digital LLC** with a database-backed waitlist.

- **Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Supabase (Postgres) · Resend (email, optional) · Vercel
- **Pages:** `/` (landing), `/privacy`, `/terms`, plus `sitemap.xml`, `robots.txt`, favicon and a generated Open Graph image
- **API:** `POST /api/waitlist` validates on the server, stores the submission, then notifies the founder and the visitor by email

> Status: the code is built and tested locally (see [docs/QA.md](docs/QA.md)). It is **not deployed yet**. You need to create the Supabase project and Vercel project with your own accounts (steps below).

---

## 1. Project structure

```
src/
  app/
    layout.tsx              Fonts, SEO metadata, skip link
    page.tsx                Landing page (section order)
    globals.css             Brand tokens (palette, fonts), motion, reduced-motion rules
    api/waitlist/route.ts   Waitlist endpoint (wires real dependencies into the handler)
    privacy/ terms/         Legal pages (DRAFTS — have them reviewed)
    icon.svg  opengraph-image.tsx  sitemap.ts  robots.ts
  components/               Header, Hero, SystemsDiagram, Problem, Services, Process,
                            Founder, EarlyAccess, WaitlistForm, SiteFooter, LegalPage …
  lib/
    site.ts                 Site config: names, URL, contact email, founder photo slot
    services.ts             The four service areas (copy lives here)
    waitlist/
      options.ts            Dropdown options shared by the form, the API and the database
      schema.ts             Zod validation (the browser and server use the same schema)
      handler.ts            Request handling: rate limit, validate, bot checks, store, email
      store.ts              Supabase store (+ in-memory store for local previews)
      email.ts              Resend mailer + founder/visitor email templates
      protection.ts         Rate limiter, Cloudflare Turnstile verification
supabase/migrations/        SQL: table, constraints, indexes, RLS, functions
scripts/
  export-waitlist.mjs       CSV export using your service key, run on your own computer
  e2e-check.mjs             Browser QA (Playwright) against a running site
tests/                      Vitest unit tests (validation, handler, email, Supabase calls)
docs/QA.md                  QA checklist: what's verified and what isn't
docs/ROADMAP.md             DASH HQ / CRM integration roadmap
docs/DESIGN-REFINEMENT.md   What the design refinement passes changed
docs/BRAND-ASSETS.md        Logo files, palette, typography
docs/LAUNCH-CHECKLIST.md    Verified launch items + unresolved decisions
brand-source/               Founder-provided original logo artwork (unchanged)
docs/WORDPRESS-CONVERSION-PLAN.md  Plan for the WordPress block theme + waitlist plugin
.env.example                Every environment variable, documented
```

## 2. Run locally

Requires Node.js 20.9+ (tested on Node 22).

```bash
npm install
cp .env.example .env.local
```

**Quick preview without a database:** set `WAITLIST_STORE=memory` in `.env.local`. Submissions work but are kept in memory only and are lost on restart. Vercel deployments ignore this setting.

**With Supabase:** fill in `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (section 3).

```bash
npm run dev          # http://localhost:3000
npm test             # unit tests
npm run lint
npm run typecheck
npm run build && npm start
BASE_URL=http://localhost:3000 npm run test:e2e   # browser QA; writes ONE test entry
```

If storage isn't configured, the form shows an error instead of a fake success.

## 3. Database setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com). Pick a US region close to your users.
2. Open **SQL Editor → New query**, paste the full contents of `supabase/migrations/20261014000000_create_waitlist.sql`, then click **Run**. It's safe to run again later.
3. Go to **Project Settings → API** and copy:
   - the Project URL → `SUPABASE_URL`
   - the **service_role** / secret key → `SUPABASE_SERVICE_ROLE_KEY` (**server-only**; never put it in a `NEXT_PUBLIC_` variable)

The site doesn't use the anon/publishable key at all.

**What the migration creates**

- Table `waitlist_entries` with every field from the brief, plus operational columns: `submission_count`, `last_submitted_at`, `founder_notified_at`, `confirmation_sent_at`, `email_delivery_error`, `privacy_policy_version`, `marketing_consent_at`, `source`, `updated_at`, and the reserved fields `external_crm_id` and `synced_at`.
- Check constraints on every option field and on `status` (`new`, `qualified`, `contacted`, `discovery`, `proposal`, `client`, `not_a_fit`). Length limits on all text fields.
- A unique index on `email_normalized` (the email trimmed and lower-cased), plus indexes on `created_at`, `status` and `service_interest`.
- **Row Level Security is on, with no policies.** Public (`anon`) and logged-in (`authenticated`) users can't read or write the table. I tested this against Postgres and PostgREST.
- Two functions, `submit_waitlist_entry` and `record_waitlist_email_delivery`, which only `service_role` can run.

**Duplicate emails (privacy-preserving)**

- When a submitted email already exists, the original entry is **kept unchanged**. Anyone can type any email into a public form, so a repeat submission can't change another person's details or consent. Instead, `submission_count` increases and `last_submitted_at` is updated.
- The visitor sees the **same success message** either way, so the form never reveals who is already on the list.
- The founder gets a "Repeat submission" notification that includes the new details. The visitor confirmation email is **not** sent again, so the form can't be used to spam someone's inbox.

## 4. Email & founder notifications (Resend)

These are optional but recommended.

1. Create a [Resend](https://resend.com) account and **verify your sending domain** (you'll add DNS records).
2. Set these variables:
   - `RESEND_API_KEY`
   - `EMAIL_FROM` (for example `Dash of Digital <hello@yourdomain.com>`)
   - `FOUNDER_NOTIFICATION_EMAIL`: the private inbox that receives every lead. The reply-to is set to the lead's email, so you can reply directly.
3. Optional: set `SEND_CONFIRMATION_EMAIL=false` to turn off the visitor confirmation.

If email fails or isn't configured, **the submission is still saved and the visitor still sees success**. The failure is written to `email_delivery_error` on that row and logged on the server. To find leads that need a manual follow-up, filter for a non-empty `email_delivery_error` or an empty `founder_notified_at`.

## 5. Bot protection

Always on:

- A hidden honeypot field. Submissions that fill it get a normal-looking response but are not stored.
- A minimum fill time of 2.5 seconds.
- A per-IP rate limit of 5 submissions per 10 minutes.
- A 16 KB limit on request size.
- Server-side validation of every field.

The rate limit is kept in memory per server instance, so on Vercel it slows abuse down but doesn't fully stop it. For stronger protection, enable **Cloudflare Turnstile** (free):

1. Create a Turnstile widget in Cloudflare.
2. Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`.

The widget then appears on the form and the server checks every token.

## 6. Deploy to Vercel

1. Push this repo to GitHub, then in Vercel choose **Add New → Project** and import it. The framework is detected automatically.
2. Add the environment variables from `.env.example` under **Settings → Environment Variables**. At minimum:
   - `NEXT_PUBLIC_SITE_URL`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Deploy, then submit the form once with your own email and check that the row appears in Supabase.
4. Add your custom domain under **Settings → Domains**, update `NEXT_PUBLIC_SITE_URL`, and redeploy.

## 7. View & export waitlist entries securely

- **View and manage:** in Supabase, go to **Table Editor → waitlist_entries**. Sort by `created_at`. Edit `status` and `internal_notes` there as leads move through your pipeline.
- **Export:** Table Editor → **Export → CSV**. Or, on your own computer:
  `node --env-file=.env.local scripts/export-waitlist.mjs`
  This writes `waitlist-export-YYYY-MM-DD.csv`. Spreadsheet formulas are neutralized, and the file is readable only by you. Delete exports when you're done with them.
- Turn on **two-factor authentication** for your Supabase, Vercel and Resend accounts.
- There is deliberately **no public admin page**.

## 8. External services & likely costs

Free-tier details change, so check each provider's pricing page.

| Service | Used for | Starting cost |
|---|---|---|
| Vercel | Hosting | Hobby is free but for **non-commercial** use only. A business site should use **Pro**, about $20/user/month. |
| Supabase | Database | Free tier is enough for a waitlist, but free projects **pause after about a week without activity**. Pro is about $25/month and avoids that. |
| Resend | Email | Free tier: about 3,000 emails/month and 100/day. Paid plans from about $20/month. |
| Cloudflare Turnstile | Bot protection (optional) | Free |
| Domain | Custom domain | About $10–20/year |
| Google Fonts | Space Grotesk, Inter, Instrument Serif, JetBrains Mono | Free. Fonts are self-hosted at build time, so visitors' browsers make no requests to Google. |

## 9. What the founder needs to supply

Blocking for launch:

- [ ] Supabase project (URL and service-role key)
- [ ] Vercel account and the production domain (`NEXT_PUBLIC_SITE_URL`)
- [ ] **Legal review** of `/privacy` and `/terms`. They are drafts. Confirm the data-retention period (currently 24 months) and the state where the LLC is organized, for the governing-law clause.

Recommended:

- [ ] Public contact email (`NEXT_PUBLIC_CONTACT_EMAIL`). Without it, the footer links to the form, and the privacy page tells people to reply to an email or use the form.
- [ ] Resend account, a verified sending domain, `EMAIL_FROM` and `FOUNDER_NOTIFICATION_EMAIL`
- [ ] Turnstile keys

Optional:

- [ ] A verified founder photo: put it in `/public` and set `founderPhoto` in `src/lib/site.ts`
- [ ] An approved logo or brand fonts to replace the typographic wordmark (`src/components/Wordmark.tsx`)
- [ ] Social links, if you want them in the footer

## 10. Editing content

- Service copy: `src/lib/services.ts`
- Section copy: the matching file in `src/components/`
- Dropdown options: `src/lib/waitlist/options.ts`. If you add or rename a value, update the matching `check` constraint in SQL too.
- Brand colors and fonts: the `@theme` block in `src/app/globals.css`
- After a material change to the privacy policy, bump `privacyPolicyVersion` in `src/lib/site.ts`. Each consent records the version the visitor agreed to.
