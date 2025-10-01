#!/usr/bin/env node

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

class DatabaseSeeder {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DB_HOST,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  }

  async connect() {
    try {
      const client = await this.pool.connect();
      console.log('✅ Connected to PostgreSQL database');
      client.release();
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      process.exit(1);
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
        
        await this.pool.query(`
          INSERT INTO users (name, email, password_hash, role, is_active)
          VALUES ($1, $2, $3, $4, true)
          ON CONFLICT (email) DO UPDATE SET
            name = EXCLUDED.name,
            password_hash = EXCLUDED.password_hash,
            role = EXCLUDED.role,
            updated_at = CURRENT_TIMESTAMP
        `, [user.name, user.email, hashedPassword, user.role]);
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
      const existingPatients = await this.pool.query('SELECT COUNT(*) FROM patients');
      if (existingPatients.rows[0].count > 0) {
        console.log(`⚠️  ${existingPatients.rows[0].count} patients already exist. Skipping patient seeding.`);
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
        // Generate CR and PSY numbers
        const crResult = await this.pool.query('SELECT generate_cr_number()');
        const psyResult = await this.pool.query('SELECT generate_psy_number()');
        
        const cr_no = crResult.rows[0].generate_cr_number;
        const psy_no = psyResult.rows[0].generate_psy_number;

        await this.pool.query(`
          INSERT INTO patients (cr_no, psy_no, name, sex, actual_age, assigned_room, case_complexity)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [cr_no, psy_no, patient.name, patient.sex, patient.actual_age, patient.assigned_room, 'simple']);
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
      const existingRecords = await this.pool.query('SELECT COUNT(*) FROM outpatient_record');
      if (existingRecords.rows[0].count > 0) {
        console.log(`⚠️  ${existingRecords.rows[0].count} outpatient records already exist. Skipping.`);
        return;
      }

      // Get patients and MWO users
      const patientsResult = await this.pool.query('SELECT id FROM patients ORDER BY id LIMIT 5');
      const mwoResult = await this.pool.query("SELECT id FROM users WHERE role = 'MWO' ORDER BY id LIMIT 1");
      
      if (patientsResult.rows.length === 0 || mwoResult.rows.length === 0) {
        console.log('⚠️  No patients or MWO users found. Skipping outpatient records.');
        return;
      }

      const mwoId = mwoResult.rows[0].id;
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

      for (let i = 0; i < Math.min(patientsResult.rows.length, sampleRecords.length); i++) {
        const patientId = patientsResult.rows[i].id;
        const record = sampleRecords[i];

        await this.pool.query(`
          INSERT INTO outpatient_record (
            patient_id, filled_by, marital_status, occupation, education_level,
            religion, family_type, locality, contact_number
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          patientId, mwoId, record.marital_status, record.occupation,
          record.education_level, record.religion, record.family_type,
          record.locality, '9876543210'
        ]);
      }

      console.log(`✅ Seeded ${Math.min(patientsResult.rows.length, sampleRecords.length)} outpatient records`);
    } catch (error) {
      console.error('❌ Failed to seed outpatient records:', error.message);
      throw error;
    }
  }

  async seedClinicalProformas() {
    try {
      console.log('🩺 Seeding clinical proformas...');

      // Check if clinical proformas already exist
      const existingProformas = await this.pool.query('SELECT COUNT(*) FROM clinical_proforma');
      if (existingProformas.rows[0].count > 0) {
        console.log(`⚠️  ${existingProformas.rows[0].count} clinical proformas already exist. Skipping.`);
        return;
      }

      // Get patients and doctors
      const patientsResult = await this.pool.query('SELECT id FROM patients ORDER BY id LIMIT 3');
      const doctorResult = await this.pool.query("SELECT id FROM users WHERE role IN ('JR', 'SR') ORDER BY id LIMIT 1");
      
      if (patientsResult.rows.length === 0 || doctorResult.rows.length === 0) {
        console.log('⚠️  No patients or doctors found. Skipping clinical proformas.');
        return;
      }

      const doctorId = doctorResult.rows[0].id;
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
        }
      ];

      for (let i = 0; i < Math.min(patientsResult.rows.length, sampleProformas.length); i++) {
        const patientId = patientsResult.rows[i].id;
        const proforma = sampleProformas[i];

        await this.pool.query(`
          INSERT INTO clinical_proforma (
            patient_id, filled_by, visit_date, visit_type, room_no,
            doctor_decision, case_severity, diagnosis, icd_code,
            mood, behaviour, thought, treatment_prescribed,
            requires_adl_file, adl_reasoning
          ) VALUES ($1, $2, CURRENT_DATE, $3, '205', $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `, [
          patientId, doctorId, proforma.visit_type, proforma.doctor_decision,
          proforma.case_severity, proforma.diagnosis, proforma.icd_code,
          proforma.mood, proforma.behaviour, proforma.thought,
          proforma.treatment_prescribed, proforma.requires_adl_file || false,
          proforma.adl_reasoning || null
        ]);
      }

      console.log(`✅ Seeded ${Math.min(patientsResult.rows.length, sampleProformas.length)} clinical proformas`);
    } catch (error) {
      console.error('❌ Failed to seed clinical proformas:', error.message);
      throw error;
    }
  }

  async seedADLFiles() {
    try {
      console.log('📁 Seeding ADL files...');

      // Check if ADL files already exist
      const existingFiles = await this.pool.query('SELECT COUNT(*) FROM adl_files');
      if (existingFiles.rows[0].count > 0) {
        console.log(`⚠️  ${existingFiles.rows[0].count} ADL files already exist. Skipping.`);
        return;
      }

      // Get complex cases that require ADL files
      const complexCasesResult = await this.pool.query(`
        SELECT cp.id as proforma_id, cp.patient_id, cp.filled_by
        FROM clinical_proforma cp
        WHERE cp.requires_adl_file = true
        ORDER BY cp.id LIMIT 2
      `);

      if (complexCasesResult.rows.length === 0) {
        console.log('⚠️  No complex cases found. Skipping ADL files.');
        return;
      }

      for (const case_ of complexCasesResult.rows) {
        // Generate ADL number
        const adlResult = await this.pool.query('SELECT generate_adl_number()');
        const adl_no = adlResult.rows[0].generate_adl_number;

        // Create ADL file
        const adlFileResult = await this.pool.query(`
          INSERT INTO adl_files (
            patient_id, adl_no, created_by, clinical_proforma_id,
            file_status, file_created_date, total_visits
          ) VALUES ($1, $2, $3, $4, 'created', CURRENT_DATE, 1)
          RETURNING id
        `, [case_.patient_id, adl_no, case_.filled_by, case_.proforma_id]);

        const adlFileId = adlFileResult.rows[0].id;

        // Update patient record
        await this.pool.query(`
          UPDATE patients 
          SET has_adl_file = true, adl_no = $1, file_status = 'created'
          WHERE id = $2
        `, [adl_no, case_.patient_id]);

        // Log file creation
        await this.pool.query(`
          INSERT INTO file_movements (
            adl_file_id, patient_id, moved_by, movement_type,
            from_location, to_location
          ) VALUES ($1, $2, $3, 'created', 'Doctor Office', 'Record Room')
        `, [adlFileId, case_.patient_id, case_.filled_by]);
      }

      console.log(`✅ Seeded ${complexCasesResult.rows.length} ADL files`);
    } catch (error) {
      console.error('❌ Failed to seed ADL files:', error.message);
      throw error;
    }
  }

  async seedPatientVisits() {
    try {
      console.log('📅 Seeding patient visits...');

      // Check if patient visits already exist
      const existingVisits = await this.pool.query('SELECT COUNT(*) FROM patient_visits');
      if (existingVisits.rows[0].count > 0) {
        console.log(`⚠️  ${existingVisits.rows[0].count} patient visits already exist. Skipping.`);
        return;
      }

      // Get patients and doctors
      const patientsResult = await this.pool.query('SELECT id FROM patients ORDER BY id LIMIT 5');
      const doctorResult = await this.pool.query("SELECT id FROM users WHERE role IN ('JR', 'SR') ORDER BY id LIMIT 1");
      
      if (patientsResult.rows.length === 0 || doctorResult.rows.length === 0) {
        console.log('⚠️  No patients or doctors found. Skipping patient visits.');
        return;
      }

      const doctorId = doctorResult.rows[0].id;

      for (const patient of patientsResult.rows) {
        await this.pool.query(`
          INSERT INTO patient_visits (
            patient_id, visit_date, visit_type, assigned_doctor,
            room_no, visit_status
          ) VALUES ($1, CURRENT_DATE, 'first_visit', $2, '205', 'completed')
        `, [patient.id, doctorId]);
      }

      console.log(`✅ Seeded ${patientsResult.rows.length} patient visits`);
    } catch (error) {
      console.error('❌ Failed to seed patient visits:', error.message);
      throw error;
    }
  }

  async runSeed() {
    try {
      console.log('🌱 Starting database seeding...\n');

      await this.seedUsers();
      await this.seedPatients();
      await this.seedOutpatientRecords();
      await this.seedClinicalProformas();
      await this.seedADLFiles();
      await this.seedPatientVisits();

      console.log('\n✅ Database seeding completed successfully!');
      
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
      
      const tables = ['users', 'patients', 'outpatient_record', 'clinical_proforma', 'adl_files', 'patient_visits'];
      
      for (const table of tables) {
        const result = await this.pool.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`   - ${table}: ${result.rows[0].count} records`);
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

      const tables = [
        'file_movements', 'patient_visits', 'adl_files', 
        'clinical_proforma', 'outpatient_record', 'patients', 'users'
      ];

      for (const table of tables) {
        await this.pool.query(`DELETE FROM ${table}`);
        console.log(`   - Cleared ${table}`);
      }

      console.log('✅ Data cleared successfully');
    } catch (error) {
      console.error('❌ Failed to clear data:', error.message);
      throw error;
    }
  }

  async close() {
    await this.pool.end();
  }
}

// CLI interface
async function main() {
  const command = process.argv[2];
  const seeder = new DatabaseSeeder();

  try {
    await seeder.connect();

    switch (command) {
      case 'seed':
        await seeder.runSeed();
        break;
      
      case 'clear':
        await seeder.clearData();
        break;
      
      default:
        console.log(`
🌱 EMRS PGIMER Database Seeder

Usage: node database/seed.js <command>

Commands:
  seed   - Seed database with sample data
  clear  - Clear all seeded data (keeps tables)

Examples:
  node database/seed.js seed
  node database/seed.js clear

⚠️  Warning: clear will delete ALL data but keep table structure!
        `);
        break;
    }

  } catch (error) {
    console.error('❌ Seeder error:', error.message);
    process.exit(1);
  } finally {
    await seeder.close();
  }
}

// Run if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = DatabaseSeeder;
