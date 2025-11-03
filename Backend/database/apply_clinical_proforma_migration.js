/**
 * Migration Script for Clinical Proforma Table
 * Adds assigned_doctor and adl_file_id columns
 * 
 * Usage for Supabase: node Backend/database/apply_clinical_proforma_migration.js
 * Usage for PostgreSQL: psql -f Backend/database/migrations/add_assigned_doctor_and_adl_file_id.sql
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env file');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('🚀 Starting migration: Add assigned_doctor and adl_file_id to clinical_proforma...\n');

    // Check if columns already exist
    const { data: existingColumns, error: checkError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'clinical_proforma' 
        AND column_name IN ('assigned_doctor', 'adl_file_id')
      `
    }).catch(async () => {
      // If RPC doesn't exist, try direct SQL execution
      const response = await supabaseAdmin.from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'clinical_proforma')
        .in('column_name', ['assigned_doctor', 'adl_file_id']);
      return response;
    });

    const existing = existingColumns?.data?.map(row => row.column_name) || [];
    
    // Add assigned_doctor column if it doesn't exist
    if (!existing.includes('assigned_doctor')) {
      console.log('📝 Adding assigned_doctor column...');
      const { error } = await supabaseAdmin.rpc('exec_sql', {
        sql: `
          ALTER TABLE clinical_proforma
          ADD COLUMN assigned_doctor INT REFERENCES users(id) ON DELETE SET NULL
        `
      });

      if (error) {
        // Try alternative method - execute via Supabase SQL editor syntax
        console.log('   Trying alternative method...');
        // For Supabase, you may need to run this in the SQL Editor
        console.log('   SQL to execute manually in Supabase SQL Editor:');
        console.log('   ALTER TABLE clinical_proforma ADD COLUMN assigned_doctor INT REFERENCES users(id) ON DELETE SET NULL;');
      } else {
        console.log('   ✓ assigned_doctor column added');
      }
    } else {
      console.log('   ✓ assigned_doctor column already exists');
    }

    // Add adl_file_id column if it doesn't exist
    if (!existing.includes('adl_file_id')) {
      console.log('📝 Adding adl_file_id column...');
      const { error } = await supabaseAdmin.rpc('exec_sql', {
        sql: `
          ALTER TABLE clinical_proforma
          ADD COLUMN adl_file_id INT REFERENCES adl_files(id) ON DELETE SET NULL
        `
      });

      if (error) {
        console.log('   Trying alternative method...');
        console.log('   SQL to execute manually in Supabase SQL Editor:');
        console.log('   ALTER TABLE clinical_proforma ADD COLUMN adl_file_id INT REFERENCES adl_files(id) ON DELETE SET NULL;');
      } else {
        console.log('   ✓ adl_file_id column added');
      }
    } else {
      console.log('   ✓ adl_file_id column already exists');
    }

    // Create indexes
    console.log('\n📝 Creating indexes...');
    const indexSql = [
      `CREATE INDEX IF NOT EXISTS idx_clinical_proforma_assigned_doctor ON clinical_proforma(assigned_doctor)`,
      `CREATE INDEX IF NOT EXISTS idx_clinical_proforma_adl_file_id ON clinical_proforma(adl_file_id)`
    ];

    for (const sql of indexSql) {
      await supabaseAdmin.rpc('exec_sql', { sql }).catch(() => {
        console.log(`   SQL to execute manually: ${sql}`);
      });
    }
    console.log('   ✓ Indexes created (or will be created manually)');

    console.log('\n✅ Migration process completed!');
    console.log('\n⚠️  IMPORTANT: For Supabase, you may need to:');
    console.log('   1. Run the SQL commands manually in Supabase SQL Editor if RPC failed');
    console.log('   2. Wait a few seconds for schema cache to refresh');
    console.log('   3. Restart your backend server');
    console.log('\n📋 SQL Commands to run in Supabase SQL Editor:');
    console.log('   ----------------------------------------');
    console.log('   ALTER TABLE clinical_proforma');
    console.log('   ADD COLUMN IF NOT EXISTS assigned_doctor INT REFERENCES users(id) ON DELETE SET NULL;');
    console.log('');
    console.log('   ALTER TABLE clinical_proforma');
    console.log('   ADD COLUMN IF NOT EXISTS adl_file_id INT REFERENCES adl_files(id) ON DELETE SET NULL;');
    console.log('');
    console.log('   CREATE INDEX IF NOT EXISTS idx_clinical_proforma_assigned_doctor');
    console.log('   ON clinical_proforma(assigned_doctor);');
    console.log('');
    console.log('   CREATE INDEX IF NOT EXISTS idx_clinical_proforma_adl_file_id');
    console.log('   ON clinical_proforma(adl_file_id);');
    console.log('   ----------------------------------------\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

applyMigration();

