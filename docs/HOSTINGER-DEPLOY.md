# Deploying Dash of Digital to Hostinger

## Quick launch: 3 steps, no database or settings file

The ZIP works with zero setup. Leads are saved in a private file outside `public_html` (`dod-data/waitlist.sqlite`) and emailed to you with Hostinger's built-in mail.

1. **hPanel → Websites → Add website** for the domain. Skip this if it's already listed.
2. **Files → File Manager → `public_html`**: upload the ZIP, choose **Extract**, then delete the ZIP.
3. **Domains → DNS records**: delete the old Base44 `www` CNAME, then add **CNAME `www` → `yourdomain.com`**. SSL is issued automatically.

To download your leads, open the private export link printed by the build (saved in `dist/lead-export-link.txt`). It downloads a CSV.

If you later want MySQL/phpMyAdmin or authenticated SMTP, add the optional `dod-config.php` described below. It overrides the built-in defaults.

---


**What runs where:** the site is built with Next.js and exported as static HTML, CSS and JS. The Early Access form posts to `/api/waitlist`, which is handled by a PHP script (`api/waitlist.php`). That script stores leads in Hostinger's MySQL and emails you through your Hostinger mailbox.

**Plan requirements:** any Hostinger web hosting plan that includes PHP 8.1 or later, MySQL, and email. Node.js is not required, and no outside services or subscriptions are needed.

## Package contents

`dist/dash-of-digital-hostinger.zip` is built by `SITE_URL=https://yourdomain.com npm run build:hostinger`. Its contents go **inside** `public_html`:

```
.htaccess              HTTPS + canonical-domain redirects, clean URLs, security headers, caching, /api/waitlist route
index.html, privacy.html, terms.html, 404.html, *.txt
_next/                 Fingerprinted JS/CSS/fonts (cached for 1 year)
brand/                 Logo SVGs
favicon.ico, icon.svg, apple-icon.png, opengraph-image, robots.txt, sitemap.xml
api/waitlist.php       Form endpoint
api/schema.sql         Table definitions (auto-created on first submission)
api/.htaccess          Blocks direct access to internal files
```

**Not in the ZIP (you create it on the server):** `dod-config.php`, which holds the database and email passwords. It goes **one level above** `public_html`. The template is `hostinger/dod-config.sample.php`.

## Step by step (hPanel)

> Back up first. If a site already exists on this domain: hPanel → Websites → Manage → Files → Backups, or download the current `public_html` folder.
> To try this without touching the live site, do steps 1–7 on a subdomain (for example `preview.yourdomain.com`), then repeat on the main domain.

### 1. Turn on SSL
- Go to **hPanel → Websites → Manage → Security → SSL** and install the free SSL certificate for the domain.
- Wait until it shows **Active**.

### 2. Create the database
- Go to **hPanel → Databases → MySQL Databases** and create a database and a user.
- Write down the database name, the user and the password. Hostinger adds a prefix, such as `u123456789_dod`.
- The tables are created automatically on the first form submission. You can also import `api/schema.sql` in phpMyAdmin.

### 3. Create the sending mailbox
- Go to **hPanel → Emails** and create a mailbox on the domain, such as `hello@yourdomain.com`. This becomes `MAIL_FROM` and `SMTP_USER`.
- Note its password.
- Your notification address (`NOTIFY_EMAIL`) can be any inbox you check.

### 4. Upload the site
- Open **hPanel → Files → File Manager → `public_html`**.
- Upload `dash-of-digital-hostinger.zip`, right-click it, choose **Extract** into `public_html`, then delete the ZIP.
- Make sure `.htaccess` is there. File Manager may hide dotfiles; turn on "show hidden files".

### 5. Create the server config
- In File Manager, go **up one level** from `public_html`, to `domains/yourdomain.com/`.
- Create `dod-config.php` there and paste in `hostinger/dod-config.sample.php`.
- Fill in these values:

| Key | Value |
|---|---|
| `DB_HOST` | `localhost` |
| `DB_NAME`, `DB_USER`, `DB_PASS` | From step 2 |
| `SITE_URL` | `https://yourdomain.com` |
| `MAIL_FROM`, `SMTP_USER` | The mailbox from step 3 |
| `SMTP_PASS` | That mailbox's password |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` | `smtp.hostinger.com`, `465`, `ssl` (the template's defaults) |
| `NOTIFY_EMAIL` | Where new-lead alerts should go |
| `CONTACT_EMAIL` | Optional public contact address |
| `IP_SALT` | Any long random string |

### 6. Set the PHP version
- Go to **hPanel → Advanced → PHP Configuration** and choose **PHP 8.1 or later** (8.3 recommended).

### 7. Point the domain (only if it isn't already on Hostinger)
- **Domain registered at Hostinger:** nothing to do.
- **Domain registered elsewhere:** at your registrar, set the nameservers to `ns1.dns-parking.com` and `ns2.dns-parking.com`, or point an A record to the IP shown in hPanel → Websites → Manage → DNS / Plan details.
- DNS changes can take up to 24 hours. **This changes where your domain goes, so only do it when you're ready.**

## After publishing: verify

| Check | How | Expected |
|---|---|---|
| HTTPS | Open `http://yourdomain.com` | Redirects to `https://yourdomain.com`, with a padlock |
| www | Open `https://www.yourdomain.com` | Redirects to `https://yourdomain.com` |
| Pages | `/`, `/privacy`, `/terms`, and a made-up path | All load; the made-up path shows the 404 page |
| Internal files blocked | `/api/schema.sql` | 403 |
| Form | Submit with your own email | Success message, a lead alert at `NOTIFY_EMAIL`, a confirmation in your inbox, and a row in phpMyAdmin → `dod_waitlist_entries` |
| Email failures | phpMyAdmin → `email_delivery_error` column | Empty. If not, it shows the SMTP error; the stored values never include the password |
| Social preview | Paste the URL into a LinkedIn or Facebook post composer (or opengraph.xyz) | The DOD preview image appears |
| Automated smoke test | `BASE_URL=https://yourdomain.com node scripts/launch-check.mjs` | All 200s; no placeholder text found |

Don't run `scripts/test-hostinger-api.mjs` or `scripts/e2e-check.mjs` against production, because they create test leads. If you do, delete those rows in phpMyAdmin afterwards.

## Managing leads

- **View and edit:** go to **hPanel → Databases → phpMyAdmin → `dod_waitlist_entries`**. `status` is a dropdown (new → qualified → contacted → discovery → proposal → client / not_a_fit), and `internal_notes` is free text.
- **Export:** select the table → **Export** → CSV.
- **Duplicates:** the original entry is kept. `submission_count` and `last_submitted_at` show renewed interest.

## Updating the site later

Rebuild the ZIP with `SITE_URL=https://yourdomain.com npm run build:hostinger`, then upload and extract it over `public_html`. This does not touch `dod-config.php` or the database.

## Choosing www instead of the bare domain

Build with `SITE_URL=https://www.yourdomain.com`. The redirects, canonical URLs, sitemap and social tags all follow that choice.
