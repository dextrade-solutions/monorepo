import { createSlice } from '@reduxjs/toolkit';
import { queryClient } from 'dex-helpers/shared';
import { bufferToHex } from 'ethereumjs-util';

import { AuthStatus } from '../../app/constants/auth';
import generateMnemonicHash from '../../app/helpers/generate-mnemonic-hash';
import { recoverPubKeyFromSignature } from '../../app/helpers/pub-key';
import P2PService from '../../app/services/p2p-service';
import { AppDispatch, RootState } from '../store/store';

export const getAuth = (state: RootState) => state.auth.authData;
export const getAuthStatus = (state: RootState) => state.auth.authStatus;
export const getSession = (state: RootState) => state.auth.session;
export const getSessionSeed = (state: RootState) => state.auth.session.mnemonic;
export const getSessionPublicKey = (state: RootState) =>
  state.auth.session.publicKey;

interface AuthState {
  authData: {
    apikey: string | null;
    startSocket: boolean;
    hasExchanger: boolean;
    wallet: string | null;
  };
  session: {
    mnemonic: string | null;
    signature: string | null;
    publicKey: string | null;
  };
  authStatus: AuthStatus | null;
}
const initialState: AuthState = {
  authData: {
    apikey: null,
    startSocket: false,
    hasExchanger: false,

    wallet: null, // signed wallet name
  },
  session: {
    mnemonic: null,
    signature: null,
    publicKey: null,
  },
  authStatus: null,
};

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: () => ({
    clearAuthState: (state) => ({ ...initialState, session: state.session }),
    setAuthData: (state, action) => {
      state.authData = action.payload;
    },
    setSession: (state, action) => {
      state.session = action.payload;
    },
    setStatus: (state, action) => {
      state.authStatus = action.payload;
    },
  }),
});

const { actions, reducer } = slice;

const { setAuthData, clearAuthState, setSession, setStatus } = actions;

export { clearAuthState, setStatus };

export default reducer;

export const login = (keyring: any, signature: string, wallet: string) => {
  return async (dispatch: AppDispatch) => {
    dispatch(setStatus(AuthStatus.authenticating));
    const mnemonicString = await keyring
      .serialize()
      .then((v) => Buffer.from(v.mnemonic).toString());

    const publicKey = Buffer.from(keyring.hdWallet.pubKey).toString('hex');
    const masterPublicKey = recoverPubKeyFromSignature(signature, publicKey);

    const mnemonicHash = await generateMnemonicHash(masterPublicKey);

    const authData = await P2PService.login({
      mnemonicHash,
      masterPublicKey: bufferToHex(masterPublicKey),
      signature,
      publicKey,
      deviceId: navigator.userAgent,
    }).catch((e) => {});
    // MOCK
    // const authData = {
    //   data: {
    //     apikey:
    //       '3da0963e501fbcce42aabbd27731c3dc0e3be821a2e5357c4fa64b7737330e35',
    //   },
    // };
    dispatch(
      setSession({
        mnemonic: mnemonicString,
        signature,
        publicKey,
      }),
    );
    dispatch(
      setAuthData({
        wallet,
        ...authData.data,
      }),
    );
    dispatch(setStatus(AuthStatus.completed));
  };
};

export const logout = () => {
  return (dispatch: AppDispatch): void => {
    dispatch(clearAuthState());

    queryClient.removeQueries({ queryKey: ['p2pTrades'], exact: true });
    queryClient.removeQueries({
      queryKey: ['p2pTradesActive'],
      exact: true,
    });
    queryClient.removeQueries({ queryKey: ['kycInfo'], exact: true });
    queryClient.removeQueries({
      queryKey: ['dextradeUser'],
      exact: true,
    });
  };
};
