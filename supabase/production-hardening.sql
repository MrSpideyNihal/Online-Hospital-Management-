-- =============================================================================
-- PRODUCTION HARDENING PATCH
-- Run this once in Supabase SQL Editor on existing projects.
-- This script is idempotent and safe to re-run.
-- Supabase may show a "destructive operation" warning because policies/triggers
-- are dropped/recreated. This script does NOT drop tables or delete row data.
-- =============================================================================

-- =============================================================================
-- 1) Helper: allow writes only for approved + non-frozen hospitals
-- =============================================================================
CREATE OR REPLACE FUNCTION public.is_my_hospital_operational()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.hospitals h ON h.id = p.hospital_id
    WHERE p.id = auth.uid()
      AND h.status = 'approved'
      AND COALESCE(h.is_frozen, false) = false
  );
$$;

-- =============================================================================
-- 2) Prevent self role/hospital escalation in profiles
-- =============================================================================
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_own_update" ON profiles;
DROP POLICY IF EXISTS "profiles_own_update_safe" ON profiles;

CREATE POLICY "profiles_own_update_safe" ON profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = public.get_my_role()
    AND hospital_id IS NOT DISTINCT FROM public.get_my_hospital_id()
  );

-- =============================================================================
-- 3) Enforce operational status on staff mutations (+ strict WITH CHECK)
-- =============================================================================

-- Hospital services
DROP POLICY IF EXISTS "Hospital staff can manage services" ON hospital_services;
DROP POLICY IF EXISTS "services_staff_manage" ON hospital_services;

CREATE POLICY "services_staff_manage" ON hospital_services
  FOR ALL
  USING (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() IN ('hospital_admin', 'receptionist')
    AND public.is_my_hospital_operational()
  )
  WITH CHECK (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() IN ('hospital_admin', 'receptionist')
    AND public.is_my_hospital_operational()
  );

-- Patients
DROP POLICY IF EXISTS "Hospital staff can manage patients" ON patients;
DROP POLICY IF EXISTS "patients_staff_manage" ON patients;

CREATE POLICY "patients_staff_manage" ON patients
  FOR ALL
  USING (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() IN ('hospital_admin', 'doctor', 'receptionist')
    AND public.is_my_hospital_operational()
  )
  WITH CHECK (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() IN ('hospital_admin', 'doctor', 'receptionist')
    AND public.is_my_hospital_operational()
  );

-- Doctors
DROP POLICY IF EXISTS "Hospital admin can manage doctors" ON doctors;
DROP POLICY IF EXISTS "doctors_admin_manage" ON doctors;

CREATE POLICY "doctors_admin_manage" ON doctors
  FOR ALL
  USING (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() = 'hospital_admin'
    AND public.is_my_hospital_operational()
  )
  WITH CHECK (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() = 'hospital_admin'
    AND public.is_my_hospital_operational()
  );

-- Appointments
DROP POLICY IF EXISTS "Hospital staff can manage appointments" ON appointments;
DROP POLICY IF EXISTS "appointments_staff_manage" ON appointments;
DROP POLICY IF EXISTS "Patients can create appointments" ON appointments;
DROP POLICY IF EXISTS "appointments_patient_insert" ON appointments;

CREATE POLICY "appointments_staff_manage" ON appointments
  FOR ALL
  USING (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() IN ('hospital_admin', 'doctor', 'receptionist')
    AND public.is_my_hospital_operational()
  )
  WITH CHECK (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() IN ('hospital_admin', 'doctor', 'receptionist')
    AND public.is_my_hospital_operational()
    AND EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = appointments.patient_id
        AND p.hospital_id = appointments.hospital_id
    )
    AND EXISTS (
      SELECT 1 FROM public.doctors d
      WHERE d.id = appointments.doctor_id
        AND d.hospital_id = appointments.hospital_id
    )
  );

CREATE POLICY "appointments_patient_insert" ON appointments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.patients p
      JOIN public.hospitals h ON h.id = appointments.hospital_id
      WHERE p.id = appointments.patient_id
        AND p.user_id = auth.uid()
        AND p.hospital_id = appointments.hospital_id
        AND h.status = 'approved'
        AND COALESCE(h.is_frozen, false) = false
    )
    AND EXISTS (
      SELECT 1
      FROM public.doctors d
      WHERE d.id = appointments.doctor_id
        AND d.hospital_id = appointments.hospital_id
    )
  );

