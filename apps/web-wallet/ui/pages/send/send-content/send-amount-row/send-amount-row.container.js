import { connect } from 'react-redux';
import {
  updateSendAmount,
  getSendAmount,
  sendAmountIsInError,
  getSendAsset,
} from '../../../../ducks/send';
import { assetModel } from '../../../../selectors';
import SendAmountRow from './send-amount-row.component';

export default connect(mapStateToProps, mapDispatchToProps)(SendAmountRow);

function mapStateToProps(state) {
  const asset = getSendAsset(state);
  return {
    amount: getSendAmount(state),
    inError: sendAmountIsInError(state),
    asset: assetModel(state, asset),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateSendAmount: (newAmount) => dispatch(updateSendAmount(newAmount)),
  };
}
