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
    
    // Handle JOIN queries (including LEFT JOIN LATERAL)
    // If query contains LATERAL, use PostgreSQL RPC for raw SQL execution
    if (text.includes('LATERAL')) {
      return await executeRawSQLQuery(text, params, start);
    }
    
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
    if (text.includes('ILIKE') && params.length > 0 && typeof params[0] === 'string') {
      const searchPattern = params[0].replace(/%/g, '');
      query = query.or(`name.ilike.%${searchPattern}%,cr_no.ilike.%${searchPattern}%,psy_no.ilike.%${searchPattern}%,adl_no.ilike.%${searchPattern}%`);
    }

    // Handle WHERE conditions for adl_files COUNT query
    if (tableName === 'adl_files' && text.includes('WHERE') && params.length > 0) {
      // Handle file_status filter
      const fileStatusMatch = text.match(/AND\s+af\.file_status\s*=\s*\$(\d+)/i);
      if (fileStatusMatch) {
        const paramIndex = parseInt(fileStatusMatch[1]) - 1;
        const fileStatus = params[paramIndex];
        query = query.eq('file_status', fileStatus);
      }
      
      // Handle is_active filter
      const isActiveMatch = text.match(/AND\s+af\.is_active\s*=\s*\$(\d+)/i);
      if (isActiveMatch) {
        const paramIndex = parseInt(isActiveMatch[1]) - 1;
        const isActive = params[paramIndex];
        query = query.eq('is_active', isActive);
      }
      
      // Handle created_by filter
      const createdByMatch = text.match(/AND\s+af\.created_by\s*=\s*\$(\d+)/i);
      if (createdByMatch) {
        const paramIndex = parseInt(createdByMatch[1]) - 1;
        const createdBy = params[paramIndex];
        query = query.eq('created_by', createdBy);
      }
      
      // Handle last_accessed_by filter
      const lastAccessedMatch = text.match(/AND\s+af\.last_accessed_by\s*=\s*\$(\d+)/i);
      if (lastAccessedMatch) {
        const paramIndex = parseInt(lastAccessedMatch[1]) - 1;
        const lastAccessedBy = params[paramIndex];
        query = query.eq('last_accessed_by', lastAccessedBy);
      }
      
      // Handle date_from filter
      const dateFromMatch = text.match(/AND\s+af\.file_created_date\s*>=\s*\$(\d+)/i);
      if (dateFromMatch) {
        const paramIndex = parseInt(dateFromMatch[1]) - 1;
        const dateFrom = params[paramIndex];
        query = query.gte('file_created_date', dateFrom);
      }
      
      // Handle date_to filter
      const dateToMatch = text.match(/AND\s+af\.file_created_date\s*<=\s*\$(\d+)/i);
      if (dateToMatch) {
        const paramIndex = parseInt(dateToMatch[1]) - 1;
        const dateTo = params[paramIndex];
        query = query.lte('file_created_date', dateTo);
      }
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
    // Extract WHERE conditions and apply filters
    // Use simplest Supabase relationship syntax - let Supabase auto-detect
    // If auto-detection fails, Supabase needs foreign keys to be properly set up
    let query = supabaseAdmin
      .from('adl_files')
      .select(`
        *,
        patients(id, name, cr_no, psy_no),
        users!created_by(id, name, role),
        clinical_proforma(id, assigned_doctor, visit_date)
      `);
    
    // Apply WHERE conditions if present in the SQL query
    if (text.includes('WHERE') && params.length > 0) {
      // Handle file_status filter
      const fileStatusMatch = text.match(/AND\s+af\.file_status\s*=\s*\$(\d+)/i);
      if (fileStatusMatch) {
        const paramIndex = parseInt(fileStatusMatch[1]) - 1;
        const fileStatus = params[paramIndex];
        query = query.eq('file_status', fileStatus);
      }
      
      // Handle is_active filter
      const isActiveMatch = text.match(/AND\s+af\.is_active\s*=\s*\$(\d+)/i);
      if (isActiveMatch) {
        const paramIndex = parseInt(isActiveMatch[1]) - 1;
        const isActive = params[paramIndex];
        query = query.eq('is_active', isActive);
      }
      
      // Handle created_by filter
      const createdByMatch = text.match(/AND\s+af\.created_by\s*=\s*\$(\d+)/i);
      if (createdByMatch) {
        const paramIndex = parseInt(createdByMatch[1]) - 1;
        const createdBy = params[paramIndex];
        query = query.eq('created_by', createdBy);
      }
      
      // Handle last_accessed_by filter
      const lastAccessedMatch = text.match(/AND\s+af\.last_accessed_by\s*=\s*\$(\d+)/i);
      if (lastAccessedMatch) {
        const paramIndex = parseInt(lastAccessedMatch[1]) - 1;
        const lastAccessedBy = params[paramIndex];
        query = query.eq('last_accessed_by', lastAccessedBy);
      }
      
      // Handle date_from filter
      const dateFromMatch = text.match(/AND\s+af\.file_created_date\s*>=\s*\$(\d+)/i);
      if (dateFromMatch) {
        const paramIndex = parseInt(dateFromMatch[1]) - 1;
        const dateFrom = params[paramIndex];
        query = query.gte('file_created_date', dateFrom);
      }
      
      // Handle date_to filter
      const dateToMatch = text.match(/AND\s+af\.file_created_date\s*<=\s*\$(\d+)/i);
      if (dateToMatch) {
        const paramIndex = parseInt(dateToMatch[1]) - 1;
        const dateTo = params[paramIndex];
        query = query.lte('file_created_date', dateTo);
      }
    }
    
    // Apply ordering and pagination
    query = query
      .order('file_created_date', { ascending: false })
      .range(offset, offset + limit - 1);
    
    let data, error;
    
    try {
      const result = await query;
      data = result.data;
      error = result.error;
    } catch (queryError) {
      console.error('Supabase query execution error:', queryError);
      error = queryError;
    }
    
    // If relationship error occurs, fallback to fetching without joins
    if (error && (error.message?.includes('relationship') || error.message?.includes('schema cache') || error.code === 'PGRST116')) {
      console.warn('Supabase relationship error detected, using fallback query without joins');
      
      // Fallback: Fetch ADL files without joins, then fetch related data separately
      let fallbackQuery = supabaseAdmin.from('adl_files').select('*');
      
      // Apply filters
      if (text.includes('WHERE') && params.length > 0) {
        const fileStatusMatch = text.match(/AND\s+af\.file_status\s*=\s*\$(\d+)/i);
        if (fileStatusMatch) {
          const paramIndex = parseInt(fileStatusMatch[1]) - 1;
          fallbackQuery = fallbackQuery.eq('file_status', params[paramIndex]);
        }
        
        const isActiveMatch = text.match(/AND\s+af\.is_active\s*=\s*\$(\d+)/i);
        if (isActiveMatch) {
          const paramIndex = parseInt(isActiveMatch[1]) - 1;
          fallbackQuery = fallbackQuery.eq('is_active', params[paramIndex]);
        }
        
        const createdByMatch = text.match(/AND\s+af\.created_by\s*=\s*\$(\d+)/i);
        if (createdByMatch) {
          const paramIndex = parseInt(createdByMatch[1]) - 1;
          fallbackQuery = fallbackQuery.eq('created_by', params[paramIndex]);
        }
        
        const lastAccessedMatch = text.match(/AND\s+af\.last_accessed_by\s*=\s*\$(\d+)/i);
        if (lastAccessedMatch) {
          const paramIndex = parseInt(lastAccessedMatch[1]) - 1;
          fallbackQuery = fallbackQuery.eq('last_accessed_by', params[paramIndex]);
        }
        
        const dateFromMatch = text.match(/AND\s+af\.file_created_date\s*>=\s*\$(\d+)/i);
        if (dateFromMatch) {
          const paramIndex = parseInt(dateFromMatch[1]) - 1;
          fallbackQuery = fallbackQuery.gte('file_created_date', params[paramIndex]);
        }
        
        const dateToMatch = text.match(/AND\s+af\.file_created_date\s*<=\s*\$(\d+)/i);
        if (dateToMatch) {
          const paramIndex = parseInt(dateToMatch[1]) - 1;
          fallbackQuery = fallbackQuery.lte('file_created_date', params[paramIndex]);
        }
      }
      
      fallbackQuery = fallbackQuery.order('file_created_date', { ascending: false }).range(offset, offset + limit - 1);
      
      const fallbackResult = await fallbackQuery;
      
      if (fallbackResult.error) {
        console.error('Fallback query also failed:', fallbackResult.error);
        throw fallbackResult.error;
      }
      
      data = fallbackResult.data;
      
      // Fetch related data separately
      if (data && data.length > 0) {
        const patientIds = [...new Set(data.map(item => item.patient_id).filter(id => id))];
        const userIds = [...new Set([
          ...data.map(item => item.created_by).filter(id => id),
          ...data.map(item => item.last_accessed_by).filter(id => id)
        ])];
        const clinicalProformaIds = [...new Set(data.map(item => item.clinical_proforma_id).filter(id => id))];
        
        // Fetch patients
        let patientsMap = {};
        if (patientIds.length > 0) {
          const { data: patients } = await supabaseAdmin
            .from('patients')
            .select('id, name, cr_no, psy_no')
            .in('id', patientIds);
          if (patients) {
            patientsMap = patients.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
          }
        }
        
        // Fetch users
        let usersMap = {};
        if (userIds.length > 0) {
          const { data: users } = await supabaseAdmin
            .from('users')
            .select('id, name, role')
            .in('id', userIds);
          if (users) {
            usersMap = users.reduce((acc, u) => ({ ...acc, [u.id]: u }), {});
          }
        }
        
        // Fetch clinical proformas and their assigned doctors
        let proformasMap = {};
        let assignedDoctorIds = [];
        if (clinicalProformaIds.length > 0) {
          const { data: proformas } = await supabaseAdmin
            .from('clinical_proforma')
            .select('id, assigned_doctor, visit_date')
            .in('id', clinicalProformaIds);
          if (proformas) {
            proformasMap = proformas.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
            assignedDoctorIds = proformas.map(p => p.assigned_doctor).filter(id => id);
          }
        }
        
        // Fetch assigned doctors
        let doctorsMap = {};
        if (assignedDoctorIds.length > 0) {
          const { data: doctors } = await supabaseAdmin
            .from('users')
            .select('id, name, role')
            .in('id', [...new Set(assignedDoctorIds)]);
          if (doctors) {
            doctorsMap = doctors.reduce((acc, d) => ({ ...acc, [d.id]: d }), {});
          }
        }
        
        // Transform data with all relationships
        data = data.map(item => {
          const patient = patientsMap[item.patient_id];
          const createdByUser = usersMap[item.created_by];
          const lastAccessedByUser = usersMap[item.last_accessed_by];
          const proforma = proformasMap[item.clinical_proforma_id];
          const assignedDoctor = proforma && doctorsMap[proforma.assigned_doctor];
          
          return {
      ...item,
            patient_name: patient?.name || null,
            cr_no: patient?.cr_no || null,
            psy_no: patient?.psy_no || null,
            created_by_name: createdByUser?.name || null,
            created_by_role: createdByUser?.role || null,
            last_accessed_by_name: lastAccessedByUser?.name || null,
            clinical_proforma_id: proforma?.id || null,
            assigned_doctor: proforma?.assigned_doctor || null,
            assigned_doctor_name: assignedDoctor?.name || null,
            assigned_doctor_role: assignedDoctor?.role || null,
            proforma_visit_date: proforma?.visit_date || null
          };
        });
      }
      
      // Skip the transformation below since we already transformed in fallback
      const duration = Date.now() - startTime;
      console.log('Fallback join query executed successfully', { duration, rows: data.length });
      
      return {
        rows: data,
        rowCount: data.length,
        command: 'SELECT'
      };
    } else if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }
    
    // Transform data to match expected format with all joined fields (only if not using fallback)
    // Handle Supabase's response format (can be object or array)
    const transformedData = data.map(item => {
      // Supabase may return relationships as arrays or objects
      const patient = Array.isArray(item.patients) ? item.patients[0] : item.patients;
      const createdByUser = Array.isArray(item.users) ? item.users[0] : item.users;
      const clinicalProforma = Array.isArray(item.clinical_proforma) 
        ? item.clinical_proforma[0] 
        : item.clinical_proforma;
      
      return {
        ...item,
        patient_name: patient?.name || null,
        cr_no: patient?.cr_no || null,
        psy_no: patient?.psy_no || null,
        created_by_name: createdByUser?.name || null,
        created_by_role: createdByUser?.role || null,
        last_accessed_by_name: null, // Will fetch separately
        clinical_proforma_id: clinicalProforma?.id || null,
        assigned_doctor: clinicalProforma?.assigned_doctor || null,
        assigned_doctor_name: null, // Will fetch separately
        assigned_doctor_role: null, // Will fetch separately
        proforma_visit_date: clinicalProforma?.visit_date || null
      };
    });
    
    // Fetch last_accessed_by users separately (since we can't join same table twice easily)
    const lastAccessedByIds = transformedData
      .map(item => item.last_accessed_by)
      .filter(id => id && id !== item.created_by);
    
    const uniqueLastAccessedIds = [...new Set(lastAccessedByIds)];
    
    if (uniqueLastAccessedIds.length > 0) {
      const { data: lastAccessedUsers, error: lastAccessError } = await supabaseAdmin
        .from('users')
        .select('id, name')
        .in('id', uniqueLastAccessedIds);
      
      if (!lastAccessError && lastAccessedUsers) {
        const lastAccessMap = lastAccessedUsers.reduce((acc, u) => ({ ...acc, [u.id]: u }), {});
        transformedData.forEach(item => {
          if (item.last_accessed_by && lastAccessMap[item.last_accessed_by]) {
            item.last_accessed_by_name = lastAccessMap[item.last_accessed_by].name;
          } else if (item.last_accessed_by === item.created_by) {
            item.last_accessed_by_name = item.created_by_name;
          }
        });
      }
    } else {
      // If last_accessed_by matches created_by, use created_by_name
      transformedData.forEach(item => {
        if (item.last_accessed_by === item.created_by && item.created_by_name) {
          item.last_accessed_by_name = item.created_by_name;
        }
      });
    }
    
    // Fetch assigned doctor information separately if needed (since Supabase nested joins can be complex)
    const clinicalProformaIds = transformedData
      .map(item => item.clinical_proforma_id)
      .filter(id => id);
    
    if (clinicalProformaIds.length > 0) {
      const { data: proformas, error: proformaError } = await supabaseAdmin
        .from('clinical_proforma')
        .select('id, assigned_doctor')
        .in('id', clinicalProformaIds);
      
      if (!proformaError && proformas) {
        const assignedDoctorIds = proformas
          .map(p => p.assigned_doctor)
          .filter(id => id);
        
        if (assignedDoctorIds.length > 0) {
          const { data: doctors, error: doctorsError } = await supabaseAdmin
            .from('users')
            .select('id, name, role')
            .in('id', assignedDoctorIds);
          
          if (!doctorsError && doctors) {
            const doctorsMap = doctors.reduce((acc, d) => ({ ...acc, [d.id]: d }), {});
            const proformasMap = proformas.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
            
            transformedData.forEach(item => {
              if (item.clinical_proforma_id) {
                const proforma = proformasMap[item.clinical_proforma_id];
                if (proforma && proforma.assigned_doctor) {
                  const doctor = doctorsMap[proforma.assigned_doctor];
                  if (doctor) {
                    item.assigned_doctor = doctor.id;
                    item.assigned_doctor_name = doctor.name;
                    item.assigned_doctor_role = doctor.role;
                  }
                }
              }
            });
          }
        }
      }
    }
    
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
    // Build the query with filters
    let query = supabaseAdmin.from('clinical_proforma').select('*');

    // Apply WHERE conditions if present
    if (text.includes('WHERE') && params.length > 0) {
      // Handle patient_id filter
      const patientIdMatch = text.match(/WHERE\s+cp\.patient_id\s*=\s*\$(\d+)/i);
      if (patientIdMatch) {
        const paramIndex = parseInt(patientIdMatch[1]) - 1;
        const patientId = params[paramIndex];
        query = query.eq('patient_id', patientId);
      }

      // Handle other filters
      const visitTypeMatch = text.match(/AND\s+cp\.visit_type\s*=\s*\$(\d+)/i);
      if (visitTypeMatch) {
        const paramIndex = parseInt(visitTypeMatch[1]) - 1;
        const visitType = params[paramIndex];
        query = query.eq('visit_type', visitType);
      }

      const doctorDecisionMatch = text.match(/AND\s+cp\.doctor_decision\s*=\s*\$(\d+)/i);
      if (doctorDecisionMatch) {
        const paramIndex = parseInt(doctorDecisionMatch[1]) - 1;
        const doctorDecision = params[paramIndex];
        query = query.eq('doctor_decision', doctorDecision);
      }

      const caseSeverityMatch = text.match(/AND\s+cp\.case_severity\s*=\s*\$(\d+)/i);
      if (caseSeverityMatch) {
        const paramIndex = parseInt(caseSeverityMatch[1]) - 1;
        const caseSeverity = params[paramIndex];
        query = query.eq('case_severity', caseSeverity);
      }

      const requiresAdlMatch = text.match(/AND\s+cp\.requires_adl_file\s*=\s*\$(\d+)/i);
      if (requiresAdlMatch) {
        const paramIndex = parseInt(requiresAdlMatch[1]) - 1;
        const requiresAdl = params[paramIndex];
        query = query.eq('requires_adl_file', requiresAdl);
      }

      const filledByMatch = text.match(/AND\s+cp\.filled_by\s*=\s*\$(\d+)/i);
      if (filledByMatch) {
        const paramIndex = parseInt(filledByMatch[1]) - 1;
        const filledBy = params[paramIndex];
        query = query.eq('filled_by', filledBy);
      }

      const roomNoMatch = text.match(/AND\s+cp\.room_no\s*=\s*\$(\d+)/i);
      if (roomNoMatch) {
        const paramIndex = parseInt(roomNoMatch[1]) - 1;
        const roomNo = params[paramIndex];
        query = query.eq('room_no', roomNo);
      }

      const dateFromMatch = text.match(/AND\s+cp\.visit_date\s*>=\s*\$(\d+)/i);
      if (dateFromMatch) {
        const paramIndex = parseInt(dateFromMatch[1]) - 1;
        const dateFrom = params[paramIndex];
        query = query.gte('visit_date', dateFrom);
      }

      const dateToMatch = text.match(/AND\s+cp\.visit_date\s*<=\s*\$(\d+)/i);
      if (dateToMatch) {
        const paramIndex = parseInt(dateToMatch[1]) - 1;
        const dateTo = params[paramIndex];
        query = query.lte('visit_date', dateTo);
      }
    }

    // Apply ordering and pagination
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data: proformaData, error: proformaError } = await query;

    if (proformaError) throw proformaError;

    if (proformaData.length === 0) {
      return {
        rows: [],
        rowCount: 0,
        command: 'SELECT'
      };
    }

    // Get unique patient IDs and user IDs
    const patientIds = [...new Set(proformaData.map(p => p.patient_id).filter(id => id))];
    const userIds = [...new Set(proformaData.map(p => p.filled_by).filter(id => id))];

    // Fetch patient data
    const { data: patients, error: patientsError } = await supabaseAdmin
      .from('patients')
      .select('id, name, cr_no, psy_no')
      .in('id', patientIds);

    if (patientsError) throw patientsError;

    // Fetch user data
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, name, role')
      .in('id', userIds);

    if (usersError) throw usersError;

    // Create lookup maps
    const patientsMap = patients.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
    const usersMap = users.reduce((acc, u) => ({ ...acc, [u.id]: u }), {});

    // Transform data to include joined information
    const transformedData = proformaData.map(item => {
      const patient = patientsMap[item.patient_id];
      const user = usersMap[item.filled_by];

      return {
        ...item,
        patient_name: patient?.name || null,
        cr_no: patient?.cr_no || null,
        psy_no: patient?.psy_no || null,
        doctor_name: user?.name || null,
        doctor_role: user?.role || null
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

  // For patients joins with doctor assignments
  if (mainTable === 'patients') {
    // Extract WHERE conditions
    const whereMatch = text.match(/WHERE\s+(.+?)\s+(?:GROUP BY|ORDER BY|LIMIT|$)/is);
    let query = supabaseAdmin.from('patients').select('*');

    // Handle WHERE p.id = $1 condition (for findById queries)
    if (whereMatch && params.length > 0) {
      const patientIdMatch = text.match(/WHERE\s+p\.id\s*=\s*\$(\d+)/i);
      if (patientIdMatch) {
        const paramIndex = parseInt(patientIdMatch[1]) - 1;
        const patientId = params[paramIndex];
        query = query.eq('id', patientId);
      }
      // Handle ILIKE search conditions (only if query contains ILIKE and param is a string)
      else if (text.includes('ILIKE') && typeof params[0] === 'string') {
        const searchPattern = params[0].replace(/%/g, '');
        query = query.or(`name.ilike.%${searchPattern}%,cr_no.ilike.%${searchPattern}%,psy_no.ilike.%${searchPattern}%,adl_no.ilike.%${searchPattern}%`);
      }
    }

    // Only apply pagination if it's not a single ID query (findById)
    const isFindByIdQuery = text.match(/WHERE\s+p\.id\s*=\s*\$(\d+)/i);
    if (!isFindByIdQuery) {
      query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });
    } else {
      // For findById, just order by created_at
      query = query.order('created_at', { ascending: false });
    }

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
    console.log('[executeUpdateQuery] Processing UPDATE query:', {
      textPreview: text.substring(0, 200) + '...',
      paramsCount: params.length,
      paramsPreview: params.slice(0, 5)
    });
    
    // Extract table name from UPDATE statement
    const tableMatch = text.match(/UPDATE\s+(\w+)/i);
    if (!tableMatch) {
      console.error('[executeUpdateQuery] Could not parse table name from:', text.substring(0, 100));
      throw new Error('Could not parse table name from UPDATE statement');
    }
    
    const tableName = tableMatch[1];
    console.log('[executeUpdateQuery] Table name:', tableName);
    
    // Extract SET clause - use non-greedy match to stop at WHERE
    const setMatch = text.match(/SET\s+(.+?)(?:\s+WHERE|\s+RETURNING|\s*$)/is);
    if (!setMatch) {
      console.error('[executeUpdateQuery] Could not parse SET clause from:', text.substring(0, 500));
      throw new Error('Could not parse SET clause from UPDATE statement');
    }
    
    const setClause = setMatch[1].trim();
    console.log('[executeUpdateQuery] SET clause extracted, length:', setClause.length);
    
    // Parse SET clause to extract column=value pairs
    // Handle commas properly by splitting on comma that's not inside parentheses or quotes
    const setPairs = [];
    let currentPair = '';
    let parenDepth = 0;
    let inQuotes = false;
    let quoteChar = null;
    
    for (let i = 0; i < setClause.length; i++) {
      const char = setClause[i];
      
      // Handle quotes
      if ((char === '"' || char === "'") && (i === 0 || setClause[i-1] !== '\\')) {
        if (!inQuotes) {
          inQuotes = true;
          quoteChar = char;
        } else if (char === quoteChar) {
          inQuotes = false;
          quoteChar = null;
        }
      }
      
      // Only split on comma if not in quotes or parentheses
      if (char === '(' && !inQuotes) parenDepth++;
      else if (char === ')' && !inQuotes) parenDepth--;
      else if (char === ',' && parenDepth === 0 && !inQuotes) {
        if (currentPair.trim()) {
          setPairs.push(currentPair.trim());
        }
        currentPair = '';
        continue;
      }
      
      currentPair += char;
    }
    if (currentPair.trim()) {
      setPairs.push(currentPair.trim());
    }
    
    console.log('[executeUpdateQuery] Parsed SET pairs count:', setPairs.length);
    
    const updateData = {};
    let paramIndex = 0;
    
    setPairs.forEach((pair, index) => {
      // Handle cases like "column = $5" or "column = $5::jsonb" or "column = CURRENT_TIMESTAMP"
      // Match column names with underscores (using [\w_]+) and allow optional schema prefix
      const match = pair.match(/^([\w_]+)\s*=\s*(.+)$/);
      if (!match) {
        console.warn(`[executeUpdateQuery] Could not parse SET pair ${index}: ${pair.substring(0, 100)}`);
        return;
      }
      
      const column = match[1];
      const valueExpr = match[2].trim();
      
      // Safety check: if valueExpr is just a number without $, skip it with warning
      if (/^\d+$/.test(valueExpr) && !valueExpr.startsWith('$')) {
        console.error(`[executeUpdateQuery] CRITICAL: Found bare number "${valueExpr}" without $ prefix for column "${column}". This will cause Supabase to interpret it as a table name!`);
        console.error(`[executeUpdateQuery] Full pair: ${pair}`);
        throw new Error(`Invalid UPDATE query: Parameter placeholder missing $ prefix. Column "${column}" has value "${valueExpr}" which should be "${valueExpr.startsWith('$') ? valueExpr : '$' + valueExpr}"`);
      }
      
      // Check for parameter placeholder like $1, $2, etc. (with optional ::jsonb or ::text)
      // Must start with $ followed by digits, optionally followed by ::type
      const paramMatch = valueExpr.match(/^\$(\d+)(?:::\w+)?$/);
      if (paramMatch) {
        const paramNum = parseInt(paramMatch[1]) - 1;
        if (params[paramNum] !== undefined) {
          // Convert JSONB strings back to objects if needed for Supabase
          let paramValue = params[paramNum];
          if (valueExpr.includes('::jsonb') && typeof paramValue === 'string') {
            try {
              paramValue = JSON.parse(paramValue);
            } catch (e) {
              // Keep as string if JSON parsing fails
            }
          }
          updateData[column] = paramValue;
          paramIndex = Math.max(paramIndex, paramNum + 1);
        } else {
          console.warn(`[executeUpdateQuery] Parameter $${paramMatch[1]} not found in params array (length: ${params.length})`);
        }
      } else if (valueExpr === 'CURRENT_TIMESTAMP') {
        // Handle CURRENT_TIMESTAMP - use JavaScript Date
        updateData[column] = new Date().toISOString();
      } else if (!valueExpr.includes('$')) {
        // Handle other direct values (like strings or numbers without parameters)
        // Try to parse as number if possible
        if (/^\d+(\.\d+)?$/.test(valueExpr)) {
          updateData[column] = parseFloat(valueExpr);
        } else if (valueExpr.toLowerCase() === 'true' || valueExpr.toLowerCase() === 'false') {
          updateData[column] = valueExpr.toLowerCase() === 'true';
        } else {
          // Remove quotes if present
          updateData[column] = valueExpr.replace(/^['"]|['"]$/g, '');
        }
      } else {
        // If valueExpr contains $ but doesn't match parameter pattern, log warning
        console.warn(`[executeUpdateQuery] Unmatched value expression: ${valueExpr} for column: ${column}`);
      }
    });
    
    // Extract WHERE clause if present
    let whereConditions = {};
    const whereMatch = text.match(/WHERE\s+(.+?)(?:\s+RETURNING|\s*$)/is);
    if (whereMatch) {
      const whereClause = whereMatch[1];
      
      // Handle simple WHERE conditions like "id = $2" or "id = $5"
      const wherePairMatch = whereClause.match(/(\w+)\s*=\s*\$(\d+)/i);
      if (wherePairMatch) {
        const column = wherePairMatch[1];
        const paramNum = parseInt(wherePairMatch[2]) - 1;
        if (params[paramNum] !== undefined) {
          whereConditions[column] = params[paramNum];
        }
      }
    }
    
    // Filter out undefined values from updateData (Supabase doesn't like undefined)
    const filteredUpdateData = {};
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        filteredUpdateData[key] = updateData[key];
      }
    });
    
    console.log('[executeUpdateQuery] Prepared update:', {
      tableName,
      fieldsCount: Object.keys(filteredUpdateData).length,
      fieldNames: Object.keys(filteredUpdateData).slice(0, 10),
      whereConditions,
      hasReturning: text.includes('RETURNING')
    });
    
    // Execute the update using Supabase
    let query = supabaseAdmin.from(tableName).update(filteredUpdateData);
    
    // Apply WHERE conditions
    Object.keys(whereConditions).forEach(column => {
      query = query.eq(column, whereConditions[column]);
    });
    
    // Check if RETURNING clause is present
    const { data: result, error } = text.includes('RETURNING') 
      ? await query.select()
      : await query;
    
    if (error) {
      console.error('[executeUpdateQuery] Supabase UPDATE error:', error);
      console.error('[executeUpdateQuery] Query details:', { 
        tableName, 
        updateDataKeys: Object.keys(filteredUpdateData), 
        updateDataSample: Object.fromEntries(Object.entries(filteredUpdateData).slice(0, 5)),
        whereConditions, 
        paramsLength: params.length,
        originalQueryPreview: text.substring(0, 300)
      });
      
      // If error mentions table name like "public.5", provide better error message
      if (error.message && error.message.includes('table') && error.message.includes('public')) {
        const tableMatchInError = error.message.match(/table\s+['"]?([^'"]+)['"]?/i);
        if (tableMatchInError && /^\d+$/.test(tableMatchInError[1])) {
          console.error('[executeUpdateQuery] CRITICAL: Parameter number interpreted as table name!');
          console.error('[executeUpdateQuery] This suggests a parameter placeholder is missing $ prefix in the SQL query');
          console.error('[executeUpdateQuery] Original query text:', text);
          console.error('[executeUpdateQuery] Parsed updateData:', filteredUpdateData);
          console.error('[executeUpdateQuery] Params:', params);
          throw new Error(`Invalid parameter reference in UPDATE query. A parameter number (${tableMatchInError[1]}) was interpreted as a table name. This usually means a parameter placeholder is missing the $ prefix. Original error: ${error.message}`);
        }
      }
      
      throw error;
    }
    
    const duration = Date.now() - startTime;
    console.log('Update query executed successfully', { duration, rows: result ? result.length : 0 });
    
    return {
      rows: result || [],
      rowCount: result ? result.length : 0,
      command: 'UPDATE'
    };
  } catch (error) {
    console.error('Update query error:', error);
    console.error('Query text:', text);
    console.error('Params:', params);
    throw error;
  }
}

