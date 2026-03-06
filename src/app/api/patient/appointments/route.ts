import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/

function getLocalToday() {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function normalizeTime(value: string) {
  return value.length === 5 ? `${value}:00` : value
}

function isPastDate(value: string) {
  const today = getLocalToday()
  return value < today
}

function isPastTimeToday(date: string, time: string) {
  if (date !== getLocalToday()) return false
  const [hours, minutes, seconds] = time.split(':').map((part) => Number(part || 0))
  const now = new Date()
  const slot = new Date(now)
  slot.setHours(hours, minutes, Number.isFinite(seconds) ? seconds : 0, 0)
  return slot.getTime() <= now.getTime()
}

function getPreferredName(email: string | null | undefined, metadata: Record<string, unknown> | undefined) {
  const raw = (metadata?.full_name || metadata?.name || '') as string
  if (raw.trim()) return raw.trim()
  if (email && email.includes('@')) return email.split('@')[0]
  return 'Patient'
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Please sign in to book an appointment.' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      return NextResponse.json({ error: 'Could not verify account role.' }, { status: 500 })
    }

    if (!profile || profile.role !== 'patient') {
      return NextResponse.json(
        { error: 'Online booking is available from patient accounts only.' },
        { status: 403 }
      )
    }

    const body = (await request.json()) as {
      hospitalId?: string
      doctorId?: string
      appointmentDate?: string
      appointmentTime?: string
      reason?: string | null
      notes?: string | null
    }

    const hospitalId = (body.hospitalId || '').trim()
    const doctorId = (body.doctorId || '').trim()
    const appointmentDate = (body.appointmentDate || '').trim()
    const appointmentTimeRaw = (body.appointmentTime || '').trim()
    const appointmentTime = normalizeTime(appointmentTimeRaw)
    const reason = (body.reason || '').trim().slice(0, 500) || null
    const notes = (body.notes || '').trim().slice(0, 2000) || null

    if (!UUID_RE.test(hospitalId) || !UUID_RE.test(doctorId)) {
      return NextResponse.json({ error: 'Invalid hospital or doctor selected.' }, { status: 400 })
    }

    if (!appointmentDate || !appointmentTime) {
      return NextResponse.json({ error: 'Appointment date and time are required.' }, { status: 400 })
    }

    if (isPastDate(appointmentDate)) {
      return NextResponse.json({ error: 'Cannot book appointments in the past.' }, { status: 400 })
    }

    if (!TIME_RE.test(appointmentTime)) {
      return NextResponse.json({ error: 'Invalid appointment time format.' }, { status: 400 })
    }

    if (isPastTimeToday(appointmentDate, appointmentTime)) {
      return NextResponse.json(
        { error: 'Cannot book an appointment in a past time slot today.' },
        { status: 400 }
      )
    }

    let admin
    try {
      admin = createAdminClient()
    } catch {
      return NextResponse.json(
        { error: 'Booking service is temporarily unavailable. Please contact support.' },
        { status: 503 }
      )
    }

    const { data: hospital } = await admin
      .from('hospitals')
      .select('id, name, status, is_frozen')
      .eq('id', hospitalId)
      .maybeSingle()

    if (!hospital || hospital.status !== 'approved' || hospital.is_frozen) {
      return NextResponse.json(
        { error: 'This hospital is not currently accepting online appointments.' },
        { status: 400 }
      )
    }

    const { data: doctor } = await admin
      .from('doctors')
      .select('id, hospital_id, full_name, is_active')
      .eq('id', doctorId)
      .eq('hospital_id', hospitalId)
      .maybeSingle()

    if (!doctor || !doctor.is_active) {
      return NextResponse.json({ error: 'Selected doctor is not available.' }, { status: 400 })
    }

    const { data: existingConflict } = await admin
      .from('appointments')
      .select('id')
      .eq('doctor_id', doctorId)
      .eq('appointment_date', appointmentDate)
      .eq('appointment_time', appointmentTime)
      .not('status', 'eq', 'cancelled')
      .limit(1)

    if (existingConflict && existingConflict.length > 0) {
      return NextResponse.json(
        { error: 'This doctor already has an appointment at the selected time.' },
        { status: 409 }
      )
    }

    let patientId: string | null = null

    const { data: linkedPatient } = await admin
      .from('patients')
      .select('id')
      .eq('hospital_id', hospitalId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (linkedPatient?.id) {
      patientId = linkedPatient.id
    }

    if (!patientId && user.email) {
      const { data: emailMatch } = await admin
        .from('patients')
        .select('id')
        .eq('hospital_id', hospitalId)
        .eq('email', user.email)
        .is('user_id', null)
        .limit(1)
        .maybeSingle()

      if (emailMatch?.id) {
        const { data: relinkedPatient } = await admin
          .from('patients')
          .update({ user_id: user.id })
          .eq('id', emailMatch.id)
          .select('id')
          .single()

        patientId = relinkedPatient?.id || null
      }
    }

    if (!patientId) {
      const { data: userProfile } = await admin
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .maybeSingle()

      const { data: createdPatient, error: patientInsertError } = await admin
        .from('patients')
        .insert({
          hospital_id: hospitalId,
          user_id: user.id,
          full_name: userProfile?.full_name?.trim() || getPreferredName(user.email, user.user_metadata),
          email: user.email || null,
          phone: userProfile?.phone || null,
        })
        .select('id')
        .single()

      if (patientInsertError || !createdPatient?.id) {
        return NextResponse.json(
          { error: 'Could not create your patient profile for this hospital. Please try again.' },
          { status: 500 }
        )
      }

      patientId = createdPatient.id
    }

    const { data: appointment, error: appointmentError } = await admin
      .from('appointments')
      .insert({
        hospital_id: hospitalId,
        patient_id: patientId,
        doctor_id: doctorId,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        status: 'scheduled',
        reason,
        notes,
        created_by: user.id,
      })
      .select('id, appointment_date, appointment_time, status')
      .single()

    if (appointmentError || !appointment) {
      const code = appointmentError?.code || ''
      const message =
        code === '23514'
          ? 'Appointment details are invalid for this hospital.'
          : 'Could not book appointment. Please try another slot.'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    return NextResponse.json(
      {
        success: true,
        appointment,
        doctorName: doctor.full_name,
        hospitalName: hospital.name,
      },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'CDN-Cache-Control': 'no-store',
          'Netlify-CDN-Cache-Control': 'no-store',
        },
      }
    )
  } catch {
    return NextResponse.json(
      { error: 'Unexpected booking error. Please try again in a moment.' },
      { status: 500 }
    )
  }
}
