import { connect } from 'react-redux';

import { hideModal, ModalState } from '../../../ducks/modals';

const mapStateToProps = (state: { modals: ModalState }) => {
  const { modals } = state;
  const { props: modalProps } = modals.modal.modalState;

  return {
    ...modalProps,
  };
};

// TODO: add correct type
const mapDispatchToProps = (dispatch: () => void) => {
  return {
    hideModal: (callback?: () => void) => {
      dispatch(hideModal());
      callback && callback();
    },
  };
};

export default function withModalProps(Component) {
  return connect(mapStateToProps, mapDispatchToProps)(Component);
}
