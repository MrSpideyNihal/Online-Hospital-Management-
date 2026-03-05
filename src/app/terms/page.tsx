import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
        <p className="text-muted-foreground">
          By using DentalHub, you agree to use the platform responsibly and provide accurate account information.
        </p>
        <p className="text-sm text-muted-foreground">
          Hospitals are responsible for clinical decisions, patient communication, and compliance with local regulations.
          Patients are responsible for providing correct booking details and arriving on time.
        </p>
        <p className="text-sm text-muted-foreground">
          Misuse of the system, unauthorized data access, or fraudulent activity may result in account suspension.
        </p>
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
    </main>
  )
}
