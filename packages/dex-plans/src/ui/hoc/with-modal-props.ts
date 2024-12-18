import { connect } from 'react-redux';

import { hideModal } from '../ducks/app/app';
import { AppDispatch, RootState } from '../store/store';

const mapStateToProps = (state: RootState) => {
  const { app } = state;
  const { props: modalProps } = app.modal.modalState;

  return {
    ...modalProps,
  };
};

const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    hideModal: () => dispatch(hideModal()),
  };
};

export default function withModalProps(Component) {
  return connect(mapStateToProps, mapDispatchToProps)(Component);
}
