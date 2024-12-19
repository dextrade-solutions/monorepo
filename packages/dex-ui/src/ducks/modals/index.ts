import React from 'react';
import { createSlice } from '@reduxjs/toolkit';

export interface ModalState {
  modal: {
    open: boolean;
    modalState: {
      name: string | null;
      props: Record<string, any>;
    };
  };
  extended?: Record<string, React.ReactNode>;
}

const initialState: ModalState = {
  modal: {
    open: false,
    modalState: {
      name: null,
      props: {},
    },
  },
};

const slice = createSlice({
  name: 'modals',
  initialState,
  reducers: () => ({
    clearAppState: () => initialState,
    showModal: (
      state: unknown,
      action: { payload: { [x: string]: any; name: any } },
    ) => {
      const { name, ...modalProps } = action.payload;

      state.modal = {
        open: true,
        modalState: {
          name,
          props: { ...modalProps },
        },
        // previousModalState: { ...state.modal.modalState },
      };
    },
    hideModal: (state: unknown) => {
      state.modal = {
        open: false,
        modalState: {
          name: null,
          props: {},
        },
        // previousModalState: { ...state.modal.modalState },
      };
    },
  }),
});

const { actions, reducer } = slice;

const { showModal, hideModal } = actions;

export const getModalState = (state: { modals: ModalState }) => {
  return state.modals.modal;
};

export { showModal, hideModal };

export default reducer;
