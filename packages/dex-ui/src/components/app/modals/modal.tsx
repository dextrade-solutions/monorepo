import './styles.scss';

import { Box, Modal as ModalMui } from '@mui/material';
import React, { createContext, useContext, useState } from 'react';

import AlertModalComponent from './alert-modal';
import ImageModalComponent from './image-modal';
import ItemPicker from './item-picker';
import PayModal from './pay-modal';
import SetPaymentMethod from './set-payment-method';
import SlippageModal from './slippage-modal';

export const MODAL_TYPES = {
  CREATE_MODAL: 'CREATE_MODAL',
  DELETE_MODAL: 'DELETE_MODAL',
  UPDATE_MODAL: 'UPDATE_MODAL',
};

const MODAL_COMPONENTS = {
  ALERT_MODAL: AlertModalComponent,
  IMAGE_MODAL: ImageModalComponent,
  SET_PAYMENT_METHOD: SetPaymentMethod,
  ITEM_PICKER: ItemPicker,
  SLIPPAGE_MODAL: SlippageModal,
  PAY_MODAL: PayModal,
  DEFAULT: null,
};
type ContextType = {
  showModal: (modalType: string, modalProps?: any) => void;
  hideModal: () => void;
  store: any;
};

export interface ModalState {
  open: boolean;
  modalState: {
    name: string | null;
    props: Record<string, any>;
  };
}

const initalState: ContextType = {
  showModal: () => {},
  hideModal: () => {},
  store: {
    open: false,
    modalState: {
      name: null,
      props: {},
    },
  },
};

const GlobalModalContext = createContext(initalState);
export const useGlobalModalContext = () => useContext(GlobalModalContext);

export const ModalProvider = ({ children, modals }) => {
  const [store, setStore] = useState<ModalState>(initalState.store);

  const showModal = (newState: ModalState['modalState']) => {
    setStore({
      ...store,
      ...{
        open: true,
        modalState: newState,
      },
    });
  };

  const hideModal = () => {
    setStore(initalState.store);
  };

  const renderComponent = () => {
    const allModals = {
      ...MODAL_COMPONENTS,
      ...modals,
    };
    const ModalComponent = allModals[store.modalState.name];
    if (!ModalComponent) {
      return null;
    }
    console.info(store);
    return (
      <ModalMui
        key={store.modalState.name}
        open={store.open}
        onClose={() => hideModal()}
      >
        <Box sx={{ bgcolor: 'background.default' }} className="modal-generic">
          <ModalComponent id="global-modal" {...store.modalState.props} />;
        </Box>
      </ModalMui>
    );
  };

  return (
    <GlobalModalContext.Provider value={{ store, showModal, hideModal }}>
      {renderComponent()}
      {children}
    </GlobalModalContext.Provider>
  );
};

export default ModalProvider;
