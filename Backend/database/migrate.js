#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

class DatabaseMigrator {
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

  async runMigration() {
    try {
      console.log('🚀 Starting database migration...\n');

      // Read schema file
      const schemaPath = path.join(__dirname, 'schema.sql');
      if (!fs.existsSync(schemaPath)) {
        throw new Error('Schema file not found: database/schema.sql');
      }

      const schema = fs.readFileSync(schemaPath, 'utf8');

      // Execute schema
      console.log('📋 Executing database schema...');
      await this.pool.query(schema);

      console.log('✅ Database migration completed successfully!');
      
      // Verify tables were created
      await this.verifyTables();
      
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  }

  async verifyTables() {
    try {
      console.log('\n🔍 Verifying database structure...');
      
      const result = await this.pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);

      const expectedTables = [
        'users', 'patients', 'outpatient_record', 'clinical_proforma', 
        'adl_files', 'file_movements', 'patient_visits', 
        'system_settings', 'audit_log'
      ];

      const createdTables = result.rows.map(row => row.table_name);
      const missingTables = expectedTables.filter(table => !createdTables.includes(table));

      if (missingTables.length === 0) {
        console.log('✅ All tables created successfully:');
        createdTables.forEach(table => console.log(`   - ${table}`));
      } else {
        console.log('⚠️  Missing tables:', missingTables);
      }

      // Check indexes
      const indexResult = await this.pool.query(`
        SELECT indexname 
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND indexname LIKE 'idx_%'
        ORDER BY indexname
      `);

      console.log(`\n📊 Created ${indexResult.rows.length} indexes`);

      // Check functions
      const functionResult = await this.pool.query(`
        SELECT routine_name 
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_type = 'FUNCTION'
        ORDER BY routine_name
      `);

      console.log(`📊 Created ${functionResult.rows.length} functions`);

    } catch (error) {
      console.error('❌ Verification failed:', error.message);
      throw error;
    }
  }

  async rollback() {
    try {
      console.log('🔄 Rolling back database changes...');
      
      const tables = [
        'audit_log', 'system_settings', 'patient_visits', 'file_movements',
        'adl_files', 'clinical_proforma', 'outpatient_record', 'patients', 'users'
      ];

      for (const table of tables) {
        await this.pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        console.log(`   - Dropped table: ${table}`);
      }

      // Drop functions
      await this.pool.query('DROP FUNCTION IF EXISTS generate_cr_number() CASCADE');
      await this.pool.query('DROP FUNCTION IF EXISTS generate_psy_number() CASCADE');
      await this.pool.query('DROP FUNCTION IF EXISTS generate_adl_number() CASCADE');
      await this.pool.query('DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE');

      console.log('✅ Rollback completed');
    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
      throw error;
    }
  }

  async checkMigrationStatus() {
    try {
      console.log('📊 Checking migration status...\n');

      // Check if tables exist
      const result = await this.pool.query(`
        SELECT 
          table_name,
          (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
        FROM information_schema.tables t
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);

      if (result.rows.length === 0) {
        console.log('❌ No tables found. Database needs migration.');
        return false;
      }

      console.log('✅ Database tables:');
      result.rows.forEach(row => {
        console.log(`   - ${row.table_name} (${row.column_count} columns)`);
      });

      // Check system settings
      const settingsResult = await this.pool.query('SELECT COUNT(*) FROM system_settings');
      console.log(`\n📋 System settings: ${settingsResult.rows[0].count} entries`);

      return true;
    } catch (error) {
      console.error('❌ Status check failed:', error.message);
      return false;
    }
  }

  async close() {
    await this.pool.end();
  }
}

// CLI interface
async function main() {
  const command = process.argv[2];
  const migrator = new DatabaseMigrator();

  try {
    await migrator.connect();

    switch (command) {
      case 'migrate':
        await migrator.runMigration();
        break;
      
      case 'rollback':
        await migrator.rollback();
        break;
      
      case 'status':
        await migrator.checkMigrationStatus();
        break;
      
      default:
        console.log(`
🏥 EMRS PGIMER Database Migration Tool

Usage: node database/migrate.js <command>

Commands:
  migrate   - Run database migration (create tables, indexes, functions)
  rollback  - Rollback all database changes (DROP everything)
  status    - Check current migration status

Examples:
  node database/migrate.js migrate
  node database/migrate.js status
  node database/migrate.js rollback

⚠️  Warning: rollback will delete ALL data!
        `);
        break;
    }

  } catch (error) {
    console.error('❌ Migration tool error:', error.message);
    process.exit(1);
  } finally {
    await migrator.close();
  }
}

// Run if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = DatabaseMigrator;
