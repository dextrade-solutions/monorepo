import { connect } from 'react-redux';
import { compose } from 'redux';
import withModalProps from '../../../../helpers/higher-order-components/with-modal-props';
import { hideModal } from '../../../../store/actions';
import ConfirmDeleteMultisig from './confirm-delete-multisign.component';

const mapDispatchToProps = (dispatch) => {
  return {
    hideModal: () => {
      dispatch(hideModal());
    },
  };
};

export default compose(
  withModalProps,
  connect(null, mapDispatchToProps),
)(ConfirmDeleteMultisig);
