import { FiUser, FiUsers, FiBriefcase, FiDollarSign, FiMapPin, FiPhone } from 'react-icons/fi';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Textarea from '../../components/Textarea';
import { SEX_OPTIONS, MARITAL_STATUS, FAMILY_TYPE, LOCALITY, RELIGION } from '../../utils/constants';

const PatientDetailsEdit = ({ formData, handleChange, usersData }) => {
  return (
    <>
      {/* Patient Information */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <FiUser className="h-5 w-5 text-primary-600" />
            <span>Patient Information</span>
          </div>
        }
      >
        <div className="space-y-6">
          <Input
            label="Patient Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Sex"
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              options={SEX_OPTIONS}
              required
            />
            <Input
              label="Age"
              type="number"
              name="actual_age"
              value={formData.actual_age}
              onChange={handleChange}
              required
              min="0"
              max="150"
            />
          </div>
          <Input
            label="Assigned Room"
            name="assigned_room"
            value={formData.assigned_room}
            onChange={handleChange}
          />
          <Select
            label="Assign Doctor (JR/SR)"
            name="assigned_doctor_id"
            value={formData.assigned_doctor_id}
            onChange={handleChange}
            options={(usersData?.data?.users || [])
              .filter(u => u.role === 'JR' || u.role === 'SR')
              .map(u => ({ value: String(u.id), label: `${u.name} (${u.role})` }))}
            placeholder="Select doctor (optional)"
          />
        </div>
      </Card>

      {/* Personal Information */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <FiUser className="h-5 w-5 text-primary-600" />
            <span>Personal Information</span>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Age Group"
            name="age_group"
            value={formData.age_group}
            onChange={handleChange}
          />
          <Select
            label="Marital Status"
            name="marital_status"
            value={formData.marital_status}
            onChange={handleChange}
            options={MARITAL_STATUS}
          />
          <Input
            label="Year of Marriage"
            type="number"
            name="year_of_marriage"
            value={formData.year_of_marriage}
            onChange={handleChange}
          />
          <Input
            label="Number of Children"
            type="number"
            name="no_of_children"
            value={formData.no_of_children}
            onChange={handleChange}
            min="0"
          />
        </div>
      </Card>

      {/* Occupation & Education */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <FiBriefcase className="h-5 w-5 text-primary-600" />
            <span>Occupation & Education</span>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Occupation"
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
          />
          <Input
            label="Actual Occupation"
            name="actual_occupation"
            value={formData.actual_occupation}
            onChange={handleChange}
          />
          <Input
            label="Education Level"
            name="education_level"
            value={formData.education_level}
            onChange={handleChange}
          />
          <Input
            label="Years of Education"
            type="number"
            name="completed_years_of_education"
            value={formData.completed_years_of_education}
            onChange={handleChange}
            min="0"
          />
        </div>
      </Card>

      {/* Financial Information */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <FiDollarSign className="h-5 w-5 text-primary-600" />
            <span>Financial Information</span>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Patient Income (₹)"
            type="number"
            name="patient_income"
            value={formData.patient_income}
            onChange={handleChange}
            min="0"
          />
          <Input
            label="Family Income (₹)"
            type="number"
            name="family_income"
            value={formData.family_income}
            onChange={handleChange}
            min="0"
          />
        </div>
      </Card>

      {/* Family Information */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <FiUsers className="h-5 w-5 text-primary-600" />
            <span>Family Information</span>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Religion"
              name="religion"
              value={formData.religion}
              onChange={handleChange}
              options={RELIGION}
            />
            <Select
              label="Family Type"
              name="family_type"
              value={formData.family_type}
              onChange={handleChange}
              options={FAMILY_TYPE}
            />
            <Select
              label="Locality"
              name="locality"
              value={formData.locality}
              onChange={handleChange}
              options={LOCALITY}
            />
          </div>
          <h4 className="font-medium text-gray-900 mt-4">Head of Family</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Name"
              name="head_name"
              value={formData.head_name}
              onChange={handleChange}
            />
            <Input
              label="Age"
              type="number"
              name="head_age"
              value={formData.head_age}
              onChange={handleChange}
              min="0"
            />
            <Input
              label="Relationship"
              name="head_relationship"
              value={formData.head_relationship}
              onChange={handleChange}
            />
            <Input
              label="Education"
              name="head_education"
              value={formData.head_education}
              onChange={handleChange}
            />
            <Input
              label="Occupation"
              name="head_occupation"
              value={formData.head_occupation}
              onChange={handleChange}
            />
            <Input
              label="Income (₹)"
              type="number"
              name="head_income"
              value={formData.head_income}
              onChange={handleChange}
              min="0"
            />
          </div>
        </div>
      </Card>

      {/* Referral & Mobility */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <FiMapPin className="h-5 w-5 text-primary-600" />
            <span>Referral & Mobility</span>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Distance from Hospital"
            name="distance_from_hospital"
            value={formData.distance_from_hospital}
            onChange={handleChange}
          />
          <Input
            label="Mobility"
            name="mobility"
            value={formData.mobility}
            onChange={handleChange}
          />
          <Input
            label="Referred By"
            name="referred_by"
            value={formData.referred_by}
            onChange={handleChange}
          />
          <Input
            label="Exact Source"
            name="exact_source"
            value={formData.exact_source}
            onChange={handleChange}
          />
        </div>
      </Card>

      {/* Contact Information */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <FiPhone className="h-5 w-5 text-primary-600" />
            <span>Contact Information</span>
          </div>
        }
      >
        <div className="space-y-6">
          <Textarea
            label="Present Address"
            name="present_address"
            value={formData.present_address}
            onChange={handleChange}
            rows={2}
          />
          <Textarea
            label="Permanent Address"
            name="permanent_address"
            value={formData.permanent_address}
            onChange={handleChange}
            rows={2}
          />
          <Textarea
            label="Local Address"
            name="local_address"
            value={formData.local_address}
            onChange={handleChange}
            rows={2}
          />
          <Input
            label="School/College/Office"
            name="school_college_office"
            value={formData.school_college_office}
            onChange={handleChange}
          />
          <Input
            label="Contact Number"
            name="contact_number"
            value={formData.contact_number}
            onChange={handleChange}
          />
        </div>
      </Card>
    </>
  );
};

export default PatientDetailsEdit;
