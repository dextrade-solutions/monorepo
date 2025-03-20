import { Alert, Box, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { KycStatuses, SUPPORT_REQUEST_LINK } from 'dex-helpers';
import { ServiceBridge, kycService, DextradeTypes } from 'dex-services';
import React from 'react';

import { useRequest } from '../../hooks/useRequest';
import Icon from '../ui/icon';

export function Disabled() {
  const { t } = useTranslation();
  return <Alert severity="info">{t('kycDisabled')}</Alert>;
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
  const { t } = useTranslation();
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
          {t('kycStatus')}
          <Typography fontWeight="bold">{t('inProgress')}</Typography>
          {t('kycCompleteAllStages')}
        </Alert>
      );
      kycBtn = (
        <Button
          disabled={isLoading}
          onClick={() => startKyc()}
          variant="contained"
        >
          {t('continue')}
        </Button>
      );
      break;
    case KycStatuses.pending:
      alert = (
        <Alert severity="info">
          {t('kycStatus')}
          <Typography fontWeight="bold">{t('underReview')}</Typography>
        </Alert>
      );
      break;
    case KycStatuses.verified:
      alert = (
        <Alert severity="success">
          {t('kycStatus')}
          <Typography fontWeight="bold">{t('verified')}</Typography>
        </Alert>
      );
      break;
    case KycStatuses.declined:
      alert = (
        <Alert severity="error">
          {t('kycStatus')}
          <Typography fontWeight="bold">{t('declined')}</Typography>
        </Alert>
      );

      kycBtn = (
        <Button
          disabled={isLoading}
          onClick={() => startKyc()}
          variant="contained"
        >
          {t('tryAgain')}
        </Button>
      );
      break;
    default:
      alert = (
        <Alert severity="info">
          {t('kycInfo')}
        </Alert>
      );
      kycBtn = (
        <Button
          disabled={isLoading}
          onClick={() => startKyc()}
          variant="contained"
        >
          {t('startKyc')}
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
          <Typography marginRight={1}>{t('telegramSupport')}</Typography>{' '}
          <Icon name="send-1" />
        </Button>
      </Box>
    </Box>
  );
}
