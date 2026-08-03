import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Eleventh Hour Cleaning',
  description: 'Review Eleventh Hour Cleaning\'s service terms, cancellation policy, and client commitments for residential and commercial cleaning services.',
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

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-6">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

export default function TermsPage() {
  return (
    <div className="py-16 lg:py-20">
      <div className="mx-auto max-w-3xl px-6">
        <p className="eyebrow">Legal</p>
        <h1 className="mt-4">Terms of service</h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft">
          By booking with us, you agree to transparent pricing, fair use of services, and respectful
          communication between our team and clients.
        </p>

        <div aria-hidden="true" className="tick-rule my-10" />

        <Section title="1. Service agreement">
          <p>
            By booking our services, you agree to these terms and conditions. Eleventh Hour Cleaning
            provides professional cleaning and maintenance services for residential and commercial
            properties in Greater London and surrounding areas.
          </p>
        </Section>

        <Section title="2. Booking and payment">
          <List
            items={[
              'All bookings must be made through our website or by contacting our customer service team',
              'Payment is required at the time of booking via our secure payment system',
              'Prices quoted are estimates and may vary based on the actual scope of work required',
              'We accept major credit cards and debit cards through our Stripe payment gateway',
            ]}
          />
        </Section>

        <Section title="3. Cancellation policy">
          <p>
            Cancellations must be made at least 24 hours before the scheduled service time for a full
            refund. Cancellations made less than 24 hours before the scheduled time may incur a
            cancellation fee of up to 50% of the booking total.
          </p>
        </Section>

        <Section title="4. Service delivery">
          <List
            items={[
              'We will make every effort to arrive within the specified time window',
              'Estimated service duration is approximate and may vary based on property condition',
              'Access to the property must be provided at the scheduled time',
              'All our staff are fully insured, trained, and DBS-checked',
            ]}
          />
        </Section>

        <Section title="5. Customer responsibilities">
          <List
            items={[
              'Ensure safe and clear access to all areas requiring service',
              'Secure or remove valuable and fragile items before service',
              'Provide accurate information about property size and service requirements',
              'Notify us of any special requirements, hazards, or access restrictions',
            ]}
          />
        </Section>

        <Section title="6. Satisfaction guarantee">
          <p>
            We offer a 100% satisfaction guarantee. If you are not completely satisfied with our
            service, please contact us within 24 hours of service completion, and we will arrange to
            rectify any issues at no additional cost.
          </p>
        </Section>

        <Section title="7. Liability">
          <p>
            Eleventh Hour carries full public liability insurance. We will take reasonable care to
            avoid damage to your property. In the unlikely event of damage, please notify us
            immediately. Our liability is limited to the cost of the service provided or the
            repair/replacement cost of damaged items, whichever is lower.
          </p>
        </Section>

        <Section title="8. Data protection">
          <p>
            We collect and process personal data in accordance with UK GDPR and Data Protection Act
            2018. Your information is used solely for service delivery and will not be shared with
            third parties except as required for payment processing or legal compliance.
          </p>
        </Section>

        <Section title="9. Changes to terms">
          <p>
            We reserve the right to modify these terms at any time. Changes will be posted on our
            website and apply to all bookings made after the date of modification.
          </p>
        </Section>

        <Section title="10. Contact information">
          <p>For questions about these terms or our services, please contact us:</p>
          <ul className="space-y-2">
            <li><strong className="text-ink">Email:</strong> <a href="mailto:hello@eleventhhourcleaning.co.uk" className="text-accent hover:text-accent-dark">hello@eleventhhourcleaning.co.uk</a></li>
            <li><strong className="text-ink">Landline:</strong> <a href="tel:+442033551526" className="text-accent hover:text-accent-dark">020 3355 1526</a></li>
            <li><strong className="text-ink">WhatsApp:</strong> <a href="https://wa.me/447400760630" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-dark">07400 760630</a></li>
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
