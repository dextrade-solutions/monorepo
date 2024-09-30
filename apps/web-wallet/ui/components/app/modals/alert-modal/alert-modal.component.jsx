import React from 'react';
import PropTypes from 'prop-types';
import Modal, { ModalContent } from '../../modal';

const AlertModal = (props, context) => {
  const { t } = context;
  const { hideModal, text } = props;

  return (
    <Modal onSubmit={() => hideModal()} submitText={t('tryAgain')}>
      <ModalContent description={text} />
    </Modal>
  );
};

AlertModal.contextTypes = {
  t: PropTypes.func,
};

AlertModal.propTypes = {
  hideModal: PropTypes.func,
  text: PropTypes.string.isRequired,
};

export default AlertModal;
