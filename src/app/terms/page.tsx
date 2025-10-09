import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms and Services | EleventhHour',
  description: 'Terms and conditions for EleventhHour professional cleaning services',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms and Services</h1>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Service Agreement</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By booking our services, you agree to these terms and conditions. EleventhHour provides professional
                cleaning and maintenance services for residential and commercial properties in Greater London and
                surrounding areas.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Booking and Payment</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>All bookings must be made through our website or by contacting our customer service team</li>
                <li>Payment is required at the time of booking via our secure payment system</li>
                <li>Prices quoted are estimates and may vary based on the actual scope of work required</li>
                <li>We accept major credit cards and debit cards through our Stripe payment gateway</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Cancellation Policy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Cancellations must be made at least 24 hours before the scheduled service time for a full refund.
                Cancellations made less than 24 hours before the scheduled time may incur a cancellation fee of up to 50%
                of the booking total.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Service Delivery</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>We will make every effort to arrive within the specified time window</li>
                <li>Estimated service duration is approximate and may vary based on property condition</li>
                <li>Access to the property must be provided at the scheduled time</li>
                <li>All our staff are fully insured, trained, and DBS-checked</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Customer Responsibilities</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Ensure safe and clear access to all areas requiring service</li>
                <li>Secure or remove valuable and fragile items before service</li>
                <li>Provide accurate information about property size and service requirements</li>
                <li>Notify us of any special requirements, hazards, or access restrictions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Satisfaction Guarantee</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We offer a 100% satisfaction guarantee. If you are not completely satisfied with our service, please
                contact us within 24 hours of service completion, and we will arrange to rectify any issues at no
                additional cost.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Liability</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                EleventhHour carries full public liability insurance. We will take reasonable care to avoid damage to
                your property. In the unlikely event of damage, please notify us immediately. Our liability is limited
                to the cost of the service provided or the repair/replacement cost of damaged items, whichever is lower.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Data Protection</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We collect and process personal data in accordance with UK GDPR and Data Protection Act 2018. Your
                information is used solely for service delivery and will not be shared with third parties except as
                required for payment processing or legal compliance.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We reserve the right to modify these terms at any time. Changes will be posted on our website and apply
                to all bookings made after the date of modification.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                For questions about these terms or our services, please contact us:
              </p>
              <ul className="list-none space-y-2 text-gray-700">
                <li><strong>Email:</strong> hello@eleventhhour.co.uk</li>
                <li><strong>Phone:</strong> 020 8000 0000</li>
                <li><strong>Address:</strong> Greater London & Surrounding Areas</li>
              </ul>
            </section>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Last updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
