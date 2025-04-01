import { remove0x } from '@metamask/utils';
import { createSlice } from '@reduxjs/toolkit';
import { BUILT_IN_NETWORKS, DEXTRADE_P2P_TELEGRAM_BOT } from 'dex-helpers';
import { queryClient } from 'dex-helpers/shared';
import { isTMA, miniApp, openTelegramLink } from '@telegram-apps/sdk';

import {
  Trade,
  AdItem,
  AssetModel,
  UserPaymentMethod,
} from 'dex-helpers/types';

import { genKeyPair } from '../../../app/helpers/atomic-swaps';
import { getRedeemAndRefundAddress } from '../../../app/helpers/bitcoin/utils';
import { isBtcTypeAsset } from '../../../app/helpers/chain-helpers/is-btc-type-asset';
import {
  determineTradeTypeByAd,
  getSerializedAddressFromInput,
} from '../../../app/helpers/utils';
import P2PService from '../../../app/services/p2p-service';
import { handleRequest } from '../../helpers/utils/requests';
import type { useAssetInput } from '../../hooks/asset/useAssetInput';
import { QUERY_KEY } from '../../queries/useTradesActive';
import { AppDispatch, RootState } from '../../store/store';

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
  from: ReturnType<typeof useAssetInput>;
  to: ReturnType<typeof useAssetInput>;
  exchange: AdItem;
  slippage: number;
  paymentMethod?: UserPaymentMethod;
  exchangerPaymentMethodId?: number;
  on401?: () => void;
}) => {
  return async (dispatch: AppDispatch) => {
    const { from, to, exchange, slippage, exchangerPaymentMethodId, on401 } =
      props;
    if (!from.amount) {
      throw new Error('From amount is not specified');
    }
    if (!to.amount) {
      throw new Error('To amount is not specified');
    }
    const keypair = genKeyPair();
    const generateRequestString = () => {
      let toRedeemAddress;
      let fromRefundAddress;
      if (isBtcTypeAsset(to.asset)) {
        toRedeemAddress = getRedeemAndRefundAddress(
          to.asset.network,
        ).redeemAddress;
      } else {
        toRedeemAddress = remove0x(to.account?.address);
      }

      if (isBtcTypeAsset(from.asset)) {
        fromRefundAddress = getRedeemAndRefundAddress(
          from.asset.network,
        ).refundAddress;
      } else {
        fromRefundAddress = remove0x(from.account?.address);
      }
      return [
        `${exchange.fromCoin.ticker}_${exchange.fromCoin.networkType || 'NATIVE'}`,
        `${exchange.toCoin.ticker}_${exchange.toCoin.networkType || 'NATIVE'}`,
        from.amount,
        to.amount,
        remove0x(keypair.hashLock),
        toRedeemAddress,
        fromRefundAddress,
        BUILT_IN_NETWORKS[exchange.fromCoin.networkName].atomicSwapExpiration /
          1000n,
      ].join('|');
    };

    const exchangePairType = determineTradeTypeByAd(exchange);

    // if (isTMA()) {
    //   miniApp.close();
    //   return openTelegramLink(DEXTRADE_P2P_TELEGRAM_BOT);
    // }
    const response = await handleRequest(
      dispatch,
      P2PService.clientExchangeStart(exchangePairType, {
        exchangerSettingsId: exchange.id,
        amount1: Number(from.amount),
        amount2: Number(to.amount),
        exchangerPaymentMethodId,
        clientPaymentMethodId: to.paymentMethod?.userPaymentMethodId,
        clientWalletAddress: getSerializedAddressFromInput(from),
        clientWalletAddressInNetwork2: getSerializedAddressFromInput(to),
        clientSlippage: slippage,
        params: exchange.isAtomicSwap ? generateRequestString() : undefined,
      }),
      { on401 },
    );

    if (exchange.isAtomicSwap) {
      window.localStorage.setItem(response.data.id, JSON.stringify(keypair));
    }
    const activeTrades = (queryClient.getQueryData(QUERY_KEY) || []) as Trade[];
    const { data: newTrade } = await P2PService.exchangeById(response.data.id);
    queryClient.setQueryData(QUERY_KEY, [newTrade, ...activeTrades]);
    return response;
  };
};
