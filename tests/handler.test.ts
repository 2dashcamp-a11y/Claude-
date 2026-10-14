import { createClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { founderNotification, visitorConfirmation, type EmailMessage, type Mailer } from "@/lib/waitlist/email";
import { handleWaitlistPost, type HandlerDeps } from "@/lib/waitlist/handler";
import { RateLimiter } from "@/lib/waitlist/protection";
import { MemoryWaitlistStore, SupabaseWaitlistStore, type WaitlistStore } from "@/lib/waitlist/store";

const NOW = 1_800_000_000_000;

const validBody = {
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  companyName: "Analytical Engines",
  serviceInterest: "digital_infrastructure_audit",
  privacyAcknowledged: true,
  marketingConsent: false,
  fax: "",
  startedAt: NOW - 30_000,
};

class FakeMailer implements Mailer {
  sent: EmailMessage[] = [];
  constructor(private readonly fail = false) {}
  async send(message: EmailMessage) {
    if (this.fail) throw new Error("provider down");
    this.sent.push(message);
  }
}

function setup(overrides: Partial<HandlerDeps> = {}) {
  const store = new MemoryWaitlistStore();
  const mailer = new FakeMailer();
  const deps: HandlerDeps = {
    store,
    email: { mailer, founderEmail: "founder@example.com", sendConfirmation: true },
    rateLimiter: new RateLimiter(100, 60_000, () => NOW),
    verifyTurnstile: null,
    privacyPolicyVersion: "test-version",
    now: () => NOW,
    ...overrides,
  };
  return { store, mailer, deps };
}

function post(body: unknown, init: { ip?: string; contentType?: string; raw?: string } = {}) {
  return new Request("http://localhost/api/waitlist", {
    method: "POST",
    headers: {
      "content-type": init.contentType ?? "application/json",
      "x-forwarded-for": init.ip ?? "203.0.113.7",
    },
    body: init.raw ?? JSON.stringify(body),
  });
}

describe("POST /api/waitlist", () => {
  it("stores a valid submission and sends founder + confirmation emails", async () => {
    const { store, mailer, deps } = setup();
    const res = await handleWaitlistPost(post(validBody), deps);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    const row = store.rows.get("ada@example.com");
    expect(row).toMatchObject({
      full_name: "Ada Lovelace",
      service_interest: "digital_infrastructure_audit",
      privacy_policy_version: "test-version",
      marketing_consent: false,
    });
    expect(row?.delivery).toEqual({ founderNotified: true, confirmationSent: true, error: null });
    expect(mailer.sent.map((m) => m.to).sort()).toEqual(["ada@example.com", "founder@example.com"]);
  });

  it("returns the same response for a duplicate email, keeps the original, and doesn't re-send confirmation", async () => {
    const { store, mailer, deps } = setup();
    await handleWaitlistPost(post(validBody), deps);
    const res = await handleWaitlistPost(
      post({ ...validBody, email: " ADA@example.COM ", fullName: "Someone Else" }),
      deps,
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    expect(store.rows.size).toBe(1);
    expect(store.rows.get("ada@example.com")).toMatchObject({ full_name: "Ada Lovelace", submission_count: 2 });
    const confirmations = mailer.sent.filter((m) => m.to !== "founder@example.com");
    expect(confirmations).toHaveLength(1);
    expect(mailer.sent.at(-1)?.subject).toMatch(/^Repeat submission/);
  });

  it("returns 422 with field errors for invalid data and stores nothing", async () => {
    const { store, deps } = setup();
    const res = await handleWaitlistPost(post({ ...validBody, email: "bad", privacyAcknowledged: false }), deps);
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.fieldErrors.email).toBeTruthy();
    expect(body.fieldErrors.privacyAcknowledged).toBeTruthy();
    expect(store.rows.size).toBe(0);
  });

  it("silently drops honeypot submissions", async () => {
    const { store, mailer, deps } = setup();
    const res = await handleWaitlistPost(post({ ...validBody, fax: "buy now" }), deps);
    expect(res.status).toBe(200);
    expect(store.rows.size).toBe(0);
    expect(mailer.sent).toHaveLength(0);
  });

  it("rejects submissions completed implausibly fast", async () => {
    const { store, deps } = setup();
    const res = await handleWaitlistPost(post({ ...validBody, startedAt: NOW - 500 }), deps);
    expect(res.status).toBe(400);
    expect(store.rows.size).toBe(0);
  });

  it("rate-limits repeated submissions from one IP", async () => {
    const { deps } = setup({ rateLimiter: new RateLimiter(2, 60_000, () => NOW) });
    const statuses = [];
    for (let i = 0; i < 3; i++) {
      statuses.push((await handleWaitlistPost(post({ ...validBody, email: `a${i}@example.com` }), deps)).status);
    }
    expect(statuses).toEqual([200, 200, 429]);
    const other = await handleWaitlistPost(post({ ...validBody, email: "b@example.com" }, { ip: "198.51.100.1" }), deps);
    expect(other.status).toBe(200);
  });

  it("enforces Turnstile when configured", async () => {
    const verify = vi.fn(async (token: string | undefined) => token === "good");
    const { store, deps } = setup({ verifyTurnstile: verify });
    expect((await handleWaitlistPost(post(validBody), deps)).status).toBe(400);
    expect((await handleWaitlistPost(post({ ...validBody, turnstileToken: "good" }), deps)).status).toBe(200);
    expect(store.rows.size).toBe(1);
  });

  it("returns a real failure (not a fake success) when storage is unavailable", async () => {
    const { deps } = setup({ store: null });
    const res = await handleWaitlistPost(post(validBody), deps);
    expect(res.status).toBe(503);
    expect((await res.json()).ok).toBe(false);

    const broken: WaitlistStore = {
      submit: async () => {
        throw new Error("db down");
      },
      recordDelivery: async () => {},
    };
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res2 = await handleWaitlistPost(post(validBody), { ...deps, store: broken });
    spy.mockRestore();
    expect(res2.status).toBe(500);
    expect((await res2.json()).ok).toBe(false);
  });

  it("still succeeds when email delivery fails, and records the failure", async () => {
    const { store, deps } = setup();
    deps.email = { mailer: new FakeMailer(true), founderEmail: "founder@example.com", sendConfirmation: true };
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await handleWaitlistPost(post(validBody), deps);
    spy.mockRestore();
    expect(res.status).toBe(200);
    const delivery = store.rows.get("ada@example.com")?.delivery;
    expect(delivery?.founderNotified).toBe(false);
    expect(delivery?.confirmationSent).toBe(false);
    expect(delivery?.error).toMatch(/provider down/);
  });

  it("records when no email provider is configured", async () => {
    const { store, deps } = setup();
    deps.email = { mailer: null, founderEmail: null, sendConfirmation: true };
    expect((await handleWaitlistPost(post(validBody), deps)).status).toBe(200);
    expect(store.rows.get("ada@example.com")?.delivery?.error).toBe("Email provider not configured");
  });

  it("rejects non-JSON, malformed and oversized bodies", async () => {
    const { deps } = setup();
    expect((await handleWaitlistPost(post(null, { contentType: "text/plain", raw: "x" }), deps)).status).toBe(415);
    expect((await handleWaitlistPost(post(null, { raw: "{not json" }), deps)).status).toBe(400);
    expect((await handleWaitlistPost(post(null, { raw: JSON.stringify({ a: "x".repeat(20_000) }) }), deps)).status).toBe(413);
  });
});

describe("email templates", () => {
  it("escapes visitor-supplied HTML in the founder notification", () => {
    const msg = founderNotification(
      {
        ...validBody,
        fullName: "<script>alert(1)</script>",
        serviceInterest: "not_sure",
        marketingConsent: false,
        privacyAcknowledged: true,
        companyName: "Evil\r\nBcc: x@y.z",
      },
      true,
    );
    expect(msg.html).not.toContain("<script>");
    expect(msg.html).toContain("&lt;script&gt;");
    expect(msg.subject).not.toMatch(/[\r\n]/);
  });

  it("confirmation makes no promises about timing or acceptance", () => {
    const msg = visitorConfirmation({ ...validBody, serviceInterest: "not_sure", privacyAcknowledged: true, marketingConsent: false });
    expect(msg.text).not.toMatch(/within \d|guarantee|24 hours|business days/i);
  });
});

describe("SupabaseWaitlistStore", () => {
  it("calls the submit RPC with the expected payload and parses the result", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      expect(url).toBe("https://project.supabase.co/rest/v1/rpc/submit_waitlist_entry");
      const body = JSON.parse(String(init?.body));
      expect(body.entry).toMatchObject({
        full_name: "Ada Lovelace",
        email: "ada@example.com",
        service_interest: "digital_infrastructure_audit",
        privacy_policy_version: "v1",
        website_url: null,
      });
      return new Response(JSON.stringify([{ entry_id: "abc", is_new: true }]), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });
    const client = createClient("https://project.supabase.co", "service-key", {
      auth: { persistSession: false },
      global: { fetch: fetchMock as unknown as typeof fetch },
    });
    const store = new SupabaseWaitlistStore(client);
    const result = await store.submit(
      { ...validBody, serviceInterest: "digital_infrastructure_audit", privacyAcknowledged: true, marketingConsent: false },
      { privacyPolicyVersion: "v1" },
    );
    expect(result).toEqual({ entryId: "abc", isNew: true });
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});

describe("ResendMailer", async () => {
  const { ResendMailer } = await import("@/lib/waitlist/email");

  it("posts to Resend with auth and reply-to, and throws on non-2xx", async () => {
    const calls: { url: string; init: RequestInit }[] = [];
    const ok = new ResendMailer("re_test", "DOD <hello@example.com>", (async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return new Response("{}", { status: 200 });
    }) as unknown as typeof fetch);
    await ok.send({ to: "a@b.co", subject: "s", text: "t", html: "<p>t</p>", replyTo: "r@b.co" });
    expect(calls[0].url).toBe("https://api.resend.com/emails");
    expect((calls[0].init.headers as Record<string, string>).Authorization).toBe("Bearer re_test");
    expect(JSON.parse(String(calls[0].init.body))).toMatchObject({ to: ["a@b.co"], reply_to: "r@b.co" });

    const failing = new ResendMailer("re_test", "x@y.z", (async () =>
      new Response("bad domain", { status: 403 })) as unknown as typeof fetch);
    await expect(failing.send({ to: "a@b.co", subject: "s", text: "t", html: "t" })).rejects.toThrow(/403/);
  });
});
