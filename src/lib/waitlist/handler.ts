import "server-only";
import { founderNotification, visitorConfirmation, type EmailSettings } from "./email";
import { clientIp, type RateLimiter, type TurnstileVerifier } from "./protection";
import { antiSpamSchema, firstFieldErrors, waitlistSchema, type FieldErrors } from "./schema";
import type { WaitlistStore } from "./store";

export type WaitlistResponseBody =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: FieldErrors };

export type HandlerDeps = {
  store: WaitlistStore | null;
  email: EmailSettings;
  rateLimiter: RateLimiter;
  verifyTurnstile: TurnstileVerifier | null;
  privacyPolicyVersion: string;
  now?: () => number;
};

const MAX_BODY_BYTES = 16 * 1024;
/** Real people take longer than this to fill in the form. */
const MIN_FILL_MS = 2500;

const json = (status: number, body: WaitlistResponseBody) => Response.json(body, { status });

const GENERIC_FAILURE =
  "We couldn’t save your details just now. Please try again in a moment.";

/**
 * POST /api/waitlist
 *
 * Responds identically for new and repeat emails so the form never reveals
 * whether someone is already on the list.
 */
export async function handleWaitlistPost(request: Request, deps: HandlerDeps): Promise<Response> {
  const now = deps.now ?? Date.now;

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json(415, { ok: false, error: "Unsupported request format." });
  }

  const ip = clientIp(request);
  if (!deps.rateLimiter.check(ip)) {
    return json(429, {
      ok: false,
      error: "Too many submissions from this connection. Please wait a few minutes and try again.",
    });
  }

  let payload: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return json(413, { ok: false, error: "That submission is too large." });
    }
    payload = JSON.parse(raw);
  } catch {
    return json(400, { ok: false, error: "We couldn’t read that submission. Please try again." });
  }

  const antiSpam = antiSpamSchema.safeParse(payload);
  const parsed = waitlistSchema.safeParse(payload);
  if (!parsed.success) {
    return json(422, {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: firstFieldErrors(parsed.error),
    });
  }

  const meta = antiSpam.success ? antiSpam.data : {};

  // Honeypot filled: a bot. Respond as a success so it learns nothing, store nothing.
  if (meta.fax && meta.fax.trim() !== "") {
    return json(200, { ok: true });
  }

  if (typeof meta.startedAt === "number" && now() - meta.startedAt < MIN_FILL_MS) {
    return json(400, {
      ok: false,
      error: "That was quick! Please take a moment to review your details, then submit again.",
    });
  }

  if (deps.verifyTurnstile && !(await deps.verifyTurnstile(meta.turnstileToken, ip))) {
    return json(400, {
      ok: false,
      error: "We couldn’t verify this browser. Please complete the verification and try again.",
    });
  }

  if (!deps.store) {
    console.error("[waitlist] Storage is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
    return json(503, { ok: false, error: GENERIC_FAILURE });
  }

  const entry = parsed.data;
  let result;
  try {
    result = await deps.store.submit(entry, { privacyPolicyVersion: deps.privacyPolicyVersion });
  } catch (error) {
    console.error("[waitlist] Failed to store submission", error);
    return json(500, { ok: false, error: GENERIC_FAILURE });
  }

  // The lead is saved. Email problems are recorded, never shown as a failure.
  await deliverEmails(entry, result, deps);

  return json(200, { ok: true });
}

async function deliverEmails(
  entry: Parameters<typeof founderNotification>[0],
  result: { entryId: string; isNew: boolean },
  deps: HandlerDeps,
) {
  const { mailer, founderEmail, sendConfirmation } = deps.email;
  if (!mailer) {
    await safeRecord(deps, result.entryId, {
      founderNotified: false,
      confirmationSent: false,
      error: "Email provider not configured",
    });
    return;
  }

  const errors: string[] = [];
  let founderNotified = false;
  let confirmationSent = false;

  const tasks: Promise<void>[] = [];
  if (founderEmail) {
    tasks.push(
      mailer
        .send({ ...founderNotification(entry, result.isNew), to: founderEmail })
        .then(() => void (founderNotified = true))
        .catch((e: unknown) => void errors.push(`founder: ${(e as Error).message}`)),
    );
  } else {
    errors.push("founder: FOUNDER_NOTIFICATION_EMAIL not set");
  }
  // Confirmations go to new entries only, so the form can't be used to
  // repeatedly email someone else's address.
  if (sendConfirmation && result.isNew) {
    tasks.push(
      mailer
        .send({ ...visitorConfirmation(entry), to: entry.email })
        .then(() => void (confirmationSent = true))
        .catch((e: unknown) => void errors.push(`confirmation: ${(e as Error).message}`)),
    );
  }
  await Promise.all(tasks);

  if (errors.length) console.error("[waitlist] Email delivery issue", result.entryId, errors);
  await safeRecord(deps, result.entryId, {
    founderNotified,
    confirmationSent,
    error: errors.length ? errors.join("; ").slice(0, 1000) : null,
  });
}

async function safeRecord(
  deps: HandlerDeps,
  entryId: string,
  record: Parameters<WaitlistStore["recordDelivery"]>[1],
) {
  try {
    await deps.store?.recordDelivery(entryId, record);
  } catch (error) {
    console.error("[waitlist] Failed to record email delivery status", error);
  }
}
