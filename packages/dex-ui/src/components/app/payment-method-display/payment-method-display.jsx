import { Box, Button, Typography } from '@mui/material';
import { getStrPaymentMethodInstance } from 'dex-helpers';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { Icon } from '../../ui';
import PaymentMethodPreview from '../modals/payment-method-preview';
import PaymentMethodExpanded from '../payment-method-expanded';

export default function PaymentMethodDisplay({
  title,
  paymentMethod,
  expanded,
  ...args
}) {
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);

  return (
    <>
      {showPaymentMethodModal && (
        <PaymentMethodPreview
          title={title}
          paymentMethod={paymentMethod}
          onClose={() => setShowPaymentMethodModal(false)}
        />
      )}
      <Box {...args}>
        {expanded ? (
          <PaymentMethodExpanded title={title} paymentMethod={paymentMethod} />
        ) : (
          <Box display="flex">
            <Typography className="flex-grow">{title}</Typography>
            <Button
              type="inline"
              onClick={() => setShowPaymentMethodModal(true)}
            >
              <Box display="flex">
                {getStrPaymentMethodInstance(paymentMethod)}
                <Icon marginLeft={1} name="eye" />
              </Box>
            </Button>
          </Box>
        )}
      </Box>
    </>
  );
}

PaymentMethodDisplay.propTypes = {
  title: PropTypes.string,
  paymentMethod: PropTypes.object,
  expanded: PropTypes.bool,
};
