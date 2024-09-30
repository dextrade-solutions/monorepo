import { connect } from 'react-redux';
import { getNftContracts, getNfts } from '../../../../ducks/metamask/metamask';
import { assetModel, getMetaMaskAccounts } from '../../../../selectors';
import { updateSendAsset, getSendAsset } from '../../../../ducks/send';
import SendAssetRow from './send-asset-row.component';

function mapStateToProps(state) {
  const sendAsset = getSendAsset(state);
  const assetInstance = assetModel(state, sendAsset);
  const props = {
    tokens: state.metamask.tokens,
    selectedAddress: state.metamask.selectedAddress,
    nfts: getNfts(state),
    collections: getNftContracts(state),
    sendAsset,
    accounts: getMetaMaskAccounts(state),
    assetInstance,
  };
  return props;
}

function mapDispatchToProps(dispatch) {
  return {
    updateSendAsset: ({ type, details }) =>
      dispatch(updateSendAsset({ type, details })),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SendAssetRow);
