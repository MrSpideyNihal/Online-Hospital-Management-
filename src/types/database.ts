// =============================================================================
// DATABASE TYPES – Auto-generated from schema
// =============================================================================

export type HospitalStatus = 'pending' | 'approved' | 'rejected' | 'frozen'
export type SubscriptionPlan = 'trial' | 'basic' | 'premium' | 'enterprise'
export type UserRole = 'super_admin' | 'hospital_admin' | 'doctor' | 'receptionist' | 'patient'
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
export type VisitStatus = 'waiting' | 'in_progress' | 'completed' | 'cancelled'
export type TreatmentStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled'
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded'
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'appointment' | 'payment'
export type Gender = 'male' | 'female' | 'other'

export interface Hospital {
    id: string
    name: string
    slug: string
    email: string
    phone: string | null
    address: string | null
    city: string | null
    state: string | null
    pincode: string | null
    country: string
    logo_url: string | null
    banner_url: string | null
    primary_color: string
    secondary_color: string
    about_text: string | null
    mission: string | null
    map_embed_url: string | null
    latitude: number | null
    longitude: number | null
    rating: number
    total_reviews: number
    status: HospitalStatus
    subscription_plan: SubscriptionPlan
    subscription_start: string | null
    subscription_end: string | null
    is_frozen: boolean
    owner_id: string | null
    created_at: string
    updated_at: string
}

export interface Profile {
    id: string
    hospital_id: string | null
    email: string
    full_name: string | null
    phone: string | null
    avatar_url: string | null
    role: UserRole
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface Patient {
    id: string
    hospital_id: string
    user_id: string | null
    patient_id_number: string | null
    full_name: string
    email: string | null
    phone: string | null
    date_of_birth: string | null
    gender: Gender | null
    blood_group: string | null
    address: string | null
    city: string | null
    emergency_contact_name: string | null
    emergency_contact_phone: string | null
    allergies: string[] | null
    medical_history: string | null
    notes: string | null
    qr_code: string | null
    last_visit: string | null
    created_at: string
    updated_at: string
}

export interface Doctor {
    id: string
    hospital_id: string
    user_id: string | null
    full_name: string
    email: string | null
    phone: string | null
    specialization: string | null
    qualification: string | null
    experience_years: number | null
    license_number: string | null
    avatar_url: string | null
    consultation_fee: number | null
    bio: string | null
    is_active: boolean
    schedule: Record<string, unknown>
    created_at: string
    updated_at: string
}

export interface Appointment {
    id: string
    hospital_id: string
    patient_id: string
    doctor_id: string
    appointment_date: string
    appointment_time: string
    duration_minutes: number
    status: AppointmentStatus
    reason: string | null
    notes: string | null
    created_by: string | null
    created_at: string
    updated_at: string
    // Joined fields
    patient?: Patient
    doctor?: Doctor
}

export interface Visit {
    id: string
    hospital_id: string
    patient_id: string
    doctor_id: string
    appointment_id: string | null
    visit_date: string
    check_in_time: string | null
    check_out_time: string | null
    chief_complaint: string | null
    diagnosis: string | null
    treatment_notes: string | null
    vitals: Record<string, unknown>
    queue_number: number | null
    status: VisitStatus
    created_at: string
    updated_at: string
    // Joined
    patient?: Patient
    doctor?: Doctor
}

export interface DentalChart {
    id: string
    hospital_id: string
    patient_id: string
    visit_id: string | null
    tooth_number: number
    condition: string
    surface: string | null
    notes: string | null
    recorded_by: string | null
    recorded_at: string
}

export interface Treatment {
    id: string
    hospital_id: string
    patient_id: string
    visit_id: string | null
    tooth_number: number | null
    treatment_type: string
    description: string | null
    estimated_cost: number | null
    actual_cost: number | null
    status: TreatmentStatus
    planned_date: string | null
    completed_date: string | null
    performed_by: string | null
    notes: string | null
    created_at: string
    updated_at: string
}

export interface Prescription {
    id: string
    hospital_id: string
    patient_id: string
    visit_id: string | null
    doctor_id: string
    medicines: Medicine[]
    instructions: string | null
    diagnosis: string | null
    pdf_url: string | null
    created_at: string
    // Joined
    patient?: Patient
    doctor?: Doctor
}

export interface Medicine {
    name: string
    dosage: string
    frequency: string
    duration: string
    notes?: string
}

export interface Invoice {
    id: string
    hospital_id: string
    patient_id: string
    visit_id: string | null
    invoice_number: string
    items: InvoiceItem[]
    subtotal: number
    tax: number
    discount: number
    total: number
    payment_status: PaymentStatus
    payment_method: string | null
    paid_at: string | null
    notes: string | null
    created_at: string
    updated_at: string
    // Joined
    patient?: Patient
}

export interface InvoiceItem {
    description: string
    quantity: number
    unit_price: number
    total: number
}

export interface Notification {
    id: string
    hospital_id: string | null
    user_id: string | null
    title: string
    message: string
    type: NotificationType
    is_read: boolean
    link: string | null
    created_at: string
}

export interface Testimonial {
    id: string
    hospital_id: string
    patient_name: string
    content: string
    rating: number
    is_approved: boolean
    created_at: string
}

export interface HospitalService {
    id: string
    hospital_id: string
    service_name: string
    description: string | null
    price: number | null
    duration_minutes: number
    is_active: boolean
    created_at: string
}

// Dashboard stats
export interface DashboardStats {
    totalPatients: number
    todayAppointments: number
    todayVisits: number
    totalDoctors: number
    totalRevenue: number
    todayRevenue: number
    pendingPayments: number
}
