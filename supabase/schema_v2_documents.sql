-- =============================================================================
-- SCHEMA V2 – MEDICAL DOCUMENTS (Dental Rx, Discharge Chart, Hospital Bill)
-- Run AFTER the base schema.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. HOSPITALS – Extra branding / SaaS fields
-- -----------------------------------------------------------------------------
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS taglines TEXT[];
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS since_year INTEGER;
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS emergency_phone TEXT;
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS rx_frequency_language TEXT DEFAULT 'english'
  CHECK (rx_frequency_language IN ('english', 'marathi', 'hindi'));
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS institute_group_name TEXT;

-- -----------------------------------------------------------------------------
-- 2. PATIENTS – Height / Weight for Rx
-- -----------------------------------------------------------------------------
ALTER TABLE patients ADD COLUMN IF NOT EXISTS height TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS weight TEXT;

-- -----------------------------------------------------------------------------
-- 3. PRESCRIPTIONS – Expanded Dental Rx fields
-- -----------------------------------------------------------------------------
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS symptoms JSONB DEFAULT '[]';
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS examinations JSONB DEFAULT '[]';
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS advices JSONB DEFAULT '[]';
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS lab_investigation JSONB DEFAULT '[]';
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS follow_up TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS consultation_type TEXT;

-- -----------------------------------------------------------------------------
-- 4. DISCHARGE MEDICATION CHARTS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS discharge_charts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id),
  note_text TEXT,
  medications JSONB NOT NULL DEFAULT '[]',
  -- Each medication: { sr, medicine_name, frequency, doses, days, qty }
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discharge_charts_hospital ON discharge_charts(hospital_id);
CREATE INDEX IF NOT EXISTS idx_discharge_charts_patient ON discharge_charts(patient_id);

ALTER TABLE discharge_charts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hospital staff can manage discharge charts" ON discharge_charts
  FOR ALL USING (
    hospital_id = public.get_my_hospital_id()
    AND public.get_my_role() IN ('hospital_admin', 'doctor', 'receptionist')
  );

CREATE POLICY "Patients can view own discharge charts" ON discharge_charts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = discharge_charts.patient_id
      AND patients.user_id = auth.uid()
    )
  );

CREATE TRIGGER update_discharge_charts_updated_at
  BEFORE UPDATE ON discharge_charts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -----------------------------------------------------------------------------
-- 5. INVOICES – Hospital Bill expansion
-- -----------------------------------------------------------------------------
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS bill_type TEXT DEFAULT 'treatment'
  CHECK (bill_type IN ('treatment', 'hospital'));
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS admission_date TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discharge_date TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS uhid TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_mode TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES doctors(id);
