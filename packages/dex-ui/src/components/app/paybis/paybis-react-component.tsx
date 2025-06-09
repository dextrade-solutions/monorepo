import React, { useState, useEffect, useMemo, useCallback } from 'react';

import { PaybisClient, PaybisConfig } from './paybis-api-client';
import { config } from './config';

interface PaybisWidgetProps {
  config: PaybisConfig;
  defaultCurrencyCode?: string;
  defaultCurrencyCodeSell?: string;
  defaultBaseCurrencyCode?: string;
  walletAddress?: string;
  amount?: number;
  side?: string;
  colorCode?: string;
  showWalletAddressForm?: boolean;
  onSuccess?: (transactionId: string) => void;
  onError?: (error: Error) => void;
}

export const PaybisWidget: React.FC<PaybisWidgetProps> = ({
  config,
  defaultCurrencyCode = 'btc',
  defaultCurrencyCodeSell = 'usdt',
  defaultBaseCurrencyCode = 'usd',
  walletAddress = '',
  amount,
  side = 'buy',
  colorCode = '#000000',
  showWalletAddressForm = true,
  onSuccess,
  onError,
}) => {
  const [widgetUrl, setWidgetUrl] = useState<string>('');
  const [requestId, setRequestId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const client = new PaybisClient(config);

        const params: Record<string, string | number | boolean> = {
          currencyCode: defaultCurrencyCode,
          baseCurrencyCode: defaultBaseCurrencyCode,
          colorCode: colorCode.replace('#', ''),
          showWalletAddressForm,
        };

        if (walletAddress) {
          params.walletAddress = walletAddress;
        }

        if (amount) {
          params.baseCurrencyAmount = amount;
        }

        if (side && side === 'sell') {
          params.currencyCode = defaultCurrencyCodeSell;
          params.defaultCurrencyCode = defaultCurrencyCodeSell;
          params.baseCurrencyCode = defaultBaseCurrencyCode; // fiat

          if (amount) {
            delete params.baseCurrencyAmount;
            params.quoteCurrencyAmount = amount;
          }
        }
        params.email = 'sshevaiv+@gmail.com';
        params.externalCustomerId = '1';

        const urlData = await client.createWidgetUrl(params, side);
        setWidgetUrl(urlData.url);
        setRequestId(urlData.requestId);
        setLoading(false);
      } catch (fetchError) {
        setError('Error init Paybis widget');
        setLoading(false);
        onError &&
          onError(
            fetchError instanceof Error
              ? fetchError
              : new Error(String(fetchError)),
          );
      }
    };

    if (!error) {
      fetchData();
    }
  }, [
    error,
    config,
    defaultCurrencyCode,
    defaultCurrencyCodeSell,
    side,
    defaultBaseCurrencyCode,
    walletAddress,
    amount,
    colorCode,
    showWalletAddressForm,
    onError,
  ]);

  // iframe messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin.includes('paybis.com')) {
        try {
          const data =
            typeof event.data === 'string'
              ? JSON.parse(event.data)
              : event.data;

          if (data.name === 'payment-redirect' && data.payload) {
            window.location.href = `${data.payload}?requestId=${requestId}`;
          }

          if (
            data.type === 'paybis_transaction_success' &&
            data.transactionId
          ) {
            onSuccess && onSuccess(data.transactionId);
          }

          if (data.payload.state === 'closed') {
            onError && onError(new Error('Closed'));
          }

          if (data.type === 'paybis_transaction_error' && data.error) {
            setError(data.error);
            onError && onError(new Error(data.error));
          }
        } catch (messageError) {
          console.error('Error processing message from Paybis:', messageError);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onSuccess, onError, requestId]);

  if (loading) {
    return <div>Loading Paybis widget...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!widgetUrl) {
    return null;
  }

  return (
    <div className="paybis-widget-container">
      <iframe
        src={widgetUrl}
        title="Paybis Widget"
        height="630px"
        width="100%"
        allow="accelerometer; autoplay; camera; gyroscope; payment; microphone"
        frameBorder="0"
        style={{
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      />
    </div>
  );
};

/**
 * React Hook API Paybis
 * @param config - Paybis configuration object
 */
export const usePaybis = () => {
  const client = useMemo(() => new PaybisClient(config), []);

  const isSandbox = useCallback(async () => {
    return await client.isTestMode();
  }, [client]);

  const getCurrencies = useCallback(
    async (opts) => {
      try {
        return await client.getCurrencies(opts.side, opts.userId, opts.userIp);
      } catch (error) {
        console.error('Error getCurrencies:', error);
        throw error;
      }
    },
    [client],
  );

  const getPaymentDetails = useCallback(
    async (side: 'buy' | 'sell') => {
      try {
        return await client.getPaymentDetails(side);
      } catch (error) {
        console.error('Error getPaymentDetails:', error);
        throw error;
      }
    },
    [client],
  );

  const createWidgetUrl = useCallback(
    async (params: Record<string, string | number | boolean>, side: string) => {
      return client.createWidgetUrl(params, side);
    },
    [client],
  );

  const getTransactionByRequestId = useCallback(
    async (params: Record<string, string | number | boolean>) => {
      return client.getTransactionByRequestId(params);
    },
    [client],
  );

  return useMemo(
    () => ({
      getCurrencies,
      getPaymentDetails,
      createWidgetUrl,
      isSandbox,
      getTransactionByRequestId,
    }),
    [
      getPaymentDetails,
      getCurrencies,
      createWidgetUrl,
      isSandbox,
      getTransactionByRequestId,
    ],
  );
};
