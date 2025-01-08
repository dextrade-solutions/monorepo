import { createSlice } from '@reduxjs/toolkit';
import { getAssetKey } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';

import { WalletConnection } from '../../types';

interface AppState {
  theme: string;
  assetAccounts: Record<string, WalletConnection | null>;
  walletConnections: Record<string, WalletConnection>;
}

const initialState: AppState = {
  theme: 'system',
  assetAccounts: {},
  walletConnections: {},
};

const slice = createSlice({
  name: 'app',
  initialState,
  reducers: () => ({
    clearAppState: () => initialState,
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setAssetAccount: (state, action) => {
      const { asset, assetAccount } = action.payload;
      state.assetAccounts[getAssetKey(asset)] = assetAccount;
    },
    setWalletConnection: (state, action) => {
      const newConnection = action.payload as WalletConnection;
      const key = `${newConnection.walletName}:${newConnection.connectionType}`;
      state.walletConnections[key] = newConnection;
    },
    removeWalletConnection: (state, action) => {
      const connection = action.payload as WalletConnection;
      const toRemoveKey = `${connection.walletName}:${connection.connectionType}`;
      const newState = { ...state.walletConnections };
      delete newState[toRemoveKey];
      state.walletConnections = newState;

      const assetAccounts = Object.entries(state.assetAccounts).reduce(
        (acc, [key, assetAccount]) => {
          const walletKey = `${assetAccount?.walletName}:${assetAccount?.connectionType}`;
          if (walletKey === toRemoveKey) {
            return acc;
          }
          return { ...acc, [key]: assetAccount };
        },
        {},
      );
      state.assetAccounts = assetAccounts;
    },
  }),
});

const { actions, reducer } = slice;

const {
  setTheme,
  setAssetAccount,
  setWalletConnection,
  removeWalletConnection,
} = actions;

export {
  setTheme,
  setAssetAccount,
  setWalletConnection,
  removeWalletConnection,
};

export const getCurrentTheme = (state: { app: AppState }) => state.app.theme;

export const getAssetAccount = (
  state: { app: AppState },
  asset: AssetModel,
) => {
  const key = getAssetKey(asset);
  return state.app.assetAccounts[key] || null;
};

export const getAssetAccounts = (state: { app: AppState }) => {
  return state.app.assetAccounts;
};

export const getWalletConnections = ({ app }: { app: AppState }) => {
  return app.walletConnections;
};

export default reducer;
