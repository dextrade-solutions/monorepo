import { remove0x } from '@metamask/utils';
import { createSlice } from '@reduxjs/toolkit';

import {
  BUILT_IN_NETWORKS,
  NetworkNames,
  TradeType,
} from '../../../app/constants/p2p';
import engine from '../../../app/engine';
import { genKeyPair } from '../../../app/helpers/atomic-swaps';
import {
  getKeysAndRedeemScript,
  getRedeemKeypair,
} from '../../../app/helpers/btc-scripts/get-keys-and-redeem-script';
import { hash160 } from '../../../app/helpers/btc-scripts/utils';
import { determineTradeTypeByAd } from '../../../app/helpers/utils';
import P2PService from '../../../app/services/p2p-service';
import { UserPaymentMethod } from '../../../app/types/dextrade';
import {
  Trade,
  AdItem,
  AssetModel,
  AssetInputValue,
} from '../../../app/types/p2p-swaps';
import { handleRequest } from '../../helpers/utils/requests';
import { QUERY_KEY } from '../../queries/useTradesActive';
import { AppDispatch, RootState } from '../../store/store';
import { getWalletAddress } from '../../../app/helpers/chain-helpers/get-asset-wallet-address';

type SliceState = {
  fromToken: AssetModel | null;
  toToken: AssetModel | null;
  balanceError: string | null;
  fromTokenInputValue: string | null;
  fromTokenError: string | null;
  fromMaxModeOn: boolean;
  maxSlippage: number | null;
  allSwaps: { [key: string]: Trade };
};

export const getBalanceError = (state: RootState) => state.swaps.balanceError;

export const getFromToken = (state: RootState) => state.swaps.fromToken;

export const getFromTokenError = (state: RootState) =>
  state.swaps.fromTokenError;

export const getFromMaxModeOn = (state: RootState) => state.swaps.fromMaxModeOn;

export const getFromTokenInputValue = (state: RootState) =>
  state.swaps.fromTokenInputValue || '';

export const getToToken = (state: RootState) => state.swaps.toToken;

export const getAllSwaps = (state: RootState) =>
  Object.values(state.swaps.allSwaps);

const initialState: SliceState = {
  fromToken: null,
  toToken: null,
  balanceError: null,
  fromTokenInputValue: '',
  fromTokenError: null,
  fromMaxModeOn: false,
  maxSlippage: null,
  allSwaps: {},
};

const slice = createSlice({
  name: 'swaps',
  initialState,
  reducers: () => ({
    clearSwapsState: () => initialState,

    setBalanceError: (state, action) => {
      state.balanceError = action.payload;
    },
    setFromToken: (state, action) => {
      state.fromToken = action.payload;
    },
    setFromTokenInputValue: (state, action) => {
      state.fromTokenInputValue = action.payload;
    },
    setFromTokenError: (state, action) => {
      state.fromTokenError = action.payload;
    },
    setFromMaxModeOn: (state, action) => {
      state.fromMaxModeOn = action.payload;
    },
    setMaxSlippage: (state, action) => {
      state.maxSlippage = action.payload;
    },
    setToToken: (state, action) => {
      state.toToken = action.payload;
    },
    setSwapTransaction: (state, action) => {
      const exchange = action.payload;
      state.allSwaps[exchange.id] = exchange;
    },
    setPaymentMethods: (state, action) => {
      state.paymentMethods.items = action.payload;
    },
  }),
});

const { actions, reducer } = slice;

const {
  setToToken,
  setFromToken,
  setFromMaxModeOn,
  setFromTokenInputValue,
  setSwapTransaction,
} = actions;

export {
  setToToken,
  setFromToken,
  setFromMaxModeOn,
  setFromTokenInputValue,
  setSwapTransaction,
};

export default reducer;

export const createSwapP2P = (props: {
  fromInput: AssetInputValue;
  toInput: AssetInputValue;
  exchange: AdItem;
  slippage: number;
  assetFrom: AssetModel;
  assetTo: AssetModel;
  paymentMethod?: UserPaymentMethod;
}) => {
  return async (dispatch: AppDispatch) => {
    const {
      fromInput,
      toInput,
      exchange,
      assetFrom,
      assetTo,
      paymentMethod,
      slippage,
    } = props;
    const fromAddress = await getWalletAddress(assetFrom);
    const toAddress = await getWalletAddress(assetTo);

    if (!fromInput.amount) {
      throw new Error('From amount is not specified');
    }
    if (!toInput.amount) {
      throw new Error('To amount is not specified');
    }
    const keypair = genKeyPair();
    const generateRequestString = () => {
      return [
        `${exchange.fromCoin.ticker}_${exchange.fromCoin.networkType || 'NATIVE'}`,
        `${exchange.toCoin.ticker}_${exchange.toCoin.networkType || 'NATIVE'}`,
        fromInput.amount,
        toInput.amount,
        remove0x(keypair.hashLock),
        toAddress.reedeemAddress,
        fromAddress.refundAddress,
        BUILT_IN_NETWORKS[exchange.fromCoin.networkName].atomicSwapExpiration /
          1000n,
      ].join('|');
    };

    const exchangePairType = determineTradeTypeByAd(exchange);
    const response = await handleRequest(
      dispatch,
      P2PService.clientExchangeStart(exchangePairType, {
        exchangerSettingsId: exchange.id,
        amount1: Number(fromInput.amount),
        amount2: Number(toInput.amount),
        paymentMethodId: paymentMethod?.userPaymentMethodId,
        clientWalletAddress:
          exchange.toCoin.networkName === NetworkNames.fiat
            ? undefined
            : toInput.recepientAddress || toAddress.address,
        clientSlippage: slippage,
        params: exchange.isAtomicSwap ? generateRequestString() : undefined,
      }),
    );
    window.localStorage.setItem(response.data.id, JSON.stringify(keypair));
    const activeTrades = (engine.queryClient.getQueryData(QUERY_KEY) ||
      []) as Trade[];
    const { data: newTrade } = await P2PService.exchangeById(response.data.id);
    engine.queryClient.setQueryData(QUERY_KEY, [newTrade, ...activeTrades]);
    return response.data;
  };
};
