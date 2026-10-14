<?php
/**
 * Dash of Digital — early-access waitlist endpoint for Hostinger.
 *
 * PHP port of src/lib/waitlist/handler.ts (the Node/Supabase version):
 * same validation rules and messages, honeypot, fill-time check, per-IP
 * rate limit, privacy-preserving duplicate handling, and email behavior.
 *
 * Works with zero setup (SQLite + PHP mail(), settings baked into api/_config.php
 * by the build). Optional overrides (MySQL, SMTP) go in dod-config.php OUTSIDE
 * public_html (see hostinger/dod-config.sample.php). Nothing secret is in this file.
 */

declare(strict_types=1);

const MAX_BODY_BYTES = 16384;
const MIN_FILL_MS = 2500;
const RATE_LIMIT = 5;
const RATE_WINDOW_MINUTES = 10;
const GENERIC_FAILURE = 'We couldn’t save your details just now. Please try again in a moment.';

const SERVICE_OPTIONS = [
    'digital_infrastructure_audit' => 'Digital Infrastructure Audit',
    'technical_infrastructure_management' => 'Technical Infrastructure Management',
    'digital_experience_modernization' => 'Digital Experience Modernization',
    'brand_creative_direction' => 'Brand & Creative Direction',
    'not_sure' => 'Not sure yet / need guidance',
];
const STAGE_OPTIONS = [
    'pre_launch' => 'Pre-launch / idea stage',
    'early' => 'Operating, under 2 years',
    'established' => 'Established, 2+ years',
    'scaling' => 'Scaling / multiple teams or locations',
];
const BUDGET_OPTIONS = [
    'under_2500' => 'Under $2,500',
    '2500_4999' => '$2,500–$4,999',
    '5000_9999' => '$5,000–$9,999',
    '10000_plus' => '$10,000+',
    'not_sure' => 'Not sure yet',
];
const TIMELINE_OPTIONS = [
    'immediately' => 'Immediately',
    'within_30_days' => 'Within 30 days',
    '1_3_months' => '1–3 months',
    'exploring' => 'Just exploring',
];

// ---------------------------------------------------------------- helpers

function respond(int $status, array $body): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function fail(int $status, string $error, array $fieldErrors = []): never
{
    $body = ['ok' => false, 'error' => $error];
    if ($fieldErrors) {
        $body['fieldErrors'] = $fieldErrors;
    }
    respond($status, $body);
}

/** Settings baked in by the build (api/_config.php), overridden by dod-config.php above public_html. */
function load_config(): array
{
    $config = [];
    foreach ([__DIR__ . '/_config.php', dirname(__DIR__, 2) . '/dod-config.php', getenv('DOD_CONFIG') ?: null] as $path) {
        if ($path && is_file($path)) {
            $values = require $path;
            if (is_array($values)) {
                $config = array_merge($config, array_filter($values, fn ($v) => $v !== '' && $v !== null));
            }
        }
    }
    return $config;
}

function cfg(array $config, string $key, $default = null)
{
    $value = $config[$key] ?? $default;
    return is_string($value) ? trim($value) : $value;
}

function str_field(array $data, string $key): ?string
{
    $value = $data[$key] ?? null;
    if ($value === null) {
        return null;
    }
    if (!is_string($value)) {
        return '';
    }
    return trim($value);
}

function len(string $value): int
{
    return mb_strlen($value, 'UTF-8');
}

function normalize_url(string $value): ?string
{
    $candidate = preg_match('#^[a-z][a-z\d+.\-]*://#i', $value) ? $value : 'https://' . $value;
    $parts = parse_url($candidate);
    if (!$parts || empty($parts['scheme']) || empty($parts['host'])) {
        return null;
    }
    $scheme = strtolower($parts['scheme']);
    $host = strtolower($parts['host']);
    if (!in_array($scheme, ['http', 'https'], true) || !str_contains($host, '.') || preg_match('/\s/', $candidate)) {
        return null;
    }
    $url = $scheme . '://' . $host;
    if (!empty($parts['port'])) {
        $url .= ':' . $parts['port'];
    }
    $url .= $parts['path'] ?? '/';
    if (isset($parts['query'])) {
        $url .= '?' . $parts['query'];
    }
    if (isset($parts['fragment'])) {
        $url .= '#' . $parts['fragment'];
    }
    return $url;
}

