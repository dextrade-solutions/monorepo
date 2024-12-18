import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
} from '@mui/material';
import { Tariff } from 'dex-helpers/types';
import { PaymodalHandlers, showModal } from 'dex-ui';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

export function PlanItem({
  paymodalHandlers,
  value,
}: {
  value: Tariff;
  paymodalHandlers?: PaymodalHandlers;
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  return (
    <Card
      variant="outlined"
      sx={{
        bgcolor: 'primary.light',
        borderColor: value.recommended ? 'primary' : 'primary.light',
      }}
    >
      <CardActionArea
        onClick={() =>
          dispatch(
            showModal({
              name: 'PAY_MODAL',
              plan: value,
              paymodalHandlers,
            }),
          )
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
                <Typography>KYC</Typography>
                <Typography color="text.secondary">
                  {value.includeKyc ? t('Included') : t('Not included')}
                </Typography>
              </Box>
            )}
            {Boolean(value.amlRequests) && (
              <Box display="flex" justifyContent="space-between">
                <Typography>{t('AML Requests')}</Typography>
                <Typography color="text.secondary">
                  {value.amlRequests} requests
                </Typography>
              </Box>
            )}
            {Boolean(value.refillGasRequests) && (
              <Box display="flex" justifyContent="space-between">
                <Typography>Gas Tank (Tron)</Typography>
                <Typography color="text.secondary">
                  {value.refillGasRequests} requests
                </Typography>
              </Box>
            )}
          </CardContent>
        </Box>
      </CardActionArea>
    </Card>
  );
}
