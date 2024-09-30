import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import Modal from '../../modal';
import withModalProps from '../../../../helpers/higher-order-components/with-modal-props';
import PaymentMethodExpanded from '../../../ui/payment-method-display/payment-method-expanded';

class PaymentMethodView extends PureComponent {
  static propTypes = {
    title: PropTypes.string,
    paymentMethod: PropTypes.object,
  };

  render() {
    const { title, paymentMethod } = this.props;

    return (
      <Modal hideFooter>
        <PaymentMethodExpanded paymentMethod={paymentMethod} title={title} />
      </Modal>
    );
  }
}

export default withModalProps(PaymentMethodView);
