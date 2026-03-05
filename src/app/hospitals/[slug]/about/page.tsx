'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { MapPin, Phone, Calendar, Clock, ArrowLeft, Mail, Award, Loader2 } from 'lucide-react'
import { useHospitalBySlug, useDoctors } from '@/lib/supabase/hooks'

export default function HospitalAboutPage() {
    const { slug } = useParams<{ slug: string }>()
    const { data: hospital, isLoading } = useHospitalBySlug(slug)
    const { data: doctors } = useDoctors(hospital?.id ?? null)

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
                    <Link href={`/hospitals/${hospital.slug}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="w-4 h-4" /> Back to {hospital.name}
                    </Link>
                    <Link href="/login">
                        <Button size="sm" style={{ backgroundColor: pc }} className="text-white">
                            <Calendar className="w-4 h-4 mr-1.5" /> Book Appointment
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="py-16 px-4" style={{ background: `linear-gradient(135deg, ${pc}10, ${sc}10)` }}>
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl font-extrabold mb-4">About <span style={{ color: pc }}>{hospital.name}</span></h1>
                    <p className="text-lg text-muted-foreground">{hospital.mission || 'Providing quality healthcare for all.'}</p>
                </div>
            </section>

            {/* About Content */}
            <section className="py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <Card className="border-border/50">
                        <CardContent className="p-8">
                            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
                            <p className="text-muted-foreground leading-relaxed">{hospital.about_text || 'We are committed to providing excellent healthcare services.'}</p>
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
                                    <div className="flex items-start gap-3"><MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" /><div><p className="font-medium">Address</p><p className="text-muted-foreground">{[hospital.address, hospital.city, hospital.state, hospital.pincode].filter(Boolean).join(', ')}</p></div></div>
                                    {hospital.phone && <div className="flex items-center gap-3"><Phone className="w-5 h-5 text-primary" /><div><p className="font-medium">Phone</p><p className="text-muted-foreground">{hospital.phone}</p></div></div>}
                                    <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-primary" /><div><p className="font-medium">Email</p><p className="text-muted-foreground">{hospital.email}</p></div></div>
                                    <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-primary" /><div><p className="font-medium">Hours</p><p className="text-muted-foreground">Mon–Sat: 9:00 AM – 7:00 PM<br />Sun: Closed</p></div></div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-border/50 overflow-hidden">
                            {hospital.map_embed_url && (() => {
                                try {
                                    const url = new URL(hospital.map_embed_url)
                                    const allowed = ['www.google.com', 'maps.google.com', 'google.com', 'www.google.co.in', 'maps.googleapis.com']
                                    return allowed.includes(url.hostname)
                                } catch { return false }
                            })() ? (
                                <iframe
                                    src={hospital.map_embed_url}
                                    className="w-full h-full min-h-[300px]"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                            ) : (
                                <div className="h-full min-h-[300px] bg-muted flex items-center justify-center">
                                    <div className="text-center text-muted-foreground p-6">
                                        <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm font-medium">Google Maps</p>
                                        <p className="text-xs">Map embed will appear here when configured in Settings</p>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </section>

            {/* Our Team */}
            {doctors && doctors.length > 0 && (
            <section className="py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6 text-center">Our Doctors</h2>
                    <div className="grid sm:grid-cols-3 gap-6">
                        {doctors.filter(d => d.is_active).map(doc => (
                            <Card key={doc.id} className="border-border/50 text-center">
                                <CardContent className="p-6">
                                    <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-xl font-bold text-white" style={{ backgroundColor: pc }}>
                                        {doc.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                    </div>
                                    <h3 className="font-semibold mt-3">{doc.full_name}</h3>
                                    <p className="text-sm" style={{ color: pc }}>{doc.specialization || 'General'}</p>
                                    <p className="text-xs text-muted-foreground">{doc.qualification || ''}</p>
                                    {doc.experience_years != null && (
                                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-2"><Award className="w-3 h-3" />{doc.experience_years} years</div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
            )}

            <footer className="border-t py-8 px-4 text-center text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} {hospital.name}. Powered by <Link href="/" className="text-primary hover:underline">DentalHub</Link></p>
            </footer>
        </div>
    )
}
