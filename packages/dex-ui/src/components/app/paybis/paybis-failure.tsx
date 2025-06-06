import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PaybisConfig } from './paybis-api-client';

interface Props {
  paybisConfig: PaybisConfig;
}

function PaybisFailurePage({ paybisConfig }: Props) {
  const { requestId: tempId } = useParams();

  // Clean up the temporary ID mapping when the component mounts
  useEffect(() => {
    if (tempId) {
      localStorage.removeItem(`paybis_temp_${tempId}`);
    }
  }, [tempId]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Payment Failed</h2>
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">
          <strong>Request ID:</strong> {tempId || 'Not set'}
        </p>
        <p className="text-red-700 mt-2">
          The payment process was not completed successfully. Please try again or contact support if the issue persists.
        </p>
      </div>
    </div>
  );
}

export default PaybisFailurePage; 