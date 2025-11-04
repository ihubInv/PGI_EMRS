import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  useGetClinicalProformaByIdQuery
} from '../../features/clinical/clinicalApiSlice';
import { useGetADLFileByIdQuery } from '../../features/adl/adlApiSlice';
import CreateClinicalProforma from './CreateClinicalProforma';
import LoadingSpinner from '../../components/LoadingSpinner';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { FiArrowLeft, FiAlertCircle } from 'react-icons/fi';

/**
 * EditClinicalProforma Component
 * 
 * This component loads existing clinical proforma data and ADL file data (if complex case),
 * then renders the CreateClinicalProforma component in edit mode with prefilled data.
 */
const EditClinicalProforma = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTab = searchParams.get('returnTab');

  // Fetch clinical proforma data
  const { 
    data: proformaData, 
    isLoading: isLoadingProforma, 
    isError: isErrorProforma,
    error: proformaError 
  } = useGetClinicalProformaByIdQuery(id);

  const proforma = proformaData?.data?.proforma;
  const isComplexCase = proforma?.doctor_decision === 'complex_case' && proforma?.adl_file_id;

  // Fetch ADL file data if this is a complex case
  const { 
    data: adlFileData, 
    isLoading: isLoadingADL 
  } = useGetADLFileByIdQuery(
    proforma?.adl_file_id,
    { skip: !isComplexCase }
  );

  const adlFile = adlFileData?.data?.adlFile || adlFileData?.data?.file;

  // Loading state
  if (isLoadingProforma || (isComplexCase && isLoadingADL)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (isErrorProforma) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="text-center py-12">
            <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Clinical Proforma</h2>
            <p className="text-gray-600 mb-6">
              {proformaError?.data?.message || 'Failed to load clinical proforma data'}
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FiArrowLeft className="w-4 h-4" />
                Go Back
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="primary"
              >
                Retry
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Not found state
  if (!proforma) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="text-center py-12">
            <FiAlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Clinical Proforma Not Found</h2>
            <p className="text-gray-600 mb-6">
              The clinical proforma you're trying to edit doesn't exist or has been deleted.
            </p>
            <Button
              onClick={() => navigate('/clinical')}
              variant="primary"
              className="flex items-center gap-2 mx-auto"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Clinical Proformas
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Render CreateClinicalProforma in edit mode with prefilled data
  // We'll pass the proforma and adlFile data as props, and CreateClinicalProforma
  // will handle the edit mode by checking for savedProformaId
  return (
    <CreateClinicalProforma 
      editMode={true}
      existingProforma={proforma}
      existingAdlFile={adlFile}
      proformaId={id}
    />
  );
};

export default EditClinicalProforma;

