import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { connect } from 'react-redux';
import * as actions from '../../../store/actions';
import isMobileView from '../../../helpers/utils/is-mobile-view';
import { getEnvironmentType } from '../../../../app/scripts/lib/util';
import { ENVIRONMENT_TYPE_POPUP } from '../../../../shared/constants/app';

// Modal Components
import AddNetworkModal from '../../../pages/onboarding-flow/add-network-modal';
import AccountDetailsModal from './account-details-modal';
import ExportPrivateKeyModal from './export-private-key-modal';
import HideTokenConfirmationModal from './hide-token-confirmation-modal';
import QRScanner from './qr-scanner';

import HoldToRevealModal from './hold-to-reveal-modal';
import ConfirmRemoveAccount from './confirm-remove-account';
import ConfirmResetAccount from './confirm-reset-account';
import TransactionConfirmed from './transaction-confirmed';

import FadeModal from './fade-modal';
import RejectTransactions from './reject-transactions';
import ConfirmDeleteMultisig from './confirm-delete-multisig';
import ConfirmDeleteNetwork from './confirm-delete-network';
import ConfirmTokenTransaction from './confirm-token-transaction';
import EditApprovalPermission from './edit-approval-permission';
import NewAccountModal from './new-account-modal';
import CustomizeNonceModal from './customize-nonce';
import ConvertTokenToNftModal from './convert-token-to-nft-modal/convert-token-to-nft-modal';
import ExchangerWillDisabled from './exchanger-will-disabled/exchanger-will-disabled';
import ConfirmationModal from './confirmation-modal';
import WalletConnectModal from './wallet-connect-modal';
import PaymentMethodView from './payment-method-view';

import MultisigAddModal from './multisig-add-modal';
import MultisigAccountDetailsModal from './multisig-account-details-modal';
import AlertModal from './alert-modal';
import ImageModal from './image-modal';
import EditSession from './edit-session';

const modalContainerBaseStyle = {
  transform: 'translate3d(-50%, 0, 0px)',
  // border: '1px solid var(--color-border-default)',
  borderRadius: '8px',
  backgroundColor: 'var(--color-background-default)',
  boxShadow: 'var(--shadow-size-sm) var(--color-shadow-default)',
  overflow: 'hidden',
};

const modalContainerLaptopStyle = {
  ...modalContainerBaseStyle,
  width: '344px',
  top: '15%',
};

const modalContainerMobileStyle = {
  ...modalContainerBaseStyle,
  width: '309px',
  top: '12.5%',
};

const modalContainerFullViewStyle = {
  ...modalContainerBaseStyle,
  width: '100%',
  top: 0,
  height: '100vh',
};

const modalContainerFullContentStyle = {
  ...modalContainerBaseStyle,
  width: '100%',
  top: '90px',
  height: 'calc(100vh - 90px)',
  borderRadius: '8px 8px 0 0',
  display: 'flex',
  flexDirection: 'column',
};

const accountModalStyle = {
  mobileModalStyle: {
    width: '95vw',
    // top: isPopupOrNotification() === 'popup' ? '52vh' : '36.5vh',
    boxShadow: 'var(--shadow-size-xs) var(--color-shadow-default)',
    borderRadius: '15px',
    transform: 'none',
    top: '5%',
    left: '0',
    right: '0',
    margin: '0 auto',
    overflowY: 'scroll',
    overflowX: 'hidden',
    maxHeight: '90%',
  },
  laptopModalStyle: {
    width: '335px',
    // top: 'calc(33% + 45px)',
    boxShadow: 'var(--shadow-size-xs) var(--color-shadow-default)',
    borderRadius: '15px',
    top: '10%',
    transform: 'none',
    left: '0',
    right: '0',
    margin: '0 auto',
  },
  contentStyle: {
    borderRadius: '15px',
  },
};

