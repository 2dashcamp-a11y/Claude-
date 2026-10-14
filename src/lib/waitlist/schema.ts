import { z } from "zod";
import {
  BUDGET_OPTIONS,
  SERVICE_OPTIONS,
  STAGE_OPTIONS,
  TIMELINE_OPTIONS,
  values,
} from "./options";

const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const optionalEnum = <T extends [string, ...string[]]>(options: T, message: string) =>
  z.preprocess(emptyToUndefined, z.enum(options, { error: message }).optional());

/** Accepts "acme.com" or "https://acme.com"; stores a normalized https URL. */
const websiteUrl = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .trim()
    .max(300, { error: "That URL is too long." })
    .transform((v, ctx) => {
      const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(v) ? v : `https://${v}`;
      try {
        const url = new URL(candidate);
        if (!["http:", "https:"].includes(url.protocol) || !url.hostname.includes(".")) {
          throw new Error("invalid");
        }
        return url.toString();
      } catch {
        ctx.addIssue({ code: "custom", message: "Enter a valid website, like yourcompany.com." });
        return z.NEVER;
      }
    })
    .optional(),
);

/** Fields a visitor fills in. Shared by the browser and the API route. */
export const waitlistSchema = z.object({
  fullName: z
    .string({ error: "Enter your full name." })
    .trim()
    .min(2, { error: "Enter your full name." })
    .max(120, { error: "Please keep your name under 120 characters." }),
  email: z
    .string({ error: "Enter your email address." })
    .trim()
    .max(254, { error: "That email address is too long." })
    .pipe(z.email({ error: "Enter a valid email address, like name@company.com." })),
  companyName: z
    .string({ error: "Enter your company or brand name." })
    .trim()
    .min(1, { error: "Enter your company or brand name." })
    .max(160, { error: "Please keep the company name under 160 characters." }),
  serviceInterest: z.enum(values(SERVICE_OPTIONS), {
    error: "Choose the area you’re most interested in.",
  }),
  websiteUrl,
  businessStage: optionalEnum(values(STAGE_OPTIONS), "Choose a business stage from the list."),
  biggestChallenge: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(2000, { error: "Please keep this under 2,000 characters." }).optional(),
  ),
  budgetRange: optionalEnum(values(BUDGET_OPTIONS), "Choose a budget range from the list."),
  timeline: optionalEnum(values(TIMELINE_OPTIONS), "Choose a timeline from the list."),
  privacyAcknowledged: z.literal(true, {
    error: "Please confirm you’ve read the Privacy Policy.",
  }),
  marketingConsent: z.boolean().default(false),
});

/** Anti-spam metadata sent alongside the form fields. */
export const antiSpamSchema = z.object({
  /** Honeypot: hidden from people, often filled by bots. */
  fax: z.string().optional(),
  /** Epoch ms when the form was first rendered. */
  startedAt: z.number().optional(),
  turnstileToken: z.string().max(4096).optional(),
});

export type WaitlistInput = z.input<typeof waitlistSchema>;
export type WaitlistSubmission = z.output<typeof waitlistSchema>;
export type FieldErrors = Partial<Record<keyof WaitlistSubmission, string>>;

export function firstFieldErrors(error: z.ZodError): FieldErrors {
  const flat = z.flattenError(error).fieldErrors as Record<string, string[] | undefined>;
  const result: FieldErrors = {};
  for (const [key, messages] of Object.entries(flat)) {
    if (messages?.[0]) result[key as keyof WaitlistSubmission] = messages[0];
  }
  return result;
}
