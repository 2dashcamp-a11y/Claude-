#!/usr/bin/env bash
# Build the Hostinger upload package (static site + PHP waitlist endpoint).
#
#   SITE_URL=https://yourdomain.com [CONTACT_EMAIL=hello@yourdomain.com] npm run build:hostinger
#
# Output: dist/dash-of-digital-hostinger.zip  (upload + extract into public_html)
set -euo pipefail
cd "$(dirname "$0")/.."

: "${SITE_URL:?Set SITE_URL, e.g. SITE_URL=https://yourdomain.com}"
SITE_URL="${SITE_URL%/}"
SCHEME="${SITE_URL%%://*}"
HOST="${SITE_URL#*://}"; HOST="${HOST%%/*}"

# The Node API route can't be statically exported; PHP replaces it on Hostinger.
ASIDE="$(mktemp -d)"
mv src/app/api "$ASIDE/api"
trap 'mv "$ASIDE/api" src/app/api; rmdir "$ASIDE"' EXIT

rm -rf .next out
STATIC_EXPORT=1 NEXT_PUBLIC_SITE_URL="$SITE_URL" NEXT_PUBLIC_CONTACT_EMAIL="${CONTACT_EMAIL:-}" npx next build

# PHP endpoint + server config
mkdir -p out/api
cp hostinger/api/waitlist.php hostinger/api/schema.sql hostinger/api/.htaccess out/api/
cp hostinger/static-cache.htaccess out/_next/static/.htaccess

HOST_REGEX="$(printf '%s' "$HOST" | sed 's/[.]/\\./g')"
if [ "$SCHEME" = "https" ]; then
  HTTPS_RULES='  # Force HTTPS
  RewriteCond %{HTTPS} !=on
  RewriteCond %{HTTP:X-Forwarded-Proto} !=https
  RewriteRule ^ https://'"$HOST"'%{REQUEST_URI} [L,R=301]'
  HSTS='  Header always set Strict-Transport-Security "max-age=31536000"'
else
  HTTPS_RULES='  # (HTTPS redirect disabled: SITE_URL is http)'
  HSTS=''
fi
python3 - "$SITE_URL" "$SCHEME" "$HOST" "$HOST_REGEX" "$HTTPS_RULES" "$HSTS" <<'PY'
import sys
site, scheme, host, host_re, https_rules, hsts = sys.argv[1:]
t = open("hostinger/htaccess.template").read()
for k, v in {"__SITE_URL__": site, "__SCHEME__": scheme, "__HOST_REGEX__": host_re, "__HOST__": host,
             "__HTTPS_RULES__": https_rules, "__HSTS__": hsts}.items():
    t = t.replace(k, v)
open("out/.htaccess", "w").write(t)
PY

mkdir -p dist
rm -f dist/dash-of-digital-hostinger.zip
(cd out && zip -qr ../dist/dash-of-digital-hostinger.zip . -x '*.DS_Store')
echo
echo "Built dist/dash-of-digital-hostinger.zip for $SITE_URL"
echo "Next: upload to public_html and create dod-config.php one level above it (see docs/HOSTINGER-DEPLOY.md)."
