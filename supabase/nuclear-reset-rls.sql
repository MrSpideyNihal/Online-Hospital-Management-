-- =============================================================================
-- NUCLEAR RESET: Drops ALL existing RLS policies + recreates everything clean
-- SAFE TO RUN multiple times. Paste this ENTIRE script into Supabase SQL Editor.
-- =============================================================================

-- =============================================================================
-- STEP 1: DROP ALL EXISTING POLICIES (every table, every policy)
-- =============================================================================
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
            pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- =============================================================================
-- STEP 2: Ensure RLS is enabled on all tables
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
-- STEP 3: Create/replace SECURITY DEFINER helper functions
-- These bypass RLS themselves, preventing infinite recursion on profiles
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
-- STEP 4: Create all policies fresh
-- =============================================================================

-- ===== HOSPITALS =====
CREATE POLICY "hospitals_public_read" ON hospitals
  FOR SELECT USING (status = 'approved');

CREATE POLICY "hospitals_super_admin_read" ON hospitals
  FOR SELECT USING (public.get_my_role() = 'super_admin');

CREATE POLICY "hospitals_owner_update" ON hospitals
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "hospitals_auth_insert" ON hospitals
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ===== HOSPITAL SERVICES =====
CREATE POLICY "services_public_read" ON hospital_services
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM hospitals WHERE id = hospital_id AND status = 'approved')
  );

CREATE POLICY "services_staff_manage" ON hospital_services
  FOR ALL USING (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() IN ('hospital_admin', 'receptionist')
  );

-- ===== PROFILES (NO self-referencing queries — uses helper functions) =====
CREATE POLICY "profiles_own_read" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_staff_read" ON profiles
  FOR SELECT USING (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() IN ('hospital_admin', 'doctor', 'receptionist')
  );

CREATE POLICY "profiles_own_update" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "profiles_own_insert" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- ===== PATIENTS =====
CREATE POLICY "patients_staff_read" ON patients
  FOR SELECT USING (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() IN ('hospital_admin', 'doctor', 'receptionist')
  );

CREATE POLICY "patients_own_read" ON patients
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "patients_staff_manage" ON patients
  FOR ALL USING (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() IN ('hospital_admin', 'doctor', 'receptionist')
  );

-- ===== DOCTORS =====
CREATE POLICY "doctors_public_read" ON doctors
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM hospitals WHERE id = hospital_id AND status = 'approved')
  );

CREATE POLICY "doctors_admin_manage" ON doctors
  FOR ALL USING (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() = 'hospital_admin'
  );

-- ===== APPOINTMENTS =====
CREATE POLICY "appointments_staff_manage" ON appointments
  FOR ALL USING (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() IN ('hospital_admin', 'doctor', 'receptionist')
  );

CREATE POLICY "appointments_patient_read" ON appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = appointments.patient_id
      AND patients.user_id = auth.uid()
    )
  );

CREATE POLICY "appointments_patient_insert" ON appointments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = appointments.patient_id
      AND patients.user_id = auth.uid()
    )
  );

-- ===== VISITS =====
CREATE POLICY "visits_staff_manage" ON visits
  FOR ALL USING (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() IN ('hospital_admin', 'doctor', 'receptionist')
  );

CREATE POLICY "visits_patient_read" ON visits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = visits.patient_id
      AND patients.user_id = auth.uid()
    )
  );

-- ===== DENTAL CHARTS =====
CREATE POLICY "dental_charts_staff_manage" ON dental_charts
  FOR ALL USING (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() IN ('hospital_admin', 'doctor')
  );

CREATE POLICY "dental_charts_patient_read" ON dental_charts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = dental_charts.patient_id
      AND patients.user_id = auth.uid()
    )
  );

-- ===== TREATMENTS =====
CREATE POLICY "treatments_staff_manage" ON treatments
  FOR ALL USING (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() IN ('hospital_admin', 'doctor')
  );

CREATE POLICY "treatments_patient_read" ON treatments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = treatments.patient_id
      AND patients.user_id = auth.uid()
    )
  );

-- ===== PRESCRIPTIONS =====
CREATE POLICY "prescriptions_staff_manage" ON prescriptions
  FOR ALL USING (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() IN ('hospital_admin', 'doctor')
  );

CREATE POLICY "prescriptions_patient_read" ON prescriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = prescriptions.patient_id
      AND patients.user_id = auth.uid()
    )
  );

-- ===== INVOICES =====
CREATE POLICY "invoices_staff_manage" ON invoices
  FOR ALL USING (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() IN ('hospital_admin', 'receptionist')
  );

CREATE POLICY "invoices_patient_read" ON invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = invoices.patient_id
      AND patients.user_id = auth.uid()
    )
  );

-- ===== NOTIFICATIONS =====
CREATE POLICY "notifications_own_read" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_own_update" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "notifications_auth_insert" ON notifications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ===== TESTIMONIALS =====
CREATE POLICY "testimonials_public_read" ON testimonials
  FOR SELECT USING (
    is_approved = true AND
    EXISTS (SELECT 1 FROM hospitals WHERE id = hospital_id AND status = 'approved')
  );

CREATE POLICY "testimonials_admin_manage" ON testimonials
  FOR ALL USING (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() = 'hospital_admin'
  );

-- =============================================================================
-- STEP 5: Recreate handle_new_user trigger (auto-create profile on sign-up)
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- STEP 6: Set nihalrodge01@gmail.com as super_admin (if profile exists)
-- =============================================================================
UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'nihalrodge01@gmail.com';

-- =============================================================================
-- DONE! All policies recreated cleanly. No infinite recursion.
-- =============================================================================
SELECT 'SUCCESS: All RLS policies reset. ' || count(*) || ' policies created.'
FROM pg_policies WHERE schemaname = 'public';
