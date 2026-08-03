import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Eleventh Hour Cleaning',
  description: 'Learn how Eleventh Hour Cleaning protects your personal data and ensures full transparency in our services and communications.',
}

const LAST_UPDATED = '3 August 2026'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl">{title}</h2>
      <div className="mt-3 space-y-4 leading-relaxed text-ink-soft">{children}</div>
    </section>
  )
}

function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc space-y-2 pl-6">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  )
}

export default function PrivacyPage() {
  return (
    <div className="py-16 lg:py-20">
      <div className="mx-auto max-w-3xl px-6">
        <p className="eyebrow">Legal</p>
        <h1 className="mt-4">Privacy policy</h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft">
          Your privacy matters. We collect only what&rsquo;s necessary to process bookings, improve
          services, and communicate with you — never sharing your data with third parties.
        </p>

        <div aria-hidden="true" className="tick-rule my-10" />

        <Section title="1. Introduction">
          <p>
            Eleventh Hour Cleaning (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;) is committed to protecting your
            personal information and your right to privacy. This Privacy Policy explains how we
            collect, use, disclose, and safeguard your information when you use our website and
            services.
          </p>
        </Section>

        <Section title="2. Information we collect">
          <p>We collect personal information that you voluntarily provide to us when you:</p>
          <List
            items={[
              'Book a service through our website',
              'Contact us via phone, email, or contact form',
              'Subscribe to our newsletter or marketing communications',
              'Create an account or register for our services',
            ]}
          />
          <p>The personal information we collect may include:</p>
          <List
            items={[
              'Name and contact details (email, phone number, address)',
              'Booking details and service preferences',
              'Payment information (processed securely through Stripe)',
              'Communication history with us',
            ]}
          />
        </Section>

        <Section title="3. How we use your information">
          <p>We use the information we collect for the following purposes:</p>
          <List
            items={[
              'To provide and deliver our cleaning and maintenance services',
              'To process bookings and payments securely',
              'To communicate with you about your bookings and our services',
              'To respond to your inquiries and provide customer support',
              'To send you service updates, promotional materials, and newsletters (with your consent)',
              'To improve our services and develop new offerings',
              'To comply with legal obligations and protect our legal rights',
            ]}
          />
        </Section>

        <Section title="4. Data sharing and disclosure">
          <p>
            We do not sell, rent, or trade your personal information to third parties. We may share
            your information only in the following circumstances:
          </p>
          <List
            items={[
              <><strong className="text-ink">Service providers:</strong> We share information with trusted third-party service providers who assist us in operating our website, processing payments (Stripe), and delivering services (e.g., email service providers)</>,
              <><strong className="text-ink">Legal requirements:</strong> We may disclose your information if required by law or in response to valid legal requests</>,
              <><strong className="text-ink">Business transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new entity</>,
            ]}
          />
        </Section>

        <Section title="5. Data security">
          <p>
            We implement appropriate technical and organizational security measures to protect your
            personal information against unauthorized access, alteration, disclosure, or destruction.
            These measures include:
          </p>
          <List
            items={[
              'Secure SSL encryption for data transmission',
              'Secure payment processing through Stripe',
              'Regular security assessments and updates',
              'Restricted access to personal data by authorized personnel only',
            ]}
          />
          <p>
            However, no method of transmission over the internet or electronic storage is 100% secure.
            While we strive to protect your personal information, we cannot guarantee its absolute
            security.
          </p>
        </Section>

        <Section title="6. Data retention">
          <p>
            We retain your personal information for as long as necessary to fulfill the purposes
            outlined in this Privacy Policy, unless a longer retention period is required or permitted
            by law. When we no longer need your information, we will securely delete or anonymize it.
          </p>
        </Section>

        <Section title="7. Your rights">
          <p>
            Under UK GDPR and Data Protection Act 2018, you have the following rights regarding your
            personal data:
          </p>
          <List
            items={[
              <><strong className="text-ink">Right of access:</strong> You can request a copy of the personal information we hold about you</>,
              <><strong className="text-ink">Right to rectification:</strong> You can request correction of inaccurate or incomplete information</>,
              <><strong className="text-ink">Right to erasure:</strong> You can request deletion of your personal data in certain circumstances</>,
              <><strong className="text-ink">Right to restrict processing:</strong> You can request that we limit how we use your data</>,
              <><strong className="text-ink">Right to data portability:</strong> You can request a copy of your data in a machine-readable format</>,
              <><strong className="text-ink">Right to object:</strong> You can object to certain types of processing, including direct marketing</>,
              <><strong className="text-ink">Right to withdraw consent:</strong> You can withdraw your consent at any time where we rely on consent to process your data</>,
            ]}
          />
          <p>To exercise any of these rights, please contact us using the contact information below.</p>
        </Section>

        <Section title="8. Cookies and tracking technologies">
          <p>
            We use cookies and similar tracking technologies to enhance your experience on our
            website. Cookies are small text files stored on your device that help us:
          </p>
          <List
            items={[
              'Remember your preferences and settings',
              'Understand how you use our website',
              'Improve website performance and functionality',
            ]}
          />
          <p>
            You can control cookies through your browser settings. However, disabling cookies may
            affect your ability to use certain features of our website.
          </p>
        </Section>

        <Section title="9. Third-party links">
          <p>
            Our website may contain links to third-party websites. We are not responsible for the
            privacy practices or content of these external sites. We encourage you to review the
            privacy policies of any third-party websites you visit.
          </p>
        </Section>

        <Section title="10. Children's privacy">
          <p>
            Our services are not directed to individuals under the age of 18. We do not knowingly
            collect personal information from children. If you believe we have collected information
            from a child, please contact us immediately.
          </p>
        </Section>

        <Section title="11. Changes to this privacy policy">
          <p>
            We may update this Privacy Policy from time to time to reflect changes in our practices or
            legal requirements. We will notify you of any significant changes by posting the updated
            policy on our website with a new &ldquo;Last updated&rdquo; date. We encourage you to review this
            policy periodically.
          </p>
        </Section>

        <Section title="12. Contact us">
          <p>
            If you have any questions, concerns, or requests regarding this Privacy Policy or how we
            handle your personal information, please contact us:
          </p>
          <ul className="space-y-2">
            <li><strong className="text-ink">Email:</strong> <a href="mailto:hello@eleventhhourcleaning.co.uk" className="text-accent hover:text-accent-dark">hello@eleventhhourcleaning.co.uk</a></li>
            <li><strong className="text-ink">Phone:</strong> <a href="tel:+442033551526" className="text-accent hover:text-accent-dark">020 3355 1526</a></li>
            <li><strong className="text-ink">Address:</strong> Greater London &amp; Surrounding Areas</li>
          </ul>
        </Section>

        <div className="mt-12 border-t border-line pt-6">
          <p className="text-sm text-ink-faint">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>
    </div>
  )
}
