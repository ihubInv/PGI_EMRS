import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiUser, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { useCreateOutpatientRecordMutation, useGetOutpatientRecordByPatientIdQuery, useGetAllOutpatientRecordsQuery } from '../../features/outpatient/outpatientApiSlice';
import { useSearchPatientsQuery, useAssignPatientMutation, useUpdatePatientMutation } from '../../features/patients/patientsApiSlice';
import { useGetDoctorsQuery } from '../../features/users/usersApiSlice';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';

const SelectExistingOutpatient = () => {
  const navigate = useNavigate();

  const [createRecord, { isLoading }] = useCreateOutpatientRecordMutation();
  const [assignPatient, { isLoading: isAssigning }] = useAssignPatientMutation();
  const [updatePatient, { isLoading: isUpdating }] = useUpdatePatientMutation();
  const { data: usersData } = useGetDoctorsQuery({ page: 1, limit: 100 });

  const [crNumber, setCrNumber] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  // Search for patient by CR number
  const { data: searchData, isLoading: searching, refetch: refetchPatient } = useSearchPatientsQuery(
    { search: crNumber, limit: 5 },
    { skip: !crNumber || crNumber.length < 2 }
  );

  // Get existing demographic data if available
  const { data: demographicData, isLoading: loadingDemographics } = useGetOutpatientRecordByPatientIdQuery(
    selectedPatientId,
    { skip: !selectedPatientId }
  );

  // Get all visit records for this patient to count visits
  const { data: allVisitsData } = useGetAllOutpatientRecordsQuery(
    { page: 1, limit: 1000, patient_id: selectedPatientId },
    { skip: !selectedPatientId }
  );

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [isEditingDoctor, setIsEditingDoctor] = useState(false);
  const [newRoom, setNewRoom] = useState('');
  const [newDoctorId, setNewDoctorId] = useState('');

  // Auto-select patient when CR number matches
  useEffect(() => {
    if (searchData?.data?.patients && crNumber && crNumber.length >= 2) {
      const exactMatch = searchData.data.patients.find(
        (p) => p.cr_no?.toLowerCase() === crNumber.toLowerCase()
      );

      if (exactMatch) {
        setSelectedPatient(exactMatch);
        setSelectedPatientId(exactMatch.id);
        setNewRoom(exactMatch.assigned_room || '');
        setNewDoctorId(exactMatch.assigned_doctor_id ? String(exactMatch.assigned_doctor_id) : '');
      } else if (searchData.data.patients.length === 1) {
        // Auto-select if only one result
        setSelectedPatient(searchData.data.patients[0]);
        setSelectedPatientId(searchData.data.patients[0].id);
        setNewRoom(searchData.data.patients[0].assigned_room || '');
        setNewDoctorId(searchData.data.patients[0].assigned_doctor_id ? String(searchData.data.patients[0].assigned_doctor_id) : '');
      } else {
        setSelectedPatient(null);
        setSelectedPatientId(null);
      }
    } else {
      setSelectedPatient(null);
      setSelectedPatientId(null);
    }
  }, [searchData, crNumber]);

  const handleUpdateRoom = async () => {
    try {
      await updatePatient({
        id: selectedPatient.id,
        assigned_room: newRoom,
      }).unwrap();
      toast.success('Room updated successfully!');
      setIsEditingRoom(false);
      // Update local state
      setSelectedPatient(prev => ({ ...prev, assigned_room: newRoom }));
      // Refetch to update
      await refetchPatient();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update room');
    }
  };

  const handleUpdateDoctor = async () => {
    try {
      await assignPatient({
        patient_id: selectedPatient.id,
        assigned_doctor: Number(newDoctorId),
        room_no: selectedPatient.assigned_room || '',
      }).unwrap();
      toast.success('Doctor assigned successfully!');
      setIsEditingDoctor(false);
      // Refetch to update doctor info
      await refetchPatient();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to assign doctor');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPatient) {
      toast.error('Please enter a valid CR number');
      return;
    }

    try {
      // Create outpatient visit record
      await createRecord({ patient_id: parseInt(selectedPatient.id) }).unwrap();
      toast.success('Visit record created successfully!');
      navigate('/patients');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create record');
    }
  };

  const existingDemo = demographicData?.data?.record;
  // Calculate visit statistics - show current count + 1 for the visit being created
  const currentVisitCount = allVisitsData?.data?.records?.length || 0;
  const nextVisitNumber = currentVisitCount + 1; // This will be the visit number after creation

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Existing Patient Visit</h1>
        <p className="text-gray-600 mt-1">Enter CR number to view patient demographics and create visit record</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Search by CR Number */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <FiUser className="h-5 w-5 text-primary-600" />
              <span>Search Patient</span>
            </div>
          }
          className="mb-6"
        >
          <div className="space-y-6">
            <Input
              label="CR Number"
              placeholder="Enter CR number (e.g., CR2024000001)"
              value={crNumber}
              onChange={(e) => setCrNumber(e.target.value)}
              required
            />

            {searching && <LoadingSpinner className="h-16" />}

            {/* Patient Found */}
            {selectedPatient && !searching && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm font-bold">✓</span>
                  </div>
                  <h4 className="text-lg font-semibold text-green-800">Patient Found</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Name:</span>
                    <span className="ml-2 text-gray-900">{selectedPatient.name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">CR Number:</span>
                    <span className="ml-2 text-gray-900 font-mono">{selectedPatient.cr_no}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Sex:</span>
                    <span className="ml-2 text-gray-900">{selectedPatient.sex}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Age:</span>
                    <span className="ml-2 text-gray-900">{selectedPatient.actual_age}</span>
                  </div>
                  {selectedPatient.psy_no && (
                    <div>
                      <span className="font-medium text-gray-700">PSY Number:</span>
                      <span className="ml-2 text-gray-900 font-mono">{selectedPatient.psy_no}</span>
                    </div>
                  )}
                </div>

                {/* Editable Room Assignment */}
                <div className="mt-4 pt-4 border-t border-green-200 space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-gray-700 min-w-[140px]">Assigned Room:</span>
                    {isEditingRoom ? (
                      <div className="flex-1 flex items-center gap-2">
                        <Input
                          value={newRoom}
                          onChange={(e) => setNewRoom(e.target.value)}
                          placeholder="e.g., Ward A-101"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleUpdateRoom}
                          loading={isUpdating}
                          className="px-2"
                        >
                          <FiCheck className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsEditingRoom(false);
                            setNewRoom(selectedPatient.assigned_room || '');
                          }}
                          className="px-2"
                        >
                          <FiX className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="ml-1 text-gray-900">{selectedPatient.assigned_room || 'Not assigned'}</span>
                        <button
                          type="button"
                          onClick={() => setIsEditingRoom(true)}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Editable Doctor Assignment */}
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-gray-700 min-w-[140px]">Assigned Doctor:</span>
                    {isEditingDoctor ? (
                      <div className="flex-1 flex items-center gap-2">
                        <Select
                          value={newDoctorId}
                          onChange={(e) => setNewDoctorId(e.target.value)}
                          options={(usersData?.data?.users || [])
                            .filter((u) => u.role === 'JR' || u.role === 'SR')
                            .map((u) => ({ value: String(u.id), label: `${u.name} (${u.role})` }))}
                          placeholder="Select doctor"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleUpdateDoctor}
                          loading={isAssigning}
                          className="px-2"
                        >
                          <FiCheck className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsEditingDoctor(false);
                            setNewDoctorId(selectedPatient.assigned_doctor_id ? String(selectedPatient.assigned_doctor_id) : '');
                          }}
                          className="px-2"
                        >
                          <FiX className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {selectedPatient.assigned_doctor_name ? (
                          <>
                            <span className="ml-1 text-gray-900">{selectedPatient.assigned_doctor_name}</span>
                            {selectedPatient.assigned_doctor_role && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                {selectedPatient.assigned_doctor_role}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="ml-1 text-gray-500 italic">Not assigned</span>
                        )}
                        <button
                          type="button"
                          onClick={() => setIsEditingDoctor(true)}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ADL File Status */}
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-gray-700 min-w-[140px]">ADL File:</span>
                    {selectedPatient.has_adl_file || selectedPatient.adl_no ? (
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded flex items-center gap-1">
                          <span>✓</span>
                          <span>Exists</span>
                        </span>
                        {selectedPatient.adl_no && (
                          <span className="ml-1 text-gray-900 font-mono text-xs">{selectedPatient.adl_no}</span>
                        )}
                      </div>
                    ) : (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                        Not Created
                      </span>
                    )}
                  </div>

                  {/* Visit Statistics */}
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-700">Total Visits:</span>
                        <span className="ml-2 text-blue-700 font-bold text-lg">{nextVisitNumber}</span>
                        {currentVisitCount === 0 && (
                          <span className="ml-1 text-xs text-gray-600">(First Visit)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Patient Not Found */}
            {crNumber && crNumber.length >= 2 && !searching && !selectedPatient && searchData?.data?.patients?.length === 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ No patient found with CR number "{crNumber}". Please check the number and try again.
                </p>
              </div>
            )}

            {/* Multiple matches */}
            {crNumber && !searching && searchData?.data?.patients?.length > 1 && !selectedPatient && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 mb-2">
                  Multiple patients found. Please enter the exact CR number:
                </p>
                <ul className="space-y-1 text-sm">
                  {searchData.data.patients.map((p) => (
                    <li key={p.id} className="flex items-center gap-2">
                      <span className="font-mono font-medium">{p.cr_no}</span>
                      <span>-</span>
                      <span>{p.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>

        {/* Existing Demographic Details */}
        {selectedPatient && (
          <>
            {loadingDemographics && <LoadingSpinner className="h-24" />}

            {existingDemo && (
              <>
                {/* Personal Information */}
                {(existingDemo.age_group || existingDemo.marital_status || existingDemo.year_of_marriage || existingDemo.no_of_children) && (
                  <Card title="Personal Information" className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {existingDemo.age_group && (
                        <div>
                          <span className="font-medium text-gray-700">Age Group:</span>
                          <span className="ml-2 text-gray-900">{existingDemo.age_group}</span>
                        </div>
                      )}
                      {existingDemo.marital_status && (
                        <div>
                          <span className="font-medium text-gray-700">Marital Status:</span>
                          <span className="ml-2 text-gray-900">{existingDemo.marital_status}</span>
                        </div>
                      )}
                      {existingDemo.year_of_marriage && (
                        <div>
                          <span className="font-medium text-gray-700">Year of Marriage:</span>
                          <span className="ml-2 text-gray-900">{existingDemo.year_of_marriage}</span>
                        </div>
                      )}
                      {existingDemo.no_of_children !== null && existingDemo.no_of_children !== undefined && (
                        <div>
                          <span className="font-medium text-gray-700">Number of Children:</span>
                          <span className="ml-2 text-gray-900">{existingDemo.no_of_children}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* Occupation & Education */}
                {(existingDemo.occupation || existingDemo.actual_occupation || existingDemo.education_level || existingDemo.completed_years_of_education) && (
                  <Card title="Occupation & Education" className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {existingDemo.occupation && (
                        <div>
                          <span className="font-medium text-gray-700">Occupation:</span>
                          <span className="ml-2 text-gray-900">{existingDemo.occupation}</span>
                        </div>
                      )}
                      {existingDemo.actual_occupation && (
                        <div>
                          <span className="font-medium text-gray-700">Actual Occupation:</span>
                          <span className="ml-2 text-gray-900">{existingDemo.actual_occupation}</span>
                        </div>
                      )}
                      {existingDemo.education_level && (
                        <div>
                          <span className="font-medium text-gray-700">Education Level:</span>
                          <span className="ml-2 text-gray-900">{existingDemo.education_level}</span>
                        </div>
                      )}
                      {existingDemo.completed_years_of_education && (
                        <div>
                          <span className="font-medium text-gray-700">Years of Education:</span>
                          <span className="ml-2 text-gray-900">{existingDemo.completed_years_of_education}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* Financial Information */}
                {(existingDemo.patient_income || existingDemo.family_income) && (
                  <Card title="Financial Information" className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {existingDemo.patient_income && (
                        <div>
                          <span className="font-medium text-gray-700">Patient Income:</span>
                          <span className="ml-2 text-gray-900">₹{existingDemo.patient_income}</span>
                        </div>
                      )}
                      {existingDemo.family_income && (
                        <div>
                          <span className="font-medium text-gray-700">Family Income:</span>
                          <span className="ml-2 text-gray-900">₹{existingDemo.family_income}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* Family Information */}
                {(existingDemo.religion || existingDemo.family_type || existingDemo.locality || existingDemo.head_name) && (
                  <Card title="Family Information" className="mb-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {existingDemo.religion && (
                          <div>
                            <span className="font-medium text-gray-700">Religion:</span>
                            <span className="ml-2 text-gray-900">{existingDemo.religion}</span>
                          </div>
                        )}
                        {existingDemo.family_type && (
                          <div>
                            <span className="font-medium text-gray-700">Family Type:</span>
                            <span className="ml-2 text-gray-900">{existingDemo.family_type}</span>
                          </div>
                        )}
                        {existingDemo.locality && (
                          <div>
                            <span className="font-medium text-gray-700">Locality:</span>
                            <span className="ml-2 text-gray-900">{existingDemo.locality}</span>
                          </div>
                        )}
                      </div>

                      {existingDemo.head_name && (
                        <>
                          <h4 className="font-medium text-gray-900 mt-4">Head of Family</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Name:</span>
                              <span className="ml-2 text-gray-900">{existingDemo.head_name}</span>
                            </div>
                            {existingDemo.head_age && (
                              <div>
                                <span className="font-medium text-gray-700">Age:</span>
                                <span className="ml-2 text-gray-900">{existingDemo.head_age}</span>
                              </div>
                            )}
                            {existingDemo.head_relationship && (
                              <div>
                                <span className="font-medium text-gray-700">Relationship:</span>
                                <span className="ml-2 text-gray-900">{existingDemo.head_relationship}</span>
                              </div>
                            )}
                            {existingDemo.head_education && (
                              <div>
                                <span className="font-medium text-gray-700">Education:</span>
                                <span className="ml-2 text-gray-900">{existingDemo.head_education}</span>
                              </div>
                            )}
                            {existingDemo.head_occupation && (
                              <div>
                                <span className="font-medium text-gray-700">Occupation:</span>
                                <span className="ml-2 text-gray-900">{existingDemo.head_occupation}</span>
                              </div>
                            )}
                            {existingDemo.head_income && (
                              <div>
                                <span className="font-medium text-gray-700">Income:</span>
                                <span className="ml-2 text-gray-900">₹{existingDemo.head_income}</span>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </Card>
                )}

                {/* Referral & Mobility */}
                {(existingDemo.distance_from_hospital || existingDemo.mobility || existingDemo.referred_by || existingDemo.exact_source) && (
                  <Card title="Referral & Mobility" className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {existingDemo.distance_from_hospital && (
                        <div>
                          <span className="font-medium text-gray-700">Distance from Hospital:</span>
                          <span className="ml-2 text-gray-900">{existingDemo.distance_from_hospital}</span>
                        </div>
                      )}
                      {existingDemo.mobility && (
                        <div>
                          <span className="font-medium text-gray-700">Mobility:</span>
                          <span className="ml-2 text-gray-900">{existingDemo.mobility}</span>
                        </div>
                      )}
                      {existingDemo.referred_by && (
                        <div>
                          <span className="font-medium text-gray-700">Referred By:</span>
                          <span className="ml-2 text-gray-900">{existingDemo.referred_by}</span>
                        </div>
                      )}
                      {existingDemo.exact_source && (
                        <div>
                          <span className="font-medium text-gray-700">Exact Source:</span>
                          <span className="ml-2 text-gray-900">{existingDemo.exact_source}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* Contact Information */}
                {(existingDemo.present_address || existingDemo.permanent_address || existingDemo.local_address || existingDemo.school_college_office || existingDemo.contact_number) && (
                  <Card title="Contact Information" className="mb-6">
                    <div className="space-y-3 text-sm">
                      {existingDemo.present_address && (
                        <div>
                          <span className="font-medium text-gray-700">Present Address:</span>
                          <p className="ml-2 text-gray-900">{existingDemo.present_address}</p>
                        </div>
                      )}
                      {existingDemo.permanent_address && (
                        <div>
                          <span className="font-medium text-gray-700">Permanent Address:</span>
                          <p className="ml-2 text-gray-900">{existingDemo.permanent_address}</p>
                        </div>
                      )}
                      {existingDemo.local_address && (
                        <div>
                          <span className="font-medium text-gray-700">Local Address:</span>
                          <p className="ml-2 text-gray-900">{existingDemo.local_address}</p>
                        </div>
                      )}
                      {existingDemo.school_college_office && (
                        <div>
                          <span className="font-medium text-gray-700">School/College/Office:</span>
                          <span className="ml-2 text-gray-900">{existingDemo.school_college_office}</span>
                        </div>
                      )}
                      {existingDemo.contact_number && (
                        <div>
                          <span className="font-medium text-gray-700">Contact Number:</span>
                          <span className="ml-2 text-gray-900">{existingDemo.contact_number}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </>
            )}

            {!loadingDemographics && !existingDemo && (
              <Card className="mb-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    ℹ️ No demographic data found for this patient. This will be their first visit record.
                  </p>
                </div>
              </Card>
            )}

            {/* Submit Button */}
            <Card>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => navigate('/patients')}>
                  Cancel
                </Button>
                <Button type="submit" loading={isLoading}>
                  Create Visit Record
                </Button>
              </div>
            </Card>
          </>
        )}
      </form>
    </div>
  );
};

export default SelectExistingOutpatient;
