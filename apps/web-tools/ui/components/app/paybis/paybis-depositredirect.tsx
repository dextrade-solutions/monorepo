import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { PaybisConfig } from './paybis-api-client';
import { usePaybis } from './paybis-react-component';

interface PaymentDetails {
  data: {
    invoice: string;
    network: string;
    depositAddress: string;
    currencyCode: string;
    amount: string;
  };
}

interface Props {
  paybisConfig: PaybisConfig;
}

function DepositPage({ paybisConfig }: Props) {
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
    null,
  );
  const { requestId: tempId } = useParams();
  const paybis = usePaybis(paybisConfig);

  useEffect(() => {
    const loadPaymentDetails = async () => {
      if (!tempId) {
        return;
      }

      try {
        // Get the actual requestId from localStorage
        const actualRequestId = localStorage.getItem(`paybis_temp_${tempId}`);
        if (!actualRequestId) {
          console.error('No request ID found for temp ID:', tempId);
          return;
        }

        const details = await paybis.getPaymentDetails(
          actualRequestId as 'buy' | 'sell',
        );
        console.log(details);
        setPaymentDetails(details);

        // Clean up the temporary ID mapping
        localStorage.removeItem(`paybis_temp_${tempId}`);
      } catch (error) {
        console.error('Error getting PaymentDetails:', error);
      }
    };
    loadPaymentDetails();
  }, [paybis, tempId]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Deposit Details</h2>
      {paymentDetails && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-3">Payment Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Invoice</p>
                <p className="font-medium">{paymentDetails.data.invoice}</p>
              </div>
              <div>
                <p className="text-gray-600">Network</p>
                <p className="font-medium">{paymentDetails.data.network}</p>
              </div>
              <div>
                <p className="text-gray-600">Deposit Address</p>
                <p className="font-medium break-all">
                  {paymentDetails.data.depositAddress}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Currency</p>
                <p className="font-medium">
                  {paymentDetails.data.currencyCode}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Amount</p>
                <p className="font-medium">{paymentDetails.data.amount}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DepositPage;
