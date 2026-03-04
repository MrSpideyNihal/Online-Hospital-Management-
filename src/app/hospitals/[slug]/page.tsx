'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
    Star, MapPin, Phone, Calendar, Clock, Users, Award,
    ArrowRight, CheckCircle,
} from 'lucide-react'

// This page would fetch data from Supabase using the slug
// For now using demo data
const HOSPITAL = {
    name: 'SmileCare Dental Hospital',
    slug: 'smilecare-dental',
    address: '123 MG Road, Andheri West, Mumbai 400058',
    phone: '+91 22 2345 6789',
    email: 'info@smilecare.com',
    rating: 4.8,
    total_reviews: 256,
    primary_color: '#0ea5e9',
    secondary_color: '#6366f1',
    about_text: 'SmileCare Dental Hospital has been providing world-class dental care since 2010.',
    banner_url: null,
    services: [
        { name: 'Root Canal Treatment', description: 'Advanced endodontic therapy', price: 4500, icon: '🦷' },
        { name: 'Dental Implants', description: 'Titanium implant placement', price: 25000, icon: '🔩' },
        { name: 'Orthodontics', description: 'Braces & aligners', price: 35000, icon: '😁' },
        { name: 'Teeth Whitening', description: 'Professional whitening', price: 8000, icon: '✨' },
        { name: 'Smile Design', description: 'Complete smile makeover', price: 50000, icon: '😃' },
        { name: 'Dental Crowns', description: 'Ceramic & metal crowns', price: 6000, icon: '👑' },
    ],
    testimonials: [
        { name: 'Ravi Kumar', content: 'Excellent service! Dr. Priya did an amazing root canal. Highly recommend!', rating: 5 },
        { name: 'Sneha Patel', content: 'Very professional and caring staff. The clinic is spotlessly clean.', rating: 5 },
        { name: 'Amit Shah', content: 'Got my dental implant done here. The results are incredible!', rating: 4 },
    ],
    doctors: [
        { name: 'Dr. Priya Patel', specialization: 'Endodontics', experience: 12 },
        { name: 'Dr. Amit Kumar', specialization: 'Orthodontics', experience: 8 },
        { name: 'Dr. Sunita Rao', specialization: 'Prosthodontics', experience: 15 },
    ],
}

export default function HospitalPublicPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 glass">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: HOSPITAL.primary_color }}>
                            {HOSPITAL.name[0]}
                        </div>
                        <span className="font-bold text-lg">{HOSPITAL.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/hospitals/${HOSPITAL.slug}/about`}>
                            <Button variant="ghost" size="sm">About</Button>
                        </Link>
                        <Link href="/login">
                            <Button size="sm" style={{ backgroundColor: HOSPITAL.primary_color }} className="text-white">
                                <Calendar className="w-4 h-4 mr-1.5" /> Book Appointment
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative py-20 px-4 overflow-hidden">
                <div className="absolute inset-0 -z-10" style={{
                    background: `linear-gradient(135deg, ${HOSPITAL.primary_color}15, ${HOSPITAL.secondary_color}15)`
                }} />
                <div className="absolute top-10 right-10 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: `${HOSPITAL.primary_color}10` }} />

                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium mb-6">
                        <Star className="w-4 h-4 fill-current" />
                        {HOSPITAL.rating} Rating &middot; {HOSPITAL.total_reviews} Reviews
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
                        Welcome to <span style={{ color: HOSPITAL.primary_color }}>{HOSPITAL.name}</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                        {HOSPITAL.about_text}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <Link href="/login">
                            <Button size="lg" style={{ backgroundColor: HOSPITAL.primary_color }} className="text-white shadow-lg">
                                <Calendar className="w-5 h-5 mr-2" /> Book Appointment
                            </Button>
                        </Link>
                        <Link href={`/hospitals/${HOSPITAL.slug}/about`}>
                            <Button size="lg" variant="outline">Learn More <ArrowRight className="w-4 h-4 ml-1" /></Button>
                        </Link>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{HOSPITAL.address}</div>
                        <div className="flex items-center gap-1.5"><Phone className="w-4 h-4" />{HOSPITAL.phone}</div>
                        <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" />Mon-Sat, 9AM-7PM</div>
                    </div>
                </div>
            </section>

            {/* Services */}
            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold mb-2">Our Services</h2>
                        <p className="text-muted-foreground">Comprehensive dental care under one roof</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {HOSPITAL.services.map((service) => (
                            <Card key={service.name} className="border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                                <CardContent className="p-6">
                                    <span className="text-3xl">{service.icon}</span>
                                    <h3 className="text-lg font-semibold mt-3 group-hover:text-primary transition-colors">{service.name}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                                    <p className="text-lg font-bold mt-3" style={{ color: HOSPITAL.primary_color }}>
                                        ₹{service.price.toLocaleString('en-IN')}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Doctors */}
            <section className="py-16 px-4 bg-muted/30">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold mb-2">Our Doctors</h2>
                        <p className="text-muted-foreground">Expert dental specialists at your service</p>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-6">
                        {HOSPITAL.doctors.map((doc) => (
                            <Card key={doc.name} className="border-border/50 text-center overflow-hidden">
                                <div className="h-24" style={{ background: `linear-gradient(135deg, ${HOSPITAL.primary_color}30, ${HOSPITAL.secondary_color}30)` }} />
                                <CardContent className="pt-0 -mt-10 pb-6">
                                    <div className="w-20 h-20 rounded-full border-4 border-card mx-auto flex items-center justify-center text-2xl font-bold text-white"
                                        style={{ backgroundColor: HOSPITAL.primary_color }}>
                                        {doc.name.split(' ').slice(1).map(n => n[0]).join('')}
                                    </div>
                                    <h3 className="font-semibold mt-3">{doc.name}</h3>
                                    <p className="text-sm" style={{ color: HOSPITAL.primary_color }}>{doc.specialization}</p>
                                    <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-1">
                                        <Award className="w-3 h-3" />{doc.experience} years experience
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold mb-2">Patient Reviews</h2>
                        <p className="text-muted-foreground">What our patients say about us</p>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-6">
                        {HOSPITAL.testimonials.map((t, i) => (
                            <Card key={i} className="border-border/50">
                                <CardContent className="p-6">
                                    <div className="flex gap-0.5 mb-3">
                                        {Array.from({ length: t.rating }).map((_, j) => (
                                            <Star key={j} className="w-4 h-4 text-amber-500 fill-current" />
                                        ))}
                                    </div>
                                    <p className="text-sm text-muted-foreground italic">&ldquo;{t.content}&rdquo;</p>
                                    <p className="font-medium text-sm mt-3">— {t.name}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="rounded-3xl p-10 text-center text-white relative overflow-hidden"
                        style={{ background: `linear-gradient(135deg, ${HOSPITAL.primary_color}, ${HOSPITAL.secondary_color})` }}>
                        <h2 className="text-3xl font-bold mb-3">Ready to Smile?</h2>
                        <p className="text-white/80 mb-6 max-w-xl mx-auto">Book your appointment today and experience world-class dental care.</p>
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
                <p>&copy; {new Date().getFullYear()} {HOSPITAL.name}. Powered by <Link href="/" className="text-primary hover:underline">DentalHub</Link></p>
            </footer>
        </div>
    )
}
