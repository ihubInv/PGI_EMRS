#!/usr/bin/env node
require('dotenv').config();

const axios = require('axios');
const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:5000/api';

// Test configuration
const testConfig = {
  adminUser: {
    email: 'admin@pgimer.ac.in',
    password: 'admin123'
  },
  mwoUser: {
    email: 'mwo@pgimer.ac.in',
    password: 'mwo123'
  },
  doctorUser: {
    email: 'jr.doctor@pgimer.ac.in',
    password: 'doctor123'
  }
};

// Helper function to make API requests
async function makeRequest(method, url, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

// Test authentication
async function testAuthentication(user) {
  console.log(`\n🔐 Testing authentication for ${user.email}...`);
  
  const result = await makeRequest('POST', '/users/login', user);
  
  if (result.success) {
    console.log(`  ✅ Authentication successful for ${user.email}`);
    return result.data.data.token;
  } else {
    console.log(`  ❌ Authentication failed for ${user.email}:`, result.error.message);
    return null;
  }
}

// Test patient creation
async function testPatientCreation(token) {
  console.log('\n👤 Testing patient creation...');
  
  const patientData = {
    name: 'Test Patient',
    sex: 'M',
    actual_age: 35,
    assigned_room: 'Room 1'
  };

  const result = await makeRequest('POST', '/patients', patientData, token);
  
  if (result.success) {
    console.log('  ✅ Patient created successfully:', result.data.data.patient.cr_no);
    return result.data.data.patient.id;
  } else {
    console.log('  ❌ Patient creation failed:', result.error.message);
    return null;
  }
}

// Test outpatient record creation
async function testOutpatientRecordCreation(token, patientId) {
  console.log('\n📋 Testing outpatient record creation...');
  
  const recordData = {
    patient_id: patientId,
    age_group: 'Adult',
    marital_status: 'Single',
    occupation: 'Engineer',
    education_level: 'Bachelor',
    religion: 'Hindu',
    contact_number: '9876543210',
    present_address: '123 Test Street, Test City',
    family_type: 'Nuclear'
  };

  const result = await makeRequest('POST', '/outpatient-records', recordData, token);
  
  if (result.success) {
    console.log('  ✅ Outpatient record created successfully');
    return true;
  } else {
    console.log('  ❌ Outpatient record creation failed:', result.error.message);
    return false;
  }
}

// Test clinical proforma creation
async function testClinicalProformaCreation(token, patientId) {
  console.log('\n🏥 Testing clinical proforma creation...');
  
  const clinicalData = {
    patient_id: patientId,
    visit_date: new Date().toISOString().split('T')[0],
    visit_type: 'first_visit',
    room_no: 'Room 205',
    assigned_doctor: 'Dr. Test Doctor',
    doctor_decision: 'simple_case',
    case_severity: 'mild',
    requires_adl_file: false,
    diagnosis: 'Test Diagnosis',
    treatment_prescribed: 'Test Treatment'
  };

  const result = await makeRequest('POST', '/clinical-proformas', clinicalData, token);
  
  if (result.success) {
    console.log('  ✅ Clinical proforma created successfully');
    return result.data.data.proforma.id;
  } else {
    console.log('  ❌ Clinical proforma creation failed:', result.error.message);
    return null;
  }
}

// Test patient search
async function testPatientSearch(token) {
  console.log('\n🔍 Testing patient search...');
  
  const searchData = {
    search: 'Test Patient',
    limit: 10
  };

  const result = await makeRequest('GET', '/patients/search', null, token);
  
  if (result.success && result.data.data.patients.length > 0) {
    console.log('  ✅ Patient search successful:', `${result.data.data.patients.length} patients found`);
    return result.data.data.patients[0].id;
  } else {
    console.log('  ❌ Patient search failed or no results');
    return null;
  }
}

// Test role-based access
async function testRoleBasedAccess(token, userType) {
  console.log(`\n🔒 Testing role-based access for ${userType}...`);
  
  // Test if user can access sensitive endpoints
  const endpoints = {
    'Admin': ['/patients/stats', '/clinical-proformas/stats', '/adl-files/stats'],
    'MWO': ['/outpatient-records/my-records'],
    'JR': ['/clinical-proformas/my-proformas'],
    'SR': ['/clinical-proformas/my-proformas']
  };

  const allowedEndpoints = endpoints[userType] || [];
  
  for (const endpoint of allowedEndpoints) {
    const result = await makeRequest('GET', endpoint, null, token);
    if (result.success) {
      console.log(`  ✅ Access granted to ${endpoint}`);
    } else {
      console.log(`  ❌ Access denied to ${endpoint}:`, result.error.message);
    }
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting comprehensive record creation tests...');
  console.log('🔧 Base URL:', BASE_URL);
  
  let adminToken = null;
  let mwoToken = null;
  let doctorToken = null;

  try {
    // Test 1: Authentication
    adminToken = await testAuthentication(testConfig.adminUser);
    mwoToken = await testAuthentication(testConfig.mwoUser);
    doctorToken = await testAuthentication(testConfig.doctorUser);

    if (!adminToken) {
      console.log('\n❌ Admin authentication failed - skipping most tests');
      return;
    }

    // Test 2: Patient Creation (Admin only)
    const patientId = await testPatientCreation(adminToken);
    
    if (!patientId) {
      console.log('\n❌ Patient creation failed - skipping dependent tests');
      return;
    }

    // Test 3: Patient Search
    const searchPatientId = await testPatientSearch(adminToken);
    
    // Test 4: Outpatient Record Creation (MWO only)
    if (mwoToken) {
      await testOutpatientRecordCreation(mwoToken, patientId);
    } else {
      console.log('\n⚠️  MWO token not available - skipping outpatient record test');
    }

    // Test 5: Clinical Proforma Creation (JR/SR/Admin)
    if (doctorToken) {
      await testClinicalProformaCreation(doctorToken, patientId);
    }
    
    // Test 6: Admin Clinical Proforma Creation
    await testClinicalProformaCreation(adminToken, patientId);

    // Test 7: Role-based Access
    if (adminToken) await testRoleBasedAccess(adminToken, 'Admin');
    if (mwoToken) await testRoleBasedAccess(mwoToken, 'MWO');
    if (doctorToken) await testRoleBasedAccess(doctorToken, 'JR');

    console.log('\n🎉 All tests completed!');

  } catch (error) {
    console.error('\n💥 Test execution failed:', error.message);
  }
}

// Run the tests
if (require.main === module) {
  runTests().then(() => {
    console.log('\n✅ Test suite completed');
    process.exit(0);
  }).catch((error) => {
    console.error('\n💥 Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = {
  testAuthentication,
  testPatientCreation,
  testOutpatientRecordCreation,
  testClinicalProformaCreation,
  testPatientSearch,
  testRoleBasedAccess,
  runTests
};
