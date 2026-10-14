<?php
/**
 * Dash of Digital — server configuration for the waitlist endpoint.
 *
 * 1. Copy this file to dod-config.php and fill in the values.
 * 2. Upload it ONE LEVEL ABOVE public_html, e.g.
 *      domains/yourdomain.com/dod-config.php
 *    so it can never be downloaded from the web.
 * Never commit the filled-in copy to Git.
 */
return [
    // hPanel → Databases → MySQL Databases (create a database + user)
    'DB_HOST' => 'localhost',
    'DB_NAME' => '',          // e.g. u123456789_dod
    'DB_USER' => '',          // e.g. u123456789_dod
    'DB_PASS' => '',

    // Public site URL (https, no trailing slash), used in emails
    'SITE_URL' => 'https://yourdomain.com',

    // Email (hPanel → Emails). MAIL_FROM must be a mailbox on your domain.
    'MAIL_FROM' => '',        // e.g. hello@yourdomain.com
    'NOTIFY_EMAIL' => '',     // private inbox that receives every new lead
    'CONTACT_EMAIL' => '',    // optional public contact address shown in confirmations
    'SEND_CONFIRMATION' => true,

    // Hostinger SMTP (recommended for deliverability). Leave SMTP_HOST empty to use PHP mail().
    'SMTP_HOST' => 'smtp.hostinger.com',
    'SMTP_PORT' => 465,
    'SMTP_SECURE' => 'ssl',   // 'ssl' (465) or 'tls' (587)
    'SMTP_USER' => '',        // the MAIL_FROM mailbox address
    'SMTP_PASS' => '',        // that mailbox's password

    // Random string used to hash IP addresses for rate limiting. Any long random value.
    'IP_SALT' => '',

    // Optional Cloudflare Turnstile secret. Leave empty to disable.
    'TURNSTILE_SECRET' => '',

    'PRIVACY_POLICY_VERSION' => '2026-10-14',
];
