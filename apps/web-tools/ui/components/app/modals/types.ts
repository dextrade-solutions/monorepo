export type ModalState = {
  name: string | null;
  props: Record<string, any>;
};

export type ModalData = {
  open: boolean;
  modalState: ModalState;
};

export type ModalProps = ModalState & { hideModal: () => void };
