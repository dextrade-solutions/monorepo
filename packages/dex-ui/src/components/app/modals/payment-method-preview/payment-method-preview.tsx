import { Box, Modal } from '@mui/material';
import { UserPaymentMethod } from 'dex-helpers/types';
import React from 'react';

import PaymentMethodExpanded from '../../payment-method-expanded';

interface IProps {
  title: string;
  paymentMethod: UserPaymentMethod;
  onClose: () => void;
}

export const PaymentMethodPreview = ({
  title,
  paymentMethod,
  onClose,
}: IProps) => {
  return (
    <Modal open onClose={onClose}>
      <Box
        sx={{ bgcolor: 'background.default' }}
        className="modal-generic"
        padding={2}
      >
        <PaymentMethodExpanded
          title={title}
          fields={paymentMethod.paymentMethod.fields}
          name={paymentMethod.paymentMethod.name}
        />
      </Box>
    </Modal>
  );
};
