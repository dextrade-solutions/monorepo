/* eslint-disable @typescript-eslint/no-duplicate-enum-values */
import { Box, Typography } from '@mui/material';
import { TradeStatus } from 'dex-helpers';
import { Icon, PulseLoader } from 'dex-ui';
import React from 'react';

import { useI18nContext } from '../../../hooks/useI18nContext';

const ICON_BY_STATUS = {
  WAIT_EXCHANGER_VERIFY: <PulseLoader />,
  NEW: <PulseLoader />,
  CANCELED: <Icon name="arrow-left-dex" size="lg" />,
  CLIENT_TRANSACTION_VERIFY: <PulseLoader />,
  CLIENT_TRANSACTION_FAILED: <PulseLoader />,
  WAIT_EXCHANGER_TRANSFER: <PulseLoader />,
  EXCHANGER_TRANSACTION_VERIFY: <PulseLoader />,
  EXCHANGER_TRANSACTION_FAILED: <Icon name="alert" color="error.main" />,
  VERIFIED: <PulseLoader />,
  COMPLETED: <Icon color="success.light" name="check" size="lg" />,
  EXPIRED: <Icon name="timer" />,
  DISPUTE: <Icon color="warning.light" name="info" />,
};

export const P2PDisplayStatus = ({ status }: { status: TradeStatus }) => {
  const t = useI18nContext();
  return (
    <Box display="flex" alignItems="center">
      <Typography variant="body2" color="text.secondary" marginRight={2}>
        {t(status)}
      </Typography>
      {ICON_BY_STATUS[status]}
    </Box>
  );
};
