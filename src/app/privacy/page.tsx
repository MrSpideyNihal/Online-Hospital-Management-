import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground">
          DentalHub collects only the minimum information required to provide appointment booking, patient access,
          and hospital management features.
        </p>
        <p className="text-sm text-muted-foreground">
          We use secure authentication, role-based access controls, and encrypted transport. Hospitals can only access
          their own tenant data based on permissions. Patients can only access their own records.
        </p>
        <p className="text-sm text-muted-foreground">
          For privacy requests or account issues, contact your hospital administrator or support.
        </p>
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
    </main>
  )
}
