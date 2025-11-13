/**
 * Migration Script: Update patient_visits.patient_id from INT to UUID
 * This fixes the schema mismatch when registered_patient.id is UUID
 * but patient_visits.patient_id is INT
 * 
 * Run with: node Backend/database/migrate_patient_visits_to_uuid.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env file');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🚀 Starting migration: patient_visits.patient_id INT → UUID\n');

    // Step 1: Check current column type
    console.log('📋 Step 1: Checking current column type...');
    const { data: columnInfo, error: checkError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'patient_visits' AND column_name = 'patient_id';
      `
    }).catch(async () => {
      // If RPC doesn't exist, try direct query via Supabase
      // We'll use a workaround by checking if there are any existing visits
      const { data: visits } = await supabaseAdmin
        .from('patient_visits')
        .select('patient_id')
        .limit(1);
      
      if (visits && visits.length > 0) {
        const sampleId = visits[0].patient_id;
        const isUUID = typeof sampleId === 'string' && sampleId.includes('-');
        return { data: [{ data_type: isUUID ? 'uuid' : 'integer' }] };
      }
      return { data: [{ data_type: 'integer' }] }; // Default assumption
    });

    const currentType = columnInfo?.[0]?.data_type || 'integer';
    console.log(`   Current type: ${currentType}`);

    if (currentType === 'uuid') {
      console.log('✅ Column is already UUID. No migration needed.');
      return;
    }

    // Step 2: Check if there are existing visits with integer patient_id
    console.log('\n📋 Step 2: Checking for existing data...');
    const { data: existingVisits, error: countError } = await supabaseAdmin
      .from('patient_visits')
      .select('id, patient_id', { count: 'exact' })
      .limit(1000);

    const hasExistingData = existingVisits && existingVisits.length > 0;
    console.log(`   Found ${existingVisits?.length || 0} existing visit records`);

    if (hasExistingData) {
      console.log('\n⚠️  WARNING: Existing visit records found.');
      console.log('   These records have integer patient_id values.');
      console.log('   We need to map them to UUID patient_ids from registered_patient table.');
      console.log('   This migration will:');
      console.log('   1. Add a temporary UUID column');
      console.log('   2. Map integer IDs to UUIDs from registered_patient');
      console.log('   3. Replace the old column with the new one');
    }

    // Step 3: Execute migration via Supabase SQL Editor
    // Since Supabase doesn't support direct ALTER TABLE via client, we'll provide SQL
    console.log('\n📋 Step 3: Migration SQL to execute:');
    console.log('   ⚠️  This migration must be run in Supabase SQL Editor');
    console.log('   Visit: https://supabase.com/dashboard/project/YOUR_PROJECT/sql\n');
    
    const migrationSQL = hasExistingData ? `
-- Migration: Convert patient_visits.patient_id from INT to UUID (with data migration)

-- Step 1: Drop foreign key constraint
ALTER TABLE patient_visits 
DROP CONSTRAINT IF EXISTS patient_visits_patient_id_fkey;

-- Step 2: Add temporary UUID column
ALTER TABLE patient_visits 
ADD COLUMN patient_id_uuid UUID;

-- Step 3: Migrate existing data (map integer IDs to UUIDs)
-- This assumes registered_patient.id is UUID and we can find matches
UPDATE patient_visits pv
SET patient_id_uuid = rp.id::uuid
FROM registered_patient rp
WHERE pv.patient_id::text = rp.id::text
   OR EXISTS (
     SELECT 1 FROM registered_patient rp2 
     WHERE rp2.id::text LIKE '%' || pv.patient_id::text || '%'
   );

-- If the above doesn't work, you may need to manually map the IDs
-- For now, set NULL for unmapped records (they can be fixed later)
UPDATE patient_visits
SET patient_id_uuid = NULL
WHERE patient_id_uuid IS NULL AND patient_id IS NOT NULL;

-- Step 4: Drop old INT column
ALTER TABLE patient_visits 
DROP COLUMN patient_id;

-- Step 5: Rename UUID column to patient_id
ALTER TABLE patient_visits 
RENAME COLUMN patient_id_uuid TO patient_id;

-- Step 6: Make it NOT NULL (if you want)
-- ALTER TABLE patient_visits 
-- ALTER COLUMN patient_id SET NOT NULL;

-- Step 7: Recreate foreign key constraint
ALTER TABLE patient_visits 
ADD CONSTRAINT patient_visits_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES registered_patient(id) 
ON DELETE CASCADE;

-- Step 8: Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'patient_visits' AND column_name = 'patient_id';
` : `
-- Migration: Convert patient_visits.patient_id from INT to UUID (no existing data)

-- Step 1: Drop foreign key constraint
ALTER TABLE patient_visits 
DROP CONSTRAINT IF EXISTS patient_visits_patient_id_fkey;

-- Step 2: Alter column type from INT to UUID
ALTER TABLE patient_visits 
ALTER COLUMN patient_id TYPE UUID USING patient_id::text::uuid;

-- Step 3: Recreate foreign key constraint
ALTER TABLE patient_visits 
ADD CONSTRAINT patient_visits_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES registered_patient(id) 
ON DELETE CASCADE;

-- Step 4: Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'patient_visits' AND column_name = 'patient_id';
`;

    console.log(migrationSQL);
    console.log('\n📝 Instructions:');
    console.log('   1. Copy the SQL above');
    console.log('   2. Go to Supabase Dashboard → SQL Editor');
    console.log('   3. Paste and execute the SQL');
    console.log('   4. Verify the migration was successful\n');

    // Try to execute via RPC if available
    console.log('🔄 Attempting to execute migration via Supabase RPC...');
    try {
      // Try using Supabase's exec_sql function if it exists
      const { data: result, error: execError } = await supabaseAdmin.rpc('exec_sql', {
        sql: migrationSQL
      });

      if (execError) {
        console.log('   ⚠️  RPC method not available. Please use SQL Editor method above.');
        console.log(`   Error: ${execError.message}`);
      } else {
        console.log('   ✅ Migration executed successfully via RPC!');
        console.log('   Result:', result);
      }
    } catch (rpcError) {
      console.log('   ⚠️  RPC method not available. Please use SQL Editor method above.');
      console.log(`   Error: ${rpcError.message}`);
    }

    console.log('\n✅ Migration script completed!');
    console.log('   If migration was successful, the patient assignment should now work.');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run migration
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };

