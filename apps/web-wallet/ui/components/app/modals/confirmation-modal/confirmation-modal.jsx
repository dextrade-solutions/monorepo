import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import Modal, { ModalContent } from '../../modal';
import withModalProps from '../../../../helpers/higher-order-components/with-modal-props';

const BASE_CLASS = 'loading-heartbeat';
const LOADING_CLASS = `${BASE_CLASS}--active`;

class ConfirmationModal extends PureComponent {
  static propTypes = {
    hideModal: PropTypes.func,
    callback: PropTypes.func,
    title: PropTypes.string,
    description: PropTypes.string,
    modalProps: PropTypes.shape({
      contentClass: PropTypes.string,
      containerClass: PropTypes.string,
      // Header text
      headerText: PropTypes.string,
      onClose: PropTypes.func,
      // Submit button (right button)
      onSubmit: PropTypes.func,
      submitType: PropTypes.string,
      submitText: PropTypes.string,
      submitDisabled: PropTypes.bool,
      hideFooter: PropTypes.bool,
      // Cancel button (left button)
      onCancel: PropTypes.func,
      cancelType: PropTypes.string,
      cancelText: PropTypes.string,
    }),
  };

  state = {
    loading: false,
  };

  render() {
    const { title, description, modalProps = {} } = this.props;

    return (
      <Modal
        onSubmit={async () => {
          this.setState({
            loading: true,
          });
          await this.props.callback();
          this.setState({
            loading: false,
          });
          this.props.hideModal();
        }}
        onCancel={this.props.hideModal}
        {...modalProps}
        hideFooter={this.state.loading}
      >
        <div
          className={classNames('loading-heartbeat', {
            [LOADING_CLASS]: this.state.loading,
          })}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        ></div>
        <ModalContent title={title} description={description} />
      </Modal>
    );
  }
}

export default withModalProps(ConfirmationModal);
