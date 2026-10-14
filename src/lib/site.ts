/**
 * Site-wide configuration. Anything the founder still needs to confirm is
 * read from an environment variable and degrades gracefully when missing —
 * nothing here is invented contact information.
 */

function clean(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export const siteConfig = {
  name: "Dash of Digital",
  wordmark: "DASH OF DIGITAL",
  legalName: "Dash of Digital LLC",
  url: (clean(process.env.NEXT_PUBLIC_SITE_URL) ?? "http://localhost:3000").replace(/\/$/, ""),
  title: "Dash of Digital | Creative-Tech Agency for Systems, Experiences & Brands",
  description:
    "Dash of Digital is a high-touch creative-tech partner that connects your systems, digital experiences, and creative direction into one cohesive business experience.",
  tagline: "Fluent in systems, people & whatever’s broken.",
  /** Public business email. Set NEXT_PUBLIC_CONTACT_EMAIL; null hides email links. */
  contactEmail: clean(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
  /**
   * Verified founder portrait, e.g. "/founder.jpg" placed in /public.
   * Leave null until a real photo is supplied — the founder section renders a
   * typographic composition instead.
   */
  founderPhoto: null as string | null,
  /** Bump when the privacy policy changes materially; stored with each consent. */
  privacyPolicyVersion: "2026-10-14",
  legalLastUpdated: "October 14, 2026",
} as const;

export const navLinks = [
  { href: "#about", label: "About" },
  { href: "#expertise", label: "Expertise" },
  { href: "#how-we-work", label: "How We Work" },
  { href: "#early-access", label: "Early Access" },
] as const;
