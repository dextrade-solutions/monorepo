import { createSlice } from '@reduxjs/toolkit';

interface AppState {
  modal: {
    open: boolean;
    modalState: {
      name: string | null;
      props: Record<string, any>;
    };
  };
  theme: string;
}

const initialState: AppState = {
  modal: {
    open: false,
    modalState: {
      name: null,
      props: {},
    },
  },
  theme: 'system',
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
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
  }),
});

const { actions, reducer } = slice;

const { showModal, hideModal, setTheme } = actions;

export { showModal, hideModal, setTheme };

export const getCurrentTheme = (state: { app: AppState }) => state.app.theme;

export default reducer;
