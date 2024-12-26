import { Box, Skeleton } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Tariff } from 'dex-helpers/types';
import { tariffService } from 'dex-services';

import { ModalProps, PaymodalHandlers } from './types';
import { PlanItem } from '../dex-plans/plan-item';
import { PlanItemSkeleton } from '../dex-plans/plan-item-skeleton';

export default function BuyPlan({
  planName,
  paymodalHandlers,
}: { planName: string; paymodalHandlers: PaymodalHandlers } & ModalProps) {
  const { data: plan, isLoading } = useQuery<Tariff[]>({
    queryKey: ['plans', planName],
    queryFn: () => {
      return tariffService.listAll().then((response) => {
        return response.data.find((p) =>
          p.name.toLowerCase().includes(planName.toLowerCase()),
        );
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