-- Visits
DROP POLICY IF EXISTS "Hospital staff can manage visits" ON visits;
DROP POLICY IF EXISTS "visits_staff_manage" ON visits;

CREATE POLICY "visits_staff_manage" ON visits
  FOR ALL
  USING (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() IN ('hospital_admin', 'doctor', 'receptionist')
    AND public.is_my_hospital_operational()
  )
  WITH CHECK (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() IN ('hospital_admin', 'doctor', 'receptionist')
    AND public.is_my_hospital_operational()
    AND EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = visits.patient_id
        AND p.hospital_id = visits.hospital_id
    )
    AND EXISTS (
      SELECT 1 FROM public.doctors d
      WHERE d.id = visits.doctor_id
        AND d.hospital_id = visits.hospital_id
    )
    AND (
      visits.appointment_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.appointments a
        WHERE a.id = visits.appointment_id
          AND a.hospital_id = visits.hospital_id
      )
    )
  );

-- Dental charts
DROP POLICY IF EXISTS "Hospital staff can manage dental charts" ON dental_charts;
DROP POLICY IF EXISTS "dental_charts_staff_manage" ON dental_charts;

CREATE POLICY "dental_charts_staff_manage" ON dental_charts
  FOR ALL
  USING (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() IN ('hospital_admin', 'doctor')
    AND public.is_my_hospital_operational()
  )
  WITH CHECK (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() IN ('hospital_admin', 'doctor')
    AND public.is_my_hospital_operational()
    AND EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = dental_charts.patient_id
        AND p.hospital_id = dental_charts.hospital_id
    )
    AND (
      dental_charts.visit_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.visits v
        WHERE v.id = dental_charts.visit_id
          AND v.hospital_id = dental_charts.hospital_id
      )
    )
  );

-- Treatments
DROP POLICY IF EXISTS "Hospital staff can manage treatments" ON treatments;
DROP POLICY IF EXISTS "treatments_staff_manage" ON treatments;

CREATE POLICY "treatments_staff_manage" ON treatments
  FOR ALL
  USING (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() IN ('hospital_admin', 'doctor')
    AND public.is_my_hospital_operational()
  )
  WITH CHECK (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() IN ('hospital_admin', 'doctor')
    AND public.is_my_hospital_operational()
    AND EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = treatments.patient_id
        AND p.hospital_id = treatments.hospital_id
    )
    AND (
      treatments.visit_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.visits v
        WHERE v.id = treatments.visit_id
          AND v.hospital_id = treatments.hospital_id
      )
    )
  );

-- Prescriptions
DROP POLICY IF EXISTS "Hospital staff can manage prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "prescriptions_staff_manage" ON prescriptions;

CREATE POLICY "prescriptions_staff_manage" ON prescriptions
  FOR ALL
  USING (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() IN ('hospital_admin', 'doctor')
    AND public.is_my_hospital_operational()
  )
  WITH CHECK (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() IN ('hospital_admin', 'doctor')
    AND public.is_my_hospital_operational()
    AND EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = prescriptions.patient_id
        AND p.hospital_id = prescriptions.hospital_id
    )
    AND EXISTS (
      SELECT 1 FROM public.doctors d
      WHERE d.id = prescriptions.doctor_id
        AND d.hospital_id = prescriptions.hospital_id
    )
    AND (
      prescriptions.visit_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.visits v
        WHERE v.id = prescriptions.visit_id
          AND v.hospital_id = prescriptions.hospital_id
      )
    )
  );

-- Invoices
DROP POLICY IF EXISTS "Hospital staff can manage invoices" ON invoices;
DROP POLICY IF EXISTS "invoices_staff_manage" ON invoices;

CREATE POLICY "invoices_staff_manage" ON invoices
  FOR ALL
  USING (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() IN ('hospital_admin', 'receptionist')
    AND public.is_my_hospital_operational()
  )
  WITH CHECK (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() IN ('hospital_admin', 'receptionist')
    AND public.is_my_hospital_operational()
    AND EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = invoices.patient_id
        AND p.hospital_id = invoices.hospital_id
    )
    AND (
      invoices.visit_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.visits v
        WHERE v.id = invoices.visit_id
          AND v.hospital_id = invoices.hospital_id
      )
    )
  );

-- Testimonials
DROP POLICY IF EXISTS "Hospital admin can manage testimonials" ON testimonials;
DROP POLICY IF EXISTS "testimonials_admin_manage" ON testimonials;

