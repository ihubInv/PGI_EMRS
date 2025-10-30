import { 
  FiUser, FiUsers, FiBriefcase, FiDollarSign, FiMapPin, FiPhone, FiHome, 
  FiCalendar, FiActivity, FiHeart, FiClock, FiShield, FiTrendingUp, 
  FiNavigation, FiTruck, FiEdit3, FiBookOpen, FiGlobe, FiFileText, 
  FiHash, FiLayers, FiMail, FiUserCheck, FiStar, FiInfo
} from 'react-icons/fi';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Textarea from '../../components/Textarea';
import { 
  SEX_OPTIONS, MARITAL_STATUS, FAMILY_TYPE, LOCALITY, RELIGION, 
  AGE_GROUP_OPTIONS, OCCUPATION_OPTIONS, EDUCATION_OPTIONS, 
  MOBILITY_OPTIONS, REFERRED_BY_OPTIONS, INDIAN_STATES, UNIT_DAYS_OPTIONS 
} from '../../utils/constants';

// Enhanced Radio button component with better styling
const RadioGroup = ({ label, name, value, onChange, options, className = "", inline = true, error, icon }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
        {icon && <span className="text-primary-600">{icon}</span>}
        {label}
      </label>
      <div className={`flex ${inline ? 'flex-wrap gap-4' : 'flex-col space-y-3'}`}>
        {options.map((option) => (
          <label key={option.value} className="flex items-center space-x-3 cursor-pointer group">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              className="w-4 h-4 text-primary-600 border-2 border-gray-300 focus:ring-primary-500 focus:ring-2 rounded-full transition-all duration-200 group-hover:border-primary-400"
            />
            <span className="text-sm text-gray-700 group-hover:text-primary-700 transition-colors duration-200">{option.label}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
        <FiInfo className="w-3 h-3" />
        {error}
      </p>}
    </div>
  );
};

// Enhanced Input component with icons
const IconInput = ({ icon, label, ...props }) => {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        {icon && <span className="text-primary-600">{icon}</span>}
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}
        <input
          {...props}
          className={`w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 hover:border-gray-300 ${
            icon ? 'pl-10' : ''
          } ${props.className || ''}`}
        />
      </div>
    </div>
  );
};

// Enhanced Date Input component
const DateInput = ({ icon, label, ...props }) => {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        {icon && <span className="text-primary-600">{icon}</span>}
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiCalendar className="w-5 h-5 text-gray-400" />
        </div>
        <input
          {...props}
          type="date"
          className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 hover:border-gray-300 appearance-none"
        />
      </div>
    </div>
  );
};

