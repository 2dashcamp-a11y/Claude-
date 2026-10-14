"use client";

import Script from "next/script";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  BUDGET_OPTIONS,
  SERVICE_OPTIONS,
  STAGE_OPTIONS,
  TIMELINE_OPTIONS,
  isServiceInterest,
} from "@/lib/waitlist/options";
import { firstFieldErrors, waitlistSchema, type FieldErrors } from "@/lib/waitlist/schema";
import { SELECT_SERVICE_EVENT } from "./ServiceCta";

type Status = "idle" | "submitting" | "success" | "error";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const FIELD_ORDER: (keyof FieldErrors)[] = [
  "fullName",
  "email",
  "companyName",
  "serviceInterest",
  "websiteUrl",
  "businessStage",
  "budgetRange",
  "timeline",
  "biggestChallenge",
  "privacyAcknowledged",
];

/** Fields inside the collapsible "project details" step. */
const OPTIONAL_FIELDS: (keyof FieldErrors)[] = [
  "websiteUrl",
  "businessStage",
  "budgetRange",
  "timeline",
  "biggestChallenge",
];

const inputClass =
  "block w-full rounded-xl border bg-white px-4 py-3.5 text-base text-ink placeholder:text-graphite/60 transition-colors focus:border-purple focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple/25 aria-[invalid=true]:border-[#b42318] aria-[invalid=true]:ring-[#b42318]/20";

function Field({
  id,
  label,
  required,
  hint,
  error,
  children,
  className = "",
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-[0.95rem] font-medium text-ink">
        <span>
          {label}
          {required && (
            <span aria-hidden="true" className="ml-0.5 text-oxblood">
              *
            </span>
          )}
        </span>
      </label>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-graphite">
          {hint}
        </p>
      )}
      <div className="mt-2">{children}</div>
      {error && (
        <p id={`${id}-error`} className="mt-2 flex items-start gap-1.5 text-sm text-[#b42318]">
          <span aria-hidden="true">●</span>
          {error}
        </p>
      )}
    </div>
  );
}

