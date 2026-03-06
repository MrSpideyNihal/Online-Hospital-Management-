import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Building2, UserPlus, CalendarPlus, Stethoscope, FileText,
  CreditCard, QrCode, BarChart3, Settings, HelpCircle,
  ArrowRight, CheckCircle2, Mail, Shield
} from 'lucide-react'

const hospitalSteps = [
  {
    step: 1,
    icon: UserPlus,
    title: 'Register Your Clinic',
    description: 'Create a hospital account on DentalHub.',
    details: [
      'Go to the Login page and select "Hospital / Clinic".',
      'Sign up with your email and set a password.',
      'Fill in your clinic name, address, phone number, and other details.',
      'Your account will be in "pending" status until the admin approves it.',
      'You will receive a notification once your clinic is approved.',
    ],
  },
  {
    step: 2,
    icon: CreditCard,
    title: 'Complete Payment',
    description: 'Pay the one-time registration fee and start your subscription.',
    details: [
      'A one-time registration fee of ₹8,999 is required to activate your clinic.',
      'After activation, your first-year subscription is just ₹399/month.',
      'From year 2, the standard rate of ₹1,200/month or ₹12,000/year applies.',
      'You get a 14-day free trial — no payment needed to start exploring.',
      'Payment is done via UPI. The admin will verify and approve your payment.',
    ],
  },
  {
    step: 3,
    icon: Building2,
    title: 'Set Up Your Clinic Profile',
    description: 'Configure your clinic\'s public profile and basic settings.',
    details: [
      'Go to Dashboard → Settings to update your clinic information.',
      'Add your clinic logo, description, address, and contact details.',
      'Set your working hours and available services.',
      'Your public profile page will be visible to patients at /hospitals/your-slug.',
      'You can customize your UPI ID for patient billing.',
    ],
  },
  {
    step: 4,
    icon: Stethoscope,
    title: 'Add Doctors & Staff',
    description: 'Register the dentists and staff who work at your clinic.',
    details: [
      'Go to Dashboard → Doctors to add your dental professionals.',
      'Enter each doctor\'s name, specialization, qualification, and contact info.',
      'Doctors will appear in appointment booking and visit records.',
      'You can edit or remove doctors at any time.',
    ],
  },
  {
    step: 5,
    icon: UserPlus,
    title: 'Register Patients',
    description: 'Add your patients to the system for record-keeping.',
    details: [
      'Go to Dashboard → Patients to add new patients.',
      'Enter patient name, age, gender, phone, email, and medical history.',
      'Each patient gets a unique profile with their complete dental history.',
      'Patients can also be added during their first visit or appointment.',
      'You can generate QR code cards for quick patient identification.',
    ],
  },
  {
    step: 6,
    icon: CalendarPlus,
    title: 'Manage Appointments',
    description: 'Schedule and track patient appointments.',
    details: [
      'Go to Dashboard → Appointments to create new appointments.',
      'Select the patient, doctor, date, time, and reason for visit.',
      'Track appointment status: scheduled, completed, or cancelled.',
      'View upcoming and past appointments in one place.',
      'Patients can also book appointments through the public hospital page.',
    ],
  },
  {
    step: 7,
    icon: FileText,
    title: 'Record Visits & Treatments',
    description: 'Document each patient visit with detailed treatment notes.',
    details: [
      'Go to Dashboard → Visits to log patient visits.',
      'Record the diagnosis, treatments performed, and doctor notes.',
      'Use the Dental Chart to mark specific teeth and conditions visually.',
      'Add treatment plans with procedure names and costs.',
      'All visit history is linked to the patient\'s profile.',
    ],
  },
  {
    step: 8,
    icon: CreditCard,
    title: 'Billing & Invoices',
    description: 'Generate bills and track payments for treatments.',
    details: [
      'Go to Dashboard → Billing to create invoices for patients.',
      'Invoices are auto-generated from visit treatments and costs.',
      'Track payment status: paid, unpaid, or partial.',
      'Print receipts directly from the billing page.',
      'View billing history and outstanding balances per patient.',
    ],
  },
  {
    step: 9,
    icon: FileText,
    title: 'Prescriptions',
    description: 'Create and manage digital prescriptions for patients.',
    details: [
      'Go to Dashboard → Prescriptions to write prescriptions.',
      'Add medications with dosage, frequency, and duration.',
      'Link prescriptions to specific visits.',
      'Patients can view their prescriptions in their patient portal.',
      'Print prescriptions for patients to take to the pharmacy.',
    ],
  },
  {
    step: 10,
    icon: QrCode,
    title: 'QR Code Patient Cards',
    description: 'Generate QR codes for quick patient identification.',
    details: [
      'Each patient gets a unique QR code linked to their profile.',
      'Print QR cards for patients to carry.',
      'Scan the QR code to instantly pull up patient records.',
      'QR codes link to a secure patient info page.',
    ],
  },
  {
    step: 11,
    icon: BarChart3,
    title: 'Reports & Analytics',
    description: 'Track your clinic\'s performance with reports.',
    details: [
      'Go to Dashboard → Reports to view clinic analytics.',
      'See patient visit trends, revenue reports, and appointment stats.',
      'Filter reports by date range.',
      'Use insights to improve your clinic\'s operations.',
    ],
  },
  {
    step: 12,
    icon: Settings,
    title: 'Settings & Customization',
    description: 'Configure your clinic preferences and procedure presets.',
    details: [
      'Go to Dashboard → Settings to manage your clinic.',
      'Set up procedure presets with predefined names, costs, and categories.',
      'Procedure presets save time when recording treatments.',
      'Update clinic info, working hours, and contact details anytime.',
    ],
  },
]

