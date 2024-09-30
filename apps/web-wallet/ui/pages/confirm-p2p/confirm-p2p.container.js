import { connect } from 'react-redux';
import { compose } from 'redux';
import { withRouter } from 'react-router-dom';
import {
  cancelTx,
  exchangerRejectExchange,
  exchangerReserve,
  updateAndApproveTransaction,
} from '../../store/actions';
import {
  ExchangeP2PStatus,
  ExchangerType,
} from '../../../shared/constants/exchanger';
import { assetModel } from '../../selectors';
import ConfirmP2P from './confirm-p2p.component';

const mapStateToProps = (state) => {
  const { confirmTransaction: { txData } = {} } = state;

  if (txData.source && txData.destination) {
    const isReserveConfirmation =
      txData.exchangerSettings.status === ExchangeP2PStatus.waitExchangerVerify;

    const isWaitExchangerTransfer =
      txData.exchangerSettings.status ===
      ExchangeP2PStatus.waitExchangerTransfer;
    return {
      txData,
      isReserveConfirmation,
      isWaitExchangerTransfer,
      fromAsset: assetModel(state, txData.source),
      toAsset: assetModel(state, txData.destination),
    };
  }
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return {
    reserveAccept: (txData) =>
      dispatch(
        exchangerReserve({
          id: txData.exchangerSettings.exchangeId,
          isConfirmed: true,
        }),
      ),
    reserveCancel: async (txData) =>
      await dispatch(
        exchangerReserve({
          id: txData.exchangerSettings.exchangeId,
          isConfirmed: false,
        }),
      ),
    rejectExchange: async (txData) => {
      if (txData.exchangerType === ExchangerType.P2PExchanger) {
        await dispatch(
          exchangerRejectExchange(txData.exchangerSettings.exchangeId),
        );
      } else {
        dispatch(cancelTx(txData));
      }
    },
    updateAndApproveTransaction: (txData) =>
      dispatch(updateAndApproveTransaction(txData)),
  };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { isReserveConfirmation } = stateProps;
  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    sendTransaction: isReserveConfirmation
      ? dispatchProps.reserveAccept
      : dispatchProps.updateAndApproveTransaction,
    cancelTransaction: isReserveConfirmation
      ? dispatchProps.reserveCancel
      : dispatchProps.rejectExchange,
  };
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps, mergeProps),
)(ConfirmP2P);
