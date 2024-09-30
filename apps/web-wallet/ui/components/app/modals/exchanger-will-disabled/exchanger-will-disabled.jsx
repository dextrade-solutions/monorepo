import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import Modal, { ModalContent } from '../../modal';
import withModalProps from '../../../../helpers/higher-order-components/with-modal-props';

class ExchangerWillDisabled extends PureComponent {
  static propTypes = {
    hideModal: PropTypes.func,
    callback: PropTypes.func,
  };

  static contextTypes = {
    t: PropTypes.func,
  };

  render() {
    const { t } = this.context;
    return (
      <Modal
        onSubmit={() => {
          this.props.callback();
          this.props.hideModal();
        }}
        onCancel={this.props.hideModal}
        submitText={t('continue')}
        cancelText={t('cancel')}
      >
        <ModalContent
          title={t('exchangerWillDisbaled')}
          description={t('exchangerWillDisbaledDescription')}
        />
      </Modal>
    );
  }
}

export default withModalProps(ExchangerWillDisabled);
