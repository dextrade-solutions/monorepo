import { NetworkNames, NetworkTypes } from 'dex-helpers';
import React from 'react';

export type ModalState = {
  name?: string;
  props: Record<string, any>;
};

export type ModalData = {
  open: boolean;
  modalState: ModalState;
};

export type ModalProps = ModalState & {
  hideModal: (callback?: () => void) => void;
};

export type PaymodalHandlers = {
  updateServerBalances?: () => Promise<void>;
  onChooseAsset?: (params: {
    to: string;
    amount: number;
    networkType: NetworkTypes;
    networkName: NetworkNames;
    currency: string;
  }) => string;
};

export type ShowModalArgs = {
  name?: string;
} & Record<string, any>;

export type ModalContext = {
  showModal: (args: ShowModalArgs) => void;
  hideModal: () => void;
  store: any;
};
