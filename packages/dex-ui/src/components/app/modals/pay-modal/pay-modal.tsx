import { Button, AlertProps, Box, Divider, Typography } from '@mui/material';
import { formatCurrency } from 'dex-helpers';
import { Tariff } from 'dex-helpers/types';
import { useTranslation } from 'react-i18next';

import { ModalProps, PaymodalHandlers } from '../types';
import { PayModalProcessing } from './pay-modal-processing';
import { ButtonIcon } from '../../../ui';

const PayModal = ({
  plan,
  hideModal,
  onBuyPlan,
  paymodalHandlers,
}: {
  plan: Tariff;
  paymodalHandlers?: PaymodalHandlers;
  onBuyPlan?: (plan: Tariff) => void;
} & ModalProps &
  AlertProps) => {
  const { t } = useTranslation();

  const onBuyBtnClick = () => {
    // create invoice
    onBuyPlan && onBuyPlan(plan);
    hideModal();
  };

  return (
    <Box padding={3}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h4">{plan.name}</Typography>
        <ButtonIcon size="lg" onClick={hideModal} iconName="close" />
      </Box>
      <Typography color="text.secondary" marginBottom={2}>
        {plan.description}
      </Typography>
      <Box display="flex">
        <Typography className="flex-grow" variant="h5">
          {t('Total')}
        </Typography>
        <Typography variant="h5" fontWeight="bold">
          {formatCurrency(plan.price, 'usd')}
        </Typography>
      </Box>
      <Box marginY={2}>
        <Divider />
      </Box>
      {onBuyPlan ? (
        <Button
          onClick={onBuyBtnClick}
          fullWidth
          variant="contained"
          size="large"
        >
          Buy
        </Button>
      ) : (
        <PayModalProcessing plan={plan} paymodalHandlers={paymodalHandlers} />
      )}
    </Box>
  );
};

export default PayModal;
