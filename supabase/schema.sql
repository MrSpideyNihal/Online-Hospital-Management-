-- =============================================================================
-- DENTAL HOSPITAL MANAGEMENT SYSTEM – COMPLETE DATABASE SCHEMA
-- Multi-tenant with hospital_id + Row Level Security
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. HOSPITALS (Central Registry)
-- =============================================================================
CREATE TABLE hospitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  country TEXT DEFAULT 'India',
  logo_url TEXT,
  banner_url TEXT,
  primary_color TEXT DEFAULT '#0ea5e9',
  secondary_color TEXT DEFAULT '#6366f1',
  about_text TEXT,
  mission TEXT,
  map_embed_url TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  rating DECIMAL(2, 1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'frozen')),
  subscription_plan TEXT DEFAULT 'trial' CHECK (subscription_plan IN ('trial', 'basic', 'premium', 'enterprise')),
  subscription_start TIMESTAMPTZ,
  subscription_end TIMESTAMPTZ,
  is_frozen BOOLEAN DEFAULT false,
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 2. HOSPITAL SERVICES (for search/filter)
-- =============================================================================
CREATE TABLE hospital_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  duration_minutes INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 3. PROFILES (Users linked to hospitals)
-- =============================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'patient' CHECK (role IN ('super_admin', 'hospital_admin', 'doctor', 'receptionist', 'patient')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 4. PATIENTS
-- =============================================================================
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  patient_id_number TEXT, -- Hospital-specific patient ID (e.g., PAT-001)
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  blood_group TEXT,
  address TEXT,
  city TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  allergies TEXT[],
  medical_history TEXT,
  notes TEXT,
  qr_code TEXT,
  last_visit DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 5. DOCTORS
-- =============================================================================
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  specialization TEXT,
  qualification TEXT,
  experience_years INTEGER,
  license_number TEXT,
  avatar_url TEXT,
  consultation_fee DECIMAL(10, 2),
  bio TEXT,
  is_active BOOLEAN DEFAULT true,
  schedule JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 6. APPOINTMENTS
-- =============================================================================
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  reason TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 7. VISITS (OPD)
-- =============================================================================
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id),
  visit_date DATE DEFAULT CURRENT_DATE,
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  chief_complaint TEXT,
  diagnosis TEXT,
  treatment_notes TEXT,
  vitals JSONB DEFAULT '{}',
  queue_number INTEGER,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 8. DENTAL CHARTS
-- =============================================================================
CREATE TABLE dental_charts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_id UUID REFERENCES visits(id),
  tooth_number INTEGER NOT NULL CHECK (tooth_number >= 1 AND tooth_number <= 32),
  condition TEXT NOT NULL,
  surface TEXT,
  notes TEXT,
  recorded_by UUID REFERENCES auth.users(id),
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 9. TREATMENTS
-- =============================================================================
CREATE TABLE treatments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_id UUID REFERENCES visits(id),
  tooth_number INTEGER,
  treatment_type TEXT NOT NULL,
  description TEXT,
  estimated_cost DECIMAL(10, 2),
  actual_cost DECIMAL(10, 2),
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  planned_date DATE,
  completed_date DATE,
  performed_by UUID REFERENCES doctors(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 10. PRESCRIPTIONS
-- =============================================================================
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_id UUID REFERENCES visits(id),
  doctor_id UUID NOT NULL REFERENCES doctors(id),
  medicines JSONB NOT NULL DEFAULT '[]',
  instructions TEXT,
  diagnosis TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 11. INVOICES
-- =============================================================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_id UUID REFERENCES visits(id),
  invoice_number TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) DEFAULT 0,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
  payment_method TEXT,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 12. NOTIFICATIONS
-- =============================================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'appointment', 'payment')),
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 13. TESTIMONIALS
-- =============================================================================
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX idx_hospitals_slug ON hospitals(slug);
CREATE INDEX idx_hospitals_city ON hospitals(city);
CREATE INDEX idx_hospitals_status ON hospitals(status);
CREATE INDEX idx_hospital_services_hospital ON hospital_services(hospital_id);
CREATE INDEX idx_profiles_hospital ON profiles(hospital_id);
CREATE INDEX idx_patients_hospital ON patients(hospital_id);
CREATE INDEX idx_patients_user ON patients(user_id);
CREATE INDEX idx_doctors_hospital ON doctors(hospital_id);
CREATE INDEX idx_appointments_hospital ON appointments(hospital_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_visits_hospital ON visits(hospital_id);
CREATE INDEX idx_visits_patient ON visits(patient_id);
CREATE INDEX idx_dental_charts_patient ON dental_charts(patient_id);
CREATE INDEX idx_treatments_patient ON treatments(patient_id);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_invoices_hospital ON invoices(hospital_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE dental_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- HELPER FUNCTIONS (SECURITY DEFINER = bypass RLS, prevents infinite recursion)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_my_hospital_id()
RETURNS UUID AS $$
  SELECT hospital_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================================================
-- HOSPITALS: Anyone can read approved, owners can update, auth users can insert
-- =============================================================================
CREATE POLICY "Public can view approved hospitals" ON hospitals
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Super admin can view all hospitals" ON hospitals
  FOR SELECT USING (public.get_my_role() = 'super_admin');

CREATE POLICY "Hospital owners can update their hospital" ON hospitals
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Authenticated users can insert hospitals" ON hospitals
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================================================
-- HOSPITAL SERVICES
-- =============================================================================
CREATE POLICY "Public can view services of approved hospitals" ON hospital_services
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM hospitals WHERE id = hospital_id AND status = 'approved')
  );