function SelectArrow() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 8"
      className="pointer-events-none absolute right-4 top-1/2 h-2 w-3 -translate-y-1/2 text-graphite"
    >
      <path d="M1 1l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function WaitlistForm() {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const startedAt = useRef<number | null>(null);

  const [service, setService] = useState<string>("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    startedAt.current = Date.now();

    const onSelect = (event: Event) => {
      const value = (event as CustomEvent<unknown>).detail;
      if (isServiceInterest(value)) {
        setService(value);
        setErrors((e) => ({ ...e, serviceInterest: undefined }));
      }
    };
    window.addEventListener(SELECT_SERVICE_EVENT, onSelect);

    // Shareable deep link: /?interest=brand_creative_direction#early-access
    const fromUrl = new URLSearchParams(window.location.search).get("interest");
    if (isServiceInterest(fromUrl)) {
      window.dispatchEvent(new CustomEvent(SELECT_SERVICE_EVENT, { detail: fromUrl }));
    }
    return () => window.removeEventListener(SELECT_SERVICE_EVENT, onSelect);
  }, []);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  const describedBy = (name: keyof FieldErrors, hint = false) =>
    [hint ? id(`${name}-hint`) : null, errors[name] ? id(`${name}-error`) : null].filter(Boolean).join(" ") ||
    undefined;

  function focusFirstError(fieldErrors: FieldErrors) {
    // Reveal the optional step if anything inside it needs fixing.
    if (OPTIONAL_FIELDS.some((name) => fieldErrors[name]) && detailsRef.current) detailsRef.current.open = true;
    const first = FIELD_ORDER.find((name) => fieldErrors[name]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const data = new FormData(event.currentTarget);
    const str = (key: string) => (data.get(key) as string | null) ?? "";
    const payload = {
      fullName: str("fullName"),
      email: str("email"),
      companyName: str("companyName"),
      serviceInterest: str("serviceInterest"),
      websiteUrl: str("websiteUrl"),
      businessStage: str("businessStage"),
      biggestChallenge: str("biggestChallenge"),
      budgetRange: str("budgetRange"),
      timeline: str("timeline"),
      privacyAcknowledged: data.get("privacyAcknowledged") === "on",
      marketingConsent: data.get("marketingConsent") === "on",
      fax: str("fax"),
      startedAt: startedAt.current ?? undefined,
      turnstileToken: str("cf-turnstile-response") || undefined,
    };

    const check = waitlistSchema.safeParse(payload);
    if (!check.success) {
      const fieldErrors = firstFieldErrors(check.error);
      setErrors(fieldErrors);
      setStatus("error");
      setMessage("Please check the highlighted fields.");
      focusFirstError(fieldErrors);
      return;
    }

    setErrors({});
    setStatus("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json().catch(() => null)) as
        | { ok: boolean; error?: string; fieldErrors?: FieldErrors }
        | null;

      if (response.ok && body?.ok) {
        setStatus("success");
        return;
      }
      const fieldErrors = body?.fieldErrors ?? {};
      setErrors(fieldErrors);
      setStatus("error");
      setMessage(body?.error ?? "Something went wrong on our side. Please try again in a moment.");
      if (Object.keys(fieldErrors).length) focusFirstError(fieldErrors);
      else summaryRef.current?.focus();
      // Turnstile tokens are single-use.
      (window as unknown as { turnstile?: { reset: () => void } }).turnstile?.reset();
    } catch {
      setStatus("error");
      setMessage("We couldn’t reach the server. Check your connection and try again.");
      summaryRef.current?.focus();
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="rounded-3xl bg-ink p-8 text-cream sm:p-12">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-purple">
            <svg viewBox="0 0 16 16" className="h-4 w-4">
              <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </span>
          <span className="eyebrow text-lilac">Request received</span>
        </div>
        <h3 ref={successRef} tabIndex={-1} className="display mt-8 text-3xl outline-none sm:text-4xl">
          You’re on the list. We’ll be in touch when the right opportunity opens up.
        </h3>
        <p className="mt-6 text-cream/70">
          Thanks for telling us what you’re building. Every submission is reviewed personally.
        </p>
      </div>
    );
  }

  const submitting = status === "submitting";
  const fieldClass = (name: keyof FieldErrors) => `${inputClass} ${errors[name] ? "border-[#b42318]" : "border-ink/15"}`;
  const optionalErrorCount = OPTIONAL_FIELDS.filter((f) => errors[f]).length;

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      aria-describedby={id("required-note")}
      className="glass-light relative rounded-3xl p-6 sm:p-9"
    >
      {TURNSTILE_SITE_KEY && (
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />
      )}

      <div ref={summaryRef} tabIndex={-1} aria-live="assertive" className="outline-none">
        {status === "error" && message && (
          <div role="alert" className="mb-7 rounded-xl border border-[#b42318]/40 bg-[#b42318]/[0.06] px-4 py-3 text-[0.95rem] text-[#8f1c13]">
            {message}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="eyebrow text-purple">Step 1 — The essentials</p>
        <p id={id("required-note")} className="whitespace-nowrap text-sm text-graphite">
          <span className="text-oxblood">*</span> Required
        </p>
      </div>

      <fieldset className="mt-6 grid gap-5 sm:grid-cols-2">
        <legend className="sr-only">Your details</legend>
        <Field id={id("fullName")} label="Full name" required error={errors.fullName}>
          <input
            id={id("fullName")}
            name="fullName"
            type="text"
            autoComplete="name"
            required
            maxLength={120}
            aria-invalid={!!errors.fullName}
            aria-describedby={describedBy("fullName")}
            className={fieldClass("fullName")}
          />
        </Field>
        <Field id={id("email")} label="Email address" required error={errors.email}>
          <input
            id={id("email")}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            maxLength={254}
            aria-invalid={!!errors.email}
            aria-describedby={describedBy("email")}
            className={fieldClass("email")}
          />
        </Field>
        <Field id={id("companyName")} label="Company / brand name" required error={errors.companyName} className="sm:col-span-2">
          <input
            id={id("companyName")}
            name="companyName"
            type="text"
            autoComplete="organization"
            required
            maxLength={160}
            aria-invalid={!!errors.companyName}
            aria-describedby={describedBy("companyName")}
            className={fieldClass("companyName")}
          />
        </Field>
        <Field
          id={id("serviceInterest")}
          label="What do you need most?"
          required
          error={errors.serviceInterest}
          className="sm:col-span-2"
        >
          <div className="relative">
            <select
              id={id("serviceInterest")}
              name="serviceInterest"
              required
              value={service}
              onChange={(e) => setService(e.target.value)}
              aria-invalid={!!errors.serviceInterest}
              aria-describedby={describedBy("serviceInterest")}
              className={`${fieldClass("serviceInterest")} appearance-none pr-10`}
            >
              <option value="" disabled>
                Choose one…
              </option>
              {SERVICE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <SelectArrow />
          </div>
        </Field>
      </fieldset>

      {/* Step 2: optional qualification details, collapsed by default */}
      <details
        ref={detailsRef}
        className="group mt-7 rounded-2xl border border-ink/12 bg-cream/70 open:bg-cream"
      >
        <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 [&::-webkit-details-marker]:hidden">
          <span>
            <span className="block font-display text-base font-semibold text-ink">
              Step 2 — Add project details{" "}
              <span className="font-sans text-sm font-normal text-graphite">(optional)</span>
            </span>
            <span className="mt-0.5 block text-sm text-graphite">
              Website, stage, budget, timing and your biggest challenge. Helps us prepare.
            </span>
            {optionalErrorCount > 0 && (
              <span className="mt-1 block text-sm font-medium text-[#b42318]">
                {optionalErrorCount === 1 ? "1 field needs attention" : `${optionalErrorCount} fields need attention`}
              </span>
            )}
          </span>
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/20 text-lg leading-none text-ink transition-transform group-open:rotate-45"
          >
            +
          </span>
        </summary>

        <div className="grid gap-5 border-t border-ink/10 px-5 pb-6 pt-5 sm:grid-cols-2">
          <Field id={id("websiteUrl")} label="Website or company URL" error={errors.websiteUrl} className="sm:col-span-2">
            <input
              id={id("websiteUrl")}
              name="websiteUrl"
              type="text"
              inputMode="url"
              autoComplete="url"
              placeholder="yourcompany.com"
              maxLength={300}
              aria-invalid={!!errors.websiteUrl}
              aria-describedby={describedBy("websiteUrl")}
              className={fieldClass("websiteUrl")}
            />
          </Field>
          {(
            [
              ["businessStage", "Business stage", STAGE_OPTIONS],
              ["budgetRange", "Estimated project or monthly budget", BUDGET_OPTIONS],
            ] as const
          ).map(([name, label, options]) => (
            <Field key={name} id={id(name)} label={label} error={errors[name]}>
              <div className="relative">
                <select
                  id={id(name)}
                  name={name}
                  defaultValue=""
                  aria-invalid={!!errors[name]}
                  aria-describedby={describedBy(name)}
                  className={`${fieldClass(name)} appearance-none pr-10`}
                >
                  <option value="">Select…</option>
                  {options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <SelectArrow />
              </div>
            </Field>
          ))}
          <fieldset className="sm:col-span-2" aria-describedby={describedBy("timeline")}>
            <legend className="text-[0.95rem] font-medium text-ink">How soon do you need support?</legend>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TIMELINE_OPTIONS.map((o) => (
                <label
                  key={o.value}
                  className="flex min-h-[48px] cursor-pointer items-center justify-center rounded-xl border border-ink/15 bg-white/70 px-3 py-2 text-center text-[0.95rem] transition-colors hover:border-ink/40 has-[:checked]:border-purple has-[:checked]:bg-purple has-[:checked]:text-cream has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-purple/40"
                >
                  <input type="radio" name="timeline" value={o.value} className="sr-only" />
                  {o.label}
                </label>
              ))}
            </div>
            {errors.timeline && (
              <p id={id("timeline-error")} className="mt-2 text-sm text-[#b42318]">
                {errors.timeline}
              </p>
            )}
          </fieldset>
          <Field
            id={id("biggestChallenge")}
            label="Biggest technology or digital challenge"
            hint="A sentence or two is plenty. Please don’t include passwords, financial records or customer data."
            error={errors.biggestChallenge}
            className="sm:col-span-2"
          >
            <textarea
              id={id("biggestChallenge")}
              name="biggestChallenge"
              rows={4}
              maxLength={2000}
              aria-invalid={!!errors.biggestChallenge}
              aria-describedby={describedBy("biggestChallenge", true)}
              className={`${fieldClass("biggestChallenge")} resize-y`}
            />
          </Field>
        </div>
      </details>

      {/* Honeypot — hidden from people and assistive tech. */}
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor={id("fax")}>Leave this field empty</label>
        <input id={id("fax")} name="fax" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="mt-7 space-y-3">
        <div>
          <label className="flex cursor-pointer items-start gap-3 py-1 text-[0.95rem] leading-relaxed text-ink">
            <input
              type="checkbox"
              name="privacyAcknowledged"
              required
              aria-invalid={!!errors.privacyAcknowledged}
              aria-describedby={describedBy("privacyAcknowledged")}
              className="mt-0.5 h-5 w-5 shrink-0 accent-purple"
            />
            <span>
              I’ve read the{" "}
              <a href="/privacy" target="_blank" className="font-medium underline underline-offset-2 hover:text-purple">
                Privacy Policy
                <span className="sr-only"> (opens in a new tab)</span>
              </a>{" "}
              and agree to Dash of Digital storing my details to respond to this request.
              <span aria-hidden="true" className="text-oxblood">
                {" "}
                *
              </span>
            </span>
          </label>
          {errors.privacyAcknowledged && (
            <p id={id("privacyAcknowledged-error")} className="ml-8 mt-1 text-sm text-[#b42318]">
              {errors.privacyAcknowledged}
            </p>
          )}
        </div>
        <label className="flex cursor-pointer items-start gap-3 py-1 text-[0.95rem] leading-relaxed text-graphite">
          <input type="checkbox" name="marketingConsent" className="mt-0.5 h-5 w-5 shrink-0 accent-purple" />
          <span>Also send me occasional Dash of Digital news and insights. Optional, unsubscribe anytime.</span>
        </label>
      </div>

      {TURNSTILE_SITE_KEY && (
        <div className="cf-turnstile mt-7" data-sitekey={TURNSTILE_SITE_KEY} data-theme="light" />
      )}

      <button
        type="submit"
        disabled={submitting}
        className="sheen group mt-7 inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-ink px-8 text-base font-semibold text-cream transition-colors hover:bg-oxblood disabled:cursor-wait disabled:opacity-80"
      >
        {submitting ? (
          <>
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-cream/30 border-t-cream"
            />
            Submitting…
          </>
        ) : (
          <>
            Join the Early Access List
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </>
        )}
      </button>
      <p className="sr-only" aria-live="polite">
        {submitting ? "Submitting your request" : ""}
      </p>
    </form>
  );
}
