/**
 * Seed legal pages
 * ================
 * Creates the Privacy Policy and Terms & Conditions documents in
 * the Box 3 Sanity dataset and patches the Site Settings footer
 * legal links to point at the new /legal/* paths.
 *
 * Idempotent — `createIfNotExists` leaves any editor-authored doc
 * untouched. The footer-link patch only rewrites legacy hrefs
 * (/privacy-policy → /legal/privacy-policy); existing v2 hrefs are
 * left alone.
 *
 * Usage (PowerShell):
 *   $env:SANITY_WRITE_TOKEN="<editor token>"
 *   node ./scripts/seed-legal.mjs
 */

import crypto from "node:crypto";
import { createClient } from "@sanity/client";

const token = process.env.SANITY_WRITE_TOKEN;
if (!token) {
  console.error(
    "Set SANITY_WRITE_TOKEN to a token with editor permissions and re-run.",
  );
  process.exit(1);
}

const client = createClient({
  projectId: "uwutffn5",
  dataset: "production",
  apiVersion: "2024-12-01",
  useCdn: false,
  token,
});

/* ─────────────────────────────────────────────────────────────────
   Brand constants
   ─────────────────────────────────────────────────────────────── */

const COMPANY_NAME = "Box 3 Projects Ltd";
const TRADING_NAME = "Box 3 Projects";
const COMPANY_NUMBER = "00000000"; /* client to update via Studio */
const REGISTERED_ADDRESS = "Level 5, 55 Broadway, London SW1H 0BD";
const CONTACT_EMAIL = "hello@box3projects.co.uk";
const CONTACT_PHONE = "+44 (0)20 8050 7815";
const SITE_DOMAIN = "box3projects.co.uk";
const LAST_UPDATED = "2026-05-07";

/* ─────────────────────────────────────────────────────────────────
   Portable-text builders
   ─────────────────────────────────────────────────────────────── */

const k = () => crypto.randomBytes(6).toString("hex");

function p(text) {
  return {
    _type: "block",
    _key: k(),
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: k(), text, marks: [] }],
  };
}

function h3(text) {
  return {
    _type: "block",
    _key: k(),
    style: "h3",
    markDefs: [],
    children: [{ _type: "span", _key: k(), text, marks: [] }],
  };
}

function bullets(items) {
  return items.map((text) => ({
    _type: "block",
    _key: k(),
    style: "normal",
    markDefs: [],
    listItem: "bullet",
    level: 1,
    children: [{ _type: "span", _key: k(), text, marks: [] }],
  }));
}

function pWithLink(before, linkText, href, after) {
  const linkKey = k();
  return {
    _type: "block",
    _key: k(),
    style: "normal",
    markDefs: [{ _type: "link", _key: linkKey, href }],
    children: [
      { _type: "span", _key: k(), text: before, marks: [] },
      { _type: "span", _key: k(), text: linkText, marks: [linkKey] },
      { _type: "span", _key: k(), text: after, marks: [] },
    ],
  };
}

/* ─────────────────────────────────────────────────────────────────
   Privacy Policy
   ─────────────────────────────────────────────────────────────── */

