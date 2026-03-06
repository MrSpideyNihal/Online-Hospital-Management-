import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, AlertTriangle, Droplets, Calendar, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type PatientCard = {
    id: string
    full_name: string
    patient_id_number: string | null
    gender: string | null
    date_of_birth: string | null
    blood_group: string | null
    allergies: string[] | null
    emergency_contact_name: string | null
    emergency_contact_phone: string | null
}

type UpcomingAppointment = {
    appointment_date: string
    appointment_time: string | null
    reason: string | null
    doctors?: { full_name: string | null } | null
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

async function getPatientCard(patientId: string): Promise<{ patient: PatientCard | null; nextAppointment: UpcomingAppointment | null }> {
    if (!UUID_RE.test(patientId)) {
        return { patient: null, nextAppointment: null }
    }

    const admin = createAdminClient()
    const { data: patientData, error: patientError } = await admin
        .from('patients')
        .select('id, full_name, patient_id_number, gender, date_of_birth, blood_group, allergies, emergency_contact_name, emergency_contact_phone')
        .eq('id', patientId)
        .maybeSingle()

    if (patientError || !patientData) {
        return { patient: null, nextAppointment: null }
    }

    const today = new Date().toISOString().split('T')[0]
    const { data: nextAppointmentData } = await admin
        .from('appointments')
        .select('appointment_date, appointment_time, reason, doctors:doctor_id(full_name)')
        .eq('patient_id', patientId)
        .gte('appointment_date', today)
        .not('status', 'eq', 'cancelled')
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true })
        .limit(1)
        .maybeSingle()

    return {
        patient: patientData as PatientCard,
        nextAppointment: (nextAppointmentData as UpcomingAppointment | null) || null,
    }
}

export default async function PatientQRPage({ params }: { params: Promise<{ patientId: string }> }) {
    const { patientId } = await params
    const { patient, nextAppointment } = await getPatientCard(patientId)

    if (!patient) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Card className="w-full max-w-md">
                    <CardContent className="p-8 text-center">
                        <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
                        <h2 className="text-lg font-semibold mb-1">Patient Not Found</h2>
                        <p className="text-muted-foreground text-sm">The patient record could not be found.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const age = patient.date_of_birth
        ? Math.floor((Date.now() - new Date(patient.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : null

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="text-center pb-2">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <User className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{patient.full_name}</CardTitle>
                    <p className="text-sm text-muted-foreground font-mono">{patient.patient_id_number || 'N/A'}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        {patient.gender && (
                            <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground">Gender</p>
                                <p className="text-sm font-medium capitalize">{patient.gender}</p>
                            </div>
                        )}
                        {age !== null && (
                            <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground">Age</p>
                                <p className="text-sm font-medium">{age} years</p>
                            </div>
                        )}
                        {patient.blood_group && (
                            <div className="p-3 rounded-lg bg-muted/50">
                                <div className="flex items-center gap-1">
                                    <Droplets className="w-3 h-3 text-red-500" />
                                    <p className="text-xs text-muted-foreground">Blood Group</p>
                                </div>
                                <p className="text-sm font-medium">{patient.blood_group}</p>
                            </div>
                        )}
                        {patient.date_of_birth && (
                            <div className="p-3 rounded-lg bg-muted/50">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground">DOB</p>
                                </div>
                                <p className="text-sm font-medium">{formatDate(patient.date_of_birth)}</p>
                            </div>
                        )}
                    </div>

                    {patient.allergies && patient.allergies.length > 0 && (
                        <div>
                            <p className="text-xs text-muted-foreground mb-1.5 font-medium">Allergies</p>
                            <div className="flex flex-wrap gap-1.5">
                                {patient.allergies.map((a) => (
                                    <Badge key={a} variant="destructive" className="text-xs">{a}</Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {patient.emergency_contact_name && (
                        <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
                            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mb-1">Emergency Contact</p>
                            <p className="text-sm font-medium">{patient.emergency_contact_name}</p>
                            {patient.emergency_contact_phone && (
                                <p className="text-sm text-muted-foreground">{patient.emergency_contact_phone}</p>
                            )}
                        </div>
                    )}

                    {nextAppointment && (
                        <div className="p-3 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
                            <p className="text-xs text-blue-700 dark:text-blue-400 font-medium mb-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Upcoming Appointment
                            </p>
                            <p className="text-sm font-medium">{formatDate(nextAppointment.appointment_date)} {nextAppointment.appointment_time ? `at ${nextAppointment.appointment_time}` : ''}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{nextAppointment.reason || 'Dental Appointment'}{nextAppointment.doctors?.full_name ? ` • Dr. ${nextAppointment.doctors.full_name}` : ''}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
