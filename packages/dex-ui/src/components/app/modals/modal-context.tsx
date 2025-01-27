import { createContext, useContext } from 'react';

import AlertModalComponent from './alert-modal';
import AssetSelect from './asset-select';
import BuyPlan from './buy-plan';
import ConfirmModal from './confirm-modal';
import ImageModalComponent from './image-modal';
import ItemPicker from './item-picker';
import PayModal from './pay-modal';
import SetPaymentMethod from './set-payment-method';
import SlippageModal from './slippage-modal';
import { ModalContext } from './types';

export const MODAL_COMPONENTS = {
  ALERT_MODAL: AlertModalComponent,
  IMAGE_MODAL: ImageModalComponent,
  SET_PAYMENT_METHOD: SetPaymentMethod,
  ITEM_PICKER: ItemPicker,
  SLIPPAGE_MODAL: SlippageModal,
  PAY_MODAL: PayModal,
  BUY_PLAN: BuyPlan,
  CONFIRM_MODAL: ConfirmModal,
  ASSET_SELECT: AssetSelect,
  DEFAULT: null,
};

export const initalState: ModalContext = {
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

export const GlobalModalContext = createContext(initalState);
export const useGlobalModalContext = () => useContext(GlobalModalContext);
