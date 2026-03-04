'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Star, MapPin, Phone, Calendar, Clock, ArrowLeft, Mail, Award } from 'lucide-react'

const HOSPITAL = {
    name: 'SmileCare Dental Hospital',
    slug: 'smilecare-dental',
    address: '123 MG Road, Andheri West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400058',
    phone: '+91 22 2345 6789',
    email: 'info@smilecare.com',
    primary_color: '#0ea5e9',
    secondary_color: '#6366f1',
    about_text: 'SmileCare Dental Hospital has been at the forefront of dental care in Mumbai since 2010. Our state-of-the-art facility is equipped with the latest dental technology, and our team of experienced dentists is committed to providing comfortable, high-quality dental care to patients of all ages.',
    mission: 'To provide affordable, high-quality dental care to every patient with compassion and excellence. We aim to be the most trusted name in dental care across India.',
    map_embed_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3769.9630018657384!2d72.8347!3d19.1364!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDA4JzExLjAiTiA3MsKwNTAnMDUuMCJF!5e0!3m2!1sen!2sin!4v1234567890',
    doctors: [
        { name: 'Dr. Priya Patel', specialization: 'Endodontics', qualification: 'BDS, MDS', experience: 12 },
        { name: 'Dr. Amit Kumar', specialization: 'Orthodontics', qualification: 'BDS, MDS (Ortho)', experience: 8 },
        { name: 'Dr. Sunita Rao', specialization: 'Prosthodontics', qualification: 'BDS, MDS, FICOI', experience: 15 },
    ],
}

export default function HospitalAboutPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 glass">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href={`/hospitals/${HOSPITAL.slug}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="w-4 h-4" /> Back to {HOSPITAL.name}
                    </Link>
                    <Link href="/login">
                        <Button size="sm" style={{ backgroundColor: HOSPITAL.primary_color }} className="text-white">
                            <Calendar className="w-4 h-4 mr-1.5" /> Book Appointment
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="py-16 px-4" style={{ background: `linear-gradient(135deg, ${HOSPITAL.primary_color}10, ${HOSPITAL.secondary_color}10)` }}>
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl font-extrabold mb-4">About <span style={{ color: HOSPITAL.primary_color }}>{HOSPITAL.name}</span></h1>
                    <p className="text-lg text-muted-foreground">{HOSPITAL.mission}</p>
                </div>
            </section>

            {/* About Content */}
            <section className="py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <Card className="border-border/50">
                        <CardContent className="p-8">
                            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
                            <p className="text-muted-foreground leading-relaxed">{HOSPITAL.about_text}</p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Contact & Map */}
            <section className="py-12 px-4 bg-muted/30">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6 text-center">Visit Us</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="border-border/50">
                            <CardContent className="p-6 space-y-4">
                                <h3 className="font-semibold text-lg">Contact Information</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-start gap-3"><MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" /><div><p className="font-medium">Address</p><p className="text-muted-foreground">{HOSPITAL.address}, {HOSPITAL.city}, {HOSPITAL.state} — {HOSPITAL.pincode}</p></div></div>
                                    <div className="flex items-center gap-3"><Phone className="w-5 h-5 text-primary" /><div><p className="font-medium">Phone</p><p className="text-muted-foreground">{HOSPITAL.phone}</p></div></div>
                                    <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-primary" /><div><p className="font-medium">Email</p><p className="text-muted-foreground">{HOSPITAL.email}</p></div></div>
                                    <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-primary" /><div><p className="font-medium">Hours</p><p className="text-muted-foreground">Mon–Sat: 9:00 AM – 7:00 PM<br />Sun: Closed</p></div></div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-border/50 overflow-hidden">
                            <div className="h-full min-h-[300px] bg-muted flex items-center justify-center">
                                <div className="text-center text-muted-foreground p-6">
                                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm font-medium">Google Maps</p>
                                    <p className="text-xs">Map embed will appear here when configured in Settings</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Our Team */}
            <section className="py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6 text-center">Our Doctors</h2>
                    <div className="grid sm:grid-cols-3 gap-6">
                        {HOSPITAL.doctors.map(doc => (
                            <Card key={doc.name} className="border-border/50 text-center">
                                <CardContent className="p-6">
                                    <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-xl font-bold text-white" style={{ backgroundColor: HOSPITAL.primary_color }}>
                                        {doc.name.split(' ').slice(1).map(n => n[0]).join('')}
                                    </div>
                                    <h3 className="font-semibold mt-3">{doc.name}</h3>
                                    <p className="text-sm" style={{ color: HOSPITAL.primary_color }}>{doc.specialization}</p>
                                    <p className="text-xs text-muted-foreground">{doc.qualification}</p>
                                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-2"><Award className="w-3 h-3" />{doc.experience} years</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="border-t py-8 px-4 text-center text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} {HOSPITAL.name}. Powered by <Link href="/" className="text-primary hover:underline">DentalHub</Link></p>
            </footer>
        </div>
    )
}
