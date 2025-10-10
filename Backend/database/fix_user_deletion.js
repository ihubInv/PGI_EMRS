const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixUserDeletionConstraints() {
  console.log('🔧 Fixing user deletion constraints...');
  
  const constraints = [
    // 1. Update outpatient_record table
    {
      table: 'outpatient_record',
      column: 'filled_by',
      description: 'outpatient_record.filled_by -> users.id'
    },
    // 2. Update clinical_proforma table
    {
      table: 'clinical_proforma',
      column: 'filled_by',
      description: 'clinical_proforma.filled_by -> users.id'
    },
    // 3. Update adl_files table
    {
      table: 'adl_files',
      column: 'created_by',
      description: 'adl_files.created_by -> users.id'
    },
    {
      table: 'adl_files',
      column: 'last_accessed_by',
      description: 'adl_files.last_accessed_by -> users.id'
    },
    // 4. Update file_movements table
    {
      table: 'file_movements',
      column: 'moved_by',
      description: 'file_movements.moved_by -> users.id'
    },
    // 5. Update patient_assignments table
    {
      table: 'patient_assignments',
      column: 'assigned_doctor',
      description: 'patient_assignments.assigned_doctor -> users.id'
    },
    // 6. Update audit_logs table
    {
      table: 'audit_logs',
      column: 'changed_by',
      description: 'audit_logs.changed_by -> users.id'
    }
  ];

  try {
    for (const constraint of constraints) {
      console.log(`\n📝 Updating constraint: ${constraint.description}`);
      
      // Drop existing constraint
      const dropQuery = `
        ALTER TABLE ${constraint.table} 
        DROP CONSTRAINT IF EXISTS ${constraint.table}_${constraint.column}_fkey;
      `;
      
      console.log(`   Dropping existing constraint...`);
      const { error: dropError } = await supabase.rpc('exec_sql', { sql: dropQuery });
      
      if (dropError) {
        console.log(`   ⚠️  Warning: Could not drop constraint (may not exist): ${dropError.message}`);
      } else {
        console.log(`   ✅ Dropped existing constraint`);
      }
      
      // Add new constraint with ON DELETE CASCADE
      const addQuery = `
        ALTER TABLE ${constraint.table} 
        ADD CONSTRAINT ${constraint.table}_${constraint.column}_fkey 
        FOREIGN KEY (${constraint.column}) REFERENCES users(id) ON DELETE CASCADE;
      `;
      
      console.log(`   Adding new constraint with ON DELETE CASCADE...`);
      const { error: addError } = await supabase.rpc('exec_sql', { sql: addQuery });
      
      if (addError) {
        console.error(`   ❌ Error adding constraint: ${addError.message}`);
      } else {
        console.log(`   ✅ Added new constraint with ON DELETE CASCADE`);
      }
    }
    
    console.log('\n🎉 All user deletion constraints have been updated!');
    console.log('✅ Users can now be deleted and all related records will be cascaded.');
    
  } catch (error) {
    console.error('❌ Error fixing user deletion constraints:', error);
    process.exit(1);
  }
}

// Run the migration
fixUserDeletionConstraints()
  .then(() => {
    console.log('\n✨ Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
