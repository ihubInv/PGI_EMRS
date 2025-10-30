export const USER_ROLES = {
  ADMIN: 'Admin',
  MWO: 'MWO',
  JR: 'JR',
  SR: 'SR',
};

export const VISIT_TYPES = [
  { value: 'first_visit', label: 'First Visit' },
  { value: 'follow_up', label: 'Follow Up' },
];

export const CASE_SEVERITY = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
  { value: 'critical', label: 'Critical' },
];

export const DOCTOR_DECISION = [
  { value: 'simple_case', label: 'Simple Case' },
  { value: 'complex_case', label: 'Complex Case' },
];

export const FILE_STATUS = [
  { value: 'created', label: 'Created' },
  { value: 'stored', label: 'Stored' },
  { value: 'retrieved', label: 'Retrieved' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];

export const SEX_OPTIONS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'Other', label: 'Other' },
];

export const MARITAL_STATUS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'remarried', label: 'Remarried' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'separated', label: 'Separated' },
  { value: 'others', label: 'Others' },
  { value: 'not_known', label: 'Not Known' },
];

export const FAMILY_TYPE = [
  { value: 'nuclear', label: 'Nuclear' },
  { value: 'extended', label: 'Extended' },
  { value: 'joint', label: 'Joint' },
  { value: 'others', label: 'Others' },
  { value: 'not_known', label: 'Not Known' },
];

export const LOCALITY = [
  { value: 'urban', label: 'Urban' },
  { value: 'rural', label: 'Rural' },
  { value: 'not_known', label: 'Not Known' },
];

export const RELIGION = [
  { value: 'hinduism', label: 'Hinduism' },
  { value: 'islam', label: 'Islam' },
  { value: 'sikhism', label: 'Sikhism' },
  { value: 'christianity', label: 'Christianity' },
  { value: 'others', label: 'Others' },
  { value: 'not_known', label: 'Not Known' },
];

// Age Group Options
export const AGE_GROUP_OPTIONS = [
  { value: '0-15', label: '0 – 15' },
  { value: '15-30', label: '15 – 30' },
  { value: '30-45', label: '30 – 45' },
  { value: '45-60', label: '45 – 60' },
  { value: '60+', label: '60 – Above' },
];

// Unit Days Options
export const UNIT_DAYS_OPTIONS = [
  { value: 'mon', label: 'Mon' },
  { value: 'tue', label: 'Tue' },
  { value: 'wed', label: 'Wed' },
  { value: 'thu', label: 'Thu' },
  { value: 'fri', label: 'Fri' },
  { value: 'sat', label: 'Sat' },
];

// Indian States Options
export const INDIAN_STATES = [
  { value: 'andhra_pradesh', label: 'Andhra Pradesh' },
  { value: 'arunachal_pradesh', label: 'Arunachal Pradesh' },
  { value: 'assam', label: 'Assam' },
  { value: 'bihar', label: 'Bihar' },
  { value: 'chhattisgarh', label: 'Chhattisgarh' },
  { value: 'goa', label: 'Goa' },
  { value: 'gujarat', label: 'Gujarat' },
  { value: 'haryana', label: 'Haryana' },
  { value: 'himachal_pradesh', label: 'Himachal Pradesh' },
  { value: 'jharkhand', label: 'Jharkhand' },
  { value: 'karnataka', label: 'Karnataka' },
  { value: 'kerala', label: 'Kerala' },
  { value: 'madhya_pradesh', label: 'Madhya Pradesh' },
  { value: 'maharashtra', label: 'Maharashtra' },
  { value: 'manipur', label: 'Manipur' },
  { value: 'meghalaya', label: 'Meghalaya' },
  { value: 'mizoram', label: 'Mizoram' },
  { value: 'nagaland', label: 'Nagaland' },
  { value: 'odisha', label: 'Odisha' },
  { value: 'punjab', label: 'Punjab' },
  { value: 'rajasthan', label: 'Rajasthan' },
  { value: 'sikkim', label: 'Sikkim' },
  { value: 'tamil_nadu', label: 'Tamil Nadu' },
  { value: 'telangana', label: 'Telangana' },
  { value: 'tripura', label: 'Tripura' },
  { value: 'uttar_pradesh', label: 'Uttar Pradesh' },
  { value: 'uttarakhand', label: 'Uttarakhand' },
  { value: 'west_bengal', label: 'West Bengal' },
  { value: 'andaman_nicobar', label: 'Andaman and Nicobar Islands' },
  { value: 'chandigarh', label: 'Chandigarh' },
  { value: 'dadra_nagar_haveli', label: 'Dadra and Nagar Haveli and Daman and Diu' },
  { value: 'delhi', label: 'Delhi' },
  { value: 'jammu_kashmir', label: 'Jammu and Kashmir' },
  { value: 'ladakh', label: 'Ladakh' },
  { value: 'lakshadweep', label: 'Lakshadweep' },
  { value: 'puducherry', label: 'Puducherry' },
];

// Occupation Options
export const OCCUPATION_OPTIONS = [
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'unskilled', label: 'Unskilled' },
  { value: 'semi_skilled', label: 'Semi-skilled' },
  { value: 'skilled', label: 'Skilled' },
  { value: 'clerical_shop_farmer', label: 'Clerical/Shop/Farmer' },
  { value: 'semi_professional', label: 'Semi-professional' },
  { value: 'household_housewife', label: 'Household/housewife' },
  { value: 'retired', label: 'Retired' },
  { value: 'student', label: 'Student' },
  { value: 'professional', label: 'Professional' },
];

// Education Options
export const EDUCATION_OPTIONS = [
  { value: 'illiterate_literate', label: 'Illiterate/Literate' },
  { value: 'primary', label: 'Primary' },
  { value: 'middle', label: 'Middle' },
  { value: 'matric', label: 'Matric' },
  { value: 'inter_diploma', label: 'Inter/Diploma' },
  { value: 'graduate', label: 'Graduate' },
  { value: 'master_professional', label: 'Master/Professional' },
  { value: 'not_known', label: 'Not Known' },
];

// Mobility Options
export const MOBILITY_OPTIONS = [
  { value: 'permanent_resident', label: 'Permanent resident of Punjab/Haryana/Chandigarh/Himachal Pradesh' },
  { value: 'transferable', label: 'Transferable' },
  { value: 'visiting_chandigarh', label: 'Visiting Chandigarh for a short duration' },
  { value: 'others', label: 'Others' },
  { value: 'not_known', label: 'Not Known' },
];

// Referred By Options
export const REFERRED_BY_OPTIONS = [
  { value: 'self', label: 'Self' },
  { value: 'medical_specialities_pgi', label: 'Medical Specialities in PGI' },
  { value: 'surgical_specialities_pgi', label: 'Surgical Specialities in PGI' },
  { value: 'physician_surgeon_outside_pgi', label: 'Physician/Surgeon outside PGI' },
  { value: 'psychiatrist_outside_pgi', label: 'Psychiatrist outside PGI' },
  { value: 'relative_family', label: 'Relative/Family' },
  { value: 'others', label: 'Others' },
];

