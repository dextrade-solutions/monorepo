import { Box, Skeleton } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Tariff } from 'dex-helpers/types';
import { tariffService } from 'dex-services';

import { ModalProps, PaymodalHandlers } from './types';
import { PlanItem } from '../dex-plans/plan-item';
import { PlanItemSkeleton } from '../dex-plans/plan-item-skeleton';

export default function BuyPlan({
  planId,
  paymodalHandlers,
}: { planId: number; paymodalHandlers: PaymodalHandlers } & ModalProps) {
  const { data: plan, isLoading } = useQuery<Tariff[]>({
    queryKey: ['plans', planId],
    queryFn: () => {
      return tariffService.listAll().then((response) => {
        return response.data.find((p) => p.id === planId);
      });
    },
  });

  if (isLoading) {
    return <PlanItemSkeleton />;
  }

  if (!plan) {
    return <Box margin={3}>Plan is not found</Box>;
  }

  return <PlanItem paymodalHandlers={paymodalHandlers} value={plan} />;
}
