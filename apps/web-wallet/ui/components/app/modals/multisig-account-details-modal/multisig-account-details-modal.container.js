import { connect } from 'react-redux';
import { compose } from 'redux';
import { hideModal } from '../../../../store/actions';
import {
  getSelectedIdentity,
  getRpcPrefsForCurrentProvider,
  getCurrentChainId,
  getBlockExplorerLinkText,
} from '../../../../selectors';
import withModalProps from '../../../../helpers/higher-order-components/with-modal-props';
import AccountDetailsModal from './multisig-account-details-modal.component';

const mapStateToProps = (state, { token }) => {
  return {
    chainId: getCurrentChainId(state),
    selectedIdentity: getSelectedIdentity(state),
    // TODO: Use - assetInstance.account
    // accountAddress: getAccountAddressByProvider(state, token.provider),
    rpcPrefs: getRpcPrefsForCurrentProvider(state),
    blockExplorerLinkText: getBlockExplorerLinkText(state, true),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    hideModal: () => {
      dispatch(hideModal());
    },
  };
};

export default compose(
  withModalProps,
  connect(mapStateToProps, mapDispatchToProps),
)(AccountDetailsModal);