const MODALS = {
  EDIT_SESSION: {
    contents: <EditSession />,
    ...accountModalStyle,
  },
  IMAGE_MODAL: {
    contents: <ImageModal />,
    mobileModalStyle: {
      ...modalContainerMobileStyle,
      top: '50px',
      maxHeight: 'calc(100vh - 100px)',
      overflow: 'scroll',
    },
    laptopModalStyle: {
      ...modalContainerLaptopStyle,
      top: '50px',
      maxHeight: 'calc(100vh - 100px)',
      overflow: 'scroll',
    },
    contentStyle: {
      borderRadius: '8px',
    },
  },
  CONFIRMATION: {
    contents: <ConfirmationModal />,
    mobileModalStyle: {
      ...modalContainerMobileStyle,
    },
    laptopModalStyle: {
      ...modalContainerLaptopStyle,
    },
    contentStyle: {
      borderRadius: '8px',
    },
  },
  ALERT: {
    contents: <AlertModal />,
    mobileModalStyle: {
      ...modalContainerMobileStyle,
    },
    laptopModalStyle: {
      ...modalContainerLaptopStyle,
    },
    contentStyle: {
      borderRadius: '8px',
    },
  },

  CONFIRM_TOKEN_TRANSACTION: {
    contents: <ConfirmTokenTransaction />,
    mobileModalStyle: modalContainerFullContentStyle,
    laptopModalStyle: modalContainerFullContentStyle,
    contentStyle: {
      height: '100%',
      borderRadius: '8px 8px 0 0',
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
    },
    backdropStyle: {
      opacity: 0.8,
    },
  },

  ONBOARDING_ADD_NETWORK: {
    contents: <AddNetworkModal />,
    ...accountModalStyle,
  },
  NEW_ACCOUNT: {
    contents: <NewAccountModal />,
    mobileModalStyle: {
      width: '95%',
      top: '10%',
      boxShadow: 'var(--shadow-size-xs) var(--color-shadow-default)',
      transform: 'none',
      left: '0',
      right: '0',
      margin: '0 auto',
      borderRadius: '10px',
    },
    laptopModalStyle: {
      width: '375px',
      top: '10%',
      boxShadow: 'var(--shadow-size-xs) var(--color-shadow-default)',
      transform: 'none',
      left: '0',
      right: '0',
      margin: '0 auto',
      borderRadius: '10px',
    },
    contentStyle: {
      borderRadius: '10px',
    },
  },

  ACCOUNT_DETAILS: {
    contents: <AccountDetailsModal />,
    ...accountModalStyle,
  },

  EXPORT_PRIVATE_KEY: {
    contents: <ExportPrivateKeyModal />,
    ...accountModalStyle,
  },

  HOLD_TO_REVEAL_SRP: {
    contents: <HoldToRevealModal />,
    mobileModalStyle: {
      ...modalContainerMobileStyle,
    },
    laptopModalStyle: {
      ...modalContainerLaptopStyle,
    },
    contentStyle: {
      borderRadius: '8px',
    },
  },

  EXCHANGER_WILL_DISABLED: {
    contents: <ExchangerWillDisabled />,
    mobileModalStyle: {
      ...modalContainerMobileStyle,
    },
    laptopModalStyle: {
      ...modalContainerLaptopStyle,
    },
    contentStyle: {
      borderRadius: '8px',
    },
  },

  HIDE_TOKEN_CONFIRMATION: {
    contents: <HideTokenConfirmationModal />,
    mobileModalStyle: {
      width: '95%',
      top: getEnvironmentType() === ENVIRONMENT_TYPE_POPUP ? '52vh' : '36.5vh',
    },
    laptopModalStyle: {
      width:
        getEnvironmentType() === ENVIRONMENT_TYPE_POPUP ? '357px' : '449px',
      top: 'calc(33% + 45px)',
      paddingLeft:
        getEnvironmentType() === ENVIRONMENT_TYPE_POPUP ? '16px' : null,
      paddingRight:
        getEnvironmentType() === ENVIRONMENT_TYPE_POPUP ? '16px' : null,
    },
  },

  CONFIRM_RESET_ACCOUNT: {
    contents: <ConfirmResetAccount />,
    mobileModalStyle: {
      ...modalContainerMobileStyle,
    },
    laptopModalStyle: {
      ...modalContainerLaptopStyle,
    },
    contentStyle: {
      borderRadius: '8px',
    },
  },

  CONFIRM_REMOVE_ACCOUNT: {
    contents: <ConfirmRemoveAccount />,
    mobileModalStyle: {
      ...modalContainerMobileStyle,
    },
    laptopModalStyle: {
      ...modalContainerLaptopStyle,
    },
    contentStyle: {
      borderRadius: '8px',
    },
  },

  CONVERT_TOKEN_TO_NFT: {
    contents: <ConvertTokenToNftModal />,
    mobileModalStyle: {
      ...modalContainerMobileStyle,
    },
    laptopModalStyle: {
      ...modalContainerLaptopStyle,
    },
    contentStyle: {
      borderRadius: '8px',
    },
  },

  WALLET_CONNECT_MODAL: {
    contents: <WalletConnectModal />,

    mobileModalStyle: {
      ...modalContainerMobileStyle,
    },
    laptopModalStyle: {
      ...modalContainerLaptopStyle,
    },
    contentStyle: {
      borderRadius: '8px',
    },
  },

  CONFIRM_DELETE_MULTISIG: {
    contents: <ConfirmDeleteMultisig />,
    mobileModalStyle: {
      ...modalContainerMobileStyle,
    },
    laptopModalStyle: {
      ...modalContainerLaptopStyle,
    },
    contentStyle: {
      borderRadius: '8px',
    },
  },

  CONFIRM_DELETE_NETWORK: {
    contents: <ConfirmDeleteNetwork />,
    mobileModalStyle: {
      ...modalContainerMobileStyle,
    },
    laptopModalStyle: {
      ...modalContainerLaptopStyle,
    },
    contentStyle: {
      borderRadius: '8px',
    },
  },

  EDIT_APPROVAL_PERMISSION: {
    contents: <EditApprovalPermission />,
    mobileModalStyle: {
      width: '95vw',
      height: '100vh',
      top: '50px',
      transform: 'none',
      left: '0',
      right: '0',
      margin: '0 auto',
    },
    laptopModalStyle: {
      width: 'auto',
      height: '0px',
      top: '80px',
      left: '0px',
      transform: 'none',
      margin: '0 auto',
      position: 'relative',
    },
    contentStyle: {
      borderRadius: '8px',
    },
  },

  TRANSACTION_CONFIRMED: {
    disableBackdropClick: true,
    contents: <TransactionConfirmed />,
    mobileModalStyle: {
      ...modalContainerMobileStyle,
    },
    laptopModalStyle: {
      ...modalContainerLaptopStyle,
    },
    contentStyle: {
      borderRadius: '8px',
    },
  },

  QR_SCANNER: {
    contents: <QRScanner />,
    mobileModalStyle: {
      ...modalContainerMobileStyle,
    },
    laptopModalStyle: {
      ...modalContainerLaptopStyle,
    },
    contentStyle: {
      borderRadius: '8px',
    },
  },

  REJECT_TRANSACTIONS: {
    contents: <RejectTransactions />,
    mobileModalStyle: {
      ...modalContainerMobileStyle,
    },
    laptopModalStyle: {
      ...modalContainerLaptopStyle,
    },
    contentStyle: {
      borderRadius: '8px',
    },
  },

  CUSTOMIZE_NONCE: {
    contents: <CustomizeNonceModal />,
    mobileModalStyle: {
      ...modalContainerMobileStyle,
    },
    laptopModalStyle: {
      ...modalContainerLaptopStyle,
    },
    contentStyle: {
      borderRadius: '8px',
    },
  },

  MULTISIG_ADD: {
    contents: <MultisigAddModal />,
    ...accountModalStyle,
  },

  MULTISIG_ACCOUNT_DETAILS: {
    contents: <MultisigAccountDetailsModal />,
    ...accountModalStyle,
  },

  PAYMENT_METHOD_VIEW: {
    contents: <PaymentMethodView />,
    ...accountModalStyle,
  },

  DEFAULT: {
    contents: [],
    mobileModalStyle: {},
    laptopModalStyle: {},
  },
};

