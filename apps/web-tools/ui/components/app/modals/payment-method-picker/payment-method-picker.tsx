import '../styles.scss';

import { Box, Modal } from '@mui/material';

import { UserPaymentMethod } from '../../../../../app/types/dextrade';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import PaymentMethods from '../../payment-methods';

interface IProps {
  value?: UserPaymentMethod;
  currency: string;
  onSelect: (paymentMethod: UserPaymentMethod) => void;
  onClose: () => void;
}

export const PaymentMethodPicker = ({
  value,
  currency,
  onSelect,
  onClose,
}: IProps) => {
  // const t = useI18nContext();
  return (
    <Modal open onClose={onClose}>
      <Box
        sx={{ bgcolor: 'background.default' }}
        className="modal-generic"
        padding={2}
      >
        <PaymentMethods value={value} currency={currency} onSelect={onSelect} />
      </Box>
    </Modal>
  );
};
