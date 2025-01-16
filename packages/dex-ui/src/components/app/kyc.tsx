import { Alert, Box, Button, Typography } from '@mui/material';
// import { useQuery } from '@tanstack/react-query';
import { KycStatuses, SUPPORT_REQUEST_LINK } from 'dex-helpers';
import { ServiceBridge, kycService, DextradeTypes } from 'dex-services';
import React from 'react';

import { useRequest } from '../../hooks/useRequest';
import Icon from '../ui/icon';

export function Disabled() {
  return (
    <Alert severity="info">
      KYC verification temporarily is disabled. Please, try again later
    </Alert>
  );
}

export default function KycIndentification({
  getKycInfo = async () =>
    kycService
      .getKycInfo({ baseUrl: ServiceBridge.instance.baseUrl, format: 'json' })
      .then((response) => response.data),
  startVerification = async () => {
    const response = await kycService.getFormLink({
      baseUrl: ServiceBridge.instance.baseUrl,
      format: 'text',
    });
    window.open(response.data);
  },
}: {
  getKycInfo: () => Promise<DextradeTypes.KycModel>;
  startVerification: () => Promise<void>;
}) {
  // TODO: I changed useQuery to own useRequest because of errors after bundling, need resolve it
  const { isError, data: kycInfo } = useRequest({
    queryKey: ['kycInfo'],
    retry: false,
    queryFn: getKycInfo,
  });
  const { isLoading, fetchData: startKyc } = useRequest({
    queryFn: startVerification,
    immediate: false,
  });
  let alert;
  let kycBtn;

  switch (!isError && kycInfo?.status) {
    case KycStatuses.unused:
      alert = (
        <Alert severity="info">
          Status:
          <Typography fontWeight="bold">In progress</Typography>
          Please, complete all KYC stages
        </Alert>
      );
      kycBtn = (
        <Button
          disabled={isLoading}
          onClick={() => startKyc()}
          variant="contained"
        >
          Continue
        </Button>
      );
      break;
    case KycStatuses.pending:
      alert = (
        <Alert severity="info">
          Status:
          <Typography fontWeight="bold">Under review</Typography>
        </Alert>
      );
      break;
    case KycStatuses.verified:
      alert = (
        <Alert severity="success">
          Status:
          <Typography fontWeight="bold">Verified</Typography>
        </Alert>
      );
      break;
    case KycStatuses.declined:
      alert = (
        <Alert severity="error">
          Status:
          <Typography fontWeight="bold">Declined</Typography>
        </Alert>
      );

      kycBtn = (
        <Button
          disabled={isLoading}
          onClick={() => startKyc()}
          variant="contained"
        >
          Try again
        </Button>
      );
      break;
    default:
      alert = (
        <Alert severity="info">
          KYC (Know Your Client) is a global verification system used in
          financial services and banks to reduce financial scams and fraud.{' '}
          <br />
          <br />
          By law, ID documents are required for all transactions involving fiat
          currency.
        </Alert>
      );
      kycBtn = (
        <Button
          disabled={isLoading}
          onClick={() => startKyc()}
          variant="contained"
        >
          Start KYC
        </Button>
      );
  }
  return (
    <Box>
      {alert}
      <Box display="flex" marginTop={2}>
        {kycBtn}
        <div className="flex-grow" />
        <Button onClick={() => window.open(SUPPORT_REQUEST_LINK)}>
          <Typography marginRight={1}>Telegram support</Typography>{' '}
          <Icon name="send-1" />
        </Button>
      </Box>
    </Box>
  );
}
