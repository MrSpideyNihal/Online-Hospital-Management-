import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const plans = [
  {
    name: 'Starter',
    price: 'Free Trial',
    points: ['Public hospital profile', 'Basic appointments', 'Patient records'],
  },
  {
    name: 'Growth',
    price: 'Contact Sales',
    points: ['Multi-user dashboard', 'Billing and reports', 'Priority support'],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    points: ['Advanced workflows', 'Custom onboarding', 'Dedicated success manager'],
  },
]

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight">Pricing</h1>
          <p className="text-muted-foreground mt-2">Flexible plans for every clinic and hospital size.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.name} className="border-border/60">
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{plan.price}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {plan.points.map((point) => (
                  <div key={point} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{point}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3 justify-center">
          <Link href="/login?type=hospital">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              Register Hospital <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
