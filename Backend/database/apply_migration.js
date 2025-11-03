/**
 * Script to apply database migration for clinical_proforma table
 * Run this with: node Backend/database/apply_migration.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'pgi_emrs'}`,
});

async function applyMigration() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Applying migration: add_assigned_doctor_and_adl_file_id...');

    // Check if columns already exist
    const checkColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'clinical_proforma' 
      AND column_name IN ('assigned_doctor', 'adl_file_id')
    `);

    const existingColumns = checkColumns.rows.map(row => row.column_name);
    
    // Add assigned_doctor if it doesn't exist
    if (!existingColumns.includes('assigned_doctor')) {
      console.log('Adding assigned_doctor column...');
      await client.query(`
        ALTER TABLE clinical_proforma
        ADD COLUMN assigned_doctor INT REFERENCES users(id) ON DELETE SET NULL
      `);
      console.log('✓ assigned_doctor column added');
    } else {
      console.log('✓ assigned_doctor column already exists');
    }

    // Add adl_file_id if it doesn't exist
    if (!existingColumns.includes('adl_file_id')) {
      console.log('Adding adl_file_id column...');
      await client.query(`
        ALTER TABLE clinical_proforma
        ADD COLUMN adl_file_id INT REFERENCES adl_files(id) ON DELETE SET NULL
      `);
      console.log('✓ adl_file_id column added');
    } else {
      console.log('✓ adl_file_id column already exists');
    }

    // Create indexes
    console.log('Creating indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_clinical_proforma_assigned_doctor 
      ON clinical_proforma(assigned_doctor)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_clinical_proforma_adl_file_id 
      ON clinical_proforma(adl_file_id)
    `);
    console.log('✓ Indexes created');

    // Add comments
    await client.query(`
      COMMENT ON COLUMN clinical_proforma.assigned_doctor IS 'Doctor assigned to the patient for this visit'
    `);
    await client.query(`
      COMMENT ON COLUMN clinical_proforma.adl_file_id IS 'Reference to ADL file for complex cases (bidirectional link with adl_files.clinical_proforma_id)'
    `);

    await client.query('COMMIT');
    console.log('\n✅ Migration completed successfully!');
    console.log('Please restart your backend server to refresh the schema cache.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

applyMigration();