/** Mirrors waitlistSchema in src/lib/waitlist/schema.ts. Returns [entry, fieldErrors]. */
function validate(array $data): array
{
    $errors = [];
    $entry = [];

    $fullName = str_field($data, 'fullName');
    if ($fullName === null || len($fullName) < 2) {
        $errors['fullName'] = 'Enter your full name.';
    } elseif (len($fullName) > 120) {
        $errors['fullName'] = 'Please keep your name under 120 characters.';
    }
    $entry['full_name'] = $fullName;

    $email = str_field($data, 'email');
    if ($email === null) {
        $errors['email'] = 'Enter your email address.';
    } elseif (len($email) > 254) {
        $errors['email'] = 'That email address is too long.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'Enter a valid email address, like name@company.com.';
    }
    $entry['email'] = $email;

    $company = str_field($data, 'companyName');
    if ($company === null || len($company) < 1) {
        $errors['companyName'] = 'Enter your company or brand name.';
    } elseif (len($company) > 160) {
        $errors['companyName'] = 'Please keep the company name under 160 characters.';
    }
    $entry['company_name'] = $company;

    $service = $data['serviceInterest'] ?? null;
    if (!is_string($service) || !array_key_exists($service, SERVICE_OPTIONS)) {
        $errors['serviceInterest'] = 'Choose the area you’re most interested in.';
    }
    $entry['service_interest'] = $service;

    $website = str_field($data, 'websiteUrl');
    $entry['website_url'] = null;
    if ($website !== null && $website !== '') {
        if (len($website) > 300) {
            $errors['websiteUrl'] = 'That URL is too long.';
        } else {
            $normalized = normalize_url($website);
            if ($normalized === null) {
                $errors['websiteUrl'] = 'Enter a valid website, like yourcompany.com.';
            }
            $entry['website_url'] = $normalized;
        }
    }

    foreach ([
        ['businessStage', 'business_stage', STAGE_OPTIONS, 'Choose a business stage from the list.'],
        ['budgetRange', 'budget_range', BUDGET_OPTIONS, 'Choose a budget range from the list.'],
        ['timeline', 'timeline', TIMELINE_OPTIONS, 'Choose a timeline from the list.'],
    ] as [$key, $column, $options, $message]) {
        $value = str_field($data, $key);
        if ($value === null || $value === '') {
            $entry[$column] = null;
        } elseif (!array_key_exists($value, $options)) {
            $errors[$key] = $message;
        } else {
            $entry[$column] = $value;
        }
    }

    $challenge = str_field($data, 'biggestChallenge');
    if ($challenge !== null && len($challenge) > 2000) {
        $errors['biggestChallenge'] = 'Please keep this under 2,000 characters.';
    }
    $entry['biggest_challenge'] = ($challenge === null || $challenge === '') ? null : $challenge;

    if (($data['privacyAcknowledged'] ?? null) !== true) {
        $errors['privacyAcknowledged'] = 'Please confirm you’ve read the Privacy Policy.';
    }
    $entry['marketing_consent'] = ($data['marketingConsent'] ?? false) === true;

    return [$entry, $errors];
}

// ---------------------------------------------------------------- database
//
// Zero-setup by default: leads go to a SQLite file stored OUTSIDE public_html
// (domains/<site>/dod-data/waitlist.sqlite). If DB_NAME/DB_USER are configured,
// MySQL is used instead. All SQL below is portable between the two.

