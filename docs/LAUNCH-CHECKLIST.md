# Launch checklist

The design is approved. This is the Hostinger deployment status as of October 14, 2026.

## Verified (local Hostinger replica: Apache + .htaccess, PHP 8.3, MariaDB 10.11, SMTP catcher)

| Area | Result |
|---|---|
| Design locked | The Hostinger build is pixel-identical to the approved build at 375, 768 and 1440px (0.0% difference) |
| Logos | Founder artwork in use: primary in the header, stacked plus monogram in the footer, monogram as favicon. The parentheses above the i's are intact |
| Responsive | No horizontal scroll or clipping at 375, 768 and 1440px. Mobile menu opens and closes, including with Escape |
| Navigation and buttons | Every anchor resolves; service buttons preselect the right option; every internal link returns 200 |
| Form | Validation messages and focus behavior work; the success message appears; the row is stored in MySQL with all fields |
| Duplicates and spam | Repeat emails keep the original and count the repeat. The honeypot, fill-time check and 5-per-10-minute rate limit all work |
| Email | Founder alert and visitor confirmation are sent over authenticated SMTP. Visitor input is escaped. Failures are recorded without exposing credentials |
| Server config | HTTPS and www→apex redirects, clean URLs, 404 page, internal files blocked (403), security headers, gzip, long-term caching for build assets |
| Automated tests | Unit 25/25 · browser QA 44/44 (includes axe accessibility) · PHP API contract 13/13 |
| Lighthouse (mobile, throttled) | Performance 90 · Accessibility 100 · Best Practices 100 · SEO 100 · total page weight 426 KB |
| Secrets | No credentials in the ZIP or the Git repo; server config lives outside `public_html` |
| SEO | Title, description, canonical URL, Open Graph and Twitter tags, social image, sitemap.xml, robots.txt and favicon set are all present |
| Without JavaScript | All content stays visible |

## Pending: needs the live domain or the founder

- **Production ZIP:** must be built with the real domain (canonical URL, sitemap and social tags depend on it).
- **Live checks:** HTTPS certificate, DNS, real email delivery from Hostinger SMTP, and an iPhone Safari pass. Steps are in HOSTINGER-DEPLOY.md under "After publishing: verify".
- **Legal review** of `/privacy` and `/terms`. They are drafts, now updated to name Hostinger as the provider.
