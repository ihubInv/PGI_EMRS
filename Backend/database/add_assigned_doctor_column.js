/**
 * Script to add assigned_doctor and adl_file_id columns to clinical_proforma table
 * This script uses Supabase's RPC function or direct SQL execution
 * 
 * Run with: node Backend/database/add_assigned_doctor_column.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env file');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function addColumns() {
  try {
    console.log('🚀 Adding assigned_doctor and adl_file_id columns to clinical_proforma...\n');

    // SQL statements to execute
    const sqlStatements = [
      `ALTER TABLE clinical_proforma
       ADD COLUMN IF NOT EXISTS assigned_doctor INT REFERENCES users(id) ON DELETE SET NULL;`,
      
      `ALTER TABLE clinical_proforma
       ADD COLUMN IF NOT EXISTS adl_file_id INT REFERENCES adl_files(id) ON DELETE SET NULL;`,
      
      `CREATE INDEX IF NOT EXISTS idx_clinical_proforma_assigned_doctor 
       ON clinical_proforma(assigned_doctor);`,
      
      `CREATE INDEX IF NOT EXISTS idx_clinical_proforma_adl_file_id 
       ON clinical_proforma(adl_file_id);`,
      
      `COMMENT ON COLUMN clinical_proforma.assigned_doctor IS 'Doctor assigned to the patient for this visit';`,
      
      `COMMENT ON COLUMN clinical_proforma.adl_file_id IS 'Reference to ADL file for complex cases (bidirectional link with adl_files.clinical_proforma_id)';`
    ];

    console.log('📋 SQL to Execute:\n');
    console.log('═'.repeat(60));
    for (const sql of sqlStatements) {
      console.log(sql);
      console.log('');
    }
    console.log('═'.repeat(60));
    console.log('\n⚠️  IMPORTANT: For Supabase, you need to run these SQL statements manually.');
    console.log('   Supabase does not allow direct ALTER TABLE via REST API.\n');
    console.log('📝 Steps to Fix:');
    console.log('   1. Go to your Supabase Dashboard');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Copy and paste the SQL statements above');
    console.log('   4. Click "Run" to execute');
    console.log('   5. Wait 10-30 seconds for schema cache to refresh');
    console.log('   6. Restart your backend server\n');
    
    console.log('🌐 Supabase Dashboard URL:');
    if (supabaseUrl.includes('supabase.co')) {
      const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
      if (projectRef) {
        console.log(`   https://supabase.com/dashboard/project/${projectRef}/sql\n`);
      }
    }
    
    // Try to verify columns exist (after migration is run)
    console.log('🔍 Verifying columns...');
    try {
      const { data, error } = await supabaseAdmin
        .from('clinical_proforma')
        .select('id')
        .limit(1);
      
      if (error && error.message.includes('assigned_doctor')) {
        console.log('   ❌ assigned_doctor column does not exist yet');
        console.log('   ⚠️  Please run the SQL migration in Supabase SQL Editor first\n');
      } else {
        console.log('   ✓ Connection successful');
        console.log('   ℹ️  Column verification requires direct SQL access\n');
      }
    } catch (err) {
      console.log('   ℹ️  Cannot verify columns without direct SQL access\n');
    }

    console.log('✅ Instructions displayed. Please follow the steps above to add the columns.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

addColumns();

