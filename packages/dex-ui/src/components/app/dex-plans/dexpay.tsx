import { Box, Grid, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Tariff } from 'dex-helpers/types';
import { tariffService } from 'dex-services';
import { range } from 'lodash';
import { useTranslation } from 'react-i18next';

import CompareTypes from './compare-types';
import { PlanCompare } from './plan-compare';
import { PlanItem } from './plan-item';
import { TariffLimit } from './tariff-limit';
import { PaymodalHandlers } from '../modals';
import { PlanItemSkeleton } from './plan-item-skeleton';

export default function Dexpay({
  onBuyPlan,
  paymodalHandlers,
}: {
  onBuyPlan?: (plan: Tariff) => void;
  paymodalHandlers?: PaymodalHandlers;
}) {
  const { t } = useTranslation();

  const { data: plans = [], isLoading } = useQuery<Tariff[]>({
    queryKey: ['plans'],
    queryFn: () => {
      return tariffService.listAll().then((response) => {
        return response.data;
      });
    },
  });

  return (
    <Box>
      {/* <Box>
        <Typography variant="h3" fontWeight="bold">
          DexPay
        </Typography>
        <Typography color="text.secondary">
          {t('Self custodian payment gateway')}
        </Typography>
      </Box> */}
      <TariffLimit />
      <Typography variant="h6" margin={1} marginTop={5}>
        {t('Personal plans')}
      </Typography>
      <Grid container spacing={2}>
        {plans.map((value, idx) => (
          <Grid item key={idx} xs={12}>
            <PlanItem
              paymodalHandlers={paymodalHandlers}
              value={{
                ...value,
              }}
              onBuyPlan={onBuyPlan}
            />
          </Grid>
        ))}
        {isLoading &&
          range(3).map((idx) => (
            <Grid item key={idx} xs={12}>
              <PlanItemSkeleton />
            </Grid>
          ))}
      </Grid>
      <Typography margin={1} marginTop={5} alignItems="flex-end">
        <Typography as="span" variant="h6">
          {t('Personal plans')}
        </Typography>
        <Typography as="span" variant="h6" color="text.secondary">
          {' '}
          - {t('Compare')}
        </Typography>
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <PlanCompare keyToCompare="amlRequests" plans={plans} />
        </Grid>
        <Grid item xs={12}>
          <PlanCompare
            keyToCompare="includeKyc"
            plans={plans}
            type={CompareTypes.check}
          />
        </Grid>
        <Grid item xs={12}>
          <PlanCompare keyToCompare="refillGasRequests" plans={plans} />
        </Grid>
      </Grid>
    </Box>
  );
}
