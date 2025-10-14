const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;



// Create Supabase client instances
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Test Supabase client connection
async function testConnection() {
  try {
    // IMPORTANT: Always use supabaseAdmin (service key) for connection tests
    // The anon key has limited permissions and will fail
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);

    if (error && error.code != 'PGRST116') { // PGRST116 is table not found, which is expected for initial setup
      throw error;
    }

    console.log('✅ Connected to Supabase successfully');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection error:', error.message);
    console.error('Check your SUPABASE_URL and SUPABASE_SERVICE_KEY in .env file');
    return false;
  }
}

// Enhanced query function that handles complex SQL queries
const query = async (text, params = []) => {
  const start = Date.now();
  try {
    console.log('Executing query via Supabase:', { text, params });
    
    // Handle aggregation queries (COUNT, AVG, etc.)
    if (text.includes('COUNT(') || text.includes('AVG(')) {
      return await executeAggregationQuery(text, params, start);
    }
    
    // Handle JOIN queries
    if (text.includes('LEFT JOIN') || text.includes('RIGHT JOIN') || text.includes('INNER JOIN')) {
      return await executeJoinQuery(text, params, start);
    }
    
    // Handle INSERT queries
    if (text.includes('INSERT INTO')) {
      return await executeInsertQuery(text, params, start);
    }
    
  // Handle UPDATE queries
  if (text.includes('UPDATE')) {
    return await executeUpdateQuery(text, params, start);
  }
  
  // Handle CREATE TABLE queries
  if (text.includes('CREATE TABLE')) {
    return await executeCreateTableQuery(text, params, start);
  }
  
  // Handle simple queries with ORDER BY and LIMIT
  if (text.includes('ORDER BY') && text.includes('LIMIT')) {
    return await executeSelectWithOrderLimit(text, params, start);
  }
  
  // Handle simple SELECT queries
  return await executeSimpleQuery(text, params, start);
    
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Execute aggregation queries
async function executeAggregationQuery(text, params, startTime) {
  const tableMatch = text.match(/FROM\s+(\w+)/i);
  if (!tableMatch) throw new Error('Could not extract table name');

  const tableName = tableMatch[1];

  // For simple COUNT(*) queries
  if (text.includes('COUNT(*)') && !text.includes('CASE WHEN')) {
    let query = supabaseAdmin.from(tableName).select('*', { count: 'exact', head: true });

    // Handle WHERE conditions for ILIKE search (for patients table)
    if (text.includes('ILIKE') && params.length > 0) {
      const searchPattern = params[0].replace(/%/g, '');
      query = query.or(`name.ilike.%${searchPattern}%,cr_no.ilike.%${searchPattern}%,psy_no.ilike.%${searchPattern}%,adl_no.ilike.%${searchPattern}%`);
    }

    const { count, error } = await query;

    if (error) throw error;

    const duration = Date.now() - startTime;
    console.log('Count query executed successfully', { duration, count });

    return {
      rows: [{ count: count }],
      rowCount: 1,
      command: 'SELECT'
    };
  }
  
  // For complex aggregation queries with CASE WHEN (stats queries)
  const { data, error } = await supabaseAdmin.from(tableName).select('*');
  if (error) throw error;
  
  const stats = computeStatsFromData(data, tableName);
  
  const duration = Date.now() - startTime;
  console.log('Stats query executed successfully', { duration, rows: 1 });
  
  return {
    rows: [stats],
    rowCount: 1,
    command: 'SELECT'
  };
}

// Compute stats from data based on table type
function computeStatsFromData(data, tableName) {
  if (tableName === 'adl_files') {
    return {
      total_files: data.length,
      created_files: data.filter(d => d.file_status === 'created').length,
      stored_files: data.filter(d => d.file_status === 'stored').length,
      retrieved_files: data.filter(d => d.file_status === 'retrieved').length || 0,
      archived_files: data.filter(d => d.file_status === 'archived').length || 0,
      active_files: data.filter(d => d.is_active === true).length,
      inactive_files: data.filter(d => d.is_active === false).length,
      avg_visits_per_file: data.length > 0 ? data.reduce((sum, d) => sum + (d.total_visits || 0), 0) / data.length : 0
    };
  }
  
  if (tableName === 'clinical_proforma') {
    return {
      total_proformas: data.length,
      first_visits: data.filter(d => d.visit_type === 'first_visit').length,
      follow_ups: data.filter(d => d.visit_type === 'follow_up').length,
      simple_cases: data.filter(d => d.doctor_decision === 'simple_case').length,
      complex_cases: data.filter(d => d.doctor_decision === 'complex_case').length,
      cases_requiring_adl: data.filter(d => d.requires_adl_file === true).length,
      mild_cases: data.filter(d => d.case_severity === 'mild').length,
      moderate_cases: data.filter(d => d.case_severity === 'moderate').length,
      severe_cases: data.filter(d => d.case_severity === 'severe').length || 0,
      critical_cases: data.filter(d => d.case_severity === 'critical').length || 0
    };
  }
  
  // Default stats for other tables
  return {
    total_records: data.length,
    total_active: data.filter(d => d.is_active !== false).length,
    total_inactive: data.filter(d => d.is_active === false).length
  };
}

// Execute join queries
async function executeJoinQuery(text, params, startTime) {
  const tableMatch = text.match(/FROM\s+(\w+)\s+\w+\s*(LEFT JOIN|RIGHT JOIN|INNER JOIN|\sORDER|$)/i);
  if (!tableMatch) throw new Error('Could not parse table name');
  
  const mainTable = tableMatch[1];
  
  // Extract LIMIT and OFFSET
  const limitMatch = text.match(/LIMIT\s+(\d+)/i);
  const offsetMatch = text.match(/OFFSET\s+(\d+)/i);
  const limit = limitMatch ? parseInt(limitMatch[1]) : 10;
  const offset = offsetMatch ? parseInt(offsetMatch[1]) : 0;
  
  // For outpatient_record joins
  if (mainTable === 'outpatient_record') {
    const { data, error } = await supabaseAdmin
      .from('outpatient_record')
      .select(`
        *,
        patients:patient_id(id, name, cr_no, psy_no),
        users:filled_by(id, name)
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const transformedData = data.map(item => ({
      ...item,
      patient_name: item.patients?.name,
      cr_no: item.patients?.cr_no,
      psy_no: item.patients?.psy_no,
      filled_by_name: item.users?.name
    }));
    
    const duration = Date.now() - startTime;
    console.log('Join query executed successfully', { duration, rows: transformedData.length });
    
    return {
      rows: transformedData,
      rowCount: transformedData.length,
      command: 'SELECT'
    };
  }
  
  // For adl_files joins
  if (mainTable === 'adl_files') {
    const { data, error } = await supabaseAdmin
      .from('adl_files')
      .select(`
        *,
        patients:patient_id(id, name, cr_no, psy_no),
        created_by_user:created_by(id, name),
        last_accessed_by_user:last_accessed_by(id, name)
      `)
      .range(offset, offset + limit - 1)
      .order('file_created_date', { ascending: false });
    
    if (error) throw error;
    
    const transformedData = data.map(item => ({
      ...item,
      patient_name: item.patients?.name,
      cr_no: item.patients?.cr_no,
      psy_no: item.patients?.psy_no,
      created_by_name: item.created_by_user?.name,
      last_accessed_by_name: item.last_accessed_by_user?.name
    }));
    
    const duration = Date.now() - startTime;
    console.log('Join query executed successfully', { duration, rows: transformedData.length });
    
    return {
      rows: transformedData,
      rowCount: transformedData.length,
      command: 'SELECT'
    };
  }
  
  // For clinical_proforma joins
  if (mainTable === 'clinical_proforma') {
    const { data, error } = await supabaseAdmin
      .from('clinical_proforma')
      .select(`
        *,
        patients:patient_id(id, name, cr_no, psy_no),
        users:filled_by(id, name, role)
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const transformedData = data.map(item => ({
      ...item,
      patient_name: item.patients?.name,
      cr_no: item.patients?.cr_no,
      psy_no: item.patients?.psy_no,
      doctor_name: item.users?.name,
      doctor_role: item.users?.role
    }));

    const duration = Date.now() - startTime;
    console.log('Join query executed successfully', { duration, rows: transformedData.length });

    return {
      rows: transformedData,
      rowCount: transformedData.length,
      command: 'SELECT'
    };
  }

  // For patients joins with doctor assignments
  if (mainTable === 'patients') {
    // Extract WHERE conditions for ILIKE search
    const whereMatch = text.match(/WHERE\s+(.+?)\s+(?:ORDER BY|LIMIT|$)/is);
    let query = supabaseAdmin.from('patients').select('*');

    // Handle ILIKE search conditions
    if (whereMatch && params.length > 0) {
      const searchPattern = params[0].replace(/%/g, '');
      query = query.or(`name.ilike.%${searchPattern}%,cr_no.ilike.%${searchPattern}%,psy_no.ilike.%${searchPattern}%,adl_no.ilike.%${searchPattern}%`);
    }

    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    const { data: patients, error } = await query;
    if (error) throw error;

    if (patients.length === 0) {
      return {
        rows: [],
        rowCount: 0,
        command: 'SELECT'
      };
    }

    // Fetch patient visits for these patients (using patient_visits table)
    const patientIds = patients.map(p => p.id);
    const { data: visits, error: visitsError } = await supabaseAdmin
      .from('patient_visits')
      .select('patient_id, assigned_doctor, visit_date')
      .in('patient_id', patientIds)
      .order('visit_date', { ascending: false });

    if (visitsError) {
      console.error('Error fetching visits:', visitsError);
    }

    // Group visits by patient_id and get the most recent one
    const visitsMap = {};
    if (visits) {
      visits.forEach(visit => {
        if (!visitsMap[visit.patient_id]) {
          visitsMap[visit.patient_id] = visit;
        }
      });
    }

    // Fetch user information for assigned doctors
    const assignedDoctorIds = Object.values(visitsMap)
      .map(v => v.assigned_doctor)
      .filter(id => id);

    let usersMap = {};
    if (assignedDoctorIds.length > 0) {
      const { data: users, error: usersError } = await supabaseAdmin
        .from('users')
        .select('id, name, role')
        .in('id', [...new Set(assignedDoctorIds)]);

      if (!usersError && users) {
        usersMap = users.reduce((acc, u) => ({ ...acc, [u.id]: u }), {});
      }
    }

    // Transform data to match expected format
    const transformedData = patients.map(patient => {
      const latestVisit = visitsMap[patient.id];
      const assignedDoctor = latestVisit && usersMap[latestVisit.assigned_doctor];

      return {
        ...patient,
        assigned_doctor_id: assignedDoctor?.id || null,
        assigned_doctor_name: assignedDoctor?.name || null,
        assigned_doctor_role: assignedDoctor?.role || null,
        last_assigned_date: latestVisit?.visit_date || null
      };
    });

    const duration = Date.now() - startTime;
    console.log('Join query executed successfully', { duration, rows: transformedData.length });

    return {
      rows: transformedData,
      rowCount: transformedData.length,
      command: 'SELECT'
    };
  }

  throw new Error(`Join query not supported for table: ${mainTable}`);
}

// Execute select queries with ORDER BY and LIMIT
async function executeSelectWithOrderLimit(text, params, startTime) {
  const tableMatch = text.match(/FROM\s+(\w+)/i);
  if (!tableMatch) throw new Error('Could not parse table name');
  
  const tableName = tableMatch[1];
  
  const limitMatch = text.match(/LIMIT\s+(\d+)/i);
  const offsetMatch = text.match(/OFFSET\s+(\d+)/i);
  const limit = limitMatch ? parseInt(limitMatch[1]) : 10;
  const offset = offsetMatch ? parseInt(offsetMatch[1]) : 0;
  
  let query = supabaseAdmin.from(tableName).select('*');
  
  // Add WHERE conditions if present
  if (text.includes('WHERE') && params.length > 0) {
    const whereMatch = text.match(/WHERE\s+(\w+)\s*=\s*\$(\d+)/i);
    if (whereMatch) {
      const column = whereMatch[1];
      const paramIndex = parseInt(whereMatch[2]) - 1;
      const value = params[paramIndex];
      query = query.eq(column, value);
    }
  }
  
  // Add ORDER BY if present
  if (text.includes('ORDER BY')) {
    const orderMatch = text.match(/ORDER BY\s+(\w+)/i);
    if (orderMatch) {
      const orderColumn = orderMatch[1];
      query = query.order(orderColumn, { ascending: false });
    }
  }
  
  // Add LIMIT and OFFSET
  query = query.range(offset, offset + limit - 1);
  
  const result = await query;
  if (result.error) throw result.error;
  
  const duration = Date.now() - startTime;
  console.log('Query executed successfully', { duration, rows: result.data.length });
  
  return {
    rows: result.data || [],
    rowCount: result.data ? result.data.length : 0,
    command: 'SELECT'
  };
}

// Execute simple queries
async function executeSimpleQuery(text, params, startTime) {
  const tableMatch = text.match(/FROM\s+(\w+)/i);
  if (!tableMatch) throw new Error('Could not parse table name');
  
  const tableName = tableMatch[1];
  
  let query = supabaseAdmin.from(tableName).select('*');
  
  // Handle WHERE conditions
  if (text.includes('WHERE') && params.length > 0) {
    const whereMatch = text.match(/WHERE\s+(\w+)\s*=\s*\$(\d+)/i);
    if (whereMatch) {
      const column = whereMatch[1];
      const paramIndex = parseInt(whereMatch[2]) - 1;
      const value = params[paramIndex];
      query = query.eq(column, value);
    }
    
    // Handle AND conditions
    const andMatch = text.match(/AND\s+(\w+)\s*=\s*\$(\d+)/i);
    if (andMatch) {
      const column = andMatch[1];
      const paramIndex = parseInt(andMatch[2]) - 1;
      const value = params[paramIndex];
      query = query.eq(column, value);
    }
  }
  
  // Handle ORDER BY
  if (text.includes('ORDER BY')) {
    const orderMatch = text.match(/ORDER BY\s+(\w+)/i);
    if (orderMatch) {
      const orderColumn = orderMatch[1];
      query = query.order(orderColumn, { ascending: false });
    }
  }
  
  // Handle LIMIT
  if (text.includes('LIMIT')) {
    const limitMatch = text.match(/LIMIT\s+(\d+)/i);
    const offsetMatch = text.match(/OFFSET\s+(\d+)/i);
    const limit = limitMatch ? parseInt(limitMatch[1]) : 10;
    const offset = offsetMatch ? parseInt(offsetMatch[1]) : 0;
    
    query = query.range(offset, offset + limit - 1);
  }
  
  const result = await query;
  if (result.error) throw result.error;
  
  const duration = Date.now() - startTime;
  console.log('Query executed successfully', { duration, rows: result.data.length });
  
  return {
    rows: result.data || [],
    rowCount: result.data ? result.data.length : 0,
    command: 'SELECT'
  };
}

// Execute INSERT queries
async function executeInsertQuery(text, params, startTime) {
  try {
    // Extract table name from INSERT INTO statement
    const tableMatch = text.match(/INSERT INTO\s+(\w+)/i);
    if (!tableMatch) throw new Error('Could not parse table name from INSERT statement');
    
    const tableName = tableMatch[1];
    
    // Extract column names and values from the INSERT statement
    const valuesMatch = text.match(/VALUES\s*\(([^)]+)\)/i);
    if (!valuesMatch) throw new Error('Could not parse VALUES from INSERT statement');
    
    // Extract column names from the INSERT statement
    const columnsMatch = text.match(/INSERT INTO\s+\w+\s*\(([^)]+)\)/i);
    if (!columnsMatch) throw new Error('Could not parse column names from INSERT statement');
    
    const columns = columnsMatch[1].split(',').map(col => col.trim());
    
    // Create the data object for Supabase
    const data = {};
    columns.forEach((column, index) => {
      if (params[index] !== undefined) {
        data[column] = params[index];
      }
    });
    
    // Execute the insert using Supabase
    const { data: result, error } = await supabaseAdmin
      .from(tableName)
      .insert(data)
      .select();
    
    if (error) throw error;
    
    const duration = Date.now() - startTime;
    console.log('Insert query executed successfully', { duration, rows: result.length });
    
    return {
      rows: result || [],
      rowCount: result ? result.length : 0,
      command: 'INSERT'
    };
  } catch (error) {
    console.error('Insert query error:', error);
    throw error;
  }
}

// Execute UPDATE queries
async function executeUpdateQuery(text, params, startTime) {
  try {
    // Extract table name from UPDATE statement
    const tableMatch = text.match(/UPDATE\s+(\w+)/i);
    if (!tableMatch) throw new Error('Could not parse table name from UPDATE statement');
    
    const tableName = tableMatch[1];
    
    // Extract SET clause
    const setMatch = text.match(/SET\s+(.+?)(?:\s+WHERE|\s*$)/i);
    if (!setMatch) throw new Error('Could not parse SET clause from UPDATE statement');
    
    const setClause = setMatch[1];
    
    // Parse SET clause to extract column=value pairs
    const setPairs = setClause.split(',').map(pair => pair.trim());
    const updateData = {};
    let paramIndex = 0;
    
    setPairs.forEach(pair => {
      const [column, value] = pair.split('=').map(item => item.trim());
      if (value === `$${paramIndex + 1}`) {
        updateData[column] = params[paramIndex];
        paramIndex++;
      } else if (value === 'CURRENT_TIMESTAMP') {
        // Handle CURRENT_TIMESTAMP - use JavaScript Date
        updateData[column] = new Date().toISOString();
      } else if (!value.includes('$')) {
        // Handle other direct values
        updateData[column] = value;
      }
    });
    
    // Extract WHERE clause if present
    let whereConditions = {};
    const whereMatch = text.match(/WHERE\s+(.+?)(?:\s+RETURNING|\s*$)/i);
    if (whereMatch) {
      const whereClause = whereMatch[1];
      
      // Handle simple WHERE conditions like "id = $2"
      const wherePairMatch = whereClause.match(/(\w+)\s*=\s*\$(\d+)/i);
      if (wherePairMatch) {
        const column = wherePairMatch[1];
        const paramNum = parseInt(wherePairMatch[2]) - 1;
        if (params[paramNum] !== undefined) {
          whereConditions[column] = params[paramNum];
        }
      }
    }
    
    // Execute the update using Supabase
    let query = supabaseAdmin.from(tableName).update(updateData);
    
    // Apply WHERE conditions
    Object.keys(whereConditions).forEach(column => {
      query = query.eq(column, whereConditions[column]);
    });
    
    // Check if RETURNING clause is present
    const { data: result, error } = text.includes('RETURNING') 
      ? await query.select()
      : await query;
    
    if (error) throw error;
    
    const duration = Date.now() - startTime;
    console.log('Update query executed successfully', { duration, rows: result ? result.length : 0 });
    
    return {
      rows: result || [],
      rowCount: result ? result.length : 0,
      command: 'UPDATE'
    };
  } catch (error) {
    console.error('Update query error:', error);
    throw error;
  }
}

// Helper function to get Supabase client for direct operations
const getClient = () => {
  return supabaseAdmin; // Return admin client for direct operations
};

// Initialize connection test on module load
// Execute CREATE TABLE queries
async function executeCreateTableQuery(text, params, startTime) {
  try {
    console.log('Executing CREATE TABLE query via Supabase:', { text: text.substring(0, 100) + '...', params });
    
    // For CREATE TABLE, we'll use the Supabase REST API directly
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({
        sql: text
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase CREATE TABLE error:', errorText);
      throw new Error(`Supabase error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    const duration = Date.now() - startTime;
    console.log('CREATE TABLE query executed successfully', { duration });
    
    return {
      rows: [],
      rowCount: 0,
      command: 'CREATE TABLE'
    };
  } catch (error) {
    console.error('CREATE TABLE query error:', error);
    throw error;
  }
}

testConnection();

module.exports = {
  query,
  getClient,
  supabase,
  supabaseAdmin,
  testConnection
};