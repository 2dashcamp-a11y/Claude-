import type { Metadata } from "next";
import Link from "next/link";
import { ContactMethod, LegalPage } from "@/components/LegalPage";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms governing use of the Dash of Digital website.",
  alternates: { canonical: "/terms" },
};

// DRAFT pending professional legal review.
export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use">
      <p>
        These terms govern your use of this website, operated by {siteConfig.legalName} (“Dash of Digital,” “we,” “us”).
        By using the website, you agree to them. If you don’t agree, please don’t use the site.
      </p>

      <h2>Information only</h2>
      <p>
        Content on this website describes our services and is provided for general information. It is not legal,
        tax, accounting, financial, or other professional advice, and you shouldn’t rely on it as such. Service
        descriptions and starting prices are indicative; final scope, pricing, and terms are set only in a written
        agreement signed by both parties.
      </p>

      <h2>Early-access list</h2>
      <p>
        Joining the early-access list lets us know you’re interested. It does not create a client relationship,
        reserve capacity, or guarantee that we will offer or provide services. We may decline or not respond to any
        request at our discretion. How we handle the information you submit is described in our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
      <p>You agree to provide accurate information and not to submit anyone else’s details without permission.</p>

      <h2>No guarantees</h2>
      <p>
        We don’t promise any particular business, revenue, technical, or performance outcome from our services or
        from using this website. Any future engagement will be governed by its own agreement.
      </p>

      <h2>Third-party names and links</h2>
      <p>
        References to third-party products such as BILL, QuickBooks, NetSuite, Sage Intacct, or Xero are for
        identification only. Those names are trademarks of their respective owners. Dash of Digital is independent and
        is not affiliated with, endorsed by, sponsored by, or a certified partner of those companies unless we
        expressly say otherwise. Links to other websites are provided for convenience; we aren’t responsible for their
        content or practices.
      </p>

      <h2>Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the website in violation of any law.</li>
        <li>Submit spam, automated, or fraudulent requests, or attempt to overload or disrupt the site.</li>
        <li>Attempt to access data, systems, or accounts you aren’t authorized to access.</li>
        <li>Copy or reuse the site’s design or content for commercial purposes without permission.</li>
      </ul>

      <h2>Intellectual property</h2>
      <p>
        The website’s content, design, text, and graphics belong to Dash of Digital or its licensors and are protected
        by intellectual property laws. You may view and share links to the site for personal or internal business
        purposes.
      </p>

      <h2>Disclaimer and limitation of liability</h2>
      <p>
        The website is provided “as is” and “as available,” without warranties of any kind, to the fullest extent
        permitted by law. To the fullest extent permitted by law, Dash of Digital will not be liable for any indirect,
        incidental, special, consequential, or punitive damages, or any loss of profits, revenue, or data, arising from
        your use of the website.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of the state in which {siteConfig.legalName} is organized, and applicable
        U.S. federal law, without regard to conflict-of-law rules.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms from time to time. The date above shows when they last changed. Continued use of the
        website after changes are posted means you accept them.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms can be sent to <ContactMethod />.
      </p>
    </LegalPage>
  );
}
