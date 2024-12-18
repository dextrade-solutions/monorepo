import { Alert, Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { tariffService } from 'dex-services';
import { useTranslation } from 'react-i18next';

export function TariffLimit() {
  const { t } = useTranslation();
  const { data = {} } = useQuery({
    queryKey: ['tariffLimit'],
    queryFn: () =>
      tariffService.getTariffLimit().then((response) => response.data),
  });
  const buyedList = [];

  if (data.amlRequests > 0) {
    buyedList.push(
      <Alert>
        {t('Left')}: {data.amlRequests} {t('AML Requests')}
      </Alert>,
    );
  }
  if (data.includeKyc) {
    buyedList.push(<Alert>KYC: {t('Included')}</Alert>);
  } else {
    buyedList.push(
      <Alert severity="warning">
        <Typography>KYC: {t('Disabled')}</Typography>
        <Typography color="text.secondary">
          {t(
            'KYC verification was disabled after 1 failed attempt, you can activate it, buying plan',
          )}
        </Typography>
      </Alert>,
    );
  }
  return buyedList.map((alertNode) => <Box marginY={2}>{alertNode}</Box>);
}
