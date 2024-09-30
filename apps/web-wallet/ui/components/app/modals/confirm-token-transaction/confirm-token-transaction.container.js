import { connect } from 'react-redux';
import { compose } from 'redux';
import withModalProps from '../../../../helpers/higher-order-components/with-modal-props';
import { hideModal } from '../../../../store/actions';
import ConfirmTokenTransaction from './confirm-token-transaction.component';

const mapStateToProps = (state) => {
  const modalStateProps = state.appState.modal.modalState.props || {};
  const { txId, ...restProps } = modalStateProps;
  return {
    txId,
    ...restProps,
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
)(ConfirmTokenTransaction);
