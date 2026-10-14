# WordPress conversion plan (pending design approval)

**Goal:** run the approved design on your existing Hostinger WordPress hosting, editable in the free Site Editor, with **$0 in new monthly costs**:
- no page builders
- no Supabase, Vercel or Resend
- no paid plugins

**This is a plan only.** Nothing has been built for WordPress, installed, or deployed. Your live site will not be touched.

## Deliverables (after you approve the design)

1. `dash-of-digital-theme.zip`: a native block theme (FSE) for WordPress 6.5 or later and PHP 8.1 or later.
2. `dod-waitlist.zip`: a separate plugin for the waitlist, so leads survive any future theme change.
3. Install and testing notes, including a staging-first rollout on Hostinger.

## Block theme: `dash-of-digital`

```
dash-of-digital/
  style.css               Theme header
  theme.json              Brand palette, fonts, spacing, layout widths, element styles
  functions.php           Enqueues small JS/CSS; registers pattern categories
  templates/              front-page.html, page.html, index.html, 404.html
  parts/                  header.html, footer.html
  patterns/               One pattern per section: hero, insight, services, process,
                          founder, early-access, plus the legal page layout
  assets/fonts/           Space Grotesk, Inter, Instrument Serif and JetBrains Mono as
                          local woff2 files (no requests to Google; matches the current privacy policy)
  assets/js/site.js       Scroll reveal, service preselection, reduced-motion respect (about 2 KB)
  assets/css/extra.css    Things theme.json can't express (folio marker, diagram motion)
```

### How each part maps over

- **Design tokens:** the colors, fonts and type scale move into `theme.json`, so they appear in the Site Editor's style panels.
- **Text you'll want to edit:** headlines, copy, service descriptions, prices, process stages and founder story are built from core blocks (Heading, Paragraph, List, Buttons, Columns, Group). You can edit them in the Site Editor without touching code.
- **Fixed graphics:**
  - The systems diagram and service icons are inline SVG in a Custom HTML block. Their node positions are pre-calculated from the current React version.
  - The phone and desktop diagrams are switched with CSS, the same as now.
- **Navigation:**
  - Header: the core Navigation block, which includes a free, accessible mobile overlay menu.
  - Footer: core blocks, with the year filled in automatically.
- **Service buttons:** they link to `#early-access?interest=…`. A small script preselects the matching service, so deep links keep working.
- **Legal pages:** Privacy Policy and Terms become regular WordPress pages using a legal pattern. The privacy text will be updated to name Hostinger and WordPress as the providers instead of Supabase, Vercel and Resend.
- **Founder photo:** replace the placeholder by dropping an Image block into the founder pattern.

## Waitlist plugin: `dod-waitlist`

### Storage
- A custom table, `{prefix}dod_waitlist`, created on activation with `dbDelta`.
- It has the same fields, option values and status pipeline as the current Supabase table.
- `email_normalized` has a UNIQUE index, so duplicates behave exactly as they do today: the original entry is kept, the repeat is counted, the visitor sees the same response, and no second confirmation email is sent.

### Form
- A server-rendered block, `dod/waitlist-form`, so the form can be placed anywhere in the editor.
- It keeps the two-step layout, accessible errors, and the loading, success and failure states.

### Submission
- Submissions go to a REST route, `POST /wp-json/dod/v1/waitlist`.
- Server-side validation is ported from the Zod rules, including length limits, option lists, URL normalization, and the privacy-acknowledgment requirement.

### Spam protection
- The same honeypot field and minimum fill time as now.
- An IP rate limit using WordPress transients. Only a salted hash of the IP is used, and it is never stored with the entry.
- A WordPress nonce on each submission.
- Optional Cloudflare Turnstile (free).

### Email
- Uses `wp_mail()` for the founder notification and the visitor confirmation.
- On Hostinger, sending through your existing domain mailbox over SMTP (with a free SMTP plugin, or a few lines of plugin config) gives the best delivery.
- If an email fails, the lead is still saved and the failure is recorded on that row, as today.

### Lead management
- An admin screen at **WP Admin → Waitlist**, visible only to users with the `manage_options` capability.
- It includes a sortable, searchable list; filters by status and service; a detail view; status and internal-notes editing; and bulk status changes.

### CSV export
- Restricted by capability and protected with a nonce.
- Spreadsheet formulas in the data are neutralized, as in the current export script.

### Privacy
- Integrates with WordPress's built-in **Export / Erase Personal Data** tools, so access and deletion requests are covered.
- An optional setting removes the table when the plugin is uninstalled. It is off by default, so leads aren't deleted by accident.

### Security
- Prepared SQL statements throughout.
- Output escaping.
- Capability checks on every admin action.
- No public way to read the data.

## Testing before handoff

- **Local WordPress setup:** WordPress running on PHP 8.3 (available in this environment) with MariaDB or MySQL, or the official SQLite integration if no database server can be installed.
- **Theme:** activate it, then check the front page renders, the Site Editor opens and saves edits, and the patterns insert cleanly.
- **Waitlist plugin:**
  - A submission writes a row.
  - Duplicates behave as described above.
  - Validation errors show correctly, and the rate limit and honeypot work.
  - Admin list, status edits and CSV export work, and logged-out users can't reach them.
- **Browser checks:** re-run the existing Playwright and axe QA against the WordPress site, at phone, tablet and desktop widths.
- **Comparison:** screenshots of the WordPress version side by side with the approved Next.js design.

## Rollout on Hostinger (with your approval at each step)

1. Create a **staging site** with Hostinger's built-in staging tool, or a subdomain such as `staging.yourdomain.com`.
2. Install the theme and plugin ZIPs there and review them.
3. Only after you approve: back up the live site, then activate on production.

## Costs

| Item | Cost |
|---|---|
| Hostinger hosting and domain | Already paid |
| WordPress, block theme, waitlist plugin | Free |
| Email | Your Hostinger mailbox; may include a free SMTP plugin |
| Cloudflare Turnstile (optional) | Free |
