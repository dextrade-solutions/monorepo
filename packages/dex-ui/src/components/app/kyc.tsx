import { Alert, Box, Button, Typography } from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { KycStatuses } from 'dex-helpers';
import { ServiceBridge, kycService, DextradeTypes } from 'dex-services';
import React from 'react';

import Icon from '../ui/icon';

export default function Disabled() {
  return (
    <Alert severity="info">
      KYC verification temporarily is disabled. Please, try again later
    </Alert>
  );
}

export function KycIndentification({
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
  const { isError, data: kycInfo } = useQuery({
    queryKey: ['kycInfo'],
    retry: false,
    queryFn: getKycInfo,
  });
  const { isPending, mutate: startKyc } = useMutation({
    mutationFn: startVerification,
  });
  let alert;
  let kycBtn;

  switch (!isError && kycInfo?.status) {
    case KycStatuses.unused:
      alert = (
        <Alert severity="warning">
          Status:
          <Typography fontWeight="bold">In progress</Typography>
          Please, complete all KYC stages
        </Alert>
      );
      kycBtn = (
        <Button
          disabled={isPending}
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
          disabled={isPending}
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
          disabled={isPending}
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
        <Button>
          <Typography marginRight={1}>Telegram support</Typography>{' '}
          <Icon name="send-1" />
        </Button>
      </Box>
    </Box>
  );
}
