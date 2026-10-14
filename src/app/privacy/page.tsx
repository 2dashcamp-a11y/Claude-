import type { Metadata } from "next";
import { ContactMethod, LegalPage } from "@/components/LegalPage";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Dash of Digital collects, uses, stores and protects information submitted through this website.",
  alternates: { canonical: "/privacy" },
};

// DRAFT pending professional legal review. Keep in sync with what the code actually collects.
export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        This policy explains how {siteConfig.legalName} (“Dash of Digital,” “we,” “us”) handles information collected
        through this website. We collect only what we need to understand your request and respond to it.
      </p>

      <h2>What we collect</h2>
      <p>When you join the early-access list, we collect the information you enter:</p>
      <ul>
        <li>Your full name, email address, and company or brand name.</li>
        <li>Your primary area of interest.</li>
        <li>
          Optional details you choose to share: website URL, business stage, biggest technology or digital challenge,
          estimated budget range, and timeline.
        </li>
        <li>
          A record of your consent: when you acknowledged this policy, which version you acknowledged, and whether you
          opted in to marketing emails.
        </li>
      </ul>
      <p>
        Please don’t submit passwords, bank or payment information, financial records, or your customers’ personal
        data through this website. We don’t ask for it and don’t want it.
      </p>
      <p>
        When you submit the form, a one-way hashed version of your IP address is kept for up to 24 hours to limit
        repeated submissions and protect against spam. It is not stored with your entry. Our hosting provider may keep
        standard server logs (such as IP address, browser type, and pages requested) for security and reliability.
      </p>
      <p>
        This website does not use advertising or analytics cookies, and fonts are served from our own domain.
      </p>

      <h2>How we use it</h2>
      <ul>
        <li>To review your request, assess whether we’re a good fit, and contact you about it.</li>
        <li>To send a confirmation that we received your request.</li>
        <li>To prepare for and carry out any conversation or engagement you choose to pursue.</li>
        <li>
          To send occasional news and insights — only if you checked the optional marketing box. You can withdraw that
          consent at any time.
        </li>
        <li>To protect the website against abuse.</li>
      </ul>
      <p>We do not sell or rent your personal information, and we do not share it for cross-context advertising.</p>

      <h2>Service providers</h2>
      <p>We use a small number of providers to run this website. They process data on our behalf:</p>
      <ul>
        <li>
          <strong>Hostinger</strong> — hosts the website, stores early-access submissions in a secured database, and
          delivers confirmation and internal notification emails.
        </li>
        <li>
          <strong>Cloudflare Turnstile</strong> — if enabled, checks that submissions come from a person rather than a
          bot.
        </li>
      </ul>
      <p>
        These providers may process data in the United States or other countries where they operate. We may also disclose information if required by law or
        to protect our rights, or as part of a business transfer such as a merger or sale.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep early-access submissions while they are relevant to a potential working relationship. If we haven’t
        started working together, we aim to delete or anonymize a submission within 24 months of our last contact with
        you. If you become a client, we keep information as needed to provide our services and meet legal obligations.
      </p>

      <h2>How we protect it</h2>
      <p>
        Data is encrypted in transit. Submissions are stored in a database that is not publicly readable; access is
        restricted to authorized Dash of Digital personnel through authenticated accounts. Secret keys are kept on the
        server and never sent to your browser. No system is perfectly secure, but we work to protect your information
        and limit what we collect.
      </p>

      <h2>Your choices and rights</h2>
      <p>You can ask us to:</p>
      <ul>
        <li>Tell you what information we hold about you and provide a copy.</li>
        <li>Correct inaccurate information.</li>
        <li>Delete your information.</li>
        <li>Stop sending you marketing emails.</li>
      </ul>
      <p>
        Make a request by contacting us at <ContactMethod />. We may need to verify that the request comes from the
        owner of the email address. Depending on where you live, you may have additional rights under local law, and we
        will honor them as required.
      </p>

      <h2>Children</h2>
      <p>This website is intended for businesses and is not directed to anyone under 18.</p>

      <h2>Changes to this policy</h2>
      <p>
        If we change this policy, we’ll update the date above. Material changes will apply to information collected
        after the change is posted.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy can be sent to <ContactMethod />.
      </p>
    </LegalPage>
  );
}
