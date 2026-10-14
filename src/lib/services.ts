import type { ServiceInterest } from "./waitlist/options";

export type Service = {
  number: string;
  /** Discipline tag shown on the card; matches the hero diagram key. */
  discipline: "Strategy" | "Systems" | "Experiences" | "Creative";
  slug: ServiceInterest;
  title: string;
  summary: string;
  scope: string[];
};

export const services: Service[] = [
  {
    number: "01",
    slug: "digital_infrastructure_audit",
    discipline: "Strategy",
    title: "Digital Infrastructure Audit",
    summary: "Understand what’s working, what’s getting in the way, and what to improve next.",
    scope: [
      "Software ecosystem & integration map",
      "Customer journey & workflow review",
      "Manual work, friction & cost findings",
      "Prioritized recommendations & roadmap",
    ],
  },
  {
    number: "02",
    slug: "technical_infrastructure_management",
    discipline: "Systems",
    title: "Technical Infrastructure Management",
    summary:
      "Implementation, integrations, automation, troubleshooting, and ongoing technical optimization.",
    scope: [
      "Platform setup, configuration & implementation",
      "Financial technology integrations & sync troubleshooting",
      "Approved workflow & funnel automation",
      "Integration monitoring & issue resolution",
      "Migration planning & vendor coordination",
      "Ongoing optimization of supported platforms",
    ],
  },
  {
    number: "03",
    slug: "digital_experience_modernization",
    discipline: "Experiences",
    title: "Digital Experience Modernization",
    summary: "Websites, funnels, portals, and customer journeys built to function as well as they look.",
    scope: [
      "Conversion-focused websites & landing pages",
      "Booking, purchase & onboarding flows",
      "Customer portals & digital products",
      "Connected website integrations",
    ],
  },
  {
    number: "04",
    slug: "brand_creative_direction",
    discipline: "Creative",
    title: "Brand & Creative Direction",
    summary: "Distinctive brand systems and creative experiences designed to move your business forward.",
    scope: [
      "Brand strategy & visual identity systems",
      "Art & creative direction",
      "Campaign concepts & content systems",
      "Brand guidelines across every touchpoint",
    ],
  },
];
