#!/usr/bin/env node
/**
 * Export the waitlist to CSV from your own computer.
 *
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run export:waitlist
 *   (or put them in .env.local and run: node --env-file=.env.local scripts/export-waitlist.mjs)
 *
 * Writes waitlist-export-YYYY-MM-DD.csv in the current directory. The file
 * contains personal data — store it securely and delete it when done.
 */
import { writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.");
  process.exit(1);
}

const columns = [
  "created_at", "status", "full_name", "email", "company_name", "website_url",
  "service_interest", "business_stage", "budget_range", "timeline", "biggest_challenge",
  "marketing_consent", "privacy_acknowledged_at", "privacy_policy_version",
  "submission_count", "last_submitted_at", "founder_notified_at", "confirmation_sent_at",
  "email_delivery_error", "internal_notes", "id",
];

const supabase = createClient(url, key, { auth: { persistSession: false } });
const rows = [];
for (let from = 0; ; from += 1000) {
  const { data, error } = await supabase
    .from("waitlist_entries")
    .select(columns.join(","))
    .order("created_at", { ascending: true })
    .range(from, from + 999);
  if (error) {
    console.error("Export failed:", error.message);
    process.exit(1);
  }
  rows.push(...data);
  if (data.length < 1000) break;
}

const cell = (v) => {
  if (v === null || v === undefined) return "";
  let s = String(v);
  // Neutralize spreadsheet formula injection.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csv = [columns.join(","), ...rows.map((r) => columns.map((c) => cell(r[c])).join(","))].join("\n");
const file = `waitlist-export-${new Date().toISOString().slice(0, 10)}.csv`;
writeFileSync(file, csv + "\n", { mode: 0o600 });
console.log(`Exported ${rows.length} entries to ${file}`);