const privacySections = [
  {
    heading: "Who we are",
    anchor: "who-we-are",
    body: [
      p(
        `${COMPANY_NAME} (trading as ${TRADING_NAME}, "we", "us", "our") is a company registered in England and Wales under company number ${COMPANY_NUMBER}, with its registered office at ${REGISTERED_ADDRESS}.`,
      ),
      p(
        `We are the "data controller" of any personal data we collect about you through our website at https://${SITE_DOMAIN} ("the Site"), through correspondence by email or phone, and in the course of providing our services.`,
      ),
      pWithLink(
        "If you have any questions about this policy or how we handle your data, please contact us at ",
        CONTACT_EMAIL,
        `mailto:${CONTACT_EMAIL}`,
        ".",
      ),
    ],
  },
  {
    heading: "Information we collect",
    anchor: "information-we-collect",
    body: [
      p(
        "We collect personal data that you provide to us directly, that is generated through your use of the Site, and that we receive from third parties such as analytics providers. The categories of personal data we typically process are set out below.",
      ),
      h3("Information you give us"),
      ...bullets([
        "Identity and contact data — your name, company name, job title, email address and phone number, when you complete a contact form, request a callback, or correspond with us.",
        "Project data — details about a project, brief or enquiry that you choose to share with us, including any attachments or supporting documents.",
        "Recruitment data — your CV, employment history and references when you apply for a role with us.",
      ]),
      h3("Information we collect automatically"),
      ...bullets([
        "Technical data — IP address, browser type and version, device type, operating system, referring URL, and pages visited on the Site.",
        "Usage data — how you interact with the Site, including session duration, scroll depth, and which pages or links you engage with.",
        "Cookie data — see the Cookies section below.",
      ]),
      p(
        "We do not knowingly collect any special-category data (such as health, ethnicity, religion, political opinions, biometric or genetic data) through the Site, and we do not collect data from anyone we know to be under 16.",
      ),
    ],
  },
  {
    heading: "How we use your information",
    anchor: "how-we-use-your-information",
    body: [
      p(
        "We use your personal data only where we have a lawful basis to do so under the UK GDPR and the EU GDPR. The principal purposes and lawful bases on which we rely are:",
      ),
      ...bullets([
        "To respond to enquiries, prepare proposals and provide our services to you — necessary for the performance of a contract with you, or to take steps at your request prior to entering into a contract.",
        "To communicate with you about a live project, including updates, scheduling and invoicing — necessary for the performance of our contract with you.",
        "To process job applications and assess your suitability for a role — necessary for taking steps at your request prior to entering into an employment contract, and our legitimate interest in recruiting suitable candidates.",
        "To improve the Site and our services, including by analysing usage and performance — our legitimate interest in operating and improving our business.",
        "To comply with legal, regulatory and tax obligations — necessary to comply with a legal obligation.",
        "To send marketing communications about our work — based on your consent, which you can withdraw at any time.",
      ]),
      p(
        "We will never sell your personal data, and we do not use it for any automated decision-making or profiling that produces legal or similarly significant effects.",
      ),
    ],
  },
  {
    heading: "Cookies and analytics",
    anchor: "cookies",
    body: [
      p(
        "Our Site uses a small number of cookies and similar technologies to make the Site work and to help us understand how visitors use it. We use the following categories:",
      ),
      ...bullets([
        "Strictly necessary cookies — required for the Site to function (for example, to remember your cookie preferences). These are always set.",
        "Analytics cookies — help us measure how visitors interact with the Site so we can improve it. These are only set with your consent.",
      ]),
      p(
        "When you first visit the Site you will be asked to accept or decline non-essential cookies. You can change your choice at any time through your browser settings, or by clearing the cookies set by our domain.",
      ),
    ],
  },
  {
    heading: "Sharing your information",
    anchor: "sharing",
    body: [
      p(
        "We share your personal data only where it is necessary, lawful, and proportionate. The categories of recipients are:",
      ),
      ...bullets([
        "Service providers we engage to operate our business — including hosting (Netlify), content management (Sanity), email delivery, and analytics providers. Each is bound by a written data-processing agreement.",
        "Professional advisers — including our accountants, insurers and lawyers, where the disclosure is necessary for them to provide services to us.",
        "Project partners — where you have engaged us on a project, we may share relevant details with subcontractors, designers, suppliers and other parties strictly to deliver the project.",
        "Authorities and regulators — where we are required to do so by law, or to establish, exercise or defend legal claims.",
      ]),
      p(
        "We do not sell, rent or trade your personal data, and we do not share it for third-party advertising.",
      ),
    ],
  },
  {
    heading: "International transfers",
    anchor: "international-transfers",
    body: [
      p(
        "Some of our service providers are based outside the UK and the European Economic Area. Where personal data is transferred to a country that has not been deemed to provide an adequate level of protection, we put in place appropriate safeguards — typically the UK International Data Transfer Agreement, the UK Addendum to the EU Standard Contractual Clauses, or equivalent measures — to ensure your data continues to be protected.",
      ),
      pWithLink(
        "If you would like a copy of the safeguards we use, please contact us at ",
        CONTACT_EMAIL,
        `mailto:${CONTACT_EMAIL}`,
        ".",
      ),
    ],
  },
  {
    heading: "How long we keep your information",
    anchor: "retention",
    body: [
      p(
        "We retain personal data only for as long as necessary to fulfil the purposes for which it was collected, including any legal, accounting, or reporting requirements. The retention periods we typically apply are:",
      ),
      ...bullets([
        "General enquiries — 24 months from your last contact with us, after which the record is deleted unless you become a client.",
        "Client project records — for the duration of the engagement and for 7 years afterwards, to comply with our tax, contractual and professional-indemnity obligations.",
        "Recruitment data — 12 months from the close of the recruitment round, unless you ask us to keep your details on file.",
        "Analytics data — aggregated and retained for up to 26 months in line with our analytics provider's defaults.",
      ]),
    ],
  },
  {
    heading: "Your rights",
    anchor: "your-rights",
    body: [
      p(
        "Under the UK GDPR and the EU GDPR you have the following rights in relation to your personal data:",
      ),
      ...bullets([
        "Right of access — to ask for a copy of the personal data we hold about you.",
        "Right to rectification — to ask us to correct any data that is inaccurate or incomplete.",
        "Right to erasure — to ask us to delete your data in certain circumstances.",
        "Right to restriction — to ask us to limit how we use your data.",
        "Right to data portability — to ask us to provide your data in a structured, commonly used and machine-readable format.",
        "Right to object — to object to our processing of your data where we rely on a legitimate-interests basis, or to direct marketing.",
        "Right to withdraw consent — where we rely on consent, you can withdraw it at any time without affecting the lawfulness of processing carried out beforehand.",
      ]),
      pWithLink(
        "To exercise any of these rights, please email us at ",
        CONTACT_EMAIL,
        `mailto:${CONTACT_EMAIL}`,
        ". We will respond within one month, and we will not charge a fee unless your request is manifestly unfounded or excessive.",
      ),
      pWithLink(
        "If you are not satisfied with our response you have the right to lodge a complaint with the UK Information Commissioner's Office at ",
        "ico.org.uk",
        "https://ico.org.uk",
        ", or with the supervisory authority in your EU member state of residence.",
      ),
    ],
  },
  {
    heading: "Security",
    anchor: "security",
    body: [
      p(
        "We take the security of your personal data seriously. We use appropriate technical and organisational measures — including encryption in transit, access controls, and staff training — to protect your data against unauthorised access, accidental loss, alteration or disclosure.",
      ),
      p(
        "No method of transmission over the internet is 100% secure. Where we have given you (or where you have chosen) a password, you are responsible for keeping it confidential.",
      ),
    ],
  },
  {
    heading: "Changes to this policy",
    anchor: "changes",
    body: [
      p(
        "We may update this policy from time to time to reflect changes in our practices or in the law. The date at the top of the page shows when it was last updated. Where the changes are significant we will draw them to your attention through the Site or by email.",
      ),
    ],
  },
  {
    heading: "Contact us",
    anchor: "contact",
    body: [
      p(
        "If you have any questions about this policy, or about how we handle your personal data, please contact:",
      ),
      p(
        `${COMPANY_NAME}\n${REGISTERED_ADDRESS}\nEmail: ${CONTACT_EMAIL}\nPhone: ${CONTACT_PHONE}`,
      ),
    ],
  },
];

