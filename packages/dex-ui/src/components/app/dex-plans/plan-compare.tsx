import { Box, Card, CardContent, Typography } from '@mui/material';
import { Tariff } from 'dex-helpers/types';
import { useTranslation } from 'react-i18next';

import CompareTypes from './compare-types';
import { Icon } from '../../ui';

function PlanContent({
  plan,
  type,
  keyToCompare,
}: {
  plan: Tariff;
  type: CompareTypes;
  keyToCompare: keyof Tariff;
}) {
  switch (type) {
    case CompareTypes.text:
      return (
        <Typography variant="body2" textAlign="right" color="text.secondary">
          {plan[keyToCompare]}
        </Typography>
      );
    case CompareTypes.check:
      return (
        <Icon
          color={plan[keyToCompare] ? 'success.main' : 'text.secondary'}
          name={plan[keyToCompare] ? 'check' : 'close'}
        />
      );
    default:
      return null;
  }
}

export function PlanCompare({
  plans = [],
  keyToCompare,
  type = CompareTypes.text,
}: {
  plans: Tariff[];
  keyToCompare: keyof Tariff;
  type?: CompareTypes;
}) {
  const { t } = useTranslation();
  return (
    <Card variant="outlined" sx={{ bgcolor: 'transparent' }}>
      <CardContent>
        <Typography fontWeight="bold">{t(keyToCompare)}</Typography>
      </CardContent>
      <CardContent>
        {Boolean(plans) &&
          plans.map((plan, idx: number) => (
            <Box
              key={idx}
              display="flex"
              justifyContent="space-between"
              marginY={1}
            >
              <Typography marginRight={2}>{plan.name}</Typography>
              <PlanContent
                plan={plan}
                keyToCompare={keyToCompare}
                type={type}
              />
            </Box>
          ))}
      </CardContent>
    </Card>
  );
}
