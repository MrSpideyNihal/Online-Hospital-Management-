'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
    Star, MapPin, Phone, Calendar, Clock, Award,
    ArrowRight, Loader2,
} from 'lucide-react'
import { useHospitalBySlug, useHospitalServices, useDoctors, useTestimonials } from '@/lib/supabase/hooks'

export default function HospitalPublicPage() {
    const { slug } = useParams<{ slug: string }>()
    const { data: hospital, isLoading } = useHospitalBySlug(slug)
    const { data: services } = useHospitalServices(hospital?.id ?? null)
    const { data: doctors } = useDoctors(hospital?.id ?? null)
    const { data: testimonials } = useTestimonials(hospital?.id ?? null)

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!hospital) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold">Hospital not found</h1>
                <Link href="/"><Button>Back to Home</Button></Link>
            </div>
        )
    }

    const pc = hospital.primary_color || '#0ea5e9'
    const sc = hospital.secondary_color || '#6366f1'

    return (
        <div className="min-h-screen bg-background">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 glass">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: pc }}>
                            {hospital.name[0]}
                        </div>
                        <span className="font-bold text-lg">{hospital.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/hospitals/${hospital.slug}/about`}>
                            <Button variant="ghost" size="sm">About</Button>
                        </Link>
                        <Link href="/login">
                            <Button size="sm" style={{ backgroundColor: pc }} className="text-white">
                                <Calendar className="w-4 h-4 mr-1.5" /> Book Appointment
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative py-20 px-4 overflow-hidden">
                <div className="absolute inset-0 -z-10" style={{
                    background: `linear-gradient(135deg, ${pc}15, ${sc}15)`
                }} />
                <div className="absolute top-10 right-10 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: `${pc}10` }} />

                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium mb-6">
                        <Star className="w-4 h-4 fill-current" />
                        {hospital.rating} Rating &middot; {hospital.total_reviews} Reviews
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
                        Welcome to <span style={{ color: pc }}>{hospital.name}</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                        {hospital.about_text || 'Welcome to our hospital.'}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <Link href="/login">
                            <Button size="lg" style={{ backgroundColor: pc }} className="text-white shadow-lg">
                                <Calendar className="w-5 h-5 mr-2" /> Book Appointment
                            </Button>
                        </Link>
                        <Link href={`/hospitals/${hospital.slug}/about`}>
                            <Button size="lg" variant="outline">Learn More <ArrowRight className="w-4 h-4 ml-1" /></Button>
                        </Link>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-muted-foreground">
                        {hospital.address && <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{hospital.address}</div>}
                        {hospital.phone && <div className="flex items-center gap-1.5"><Phone className="w-4 h-4" />{hospital.phone}</div>}
                        <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" />Mon-Sat, 9AM-7PM</div>
                    </div>
                </div>
            </section>

            {/* Services */}
            {services && services.length > 0 && (
            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold mb-2">Our Services</h2>
                        <p className="text-muted-foreground">Comprehensive care under one roof</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service) => (
                            <Card key={service.id} className="border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{service.service_name}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{service.description || 'Professional dental care'}</p>
                                    {service.price != null && (
                                        <p className="text-lg font-bold mt-3" style={{ color: pc }}>
                                            ₹{service.price.toLocaleString('en-IN')}
                                        </p>
                                    )}
                                    {service.duration_minutes > 0 && (
                                        <p className="text-xs text-muted-foreground mt-1">{service.duration_minutes} min</p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
            )}

            {/* Doctors */}
            {doctors && doctors.length > 0 && (
            <section className="py-16 px-4 bg-muted/30">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold mb-2">Our Doctors</h2>
                        <p className="text-muted-foreground">Expert specialists at your service</p>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-6">
                        {doctors.filter(d => d.is_active).map((doc) => (
                            <Card key={doc.id} className="border-border/50 text-center overflow-hidden">
                                <div className="h-24" style={{ background: `linear-gradient(135deg, ${pc}30, ${sc}30)` }} />
                                <CardContent className="pt-0 -mt-10 pb-6">
                                    <div className="w-20 h-20 rounded-full border-4 border-card mx-auto flex items-center justify-center text-2xl font-bold text-white"
                                        style={{ backgroundColor: pc }}>
                                        {doc.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                    </div>
                                    <h3 className="font-semibold mt-3">{doc.full_name}</h3>
                                    <p className="text-sm" style={{ color: pc }}>{doc.specialization || 'General'}</p>
                                    {doc.experience_years != null && (
                                        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-1">
                                            <Award className="w-3 h-3" />{doc.experience_years} years experience
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
            )}

            {/* Testimonials */}
            {testimonials && testimonials.length > 0 && (
            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold mb-2">Patient Reviews</h2>
                        <p className="text-muted-foreground">What our patients say about us</p>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-6">
                        {testimonials.map((t) => (
                            <Card key={t.id} className="border-border/50">
                                <CardContent className="p-6">
                                    <div className="flex gap-0.5 mb-3">
                                        {Array.from({ length: t.rating }).map((_, j) => (
                                            <Star key={j} className="w-4 h-4 text-amber-500 fill-current" />
                                        ))}
                                    </div>
                                    <p className="text-sm text-muted-foreground italic">&ldquo;{t.content}&rdquo;</p>
                                    <p className="font-medium text-sm mt-3">— {t.patient_name}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
            )}

            {/* CTA */}
            <section className="py-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="rounded-3xl p-10 text-center text-white relative overflow-hidden"
                        style={{ background: `linear-gradient(135deg, ${pc}, ${sc})` }}>
                        <h2 className="text-3xl font-bold mb-3">Ready to Smile?</h2>
                        <p className="text-white/80 mb-6 max-w-xl mx-auto">Book your appointment today and experience world-class care.</p>
                        <Link href="/login">
                            <Button size="lg" className="bg-white text-gray-900 hover:bg-white/90 shadow-xl">
                                <Calendar className="w-5 h-5 mr-2" /> Book Now
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t py-8 px-4 text-center text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} {hospital.name}. Powered by <Link href="/" className="text-primary hover:underline">DentalHub</Link></p>
            </footer>
        </div>
    )
}
