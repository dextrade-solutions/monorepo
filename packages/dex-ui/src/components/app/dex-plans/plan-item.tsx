import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
} from '@mui/material';
import { Tariff } from 'dex-helpers/types';
import { useTranslation } from 'react-i18next';

import { PaymodalHandlers, useGlobalModalContext } from '../modals';

export function PlanItem({
  paymodalHandlers,
  value,
  onBuyPlan,
}: {
  value: Tariff;
  paymodalHandlers?: PaymodalHandlers;
  onBuyPlan?: (plan: Tariff) => void;
}) {
  const { showModal } = useGlobalModalContext();
  const { t } = useTranslation();

  return (
    <Card
      sx={{
        boxShadow: 'none',
        bgcolor: 'primary.dark',
        color: 'primary.contrastText',
        borderColor: value.recommended ? 'primary' : 'primary.light',
      }}
    >
      <CardActionArea
        onClick={() =>
          showModal({
            name: 'PAY_MODAL',
            plan: value,
            onBuyPlan,
            paymodalHandlers,
          })
        }
      >
        <Box padding={1}>
          <CardContent>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              marginBottom={3}
            >
              <Typography marginBottom={1} variant="h6" fontWeight="bold">
                {value.name}
              </Typography>

              {value.price > 0 ? (
                <Typography>
                  ${''}
                  <Typography as="span" variant="h4" fontWeight="bold">
                    {value.price}
                  </Typography>
                </Typography>
              ) : (
                <Typography variant="h4" fontWeight="bold">
                  {t('Free')}
                </Typography>
              )}
            </Box>
            {Boolean(value.includeKyc) && (
              <Box display="flex" justifyContent="space-between">
                <Typography>{t('includeKyc')}</Typography>
                <Typography color="text.secondary">
                  {value.includeKyc ? t('Included') : t('Not included')}
                </Typography>
              </Box>
            )}
            {Boolean(value.amlRequests) && (
              <Box display="flex" justifyContent="space-between">
                <Typography>{t('amlRequests')}</Typography>
                <Typography color="text.secondary">
                  {value.amlRequests} {t('requests')}
                </Typography>
              </Box>
            )}
            {Boolean(value.refillGasRequests) && (
              <Box display="flex" justifyContent="space-between">
                <Typography>{t('refillGasRequests')}</Typography>
                <Typography color="text.secondary">
                  {value.refillGasRequests} {t('requests')}
                </Typography>
              </Box>
            )}
            {/* <Button sx={{ mt: 2 }} variant="contained" fullWidth size="large">
              {value.price > 0 ? t('Buy now') : t('Get it now')}
            </Button> */}
          </CardContent>
        </Box>
      </CardActionArea>
    </Card>
  );
}
