import { Alert, Box, Button, Typography } from '@mui/material';
import { ReactNode } from 'react';

import { TxStageStatuses } from '../../../constants';
import PulseLoader from '../pulse-loader';

export default function Stage({
  onRequest,
  title = 'Send transaction',
  status,
  subtitle,
  loading,
  successText,
  failtureText,
}: {
  onRequest: () => void;
  status?: TxStageStatuses;
  title?: string;
  subtitle?: ReactNode;
  loading?: boolean;
  successText?: string;
  failtureText?: string;
}) {
  let severity;
  let icon;
  let message;
  let action;

  switch (status) {
    case TxStageStatuses.requested:
      severity = '';
      icon = (
        <Box marginTop={1}>
          <PulseLoader />
        </Box>
      );
      message = 'Approving transaction';
      break;
    case TxStageStatuses.failed:
      severity = 'error';
      action = (
        <Button disabled={loading} color="error" onClick={onRequest}>
          Try again
        </Button>
      );
      message = failtureText || 'Wallet transfer transaction failed';
      break;
    case TxStageStatuses.success:
      severity = 'success';
      message = successText || 'Successful';
      break;
    default:
      severity = 'info';
      message = 'Please approve the transaction in your wallet';
      action = (
        <Button
          disabled={loading}
          variant="contained"
          size="small"
          onClick={onRequest}
        >
          Approve
        </Button>
      );
  }

  return (
    <Box marginTop={2}>
      <Alert icon={icon} severity={severity} action={action}>
        <Box>
          <Typography fontWeight="bold">{title}</Typography>
          {subtitle}
          {loading ? 'Loading...' : message}
        </Box>
      </Alert>
    </Box>
  );
}
