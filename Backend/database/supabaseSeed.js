#!/usr/bin/env node

const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = 'https://opixxwotdsrscfuekysm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9waXh4d290ZHNyc2NmdWVreXNtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTMxNjQ3NCwiZXhwIjoyMDc0ODkyNDc0fQ.6DKe7ZwnSAWK2LRbbhI7FTOU9KTYlqs5tUJJZZhJAlg';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

class SupabaseSeeder {
  async testConnection() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      console.log('✅ Connected to Supabase');
      return true;
    } catch (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    }
  }

  async seedUsers() {
    try {
      console.log('👥 Seeding users...');

      const users = [
        {
          name: 'Dr. Admin User',
          email: 'admin@pgimer.ac.in',
          password: 'admin123',
          role: 'Admin'
        },
        {
          name: 'Dr. John Smith',
          email: 'jr.doctor@pgimer.ac.in',
          password: 'doctor123',
          role: 'JR'
        },
        {
          name: 'Dr. Sarah Johnson',
          email: 'sr.doctor@pgimer.ac.in',
          password: 'doctor123',
          role: 'SR'
        },
        {
          name: 'Ms. Priya Sharma',
          email: 'mwo@pgimer.ac.in',
          password: 'mwo123',
          role: 'MWO'
        },
        {
          name: 'Dr. Rajesh Kumar',
          email: 'rajesh.kumar@pgimer.ac.in',
          password: 'doctor123',
          role: 'SR'
        },
        {
          name: 'Ms. Anjali Singh',
          email: 'anjali.singh@pgimer.ac.in',
          password: 'mwo123',
          role: 'MWO'
        }
      ];

      for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, 12);
        
        const { data, error } = await supabase
          .from('users')
          .upsert({
            name: user.name,
            email: user.email,
            password_hash: hashedPassword,
            role: user.role,
            is_active: true
          })
          .select();

        if (error && error.code !== '23505') { // Ignore duplicate key errors
          console.error(`Failed to seed user ${user.email}:`, error.message);
        }
      }

      console.log(`✅ Seeded ${users.length} users`);
    } catch (error) {
      console.error('❌ Failed to seed users:', error.message);
      throw error;
    }
  }

  async seedPatients() {
    try {
      console.log('🏥 Seeding patients...');

      // Check if patients already exist
      const { data: existingPatients } = await supabase
        .from('patients')
        .select('id')
        .limit(1);

      if (existingPatients && existingPatients.length > 0) {
        const { count } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true });
        console.log(`⚠️  ${count} patients already exist. Skipping patient seeding.`);
        return;
      }

      const patients = [
        {
          name: 'Rahul Sharma',
          sex: 'M',
          actual_age: 28,
          assigned_room: '205'
        },
        {
          name: 'Priya Patel',
          sex: 'F',
          actual_age: 35,
          assigned_room: '206'
        },
        {
          name: 'Amit Kumar',
          sex: 'M',
          actual_age: 42,
          assigned_room: '205'
        },
        {
          name: 'Sunita Devi',
          sex: 'F',
          actual_age: 31,
          assigned_room: '206'
        },
        {
          name: 'Vikram Singh',
          sex: 'M',
          actual_age: 26,
          assigned_room: '205'
        },
        {
          name: 'Meera Joshi',
          sex: 'F',
          actual_age: 38,
          assigned_room: '206'
        },
        {
          name: 'Ravi Gupta',
          sex: 'M',
          actual_age: 45,
          assigned_room: '205'
        },
        {
          name: 'Kavita Reddy',
          sex: 'F',
          actual_age: 29,
          assigned_room: '206'
        },
        {
          name: 'Suresh Malhotra',
          sex: 'M',
          actual_age: 33,
          assigned_room: '205'
        },
        {
          name: 'Deepika Agarwal',
          sex: 'F',
          actual_age: 27,
          assigned_room: '206'
        }
      ];

      for (const patient of patients) {
        // Generate CR and PSY numbers (simplified for Supabase)
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const cr_no = `CR${year}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        const psy_no = `PSY${year}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

        const { error } = await supabase
          .from('patients')
          .insert({
            cr_no: cr_no,
            psy_no: psy_no,
            name: patient.name,
            sex: patient.sex,
            actual_age: patient.actual_age,
            assigned_room: patient.assigned_room,
            case_complexity: 'simple'
          });

        if (error && error.code !== '23505') {
          console.error(`Failed to seed patient ${patient.name}:`, error.message);
        }
      }

      console.log(`✅ Seeded ${patients.length} patients`);
    } catch (error) {
      console.error('❌ Failed to seed patients:', error.message);
      throw error;
    }
  }

  async seedOutpatientRecords() {
    try {
      console.log('📋 Seeding outpatient records...');

      // Check if outpatient records already exist
      const { count: existingCount } = await supabase
        .from('outpatient_record')
        .select('*', { count: 'exact', head: true });

      if (existingCount > 0) {
        console.log(`⚠️  ${existingCount} outpatient records already exist. Skipping.`);
        return;
      }

      // Get some patients and MWO users
      const { data: patients } = await supabase
        .from('patients')
        .select('id')
        .limit(5);

      const { data: mwoUsers } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'MWO')
        .limit(1);
      
      if (!patients || patients.length === 0 || !mwoUsers || mwoUsers.length === 0) {
        console.log('⚠️  No patients or MWO users found. Skipping outpatient records.');
        return;
      }

      const mwoId = mwoUsers[0].id;
      const sampleRecords = [
        {
          marital_status: 'Single',
          occupation: 'Software Engineer',
          education_level: 'Graduate',
          religion: 'Hinduism',
          family_type: 'Nuclear',
          locality: 'Urban'
        },
        {
          marital_status: 'Married',
          occupation: 'Teacher',
          education_level: 'Master/Professional',
          religion: 'Hinduism',
          family_type: 'Joint',
          locality: 'Urban'
        },
        {
          marital_status: 'Married',
          occupation: 'Business',
          education_level: 'Graduate',
          religion: 'Sikhism',
          family_type: 'Nuclear',
          locality: 'Urban'
        },
        {
          marital_status: 'Single',
          occupation: 'Student',
          education_level: 'Inter/Diploma',
          religion: 'Hinduism',
          family_type: 'Nuclear',
          locality: 'Urban'
        },
        {
          marital_status: 'Married',
          occupation: 'Housewife',
          education_level: 'Matric',
          religion: 'Hinduism',
          family_type: 'Extended',
          locality: 'Rural'
        }
      ];

      for (let i = 0; i < Math.min(patients.length, sampleRecords.length); i++) {
        const patientId = patients[i].id;
        const record = sampleRecords[i];

        const { error } = await supabase
          .from('outpatient_record')
          .insert({
            patient_id: patientId,
            filled_by: mwoId,
            marital_status: record.marital_status,
            occupation: record.occupation,
            education_level: record.education_level,
            religion: record.religion,
            family_type: record.family_type,
            locality: record.locality,
            contact_number: '9876543210'
          });

        if (error && error.code !== '23505') {
          console.error(`Failed to seed outpatient record ${i + 1}:`, error.message);
        }
      }

      console.log(`✅ Seeded ${Math.min(patients.length, sampleRecords.length)} outpatient records`);
    } catch (error) {
      console.error('❌ Failed to seed outpatient records:', error.message);
      throw error;
    }
  }

  async seedClinicalProformas() {
    try {
      console.log('🩺 Seeding clinical proformas...');

      // Check if clinical proformas already exist
      const { count: existingCount } = await supabase
        .from('clinical_proforma')
        .select('*', { count: 'exact', head: true });

      if (existingCount > 0) {
        console.log(`⚠️  ${existingCount} clinical proformas already exist. Skipping.`);
        return;
      }

      // Get some patients and doctors
      const { data: patients } = await supabase
        .from('patients')
        .select('id')
        .limit(3);

      const { data: doctors } = await supabase
        .from('users')
        .select('id')
        .in('role', ['JR', 'SR'])
        .limit(1);
      
      if (!patients || patients.length === 0 || !doctors || doctors.length === 0) {
        console.log('⚠️  No patients or doctors found. Skipping clinical proformas.');
        return;
      }

      const doctorId = doctors[0].id;
      const sampleProformas = [
        {
          visit_type: 'first_visit',
          doctor_decision: 'simple_case',
          case_severity: 'mild',
          diagnosis: 'Generalized Anxiety Disorder',
          icd_code: 'F41.1',
          mood: 'Anxious, worried',
          behaviour: 'Restless, fidgety',
          thought: 'Excessive worry about work and family',
          treatment_prescribed: 'Cognitive Behavioral Therapy, Sertraline 50mg daily'
        },
        {
          visit_type: 'first_visit',
          doctor_decision: 'complex_case',
          case_severity: 'moderate',
          diagnosis: 'Major Depressive Episode',
          icd_code: 'F32.2',
          mood: 'Depressed, hopeless',
          behaviour: 'Withdrawn, low energy',
          thought: 'Negative thoughts, suicidal ideation',
          treatment_prescribed: 'Fluoxetine 20mg daily, Regular follow-up',
          requires_adl_file: true,
          adl_reasoning: 'Complex case requiring detailed monitoring and specialized treatment'
        },
        {
          visit_type: 'follow_up',
          doctor_decision: 'simple_case',
          case_severity: 'mild',
          diagnosis: 'Adjustment Disorder',
          icd_code: 'F43.2',
          mood: 'Improved, more stable',
          behaviour: 'Better coping mechanisms',
          thought: 'More positive outlook',
          treatment_prescribed: 'Continue counseling, reduce medication'
        },
        {
          visit_type: 'first_visit',
          doctor_decision: 'complex_case',
          case_severity: 'severe',
          diagnosis: 'Bipolar Disorder',
          icd_code: 'F31.5',
          mood: 'Manic, elevated',
          behaviour: 'Hyperactive, impulsive',
          thought: 'Grandiose ideas, racing thoughts',
          treatment_prescribed: 'Lithium 600mg, Close monitoring',
          requires_adl_file: true,
          adl_reasoning: 'Severe case requiring ADL file for patient safety'
        },
        {
          visit_type: 'follow_up',
          doctor_decision: 'simple_case',
          case_severity: 'moderate',
          diagnosis: 'Post-Traumatic Stress Disorder',
          icd_code: 'F43.1',
          mood: 'Stable, improving',
          behaviour: 'Better sleep patterns',
          thought: 'Reduced intrusions',
          treatment_prescribed: 'EMDR therapy, Prazosin for sleep'
        }
      ];

      for (let i = 0; i < Math.min(patients.length, sampleProformas.length); i++) {
        const patientId = patients[i].id;
        const proforma = sampleProformas[i];

        const { error } = await supabase
          .from('clinical_proforma')
          .insert({
            patient_id: patientId,
            filled_by: doctorId,
            visit_date: new Date().toISOString().split('T')[0],
            visit_type: proforma.visit_type,
            room_no: '205',
            doctor_decision: proforma.doctor_decision,
            case_severity: proforma.case_severity,
            diagnosis: proforma.diagnosis,
            icd_code: proforma.icd_code,
            mood: proforma.mood,
            behaviour: proforma.behaviour,
            thought: proforma.thought,
            treatment_prescribed: proforma.treatment_prescribed,
            requires_adl_file: proforma.requires_adl_file || false,
            adl_reasoning: proforma.adl_reasoning || null
          });

        if (error && error.code !== '23505') {
          console.error(`Failed to seed clinical proforma ${i + 1}:`, error.message);
        }
      }

      console.log(`✅ Seeded ${Math.min(patients.length, sampleProformas.length)} clinical proformas`);
    } catch (error) {
      console.error('❌ Failed to seed clinical proformas:', error.message);
      throw error;
    }
  }

  async seedADLFiles() {
    try {
      console.log('📁 Seeding ADL files...');

      // Check if ADL files already exist
      const { count: existingCount } = await supabase
        .from('adl_files')
        .select('*', { count: 'exact', head: true });

      if (existingCount > 0) {
        console.log(`⚠️  ${existingCount} ADL files already exist. Skipping.`);
        return;
      }

      // Get clinical proformas that require ADL files
      const { data: complexCases } = await supabase
        .from('clinical_proforma')
        .select('id, patient_id, filled_by')
        .eq('requires_adl_file', true)
        .limit(3);

      if (!complexCases || complexCases.length === 0) {
        console.log('⚠️  No complex cases requiring ADL files found. Skipping.');
        return;
      }

      for (const caseData of complexCases) {
        // Generate ADL number (simplified)
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const adl_no = `ADL${year}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

        const { error, data: adlFile } = await supabase
          .from('adl_files')
          .insert({
            patient_id: caseData.patient_id,
            adl_no: adl_no,
            created_by: caseData.filled_by,
            clinical_proforma_id: caseData.id,
            file_status: 'created',
            file_created_date: new Date().toISOString().split('T')[0],
            total_visits: 1,
            is_active: true
          })
          .select()
          .single();

        if (error && error.code !== '23505') {
          console.error(`Failed to seed ADL file for case ${caseData.id}:`, error.message);
          continue;
        }

        // Update patient record
        await supabase
          .from('patients')
          .update({
            has_adl_file: true,
            adl_no: adl_no,
            file_status: 'created'
          })
          .eq('id', caseData.patient_id);

        // Log file creation
        await supabase
          .from('file_movements')
          .insert({
            adl_file_id: adlFile.id,
            patient_id: caseData.patient_id,
            moved_by: caseData.filled_by,
            movement_type: 'created',
            from_location: 'Doctor Office',
            to_location: 'Record Room'
          });
      }

      console.log(`✅ Seeded ${complexCases.length} ADL files`);
    } catch (error) {
      console.error('❌ Failed to seed ADL files:', error.message);
      throw error;
    }
  }

  async runSeed() {
    try {
      console.log('🌱 Starting Supabase database seeding...\n');

      const connected = await this.testConnection();
      if (!connected) {
        process.exit(1);
      }

      await this.seedUsers();
      await this.seedPatients();
      await this.seedOutpatientRecords();
      await this.seedClinicalProformas();
      await this.seedADLFiles();

      console.log('\n✅ Supabase database seeding completed successfully!');
      
      // Show summary
      await this.showSummary();

    } catch (error) {
      console.error('❌ Seeding failed:', error.message);
      throw error;
    }
  }

  async showSummary() {
    try {
      console.log('\n📊 Database Summary:');
      
      const tables = ['users', 'patients', 'outpatient_record', 'clinical_proforma', 'adl_files'];
      
      for (const table of tables) {
        const { count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        console.log(`   - ${table}: ${count} records`);
      }

      console.log('\n🔑 Default Login Credentials:');
      console.log('   Admin: admin@pgimer.ac.in / admin123');
      console.log('   JR Doctor: jr.doctor@pgimer.ac.in / doctor123');
      console.log('   SR Doctor: sr.doctor@pgimer.ac.in / doctor123');
      console.log('   MWO: mwo@pgimer.ac.in / mwo123');

    } catch (error) {
      console.error('❌ Failed to show summary:', error.message);
    }
  }

  async clearData() {
    try {
      console.log('🗑️  Clearing all seeded data...');

      const tables = ['outpatient_record', 'patients', 'users'];

      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .neq('id', 0); // Delete all records
        
        if (!error) {
          console.log(`   - Cleared ${table}`);
        } else {
          console.error(`   - Failed to clear ${table}:`, error.message);
        }
      }

      console.log('✅ Data cleared successfully');
    } catch (error) {
      console.error('❌ Failed to clear data:', error.message);
      throw error;
    }
  }
}

// CLI interface
async function main() {
  const command = process.argv[2];
  const seeder = new SupabaseSeeder();

  try {
    switch (command) {
      case 'seed':
        await seeder.runSeed();
        break;
      
      case 'clear':
        await seeder.clearData();
        break;
      
      default:
        console.log(`
🌱 EMRS PGIMER Supabase Database Seeder

Usage: node database/supabaseSeed.js <command>

Commands:
  seed   - Seed database with sample data via Supabase API
  clear  - Clear all seeded data (keeps tables)

Examples:
  node database/supabaseSeed.js seed
  node database/supabaseSeed.js clear

Note: This uses Supabase client API instead of direct PostgreSQL connection
        `);
        break;
    }

  } catch (error) {
    console.error('❌ Seeder error:', error.message);
    process.exit(1);
  }
}

// Run if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = SupabaseSeeder;
