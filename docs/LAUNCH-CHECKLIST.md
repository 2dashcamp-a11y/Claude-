# Launch checklist: October 14, 2026

## Verified on the final build

| Item | Status | How |
|---|---|---|
| Navigation links (desktop and mobile menu) | Pass | Every anchor resolves; the mobile menu opens, closes and scrolls to the right section |
| Buttons lead to the right sections | Pass | Every service button jumps to the form with that service preselected |
| Inquiry form submits | Pass | A real submission was stored in Postgres through PostgREST (the same layer Supabase uses), with every field correct |
| Required fields and validation | Pass | 4 required fields plus the privacy confirmation. Errors are announced, focus moves to the first problem, and an error in the optional step opens that step. Server-side validation is unit-tested |
| Duplicate emails | Pass | The visitor sees the same response, the original entry is kept, and the repeat is counted |
| Responsive layouts | Pass | No horizontal scroll at 375, 390, 768 or 1440px; reviewed visually on phone and desktop |
| Accessibility | Pass | axe-core finds no serious or critical issues at 3 widths; the skip link, labels and focus states all work |
| Legal links | Pass | `/privacy` and `/terms` return 200 and their own links work |
| No placeholder content | Pass | Rendered text on `/`, `/privacy` and `/terms` scanned for placeholder text such as "lorem" and "TODO"; none found |
| Favicon and social preview | Pass | `favicon.ico`, `icon.svg`, `apple-icon.png` and `/opengraph-image` (1200×630, real logo) are all served and linked in the page head |
| Logo | Pass | Founder artwork traced faithfully (see BRAND-ASSETS.md); no AI-made or font-substituted logo |
| Load speed | Pass | About 0.8s to network-idle locally. The page is static HTML, with fonts self-hosted and preloaded |
| Lint, typecheck, unit tests (25), browser QA (44) | Pass | `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e` |

## Not yet resolved

1. **Hosting path (blocks launch).** The site as built needs a database for the form (Supabase, free tier) and a Node.js host (Vercel). Earlier you said you'd prefer your existing Hostinger plan, so pick one:
   - **A. Hostinger, today, at $0:** export this exact design as static files and replace the form's backend with a small PHP endpoint that writes to Hostinger's MySQL and sends email through your Hostinger mailbox. Same pixels, launchable fastest, but content is edited in code, not in WordPress.
   - **B. Hostinger with WordPress, at $0:** the block theme and waitlist plugin in `WORDPRESS-CONVERSION-PLAN.md`. You can edit it in the Site Editor, but it's a larger build.
   - **C. As built:** Vercel plus Supabase. It works now, but commercial use of Vercel needs the Pro plan (about $20 a month).
2. **Contact email.** No public business email is set (`NEXT_PUBLIC_CONTACT_EMAIL`). The footer's "Get in touch" goes to the form, and the privacy page tells people to reply to an email or use the form. Both work, but a real address is better for privacy requests.
3. **Email delivery is not configured** (lead notifications and visitor confirmations). Leads are still saved, and the missing email is recorded on each row. How this gets set up depends on item 1.
4. **The privacy policy names Supabase, Vercel and Resend** as service providers. If you choose option A or B, I'll update it to name Hostinger instead.
5. **Legal review** of `/privacy` and `/terms` is still recommended.
6. **Original vector logo files** would replace the traced SVGs. This is optional; the traces are accurate.
7. **Founder portrait.** The retro monitor shows the (D) composition until you supply a verified photo.
8. **Real-device test** on iPhone Safari after deployment.