/* ─────────────────────────────────────────────────────────────────
   Terms & Conditions
   ─────────────────────────────────────────────────────────────── */

const termsSections = [
  {
    heading: "About these terms",
    anchor: "about",
    body: [
      p(
        `These terms ("Terms") govern your use of the website at https://${SITE_DOMAIN} ("the Site"), which is operated by ${COMPANY_NAME} (trading as ${TRADING_NAME}, "we", "us", "our"), a company registered in England and Wales under company number ${COMPANY_NUMBER}, with its registered office at ${REGISTERED_ADDRESS}.`,
      ),
      p(
        "By accessing or using the Site you agree to be bound by these Terms. If you do not agree, please do not use the Site.",
      ),
      p(
        "These Terms apply to your use of the Site only. Any engagement to provide services will be governed by a separate written agreement signed by both parties.",
      ),
    ],
  },
  {
    heading: "Use of the site",
    anchor: "use",
    body: [
      p(
        "You may use the Site for lawful, personal and non-commercial purposes. You agree not to:",
      ),
      ...bullets([
        "Use the Site in any way that breaches any applicable local, national or international law or regulation.",
        "Use the Site in any way that is unlawful or fraudulent, or has any unlawful or fraudulent purpose or effect.",
        "Send, knowingly receive, upload, download, use or re-use any material that does not comply with our content standards.",
        "Transmit any data, send or upload any material that contains viruses, trojan horses, worms, time-bombs, keystroke loggers, spyware or any other harmful programs or similar code.",
        "Attempt to gain unauthorised access to the Site, the server on which it is stored, or any server, computer or database connected to it.",
        "Use any automated system (including scrapers, bots or spiders) to access the Site without our prior written consent.",
      ]),
      p(
        "We reserve the right to suspend or terminate your access to the Site at our discretion, including where we believe you have breached these Terms.",
      ),
    ],
  },
  {
    heading: "Intellectual property",
    anchor: "ip",
    body: [
      p(
        `All intellectual property rights in the Site and in the material published on it (including text, images, graphics, logos, video, audio, code and design) are owned by ${COMPANY_NAME} or our licensors. All such rights are reserved.`,
      ),
      p(
        "You may view, download (for caching purposes only) and print pages from the Site for your own personal, non-commercial use, subject to these Terms.",
      ),
      p("You must not:"),
      ...bullets([
        "Reproduce, copy, republish or commercially exploit material from the Site without our prior written consent.",
        "Modify, adapt or create derivative works from any material on the Site.",
        "Remove any copyright, trade-mark or other proprietary notice from material on the Site.",
        "Use any part of the Site for commercial purposes without obtaining a licence from us.",
      ]),
      p(
        `${TRADING_NAME}, our logo and any associated marks are trade marks of ${COMPANY_NAME}. You may not use them without our prior written permission.`,
      ),
    ],
  },
  {
    heading: "Content and accuracy",
    anchor: "content",
    body: [
      p(
        'We make reasonable efforts to ensure that the information on the Site is accurate and up to date. However, the Site is provided on an "as is" and "as available" basis and we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability or suitability of the information.',
      ),
      p(
        "Project case studies, testimonials and other content are illustrative of our work and should not be relied on as a basis for any decision. Any reliance you place on such information is strictly at your own risk.",
      ),
    ],
  },
  {
    heading: "Third-party links",
    anchor: "third-party-links",
    body: [
      p(
        "The Site may contain links to third-party websites or resources. These links are provided for your convenience only. We have no control over the content of those sites and accept no responsibility for them or for any loss or damage that may arise from your use of them.",
      ),
      p(
        "The inclusion of a link does not imply endorsement by us of the linked site or its operators.",
      ),
    ],
  },
  {
    heading: "Limitation of liability",
    anchor: "liability",
    body: [
      p(
        "Nothing in these Terms excludes or limits our liability for death or personal injury caused by our negligence, for fraud or fraudulent misrepresentation, or for any other liability that cannot be excluded or limited by English law.",
      ),
      p(
        "Subject to the paragraph above, we will not be liable to you, whether in contract, tort (including negligence), breach of statutory duty or otherwise, for any:",
      ),
      ...bullets([
        "Loss of profits, sales, business or revenue.",
        "Loss of business opportunity, goodwill or anticipated savings.",
        "Loss of or damage to data, software or systems.",
        "Indirect, special or consequential loss or damage,",
      ]),
      p(
        "arising out of or in connection with your use of, or inability to use, the Site or any content on it.",
      ),
      p(
        "We do not guarantee that the Site will be secure or free from bugs or viruses, and you are responsible for configuring your information technology, computer programmes and platform to access the Site.",
      ),
    ],
  },
  {
    heading: "Privacy and cookies",
    anchor: "privacy",
    body: [
      pWithLink(
        "Your use of the Site is also governed by our ",
        "Privacy Policy",
        "/legal/privacy-policy",
        ", which explains what personal data we collect, how we use it, and the rights you have in relation to it.",
      ),
      p(
        "By using the Site you confirm that you have read and understood our Privacy Policy.",
      ),
    ],
  },
  {
    heading: "Changes to these terms",
    anchor: "changes",
    body: [
      p(
        "We may revise these Terms at any time by amending this page. You are expected to check this page from time to time to take notice of any changes we make, as they are binding on you. The date at the top of the page shows when the Terms were last updated.",
      ),
    ],
  },
  {
    heading: "Governing law and jurisdiction",
    anchor: "governing-law",
    body: [
      p(
        "These Terms, their subject matter and their formation, are governed by the laws of England and Wales. The courts of England and Wales will have exclusive jurisdiction to settle any dispute or claim arising out of or in connection with them.",
      ),
    ],
  },
  {
    heading: "Contact us",
    anchor: "contact",
    body: [
      p("If you have any questions about these Terms, please contact:"),
      p(
        `${COMPANY_NAME}\n${REGISTERED_ADDRESS}\nEmail: ${CONTACT_EMAIL}\nPhone: ${CONTACT_PHONE}`,
      ),
    ],
  },
];

