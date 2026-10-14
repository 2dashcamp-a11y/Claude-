import type { ServiceInterest } from "./waitlist/options";

export type Service = {
  number: string;
  slug: ServiceInterest;
  title: string;
  summary: string;
  scope: string[];
};

export const services: Service[] = [
  {
    number: "01",
    slug: "digital_infrastructure_audit",
    title: "Digital Infrastructure Audit",
    summary: "Understand what’s working, what’s getting in the way, and what to improve next.",
    scope: [
      "Software ecosystem & integration map",
      "Customer journey and workflow review",
      "Manual work, friction & cost findings",
      "Prioritized recommendations and roadmap",
    ],
  },
  {
    number: "02",
    slug: "technical_infrastructure_management",
    title: "Technical Infrastructure Management",
    summary:
      "Implementation, integrations, automation, troubleshooting, and ongoing technical optimization.",
    scope: [
      "Platform setup, configuration & implementation",
      "Financial technology integrations and sync troubleshooting",
      "Approved workflow and funnel automation",
      "Integration monitoring and issue resolution",
      "Migration planning and vendor coordination",
      "Ongoing optimization of supported platforms",
    ],
  },
  {
    number: "03",
    slug: "digital_experience_modernization",
    title: "Digital Experience Modernization",
    summary: "Websites, funnels, portals, and customer journeys built to function as well as they look.",
    scope: [
      "Conversion-focused websites & landing pages",
      "Booking, purchase and onboarding flows",
      "Customer portals and digital products",
      "Connected website integrations",
    ],
  },
  {
    number: "04",
    slug: "brand_creative_direction",
    title: "Brand & Creative Direction",
    summary: "Distinctive brand systems and creative experiences designed to move your business forward.",
    scope: [
      "Brand strategy & visual identity systems",
      "Art and creative direction",
      "Campaign concepts and content systems",
      "Brand guidelines across every touchpoint",
    ],
  },
];
