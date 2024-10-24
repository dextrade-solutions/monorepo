import { createSlice } from '@reduxjs/toolkit';
import { getAssetKey } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';

import { AssetAccount } from '../../types';

interface AppState {
  modal: {
    open: boolean;
    modalState: {
      name: string | null;
      props: Record<string, any>;
    };
  };
  theme: string;
  assetAccounts: Record<string, AssetAccount | null>;
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
  assetAccounts: {},
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
    setAssetAccount: (state, action) => {
      const { asset, assetAccount } = action.payload;
      state.assetAccounts[getAssetKey(asset)] = assetAccount;
    },
  }),
});

const { actions, reducer } = slice;

const { showModal, hideModal, setTheme, setAssetAccount } = actions;

export { showModal, hideModal, setTheme, setAssetAccount };

export const getCurrentTheme = (state: { app: AppState }) => state.app.theme;

export const getAssetAccount = (
  state: { app: AppState },
  asset: AssetModel,
) => {
  const key = getAssetKey(asset);
  return state.app.assetAccounts[key] || null;
};

export default reducer;
