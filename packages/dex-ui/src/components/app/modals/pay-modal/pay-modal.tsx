import { Button, AlertProps, Box, Divider, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { formatCurrency } from 'dex-helpers';
import { Tariff } from 'dex-helpers/types';
import { paymentService } from 'dex-services';
import { useTranslation } from 'react-i18next';

import { ModalProps, PaymodalHandlers } from '../types';
import { PayModalProcessing } from './pay-modal-processing';
import { ButtonIcon } from '../../../ui';
import { useGlobalModalContext } from '../modal-context';

function extractUID(url: string): string | null {
  const regex = /\/pay\/([a-f0-9-]+)$/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

const PayModal = ({
  plan,
  hideModal,
  onBuyPlan,
  paymodalHandlers,
}: {
  plan: Tariff;
  paymodalHandlers?: PaymodalHandlers;
  onBuyPlan?: (plan: Tariff, invoiceId: string) => void;
} & ModalProps &
  AlertProps) => {
  const { t } = useTranslation();
  const { showModal } = useGlobalModalContext();
  const createInvoice = useMutation<{ id: string }, unknown, number>({
    mutationFn: (tariffId) =>
      paymentService.createInvoice({
        tariffId,
        currency: 'ETH',
        amount: 1,
      }),
    onSuccess: (response) => {
      const uid = extractUID(response.data.payment_page_url);
      onBuyPlan && onBuyPlan(plan, uid);
      hideModal();
    },
    onError: (e) => {
      showModal({
        name: 'ALERT_MODAL',
        severity: 'error',
        text: e.message,
      });
    },
  });

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
          onClick={() => createInvoice.mutate(plan.id)}
          fullWidth
          variant="contained"
          size="large"
          disabled={createInvoice.isPending}
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