const PatientDetailsEdit = ({ formData, handleChange, usersData }) => {
  console.log(formData,'formData',usersData,'usersData');
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="w-full px-6 py-8 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4 mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full mb-4">
            <FiEdit3 className="w-8 h-8 text-white" />
          </div>
          <p className="text-sm text-gray-600 font-medium">Department of Psychiatry</p>
          <p className="text-xs text-gray-500">Postgraduate Institute of Medical Education & Research, Chandigarh</p>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent tracking-wide">
            EDIT PATIENT RECORD
          </h1>
        </div>

        {/* Patient Information */}
        <Card
          title={
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FiUser className="w-6 h-6 text-primary-600" />
              </div>
              <span className="text-xl font-bold text-gray-900">Patient Information</span>
            </div>
          }
          className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm"
        >
          <div className="space-y-8">
            {/* Patient Details */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
                <h4 className="text-xl font-bold text-gray-900">Patient Details</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <IconInput
                  icon={<FiUser className="w-4 h-4" />}
                  label="Patient Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="bg-gradient-to-r from-green-50 to-emerald-50"
                />
                <RadioGroup
                  label="Sex"
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  options={SEX_OPTIONS}
                  icon={<FiHeart className="w-4 h-4" />}
                  className="bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-lg"
                />
                <IconInput
                  icon={<FiClock className="w-4 h-4" />}
                  label="Age"
                  type="number"
                  name="actual_age"
                  value={formData.actual_age}
                  onChange={handleChange}
                  required
                  min="0"
                  max="150"
                  className="bg-gradient-to-r from-orange-50 to-yellow-50"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Assignment Details */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
                <h4 className="text-xl font-bold text-gray-900">Assignment Details</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <IconInput
                  icon={<FiHome className="w-4 h-4" />}
                  label="Assigned Room"
                  name="assigned_room"
                  value={formData.assigned_room}
                  onChange={handleChange}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50"
                />
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FiUser className="w-4 h-4 text-primary-600" />
                    Assign Doctor (JR/SR)
                  </label>
                  <Select
                    name="assigned_doctor_id"
                    value={formData.assigned_doctor_id}
                    onChange={handleChange}
                    options={(usersData?.data?.users || [])
                      .filter(u => u.role === 'JR' || u.role === 'SR')
                      .map(u => ({ value: String(u.id), label: `${u.name} (${u.role})` }))}
                    placeholder="Select doctor (optional)"
                    className="bg-gradient-to-r from-violet-50 to-purple-50"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Personal Information */}
        <Card
          title={
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FiUsers className="w-6 h-6 text-primary-600" />
              </div>
              <span className="text-xl font-bold text-gray-900">Personal Information</span>
            </div>
          }
          className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm"
        >
          <div className="space-y-8">
            <RadioGroup
              label="Marital Status"
              name="marital_status"
              value={formData.marital_status}
              onChange={handleChange}
              options={MARITAL_STATUS}
              icon={<FiHeart className="w-4 h-4" />}
              className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-lg"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <RadioGroup
                label="Age Group"
                name="age_group"
                value={formData.age_group}
                onChange={handleChange}
                options={AGE_GROUP_OPTIONS}
                icon={<FiClock className="w-4 h-4" />}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg"
              />
              <IconInput
                icon={<FiCalendar className="w-4 h-4" />}
                label="Year of Marriage"
                type="number"
                name="year_of_marriage"
                value={formData.year_of_marriage}
                onChange={handleChange}
                min="1900"
                max={new Date().getFullYear()}
                className="bg-gradient-to-r from-purple-50 to-pink-50"
              />
              <IconInput
                icon={<FiUsers className="w-4 h-4" />}
                label="Number of Children"
                type="number"
                name="no_of_children"
                value={formData.no_of_children}
                onChange={handleChange}
                min="0"
                className="bg-gradient-to-r from-green-50 to-emerald-50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <IconInput
                icon={<FiUsers className="w-4 h-4" />}
                label="Male Children"
                type="number"
                name="no_of_children_male"
                value={formData.no_of_children_male}
                onChange={handleChange}
                min="0"
                className="bg-gradient-to-r from-blue-50 to-indigo-50"
              />
              <IconInput
                icon={<FiUsers className="w-4 h-4" />}
                label="Female Children"
                type="number"
                name="no_of_children_female"
                value={formData.no_of_children_female}
                onChange={handleChange}
                min="0"
                className="bg-gradient-to-r from-pink-50 to-rose-50"
              />
            </div>
          </div>
        </Card>
        {/* Occupation & Education */}
        <Card
          title={
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FiBriefcase className="w-6 h-6 text-primary-600" />
              </div>
              <span className="text-xl font-bold text-gray-900">Occupation & Education</span>
            </div>
          }
          className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm"
        >
          <div className="space-y-8">
            <RadioGroup
              label="Occupation"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              options={OCCUPATION_OPTIONS}
              icon={<FiBriefcase className="w-4 h-4" />}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg"
            />

            <IconInput
              icon={<FiEdit3 className="w-4 h-4" />}
              label="Actual Occupation"
              name="actual_occupation"
              value={formData.actual_occupation}
              onChange={handleChange}
              placeholder="Enter detailed occupation"
              className="bg-gradient-to-r from-green-50 to-emerald-50"
            />

            <div className="space-y-6">
              <label className="flex items-center gap-2 text-lg font-bold text-gray-700 mb-4">
                <FiBookOpen className="w-5 h-5 text-primary-600" />
                Education
              </label>
              <div className="space-y-4">
                {/* Education options except "Not Known" */}
                <div className="flex flex-wrap gap-4">
                  {EDUCATION_OPTIONS.slice(0, -1).map((option) => (
                    <label key={option.value} className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="education_level"
                        value={option.value}
                        checked={formData.education_level === option.value}
                        onChange={handleChange}
                        className="w-4 h-4 text-primary-600 border-2 border-gray-300 focus:ring-primary-500 focus:ring-2 rounded-full transition-all duration-200 group-hover:border-primary-400"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-primary-700 transition-colors duration-200">{option.label}</span>
                    </label>
                  ))}
                </div>
                
                {/* "Not Known" option with "Completed years of education" field */}
                <div className="flex items-center gap-4 flex-wrap bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-lg">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="education_level"
                      value="not_known"
                      checked={formData.education_level === 'not_known'}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary-600 border-2 border-gray-300 focus:ring-primary-500 focus:ring-2 rounded-full transition-all duration-200"
                    />
                    <span className="text-sm text-gray-700 font-medium">Not Known</span>
                  </label>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 font-medium">Completed years of education:</span>
                    <input
                      type="number"
                      name="completed_years_of_education"
                      value={formData.completed_years_of_education}
                      onChange={handleChange}
                      placeholder="Years"
                      min="0"
                      max="30"
                      className="w-24 px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Financial Information */}
        <Card
          title={
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-primary-600" />
              </div>
              <span className="text-xl font-bold text-gray-900">Financial Information</span>
            </div>
          }
          className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <IconInput
                icon={<FiTrendingUp className="w-4 h-4" />}
                label="Patient Income (₹)"
                type="number"
                name="patient_income"
                value={formData.patient_income}
                onChange={handleChange}
                min="0"
                placeholder="Monthly income"
                className="bg-gradient-to-r from-green-50 to-emerald-50"
              />
              <IconInput
                icon={<FiTrendingUp className="w-4 h-4" />}
                label="Family Income (₹)"
                type="number"
                name="family_income"
                value={formData.family_income}
                onChange={handleChange}
                min="0"
                placeholder="Total monthly family income"
                className="bg-gradient-to-r from-blue-50 to-indigo-50"
              />
            </div>
          </div>
        </Card>

        {/* Family Information */}
        <Card
          title={
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FiUsers className="w-6 h-6 text-primary-600" />
              </div>
              <span className="text-xl font-bold text-gray-900">Family Information</span>
            </div>
          }
          className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm"
        >
          <div className="space-y-8">
            {/* Religion Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
                <h4 className="text-xl font-bold text-gray-900">Religion</h4>
              </div>
              <RadioGroup
                label=""
                name="religion"
                value={formData.religion}
                onChange={handleChange}
                options={RELIGION}
                icon={<FiShield className="w-4 h-4" />}
                className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg"
              />
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Family Type Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
                <h4 className="text-xl font-bold text-gray-900">Family Type</h4>
              </div>
              <RadioGroup
                label=""
                name="family_type"
                value={formData.family_type}
                onChange={handleChange}
                options={FAMILY_TYPE}
                icon={<FiUsers className="w-4 h-4" />}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg"
              />
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Locality Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
                <h4 className="text-xl font-bold text-gray-900">Locality</h4>
              </div>
              <RadioGroup
                label=""
                name="locality"
                value={formData.locality}
                onChange={handleChange}
                options={LOCALITY}
                icon={<FiMapPin className="w-4 h-4" />}
                className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg"
              />
            </div>

            <div className="border-t pt-8">
              <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <FiUsers className="w-6 h-6 text-primary-600" />
                Head of the Family
              </h4>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <IconInput
                    icon={<FiUser className="w-4 h-4" />}
                    label="Name"
                    name="head_name"
                    value={formData.head_name}
                    onChange={handleChange}
                    placeholder="Enter head of family name"
                    className="bg-gradient-to-r from-blue-50 to-indigo-50"
                  />
                  <IconInput
                    icon={<FiClock className="w-4 h-4" />}
                    label="Age"
                    type="number"
                    name="head_age"
                    value={formData.head_age}
                    onChange={handleChange}
                    min="0"
                    max="150"
                    className="bg-gradient-to-r from-orange-50 to-yellow-50"
                  />
                  <IconInput
                    icon={<FiUsers className="w-4 h-4" />}
                    label="Relationship"
                    name="head_relationship"
                    value={formData.head_relationship}
                    onChange={handleChange}
                    placeholder="Enter relationship"
                    className="bg-gradient-to-r from-green-50 to-emerald-50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <IconInput
                    icon={<FiBookOpen className="w-4 h-4" />}
                    label="Education"
                    name="head_education"
                    value={formData.head_education}
                    onChange={handleChange}
                    placeholder="Enter education level"
                    className="bg-gradient-to-r from-purple-50 to-pink-50"
                  />
                  <IconInput
                    icon={<FiBriefcase className="w-4 h-4" />}
                    label="Occupation"
                    name="head_occupation"
                    value={formData.head_occupation}
                    onChange={handleChange}
                    placeholder="Enter occupation"
                    className="bg-gradient-to-r from-teal-50 to-cyan-50"
                  />
                  <IconInput
                    icon={<FiTrendingUp className="w-4 h-4" />}
                    label="Income (₹)"
                    type="number"
                    name="head_income"
                    value={formData.head_income}
                    onChange={handleChange}
                    min="0"
                    placeholder="Monthly income"
                    className="bg-gradient-to-r from-amber-50 to-orange-50"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Referral & Mobility */}
        <Card
          title={
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FiMapPin className="w-6 h-6 text-primary-600" />
              </div>
              <span className="text-xl font-bold text-gray-900">Referral & Mobility</span>
            </div>
          }
          className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm"
        >
          <div className="space-y-6">
            <IconInput
              icon={<FiNavigation className="w-4 h-4" />}
              label="Distance from Hospital"
              name="distance_from_hospital"
              value={formData.distance_from_hospital}
              onChange={handleChange}
              placeholder="Enter distance from hospital"
              className="bg-gradient-to-r from-blue-50 to-indigo-50"
            />

            <RadioGroup
              label="Mobility"
              name="mobility"
              value={formData.mobility}
              onChange={handleChange}
              options={MOBILITY_OPTIONS}
              icon={<FiTruck className="w-4 h-4" />}
              className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RadioGroup
                label="Referred By"
                name="referred_by"
                value={formData.referred_by}
                onChange={handleChange}
                options={REFERRED_BY_OPTIONS}
                icon={<FiUsers className="w-4 h-4" />}
                className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg"
              />
              <IconInput
                icon={<FiEdit3 className="w-4 h-4" />}
                label="Exact Source"
                name="exact_source"
                value={formData.exact_source}
                onChange={handleChange}
                placeholder="Enter exact source"
                className="bg-gradient-to-r from-orange-50 to-yellow-50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DateInput
                icon={<FiCalendar className="w-4 h-4" />}
                label="Seen in Walk-in On"
                name="seen_in_walk_in_on"
                value={formData.seen_in_walk_in_on}
                onChange={handleChange}
              />
              <DateInput
                icon={<FiCalendar className="w-4 h-4" />}
                label="Worked Up On"
                name="worked_up_on"
                value={formData.worked_up_on}
                onChange={handleChange}
              />
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card
          title={
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FiPhone className="w-6 h-6 text-primary-600" />
              </div>
              <span className="text-xl font-bold text-gray-900">Contact Information</span>
            </div>
          }
          className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FiHome className="w-4 h-4 text-primary-600" />
                  Present Address
                </label>
                <Textarea
                  name="present_address"
                  value={formData.present_address}
                  onChange={handleChange}
                  rows={3}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FiMapPin className="w-4 h-4 text-primary-600" />
                  Permanent Address
                </label>
                <Textarea
                  name="permanent_address"
                  value={formData.permanent_address}
                  onChange={handleChange}
                  rows={3}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FiEdit3 className="w-4 h-4 text-primary-600" />
                  Local Address
                </label>
                <Textarea
                  name="local_address"
                  value={formData.local_address}
                  onChange={handleChange}
                  rows={3}
                  className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                />
              </div>
              <IconInput
                icon={<FiPhone className="w-4 h-4" />}
                label="Contact Number"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                placeholder="Enter contact number"
                className="bg-gradient-to-r from-teal-50 to-cyan-50"
              />
            </div>

            <IconInput
              icon={<FiBookOpen className="w-4 h-4" />}
              label="School/College/Office"
              name="school_college_office"
              value={formData.school_college_office}
              onChange={handleChange}
              placeholder="Enter school/college/office name"
              className="bg-gradient-to-r from-orange-50 to-yellow-50"
            />
          </div>
        </Card>

        {/* Address Information */}
        <Card
          title={
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FiHome className="w-6 h-6 text-primary-600" />
              </div>
              <span className="text-xl font-bold text-gray-900">Address Information</span>
            </div>
          }
          className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm"
        >
          <div className="space-y-8">
            {/* Present Address */}
            <div className="space-y-6">
              <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <FiMapPin className="w-6 h-6 text-primary-600" />
                </div>
                Present Address
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FiHome className="w-4 h-4 text-primary-600" />
                    Address Line 1
                  </label>
                  <Textarea
                    name="present_address_line_1"
                    value={formData.present_address_line_1}
                    onChange={handleChange}
                    rows={2}
                    className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FiEdit3 className="w-4 h-4 text-primary-600" />
                    Address Line 2
                  </label>
                  <Textarea
                    name="present_address_line_2"
                    value={formData.present_address_line_2}
                    onChange={handleChange}
                    rows={2}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  />
                </div>
                <IconInput
                  icon={<FiHome className="w-4 h-4" />}
                  label="City/Town/Village"
                  name="present_city_town_village"
                  value={formData.present_city_town_village}
                  onChange={handleChange}
                  className="bg-gradient-to-r from-teal-50 to-cyan-50"
                />
                <IconInput
                  icon={<FiLayers className="w-4 h-4" />}
                  label="District"
                  name="present_district"
                  value={formData.present_district}
                  onChange={handleChange}
                  className="bg-gradient-to-r from-orange-50 to-yellow-50"
                />
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FiMapPin className="w-4 h-4 text-primary-600" />
                    State
                  </label>
                  <Select
                    name="present_state"
                    value={formData.present_state}
                    onChange={handleChange}
                    options={INDIAN_STATES}
                    className="bg-gradient-to-r from-indigo-50 to-purple-50"
                  />
                </div>
                <IconInput
                  icon={<FiHash className="w-4 h-4" />}
                  label="PIN Code"
                  name="present_pin_code"
                  value={formData.present_pin_code}
                  onChange={handleChange}
                  className="bg-gradient-to-r from-pink-50 to-rose-50"
                />
                <IconInput
                  icon={<FiGlobe className="w-4 h-4" />}
                  label="Country"
                  name="present_country"
                  value={formData.present_country}
                  onChange={handleChange}
                  className="bg-gradient-to-r from-slate-50 to-gray-50"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Permanent Address */}
            <div className="space-y-6">
              <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <FiMapPin className="w-6 h-6 text-primary-600" />
                </div>
                Permanent Address
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FiHome className="w-4 h-4 text-primary-600" />
                    Address Line 1
                  </label>
                  <Textarea
                    name="permanent_address_line_1"
                    value={formData.permanent_address_line_1}
                    onChange={handleChange}
                    rows={2}
                    className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FiEdit3 className="w-4 h-4 text-primary-600" />
                    Address Line 2
                  </label>
                  <Textarea
                    name="permanent_address_line_2"
                    value={formData.permanent_address_line_2}
                    onChange={handleChange}
                    rows={2}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  />
                </div>
                <IconInput
                  icon={<FiHome className="w-4 h-4" />}
                  label="City/Town/Village"
                  name="permanent_city_town_village"
                  value={formData.permanent_city_town_village}
                  onChange={handleChange}
                  className="bg-gradient-to-r from-teal-50 to-cyan-50"
                />
                <IconInput
                  icon={<FiLayers className="w-4 h-4" />}
                  label="District"
                  name="permanent_district"
                  value={formData.permanent_district}
                  onChange={handleChange}
                  className="bg-gradient-to-r from-orange-50 to-yellow-50"
                />
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FiMapPin className="w-4 h-4 text-primary-600" />
                    State
                  </label>
                  <Select
                    name="permanent_state"
                    value={formData.permanent_state}
                    onChange={handleChange}
                    options={INDIAN_STATES}
                    className="bg-gradient-to-r from-indigo-50 to-purple-50"
                  />
                </div>
                <IconInput
                  icon={<FiHash className="w-4 h-4" />}
                  label="PIN Code"
                  name="permanent_pin_code"
                  value={formData.permanent_pin_code}
                  onChange={handleChange}
                  className="bg-gradient-to-r from-pink-50 to-rose-50"
                />
                <IconInput
                  icon={<FiGlobe className="w-4 h-4" />}
                  label="Country"
                  name="permanent_country"
                  value={formData.permanent_country}
                  onChange={handleChange}
                  className="bg-gradient-to-r from-slate-50 to-gray-50"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Quick Entry Address */}
            <div className="space-y-6">
              <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <FiEdit3 className="w-6 h-6 text-primary-600" />
                </div>
                Quick Entry Address
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FiHome className="w-4 h-4 text-primary-600" />
                    Address Line 1
                  </label>
                  <Textarea
                    name="address_line_1"
                    value={formData.address_line_1}
                    onChange={handleChange}
                    rows={2}
                    className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FiEdit3 className="w-4 h-4 text-primary-600" />
                    Address Line 2
                  </label>
                  <Textarea
                    name="address_line_2"
                    value={formData.address_line_2}
                    onChange={handleChange}
                    rows={2}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  />
                </div>
                <IconInput
                  icon={<FiHome className="w-4 h-4" />}
                  label="City/Town/Village"
                  name="city_town_village"
                  value={formData.city_town_village}
                  onChange={handleChange}
                  className="bg-gradient-to-r from-teal-50 to-cyan-50"
                />
                <IconInput
                  icon={<FiLayers className="w-4 h-4" />}
                  label="District"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="bg-gradient-to-r from-orange-50 to-yellow-50"
                />
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FiMapPin className="w-4 h-4 text-primary-600" />
                    State
                  </label>
                  <Select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    options={INDIAN_STATES}
                    className="bg-gradient-to-r from-indigo-50 to-purple-50"
                  />
                </div>
                <IconInput
                  icon={<FiHash className="w-4 h-4" />}
                  label="PIN Code"
                  name="pin_code"
                  value={formData.pin_code}
                  onChange={handleChange}
                  className="bg-gradient-to-r from-pink-50 to-rose-50"
                />
                <IconInput
                  icon={<FiGlobe className="w-4 h-4" />}
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="bg-gradient-to-r from-slate-50 to-gray-50"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Registration Details */}
        <Card
          title={
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FiCalendar className="w-6 h-6 text-primary-600" />
              </div>
              <span className="text-xl font-bold text-gray-900">Registration Details</span>
            </div>
          }
          className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <IconInput
                icon={<FiLayers className="w-4 h-4" />}
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="bg-gradient-to-r from-blue-50 to-indigo-50"
              />
              <IconInput
                icon={<FiUsers className="w-4 h-4" />}
                label="Unit Constitution"
                name="unit_consit"
                value={formData.unit_consit}
                onChange={handleChange}
                className="bg-gradient-to-r from-green-50 to-emerald-50"
              />
              <IconInput
                icon={<FiHome className="w-4 h-4" />}
                label="Room Number"
                name="room_no"
                value={formData.room_no}
                onChange={handleChange}
                className="bg-gradient-to-r from-purple-50 to-pink-50"
              />
              <IconInput
                icon={<FiHash className="w-4 h-4" />}
                label="Serial Number"
                name="serial_no"
                value={formData.serial_no}
                onChange={handleChange}
                className="bg-gradient-to-r from-orange-50 to-yellow-50"
              />
              <IconInput
                icon={<FiFileText className="w-4 h-4" />}
                label="File Number"
                name="file_no"
                value={formData.file_no}
                onChange={handleChange}
                className="bg-gradient-to-r from-teal-50 to-cyan-50"
              />
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FiClock className="w-4 h-4 text-primary-600" />
                  Unit Days
                </label>
                <Select
                  name="unit_days"
                  value={formData.unit_days}
                  onChange={handleChange}
                  options={UNIT_DAYS_OPTIONS}
                  className="bg-gradient-to-r from-amber-50 to-orange-50"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Additional Information */}
        <Card
          title={
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FiActivity className="w-6 h-6 text-primary-600" />
              </div>
              <span className="text-xl font-bold text-gray-900">Additional Information</span>
            </div>
          }
          className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <IconInput
                icon={<FiShield className="w-4 h-4" />}
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="bg-gradient-to-r from-blue-50 to-indigo-50"
              />
              <IconInput
                icon={<FiStar className="w-4 h-4" />}
                label="Special Clinic Number"
                name="special_clinic_no"
                value={formData.special_clinic_no}
                onChange={handleChange}
                className="bg-gradient-to-r from-green-50 to-emerald-50"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PatientDetailsEdit;
