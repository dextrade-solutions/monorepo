import { createSlice } from '@reduxjs/toolkit';

interface AppState {
  modal: {
    open: boolean;
    modalState: {
      name: string | null;
      props: Record<string, any>;
    };
  };
}

const initialState: AppState = {
  modal: {
    open: false,
    modalState: {
      name: null,
      props: {},
    },
  },
};

const slice = createSlice({
  name: 'app',
  initialState,
  reducers: () => ({
    clearAppState: () => initialState,

    showModal: (state, action) => {
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
    hideModal: (state) => {
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

export { showModal, hideModal };

export default reducer;
