import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import Box from '../box';
import { ICON_NAMES, Icon, Text } from '../../component-library';
import { DISPLAY } from '../../../helpers/constants/design-system';
import Button from '../button';
import { showModal } from '../../../store/actions';
import { getStrPaymentMethodInstance } from '../../../../shared/lib/payment-methods-utils';
import PaymentMethodExpanded from './payment-method-expanded';

export default function PaymentMethodDisplay({
  title,
  paymentMethod,
  expanded,
  ...args
}) {
  const dispatch = useDispatch();

  const showModalExpandView = () => {
    dispatch(
      showModal({
        name: 'PAYMENT_METHOD_VIEW',
        title,
        paymentMethod,
      }),
    );
  };

  return (
    <Box {...args}>
      {expanded ? (
        <PaymentMethodExpanded title={title} paymentMethod={paymentMethod} />
      ) : (
        <Box display={DISPLAY.FLEX}>
          <Text className="flex-grow">{title}</Text>
          <Button type="inline" onClick={showModalExpandView}>
            <Box display={DISPLAY.FLEX}>
              {getStrPaymentMethodInstance(paymentMethod)}
              <Icon marginLeft={1} name={ICON_NAMES.EYE} />
            </Box>
          </Button>
        </Box>
      )}
    </Box>
  );
}

PaymentMethodDisplay.propTypes = {
  title: PropTypes.string,
  paymentMethod: PropTypes.object,
  expanded: PropTypes.bool,
};
