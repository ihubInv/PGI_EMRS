-- EMRS PGIMER Database Schema
-- Electronic Medical Record System for Psychiatry Department
-- Postgraduate Institute of Medical Education & Research, Chandigarh

-- Create database (run this separately if needed)
-- CREATE DATABASE pgimer;
-- \c pgimer;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users (MWO, JR, SR, Admin, etc.)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('MWO','JR','SR','Admin')) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    two_factor_secret VARCHAR(32),
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    backup_codes TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Patients (common master table)
CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    cr_no VARCHAR(50) UNIQUE,
    psy_no VARCHAR(50),
    special_clinic_no VARCHAR(50),
    adl_no VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    sex VARCHAR(10) CHECK (sex IN ('M','F','Other')),
    actual_age INT CHECK (actual_age >= 0 AND actual_age <= 150),
    has_adl_file BOOLEAN DEFAULT FALSE,
    file_status VARCHAR(20) CHECK (file_status IN ('none','created','stored','retrieved','active')) DEFAULT 'none',
    assigned_room TEXT,
    case_complexity VARCHAR(20) CHECK (case_complexity IN ('simple','complex')) DEFAULT 'simple',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Outpatient Record (filled by MWO, links to patients)
CREATE TABLE IF NOT EXISTS outpatient_record (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
    filled_by INT REFERENCES users(id) ON DELETE CASCADE,  -- MWO user
    age_group TEXT,
    marital_status TEXT,
    year_of_marriage INT,
    no_of_children INT,
    occupation TEXT,
    actual_occupation TEXT,
    education_level TEXT,
    completed_years_of_education INT,
    patient_income NUMERIC(12,2),
    family_income NUMERIC(12,2),
    religion TEXT,
    family_type TEXT,
    locality TEXT,
    head_name VARCHAR(255),
    head_age INT,
    head_relationship TEXT,
    head_education TEXT,
    head_occupation TEXT,
    head_income NUMERIC(12,2),
    distance_from_hospital TEXT,
    mobility TEXT,
    referred_by TEXT,
    exact_source TEXT,
    present_address TEXT,
    permanent_address TEXT,
    local_address TEXT,
    school_college_office TEXT,
    contact_number TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Clinical Proforma (filled by Doctors, links to patients)
CREATE TABLE IF NOT EXISTS clinical_proforma (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
    filled_by INT REFERENCES users(id) ON DELETE CASCADE, -- JR/SR Doctor
    visit_date DATE NOT NULL,
    visit_type VARCHAR(20) CHECK (visit_type IN ('first_visit','follow_up')) DEFAULT 'first_visit',
    room_no TEXT,
    informant_present BOOLEAN,
    nature_of_information TEXT,
    onset_duration TEXT,
    course TEXT,
    precipitating_factor TEXT,
    illness_duration TEXT,
    current_episode_since DATE,
    mood TEXT,
    behaviour TEXT,
    speech TEXT,
    thought TEXT,
    perception TEXT,
    somatic TEXT,
    bio_functions TEXT,
    adjustment TEXT,
    cognitive_function TEXT,
    fits TEXT,
    sexual_problem TEXT,
    substance_use TEXT,
    past_history TEXT,
    family_history TEXT,
    associated_medical_surgical TEXT,
    mse_behaviour TEXT,
    mse_affect TEXT,
    mse_thought TEXT,
    mse_delusions TEXT,
    mse_perception TEXT,
    mse_cognitive_function TEXT,
    gpe TEXT,
    diagnosis TEXT,
    icd_code VARCHAR(20),
    disposal TEXT,
    workup_appointment DATE,
    referred_to TEXT,
    treatment_prescribed TEXT,
    doctor_decision VARCHAR(20) CHECK (doctor_decision IN ('simple_case','complex_case')) DEFAULT 'simple_case',
    case_severity VARCHAR(20) CHECK (case_severity IN ('mild','moderate','severe','critical')),
    requires_adl_file BOOLEAN DEFAULT FALSE,
    adl_reasoning TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. ADL Files (for complex/serious cases)
CREATE TABLE IF NOT EXISTS adl_files (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
    adl_no VARCHAR(50) UNIQUE NOT NULL,
    created_by INT REFERENCES users(id) ON DELETE CASCADE, -- Doctor who created the file
    clinical_proforma_id INT REFERENCES clinical_proforma(id),
    file_status VARCHAR(20) CHECK (file_status IN ('created','stored','retrieved','active','archived')) DEFAULT 'created',
    physical_file_location TEXT,
    file_created_date DATE NOT NULL,
    last_accessed_date DATE,
    last_accessed_by INT REFERENCES users(id) ON DELETE CASCADE,
    total_visits INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. File Movement Tracking
CREATE TABLE IF NOT EXISTS file_movements (
    id SERIAL PRIMARY KEY,
    adl_file_id INT REFERENCES adl_files(id) ON DELETE CASCADE,
    patient_id INT REFERENCES patients(id),
    moved_by INT REFERENCES users(id) ON DELETE CASCADE,
    movement_type VARCHAR(20) CHECK (movement_type IN ('created','stored','retrieved','returned','archived')),
    from_location TEXT,
    to_location TEXT,
    movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Visit Tracking (for both PSY and ADL patients)
CREATE TABLE IF NOT EXISTS patient_visits (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL,
    visit_type VARCHAR(20) CHECK (visit_type IN ('first_visit','follow_up')) NOT NULL,
    has_file BOOLEAN DEFAULT FALSE,
    adl_file_id INT REFERENCES adl_files(id),
    clinical_proforma_id INT REFERENCES clinical_proforma(id),
    assigned_doctor INT REFERENCES users(id) ON DELETE CASCADE,
    room_no TEXT,
    visit_status VARCHAR(20) CHECK (visit_status IN ('scheduled','in_progress','completed','cancelled')) DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Password Reset Tokens (for forgot password functionality)
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Login OTPs (for 2FA login verification)
CREATE TABLE IF NOT EXISTS login_otps (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. System Settings (for configuration)
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Audit Log (for tracking all changes)
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    changed_by INT REFERENCES users(id) ON DELETE CASCADE,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_cr_no ON patients(cr_no);
CREATE INDEX IF NOT EXISTS idx_patients_psy_no ON patients(psy_no);
CREATE INDEX IF NOT EXISTS idx_patients_adl_no ON patients(adl_no);
CREATE INDEX IF NOT EXISTS idx_patients_file_status ON patients(file_status);
CREATE INDEX IF NOT EXISTS idx_patients_case_complexity ON patients(case_complexity);
CREATE INDEX IF NOT EXISTS idx_patients_is_active ON patients(is_active);

CREATE INDEX IF NOT EXISTS idx_outpatient_patient_id ON outpatient_record(patient_id);
CREATE INDEX IF NOT EXISTS idx_outpatient_filled_by ON outpatient_record(filled_by);
CREATE INDEX IF NOT EXISTS idx_outpatient_created_at ON outpatient_record(created_at);

CREATE INDEX IF NOT EXISTS idx_clinical_patient_id ON clinical_proforma(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_filled_by ON clinical_proforma(filled_by);
CREATE INDEX IF NOT EXISTS idx_clinical_visit_date ON clinical_proforma(visit_date);
CREATE INDEX IF NOT EXISTS idx_clinical_visit_type ON clinical_proforma(visit_type);
CREATE INDEX IF NOT EXISTS idx_clinical_doctor_decision ON clinical_proforma(doctor_decision);
CREATE INDEX IF NOT EXISTS idx_clinical_case_severity ON clinical_proforma(case_severity);

CREATE INDEX IF NOT EXISTS idx_adl_files_patient_id ON adl_files(patient_id);
CREATE INDEX IF NOT EXISTS idx_adl_files_adl_no ON adl_files(adl_no);
CREATE INDEX IF NOT EXISTS idx_adl_files_status ON adl_files(file_status);
CREATE INDEX IF NOT EXISTS idx_adl_files_created_by ON adl_files(created_by);

CREATE INDEX IF NOT EXISTS idx_file_movements_adl_file_id ON file_movements(adl_file_id);
CREATE INDEX IF NOT EXISTS idx_file_movements_patient_id ON file_movements(patient_id);
CREATE INDEX IF NOT EXISTS idx_file_movements_date ON file_movements(movement_date);

CREATE INDEX IF NOT EXISTS idx_patient_visits_patient_id ON patient_visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_visits_date ON patient_visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_patient_visits_status ON patient_visits(visit_status);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_by ON audit_log(changed_by);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_at ON audit_log(changed_at);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_outpatient_record_updated_at BEFORE UPDATE ON outpatient_record FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clinical_proforma_updated_at BEFORE UPDATE ON clinical_proforma FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_adl_files_updated_at BEFORE UPDATE ON adl_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_visits_updated_at BEFORE UPDATE ON patient_visits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for patient summary
CREATE OR REPLACE VIEW patient_summary AS
SELECT 
    p.id,
    p.cr_no,
    p.psy_no,
    p.adl_no,
    p.name,
    p.sex,
    p.actual_age,
    p.case_complexity,
    p.has_adl_file,
    p.file_status,
    p.assigned_room,
    p.created_at,
    COUNT(DISTINCT opr.id) as outpatient_records_count,
    COUNT(DISTINCT cp.id) as clinical_records_count,
    COUNT(DISTINCT af.id) as adl_files_count,
    COUNT(DISTINCT pv.id) as total_visits
FROM patients p
LEFT JOIN outpatient_record opr ON p.id = opr.patient_id
LEFT JOIN clinical_proforma cp ON p.id = cp.patient_id
LEFT JOIN adl_files af ON p.id = af.patient_id
LEFT JOIN patient_visits pv ON p.id = pv.patient_id
WHERE p.is_active = true
GROUP BY p.id, p.cr_no, p.psy_no, p.adl_no, p.name, p.sex, p.actual_age, 
         p.case_complexity, p.has_adl_file, p.file_status, p.assigned_room, p.created_at;

-- Create view for user statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    role,
    COUNT(*) as total_users,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
    COUNT(CASE WHEN last_login IS NOT NULL THEN 1 END) as users_with_login
FROM users
GROUP BY role;

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('hospital_name', 'Postgraduate Institute of Medical Education & Research', 'Hospital name'),
('hospital_location', 'Chandigarh', 'Hospital location'),
('department_name', 'Department of Psychiatry', 'Department name'),
('app_version', '1.0.0', 'Application version'),
('maintenance_mode', 'false', 'Maintenance mode status'),
('max_file_size', '10485760', 'Maximum file upload size in bytes'),
('session_timeout', '3600', 'Session timeout in seconds'),
('backup_frequency', 'daily', 'Database backup frequency')
ON CONFLICT (setting_key) DO NOTHING;

-- Create function to generate CR number
CREATE OR REPLACE FUNCTION generate_cr_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_part TEXT;
    new_cr_no TEXT;
BEGIN
    year_part := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    -- Get next sequence number for current year
    SELECT COALESCE(MAX(CAST(SUBSTRING(cr_no FROM 6) AS INTEGER)), 0) + 1
    INTO sequence_part
    FROM patients 
    WHERE cr_no LIKE 'CR' || year_part || '%';
    
    -- Format as CR + year + 6-digit sequence
    new_cr_no := 'CR' || year_part || LPAD(sequence_part::TEXT, 6, '0');
    
    RETURN new_cr_no;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate PSY number
CREATE OR REPLACE FUNCTION generate_psy_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_part TEXT;
    new_psy_no TEXT;
BEGIN
    year_part := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    -- Get next sequence number for current year
    SELECT COALESCE(MAX(CAST(SUBSTRING(psy_no FROM 7) AS INTEGER)), 0) + 1
    INTO sequence_part
    FROM patients 
    WHERE psy_no LIKE 'PSY' || year_part || '%';
    
    -- Format as PSY + year + 6-digit sequence
    new_psy_no := 'PSY' || year_part || LPAD(sequence_part::TEXT, 6, '0');
    
    RETURN new_psy_no;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate ADL number
CREATE OR REPLACE FUNCTION generate_adl_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    random_part TEXT;
    new_adl_no TEXT;
BEGIN
    year_part := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    -- Generate random 8-character string
    random_part := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    
    -- Format as ADL + year + 8-character random string
    new_adl_no := 'ADL' || year_part || random_part;
    
    RETURN new_adl_no;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO your_app_user;

COMMENT ON DATABASE pgimer IS 'EMRS PGIMER - Electronic Medical Record System for Psychiatry Department';
COMMENT ON TABLE users IS 'System users with role-based access control';
COMMENT ON TABLE patients IS 'Master patient registry with unique identifiers';
COMMENT ON TABLE outpatient_record IS 'Demographic and social data collected by MWO';
COMMENT ON TABLE clinical_proforma IS 'Clinical assessment data collected by doctors';
COMMENT ON TABLE adl_files IS 'Specialized file management for complex cases';
COMMENT ON TABLE file_movements IS 'Audit trail for physical file movements';
COMMENT ON TABLE patient_visits IS 'Visit tracking and history';
COMMENT ON TABLE system_settings IS 'Application configuration settings';
COMMENT ON TABLE audit_log IS 'Complete audit trail for all data changes';
