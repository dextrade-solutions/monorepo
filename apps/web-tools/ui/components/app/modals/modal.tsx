import './styles.scss';

import { Box, Modal as ModalMui } from '@mui/material';
import { Component } from 'react';
import { connect } from 'react-redux';

import AlertModalComponent from './alert-modal';
import ImageModalComponent from './image-modal';
import ItemPicker from './item-picker';
import LoginModal from './login-modal';
import SetPaymentMethod from './set-payment-method';
import SetWallet from './set-wallet';
import SlippageModal from './slippage-modal';
import TradeHistoryRow from './trade-history-row-modal';
import { ModalData } from './types';
import WalletsList from './wallets-list';
import { hideModal } from '../../../ducks/app/app';
import { AppDispatch, RootState } from '../../../store/store';

const MODALS = {
  ALERT_MODAL: <AlertModalComponent />,
  TRADE_HISTORY_ROW: <TradeHistoryRow />,
  IMAGE_MODAL: <ImageModalComponent />,
  SET_WALLET: <SetWallet />,
  SET_PAYMENT_METHOD: <SetPaymentMethod />,
  ITEM_PICKER: <ItemPicker />,
  LOGIN_MODAL: <LoginModal />,
  SLIPPAGE_MODAL: <SlippageModal />,
  WALLETS_LIST: <WalletsList />,
  DEFAULT: null,
};

function mapStateToProps(state: RootState) {
  return {
    modal: state.app.modal,
  };
}

function mapDispatchToProps(dispatch: AppDispatch) {
  return {
    hideModal: () => {
      dispatch(hideModal());
    },
  };
}

type ModalState = {
  hideModal: () => void;
  modal: ModalData;
};

class Modal extends Component<ModalState> {
  render() {
    const modal = MODALS[this.props.modal.modalState.name || 'DEFAULT'];

    return (
      <ModalMui open={this.props.modal.open} onClose={this.props.hideModal}>
        <Box sx={{ bgcolor: 'background.default' }} className="modal-generic">
          {modal}
        </Box>
      </ModalMui>
    );
  }
}

const WrappedModal = connect(mapStateToProps, mapDispatchToProps)(Modal);

export default WrappedModal;
