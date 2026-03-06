/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Loader2, Calendar, Clock, CalendarPlus } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'

const supabase = createClient()

const STATUS_COLORS: Record<string, string> = {
    scheduled: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

type BookableHospital = {
    id: string
    name: string
}

type BookableDoctor = {
    id: string
    full_name: string
    specialization: string | null
}

export default function PatientAppointmentsPage() {
    const { user } = useAuth()
    const queryClient = useQueryClient()
    const searchParams = useSearchParams()
    const requestedHospitalId = (searchParams.get('hospitalId') || '').trim()
    const shouldOpenBooking = searchParams.get('book') === '1'

    const [isBookOpen, setIsBookOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [fHospital, setFHospital] = useState(requestedHospitalId)
    const [fDoctor, setFDoctor] = useState('')
    const [fDate, setFDate] = useState('')
    const [fTime, setFTime] = useState('')
    const [fReason, setFReason] = useState('')
    const [fNotes, setFNotes] = useState('')

    useEffect(() => {
        if (shouldOpenBooking) {
            setIsBookOpen(true)
        }
    }, [shouldOpenBooking])

    useEffect(() => {
        if (requestedHospitalId) {
            setFHospital(requestedHospitalId)
        }
    }, [requestedHospitalId])

    useEffect(() => {
        setFDoctor('')
    }, [fHospital])

    const { data: appointments = [], isLoading } = useQuery({
        queryKey: ['patient-all-appointments', user?.id],
        queryFn: async () => {
            if (!user) return []
            const { data: patients } = await supabase
                .from('patients')
                .select('id')
                .eq('user_id', user.id)
            if (!patients?.length) return []
            const patientIds = patients.map((p: { id: string }) => p.id)
            const { data } = await supabase
                .from('appointments')
                .select('*, doctors:doctor_id(full_name), hospitals:hospital_id(name)')
                .in('patient_id', patientIds)
                .order('appointment_date', { ascending: false })
            return data || []
        },
        enabled: !!user,
    })

    const { data: hospitals = [] } = useQuery<BookableHospital[]>({
        queryKey: ['bookable-hospitals'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('hospitals')
                .select('id, name')
                .eq('status', 'approved')
                .neq('is_frozen', true)
                .order('name', { ascending: true })

            if (error) throw error
            return (data || []) as BookableHospital[]
        },
    })

    const { data: doctors = [], isLoading: loadingDoctors } = useQuery<BookableDoctor[]>({
        queryKey: ['bookable-doctors', fHospital],
        queryFn: async () => {
            if (!fHospital) return []
            const { data, error } = await supabase
                .from('doctors')
                .select('id, full_name, specialization')
                .eq('hospital_id', fHospital)
                .eq('is_active', true)
                .order('full_name', { ascending: true })

            if (error) throw error
            return (data || []) as BookableDoctor[]
        },
        enabled: !!fHospital,
    })

    const resetBookingForm = () => {
        setFDoctor('')
        setFDate('')
        setFTime('')
        setFReason('')
        setFNotes('')
    }

    const handleBookAppointment = async () => {
        if (!fHospital || !fDoctor || !fDate || !fTime) {
            toast.error('Please select hospital, doctor, date, and time.')
            return
        }

        const today = new Date().toISOString().split('T')[0]
        if (fDate < today) {
            toast.error('Cannot book appointments in the past.')
            return
        }

        setIsSubmitting(true)
        try {
            const response = await fetch('/api/patient/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hospitalId: fHospital,
                    doctorId: fDoctor,
                    appointmentDate: fDate,
                    appointmentTime: fTime,
                    reason: fReason || null,
                    notes: fNotes || null,
                }),
            })

            const result = (await response.json().catch(() => null)) as { error?: string } | null

            if (!response.ok) {
                throw new Error(result?.error || 'Could not book appointment. Please try again.')
            }

            toast.success('Appointment booked successfully.')
            setIsBookOpen(false)
            resetBookingForm()
            queryClient.invalidateQueries({ queryKey: ['patient-all-appointments', user?.id] })
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Booking failed. Please try again.'
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const today = new Date().toISOString().split('T')[0]
    const upcoming = appointments.filter((a: any) => a.appointment_date >= today && a.status !== 'cancelled')
    const past = appointments.filter((a: any) => a.appointment_date < today || a.status === 'cancelled')

    if (isLoading) {
        return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">My Appointments</h1>
                    <p className="text-muted-foreground">View and book your dental appointments</p>
                </div>

                <Dialog open={isBookOpen} onOpenChange={setIsBookOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                            <CalendarPlus className="w-4 h-4 mr-2" /> Book Appointment
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Book a New Appointment</DialogTitle>
                            <DialogDescription>
                                Choose a hospital, doctor, date and time to schedule your visit.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-2">
                            <div className="space-y-1.5">
                                <Label>Hospital *</Label>
                                <select
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                    value={fHospital}
                                    onChange={(event) => setFHospital(event.target.value)}
                                >
                                    <option value="">Select hospital</option>
                                    {hospitals.map((hospital) => (
                                        <option key={hospital.id} value={hospital.id}>{hospital.name}</option>
                                    ))}
                                </select>
                                {hospitals.length === 0 && (
                                    <p className="text-xs text-muted-foreground">
                                        No approved hospitals are available for online booking right now.
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label>Doctor *</Label>
                                <select
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                    value={fDoctor}
                                    onChange={(event) => setFDoctor(event.target.value)}
                                    disabled={!fHospital || loadingDoctors}
                                >
                                    <option value="">
                                        {!fHospital
                                            ? 'Select hospital first'
                                            : loadingDoctors
                                                ? 'Loading doctors...'
                                                : 'Select doctor'}
                                    </option>
                                    {doctors.map((doctor) => (
                                        <option key={doctor.id} value={doctor.id}>
                                            {doctor.full_name}{doctor.specialization ? ` — ${doctor.specialization}` : ''}
                                        </option>
                                    ))}
                                </select>
                                {fHospital && !loadingDoctors && doctors.length === 0 && (
                                    <p className="text-xs text-muted-foreground">
                                        No active doctors are listed for this hospital yet. Try another hospital or contact reception.
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label>Date *</Label>
                                    <Input
                                        type="date"
                                        min={today}
                                        value={fDate}
                                        onChange={(event) => setFDate(event.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Time *</Label>
                                    <Input
                                        type="time"
                                        value={fTime}
                                        onChange={(event) => setFTime(event.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label>Reason</Label>
                                <Input
                                    placeholder="For example: Tooth pain, check-up, braces adjustment"
                                    value={fReason}
                                    onChange={(event) => setFReason(event.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label>Notes</Label>
                                <Input
                                    placeholder="Anything the doctor should know"
                                    value={fNotes}
                                    onChange={(event) => setFNotes(event.target.value)}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => { setIsBookOpen(false); resetBookingForm() }}>
                                Cancel
                            </Button>
                            <Button
                                className="bg-teal-600 hover:bg-teal-700 text-white"
                                onClick={handleBookAppointment}
                                disabled={isSubmitting || doctors.length === 0 || hospitals.length === 0}
                            >
                                {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Booking...</> : 'Confirm Booking'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Upcoming */}
            <Card className="border-border/50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        Upcoming ({upcoming.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {upcoming.length === 0 ? (
                        <p className="text-center text-muted-foreground py-6">No upcoming appointments</p>
                    ) : (
                        <div className="space-y-3">
                            {upcoming.map((apt: any) => (
                                <div key={apt.id} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{apt.reason || 'Dental Appointment'}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Dr. {apt.doctors?.full_name || '—'}
                                                {apt.hospitals?.name ? ` • ${apt.hospitals.name}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{formatDate(apt.appointment_date)}</p>
                                        <p className="text-sm text-muted-foreground">{apt.appointment_time}</p>
                                        <Badge variant="secondary" className={`${STATUS_COLORS[apt.status] || ''} text-xs mt-1 capitalize`}>
                                            {(apt.status || '').replace('_', ' ')}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Past Appointments */}
            <Card className="border-border/50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base text-muted-foreground">Past Appointments ({past.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {past.length === 0 ? (
                        <p className="text-center text-muted-foreground py-6">No past appointments</p>
                    ) : (
                        <div className="space-y-2">
                            {past.map((apt: any) => (
                                <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                    <div>
                                        <p className="text-sm font-medium">{apt.reason || 'Dental Appointment'}</p>
                                        <p className="text-xs text-muted-foreground">Dr. {apt.doctors?.full_name || '—'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm">{formatDate(apt.appointment_date)}</p>
                                        <Badge variant="secondary" className={`${STATUS_COLORS[apt.status] || ''} text-xs capitalize`}>
                                            {(apt.status || '').replace('_', ' ')}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