// Execute raw SQL queries (for complex queries that Supabase doesn't support, like LATERAL joins)
async function executeRawSQLQuery(text, params, startTime) {
  try {
    console.log('Executing raw SQL query (LATERAL join detected):', { text: text.substring(0, 200) + '...', params });
    
    // Extract main table name
    const tableMatch = text.match(/FROM\s+(\w+)\s+\w+/i);
    const mainTable = tableMatch ? tableMatch[1] : null;
    
    // For the findById query with LATERAL, we can:
    // 1. Get the patient by ID
    // 2. Get the latest visit for that patient
    // 3. Get the assigned doctor info
    // 4. Combine the results
    
    // Check if this is a findById query
    const findByIdMatch = text.match(/WHERE\s+p\.id\s*=\s*\$(\d+)/i);
    if (findByIdMatch && mainTable === 'patients') {
      const paramIndex = parseInt(findByIdMatch[1]) - 1;
      const patientId = params[paramIndex];
      
      // Get patient
      const { data: patientData, error: patientError } = await supabaseAdmin
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();
      
      if (patientError) throw patientError;
      if (!patientData) {
        return { rows: [], rowCount: 0, command: 'SELECT' };
      }
      
      // Get latest visit
      const { data: visits, error: visitsError } = await supabaseAdmin
        .from('patient_visits')
        .select('*')
        .eq('patient_id', patientId)
        .order('visit_date', { ascending: false })
        .limit(1);
      
      if (visitsError) console.error('Error fetching visits:', visitsError);
      const latestVisit = visits && visits.length > 0 ? visits[0] : null;
      
      // Get assigned doctor info if visit exists
      let assignedDoctor = null;
      if (latestVisit && latestVisit.assigned_doctor) {
        const { data: doctorData, error: doctorError } = await supabaseAdmin
          .from('users')
          .select('id, name, role')
          .eq('id', latestVisit.assigned_doctor)
          .single();
        
        if (!doctorError && doctorData) {
          assignedDoctor = doctorData;
        }
      }
      
      // Get ADL file info
      const { data: adlFiles, error: adlError } = await supabaseAdmin
        .from('adl_files')
        .select('id')
        .eq('patient_id', patientId)
        .limit(1);
      
      const hasAdlFile = adlFiles && adlFiles.length > 0;
      
      // Combine results to match expected format
      const combinedRow = {
        ...patientData,
        has_adl_file: hasAdlFile,
        case_complexity: hasAdlFile ? 'complex' : (patientData.case_complexity || 'simple'),
        assigned_doctor_id: latestVisit?.assigned_doctor || null,
        assigned_doctor_name: assignedDoctor?.name || null,
        assigned_doctor_role: assignedDoctor?.role || null,
        last_assigned_date: latestVisit?.visit_date || null
      };
      
      const duration = Date.now() - startTime;
      console.log('Raw SQL query (findById) executed successfully', { duration });
      
      return {
        rows: [combinedRow],
        rowCount: 1,
        command: 'SELECT'
      };
    }
    
    // For other LATERAL queries, throw an error as they're not supported
    throw new Error('Complex LATERAL join queries are not fully supported. Please use simpler queries.');
    
  } catch (error) {
    console.error('Raw SQL query error:', error);
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