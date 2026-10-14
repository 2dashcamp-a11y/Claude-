import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { WaitlistSubmission } from "./schema";

export type SubmitResult = { entryId: string; isNew: boolean };

export type DeliveryRecord = {
  founderNotified: boolean;
  confirmationSent: boolean;
  error: string | null;
};

export interface WaitlistStore {
  submit(entry: WaitlistSubmission, meta: { privacyPolicyVersion: string }): Promise<SubmitResult>;
  recordDelivery(entryId: string, record: DeliveryRecord): Promise<void>;
}

/** Row shape passed to `submit_waitlist_entry(entry jsonb)`. */
export function toDatabaseRow(entry: WaitlistSubmission, privacyPolicyVersion: string) {
  return {
    full_name: entry.fullName,
    email: entry.email,
    company_name: entry.companyName,
    website_url: entry.websiteUrl ?? null,
    service_interest: entry.serviceInterest,
    business_stage: entry.businessStage ?? null,
    biggest_challenge: entry.biggestChallenge ?? null,
    budget_range: entry.budgetRange ?? null,
    timeline: entry.timeline ?? null,
    privacy_policy_version: privacyPolicyVersion,
    marketing_consent: entry.marketingConsent,
    source: "landing_page",
  };
}

export class SupabaseWaitlistStore implements WaitlistStore {
  constructor(private readonly client: SupabaseClient) {}

  async submit(entry: WaitlistSubmission, meta: { privacyPolicyVersion: string }) {
    const { data, error } = await this.client.rpc("submit_waitlist_entry", {
      entry: toDatabaseRow(entry, meta.privacyPolicyVersion),
    });
    if (error) throw new Error(`submit_waitlist_entry failed: ${error.message}`);
    const row = (Array.isArray(data) ? data[0] : data) as
      | { entry_id: string; is_new: boolean }
      | undefined;
    if (!row?.entry_id) throw new Error("submit_waitlist_entry returned no row");
    return { entryId: row.entry_id, isNew: Boolean(row.is_new) };
  }

  async recordDelivery(entryId: string, record: DeliveryRecord) {
    const { error } = await this.client.rpc("record_waitlist_email_delivery", {
      p_entry_id: entryId,
      p_founder_notified: record.founderNotified,
      p_confirmation_sent: record.confirmationSent,
      p_error: record.error,
    });
    if (error) throw new Error(`record_waitlist_email_delivery failed: ${error.message}`);
  }
}

/**
 * In-memory store for local previews only (WAITLIST_STORE=memory).
 * Data disappears when the server restarts; refused on Vercel deployments.
 */
export class MemoryWaitlistStore implements WaitlistStore {
  readonly rows = new Map<string, ReturnType<typeof toDatabaseRow> & {
    id: string;
    submission_count: number;
    delivery?: DeliveryRecord;
  }>();

  async submit(entry: WaitlistSubmission, meta: { privacyPolicyVersion: string }) {
    const key = entry.email.trim().toLowerCase();
    const existing = this.rows.get(key);
    if (existing) {
      existing.submission_count += 1;
      return { entryId: existing.id, isNew: false };
    }
    const id = crypto.randomUUID();
    this.rows.set(key, { ...toDatabaseRow(entry, meta.privacyPolicyVersion), id, submission_count: 1 });
    return { entryId: id, isNew: true };
  }

  async recordDelivery(entryId: string, record: DeliveryRecord) {
    for (const row of this.rows.values()) if (row.id === entryId) row.delivery = record;
  }
}

let cached: WaitlistStore | null | undefined;

/** Returns the configured store, or null when storage is not configured. */
export function getWaitlistStore(): WaitlistStore | null {
  if (cached !== undefined) return cached;

  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (url && key) {
    cached = new SupabaseWaitlistStore(
      createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      }),
    );
  } else if (process.env.WAITLIST_STORE === "memory" && !process.env.VERCEL_ENV) {
    console.warn("[waitlist] Using the in-memory store. Submissions are NOT persisted.");
    cached = new MemoryWaitlistStore();
  } else {
    cached = null;
  }
  return cached;
}
