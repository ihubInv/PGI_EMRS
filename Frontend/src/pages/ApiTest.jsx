import { useState } from 'react';
import { useGetAllOutpatientRecordsQuery } from '../features/outpatient/outpatientApiSlice';
import { useGetAllPatientsQuery } from '../features/patients/patientsApiSlice';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';

const ApiTest = () => {
  const [testOutpatient, setTestOutpatient] = useState(false);
  const [testPatients, setTestPatients] = useState(false);

  const { data: outpatientData, isLoading: outpatientLoading, error: outpatientError } = 
    useGetAllOutpatientRecordsQuery({ page: 1, limit: 10 }, { skip: !testOutpatient });

  const { data: patientsData, isLoading: patientsLoading, error: patientsError } = 
    useGetAllPatientsQuery({ page: 1, limit: 10 }, { skip: !testPatients });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">API Connection Test</h1>
        <p className="text-gray-600 mt-1">Test backend API connections</p>
      </div>

      {/* API Base URL */}
      <Card title="Configuration">
        <div className="space-y-2">
          <p><strong>API Base URL:</strong> {import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}</p>
          <p><strong>Environment:</strong> {import.meta.env.MODE}</p>
        </div>
      </Card>

      {/* Patients API Test */}
      <Card title="Patients API Test">
        <div className="space-y-4">
          <Button onClick={() => setTestPatients(true)}>
            Test Patients API
          </Button>

          {testPatients && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              {patientsLoading && <p>Loading...</p>}
              
              {patientsError && (
                <div className="text-red-600">
                  <p><strong>Error:</strong></p>
                  <pre className="text-xs mt-2 overflow-auto">
                    {JSON.stringify(patientsError, null, 2)}
                  </pre>
                </div>
              )}

              {patientsData && (
                <div className="text-green-600">
                  <p><strong>✅ Success!</strong></p>
                  <p className="mt-2">Total Patients: {patientsData?.data?.pagination?.total || 0}</p>
                  <p>Records Returned: {patientsData?.data?.patients?.length || 0}</p>
                  <pre className="text-xs mt-2 overflow-auto max-h-64">
                    {JSON.stringify(patientsData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Outpatient API Test */}
      <Card title="Outpatient Records API Test">
        <div className="space-y-4">
          <Button onClick={() => setTestOutpatient(true)}>
            Test Outpatient API
          </Button>

          {testOutpatient && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              {outpatientLoading && <p>Loading...</p>}
              
              {outpatientError && (
                <div className="text-red-600">
                  <p><strong>Error:</strong></p>
                  <p className="mt-2">Status: {outpatientError?.status}</p>
                  <p>Message: {outpatientError?.data?.message || outpatientError?.error}</p>
                  <pre className="text-xs mt-2 overflow-auto">
                    {JSON.stringify(outpatientError, null, 2)}
                  </pre>
                </div>
              )}

              {outpatientData && (
                <div className="text-green-600">
                  <p><strong>✅ Success!</strong></p>
                  <p className="mt-2">Total Records: {outpatientData?.data?.pagination?.total || 0}</p>
                  <p>Records Returned: {outpatientData?.data?.records?.length || 0}</p>
                  <pre className="text-xs mt-2 overflow-auto max-h-64">
                    {JSON.stringify(outpatientData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Direct API Call Test */}
      <Card title="Manual API Call Test">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Open browser console (F12) and run this command:
          </p>
          <pre className="p-4 bg-gray-900 text-green-400 rounded text-xs overflow-auto">
{`fetch('http://localhost:5000/api/outpatient-record?page=1&limit=10', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(res => res.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));`}
          </pre>
        </div>
      </Card>
    </div>
  );
};

export default ApiTest;

