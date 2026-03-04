import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type {
    Patient, Doctor, Appointment, Visit, DentalChart,
    Prescription, Invoice, Hospital, HospitalService, Testimonial,
    Notification, Treatment,
} from '@/types/database'

const supabase = createClient()

// ============================================================
// PATIENTS
// ============================================================

export function usePatients(hospitalId: string | null) {
    return useQuery({
        queryKey: ['patients', hospitalId],
        queryFn: async () => {
            if (!hospitalId) return []
            const { data, error } = await supabase
                .from('patients')
                .select('*')
                .eq('hospital_id', hospitalId)
                .order('created_at', { ascending: false })
            if (error) throw error
            return data as Patient[]
        },
        enabled: !!hospitalId,
    })
}

export function usePatient(patientId: string | null) {
    return useQuery({
        queryKey: ['patient', patientId],
        queryFn: async () => {
            if (!patientId) return null
            const { data, error } = await supabase
                .from('patients')
                .select('*')
                .eq('id', patientId)
                .single()
            if (error) throw error
            return data as Patient
        },
        enabled: !!patientId,
    })
}

export function useCreatePatient() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (patient: Partial<Patient> & { hospital_id: string; full_name: string }) => {
            const { data, error } = await supabase
                .from('patients')
                .insert(patient)
                .select()
                .single()
            if (error) throw error
            return data as Patient
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['patients', data.hospital_id] })
        },
    })
}

export function useUpdatePatient() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Patient> & { id: string }) => {
            const { data, error } = await supabase
                .from('patients')
                .update(updates)
                .eq('id', id)
                .select()
                .single()
            if (error) throw error
            return data as Patient
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['patients', data.hospital_id] })
            queryClient.invalidateQueries({ queryKey: ['patient', data.id] })
        },
    })
}

export function useDeletePatient() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, hospitalId }: { id: string; hospitalId: string }) => {
            const { error } = await supabase.from('patients').delete().eq('id', id)
            if (error) throw error
            return { id, hospitalId }
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['patients', data.hospitalId] })
        },
    })
}

// ============================================================
// DOCTORS
// ============================================================

export function useDoctors(hospitalId: string | null) {
    return useQuery({
        queryKey: ['doctors', hospitalId],
        queryFn: async () => {
            if (!hospitalId) return []
            const { data, error } = await supabase
                .from('doctors')
                .select('*')
                .eq('hospital_id', hospitalId)
                .order('full_name')
            if (error) throw error
            return data as Doctor[]
        },
        enabled: !!hospitalId,
    })
}

export function useCreateDoctor() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (doctor: Partial<Doctor> & { hospital_id: string; full_name: string }) => {
            const { data, error } = await supabase
                .from('doctors')
                .insert(doctor)
                .select()
                .single()
            if (error) throw error
            return data as Doctor
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['doctors', data.hospital_id] })
        },
    })
}

export function useUpdateDoctor() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Doctor> & { id: string }) => {
            const { data, error } = await supabase
                .from('doctors')
                .update(updates)
                .eq('id', id)
                .select()
                .single()
            if (error) throw error
            return data as Doctor
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['doctors', data.hospital_id] })
        },
    })
}

// ============================================================
// APPOINTMENTS
// ============================================================

export function useAppointments(hospitalId: string | null, filters?: { date?: string; status?: string; doctorId?: string }) {
    return useQuery({
        queryKey: ['appointments', hospitalId, filters],
        queryFn: async () => {
            if (!hospitalId) return []
            let query = supabase
                .from('appointments')
                .select('*, patients(full_name, patient_id_number), doctors(full_name)')
                .eq('hospital_id', hospitalId)
                .order('appointment_date', { ascending: true })
                .order('appointment_time', { ascending: true })

            if (filters?.date) query = query.eq('appointment_date', filters.date)
            if (filters?.status && filters.status !== 'all') query = query.eq('status', filters.status)
            if (filters?.doctorId) query = query.eq('doctor_id', filters.doctorId)

            const { data, error } = await query
            if (error) throw error
            return data
        },
        enabled: !!hospitalId,
    })
}

export function useCreateAppointment() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (appointment: Partial<Appointment> & { hospital_id: string }) => {
            const { data, error } = await supabase
                .from('appointments')
                .insert(appointment)
                .select()
                .single()
            if (error) throw error
            return data as Appointment
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['appointments', data.hospital_id] })
        },
    })
}

