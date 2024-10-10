import { Alert, Box, Button, Typography } from '@mui/material';
import { PulseLoader } from 'dex-ui';
import { ReactNode } from 'react';

import { StageStatuses } from './stage-statuses';

export default function Stage({
  onRequest,
  status,
  title = 'Send transaction',
  subtitle,
  sendTransactionFailure,
}: {
  title: string;
  subtitle?: ReactNode;
  status: StageStatuses | null;
  sendTransactionFailure?: string;
  onRequest: () => void;
}) {
  let severity;
  let icon;
  let message;
  let action;

  switch (status) {
    case StageStatuses.requested:
      severity = '';
      icon = (
        <Box marginTop={1}>
          <PulseLoader />
        </Box>
      );
      message = 'Approving transaction';
      break;
    case StageStatuses.failed:
      severity = 'error';
      action = (
        <Button color="error" onClick={onRequest}>
          Try again
        </Button>
      );
      message = sendTransactionFailure || 'Wallet transfer transaction failed';
      break;
    case StageStatuses.success:
      severity = 'success';
      message = 'Successful';
      break;
    default:
      severity = 'info';
      message = 'Please approve the transaction in your wallet';
      action = (
        <Button variant="contained" size="small" onClick={onRequest}>
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
          {message}
        </Box>
      </Alert>
    </Box>
  );
}
