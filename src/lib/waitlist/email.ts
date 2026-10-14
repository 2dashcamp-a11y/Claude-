import "server-only";
import { siteConfig } from "@/lib/site";
import {
  BUDGET_OPTIONS,
  SERVICE_OPTIONS,
  STAGE_OPTIONS,
  TIMELINE_OPTIONS,
  labelFor,
} from "./options";
import type { WaitlistSubmission } from "./schema";

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
};

export interface Mailer {
  send(message: EmailMessage): Promise<void>;
}

/** Sends through Resend's REST API (https://resend.com/docs/api-reference/emails/send-email). */
export class ResendMailer implements Mailer {
  constructor(
    private readonly apiKey: string,
    private readonly from: string,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async send(message: EmailMessage) {
    const response = await this.fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.from,
        to: [message.to],
        subject: message.subject,
        text: message.text,
        html: message.html,
        ...(message.replyTo ? { reply_to: message.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Resend responded ${response.status}: ${body.slice(0, 300)}`);
    }
  }
}

export type EmailSettings = {
  mailer: Mailer | null;
  founderEmail: string | null;
  sendConfirmation: boolean;
};

export function getEmailSettings(): EmailSettings {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  return {
    mailer: apiKey && from ? new ResendMailer(apiKey, from) : null,
    founderEmail: process.env.FOUNDER_NOTIFICATION_EMAIL?.trim() || null,
    sendConfirmation: process.env.SEND_CONFIRMATION_EMAIL !== "false",
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Strip characters that could break an email subject line. */
function subjectSafe(value: string) {
  return value.replace(/[\r\n]+/g, " ").slice(0, 80);
}

export function founderNotification(entry: WaitlistSubmission, isNew: boolean): Omit<EmailMessage, "to"> {
  const rows: [string, string][] = [
    ["Name", entry.fullName],
    ["Email", entry.email],
    ["Company", entry.companyName],
    ["Website", entry.websiteUrl ?? "—"],
    ["Interest", labelFor(SERVICE_OPTIONS, entry.serviceInterest)],
    ["Stage", labelFor(STAGE_OPTIONS, entry.businessStage)],
    ["Budget", labelFor(BUDGET_OPTIONS, entry.budgetRange)],
    ["Timeline", labelFor(TIMELINE_OPTIONS, entry.timeline)],
    ["Marketing consent", entry.marketingConsent ? "Yes" : "No"],
    ["Biggest challenge", entry.biggestChallenge ?? "—"],
  ];
  const heading = isNew
    ? "New early-access request"
    : "Repeat submission for an existing entry (original details were kept)";

  return {
    subject: `${isNew ? "New lead" : "Repeat submission"}: ${subjectSafe(entry.companyName)} — ${labelFor(SERVICE_OPTIONS, entry.serviceInterest)}`,
    replyTo: entry.email,
    text: `${heading}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nView and update this lead in Supabase → Table Editor → waitlist_entries.`,
    html: `<div style="font-family:Arial,sans-serif;color:#0B0B0D;max-width:600px">
<p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#6F3FC5;margin:0 0 8px">Dash of Digital · Waitlist</p>
<h1 style="font-size:20px;margin:0 0 16px">${escapeHtml(heading)}</h1>
<table cellpadding="8" style="border-collapse:collapse;width:100%;font-size:14px">
${rows
  .map(
    ([k, v]) =>
      `<tr><td style="border-top:1px solid #e5ded2;color:#555;width:160px;vertical-align:top">${escapeHtml(k)}</td><td style="border-top:1px solid #e5ded2;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`,
  )
  .join("\n")}
</table>
<p style="font-size:13px;color:#555;margin-top:16px">View and update this lead in Supabase → Table Editor → waitlist_entries.</p>
</div>`,
  };
}

export function visitorConfirmation(entry: WaitlistSubmission): Omit<EmailMessage, "to"> {
  const firstName = entry.fullName.split(/\s+/)[0] ?? entry.fullName;
  const contact = siteConfig.contactEmail;
  const lines = [
    `Hi ${firstName},`,
    "",
    "Thanks for joining the Dash of Digital early-access list. We’ve received your details and will review them.",
    "",
    "We’re opening a limited number of early client opportunities, and we’ll be in touch when the right one opens up.",
    "",
    contact
      ? `If you have questions in the meantime, you can reach us at ${contact}.`
      : "If you have questions in the meantime, just reply to this email.",
    "",
    "— Dash of Digital",
    "",
    `You’re receiving this because this address was submitted at ${siteConfig.url}. If that wasn’t you, you can ignore this message${contact ? ` or ask us to delete it at ${contact}` : ""}.`,
  ];
  return {
    subject: "You’re on the Dash of Digital early-access list",
    replyTo: contact ?? undefined,
    text: lines.join("\n"),
    html: `<div style="font-family:Arial,sans-serif;color:#0B0B0D;max-width:560px;line-height:1.6">
<p style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;font-weight:bold;margin:0 0 24px">Dash of Digital</p>
${lines
  .slice(0, -2)
  .filter((l) => l !== "")
  .map((l) => `<p style="margin:0 0 16px">${escapeHtml(l)}</p>`)
  .join("\n")}
<p style="font-size:12px;color:#666;border-top:1px solid #e5ded2;padding-top:16px;margin-top:24px">${escapeHtml(lines[lines.length - 1])}</p>
</div>`,
  };
}