const SQLITE_SCHEMA = [
    "CREATE TABLE IF NOT EXISTS dod_waitlist_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      email_normalized TEXT NOT NULL UNIQUE,
      company_name TEXT NOT NULL,
      website_url TEXT,
      service_interest TEXT NOT NULL CHECK (service_interest IN ('digital_infrastructure_audit','technical_infrastructure_management','digital_experience_modernization','brand_creative_direction','not_sure')),
      business_stage TEXT CHECK (business_stage IS NULL OR business_stage IN ('pre_launch','early','established','scaling')),
      biggest_challenge TEXT,
      budget_range TEXT CHECK (budget_range IS NULL OR budget_range IN ('under_2500','2500_4999','5000_9999','10000_plus','not_sure')),
      timeline TEXT CHECK (timeline IS NULL OR timeline IN ('immediately','within_30_days','1_3_months','exploring')),
      privacy_acknowledged_at TEXT NOT NULL,
      privacy_policy_version TEXT NOT NULL,
      marketing_consent INTEGER NOT NULL DEFAULT 0,
      marketing_consent_at TEXT,
      status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','qualified','contacted','discovery','proposal','client','not_a_fit')),
      internal_notes TEXT,
      source TEXT NOT NULL DEFAULT 'landing_page',
      submission_count INTEGER NOT NULL DEFAULT 1,
      last_submitted_at TEXT NOT NULL,
      founder_notified_at TEXT,
      confirmation_sent_at TEXT,
      email_delivery_error TEXT,
      external_crm_id TEXT,
      synced_at TEXT
    )",
    "CREATE INDEX IF NOT EXISTS idx_entries_created ON dod_waitlist_entries (created_at)",
    "CREATE TABLE IF NOT EXISTS dod_waitlist_rate (id INTEGER PRIMARY KEY AUTOINCREMENT, ip_hash TEXT NOT NULL, created_at TEXT NOT NULL)",
    "CREATE INDEX IF NOT EXISTS idx_rate ON dod_waitlist_rate (ip_hash, created_at)",
];

function now_utc(int $offsetSeconds = 0): string
{
    return gmdate('Y-m-d H:i:s', time() + $offsetSeconds);
}

/** Folder for the SQLite file: above public_html when possible, never web-served. */
function data_dir(array $config): string
{
    $configured = cfg($config, 'DATA_DIR');
    if ($configured) {
        return $configured;
    }
    $outside = dirname(__DIR__, 2) . '/dod-data';
    if (is_dir($outside) || @mkdir($outside, 0700, true)) {
        return $outside;
    }
    return __DIR__ . '/data'; // fallback, blocked by api/data/.htaccess
}

function db(array $config): PDO
{
    $options = [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_TIMEOUT => 5];
    if (cfg($config, 'DB_NAME') && cfg($config, 'DB_USER')) {
        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
            cfg($config, 'DB_HOST', 'localhost'),
            (int) cfg($config, 'DB_PORT', 3306),
            cfg($config, 'DB_NAME'),
        );
        $pdo = new PDO($dsn, cfg($config, 'DB_USER'), (string) ($config['DB_PASS'] ?? ''), $options + [PDO::ATTR_EMULATE_PREPARES => false]);
        $pdo->exec("SET time_zone = '+00:00'");
        return $pdo;
    }

    $dir = data_dir($config);
    if (!is_dir($dir) && !@mkdir($dir, 0700, true)) {
        throw new PDOException('Cannot create data folder');
    }
    if (str_starts_with($dir, __DIR__) && !is_file($dir . '/.htaccess')) {
        @file_put_contents($dir . '/.htaccess', "Require all denied\n");
    }
    $pdo = new PDO('sqlite:' . $dir . '/waitlist.sqlite', null, null, $options);
    $pdo->exec('PRAGMA busy_timeout = 5000');
    foreach (SQLITE_SCHEMA as $statement) {
        $pdo->exec($statement);
    }
    return $pdo;
}

function is_sqlite(PDO $pdo): bool
{
    return $pdo->getAttribute(PDO::ATTR_DRIVER_NAME) === 'sqlite';
}

function ensure_schema(PDO $pdo): void
{
    $sql = preg_replace('/^\s*--.*$/m', '', (string) file_get_contents(__DIR__ . '/schema.sql'));
    foreach (array_filter(array_map('trim', explode(';', $sql))) as $statement) {
        $pdo->exec($statement);
    }
}