const BACKDROP_STYLE = {
  backgroundColor: 'var(--color-overlay-default)',
};

function mapStateToProps(state) {
  return {
    active: state.appState.modal.open,
    modalState: state.appState.modal.modalState,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    hideModal: (customOnHideOpts) => {
      dispatch(actions.hideModal());
      if (customOnHideOpts && customOnHideOpts.action) {
        dispatch(customOnHideOpts.action(...customOnHideOpts.args));
      }
    },
    hideWarning: () => {
      dispatch(actions.hideWarning());
    },
  };
}

class Modal extends Component {
  static propTypes = {
    active: PropTypes.bool.isRequired,
    hideModal: PropTypes.func.isRequired,
    hideWarning: PropTypes.func.isRequired,
    modalState: PropTypes.object.isRequired,
  };

  hide() {
    this.modalRef.hide();
  }

  show() {
    this.modalRef.show();
  }

  UNSAFE_componentWillReceiveProps(nextProps, _) {
    if (nextProps.active) {
      this.show();
    } else if (this.props.active) {
      this.hide();
    }
  }

  render() {
    const modal = MODALS[this.props.modalState.name || 'DEFAULT'];
    const {
      contents: children,
      disableBackdropClick = false,
      backdropStyle = {},
    } = modal;
    const modalStyle =
      modal[isMobileView() ? 'mobileModalStyle' : 'laptopModalStyle'];
    const contentStyle = modal.contentStyle || {};

    return (
      <FadeModal
        keyboard={false}
        onHide={() => {
          if (modal.onHide) {
            modal.onHide({
              hideWarning: this.props.hideWarning,
            });
          }
          this.props?.modalState?.props?.onHide?.();
          this.props.hideModal(modal.customOnHideOpts);
        }}
        ref={(ref) => {
          this.modalRef = ref;
        }}
        modalStyle={modalStyle}
        contentStyle={contentStyle}
        backdropStyle={{ ...BACKDROP_STYLE, ...backdropStyle }}
        closeOnClick={!disableBackdropClick}
      >
        {children}
      </FadeModal>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Modal);
