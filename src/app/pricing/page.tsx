import Link from 'next/link'
import { CheckCircle2, ArrowRight, Sparkles, Clock, Star, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const features = [
  'Public hospital profile & website',
  'Patient records & dental charts',
  'Appointments & visit management',
  'Treatment planning & tracking',
  'Billing, invoices & print receipts',
  'Prescription management',
  'Doctor & staff management',
  'Reports & analytics',
  'QR code patient cards',
  'Procedure presets per clinic',
]

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/40 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 text-xs font-semibold tracking-wider uppercase px-3 py-1">
            Simple, transparent pricing
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            One plan. Everything included.
          </h1>
          <p className="text-muted-foreground mt-3 text-lg max-w-2xl mx-auto">
            Complete dental clinic management — from patient records to treatment billing. Start with a 14-day free trial, no credit card required.
          </p>
        </div>

        {/* Trial Banner */}
        <div className="rounded-2xl border border-cyan-200 dark:border-cyan-800 bg-cyan-50/60 dark:bg-cyan-950/30 p-6 text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-cyan-700 dark:text-cyan-300" />
            <p className="font-bold text-lg text-cyan-800 dark:text-cyan-200">14-Day Free Trial</p>
          </div>
          <p className="text-sm text-cyan-700 dark:text-cyan-400">
            Try everything free for 14 days. No payment needed upfront. Set up your clinic and start managing patients today.
          </p>
        </div>

        {/* One-Time Registration Fee */}
        <Card className="border-2 border-amber-300 dark:border-amber-700 relative overflow-hidden mb-10">
          <div className="absolute top-0 right-0 bg-amber-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
            Required
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6 p-6">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-amber-600" />
              <div>
                <h3 className="text-lg font-bold">One-Time Registration Fee</h3>
                <p className="text-sm text-muted-foreground">A one-time setup fee to activate your clinic on DentalHub. Pay once, then choose a subscription plan below.</p>
              </div>
            </div>
            <div className="flex items-baseline gap-1 shrink-0">
              <span className="text-4xl font-extrabold text-amber-600">₹8,999</span>
              <span className="text-muted-foreground text-sm">one-time</span>
            </div>
          </div>
        </Card>

        {/* Subscription Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {/* Introductory Offer */}
          <Card className="border-2 border-emerald-300 dark:border-emerald-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
              Best Value
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <CardTitle className="text-lg">First Year Offer</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">Introductory pricing for new clinics</p>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-emerald-600">₹400</span>
                  <span className="text-muted-foreground text-sm">/month</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">₹4,800 for the first year · Save ₹9,600</p>
              </div>
              <Link href="/login?type=hospital">
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                  Start Free Trial <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Monthly */}
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Monthly</CardTitle>
              <p className="text-sm text-muted-foreground">Pay as you go, cancel anytime</p>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">₹1,200</span>
                  <span className="text-muted-foreground text-sm">/month</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">₹14,400/year · Flexible billing</p>
              </div>
              <Link href="/login?type=hospital">
                <Button variant="outline" className="w-full">
                  Start Free Trial <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Annual */}
          <Card className="border-border/60 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
              Save ₹2,400
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-lg">Annual</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">Best for established clinics</p>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-blue-600">₹16,000</span>
                  <span className="text-muted-foreground text-sm">/year</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">~₹1,333/month · Pay once, use all year</p>
              </div>
              <Link href="/login?type=hospital">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  Start Free Trial <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features list */}
        <Card className="border-border/50 mb-10">
          <CardHeader>
            <CardTitle className="text-base">Everything included in every plan</CardTitle>
            <p className="text-sm text-muted-foreground">No hidden fees. No feature lock-outs. Full access from day one.</p>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FAQ / Note */}
        <div className="rounded-xl border p-6 bg-muted/30 text-center">
          <p className="font-semibold mb-1">How does the introductory offer work?</p>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            New clinics pay just ₹400/month for the entire first year. After year one, your plan continues at the standard monthly rate of ₹1,200/month — or switch to the annual plan at ₹16,000/year for additional savings. You can cancel anytime.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3 justify-center">
          <Link href="/login?type=hospital">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              Register Your Clinic <ArrowRight className="w-4 h-4 ml-2" />
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