/** MySQL tables are created on first use; SQLite tables are created on connect. */
function with_schema(PDO $pdo, callable $fn)
{
    try {
        return $fn();
    } catch (PDOException $e) {
        if (is_sqlite($pdo) || $e->getCode() !== '42S02') {
            throw $e;
        }
        ensure_schema($pdo);
        return $fn();
    }
}

function rate_limited(PDO $pdo, string $ipHash): bool
{
    return with_schema($pdo, function () use ($pdo, $ipHash) {
        if (random_int(1, 50) === 1) {
            $pdo->prepare('DELETE FROM dod_waitlist_rate WHERE created_at < ?')->execute([now_utc(-86400)]);
        }
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM dod_waitlist_rate WHERE ip_hash = ? AND created_at > ?');
        $stmt->execute([$ipHash, now_utc(-RATE_WINDOW_MINUTES * 60)]);
        if ((int) $stmt->fetchColumn() >= RATE_LIMIT) {
            return true;
        }
        $pdo->prepare('INSERT INTO dod_waitlist_rate (ip_hash, created_at) VALUES (?, ?)')->execute([$ipHash, now_utc()]);
        return false;
    });
}

/** Insert, or count a repeat for an existing email without overwriting it. Returns [id, isNew]. */
function store_entry(PDO $pdo, array $entry, string $policyVersion): array
{
    return with_schema($pdo, function () use ($pdo, $entry, $policyVersion) {
        $normalized = mb_strtolower(trim($entry['email']), 'UTF-8');
        $now = now_utc();

        $find = $pdo->prepare('SELECT id FROM dod_waitlist_entries WHERE email_normalized = ?');
        $find->execute([$normalized]);
        $existing = $find->fetchColumn();
        if ($existing !== false) {
            $pdo->prepare('UPDATE dod_waitlist_entries SET submission_count = submission_count + 1, last_submitted_at = ?, updated_at = ? WHERE id = ?')
                ->execute([$now, $now, $existing]);
            return [(int) $existing, false];
        }

        try {
            $pdo->prepare(
                'INSERT INTO dod_waitlist_entries
                  (full_name, email, email_normalized, company_name, website_url, service_interest, business_stage,
                   biggest_challenge, budget_range, timeline, privacy_acknowledged_at, privacy_policy_version,
                   marketing_consent, marketing_consent_at, source, created_at, updated_at, last_submitted_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
            )->execute([
                $entry['full_name'], $entry['email'], $normalized, $entry['company_name'], $entry['website_url'],
                $entry['service_interest'], $entry['business_stage'], $entry['biggest_challenge'], $entry['budget_range'],
                $entry['timeline'], $now, $policyVersion, $entry['marketing_consent'] ? 1 : 0,
                $entry['marketing_consent'] ? $now : null, 'landing_page', $now, $now, $now,
            ]);
            return [(int) $pdo->lastInsertId(), true];
        } catch (PDOException $e) {
            // Lost a race with a simultaneous submission for the same email: count it as a repeat.
            $find->execute([$normalized]);
            $id = $find->fetchColumn();
            if ($id === false) {
                throw $e;
            }
            $pdo->prepare('UPDATE dod_waitlist_entries SET submission_count = submission_count + 1, last_submitted_at = ? WHERE id = ?')
                ->execute([$now, $id]);
            return [(int) $id, false];
        }
    });
}

function record_delivery(PDO $pdo, int $id, bool $founder, bool $confirmation, ?string $error): void
{
    $now = now_utc();
    // COALESCE keeps an earlier timestamp when this attempt didn't send (portable across MySQL/SQLite).
    $pdo->prepare(
        'UPDATE dod_waitlist_entries SET
           founder_notified_at = COALESCE(?, founder_notified_at),
           confirmation_sent_at = COALESCE(?, confirmation_sent_at),
           email_delivery_error = ?, updated_at = ?
         WHERE id = ?'
    )->execute([$founder ? $now : null, $confirmation ? $now : null, $error, $now, $id]);
}

// ---------------------------------------------------------------- email

function h(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function subject_safe(string $value): string
{
    return mb_substr(preg_replace('/[\r\n]+/', ' ', $value), 0, 80, 'UTF-8');
}

function label(array $options, ?string $value): string
{
    return $value === null ? '—' : ($options[$value] ?? $value);
}

function founder_notification(array $e, bool $isNew): array
{
    $rows = [
        ['Name', $e['full_name']],
        ['Email', $e['email']],
        ['Company', $e['company_name']],
        ['Website', $e['website_url'] ?? '—'],
        ['Interest', label(SERVICE_OPTIONS, $e['service_interest'])],
        ['Stage', label(STAGE_OPTIONS, $e['business_stage'])],
        ['Budget', label(BUDGET_OPTIONS, $e['budget_range'])],
        ['Timeline', label(TIMELINE_OPTIONS, $e['timeline'])],
        ['Marketing consent', $e['marketing_consent'] ? 'Yes' : 'No'],
        ['Biggest challenge', $e['biggest_challenge'] ?? '—'],
    ];
    $heading = $isNew ? 'New early-access request' : 'Repeat submission for an existing entry (original details were kept)';
    $where = 'View and update this lead in Hostinger → hPanel → Databases → phpMyAdmin → dod_waitlist_entries.';

    $text = $heading . "\n\n" . implode("\n", array_map(fn ($r) => $r[0] . ': ' . $r[1], $rows)) . "\n\n" . $where;
    $htmlRows = implode("\n", array_map(
        fn ($r) => '<tr><td style="border-top:1px solid #e5ded2;color:#555;width:160px;vertical-align:top">' . h($r[0])
            . '</td><td style="border-top:1px solid #e5ded2;white-space:pre-wrap">' . h($r[1]) . '</td></tr>',
        $rows
    ));
    $html = '<div style="font-family:Arial,sans-serif;color:#0B0B0D;max-width:600px">'
        . '<p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#6F3FC5;margin:0 0 8px">Dash of Digital · Waitlist</p>'
        . '<h1 style="font-size:20px;margin:0 0 16px">' . h($heading) . '</h1>'
        . '<table cellpadding="8" style="border-collapse:collapse;width:100%;font-size:14px">' . $htmlRows . '</table>'
        . '<p style="font-size:13px;color:#555;margin-top:16px">' . h($where) . '</p></div>';

    return [
        'subject' => ($isNew ? 'New lead' : 'Repeat submission') . ': ' . subject_safe($e['company_name']) . ' — ' . label(SERVICE_OPTIONS, $e['service_interest']),
        'text' => $text,
        'html' => $html,
        'replyTo' => $e['email'],
    ];
}

function visitor_confirmation(array $e, array $config): array
{
    $first = preg_split('/\s+/', $e['full_name'])[0] ?: $e['full_name'];
    $contact = cfg($config, 'CONTACT_EMAIL') ?: null;
    $site = cfg($config, 'SITE_URL', '');
    $lines = [
        "Hi {$first},",
        '',
        'Thanks for joining the Dash of Digital early-access list. We’ve received your details and will review them.',
        '',
        'We’re opening a limited number of early client opportunities, and we’ll be in touch when the right one opens up.',
        '',
        $contact ? "If you have questions in the meantime, you can reach us at {$contact}." : 'If you have questions in the meantime, just reply to this email.',
        '',
        '— Dash of Digital',
        '',
        "You’re receiving this because this address was submitted at {$site}. If that wasn’t you, you can ignore this message"
            . ($contact ? " or ask us to delete it at {$contact}" : '') . '.',
    ];
    $body = array_filter(array_slice($lines, 0, -2), fn ($l) => $l !== '');
    $html = '<div style="font-family:Arial,sans-serif;color:#0B0B0D;max-width:560px;line-height:1.6">'
        . '<p style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;font-weight:bold;margin:0 0 24px">Dash of Digital</p>'
        . implode("\n", array_map(fn ($l) => '<p style="margin:0 0 16px">' . h($l) . '</p>', $body))
        . '<p style="font-size:12px;color:#666;border-top:1px solid #e5ded2;padding-top:16px;margin-top:24px">' . h(end($lines)) . '</p></div>';

    return [
        'subject' => 'You’re on the Dash of Digital early-access list',
        'text' => implode("\n", $lines),
        'html' => $html,
        'replyTo' => $contact,
    ];
}

function encode_header(string $value): string
{
    return preg_match('/[^\x20-\x7E]/', $value) ? '=?UTF-8?B?' . base64_encode($value) . '?=' : $value;
}

function build_mime(string $from, string $to, array $msg): array
{
    $boundary = 'dod_' . bin2hex(random_bytes(12));
    $domain = substr(strrchr($from, '@') ?: '@localhost', 1);
    $headers = [
        'From' => 'Dash of Digital <' . $from . '>',
        'To' => $to,
        'Subject' => encode_header($msg['subject']),
        'Date' => date('r'),
        'Message-ID' => '<' . bin2hex(random_bytes(16)) . '@' . $domain . '>',
        'MIME-Version' => '1.0',
        'Content-Type' => 'multipart/alternative; boundary="' . $boundary . '"',
    ];
    if (!empty($msg['replyTo'])) {
        $headers['Reply-To'] = preg_replace('/[\r\n]/', '', $msg['replyTo']);
    }
    $body = "--{$boundary}\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
        . chunk_split(base64_encode($msg['text']))
        . "--{$boundary}\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
        . chunk_split(base64_encode($msg['html']))
        . "--{$boundary}--\r\n";
    return [$headers, $body];
}

/** Minimal authenticated SMTP client (SSL on 465, STARTTLS on 587). */
function smtp_send(array $config, string $to, array $msg): void
{
    $host = cfg($config, 'SMTP_HOST');
    $port = (int) cfg($config, 'SMTP_PORT', 465);
    $secure = strtolower((string) cfg($config, 'SMTP_SECURE', 'ssl'));
    $user = cfg($config, 'SMTP_USER', '');
    $pass = (string) ($config['SMTP_PASS'] ?? '');
    $from = cfg($config, 'MAIL_FROM');

    $remote = ($secure === 'ssl' ? 'ssl://' : 'tcp://') . $host . ':' . $port;
    $sock = @stream_socket_client($remote, $errno, $errstr, 10);
    if (!$sock) {
        throw new RuntimeException("SMTP connect failed: {$errstr}");
    }
    stream_set_timeout($sock, 10);

    $read = function () use ($sock): string {
        $data = '';
        while (($line = fgets($sock, 1024)) !== false) {
            $data .= $line;
            if (strlen($line) < 4 || $line[3] === ' ') {
                break;
            }
        }
        return $data;
    };
    // $label is what appears in errors; credentials are never echoed.
    $cmd = function (?string $command, array $expect, ?string $label = null) use ($sock, $read): string {
        if ($command !== null) {
            fwrite($sock, $command . "\r\n");
        }
        $response = $read();
        if (!in_array((int) substr($response, 0, 3), $expect, true)) {
            $shown = $label ?? (string) $command;
            throw new RuntimeException('SMTP ' . trim($shown) . ' failed: ' . trim($response));
        }
        return $response;
    };

    try {
        $cmd(null, [220]);
        $ehloHost = parse_url((string) cfg($config, 'SITE_URL', ''), PHP_URL_HOST) ?: 'localhost';
        $cmd('EHLO ' . $ehloHost, [250]);
        if ($secure === 'tls') {
            $cmd('STARTTLS', [220]);
            if (!stream_socket_enable_crypto($sock, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new RuntimeException('SMTP STARTTLS negotiation failed');
            }
            $cmd('EHLO ' . $ehloHost, [250]);
        }
        if ($user !== '') {
            $cmd('AUTH LOGIN', [334]);
            $cmd(base64_encode($user), [334], 'AUTH username');
            $cmd(base64_encode($pass), [235], 'AUTH password');
        }
        $cmd('MAIL FROM:<' . $from . '>', [250], 'MAIL FROM');
        $cmd('RCPT TO:<' . $to . '>', [250, 251], 'RCPT TO');
        $cmd('DATA', [354]);
        [$headers, $body] = build_mime($from, $to, $msg);
        $raw = '';
        foreach ($headers as $k => $v) {
            $raw .= "{$k}: {$v}\r\n";
        }
        $raw .= "\r\n" . $body;
        $raw = preg_replace('/^\./m', '..', $raw); // dot-stuffing
        fwrite($sock, $raw . "\r\n.\r\n");
        $cmd(null, [250]);
        fwrite($sock, "QUIT\r\n");
    } finally {
        fclose($sock);
    }
}

function send_mail(array $config, string $to, array $msg): void
{
    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
        throw new RuntimeException('Invalid recipient');
    }
    if (cfg($config, 'SMTP_HOST')) {
        smtp_send($config, $to, $msg);
        return;
    }
    // Fallback: the server's built-in mail(). MAIL_FROM must be a mailbox on your domain.
    $from = cfg($config, 'MAIL_FROM');
    [$headers, $body] = build_mime($from, $to, $msg);
    $subject = $headers['Subject'];
    unset($headers['Subject'], $headers['To']);
    if (!mail($to, $subject, $body, $headers, '-f' . $from)) {
        throw new RuntimeException('mail() returned false');
    }
}

function deliver_emails(PDO $pdo, array $config, array $entry, int $id, bool $isNew): void
{
    $from = cfg($config, 'MAIL_FROM');
    $founder = cfg($config, 'NOTIFY_EMAIL');
    if (!$from) {
        record_delivery($pdo, $id, false, false, 'Email provider not configured');
        return;
    }
    $errors = [];
    $founderOk = false;
    $confirmOk = false;

    if ($founder) {
        try {
            send_mail($config, $founder, founder_notification($entry, $isNew));
            $founderOk = true;
        } catch (Throwable $e) {
            $errors[] = 'founder: ' . $e->getMessage();
        }
    } else {
        $errors[] = 'founder: NOTIFY_EMAIL not set';
    }
    // Confirmations go to new entries only, so the form can't be used to email someone repeatedly.
    if ($isNew && cfg($config, 'SEND_CONFIRMATION', true) !== false) {
        try {
            send_mail($config, $entry['email'], visitor_confirmation($entry, $config));
            $confirmOk = true;
        } catch (Throwable $e) {
            $errors[] = 'confirmation: ' . $e->getMessage();
        }
    }
    if ($errors) {
        error_log('[waitlist] Email delivery issue for entry ' . $id . ': ' . implode('; ', $errors));
    }
    try {
        record_delivery($pdo, $id, $founderOk, $confirmOk, $errors ? mb_substr(implode('; ', $errors), 0, 1000) : null);
    } catch (Throwable $e) {
        error_log('[waitlist] Failed to record delivery status: ' . $e->getMessage());
    }
}

function turnstile_ok(string $secret, ?string $token, string $ip): bool
{
    if (!$token) {
        return false;
    }
    $ch = curl_init('https://challenges.cloudflare.com/turnstile/v0/siteverify');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query(['secret' => $secret, 'response' => $token, 'remoteip' => $ip]),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 5,
    ]);
    $result = curl_exec($ch);
    curl_close($ch);
    $data = is_string($result) ? json_decode($result, true) : null;
    return is_array($data) && ($data['success'] ?? false) === true;
}

