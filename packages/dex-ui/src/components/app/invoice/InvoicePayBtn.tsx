import { Typography, Box } from '@mui/material';
import { TxStageStatuses } from 'dex-connect';
import { useState } from 'react';

import { CopyData, TxSendStage } from '../../ui';

export const InvoicePayBtn = ({
  payCallback,
}: {
  payCallback: () => Promise<string>;
}) => {
  const [paymentResult, setPaymentResult] = useState<{
    status: TxStageStatuses | null;
    hash?: string;
    error?: string;
  }>();

  const onPay = async () => {
    setPaymentResult({
      status: TxStageStatuses.requested,
    });
    try {
      const hash = await payCallback();
      setPaymentResult({
        status: TxStageStatuses.success,
        hash,
      });
    } catch (e) {
      setPaymentResult({
        status: TxStageStatuses.failed,
        error: e.shortMessage || e.message,
      });
    }
  };
  return (
    <TxSendStage
      onRequest={onPay}
      subtitle={
        paymentResult?.hash ? (
          <Box display="flex" alignItems="center">
            <Typography color="text.secondary" className="flex-grow">
              Your tx hash
            </Typography>
            <CopyData
              className="flex-shrink"
              shorten
              data={paymentResult.hash}
            />
          </Box>
        ) : null
      }
      status={paymentResult?.status}
      successText="Payment has been approved, wait for blockchain confirmation"
      failtureText={paymentResult?.error}
    />
  );
};