export function useUpdateAppointment() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Appointment> & { id: string }) => {
            const { data, error } = await supabase
                .from('appointments')
                .update(updates)
                .eq('id', id)
                .select()
                .single()
            if (error) throw error
            return data as Appointment
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['appointments', data.hospital_id] })
        },
    })
}

// ============================================================
// VISITS (OPD)
// ============================================================

export function useVisits(hospitalId: string | null, date?: string) {
    return useQuery({
        queryKey: ['visits', hospitalId, date],
        queryFn: async () => {
            if (!hospitalId) return []
            let query = supabase
                .from('visits')
                .select('*, patients(full_name, patient_id_number), doctors(full_name)')
                .eq('hospital_id', hospitalId)
                .order('queue_number', { ascending: true })

            if (date) query = query.gte('created_at', `${date}T00:00:00`).lte('created_at', `${date}T23:59:59`)

            const { data, error } = await query
            if (error) throw error
            return data
        },
        enabled: !!hospitalId,
    })
}

export function useCreateVisit() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (visit: Partial<Visit> & { hospital_id: string }) => {
            const { data, error } = await supabase
                .from('visits')
                .insert(visit)
                .select()
                .single()
            if (error) throw error
            return data as Visit
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['visits', data.hospital_id] })
        },
    })
}

export function useUpdateVisit() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Visit> & { id: string }) => {
            const { data, error } = await supabase
                .from('visits')
                .update(updates)
                .eq('id', id)
                .select()
                .single()
            if (error) throw error
            return data as Visit
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['visits', data.hospital_id] })
        },
    })
}

// ============================================================
// DENTAL CHARTS (per-tooth records)
// ============================================================

export function useDentalChartRecords(patientId: string | null) {
    return useQuery({
        queryKey: ['dental-chart', patientId],
        queryFn: async () => {
            if (!patientId) return []
            const { data, error } = await supabase
                .from('dental_charts')
                .select('*')
                .eq('patient_id', patientId)
                .order('recorded_at', { ascending: false })
            if (error) throw error
            return data as DentalChart[]
        },
        enabled: !!patientId,
    })
}

export function useSaveDentalChartRecord() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (record: Omit<DentalChart, 'id' | 'recorded_at'>) => {
            const { data, error } = await supabase
                .from('dental_charts')
                .insert(record)
                .select()
                .single()
            if (error) throw error
            return data as DentalChart
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['dental-chart', data.patient_id] })
        },
    })
}

// ============================================================
// PRESCRIPTIONS
// ============================================================

export function usePrescriptions(hospitalId: string | null) {
    return useQuery({
        queryKey: ['prescriptions', hospitalId],
        queryFn: async () => {
            if (!hospitalId) return []
            const { data, error } = await supabase
                .from('prescriptions')
                .select('*, patients(full_name), doctors(full_name)')
                .eq('hospital_id', hospitalId)
                .order('created_at', { ascending: false })
            if (error) throw error
            return data
        },
        enabled: !!hospitalId,
    })
}

export function useCreatePrescription() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (rx: Partial<Prescription> & { hospital_id: string }) => {
            const { data, error } = await supabase
                .from('prescriptions')
                .insert(rx)
                .select()
                .single()
            if (error) throw error
            return data as Prescription
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['prescriptions', data.hospital_id] })
        },
    })
}

// ============================================================
// INVOICES / BILLING
// ============================================================

export function useInvoices(hospitalId: string | null) {
    return useQuery({
        queryKey: ['invoices', hospitalId],
        queryFn: async () => {
            if (!hospitalId) return []
            const { data, error } = await supabase
                .from('invoices')
                .select('*, patients(full_name)')
                .eq('hospital_id', hospitalId)
                .order('created_at', { ascending: false })
            if (error) throw error
            return data
        },
        enabled: !!hospitalId,
    })
}

export function useCreateInvoice() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (invoice: Partial<Invoice> & { hospital_id: string }) => {
            const { data, error } = await supabase
                .from('invoices')
                .insert(invoice)
                .select()
                .single()
            if (error) throw error
            return data as Invoice
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['invoices', data.hospital_id] })
        },
    })
}

