import { createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import log from 'loglevel';

import { captureMessage } from '@sentry/browser';

import {
  addToken,
  fetchAndSetQuotes,
  forceUpdateMetamaskState,
  resetSwapsPostFetchState,
  setBackgroundSwapRouteState,
  setInitialGasEstimate,
  setSwapsErrorKey,
  setSwapsTxGasPrice,
  resetBackgroundSwapsState,
  setSwapsLiveness,
  setSwapsFeatureFlags,
  setSelectedQuoteAggId,
  setSwapsTxGasLimit,
  signAndSendSmartTransaction,
  updateSmartTransaction,
  setSmartTransactionsRefreshInterval,
  fetchSmartTransactionFees,
  cancelSmartTransaction,
  getTransactions,
  p2pExchangesStart,
  setTradeTxId,
  createDextradeSwapTransaction,
  swapGetOtcRates,
  swapGetDexRates,
  swapOtcExchangesStart,
  emulateTransaction,
  updateAndApproveP2PTransaction,
  updateAndApproveTransaction,
  addUnapprovedTransaction,
  updateSwapTransaction,
  swapExchangerByProvider,
  swapExchangerGetAllowance,
  swapExchangerApprove,
  cancelTx,
  dextradeRequest,
} from '../../store/actions';
import {
  AWAITING_SWAP_ROUTE,
  BUILD_QUOTE_ROUTE,
  LOADING_QUOTES_ROUTE,
  SWAPS_ERROR_ROUTE,
  SWAPS_MAINTENANCE_ROUTE,
  SMART_TRANSACTION_STATUS_ROUTE,
  DEFAULT_ROUTE,
  CONFIRM_TRANSACTION_ROUTE,
} from '../../helpers/constants/routes';
import {
  fetchSwapsFeatureFlags,
  fetchSwapsGasPrices,
  isContractAddressValid,
  getSwapsLivenessForNetwork,
  parseSmartTransactionsError,
  StxErrorTypes,
} from '../../pages/swaps/swaps.util';
import {
  decGWEIToHexWEI,
  decimalToHex,
  hexWEIToDecGWEI,
} from '../../../shared/modules/conversion.utils';
import {
  getSelectedAccount,
  getTokenExchangeRates,
  getSwapsDefaultToken,
  getCurrentChainId,
  isHardwareWallet,
  getHardwareWalletType,
  checkNetworkAndAccountSupports1559,
} from '../../selectors';

import { EVENT } from '../../../shared/constants/metametrics';
import {
  ERROR_FETCHING_QUOTES,
  QUOTES_NOT_AVAILABLE_ERROR,
  SWAP_FAILED_ERROR,
  SWAPS_FETCH_ORDER_CONFLICT,
  ALLOWED_SMART_TRANSACTIONS_CHAIN_IDS,
  Slippage,
} from '../../../shared/constants/swaps';
import {
  TransactionType,
  IN_PROGRESS_TRANSACTION_STATUSES,
  SmartTransactionStatus,
  TransactionStatus,
} from '../../../shared/constants/transaction';
import { getTokens } from '../metamask/metamask';
import { ORIGIN_METAMASK } from '../../../shared/constants/app';
import { calcTokenAmount } from '../../../shared/lib/transactions-controller-utils';
import { EtherDenomination } from '../../../shared/constants/common';
import { Numeric } from '../../../shared/modules/Numeric';
import { CHAIN_NAME_ALIASES } from '../../../shared/constants/network';
import { ExchangerType } from '../../../shared/constants/exchanger';

export const GAS_PRICES_LOADING_STATES = {
  INITIAL: 'INITIAL',
  LOADING: 'LOADING',
  FAILED: 'FAILED',
  COMPLETED: 'COMPLETED',
};

export const FALLBACK_GAS_MULTIPLIER = 1.5;

const initialState = {
  aggregatorMetadata: null,
  approveTxId: null,
  tradeTxId: null,
  balanceError: false,
  fetchingQuotes: false,
  fromToken: null,
  fromTokenInputValue: '',
  fromTokenError: null,
  fromMaxModeOn: false,
  isFeatureFlagLoaded: false,
  maxSlippage: Slippage.default,
  quotesFetchStartTime: null,
  reviewSwapClickedTimestamp: null,
  topAssets: {},
  toToken: null,
  customGas: {
    price: null,
    limit: null,
    loading: GAS_PRICES_LOADING_STATES.INITIAL,
    priceEstimates: {},
    fallBackPrice: null,
    fee: null,
  },
  currentSmartTransactionsError: '',
  swapsSTXLoading: false,
  incomingPaymentApproved: false,
  otcExchanges: {
    loading: false,
    initialized: false,
    providers: {},
  },
  dexExchanges: {
    loading: false,
    initialized: false,
    providers: {},
  },
  swapHeaderTitle: '',
};

const slice = createSlice({
  name: 'swaps',
  initialState,
  reducers: {
    clearSwapsState: () => initialState,
    navigatedBackToBuildQuote: (state) => {
      state.approveTxId = null;
      state.tradeTxId = null;
      state.balanceError = false;
      state.fetchingQuotes = false;
      state.customGas.limit = null;
      state.customGas.price = null;
      state.customGas.fee = null;
    },
    retriedGetQuotes: (state) => {
      state.approveTxId = null;
      state.balanceError = false;
      state.fetchingQuotes = false;
    },
    setAggregatorMetadata: (state, action) => {
      state.aggregatorMetadata = action.payload;
    },
    setBalanceError: (state, action) => {
      state.balanceError = action.payload;
    },
    setFetchingQuotes: (state, action) => {
      state.fetchingQuotes = action.payload;
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
    setIsFeatureFlagLoaded: (state, action) => {
      state.isFeatureFlagLoaded = action.payload;
    },
    setMaxSlippage: (state, action) => {
      state.maxSlippage = action.payload;
    },
    setQuotesFetchStartTime: (state, action) => {
      state.quotesFetchStartTime = action.payload;
    },
    setReviewSwapClickedTimestamp: (state, action) => {
      state.reviewSwapClickedTimestamp = action.payload;
    },
    setTopAssets: (state, action) => {
      state.topAssets = action.payload;
    },
    setToToken: (state, action) => {
      state.toToken = action.payload;
    },
    swapCustomGasModalClosed: (state) => {
      state.customGas.price = null;
      state.customGas.limit = null;
    },
    swapCustomGasModalPriceEdited: (state, action) => {
      state.customGas.price = action.payload;
    },
    swapCustomGasModalLimitEdited: (state, action) => {
      state.customGas.limit = action.payload;
    },
    swapGasPriceEstimatesFetchStarted: (state) => {
      state.customGas.loading = GAS_PRICES_LOADING_STATES.LOADING;
    },
    swapGasPriceEstimatesFetchFailed: (state) => {
      state.customGas.loading = GAS_PRICES_LOADING_STATES.FAILED;
    },
    swapGasPriceEstimatesFetchCompleted: (state, action) => {
      state.customGas.priceEstimates = action.payload.priceEstimates;
      state.customGas.loading = GAS_PRICES_LOADING_STATES.COMPLETED;
    },
    retrievedFallbackSwapsGasPrice: (state, action) => {
      state.customGas.fallBackPrice = action.payload;
    },
    setSwapsCustomGasFee: (state, action) => {
      state.customGas.fee = action.payload;
    },
    setCurrentSmartTransactionsError: (state, action) => {
      const errorType = Object.values(StxErrorTypes).includes(action.payload)
        ? action.payload
        : StxErrorTypes.UNAVAILABLE;
      state.currentSmartTransactionsError = errorType;
    },
    setSwapsSTXSubmitLoading: (state, action) => {
      state.swapsSTXLoading = action.payload || false;
    },
    setSwapHeaderTitle: (state, { payload = '' }) => {
      return {
        ...state,
        swapHeaderTitle: payload,
      };
    },
    intiSwapOtc: (state, action) => {
      return {
        ...state,
        otcExchanges: {
          ...state.otcExchanges,
          loading: false,
          initialized: true,
          providers: action.payload,
        },
      };
    },
    setOTCLoading: (state, { payload }) => {
      return {
        ...state,
        otcExchanges: {
          ...state.otcExchanges,
          loading: payload || true,
        },
      };
    },
    updateOTCExchanges: (state, { payload }) => {
      return {
        ...state,
        otcExchanges: {
          ...state.otcExchanges,
          ...payload,
        },
      };
    },
    intiSwapDex: (state, action) => {
      return {
        ...state,
        dexExchanges: {
          ...state.dexExchanges,
          loading: false,
          initialized: true,
          providers: action.payload,
        },
      };
    },
    setDEXLoading: (state, { payload }) => {
      return {
        ...state,
        dexExchanges: {
          ...state.dexExchanges,
          loading: payload || true,
        },
      };
    },
    updateDEXExchanges: (state, { payload }) => {
      return {
        ...state,
        dexExchanges: {
          ...state.dexExchanges,
          ...payload,
        },
      };
    },
    setP2PIncomingPaymentApproved: (state) => {
      state.incomingPaymentApproved = true;
    },
  },
});

const { actions, reducer } = slice;

export default reducer;

// Selectors
export const getSwaps = (state) => state.swaps;

export const getSwapsHeaderTitle = (state) =>
  getSwaps(state).swapHeaderTitle || '';

export const getAggregatorMetadata = (state) => state.swaps.aggregatorMetadata;

export const getBalanceError = (state) => state.swaps.balanceError;

export const getFromToken = (state) => state.swaps.fromToken;

export const getFromTokenError = (state) => state.swaps.fromTokenError;

export const getFromMaxModeOn = (state) => state.swaps.fromMaxModeOn;

export const getFromTokenInputValue = (state) =>
  state.swaps.fromTokenInputValue;

export const getIsFeatureFlagLoaded = (state) =>
  state.swaps.isFeatureFlagLoaded;

export const getSwapsSTXLoading = (state) => state.swaps.swapsSTXLoading;

export const getMaxSlippage = (state) => state.swaps.maxSlippage;

export const getTopAssets = (state) => state.swaps.topAssets;

export const getToToken = (state) => state.swaps.toToken;

export const getTokenByCoin = (state, toCoin) => {
  if (!toCoin) {
    return null;
  }
  const tokens = getTokens(state);
  return tokens.find(
    (t) =>
      t.symbol === toCoin.ticker &&
      CHAIN_NAME_ALIASES[t.provider.chainId].toLowerCase() ===
        toCoin.networkName.toLowerCase(),
  );
};

export const getFetchingQuotes = (state) => state.swaps.fetchingQuotes;

export const getQuotesFetchStartTime = (state) =>
  state.swaps.quotesFetchStartTime;

export const getReviewSwapClickedTimestamp = (state) =>
  state.swaps.reviewSwapClickedTimestamp;

export const getSwapsCustomizationModalPrice = (state) =>
  state.swaps.customGas.price;

export const getSwapsCustomizationModalLimit = (state) =>
  state.swaps.customGas.limit;

export const swapGasPriceEstimateIsLoading = (state) =>
  state.swaps.customGas.loading === GAS_PRICES_LOADING_STATES.LOADING;

export const swapGasEstimateLoadingHasFailed = (state) =>
  state.swaps.customGas.loading === GAS_PRICES_LOADING_STATES.INITIAL;

export const getSwapGasPriceEstimateData = (state) =>
  state.swaps.customGas.priceEstimates;

export const getSwapsFallbackGasPrice = (state) =>
  state.swaps.customGas.fallBackPrice;

export const getCurrentSmartTransactionsError = (state) =>
  state.swaps.currentSmartTransactionsError;

export function shouldShowCustomPriceTooLowWarning(state) {
  const { average } = getSwapGasPriceEstimateData(state);

  const customGasPrice = getSwapsCustomizationModalPrice(state);

  if (!customGasPrice || average === undefined) {
    return false;
  }

  const customPriceRisksSwapFailure = new Numeric(
    customGasPrice,
    16,
    EtherDenomination.WEI,
  )
    .toDenomination(EtherDenomination.GWEI)
    .greaterThan(average, 10);

  return customPriceRisksSwapFailure;
}

export const getSwapOTC = (state) => state.swaps.otcExchanges;

export const getSwapDEX = (state) => state.swaps.dexExchanges;

export const getSwapOTCProviders = (state) =>
  Object.values(state.swaps.otcExchanges.providers).sort(
    (p, n) => Number(p.index) - Number(n.index),
  );

export const getSwapDEXProviders = (state) =>
  Object.values(state.swaps.dexExchanges.providers).sort(
    (p, n) => Number(p.index) - Number(n.index),
  );

export const getIncomingPaymentApproved = (state) =>
  state.swaps.incomingPaymentApproved;

// Background selectors
const getSwapsState = (state) => state.metamask.swapsState;

export const getP2PApiKeyClient = (state) =>
  state.metamask.swapsState.p2pApiKeyClient;

export const getP2PExchanges = (state) => ({
  items: state.metamask.swapsState.p2pExchangesList,
  loading: state.metamask.swapsState.p2pExchangesLoading,
});

export const getSwapsFeatureIsLive = (state) =>
  state.metamask.swapsState.swapsFeatureIsLive;

export const getSmartTransactionsError = (state) =>
  state.appState.smartTransactionsError;

export const getSmartTransactionsErrorMessageDismissed = (state) =>
  state.appState.smartTransactionsErrorMessageDismissed;

export const getSmartTransactionsEnabled = (state) => {
  const hardwareWalletUsed = isHardwareWallet(state);
  const chainId = getCurrentChainId(state);
  const isAllowedNetwork =
    ALLOWED_SMART_TRANSACTIONS_CHAIN_IDS.includes(chainId);
  const smartTransactionsFeatureFlagEnabled =
    state.metamask.swapsState?.swapsFeatureFlags?.smartTransactions
      ?.extensionActive;
  const smartTransactionsLiveness =
    state.metamask.smartTransactionsState?.liveness;
  return Boolean(
    isAllowedNetwork &&
      !hardwareWalletUsed &&
      smartTransactionsFeatureFlagEnabled &&
      smartTransactionsLiveness,
  );
};

export const getCurrentSmartTransactionsEnabled = (state) => {
  const smartTransactionsEnabled = getSmartTransactionsEnabled(state);
  const currentSmartTransactionsError = getCurrentSmartTransactionsError(state);
  return smartTransactionsEnabled && !currentSmartTransactionsError;
};

export const getSwapsQuoteRefreshTime = (state) =>
  state.metamask.swapsState.swapsQuoteRefreshTime;

export const getSwapsQuotePrefetchingRefreshTime = (state) =>
  state.metamask.swapsState.swapsQuotePrefetchingRefreshTime;

export const getBackgroundSwapRouteState = (state) =>
  state.metamask.swapsState.routeState;

export const getCustomSwapsGas = (state) =>
  state.metamask.swapsState.customMaxGas;

export const getCustomSwapsGasPrice = (state) =>
  state.metamask.swapsState.customGasPrice;

export const getCustomMaxFeePerGas = (state) =>
  state.metamask.swapsState.customMaxFeePerGas;

export const getCustomMaxPriorityFeePerGas = (state) =>
  state.metamask.swapsState.customMaxPriorityFeePerGas;

export const getSwapsUserFeeLevel = (state) =>
  state.metamask.swapsState.swapsUserFeeLevel;

export const getFetchParams = (state) => state.metamask.swapsState.fetchParams;

export const getQuotes = (state) => state.metamask.swapsState.quotes;

export const getQuotesLastFetched = (state) =>
  state.metamask.swapsState.quotesLastFetched;

export const getSelectedQuote = (state) => {
  const { selectedAggId, quotes } = getSwapsState(state);
  return quotes[selectedAggId];
};

export const getSwapsErrorKey = (state) => getSwapsState(state)?.errorKey;

export const getShowQuoteLoadingScreen = (state) =>
  state.swaps.showQuoteLoadingScreen;

export const getSwapsTokens = (state) => state.metamask.swapsState.tokens;

export const getSwapsWelcomeMessageSeenStatus = (state) =>
  state.metamask.swapsWelcomeMessageHasBeenShown;

export const getTopQuote = (state) => {
  const { topAggId, quotes } = getSwapsState(state);
  return quotes[topAggId];
};

export const getApproveTxId = (state) => state.metamask.swapsState.approveTxId;

export const getTradeTxId = (state) => state.metamask.swapsState.tradeTxId;

export const getUsedQuote = (state) =>
  getSelectedQuote(state) || getTopQuote(state);

export const getDefaultSwapsActiveTabName = ({ metamask }) =>
  metamask?.defaultSwapsActiveTabName || '';

// Compound selectors
export const getDestinationTokenInfo = (state) =>
  getFetchParams(state)?.metaData?.destinationTokenInfo;

export const getUsedSwapsGasPrice = (state) =>
  getCustomSwapsGasPrice(state) || getSwapsFallbackGasPrice(state);

export const getApproveTxParams = (state) => {
  const { approvalNeeded } =
    getSelectedQuote(state) || getTopQuote(state) || {};

  if (!approvalNeeded) {
    return null;
  }
  const data = getSwapsState(state)?.customApproveTxData || approvalNeeded.data;

  const gasPrice = getUsedSwapsGasPrice(state);
  return { ...approvalNeeded, gasPrice, data };
};

export const getSmartTransactionsOptInStatus = (state) => {
  return state.metamask.smartTransactionsState?.userOptIn;
};

export const getCurrentSmartTransactions = (state) => {
  return state.metamask.smartTransactionsState?.smartTransactions?.[
    getCurrentChainId(state)
  ];
};

export const getPendingSmartTransactions = (state) => {
  const currentSmartTransactions = getCurrentSmartTransactions(state);
  if (!currentSmartTransactions || currentSmartTransactions.length === 0) {
    return [];
  }
  return currentSmartTransactions.filter(
    (stx) => stx.status === SmartTransactionStatus.pending,
  );
};

export const getSmartTransactionFees = (state) => {
  return state.metamask.smartTransactionsState?.fees;
};

export const getSmartTransactionEstimatedGas = (state) => {
  return state.metamask.smartTransactionsState?.estimatedGas;
};

export const getSwapsNetworkConfig = (state) => {
  const {
    swapsQuoteRefreshTime,
    swapsQuotePrefetchingRefreshTime,
    swapsStxGetTransactionsRefreshTime,
    swapsStxBatchStatusRefreshTime,
    swapsStxStatusDeadline,
    swapsStxMaxFeeMultiplier,
  } = state.metamask.swapsState;
  return {
    quoteRefreshTime: swapsQuoteRefreshTime,
    quotePrefetchingRefreshTime: swapsQuotePrefetchingRefreshTime,
    stxGetTransactionsRefreshTime: swapsStxGetTransactionsRefreshTime,
    stxBatchStatusRefreshTime: swapsStxBatchStatusRefreshTime,
    stxStatusDeadline: swapsStxStatusDeadline,
    stxMaxFeeMultiplier: swapsStxMaxFeeMultiplier,
  };
};

// Actions / action-creators
const {
  clearSwapsState,
  navigatedBackToBuildQuote,
  retriedGetQuotes,
  swapGasPriceEstimatesFetchCompleted,
  swapGasPriceEstimatesFetchStarted,
  swapGasPriceEstimatesFetchFailed,
  setAggregatorMetadata,
  setBalanceError,
  setFetchingQuotes,
  setFromToken,
  setFromTokenError,
  setFromMaxModeOn,
  setFromTokenInputValue,
  setIsFeatureFlagLoaded,
  setMaxSlippage,
  setQuotesFetchStartTime,
  setReviewSwapClickedTimestamp,
  setTopAssets,
  setToToken,
  swapCustomGasModalPriceEdited,
  swapCustomGasModalLimitEdited,
  setSwapsCustomGasFee,
  retrievedFallbackSwapsGasPrice,
  swapCustomGasModalClosed,
  setCurrentSmartTransactionsError,
  setSwapsSTXSubmitLoading,
  setP2PIncomingPaymentApproved,
} = actions;

export {
  clearSwapsState,
  setAggregatorMetadata,
  setBalanceError,
  setFetchingQuotes,
  setFromToken as setSwapsFromToken,
  setFromTokenError,
  setFromMaxModeOn,
  setFromTokenInputValue,
  setIsFeatureFlagLoaded,
  setMaxSlippage,
  setQuotesFetchStartTime as setSwapQuotesFetchStartTime,
  setReviewSwapClickedTimestamp,
  setTopAssets,
  setToToken as setSwapToToken,
  setSwapsCustomGasFee,
  swapCustomGasModalPriceEdited,
  swapCustomGasModalLimitEdited,
  swapCustomGasModalClosed,
};

export const navigateBackToBuildQuote = (history) => {
  return async (dispatch) => {
    // TODO: Ensure any fetch in progress is cancelled
    await dispatch(setBackgroundSwapRouteState(''));
    dispatch(navigatedBackToBuildQuote());
    history.push(BUILD_QUOTE_ROUTE);
  };
};

export const prepareForRetryGetQuotes = () => {
  return async (dispatch) => {
    // TODO: Ensure any fetch in progress is cancelled
    await dispatch(resetSwapsPostFetchState());
    dispatch(retriedGetQuotes());
  };
};

export const prepareToLeaveSwaps = () => {
  return async (dispatch) => {
    dispatch(clearSwapsState());
    await dispatch(resetBackgroundSwapsState());
  };
};

export const swapsQuoteSelected = (aggId) => {
  return (dispatch) => {
    dispatch(swapCustomGasModalLimitEdited(null));
    dispatch(setSelectedQuoteAggId(aggId));
    dispatch(setSwapsTxGasLimit(''));
  };
};

export const fetchAndSetSwapsGasPriceInfo = () => {
  return async (dispatch) => {
    const basicEstimates = await dispatch(fetchMetaSwapsGasPriceEstimates());

    if (basicEstimates?.fast) {
      dispatch(setSwapsTxGasPrice(decGWEIToHexWEI(basicEstimates.fast)));
    }
  };
};

const disableStxIfRegularTxInProgress = (dispatch, transactions) => {
  if (transactions?.length <= 0) {
    return;
  }
  for (const transaction of transactions) {
    if (IN_PROGRESS_TRANSACTION_STATUSES.includes(transaction.status)) {
      dispatch(
        setCurrentSmartTransactionsError(StxErrorTypes.REGULAR_TX_IN_PROGRESS),
      );
      break;
    }
  }
};

export const fetchSwapsLivenessAndFeatureFlags = () => {
  return async (dispatch, getState) => {
    let swapsLivenessForNetwork = {
      swapsFeatureIsLive: false,
    };
    const state = getState();
    const chainId = getCurrentChainId(state);
    try {
      const swapsFeatureFlags = await fetchSwapsFeatureFlags();
      await dispatch(setSwapsFeatureFlags(swapsFeatureFlags));
      if (ALLOWED_SMART_TRANSACTIONS_CHAIN_IDS.includes(chainId)) {
        const transactions = await getTransactions({
          searchCriteria: {
            from: state.metamask?.selectedAddress,
          },
        });
        disableStxIfRegularTxInProgress(dispatch, transactions);
      }
      swapsLivenessForNetwork = getSwapsLivenessForNetwork(
        chainId,
        swapsFeatureFlags,
      );
    } catch (error) {
      log.error(
        'Failed to fetch Swaps feature flags and Swaps liveness, defaulting to false.',
        error,
      );
    }
    await dispatch(setSwapsLiveness(swapsLivenessForNetwork));
    dispatch(setIsFeatureFlagLoaded(true));
    return swapsLivenessForNetwork;
  };
};

const isTokenAlreadyAdded = (tokenAddress, tokens) => {
  if (!Array.isArray(tokens)) {
    return false;
  }
  return tokens.find(
    (token) => token.address.toLowerCase() === tokenAddress.toLowerCase(),
  );
};

export const fetchQuotesAndSetQuoteState = (
  history,
  inputValue,
  maxSlippage,
  trackEvent,
  pageRedirectionDisabled,
) => {
  return async (dispatch, getState) => {
    const state = getState();
    const chainId = getCurrentChainId(state);
    let swapsLivenessForNetwork = {
      swapsFeatureIsLive: false,
    };
    try {
      const swapsFeatureFlags = await fetchSwapsFeatureFlags();
      swapsLivenessForNetwork = getSwapsLivenessForNetwork(
        chainId,
        swapsFeatureFlags,
      );
    } catch (error) {
      log.error('Failed to fetch Swaps liveness, defaulting to false.', error);
    }
    await dispatch(setSwapsLiveness(swapsLivenessForNetwork));

    if (!swapsLivenessForNetwork.swapsFeatureIsLive) {
      await history.push(SWAPS_MAINTENANCE_ROUTE);
      return;
    }

    const fetchParams = getFetchParams(state);
    const selectedAccount = getSelectedAccount(state);
    const balanceError = getBalanceError(state);
    const swapsDefaultToken = getSwapsDefaultToken(state);
    const fetchParamsFromToken =
      fetchParams?.metaData?.sourceTokenInfo?.symbol ===
      swapsDefaultToken.symbol
        ? swapsDefaultToken
        : fetchParams?.metaData?.sourceTokenInfo;
    const selectedFromToken = getFromToken(state) || fetchParamsFromToken || {};
    const selectedToToken =
      getToToken(state) || fetchParams?.metaData?.destinationTokenInfo || {};
    const {
      address: fromTokenAddress,
      symbol: fromTokenSymbol,
      decimals: fromTokenDecimals,
      iconUrl: fromTokenIconUrl,
      balance: fromTokenBalance,
    } = selectedFromToken;
    const {
      address: toTokenAddress,
      symbol: toTokenSymbol,
      decimals: toTokenDecimals,
      iconUrl: toTokenIconUrl,
    } = selectedToToken;
    // pageRedirectionDisabled is true if quotes prefetching is active (a user is on the Build Quote page).
    // In that case we just want to silently prefetch quotes without redirecting to the quotes loading page.
    if (!pageRedirectionDisabled) {
      await dispatch(setBackgroundSwapRouteState('loading'));
      history.push(LOADING_QUOTES_ROUTE);
    }
    dispatch(setFetchingQuotes(true));

    const contractExchangeRates = getTokenExchangeRates(state);

    let destinationTokenAddedForSwap = false;
    if (
      toTokenAddress &&
      toTokenSymbol !== swapsDefaultToken.symbol &&
      contractExchangeRates[toTokenAddress] === undefined &&
      !isTokenAlreadyAdded(toTokenAddress, getTokens(state))
    ) {
      destinationTokenAddedForSwap = true;
      await dispatch(
        addToken(
          toTokenAddress,
          toTokenSymbol,
          toTokenDecimals,
          toTokenIconUrl,
          true,
        ),
      );
    }
    if (
      fromTokenAddress &&
      fromTokenSymbol !== swapsDefaultToken.symbol &&
      !contractExchangeRates[fromTokenAddress] &&
      fromTokenBalance &&
      new BigNumber(fromTokenBalance, 16).gt(0)
    ) {
      dispatch(
        addToken(
          fromTokenAddress,
          fromTokenSymbol,
          fromTokenDecimals,
          fromTokenIconUrl,
          true,
        ),
      );
    }

    const swapsTokens = getSwapsTokens(state);

    const sourceTokenInfo =
      swapsTokens?.find(({ address }) => address === fromTokenAddress) ||
      selectedFromToken;
    const destinationTokenInfo =
      swapsTokens?.find(({ address }) => address === toTokenAddress) ||
      selectedToToken;

    dispatch(setFromToken(selectedFromToken));

    const hardwareWalletUsed = isHardwareWallet(state);
    const hardwareWalletType = getHardwareWalletType(state);
    const networkAndAccountSupports1559 =
      checkNetworkAndAccountSupports1559(state);
    const smartTransactionsOptInStatus = getSmartTransactionsOptInStatus(state);
    const smartTransactionsEnabled = getSmartTransactionsEnabled(state);
    const currentSmartTransactionsEnabled =
      getCurrentSmartTransactionsEnabled(state);
    trackEvent({
      event: 'Quotes Requested',
      category: EVENT.CATEGORIES.SWAPS,
      sensitiveProperties: {
        token_from: fromTokenSymbol,
        token_from_amount: String(inputValue),
        token_to: toTokenSymbol,
        request_type: balanceError ? 'Quote' : 'Order',
        slippage: maxSlippage,
        custom_slippage: maxSlippage !== Slippage.default,
        is_hardware_wallet: hardwareWalletUsed,
        hardware_wallet_type: hardwareWalletType,
        stx_enabled: smartTransactionsEnabled,
        current_stx_enabled: currentSmartTransactionsEnabled,
        stx_user_opt_in: smartTransactionsOptInStatus,
        anonymizedData: true,
      },
    });

    try {
      const fetchStartTime = Date.now();
      dispatch(setQuotesFetchStartTime(fetchStartTime));

      const fetchAndSetQuotesPromise = dispatch(
        fetchAndSetQuotes(
          {
            slippage: maxSlippage,
            sourceToken: fromTokenAddress,
            destinationToken: toTokenAddress,
            value: inputValue,
            fromAddress: selectedAccount.address,
            destinationTokenAddedForSwap,
            balanceError,
            sourceDecimals: fromTokenDecimals,
          },
          {
            sourceTokenInfo,
            destinationTokenInfo,
            accountBalance: selectedAccount.balance,
            chainId,
          },
        ),
      );

      const gasPriceFetchPromise = networkAndAccountSupports1559
        ? null // For EIP 1559 we can get gas prices via "useGasFeeEstimates".
        : dispatch(fetchAndSetSwapsGasPriceInfo());

      const [[fetchedQuotes, selectedAggId]] = await Promise.all([
        fetchAndSetQuotesPromise,
        gasPriceFetchPromise,
      ]);

      if (Object.values(fetchedQuotes)?.length === 0) {
        trackEvent({
          event: 'No Quotes Available',
          category: EVENT.CATEGORIES.SWAPS,
          sensitiveProperties: {
            token_from: fromTokenSymbol,
            token_from_amount: String(inputValue),
            token_to: toTokenSymbol,
            request_type: balanceError ? 'Quote' : 'Order',
            slippage: maxSlippage,
            custom_slippage: maxSlippage !== Slippage.default,
            is_hardware_wallet: hardwareWalletUsed,
            hardware_wallet_type: hardwareWalletType,
            stx_enabled: smartTransactionsEnabled,
            current_stx_enabled: currentSmartTransactionsEnabled,
            stx_user_opt_in: smartTransactionsOptInStatus,
          },
        });
        dispatch(setSwapsErrorKey(QUOTES_NOT_AVAILABLE_ERROR));
      } else {
        const newSelectedQuote = fetchedQuotes[selectedAggId];

        trackEvent({
          event: 'Quotes Received',
          category: EVENT.CATEGORIES.SWAPS,
          sensitiveProperties: {
            token_from: fromTokenSymbol,
            token_from_amount: String(inputValue),
            token_to: toTokenSymbol,
            token_to_amount: calcTokenAmount(
              newSelectedQuote.destinationAmount,
              newSelectedQuote.decimals || 18,
            ),
            request_type: balanceError ? 'Quote' : 'Order',
            slippage: maxSlippage,
            custom_slippage: maxSlippage !== Slippage.default,
            response_time: Date.now() - fetchStartTime,
            best_quote_source: newSelectedQuote.aggregator,
            available_quotes: Object.values(fetchedQuotes)?.length,
            is_hardware_wallet: hardwareWalletUsed,
            hardware_wallet_type: hardwareWalletType,
            stx_enabled: smartTransactionsEnabled,
            current_stx_enabled: currentSmartTransactionsEnabled,
            stx_user_opt_in: smartTransactionsOptInStatus,
            anonymizedData: true,
          },
        });

        dispatch(setInitialGasEstimate(selectedAggId));
      }
    } catch (e) {
      // A newer swap request is running, so simply bail and let the newer request respond
      if (e.message === SWAPS_FETCH_ORDER_CONFLICT) {
        log.debug(`Swap fetch order conflict detected; ignoring older request`);
        return;
      }
      // TODO: Check for any errors we should expect to occur in production, and report others to Sentry
      log.error(`Error fetching quotes: `, e);
      dispatch(setSwapsErrorKey(ERROR_FETCHING_QUOTES));
    }

    dispatch(setFetchingQuotes(false));
  };
};

export const signAndSendSwapsSmartTransaction = ({
  unsignedTransaction,
  trackEvent,
  history,
  additionalTrackingParams,
}) => {
  return async (dispatch, getState) => {
    dispatch(setSwapsSTXSubmitLoading(true));
    const state = getState();
    const fetchParams = getFetchParams(state);
    const { metaData, value: swapTokenValue, slippage } = fetchParams;
    const { sourceTokenInfo = {}, destinationTokenInfo = {} } = metaData;
    const usedQuote = getUsedQuote(state);
    const swapsNetworkConfig = getSwapsNetworkConfig(state);
    const chainId = getCurrentChainId(state);

    dispatch(
      setSmartTransactionsRefreshInterval(
        swapsNetworkConfig?.stxBatchStatusRefreshTime,
      ),
    );

    const usedTradeTxParams = usedQuote.trade;

    // update stx with data
    const destinationValue = calcTokenAmount(
      usedQuote.destinationAmount,
      destinationTokenInfo.decimals || 18,
    ).toPrecision(8);
    const smartTransactionsOptInStatus = getSmartTransactionsOptInStatus(state);
    const smartTransactionsEnabled = getSmartTransactionsEnabled(state);
    const currentSmartTransactionsEnabled =
      getCurrentSmartTransactionsEnabled(state);
    const swapMetaData = {
      token_from: sourceTokenInfo.symbol,
      token_from_amount: String(swapTokenValue),
      token_to: destinationTokenInfo.symbol,
      token_to_amount: destinationValue,
      slippage,
      custom_slippage: slippage !== 2,
      best_quote_source: getTopQuote(state)?.aggregator,
      available_quotes: getQuotes(state)?.length,
      other_quote_selected:
        usedQuote.aggregator !== getTopQuote(state)?.aggregator,
      other_quote_selected_source:
        usedQuote.aggregator === getTopQuote(state)?.aggregator
          ? ''
          : usedQuote.aggregator,
      average_savings: usedQuote.savings?.total,
      performance_savings: usedQuote.savings?.performance,
      fee_savings: usedQuote.savings?.fee,
      median_metamask_fee: usedQuote.savings?.medianMetaMaskFee,
      stx_enabled: smartTransactionsEnabled,
      current_stx_enabled: currentSmartTransactionsEnabled,
      stx_user_opt_in: smartTransactionsOptInStatus,
      ...additionalTrackingParams,
    };
    trackEvent({
      event: 'STX Swap Started',
      category: EVENT.CATEGORIES.SWAPS,
      sensitiveProperties: swapMetaData,
    });

    if (!isContractAddressValid(usedTradeTxParams.to, chainId)) {
      captureMessage('Invalid contract address', {
        extra: {
          token_from: swapMetaData.token_from,
          token_to: swapMetaData.token_to,
          contract_address: usedTradeTxParams.to,
        },
      });
      await dispatch(setSwapsErrorKey(SWAP_FAILED_ERROR));
      history.push(SWAPS_ERROR_ROUTE);
      return;
    }

    const approveTxParams = getApproveTxParams(state);
    let approvalTxUuid;
    let updatedApproveTxParams;
    try {
      if (approveTxParams) {
        updatedApproveTxParams = {
          ...approveTxParams,
          value: '0x0',
        };
      }
      const fees = await dispatch(
        fetchSwapsSmartTransactionFees({
          unsignedTransaction,
          approveTxParams: updatedApproveTxParams,
          fallbackOnNotEnoughFunds: true,
        }),
      );
      if (!fees) {
        log.error('"fetchSwapsSmartTransactionFees" failed');
        dispatch(setSwapsSTXSubmitLoading(false));
        dispatch(setCurrentSmartTransactionsError(StxErrorTypes.UNAVAILABLE));
        return;
      }
      if (approveTxParams) {
        updatedApproveTxParams.gas = `0x${decimalToHex(
          fees.approvalTxFees?.gasLimit || 0,
        )}`;
        approvalTxUuid = await dispatch(
          signAndSendSmartTransaction({
            unsignedTransaction: updatedApproveTxParams,
            smartTransactionFees: fees.approvalTxFees,
          }),
        );
      }
      unsignedTransaction.gas = `0x${decimalToHex(
        fees.tradeTxFees?.gasLimit || 0,
      )}`;
      const uuid = await dispatch(
        signAndSendSmartTransaction({
          unsignedTransaction,
          smartTransactionFees: fees.tradeTxFees,
        }),
      );

      const destinationTokenAddress = destinationTokenInfo.address;
      const destinationTokenDecimals = destinationTokenInfo.decimals;
      const destinationTokenSymbol = destinationTokenInfo.symbol;
      const sourceTokenSymbol = sourceTokenInfo.symbol;
      await dispatch(
        updateSmartTransaction(uuid, {
          origin: ORIGIN_METAMASK,
          destinationTokenAddress,
          destinationTokenDecimals,
          destinationTokenSymbol,
          sourceTokenSymbol,
          swapMetaData,
          swapTokenValue,
          type: TransactionType.swap,
        }),
      );
      if (approvalTxUuid) {
        await dispatch(
          updateSmartTransaction(approvalTxUuid, {
            origin: ORIGIN_METAMASK,
            type: TransactionType.swapApproval,
            sourceTokenSymbol,
          }),
        );
      }
      history.push(SMART_TRANSACTION_STATUS_ROUTE);
      dispatch(setSwapsSTXSubmitLoading(false));
    } catch (e) {
      console.log('signAndSendSwapsSmartTransaction error', e);
      const {
        swaps: { isFeatureFlagLoaded },
      } = getState();
      if (e.message.startsWith('Fetch error:') && isFeatureFlagLoaded) {
        const errorObj = parseSmartTransactionsError(e.message);
        dispatch(setCurrentSmartTransactionsError(errorObj?.error));
      }
    }
  };
};

export const clientP2PConfirmTransaction = ({ exchangeId }) => {
  return async (dispatch) => {
    await dispatch(
      dextradeRequest({
        method: 'POST',
        url: 'api/exchange/client/confirm/fiat',
        data: {
          id: exchangeId,
        },
      }),
    );
    dispatch(setP2PIncomingPaymentApproved());
  };
};

export const clientP2PCancelTransaction = ({ exchangeId, txData }) => {
  return async (dispatch) => {
    await dispatch(
      dextradeRequest({
        method: 'POST',
        url: 'api/exchange/client/cancel/transaction',
        data: {
          id: exchangeId,
        },
      }),
    );
    await dispatch(cancelTx(txData));
  };
};

const p2pSignAndSendTransactions = (props) => {
  return async (dispatch) => {
    const { from, to, exchange: exchangerSettings } = props;

    let exchangeType = 'crypto/crypto';
    if (from.asset.isFiat) {
      exchangeType = 'fiat/crypto';
    }
    if (to.asset.isFiat) {
      exchangeType = 'crypto/fiat';
    }
    const exchangeData = await dispatch(
      p2pExchangesStart(exchangeType, {
        exchangerSettingsId: exchangerSettings.id,
        amount1: parseFloat(from.amount),
        amount2: parseFloat(to.amount),
        paymentMethodId: to.paymentMethod?.userPaymentMethodId,
        clientWalletAddress: !to.asset.isFiat && to.asset.getAccount(),
      }),
    );
    const txData = await dispatch(
      createDextradeSwapTransaction({
        from: {
          ...from,
          asset: from.asset.getToken(),
        },
        to: {
          ...to,
          asset: to.asset.getToken(),
        },
        exchangerSettings: {
          exchangeId: exchangeData.id,
          clientPaymentMethod: to.paymentMethod,
          exchangerPaymentMethod: exchangerSettings.paymentMethod,
          exchangerName: exchangerSettings.name,

          exchangerSettingsId: exchangerSettings.id,
          transactionFee: exchangerSettings.transactionFee,
        },
        // approveDeadline: new Date().getTime() + 30 * MINUTE,
        destinationAddress: exchangerSettings.walletAddress,
        exchangerType: ExchangerType.P2PClient,
      }),
    );

    await dispatch(setTradeTxId(txData.id));
  };
};

const otcSignAndSendTransactions = (props, options) => {
  return async (dispatch) => {
    const { from, to, exchange: exchangerSettings } = props;
    const { provider } = options;

    const { amount, asset: token } = from;
    const { balance, decimals } = token;

    const data = await dispatch(
      swapOtcExchangesStart(
        {
          coinFrom: from.asset,
          coinTo: to.asset,
          amount: from.amount,
        },
        provider,
      ),
    );

    const result = await dispatch(
      emulateTransaction({
        sendToken: token,
        amount,
        destinationAddress: data.depositAddress,
      }),
    );

    exchangerSettings.transactionFee = result.feeNormalized;

    const normalizeBalance = balance / 10 ** decimals;

    if (amount + result?.feeNormalized > normalizeBalance) {
      // await dispatch(
      //   setFromTokenInputValue(normalizeBalance - result?.feeNormalized || 0),
      // );
      // await dispatch(
      //   setFromTokenError(
      //     `Insufficient balance. Fee: ${result?.feeNormalized}`,
      //   ),
      // );
      // await dispatch(setBalanceError(true));
      // throw new Error(
      //   `Insufficient balance. Max amount: ${
      //     normalizeBalance - result?.feeNormalized
      //   }`,
      // );
    }

    const txData = await dispatch(
      createDextradeSwapTransaction({
        from: from.asset,
        to: to.asset,
        exchangerSettings: {
          exchangeId: data.id,
          provider,
          data,
        },
        // approveDeadline: new Date().getTime() + 30 * MINUTE,
        destinationAddress: data.depositAddress,
        exchangerType: ExchangerType.OTC,
      }),
    );

    txData.status = TransactionStatus.submitted;
    await dispatch(updateAndApproveP2PTransaction(txData));

    await dispatch(setTradeTxId(txData.id));
  };
};

const dexSignAndSendTransactions = (props, options) => {
  return async (dispatch, getState) => {
    const state = getState();
    const { from, to } = props;
    const { provider, approvalValue = from.amount } = options;
    await dispatch(actions.setDEXLoading());

    const { providers } = getSwapDEX(state);
    const providerState = providers[provider];
    if (!providerState) {
      throw new Error('Provider state not found!');
    }

    const params = {
      from: from.asset,
      to: to.asset,
      amount: from.amount,
      approvalValue,
    };

    const approveAllowanceData = await dispatch(
      swapExchangerGetAllowance(params, provider),
    );

    const newProviderState = {
      ...providerState,
      hasApproval: Boolean(approveAllowanceData?.hasApproval),
    };

    await dispatch(
      actions.updateDEXExchanges({
        providers: {
          ...providers,
          [provider]: newProviderState,
        },
      }),
    );

    if (!newProviderState?.hasApproval) {
      const approvalTxData = await dispatch(
        swapExchangerApprove(params, provider),
      );
      await dispatch(actions.setDEXLoading(false));
      return {
        provider: newProviderState,
        txMeta: approvalTxData,
      };
    }

    const swapTxMeta = await dispatch(
      swapExchangerByProvider(params, provider),
    );
    await dispatch(actions.setDEXLoading(false));
    return {
      provider: newProviderState,
      txMeta: swapTxMeta,
    };
  };
};

/*
 * TODO: see signAndSendTransactions props
 *  ui/pages/swaps/view-quote/view-quote.js 1070.
 */

/*
 * TODO: create browser history
 *  export const history = createBrowserHistory();
 *  import history...
 *  history.push()..
 */
export const signAndSendTransactions = (
  history,
  params = {
    fromInput: {},
    toInput: {},
    exchange: {},
  },
  options = { provider: '', redirectError: true },
) => {
  return async (dispatch, getState) => {
    const state = getState();
    const { metamask } = state;
    const { fromInput, toInput, exchange: exchangeData } = params;
    const { provider, redirectError } = options;

    const isOTC = Object.keys(metamask.swapsState.swapOTCProviders).includes(
      provider,
    );

    const isDEX = Object.keys(metamask.swapsState.swapDEXProviders).includes(
      provider,
    );

    const exchange = {
      ...exchangeData,
    };

    const from = {
      asset: fromInput.asset,
      amount: Number(fromInput.amount),
      paymentMethod: exchange.paymentMethod,
    };

    const to = {
      asset: toInput.asset,
      amount: Number(toInput.amount),
      paymentMethod: toInput.paymentMethod,
    };

    await dispatch(setBackgroundSwapRouteState('awaiting'));

    try {
      let swapSingAndSendAction;
      switch (true) {
        case isOTC:
          swapSingAndSendAction = otcSignAndSendTransactions;
          break;
        case isDEX:
          swapSingAndSendAction = dexSignAndSendTransactions;
          break;
        default:
          swapSingAndSendAction = p2pSignAndSendTransactions;
      }

      const swapParam = {
        from,
        to,
        exchange,
      };

      const result = await dispatch(swapSingAndSendAction(swapParam, options));

      await forceUpdateMetamaskState(dispatch);
      if (isDEX) {
        return result;
      }
      if (!isDEX) {
        history.push(AWAITING_SWAP_ROUTE);
      }
    } catch (e) {
      console.error(e);
      await dispatch(setSwapsErrorKey(SWAP_FAILED_ERROR));
      if (redirectError) {
        return history.push(SWAPS_ERROR_ROUTE);
      }
      throw new Error(e.message);
    }
  };
};

export function fetchMetaSwapsGasPriceEstimates() {
  return async (dispatch, getState) => {
    const state = getState();
    const chainId = getCurrentChainId(state);

    dispatch(swapGasPriceEstimatesFetchStarted());

    let priceEstimates;
    try {
      priceEstimates = await fetchSwapsGasPrices(chainId);
    } catch (e) {
      log.warn('Fetching swaps gas prices failed:', e);

      if (!e.message?.match(/NetworkError|Fetch failed with status:/u)) {
        throw e;
      }

      dispatch(swapGasPriceEstimatesFetchFailed());

      try {
        const gasPrice = await global.ethQuery.gasPrice();
        const gasPriceInDecGWEI = hexWEIToDecGWEI(gasPrice.toString(10));

        dispatch(retrievedFallbackSwapsGasPrice(gasPriceInDecGWEI));
        return null;
      } catch (networkGasPriceError) {
        console.error(
          `Failed to retrieve fallback gas price: `,
          networkGasPriceError,
        );
        return null;
      }
    }

    dispatch(
      swapGasPriceEstimatesFetchCompleted({
        priceEstimates,
      }),
    );
    return priceEstimates;
  };
}

export function fetchSwapsSmartTransactionFees({
  unsignedTransaction,
  approveTxParams,
  fallbackOnNotEnoughFunds = false,
}) {
  return async (dispatch, getState) => {
    const {
      swaps: { isFeatureFlagLoaded },
    } = getState();
    try {
      return await dispatch(
        fetchSmartTransactionFees(unsignedTransaction, approveTxParams),
      );
    } catch (e) {
      if (e.message.startsWith('Fetch error:') && isFeatureFlagLoaded) {
        const errorObj = parseSmartTransactionsError(e.message);
        if (
          fallbackOnNotEnoughFunds ||
          errorObj?.error !== StxErrorTypes.NOT_ENOUGH_FUNDS
        ) {
          dispatch(setCurrentSmartTransactionsError(errorObj?.error));
        }
      }
    }
    return null;
  };
}

export function cancelSwapsSmartTransaction(uuid) {
  return async (dispatch, getState) => {
    try {
      await dispatch(cancelSmartTransaction(uuid));
    } catch (e) {
      const {
        swaps: { isFeatureFlagLoaded },
      } = getState();
      if (e.message.startsWith('Fetch error:') && isFeatureFlagLoaded) {
        const errorObj = parseSmartTransactionsError(e.message);
        dispatch(setCurrentSmartTransactionsError(errorObj?.error));
      }
    }
  };
}

export function setSwapHeaderTitle(title = '') {
  return async (dispatch) => {
    dispatch(actions.setSwapHeaderTitle(title));
  };
}

// OTC
export function mountSwapsOTC() {
  return async (dispatch, getState) => {
    const state = getState();
    const { swapOTCProviders } = getSwapsState(state);
    const providers = Object.entries(swapOTCProviders).reduce((acc, [k, p]) => {
      if (p.enabled) {
        acc[k] = p;
      }
      return acc;
    }, {});
    dispatch(slice.actions.intiSwapOtc(providers));
  };
}

export function unmountSwapsOTC() {
  return async (dispatch) => {
    dispatch(slice.actions.updateOTCExchanges({ initialized: false }));
  };
}

// DEX
export function mountSwapsDEX() {
  return async (dispatch, getState) => {
    const state = getState();
    const { swapDEXProviders } = getSwapsState(state);
    const providers = Object.entries(swapDEXProviders).reduce((acc, [k, p]) => {
      if (p.enabled) {
        acc[k] = p;
      }
      return acc;
    }, {});
    dispatch(slice.actions.intiSwapDex(providers));
  };
}

export function unmountSwapsDEX() {
  return async (dispatch) => {
    dispatch(slice.actions.updateDEXExchanges({ initialized: false }));
    dispatch(slice.actions.setSwapHeaderTitle());
  };
}

// OTC/DEX

// TODO: refactor get rates OTC/DEX
export function getOTCRates(params) {
  return async (dispatch, getState) => {
    const state = getState();
    await dispatch(actions.setOTCLoading());

    const { coinTo: to, coinFrom: from, amount } = params;
    const ratesByProviders = await dispatch(
      swapGetOtcRates({ from, to, amount }),
    );

    const { providers: prevState } = getSwapOTC(state);
    const providers = Object.entries(ratesByProviders).reduce((acc, [k, v]) => {
      if (!prevState[k]) {
        acc[k] = v;
      }

      acc[k] = {
        ...prevState[k],
        ...v,
      };
      return acc;
    }, {});

    await dispatch(
      actions.updateOTCExchanges({
        loading: false,
        providers,
      }),
    );

    const ratesErrorCounter = Object.values(ratesByProviders).reduce(
      (acc, { error: ratesError }) => {
        if (ratesError) {
          acc += 1;
        }
        return acc;
      },
      0,
    );

    const providersLength = Object.keys(ratesByProviders).length;

    if (providersLength === ratesErrorCounter && providersLength > 1) {
      throw new Error('No available providers!');
    }
  };
}

export function updateDEXExchanges(nextState = {}) {
  return async (dispatch, getState) => {
    const state = getState();
    const prevState = getSwapDEX(state);
    await dispatch(
      actions.updateDEXExchanges({
        ...prevState,
        ...nextState,
      }),
    );
  };
}

export function setDEXExchangesLoading(loading) {
  return async (dispatch, getState) => {
    const state = getState();
    const prevState = getSwapDEX(state);
    await dispatch(
      actions.updateDEXExchanges({
        ...prevState,
        loading,
      }),
    );
  };
}

export function getDEXRates(params, provider) {
  return async (dispatch, getState) => {
    const state = getState();
    await dispatch(actions.setDEXLoading());
    const ratesByProviders = await dispatch(swapGetDexRates(params, provider));

    const { providers: prevState } = getSwapDEX(state);
    const providers = Object.entries(ratesByProviders).reduce((acc, [k, v]) => {
      if (!prevState[k]) {
        acc[k] = v;
      }

      acc[k] = {
        ...prevState[k],
        ...v,
      };
      return acc;
    }, {});

    await dispatch(
      actions.updateDEXExchanges({
        loading: false,
        providers,
      }),
    );
  };
}

export function getTransactionById(id) {
  return async () => {
    return await getTransactions({ searchCriteria: { id } });
  };
}
