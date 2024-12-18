import './styles.scss';

import { Box, Modal as ModalMui } from '@mui/material';
import { Component } from 'react';
import { connect } from 'react-redux';

import AlertModalComponent from './alert-modal';
import ImageModalComponent from './image-modal';
import ItemPicker from './item-picker';
import PayModal from './pay-modal';
import SetPaymentMethod from './set-payment-method';
import SlippageModal from './slippage-modal';
import { hideModal, ModalState } from '../../../ducks/modals';

const MODALS = {
  ALERT_MODAL: <AlertModalComponent />,
  IMAGE_MODAL: <ImageModalComponent />,
  SET_PAYMENT_METHOD: <SetPaymentMethod />,
  ITEM_PICKER: <ItemPicker />,
  SLIPPAGE_MODAL: <SlippageModal />,
  PAY_MODAL: <PayModal />,
  DEFAULT: null,
};

function mapStateToProps(state: { modals: ModalState }) {
  return {
    modal: state.modals.modal,
  };
}

function mapDispatchToProps(dispatch: () => void) {
  return {
    hideModal: (callback?: () => void) => {
      dispatch(hideModal());
      callback && callback();
    },
  };
}

class Modal extends Component<ModalState> {
  static defaultProps = {
    extended: {}, // you can pass app-specific modals
  };

  render() {
    const allModals = {
      ...MODALS,
      ...this.props.extended,
    };
    const modal = allModals[this.props.modal.modalState.name || 'DEFAULT'];

    return (
      <ModalMui
        open={this.props.modal.open}
        onClose={() =>
          this.props.hideModal(this.props.modal.modalState.props.onClose)
        }
      >
        <Box sx={{ bgcolor: 'background.default' }} className="modal-generic">
          {modal}
        </Box>
      </ModalMui>
    );
  }
}

const WrappedModal = connect(mapStateToProps, mapDispatchToProps)(Modal);

export default WrappedModal;