const patientSteps = [
  {
    title: 'Find Your Clinic',
    description: 'Search for your dental clinic on the DentalHub homepage or use the direct link provided by your clinic.',
  },
  {
    title: 'Book an Appointment',
    description: 'Select a doctor, choose a date and time, and provide a reason for your visit. You\'ll receive a confirmation.',
  },
  {
    title: 'Visit Your Clinic',
    description: 'Arrive at your appointment. Your clinic will record your visit, diagnosis, and treatments in the system.',
  },
  {
    title: 'Access Your Records',
    description: 'Log in to view your appointment history, dental charts, prescriptions, and billing information anytime.',
  },
]

const faqs = [
  {
    q: 'How do I get started?',
    a: 'Click "Register Your Clinic" on the homepage, sign up, and wait for admin approval. You can explore the 14-day free trial immediately.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes! Every hospital gets a 14-day free trial with full access to all features. No payment required upfront.',
  },
  {
    q: 'Can I cancel my subscription?',
    a: 'Yes, you can cancel anytime. You\'ll retain access until the end of your current billing period. No partial refunds.',
  },
  {
    q: 'Are refunds available?',
    a: 'No. All payments are non-refundable. Please use the full 14-day trial before making any payment. See our Terms of Service for details.',
  },
  {
    q: 'How do patients book appointments?',
    a: 'Patients can book through your clinic\'s public profile page or you can create appointments on their behalf from the dashboard.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. We use encrypted transport (HTTPS), role-based access controls, and secure authentication. Each clinic can only access their own data.',
  },
  {
    q: 'Can I use DentalHub on mobile?',
    a: 'DentalHub is a responsive web application that works on all modern browsers, including mobile devices and tablets.',
  },
  {
    q: 'Will there be future updates?',
    a: 'DentalHub is provided "as is". We do not guarantee future updates or new features. Please read our Privacy Policy for full details.',
  },
]

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/40 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Help Center</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to know about using DentalHub. Follow the step-by-step guides below to get your clinic up and running.
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-16">
          <a href="#hospital-guide" className="rounded-xl border bg-card p-4 text-center hover:border-primary transition-colors">
            <Building2 className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">Hospital Guide</p>
          </a>
          <a href="#patient-guide" className="rounded-xl border bg-card p-4 text-center hover:border-primary transition-colors">
            <UserPlus className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">Patient Guide</p>
          </a>
          <a href="#faq" className="rounded-xl border bg-card p-4 text-center hover:border-primary transition-colors">
            <HelpCircle className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">FAQ</p>
          </a>
          <a href="#contact" className="rounded-xl border bg-card p-4 text-center hover:border-primary transition-colors">
            <Mail className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">Contact Us</p>
          </a>
        </div>

        {/* ======================== HOSPITAL GUIDE ======================== */}
        <section id="hospital-guide" className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Complete Hospital Guide</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A detailed step-by-step walkthrough for clinic owners and staff. Follow these steps to set up and manage your dental clinic on DentalHub.
            </p>
          </div>

          <div className="space-y-6">
            {hospitalSteps.map((item) => {
              const Icon = item.icon
              return (
                <Card key={item.step} className="border-border/60 overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="flex items-center justify-center bg-primary/5 dark:bg-primary/10 px-6 py-4 md:py-0 md:min-w-[100px]">
                      <span className="text-3xl font-extrabold text-primary">{item.step}</span>
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                        <h3 className="text-lg font-bold">{item.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                      <ul className="space-y-2">
                        {item.details.map((detail, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </section>

        {/* ======================== PATIENT GUIDE ======================== */}
        <section id="patient-guide" className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Patient Guide</h2>
            <p className="text-muted-foreground">How patients can use DentalHub to book appointments and access their records.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {patientSteps.map((item, i) => (
              <Card key={i} className="border-border/60">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">{i + 1}</div>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ======================== FAQ ======================== */}
        <section id="faq" className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Common questions about DentalHub.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {faqs.map((item, i) => (
              <Card key={i} className="border-border/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">{item.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ======================== POLICIES ======================== */}
        <section className="mb-20">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight mb-2">Important Policies</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-border/60">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Privacy Policy</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Learn how we collect, use, and protect your data. Includes our no-refund policy and no-guarantee-of-updates policy.</p>
                <Link href="/privacy">
                  <Button variant="outline" size="sm">Read Privacy Policy <ArrowRight className="w-3 h-3 ml-1" /></Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Terms of Service</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Understand your rights and responsibilities. Covers pricing, refund policy, cancellation, and liability.</p>
                <Link href="/terms">
                  <Button variant="outline" size="sm">Read Terms of Service <ArrowRight className="w-3 h-3 ml-1" /></Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ======================== CONTACT ======================== */}
        <section id="contact" className="text-center">
          <Card className="border-primary/20 bg-primary/5 dark:bg-primary/10">
            <CardContent className="p-8">
              <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
              <h2 className="text-2xl font-bold mb-2">Still Need Help?</h2>
              <p className="text-muted-foreground mb-4 max-w-lg mx-auto">
                If you have questions that aren&apos;t answered here, feel free to reach out. We&apos;ll do our best to help.
              </p>
              <a href="mailto:oneforall0311@gmail.com">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  Email Us: oneforall0311@gmail.com <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </CardContent>
          </Card>
        </section>

        <div className="mt-10 flex flex-wrap gap-3 justify-center">
          <Link href="/pricing">
            <Button variant="outline">View Pricing</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
