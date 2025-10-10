-- Fix user deletion by adding ON DELETE CASCADE to foreign key references
-- This script updates existing foreign key constraints to allow user deletion

-- 1. Update outpatient_record table
ALTER TABLE outpatient_record 
DROP CONSTRAINT IF EXISTS outpatient_record_filled_by_fkey;

ALTER TABLE outpatient_record 
ADD CONSTRAINT outpatient_record_filled_by_fkey 
FOREIGN KEY (filled_by) REFERENCES users(id) ON DELETE CASCADE;

-- 2. Update clinical_proforma table
ALTER TABLE clinical_proforma 
DROP CONSTRAINT IF EXISTS clinical_proforma_filled_by_fkey;

ALTER TABLE clinical_proforma 
ADD CONSTRAINT clinical_proforma_filled_by_fkey 
FOREIGN KEY (filled_by) REFERENCES users(id) ON DELETE CASCADE;

-- 3. Update adl_files table
ALTER TABLE adl_files 
DROP CONSTRAINT IF EXISTS adl_files_created_by_fkey;

ALTER TABLE adl_files 
ADD CONSTRAINT adl_files_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE adl_files 
DROP CONSTRAINT IF EXISTS adl_files_last_accessed_by_fkey;

ALTER TABLE adl_files 
ADD CONSTRAINT adl_files_last_accessed_by_fkey 
FOREIGN KEY (last_accessed_by) REFERENCES users(id) ON DELETE CASCADE;

-- 4. Update adl_file_movements table
ALTER TABLE adl_file_movements 
DROP CONSTRAINT IF EXISTS adl_file_movements_moved_by_fkey;

ALTER TABLE adl_file_movements 
ADD CONSTRAINT adl_file_movements_moved_by_fkey 
FOREIGN KEY (moved_by) REFERENCES users(id) ON DELETE CASCADE;

-- 5. Update patient_assignments table
ALTER TABLE patient_assignments 
DROP CONSTRAINT IF EXISTS patient_assignments_assigned_doctor_fkey;

ALTER TABLE patient_assignments 
ADD CONSTRAINT patient_assignments_assigned_doctor_fkey 
FOREIGN KEY (assigned_doctor) REFERENCES users(id) ON DELETE CASCADE;

-- 6. Update audit_logs table
ALTER TABLE audit_logs 
DROP CONSTRAINT IF EXISTS audit_logs_changed_by_fkey;

ALTER TABLE audit_logs 
ADD CONSTRAINT audit_logs_changed_by_fkey 
FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE;

-- Note: login_otps and password_reset_tokens already have ON DELETE CASCADE
