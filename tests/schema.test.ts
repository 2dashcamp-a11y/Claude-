import { describe, expect, it } from "vitest";
import { firstFieldErrors, waitlistSchema } from "@/lib/waitlist/schema";

const valid = {
  fullName: "  Ada Lovelace ",
  email: " Ada@Example.com ",
  companyName: "Analytical Engines",
  serviceInterest: "technical_infrastructure_management",
  privacyAcknowledged: true,
};

describe("waitlistSchema", () => {
  it("accepts a minimal valid submission and trims values", () => {
    const result = waitlistSchema.parse(valid);
    expect(result.fullName).toBe("Ada Lovelace");
    expect(result.email).toBe("Ada@Example.com");
    expect(result.marketingConsent).toBe(false);
    expect(result.websiteUrl).toBeUndefined();
  });

  it("turns empty optional fields into undefined", () => {
    const result = waitlistSchema.parse({
      ...valid,
      websiteUrl: "",
      businessStage: "",
      budgetRange: " ",
      timeline: "",
      biggestChallenge: "   ",
    });
    expect(result).toMatchObject({
      websiteUrl: undefined,
      businessStage: undefined,
      budgetRange: undefined,
      timeline: undefined,
      biggestChallenge: undefined,
    });
  });

  it("normalizes a bare domain into an https URL", () => {
    expect(waitlistSchema.parse({ ...valid, websiteUrl: "acme.com" }).websiteUrl).toBe("https://acme.com/");
  });

  it.each(["javascript:alert(1)", "not a url", "ftp://files.example.com"])("rejects website %s", (websiteUrl) => {
    const result = waitlistSchema.safeParse({ ...valid, websiteUrl });
    expect(result.success).toBe(false);
    if (!result.success) expect(firstFieldErrors(result.error).websiteUrl).toBeTruthy();
  });

  it("reports a readable message for every missing required field", () => {
    const result = waitlistSchema.safeParse({});
    expect(result.success).toBe(false);
    if (result.success) return;
    const errors = firstFieldErrors(result.error);
    expect(Object.keys(errors).sort()).toEqual(
      ["companyName", "email", "fullName", "privacyAcknowledged", "serviceInterest"].sort(),
    );
    expect(errors.email).toMatch(/email/i);
    expect(errors.privacyAcknowledged).toMatch(/Privacy Policy/);
  });

  it("rejects invalid email and unknown option values", () => {
    const result = waitlistSchema.safeParse({
      ...valid,
      email: "nope@",
      serviceInterest: "hacking",
      budgetRange: "a_million",
      timeline: "yesterday",
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    const errors = firstFieldErrors(result.error);
    expect(errors.email).toBeTruthy();
    expect(errors.serviceInterest).toBeTruthy();
    expect(errors.budgetRange).toBeTruthy();
    expect(errors.timeline).toBeTruthy();
  });

  it("requires privacy acknowledgment to be exactly true", () => {
    expect(waitlistSchema.safeParse({ ...valid, privacyAcknowledged: false }).success).toBe(false);
    expect(waitlistSchema.safeParse({ ...valid, privacyAcknowledged: "on" }).success).toBe(false);
  });

  it("enforces length limits", () => {
    expect(waitlistSchema.safeParse({ ...valid, biggestChallenge: "x".repeat(2001) }).success).toBe(false);
    expect(waitlistSchema.safeParse({ ...valid, fullName: "x".repeat(121) }).success).toBe(false);
  });
});
