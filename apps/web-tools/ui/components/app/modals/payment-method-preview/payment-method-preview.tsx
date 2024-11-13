import '../styles.scss';
import { Box, Modal } from '@mui/material';
import { UserPaymentMethod } from 'dex-helpers/types';
import { PaymentMethodExpanded } from 'dex-ui';
import React from 'react';

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
        <PaymentMethodExpanded title={title} paymentMethod={paymentMethod} />
      </Box>
    </Modal>
  );
};
