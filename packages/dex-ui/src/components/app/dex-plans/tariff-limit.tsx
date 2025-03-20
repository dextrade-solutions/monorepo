import { Alert, Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Tariff } from 'dex-helpers/types';
import { tariffService } from 'dex-services';
import React from 'react';
import { useTranslation } from 'react-i18next';

export function TariffLimit() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery<Tariff>({
    queryKey: ['tariffLimit'],
    queryFn: () => {
      return tariffService.limit().then((response) => response.data as Tariff);
    },
  });
  const buyedList: React.ReactNode[] = [];

  if (isLoading) {
    return <Box>{t('Loading...')}</Box>;
  }

  if (data?.refillGasRequests > 0) {
    buyedList.push(
      <Alert key="refillGasRequests">
        {t('Left')}: {data.refillGasRequests} {t('Super fees')}
      </Alert>,
    );
  }
  if (data?.amlRequests > 0) {
    buyedList.push(
      <Alert key="amlRequests">
        {t('Left')}: {data.amlRequests} {t('AML Requests')}
      </Alert>,
    );
  }
  if (data?.includeKyc) {
    buyedList.push(<Alert key="includeKyc">{t('KYC: Included')}</Alert>);
  } else {
    buyedList.push(
      <Alert key="kycDisabled" severity="warning">
        <Typography>{t('KYC: Disabled')}</Typography>
        <Typography color="text.secondary">
          {t(
            'KYC verification was disabled after 1 failed attempt, you can activate it, buying plan',
          )}
        </Typography>
      </Alert>,
    );
  }
  return buyedList.map((alertNode, index) => (
    <Box key={index} marginY={2}>
      {alertNode}
    </Box>
  ));
}