/* ─────────────────────────────────────────────────────────────────
   Document factory
   ─────────────────────────────────────────────────────────────── */

function buildLegalDoc({ id, slug, title, intro, metaDescription, sections }) {
  return {
    _id: id,
    _type: "legalPage",
    title,
    slug: { _type: "slug", current: slug },
    eyebrow: "Legal",
    lastUpdated: LAST_UPDATED,
    intro,
    tocHeading: "Contents",
    sections: sections.map((s) => ({
      _key: k(),
      _type: "legalSection",
      heading: s.heading,
      anchorId: { _type: "slug", current: s.anchor },
      body: s.body,
    })),
    metaTitle: `${title} — ${TRADING_NAME}`,
    metaDescription,
  };
}

const docs = [
  [
    "Privacy Policy",
    buildLegalDoc({
      id: "legalPage-privacy-policy",
      slug: "privacy-policy",
      title: "Privacy Policy",
      intro:
        "This policy explains what personal information we collect when you visit our website or work with us, how we use it, who we share it with, and the rights you have under UK and EU data-protection law.",
      metaDescription:
        "How Box 3 Projects collects, uses and protects your personal data — written to be plain English, GDPR-aligned, and easy to act on.",
      sections: privacySections,
    }),
  ],
  [
    "Terms & Conditions",
    buildLegalDoc({
      id: "legalPage-terms-and-conditions",
      slug: "terms-and-conditions",
      title: "Terms & Conditions",
      intro:
        "These terms govern your use of our website. They explain what you can and cannot do, what we are responsible for, and the legal framework that applies if anything goes wrong.",
      metaDescription:
        "The terms that apply when you use the Box 3 Projects website — covering acceptable use, intellectual property, liability and governing law.",
      sections: termsSections,
    }),
  ],
];

