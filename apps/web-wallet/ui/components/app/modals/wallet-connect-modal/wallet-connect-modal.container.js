import { connect } from 'react-redux';
import { compose } from 'redux';
import { hideModal, walletConnect } from '../../../../store/actions';
import { getQrCodeData } from '../../../../ducks/app/app';
import withModalProps from '../../../../helpers/higher-order-components/with-modal-props';
import WalletConnect from './wallet-connect-modal.component';

const mapStateToProps = (state) => {
  const qrCodeData = getQrCodeData(state);

  return {
    qrCodeData,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    hideModal: () => dispatch(hideModal()),
    walletConnect: (data) => dispatch(walletConnect(data)),
  };
};

export default compose(
  withModalProps,
  connect(mapStateToProps, mapDispatchToProps),
)(WalletConnect);
