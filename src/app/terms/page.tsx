import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 2026</p>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
          {/* 1 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
            <p>By creating an account or using DentalHub, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, do not use the platform.</p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Service Description</h2>
            <p>DentalHub is a dental clinic management platform that provides patient records, appointment scheduling, billing, dental charting, prescriptions, and related features. The platform is intended for use by dental clinics and their patients.</p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Account Responsibilities</h2>
            <ul className="list-disc ml-5 space-y-1">
              <li><strong>Hospitals</strong> are responsible for the accuracy of clinic information, clinical decisions, patient communication, data entry, and compliance with all applicable local laws and healthcare regulations.</li>
              <li><strong>Patients</strong> are responsible for providing correct personal and booking details.</li>
              <li>You are responsible for maintaining the security of your account credentials.</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Pricing &amp; Payments</h2>
            <ul className="list-disc ml-5 space-y-1">
              <li>A one-time <strong>registration fee of ₹8,999</strong> is required to activate a hospital account.</li>
              <li>After registration, the first-year subscription rate is <strong>₹399/month</strong>.</li>
              <li>From the second year onwards, the standard rate of <strong>₹1,200/month</strong> or <strong>₹12,000/year</strong> applies.</li>
              <li>A <strong>14-day free trial</strong> is provided. No payment is required during the trial period.</li>
              <li>Prices may change in the future. Any changes will be communicated before your next billing cycle.</li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. No Obligation to Purchase</h2>
            <p>DentalHub does <strong>not</strong> force or pressure anyone to purchase or subscribe. You are provided a 14-day free trial to evaluate the platform. All purchases are made entirely at your own discretion and free will. We encourage you to fully explore the trial before making any payment.</p>
          </section>

          {/* 6 */}
          <section className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 p-4">
            <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">6. No Refund Policy</h2>
            <p className="text-red-700 dark:text-red-400"><strong>All payments are final and non-refundable.</strong> This includes the one-time registration fee and all subscription charges.</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>No refunds for change of mind, dissatisfaction, or unused subscription time.</li>
              <li>No refunds if you choose to stop using the platform.</li>
              <li>No refunds for technical issues or downtime.</li>
            </ul>
            <p className="mt-2"><strong>Exception:</strong> Accidental duplicate payments or billing errors caused by the platform may be reviewed on a case-by-case basis at our sole discretion.</p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Cancellation</h2>
            <p>You may cancel your subscription at any time. Upon cancellation, you retain access until the end of your current billing period. No further charges will be applied. No partial refunds will be issued for the remaining period.</p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. No Guaranteed Updates or Support</h2>
            <p>DentalHub is provided on an <strong>&ldquo;as is&rdquo; and &ldquo;as available&rdquo;</strong> basis.</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>We do <strong>not</strong> promise, guarantee, or commit to any future updates, features, bug fixes, or improvements.</li>
              <li>We do <strong>not</strong> guarantee ongoing customer support or technical assistance.</li>
              <li>The service may be modified, suspended, or discontinued at any time without notice.</li>
            </ul>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">9. Limitation of Liability</h2>
            <p>DentalHub is a management tool and is <strong>not</strong> a substitute for professional medical judgment. We are not responsible for clinical decisions, misdiagnoses, data entry errors by clinic staff, or any consequences arising from the use of this platform. Use DentalHub at your own risk.</p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">10. Prohibited Activities</h2>
            <ul className="list-disc ml-5 space-y-1">
              <li>Misuse of the system or unauthorized access to other users&apos; data.</li>
              <li>Uploading malicious content or attempting to compromise platform security.</li>
              <li>Using the platform for fraudulent or illegal activities.</li>
              <li>Creating fake hospital or patient accounts.</li>
            </ul>
            <p className="mt-2">Violation of these terms may result in immediate account suspension or termination without refund.</p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">11. Changes to Terms</h2>
            <p>We reserve the right to update these Terms of Service at any time. Changes will be posted on this page. Continued use of DentalHub after changes constitutes acceptance of the updated terms.</p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">12. Contact</h2>
            <p>For questions about these terms, contact us at: <a href="mailto:oneforall0311@gmail.com" className="text-primary hover:underline font-medium">oneforall0311@gmail.com</a></p>
          </section>
        </div>

        <div className="mt-10 flex gap-3">
          <Link href="/privacy">
            <Button variant="outline">Read Privacy Policy</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
