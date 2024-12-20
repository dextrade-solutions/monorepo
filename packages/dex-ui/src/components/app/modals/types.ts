import { NetworkNames, NetworkTypes } from 'dex-helpers';

export type ModalState = {
  name: string | null;
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
  onChooseAsset?: (
    params: {
      to: string;
      amount: number;
      networkType: NetworkTypes;
      networkName: NetworkNames;
      currency: string;
    },
    { successCallback }: { successCallback: () => void },
  ) => void;
};
