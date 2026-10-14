# Roadmap: DASH HQ, CRM and pipeline integration

Nothing below is connected yet. The data model is ready for each step.

## Already prepared

- Leads are stored in a single table, `waitlist_entries`. Option values are stable machine keys such as `technical_infrastructure_management`, so they map cleanly to CRM fields.
- `status` follows the sales pipeline: new → qualified → contacted → discovery → proposal → client / not_a_fit.
- `external_crm_id` and `synced_at` are reserved for whatever system becomes the source of truth.
- `marketing_consent` and `marketing_consent_at` record who opted in to marketing, so only those people are synced to email marketing.

## Suggested phases

1. **Notion or DASH HQ inbox (low effort).** Add a Supabase **Database Webhook** on `INSERT` into `waitlist_entries` that calls a small server function. The function creates a Notion database page, or a DASH HQ record, and writes the returned ID to `external_crm_id`. Credentials stay in the function's environment.
2. **Two-way status sync.** Once DASH HQ has an API, sync `status` and `internal_notes` both ways and use `synced_at` to resolve conflicts. Decide on one source of truth for each field before building.
3. **Email marketing.** Sync only rows where `marketing_consent = true`. Send unsubscribes back to the database.
4. **Pipeline automation.** Trigger follow-ups when `status` changes, for example sending a discovery-call booking link when a lead moves to `qualified`. Keep a person approving each step until volume justifies full automation.
5. **Reporting.** Track leads by `service_interest` and `budget_range`, and conversion by stage. This helps show which niches are actually commercially validated.

Before building each integration, confirm API access, write down where the data flows, and update the Privacy Policy's list of service providers.
