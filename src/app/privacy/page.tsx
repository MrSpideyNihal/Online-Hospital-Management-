import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 2026</p>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
          {/* 1 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Information We Collect</h2>
            <p>DentalHub collects only the minimum information required to provide its services:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li><strong>Hospital accounts:</strong> Clinic name, owner name, email, phone number, UPI ID (for payment verification), and clinic-related data such as doctors, patients, appointments, treatments, and billing records.</li>
              <li><strong>Patient accounts:</strong> Name, email, phone number (if provided by the hospital), appointment history, dental charts, prescriptions, and visit records.</li>
              <li><strong>Authentication data:</strong> We use Supabase authentication. Passwords are never stored in plain text.</li>
            </ul>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. How We Use Your Data</h2>
            <ul className="list-disc ml-5 space-y-1">
              <li>To provide hospital management, appointment booking, billing, and patient record features.</li>
              <li>To send system notifications (subscription reminders, payment requests, admin communications).</li>
              <li>To display your public hospital profile page if you choose to enable one.</li>
            </ul>
            <p className="mt-2">We do <strong>not</strong> sell, rent, or share your data with any third parties for marketing or advertising purposes.</p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Data Security</h2>
            <p>We use secure authentication, role-based access controls, and encrypted transport (HTTPS). Hospitals can only access their own tenant data. Patients can only access their own records. However, no system is 100% secure, and we cannot guarantee absolute security of your data.</p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Data Retention &amp; Deletion</h2>
            <p>Your data is retained as long as your account is active. If you wish to delete your account or data, contact your hospital administrator or reach out to us. We will process deletion requests in a reasonable timeframe.</p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. No Guaranteed Updates or Support</h2>
            <p className="font-medium text-foreground">DentalHub is provided &ldquo;as is&rdquo;.</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>We do <strong>not</strong> guarantee any future updates, new features, bug fixes, or improvements.</li>
              <li>We do <strong>not</strong> guarantee ongoing technical support or customer service.</li>
              <li>The platform may change, be updated, or be discontinued at any time without prior notice.</li>
            </ul>
            <p className="mt-2">By using DentalHub, you acknowledge and accept this.</p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. No Obligation to Purchase</h2>
            <p>We are <strong>not</strong> forcing anyone to buy or subscribe to our services. DentalHub offers a <strong>14-day free trial</strong> so you can evaluate the platform fully before making any payment. You are free to stop using the platform at any time. All purchases are made voluntarily.</p>
          </section>

          {/* 7 */}
          <section className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 p-4">
            <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">7. No Refund Policy</h2>
            <p className="text-red-700 dark:text-red-400"><strong>All payments — including the one-time registration fee and subscription charges — are strictly non-refundable.</strong></p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Once a payment has been processed, no refunds will be issued under any circumstances.</li>
              <li>This includes, but is not limited to: change of mind, dissatisfaction with features, technical issues, or discontinuation of use.</li>
              <li>We strongly encourage you to use the full 14-day free trial and evaluate the platform thoroughly before making any payment.</li>
            </ul>
            <p className="mt-2"><strong>Exception:</strong> In rare cases of accidental duplicate payments or billing errors caused on our end, you may contact us for review. Refunds in such cases are at our sole discretion.</p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Cancellation</h2>
            <p>You may cancel your subscription at any time. Upon cancellation:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>You will continue to have access until the end of your current billing period.</li>
              <li>No further charges will be made after cancellation.</li>
              <li>No partial refunds will be issued for unused time in the current billing period.</li>
            </ul>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">9. Cookies &amp; Analytics</h2>
            <p>DentalHub may use essential cookies for authentication and session management. We do not use third-party tracking or advertising cookies.</p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy at any time. Changes will be reflected on this page with an updated date. Continued use of DentalHub after changes constitutes acceptance of the revised policy.</p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">11. Contact</h2>
            <p>For privacy requests, account issues, or questions about this policy, contact us at: <a href="mailto:oneforall0311@gmail.com" className="text-primary hover:underline font-medium">oneforall0311@gmail.com</a></p>
          </section>
        </div>

        <div className="mt-10 flex gap-3">
          <Link href="/terms">
            <Button variant="outline">Read Terms of Service</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