CREATE POLICY "testimonials_admin_manage" ON testimonials
  FOR ALL
  USING (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() = 'hospital_admin'
    AND public.is_my_hospital_operational()
  )
  WITH CHECK (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() = 'hospital_admin'
    AND public.is_my_hospital_operational()
  );

-- =============================================================================
-- 4) Race-safe ID generation for patients and invoices
-- =============================================================================

CREATE OR REPLACE FUNCTION public.assign_patient_id_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  next_seq integer;
BEGIN
  IF NEW.patient_id_number IS NOT NULL AND btrim(NEW.patient_id_number) <> '' THEN
    RETURN NEW;
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('patient-id:' || NEW.hospital_id::text));

  SELECT COUNT(*) + 1
  INTO next_seq
  FROM public.patients
  WHERE hospital_id = NEW.hospital_id;

  NEW.patient_id_number := 'PAT-' || LPAD(next_seq::text, 5, '0');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_patient_id_number_before_insert ON patients;
CREATE TRIGGER set_patient_id_number_before_insert
  BEFORE INSERT ON patients
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_patient_id_number();

CREATE OR REPLACE FUNCTION public.assign_invoice_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  ym text;
  next_seq integer;
BEGIN
  IF NEW.invoice_number IS NOT NULL AND btrim(NEW.invoice_number) <> '' THEN
    RETURN NEW;
  END IF;

  ym := to_char(COALESCE(NEW.created_at, NOW()), 'YYYYMM');
  PERFORM pg_advisory_xact_lock(hashtext('invoice-id:' || NEW.hospital_id::text || ':' || ym));

  SELECT COUNT(*) + 1
  INTO next_seq
  FROM public.invoices
  WHERE hospital_id = NEW.hospital_id
    AND to_char(created_at, 'YYYYMM') = ym;

  NEW.invoice_number := 'INV-' || ym || '-' || LPAD(next_seq::text, 4, '0');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_invoice_number_before_insert ON invoices;
CREATE TRIGGER set_invoice_number_before_insert
  BEFORE INSERT ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_invoice_number();

-- =============================================================================
-- 5) DB-level doctor slot lock to prevent concurrent double-booking
-- =============================================================================

CREATE OR REPLACE FUNCTION public.prevent_doctor_double_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF COALESCE(NEW.status, 'scheduled') IN ('cancelled', 'no_show') THEN
    RETURN NEW;
  END IF;

  PERFORM pg_advisory_xact_lock(
    hashtext(
      'appt-slot:'
      || NEW.doctor_id::text
      || ':' || NEW.appointment_date::text
      || ':' || NEW.appointment_time::text
    )
  );

  IF EXISTS (
    SELECT 1
    FROM public.appointments a
    WHERE a.doctor_id = NEW.doctor_id
      AND a.appointment_date = NEW.appointment_date
      AND a.appointment_time = NEW.appointment_time
      AND a.status NOT IN ('cancelled', 'no_show')
      AND (TG_OP = 'INSERT' OR a.id <> NEW.id)
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '23505',
      MESSAGE = 'Doctor already has an active appointment in this time slot';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_doctor_double_booking ON appointments;
CREATE TRIGGER trg_prevent_doctor_double_booking
  BEFORE INSERT OR UPDATE OF doctor_id, appointment_date, appointment_time, status
  ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_doctor_double_booking();

-- =============================================================================
-- 6) Helpful indexes
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_slot_status
  ON public.appointments (doctor_id, appointment_date, appointment_time, status);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'idx_patients_hospital_patient_id_unique'
  ) THEN
    BEGIN
      CREATE UNIQUE INDEX idx_patients_hospital_patient_id_unique
        ON public.patients (hospital_id, patient_id_number)
        WHERE patient_id_number IS NOT NULL;
    EXCEPTION WHEN unique_violation THEN
      RAISE WARNING 'Skipped unique patient ID index due to duplicate existing patient_id_number values.';
    END;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'idx_invoices_hospital_invoice_number_unique'
  ) THEN
    BEGIN
      CREATE UNIQUE INDEX idx_invoices_hospital_invoice_number_unique
        ON public.invoices (hospital_id, invoice_number);
    EXCEPTION WHEN unique_violation THEN
      RAISE WARNING 'Skipped unique invoice index due to duplicate existing invoice_number values.';
    END;
  END IF;
END
$$;