CREATE POLICY "Hospital staff can manage services" ON hospital_services
  FOR ALL USING (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() IN ('hospital_admin', 'receptionist')
  );

-- =============================================================================
-- PROFILES: NO self-referencing queries — use direct auth.uid() checks
-- =============================================================================
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Staff can view same-hospital profiles" ON profiles
  FOR SELECT USING (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() IN ('hospital_admin', 'doctor', 'receptionist')
  );

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Anyone can insert their profile" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- =============================================================================
-- PATIENTS
-- =============================================================================
CREATE POLICY "Hospital staff can view patients" ON patients
  FOR SELECT USING (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() IN ('hospital_admin', 'doctor', 'receptionist')
  );

CREATE POLICY "Patients can view own record" ON patients
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Hospital staff can manage patients" ON patients
  FOR ALL USING (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() IN ('hospital_admin', 'doctor', 'receptionist')
  );

-- =============================================================================
-- DOCTORS
-- =============================================================================
CREATE POLICY "Public can view doctors of approved hospitals" ON doctors
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM hospitals WHERE id = hospital_id AND status = 'approved')
  );

CREATE POLICY "Hospital admin can manage doctors" ON doctors
  FOR ALL USING (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() = 'hospital_admin'
  );

-- =============================================================================
-- APPOINTMENTS
-- =============================================================================
CREATE POLICY "Hospital staff can manage appointments" ON appointments
  FOR ALL USING (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() IN ('hospital_admin', 'doctor', 'receptionist')
  );

CREATE POLICY "Patients can view own appointments" ON appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = appointments.patient_id
      AND patients.user_id = auth.uid()
    )
  );

CREATE POLICY "Patients can create appointments" ON appointments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = appointments.patient_id
      AND patients.user_id = auth.uid()
    )
  );

-- =============================================================================
-- VISITS
-- =============================================================================
CREATE POLICY "Hospital staff can manage visits" ON visits
  FOR ALL USING (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() IN ('hospital_admin', 'doctor', 'receptionist')
  );

CREATE POLICY "Patients can view own visits" ON visits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = visits.patient_id
      AND patients.user_id = auth.uid()
    )
  );

-- =============================================================================
-- DENTAL CHARTS
-- =============================================================================
CREATE POLICY "Hospital staff can manage dental charts" ON dental_charts
  FOR ALL USING (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() IN ('hospital_admin', 'doctor')
  );

CREATE POLICY "Patients can view own dental charts" ON dental_charts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = dental_charts.patient_id
      AND patients.user_id = auth.uid()
    )
  );

-- =============================================================================
-- TREATMENTS
-- =============================================================================
CREATE POLICY "Hospital staff can manage treatments" ON treatments
  FOR ALL USING (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() IN ('hospital_admin', 'doctor')
  );

CREATE POLICY "Patients can view own treatments" ON treatments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = treatments.patient_id
      AND patients.user_id = auth.uid()
    )
  );

-- =============================================================================
-- PRESCRIPTIONS
-- =============================================================================
CREATE POLICY "Hospital staff can manage prescriptions" ON prescriptions
  FOR ALL USING (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() IN ('hospital_admin', 'doctor')
  );

CREATE POLICY "Patients can view own prescriptions" ON prescriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = prescriptions.patient_id
      AND patients.user_id = auth.uid()
    )
  );

-- =============================================================================
-- INVOICES
-- =============================================================================
CREATE POLICY "Hospital staff can manage invoices" ON invoices
  FOR ALL USING (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() IN ('hospital_admin', 'receptionist')
  );

CREATE POLICY "Patients can view own invoices" ON invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = invoices.patient_id
      AND patients.user_id = auth.uid()
    )
  );

-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Staff can create notifications" ON notifications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================================================
-- TESTIMONIALS
-- =============================================================================
CREATE POLICY "Public can view approved testimonials" ON testimonials
  FOR SELECT USING (
    is_approved = true AND
    EXISTS (SELECT 1 FROM hospitals WHERE id = hospital_id AND status = 'approved')
  );

CREATE POLICY "Hospital admin can manage testimonials" ON testimonials
  FOR ALL USING (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() = 'hospital_admin'
  );

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_hospitals_updated_at
  BEFORE UPDATE ON hospitals FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_visits_updated_at
  BEFORE UPDATE ON visits FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_treatments_updated_at
  BEFORE UPDATE ON treatments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Generate patient ID number
CREATE OR REPLACE FUNCTION generate_patient_id(h_id UUID)
RETURNS TEXT AS $$
DECLARE
  count INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO count FROM patients WHERE hospital_id = h_id;
  RETURN 'PAT-' || LPAD(count::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number(h_id UUID)
RETURNS TEXT AS $$
DECLARE
  count INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO count FROM invoices WHERE hospital_id = h_id;
  RETURN 'INV-' || TO_CHAR(NOW(), 'YYYYMM') || '-' || LPAD(count::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- AUTO-CREATE PROFILE ON SIGN-UP (Google OAuth trigger)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    'patient'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: runs after every new user sign-up (Google, email, etc.)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- IMPORTANT
-- =============================================================================
-- For production databases, run `supabase/production-hardening.sql` after this
-- base schema to apply strict write policies, race-safe ID generation, and
-- appointment double-booking protection.