// ---------------------------------------------------------------- export

if (defined('DOD_EXPORT')) {
    $config = load_config();
    $key = (string) cfg($config, 'EXPORT_KEY', '');
    $given = is_string($_GET['key'] ?? null) ? $_GET['key'] : '';
    header('X-Robots-Tag: noindex');
    if (strlen($key) < 24 || !hash_equals($key, $given)) {
        http_response_code(404);
        exit;
    }
    $pdo = db($config);
    $rows = with_schema($pdo, fn () => $pdo->query('SELECT * FROM dod_waitlist_entries ORDER BY created_at')->fetchAll(PDO::FETCH_ASSOC));
    header('Content-Type: text/csv; charset=utf-8');
    header('Cache-Control: no-store');
    header('Content-Disposition: attachment; filename="dod-waitlist-' . gmdate('Y-m-d') . '.csv"');
    $out = fopen('php://output', 'w');
    fwrite($out, "\xEF\xBB\xBF"); // UTF-8 BOM so Excel shows characters correctly
    $columns = ['created_at', 'status', 'full_name', 'email', 'company_name', 'website_url', 'service_interest',
        'business_stage', 'budget_range', 'timeline', 'biggest_challenge', 'marketing_consent', 'submission_count',
        'last_submitted_at', 'founder_notified_at', 'confirmation_sent_at', 'email_delivery_error', 'internal_notes', 'id'];
    fputcsv($out, $columns);
    foreach ($rows as $row) {
        fputcsv($out, array_map(function ($c) use ($row) {
            $v = (string) ($row[$c] ?? '');
            return preg_match('/^[=+\-@\t\r]/', $v) ? "'" . $v : $v; // neutralize spreadsheet formulas
        }, $columns));
    }
    exit;
}

