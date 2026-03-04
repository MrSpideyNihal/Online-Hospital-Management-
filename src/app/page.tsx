'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, Star, ArrowRight, Sparkles, Shield, Clock, Users, Phone, Stethoscope, ChevronRight, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSearchHospitals } from '@/lib/supabase/hooks'

const FEATURED_SERVICES = [
  { name: 'Root Canal', icon: '🦷', color: 'from-blue-500 to-cyan-500' },
  { name: 'Dental Implants', icon: '🔩', color: 'from-purple-500 to-pink-500' },
  { name: 'Braces', icon: '😁', color: 'from-green-500 to-emerald-500' },
  { name: 'Teeth Whitening', icon: '✨', color: 'from-amber-500 to-yellow-500' },
  { name: 'Smile Design', icon: '😃', color: 'from-rose-500 to-red-500' },
  { name: 'Pediatric', icon: '👶', color: 'from-indigo-500 to-violet-500' },
]

const STATS = [
  { label: 'Happy Patients', value: '50,000+', icon: Users },
  { label: 'Partner Hospitals', value: '200+', icon: Stethoscope },
  { label: 'Online Appointments', value: '1M+', icon: Clock },
  { label: 'Cities Covered', value: '50+', icon: MapPin },
]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const { theme, setTheme } = useTheme()

  // Fetch live approved hospitals based on search; default shows all approved when query=""
  const { data: hospitals = [] } = useSearchHospitals(searchQuery || ' ', selectedCity || undefined)

  // Client-side fallback filter for empty query
  const filteredHospitals = searchQuery || selectedCity
    ? hospitals
    : hospitals.slice(0, 6)

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="text-xl font-bold gradient-text">DentalHub</span>
            </Link>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/login?type=hospital">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25">
                  Register Hospital
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl float" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-40 right-20 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl float" style={{ animationDelay: '4s' }} />
        </div>

        <div className="max-w-5xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            India&apos;s #1 Dental Care Platform
          </Badge>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
            Find the Best{' '}
            <span className="gradient-text">Dental Hospital</span>
            <br />Near You
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Search from 200+ verified dental hospitals across India. Book appointments,
            view ratings, and get the best dental care — all in one place.
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3 p-3 rounded-2xl bg-card border shadow-xl shadow-black/5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search hospitals, clinics, or services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 border-0 bg-muted/50 text-base"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="h-12 pl-10 pr-8 rounded-lg bg-muted/50 border-0 text-sm appearance-none cursor-pointer w-full sm:w-40 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Cities</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Kolkata">Kolkata</option>
                  <option value="Hyderabad">Hyderabad</option>
                </select>
              </div>
              <Button size="lg" className="h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* Quick filter tags */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {FEATURED_SERVICES.map((service) => (
              <button
                key={service.name}
                onClick={() => setSearchQuery(service.name)}
                className="px-4 py-2 rounded-full bg-card border text-sm font-medium hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
              >
                <span className="mr-1.5">{service.icon}</span>
                {service.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-3">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hospital Results */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Top Dental Hospitals</h2>
              <p className="text-muted-foreground mt-1">Verified and rated by thousands of patients</p>
            </div>
            <Button variant="ghost" className="hidden sm:flex">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHospitals.map((hospital) => {
              const color = hospital.primary_color || '#0ea5e9'
              return (
              <Link key={hospital.id} href={`/hospitals/${hospital.slug}`}>
                <Card className="group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer border-border/50">
                  <div
                    className="h-32 bg-gradient-to-br relative"
                    style={{
                      background: `linear-gradient(135deg, ${color}20, ${color}40)`
                    }}
                  >
                    <div className="absolute bottom-0 left-6 translate-y-1/2">
                      <div
                        className="w-16 h-16 rounded-2xl border-4 border-card flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                        style={{ backgroundColor: color }}
                      >
                        {hospital.name[0]}
                      </div>
                    </div>
                  </div>

                  <CardContent className="pt-12 pb-6 px-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {hospital.name}
                      </h3>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">{hospital.rating ?? '—'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-4">
                      <MapPin className="w-3.5 h-3.5" />
                      {hospital.address || hospital.city || 'India'}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Phone className="w-3.5 h-3.5" />
                        {hospital.phone || 'Contact Available'}
                      </div>
                      <Button variant="ghost" size="sm" className="text-primary">
                        Visit <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Why Choose DentalHub?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              The most trusted platform for dental care in India
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Verified Hospitals',
                description: 'Every hospital is verified and approved by our team before listing. You can trust the quality.',
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                icon: Clock,
                title: 'Instant Booking',
                description: 'Book appointments in seconds with real-time availability. No waiting, no hassle.',
                gradient: 'from-purple-500 to-pink-500',
              },
              {
                icon: Users,
                title: 'Patient Reviews',
                description: 'Read genuine reviews from real patients to make informed decisions about your dental care.',
                gradient: 'from-green-500 to-emerald-500',
              },
            ].map((feature) => (
              <Card key={feature.title} className="text-center p-8 hover:shadow-lg transition-shadow border-border/50">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.gradient} mb-5`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl gradient-bg relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Are You a Dental Hospital?
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                Join DentalHub and get your own customizable website, patient management system,
                and online booking — all in one platform.
              </p>
              <Link href="/login?type=hospital">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-white/90 shadow-xl shadow-black/20 text-base px-8">
                  Register Your Hospital
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                  <span className="text-white font-bold">D</span>
                </div>
                <span className="font-bold text-lg">DentalHub</span>
              </div>
              <p className="text-sm text-muted-foreground">
                India&apos;s most trusted dental care platform, connecting patients with the best dental hospitals.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">For Patients</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/" className="hover:text-primary transition-colors">Find Hospitals</Link></li>
                <li><Link href="/login" className="hover:text-primary transition-colors">Book Appointment</Link></li>
                <li><Link href="/login" className="hover:text-primary transition-colors">My Records</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">For Hospitals</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/login?type=hospital" className="hover:text-primary transition-colors">Register</Link></li>
                <li><Link href="/login" className="hover:text-primary transition-colors">Admin Login</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} DentalHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
