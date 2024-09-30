import { connect } from 'react-redux';
import { assetModel, getNoGasPriceFetched } from '../../../selectors';
import {
  getIsBalanceInsufficient,
  getAssetError,
  getRecipient,
  acknowledgeRecipientWarning,
  getRecipientWarningAcknowledgement,
  getCurrentDraftTransaction,
} from '../../../ducks/send';
import SendContent from './send-content.component';

function mapStateToProps(state) {
  const recipient = getRecipient(state);
  const recipientWarningAcknowledged =
    getRecipientWarningAcknowledgement(state);
  const txData = getCurrentDraftTransaction(state);
  const sendAsset = assetModel(state, txData.asset);

  return {
    isEthGasPrice: false,
    noGasPrice: getNoGasPriceFetched(state),
    networkOrAccountNotSupports1559: !txData.eip1559support,
    getIsBalanceInsufficient: getIsBalanceInsufficient(state),
    txData,
    assetError: getAssetError(state),
    recipient,
    recipientWarningAcknowledged,
    sendAsset,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    acknowledgeRecipientWarning: () => dispatch(acknowledgeRecipientWarning()),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SendContent);