// ---------------------------------------------------------------- request

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    fail(405, 'Method not allowed.');
}
if (!str_contains(strtolower($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json')) {
    fail(415, 'Unsupported request format.');
}

$config = load_config();

$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$ipHash = hash('sha256', (string) cfg($config, 'IP_SALT', 'dod') . '|' . $ip);

$pdo = null;
try {
    $pdo = db($config);
    if (rate_limited($pdo, $ipHash)) {
        fail(429, 'Too many submissions from this connection. Please wait a few minutes and try again.');
    }
} catch (PDOException $e) {
    error_log('[waitlist] Database unavailable: ' . $e->getMessage());
    $pdo = null;
}

$raw = file_get_contents('php://input', false, null, 0, MAX_BODY_BYTES + 1);
if ($raw === false) {
    fail(400, 'We couldn’t read that submission. Please try again.');
}
if (strlen($raw) > MAX_BODY_BYTES) {
    fail(413, 'That submission is too large.');
}
$data = json_decode($raw, true);
if (!is_array($data)) {
    fail(400, 'We couldn’t read that submission. Please try again.');
}

[$entry, $fieldErrors] = validate($data);
if ($fieldErrors) {
    fail(422, 'Please check the highlighted fields.', $fieldErrors);
}

// Honeypot filled: a bot. Respond as a success so it learns nothing; store nothing.
if (is_string($data['fax'] ?? null) && trim($data['fax']) !== '') {
    respond(200, ['ok' => true]);
}

$startedAt = $data['startedAt'] ?? null;
if (is_int($startedAt) || is_float($startedAt)) {
    if ((microtime(true) * 1000) - $startedAt < MIN_FILL_MS) {
        fail(400, 'That was quick! Please take a moment to review your details, then submit again.');
    }
}

$turnstileSecret = cfg($config, 'TURNSTILE_SECRET');
if ($turnstileSecret && !turnstile_ok($turnstileSecret, is_string($data['turnstileToken'] ?? null) ? $data['turnstileToken'] : null, $ip)) {
    fail(400, 'We couldn’t verify this browser. Please complete the verification and try again.');
}

if (!$pdo) {
    fail(500, GENERIC_FAILURE);
}

try {
    [$id, $isNew] = store_entry($pdo, $entry, (string) cfg($config, 'PRIVACY_POLICY_VERSION', '2026-10-14'));
} catch (Throwable $e) {
    error_log('[waitlist] Failed to store submission: ' . $e->getMessage());
    fail(500, GENERIC_FAILURE);
}

// The lead is saved. Email problems are recorded, never shown as a failure.
deliver_emails($pdo, $config, $entry, $id, $isNew);

respond(200, ['ok' => true]);