export function useUpdateInvoice() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Invoice> & { id: string }) => {
            const { data, error } = await supabase
                .from('invoices')
                .update(updates)
                .eq('id', id)
                .select()
                .single()
            if (error) throw error
            return data as Invoice
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['invoices', data.hospital_id] })
        },
    })
}

// ============================================================
// HOSPITAL (Public Website)
// ============================================================

export function useHospitalBySlug(slug: string) {
    return useQuery({
        queryKey: ['hospital', slug],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('hospitals')
                .select('*')
                .eq('slug', slug)
                .eq('status', 'approved')
                .single()
            if (error) throw error
            return data as Hospital
        },
        enabled: !!slug,
    })
}

export function useHospitalServices(hospitalId: string | null) {
    return useQuery({
        queryKey: ['hospital-services', hospitalId],
        queryFn: async () => {
            if (!hospitalId) return []
            const { data, error } = await supabase
                .from('hospital_services')
                .select('*')
                .eq('hospital_id', hospitalId)
                .eq('is_active', true)
                .order('service_name')
            if (error) throw error
            return data as HospitalService[]
        },
        enabled: !!hospitalId,
    })
}

export function useTestimonials(hospitalId: string | null) {
    return useQuery({
        queryKey: ['testimonials', hospitalId],
        queryFn: async () => {
            if (!hospitalId) return []
            const { data, error } = await supabase
                .from('testimonials')
                .select('*')
                .eq('hospital_id', hospitalId)
                .eq('is_approved', true)
                .order('created_at', { ascending: false })
            if (error) throw error
            return data as Testimonial[]
        },
        enabled: !!hospitalId,
    })
}

export function useUpdateHospital() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Hospital> & { id: string }) => {
            const { data, error } = await supabase
                .from('hospitals')
                .update(updates)
                .eq('id', id)
                .select()
                .single()
            if (error) throw error
            return data as Hospital
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['hospital', data.slug] })
        },
    })
}

// ============================================================
// SEARCH (Central Portal)
// ============================================================

export function useSearchHospitals(searchQuery: string, city?: string) {
    return useQuery({
        queryKey: ['search-hospitals', searchQuery, city],
        queryFn: async () => {
            let q = supabase
                .from('hospitals')
                .select('*')
                .eq('status', 'approved')
                .order('name')

            if (searchQuery) q = q.ilike('name', `%${searchQuery}%`)
            if (city) q = q.ilike('city', `%${city}%`)

            const { data, error } = await q
            if (error) {
                console.warn('[Hooks] Search hospitals error:', error.message)
                return [] as Hospital[]
            }
            return data as Hospital[]
        },
        enabled: searchQuery.length > 0 || !!city,
        retry: 1,
    })
}

// ============================================================
// SUPER ADMIN (via API routes to bypass RLS)
// ============================================================

export function useAllHospitals(status?: string) {
    return useQuery({
        queryKey: ['all-hospitals', status],
        queryFn: async () => {
            const params = new URLSearchParams()
            if (status && status !== 'all') params.set('status', status)
            const res = await fetch(`/api/admin/hospitals?${params.toString()}`)
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Failed to fetch hospitals')
            }
            return (await res.json()) as Hospital[]
        },
    })
}

export function useApproveHospital() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (hospitalId: string) => {
            const res = await fetch('/api/admin/hospitals', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hospitalId, action: 'approve' }),
            })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Failed to approve')
            }
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-hospitals'] })
        },
    })
}

export function useRejectHospital() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (hospitalId: string) => {
            const res = await fetch('/api/admin/hospitals', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hospitalId, action: 'reject' }),
            })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Failed to reject')
            }
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-hospitals'] })
        },
    })
}

export function useFreezeHospital() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ hospitalId, freeze }: { hospitalId: string; freeze: boolean }) => {
            const res = await fetch('/api/admin/hospitals', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hospitalId, action: freeze ? 'freeze' : 'unfreeze' }),
            })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Failed to update')
            }
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-hospitals'] })
        },
    })
}

// ============================================================
// NOTIFICATIONS
// ============================================================

export function useNotifications(userId: string | null) {
    return useQuery({
        queryKey: ['notifications', userId],
        queryFn: async () => {
            if (!userId) return []
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(50)
            if (error) throw error
            return data as Notification[]
        },
        enabled: !!userId,
    })
}

