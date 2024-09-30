import '../styles.scss';
import { Box, Modal } from '@mui/material';
import React from 'react';

import { UserPaymentMethod } from '../../../../../app/types/dextrade';
import PaymentMethodExpanded from '../../../ui/payment-method-display/payment-method-expanded';

interface IProps {
  title: string;
  paymentMethod: UserPaymentMethod;
  onClose: () => void;
}

export const PaymentMethodPreview: React.FC<IProps> = ({
  title,
  paymentMethod,
  onClose,
}) => {
  return (
    <Modal open onClose={onClose}>
      <Box
        sx={{ bgcolor: 'background.default' }}
        className="modal-generic"
        padding={2}
      >
        <PaymentMethodExpanded title={title} paymentMethod={paymentMethod} />
      </Box>
    </Modal>
  );
};
