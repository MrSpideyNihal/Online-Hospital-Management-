import { createAdminClient } from '@/lib/supabase/admin'
import { AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import PatientFullProfile from './patient-full-profile'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

async function getFullPatientData(patientId: string) {
    if (!UUID_RE.test(patientId)) return null

    const admin = createAdminClient()

    // 1. Patient basic info + hospital
    const { data: patient, error: pErr } = await admin
        .from('patients')
        .select('*, hospitals:hospital_id(name, phone, email, address, city, state, pincode)')
        .eq('id', patientId)
        .maybeSingle()

    if (pErr || !patient) return null

    const age = patient.date_of_birth
        ? Math.floor((Date.now() - new Date(patient.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : null

    // 2. Visit history
    const { data: visits } = await admin
        .from('visits')
        .select('id, visit_date, chief_complaint, diagnosis, treatment_notes, status, doctors:doctor_id(full_name)')
        .eq('patient_id', patientId)
        .order('visit_date', { ascending: false })
        .limit(50)

    // 3. Treatments
    const { data: treatments } = await admin
        .from('treatments')
        .select('id, treatment_type, description, estimated_cost, actual_cost, status, planned_date, completed_date, tooth_number, performed_by, doctors:performed_by(full_name)')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(50)

    // 4. Invoices / Billing
    const { data: invoices } = await admin
        .from('invoices')
        .select('id, invoice_number, items, subtotal, tax, discount, total, payment_status, paid_at, notes, created_at')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(50)

    // 5. Prescriptions
    const { data: prescriptions } = await admin
        .from('prescriptions')
        .select('id, diagnosis, medicines, instructions, created_at, doctors:doctor_id(full_name)')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(20)

    // 6. Upcoming appointment
    const today = new Date().toISOString().split('T')[0]
    const { data: nextAppt } = await admin
        .from('appointments')
        .select('appointment_date, appointment_time, reason, doctors:doctor_id(full_name)')
        .eq('patient_id', patientId)
        .gte('appointment_date', today)
        .not('status', 'eq', 'cancelled')
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true })
        .limit(1)
        .maybeSingle()

    // Billing summary
    const allInvoices = invoices || []
    const totalBilled = allInvoices.reduce((s: number, i: { total?: number }) => s + (i.total || 0), 0)
    const totalPaid = allInvoices
        .filter((i: { payment_status?: string }) => i.payment_status === 'paid')
        .reduce((s: number, i: { total?: number }) => s + (i.total || 0), 0)
    const totalPartial = allInvoices
        .filter((i: { payment_status?: string }) => i.payment_status === 'partial')
        .reduce((s: number, i: { total?: number }) => s + (i.total || 0), 0)
    const balanceDue = totalBilled - totalPaid

    return {
        patient: {
            ...patient,
            age,
        },
        hospital: patient.hospitals || null,
        visits: visits || [],
        treatments: treatments || [],
        invoices: allInvoices,
        prescriptions: prescriptions || [],
        nextAppointment: nextAppt || null,
        billingSummary: {
            totalBilled,
            totalPaid,
            totalPartial,
            balanceDue,
            invoiceCount: allInvoices.length,
        },
    }
}

export default async function PatientQRPage({ params }: { params: Promise<{ patientId: string }> }) {
    const { patientId } = await params
    const data = await getFullPatientData(patientId)

    if (!data) {
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

    return <PatientFullProfile data={data} />
}
