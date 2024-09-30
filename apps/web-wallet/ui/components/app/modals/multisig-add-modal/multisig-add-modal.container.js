import { connect } from 'react-redux';
import { compose } from 'redux';
import { hideModal, multisignAdd } from '../../../../store/actions';
import withModalProps from '../../../../helpers/higher-order-components/with-modal-props';
import MultisigAddModal from './multisig-add-modal.component';

const mapStateToProps = (state, { token }) => {
  return {
    // chainId: getCurrentChainId(state),
    // selectedIdentity: getSelectedIdentity(state),
    // accountAddress: getAccountAddressByProvider(state, token.provider),
    // keyrings: state.metamask.keyrings,
    // rpcPrefs: getRpcPrefsForCurrentProvider(state),
    // blockExplorerLinkText: getBlockExplorerLinkText(state, true),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    hideModal: () => {
      dispatch(hideModal());
    },
    submit: (multisignId) => dispatch(multisignAdd(multisignId)),
  };
};

export default compose(
  withModalProps,
  connect(mapStateToProps, mapDispatchToProps),
)(MultisigAddModal);
