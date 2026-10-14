/** Option lists shared by the form, the server validation and the database. */

export const SERVICE_OPTIONS = [
  { value: "digital_infrastructure_audit", label: "Digital Infrastructure Audit" },
  { value: "technical_infrastructure_management", label: "Technical Infrastructure Management" },
  { value: "digital_experience_modernization", label: "Digital Experience Modernization" },
  { value: "brand_creative_direction", label: "Brand & Creative Direction" },
  { value: "not_sure", label: "Not sure yet / need guidance" },
] as const;

export const STAGE_OPTIONS = [
  { value: "pre_launch", label: "Pre-launch / idea stage" },
  { value: "early", label: "Operating, under 2 years" },
  { value: "established", label: "Established, 2+ years" },
  { value: "scaling", label: "Scaling / multiple teams or locations" },
] as const;

export const BUDGET_OPTIONS = [
  { value: "under_2500", label: "Under $2,500" },
  { value: "2500_4999", label: "$2,500–$4,999" },
  { value: "5000_9999", label: "$5,000–$9,999" },
  { value: "10000_plus", label: "$10,000+" },
  { value: "not_sure", label: "Not sure yet" },
] as const;

export const TIMELINE_OPTIONS = [
  { value: "immediately", label: "Immediately" },
  { value: "within_30_days", label: "Within 30 days" },
  { value: "1_3_months", label: "1–3 months" },
  { value: "exploring", label: "Just exploring" },
] as const;

type Option = { readonly value: string; readonly label: string };
type Values<T extends readonly Option[]> = T[number]["value"];

export type ServiceInterest = Values<typeof SERVICE_OPTIONS>;

export function values<T extends readonly Option[]>(options: T) {
  return options.map((o) => o.value) as [Values<T>, ...Values<T>[]];
}

export function labelFor(options: readonly Option[], value: string | null | undefined) {
  return options.find((o) => o.value === value)?.label ?? value ?? "—";
}

export function isServiceInterest(value: unknown): value is ServiceInterest {
  return SERVICE_OPTIONS.some((o) => o.value === value);
}
