#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = 'https://opixxwotdsrscfuekysm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9waXh4d290ZHNyc2NmdWVreXNtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTMxNjQ3NCwiZXhwIjoyMDc0ODkyNDc0fQ.6DKe7ZwnSAWK2LRbbhI7FTOU9KTYlqs5tUJJZZhJAlg';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

class SupabaseMigrator {
  async testConnection() {
    try {
      const { data, error } = await supabase
        .from('pg_tables')
        .select('*')
        .limit(1);
      
      console.log('✅ Connected to Supabase');
      return true;
    } catch (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    }
  }

  async createTables() {
    try {
      console.log('🚀 Creating database tables via Supabase...\n');

      // Note: For Supabase, you need to run SQL directly in the Supabase SQL Editor
      // This script will help you create tables using the Supabase client API
      
      console.log('📋 Supabase Table Creation Instructions:');
      console.log('');
      console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard');
      console.log('2. Select your project: opixxwotdsrscfuekysm');
      console.log('3. Go to SQL Editor');
      console.log('4. Run the SQL from database/schema.sql');
      console.log('');
      console.log('Alternatively, visit: https://supabase.com/dashboard/project/opixxwotdsrscfuekysm/sql');
      
      return true;
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  }

  async checkStatus() {
    try {
      console.log('📊 Checking Supabase table status...\n');
      
      // Check if common tables exist
      const tables = ['users', 'patients', 'outpatient_record', 'clinical_proforma', 'adl_files'];
      
      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('count')
            .limit(1);
          
          if (error) {
            console.log(`❌ ${table}: Table does not exist`);
          } else {
            console.log(`✅ ${table}: Table exists`);
          }
        } catch (err) {
          console.log(`❌ ${table}: Not accessible`);
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ Status check failed:', error.message);
      return false;
    }
  }
}

// CLI interface
async function main() {
  const command = process.argv[2];
  const migrator = new SupabaseMigrator();

  try {
    const connected = await migrator.testConnection();
    if (!connected) {
      process.exit(1);
    }

    switch (command) {
      case 'migrate':
        await migrator.createTables();
        break;
      
      case 'status':
        await migrator.checkStatus();
        break;
      
      default:
        console.log(`
🏥 EMRS PGIMER Supabase Migration Tool

Usage: node database/supabaseMigrate.js <command>

Commands:
  migrate   - Show instructions for creating tables via Supabase dashboard
  status    - Check which tables exist in your Supabase database

Notes:
  - Supabase requires SQL execution through their dashboard
  - Visit: https://supabase.com/dashboard/project/opixxwotdsrscfuekysm/sql
  - Run contents of database/schema.sql there

Example:
  node database/supabaseMigrate.js migrate
  node database/supabaseMigrate.js status
        `);
        break;
    }

  } catch (error) {
    console.error('❌ Migration tool error:', error.message);
    process.exit(1);
  }
}

// Run if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = SupabaseMigrator;
