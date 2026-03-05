import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const faqs = [
  {
    q: 'How do I book an appointment?',
    a: 'Search a hospital, open its page, and click Book Appointment. After login you can choose doctor/date/time and confirm.',
  },
  {
    q: 'Can hospitals manage multiple staff?',
    a: 'Yes. Hospital admins can manage doctors and receptionist workflows from the dashboard.',
  },
  {
    q: 'What if my appointment time is unavailable?',
    a: 'The system blocks conflicting doctor slots. Please choose another available time.',
  },
]

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-center">Help Center</h1>
        <p className="text-muted-foreground text-center mt-2 mb-10">Quick answers for patients and hospitals.</p>

        <div className="space-y-4">
          {faqs.map((item) => (
            <Card key={item.q} className="border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">{item.q}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
