#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Create .env file with required variables
const envContent = `# Database Configuration
NODE_ENV=development
PORT=5000

# JWT Configuration
JWT_SECRET=emrs-pgimer-super-secret-jwt-key-2024-production-ready

# Supabase Configuration
SUPABASE_URL=https://opixxwotdsrscfuekysm.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9waXh4d290ZHNyc2NmdWVreXNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMTY0NzQsImV4cCI6MjA3NDg5MjQ3NH0.WphxLI0KYc-MbFk06LrFxrhwu-jcvdji4NdyFX1FlU
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9waXh4d290ZHNyc2NmdWVreXNtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTMxNjQ3NCwiZXhwIjoyMDc0ODkyNDc0fQ.6DKe7ZwnSAWK2LRbbhI7FTOU9KTYlqs5tUJJZZhJAlg

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
FRONTEND_URL=http://localhost:3000
`;

const envPath = path.join(__dirname, '.env');

try {
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env file with required environment variables');
    console.log('📋 Environment Variables Setup Complete!');
    console.log('');
    console.log('🚀 You can now run:');
    console.log('   npm run dev');
    console.log('');
    console.log('⚠️  Important Security Notes:');
    console.log('   - JWT_SECRET should be changed in production');
    console.log('   - Keep your .env file secure and never commit it');
  } else {
    console.log('📄 .env file already exists - no changes made');
  }
} catch (error) {
  console.error('❌ Failed to create .env file:', error.message);
  process.exit(1);
}
