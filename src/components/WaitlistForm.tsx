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

const inputClass =
  "block w-full rounded-xl border bg-white/70 px-4 py-3.5 text-base text-ink placeholder:text-stone/60 transition-colors focus:border-purple focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple/25 aria-[invalid=true]:border-red aria-[invalid=true]:ring-red/20";

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
      <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-sm font-medium text-ink">
        <span>
          {label}
          {required && (
            <span aria-hidden="true" className="ml-0.5 text-red">
              *
            </span>
          )}
        </span>
        {!required && <span className="text-xs font-normal text-stone">Optional</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-stone">
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
      className="pointer-events-none absolute right-4 top-1/2 h-2 w-3 -translate-y-1/2 text-stone"
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

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      aria-describedby={id("required-note")}
      className="relative rounded-3xl border border-ink/10 bg-cream p-6 shadow-[0_30px_80px_-40px_rgba(11,11,13,0.35)] sm:p-10"
    >
      {TURNSTILE_SITE_KEY && (
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />
      )}

      <div ref={summaryRef} tabIndex={-1} aria-live="assertive" className="outline-none">
        {status === "error" && message && (
          <div role="alert" className="mb-8 rounded-xl border border-red/40 bg-red/[0.06] px-4 py-3 text-sm text-[#8f1c13]">
            {message}
          </div>
        )}
      </div>

      <p id={id("required-note")} className="mb-6 text-xs text-stone">
        Fields marked <span className="text-red">*</span> are required.
      </p>

      <fieldset className="grid gap-6 sm:grid-cols-2">
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
            className={`${inputClass} ${errors.fullName ? "border-red" : "border-ink/15"}`}
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
            className={`${inputClass} ${errors.email ? "border-red" : "border-ink/15"}`}
          />
        </Field>
        <Field id={id("companyName")} label="Company / brand name" required error={errors.companyName}>
          <input
            id={id("companyName")}
            name="companyName"
            type="text"
            autoComplete="organization"
            required
            maxLength={160}
            aria-invalid={!!errors.companyName}
            aria-describedby={describedBy("companyName")}
            className={`${inputClass} ${errors.companyName ? "border-red" : "border-ink/15"}`}
          />
        </Field>
        <Field id={id("websiteUrl")} label="Website or company URL" error={errors.websiteUrl}>
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
            className={`${inputClass} ${errors.websiteUrl ? "border-red" : "border-ink/15"}`}
          />
        </Field>
        <Field
          id={id("serviceInterest")}
          label="Primary area of interest"
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
              className={`${inputClass} appearance-none pr-10 ${errors.serviceInterest ? "border-red" : "border-ink/15"}`}
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

      <fieldset className="mt-10 grid gap-6 border-t border-ink/10 pt-8 sm:grid-cols-2">
        <legend className="eyebrow float-left mb-6 w-full text-stone sm:col-span-2">
          A little more context — optional
        </legend>
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
                className={`${inputClass} appearance-none pr-10 ${errors[name] ? "border-red" : "border-ink/15"}`}
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
          <legend className="flex w-full items-baseline justify-between gap-3 text-sm font-medium text-ink">
            <span>How soon do you need support?</span>
            <span className="text-xs font-normal text-stone">Optional</span>
          </legend>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TIMELINE_OPTIONS.map((o) => (
              <label
                key={o.value}
                className="flex cursor-pointer items-center justify-center rounded-xl border border-ink/15 bg-white/50 px-3 py-3 text-center text-sm transition-colors hover:border-ink/40 has-[:checked]:border-purple has-[:checked]:bg-purple has-[:checked]:text-cream has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-purple/40"
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
            className={`${inputClass} resize-y ${errors.biggestChallenge ? "border-red" : "border-ink/15"}`}
          />
        </Field>
      </fieldset>

      {/* Honeypot — hidden from people and assistive tech. */}
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor={id("fax")}>Leave this field empty</label>
        <input id={id("fax")} name="fax" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="mt-10 space-y-4 border-t border-ink/10 pt-8">
        <div>
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-ink">
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
              <span aria-hidden="true" className="text-red">
                {" "}
                *
              </span>
            </span>
          </label>
          {errors.privacyAcknowledged && (
            <p id={id("privacyAcknowledged-error")} className="ml-8 mt-2 text-sm text-[#b42318]">
              {errors.privacyAcknowledged}
            </p>
          )}
        </div>
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-stone">
          <input type="checkbox" name="marketingConsent" className="mt-0.5 h-5 w-5 shrink-0 accent-purple" />
          <span>
            Also send me occasional emails about Dash of Digital news and insights. Optional — unsubscribe anytime.
          </span>
        </label>
      </div>

      {TURNSTILE_SITE_KEY && (
        <div className="cf-turnstile mt-8" data-sitekey={TURNSTILE_SITE_KEY} data-theme="light" />
      )}

      <button
        type="submit"
        disabled={submitting}
        className="group mt-8 inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-ink px-8 text-base font-medium text-cream transition-colors hover:bg-purple disabled:cursor-wait disabled:opacity-80 sm:w-auto"
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