/* ─────────────────────────────────────────────────────────────────
   Run
   ─────────────────────────────────────────────────────────────── */

console.log("\nSeeding legal pages...");
for (const [label, doc] of docs) {
  await client.createIfNotExists(doc);
  console.log(`  ✓ ${label} (id: ${doc._id})`);
}

/* Patch siteSettings.footerLegal: rewrite legacy /privacy-policy +
   /terms-and-conditions hrefs to the new /legal/* paths. Idempotent —
   a doc that already has the new paths is left alone. */
console.log("\nPatching footer legal links...");
const settings = await client.fetch(
  '*[_id == "siteSettings"][0]{footerLegal}',
);
const links = settings?.footerLegal ?? [];
const remap = {
  "/privacy-policy": "/legal/privacy-policy",
  "/terms-and-conditions": "/legal/terms-and-conditions",
};
const patches = [];
links.forEach((link, idx) => {
  if (link?.href && remap[link.href]) {
    patches.push({ idx, href: remap[link.href] });
  }
});
if (patches.length > 0) {
  const patch = client.patch("siteSettings");
  patches.forEach(({ idx, href }) => {
    patch.set({ [`footerLegal[${idx}].href`]: href });
  });
  await patch.commit();
  console.log(`  ✓ rewrote ${patches.length} footer link(s) → /legal/*`);
} else {
  console.log("  ↷ footer legal links already on /legal/* — nothing to patch");
}

console.log(
  `\nDone. Open the studio at /studio → Pages → Legal Pages to verify.\n` +
    `Re-running this script is safe — existing docs are never overwritten.`,
);
