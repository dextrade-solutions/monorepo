import { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { usePaybis } from './paybis-react-component';
import { PaybisConfig } from './paybis-api-client';

interface Props {
  paybisConfig: PaybisConfig
}

function DepositPage({ paybisConfig }: Props) {
  const [paymentDetails, setPaymentDetails] = useState(null);

  const paybis = usePaybis(paybisConfig);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  
  const requestId = queryParams.get("requestId");

  useEffect(() => {
    const loadPaymentDetails = async () => {
      try {
        const paymentDetails = await paybis.getPaymentDetails(requestId);
        console.log(paymentDetails);
        setPaymentDetails(paymentDetails);
      } catch (error) {
        console.error('Error get PaymentDetails:', error);
      }
    };
    loadPaymentDetails();
  }, [paybis, requestId]);

  return (
    <div>
      <h2>Deposit Page</h2>
      <p><strong>requestId:</strong> {requestId || "Not set"}</p>
        {paymentDetails && (
          <div className="mb-6">        
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Payment Details:</label>
              <label className="block text-gray-700 mb-2">{/*JSON.stringify(paymentDetails.data)*/}</label>
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">invoice: </label>
              <label className="block text-gray-700 mb-2">{paymentDetails.data.invoice}</label>
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">network: </label>
              <label className="block text-gray-700 mb-2">{paymentDetails.data.network}</label>
            </div>
            <div className="mb-6">              
              <label className="block text-gray-700 mb-2">depositAddress: </label>
              <label className="block text-gray-700 mb-2">{paymentDetails.data.depositAddress}</label>
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">currencyCode: </label>
              <label className="block text-gray-700 mb-2">{paymentDetails.data.currencyCode}</label>
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">amount: </label>
              <label className="block text-gray-700 mb-2">{paymentDetails.data.amount}</label>
            </div>
          </div>            
        )}
    </div>        
    
  );
}

export default DepositPage;
