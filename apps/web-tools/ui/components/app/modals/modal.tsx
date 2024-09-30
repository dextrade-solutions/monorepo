import './styles.scss';

import { Box, Modal as ModalMui } from '@mui/material';
import { Component } from 'react';
import { connect } from 'react-redux';

import AlertModalComponent from './alert-modal';
import ImageModalComponent from './image-modal';
import TradeHistoryRow from './trade-history-row-modal';
import { ModalData } from './types';
import { hideModal } from '../../../ducks/app/app';
import { AppDispatch, RootState } from '../../../store/store';

const MODALS = {
  ALERT_MODAL: <AlertModalComponent />,
  TRADE_HISTORY_ROW: <TradeHistoryRow />,
  IMAGE_MODAL: <ImageModalComponent />,
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
        <Box sx={{ bgcolor: 'background.default' }} className="modal-generic">{modal}</Box>
      </ModalMui>
    );
  }
}

const WrappedModal = connect(mapStateToProps, mapDispatchToProps)(Modal);

export default WrappedModal;