export function useMarkNotificationRead() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
        },
    })
}

// ============================================================
// HOSPITAL SERVICES (mutations)
// ============================================================

export function useCreateHospitalService() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (service: Partial<HospitalService> & { hospital_id: string; service_name: string }) => {
            const { data, error } = await supabase
                .from('hospital_services')
                .insert(service)
                .select()
                .single()
            if (error) throw error
            return data as HospitalService
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['hospital-services', data.hospital_id] })
        },
    })
}

export function useUpdateHospitalService() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, ...updates }: Partial<HospitalService> & { id: string }) => {
            const { data, error } = await supabase
                .from('hospital_services')
                .update(updates)
                .eq('id', id)
                .select()
                .single()
            if (error) throw error
            return data as HospitalService
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['hospital-services', data.hospital_id] })
        },
    })
}

export function useDeleteHospitalService() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, hospitalId }: { id: string; hospitalId: string }) => {
            const { error } = await supabase.from('hospital_services').delete().eq('id', id)
            if (error) throw error
            return { id, hospitalId }
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['hospital-services', data.hospitalId] })
        },
    })
}

// ============================================================
// DASHBOARD STATS
// ============================================================

export function useDashboardStats(hospitalId: string | null) {
    return useQuery({
        queryKey: ['dashboard-stats', hospitalId],
        queryFn: async () => {
            if (!hospitalId) return null
            const today = new Date().toISOString().split('T')[0]

            const [patientsRes, doctorsRes, todayApptsRes, todayVisitsRes, invoicesRes] = await Promise.all([
                supabase.from('patients').select('id', { count: 'exact', head: true }).eq('hospital_id', hospitalId),
                supabase.from('doctors').select('id', { count: 'exact', head: true }).eq('hospital_id', hospitalId).eq('is_active', true),
                supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('hospital_id', hospitalId).eq('appointment_date', today),
                supabase.from('visits').select('id', { count: 'exact', head: true }).eq('hospital_id', hospitalId).gte('created_at', `${today}T00:00:00`),
                supabase.from('invoices').select('total, payment_status').eq('hospital_id', hospitalId),
            ])

            const todayRevenue = (invoicesRes.data || [])
                .filter((i: Record<string, unknown>) => i.payment_status === 'paid')
                .reduce((sum: number, i: Record<string, unknown>) => sum + (Number(i.total) || 0), 0)
            const pendingPayments = (invoicesRes.data || [])
                .filter((i: Record<string, unknown>) => i.payment_status !== 'paid')
                .reduce((sum: number, i: Record<string, unknown>) => sum + (Number(i.total) || 0), 0)

            return {
                totalPatients: patientsRes.count || 0,
                totalDoctors: doctorsRes.count || 0,
                todayAppointments: todayApptsRes.count || 0,
                todayVisits: todayVisitsRes.count || 0,
                todayRevenue,
                pendingPayments,
            }
        },
        enabled: !!hospitalId,
        refetchInterval: 30000,
    })
}

// ============================================================
// TREATMENTS
// ============================================================

export function useTreatments(hospitalId: string | null) {
    return useQuery({
        queryKey: ['treatments', hospitalId],
        queryFn: async () => {
            if (!hospitalId) return []
            const { data, error } = await supabase
                .from('treatments')
                .select('*, patients:patient_id(full_name)')
                .eq('hospital_id', hospitalId)
                .order('created_at', { ascending: false })
            if (error) throw error
            return data as (Treatment & { patients?: { full_name: string } })[]
        },
        enabled: !!hospitalId,
    })
}

export function useCreateTreatment() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (treatment: Partial<Treatment> & { hospital_id: string; patient_id: string; treatment_type: string }) => {
            const { data, error } = await supabase
                .from('treatments')
                .insert(treatment)
                .select()
                .single()
            if (error) throw error
            return data as Treatment
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['treatments', data.hospital_id] })
        },
    })
}

export function useUpdateTreatment() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Treatment> & { id: string }) => {
            const { data, error } = await supabase
                .from('treatments')
                .update(updates)
                .eq('id', id)
                .select()
                .single()
            if (error) throw error
            return data as Treatment
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['treatments', data.hospital_id] })
        },
    })
}
