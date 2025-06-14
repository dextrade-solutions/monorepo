import React, {
  useEffect,
  useRef,
  useContext,
  useState,
  useCallback,
} from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  Switch,
  Route,
  useLocation,
  useHistory,
  Redirect,
} from 'react-router-dom';
import { shuffle, isEqual } from 'lodash';
import { I18nContext } from '../../contexts/i18n';
import {
  getSelectedAccount,
  getCurrentChainId,
  getIsSwapsChain,
  isHardwareWallet,
  getHardwareWalletType,
  getTokenList,
} from '../../selectors/selectors';
import {
  getQuotes,
  clearSwapsState,
  getTradeTxId,
  getApproveTxId,
  getFetchingQuotes,
  setTopAssets,
  getFetchParams,
  setAggregatorMetadata,
  getAggregatorMetadata,
  getBackgroundSwapRouteState,
  getSwapsErrorKey,
  getSwapsFeatureIsLive,
  prepareToLeaveSwaps,
  fetchAndSetSwapsGasPriceInfo,
  getReviewSwapClickedTimestamp,
  getPendingSmartTransactions,
  getSmartTransactionsOptInStatus,
  getSmartTransactionsEnabled,
  getCurrentSmartTransactionsEnabled,
  getCurrentSmartTransactionsError,
  navigateBackToBuildQuote,
  getSwapsHeaderTitle,
} from '../../ducks/swaps/swaps';
import {
  checkNetworkAndAccountSupports1559,
  currentNetworkTxListSelector,
} from '../../selectors';
import {
  AWAITING_SIGNATURES_ROUTE,
  AWAITING_SWAP_ROUTE,
  SMART_TRANSACTION_STATUS_ROUTE,
  BUILD_QUOTE_ROUTE,
  VIEW_QUOTE_ROUTE,
  LOADING_QUOTES_ROUTE,
  SWAPS_ERROR_ROUTE,
  DEFAULT_ROUTE,
  SWAPS_MAINTENANCE_ROUTE,
  VIEW_OTC_ROUTE,
  VIEW_DEX_ROUTE,
} from '../../helpers/constants/routes';
import {
  ERROR_FETCHING_QUOTES,
  QUOTES_NOT_AVAILABLE_ERROR,
  SWAP_FAILED_ERROR,
  CONTRACT_DATA_DISABLED_ERROR,
  OFFLINE_FOR_MAINTENANCE,
  EXPIRED_ERROR,
} from '../../../shared/constants/swaps';

import {
  resetBackgroundSwapsState,
  ignoreTokens,
  setBackgroundSwapRouteState,
  setSwapsErrorKey,
  setDefaultSwapsActiveTabName,
} from '../../store/actions';

import FeatureToggledRoute from '../../helpers/higher-order-components/feature-toggled-route';
import { EVENT } from '../../../shared/constants/metametrics';
import { TransactionStatus } from '../../../shared/constants/transaction';
import { MetaMetricsContext } from '../../contexts/metametrics';
import { getSwapsTokensReceivedFromTxMeta } from '../../../shared/lib/transactions-controller-utils';
import { ExchangeP2PStatus } from '../../../shared/constants/exchanger';
import { EXCHANGER_TAB_NAME } from './build-quote/exchanges-tabs';
import { fetchTopAssets, fetchAggregatorMetadata } from './swaps.util';
import AwaitingSignatures from './awaiting-signatures';
import SmartTransactionStatus from './smart-transaction-status';
import AwaitingSwap from './awaiting-swap';
import LoadingQuote from './loading-swaps-quotes';
import BuildQuote from './build-quote';
import ViewP2PExchange from './view-p2p-exchange/view-p2p-exchange';
import ViewOTCExchange from './view-otc-exchange';
import ViewDEXExchange from './view-dex-exchange';

export default function Swap() {
  const t = useContext(I18nContext);
  const history = useHistory();
  const dispatch = useDispatch();
  const trackEvent = useContext(MetaMetricsContext);

  const { pathname } = useLocation();
  const isAwaitingSwapRoute = pathname === AWAITING_SWAP_ROUTE;
  const isAwaitingSignaturesRoute = pathname === AWAITING_SIGNATURES_ROUTE;
  const isSwapsErrorRoute = pathname === SWAPS_ERROR_ROUTE;
  const isLoadingQuotesRoute = pathname === LOADING_QUOTES_ROUTE;
  const isSmartTransactionStatusRoute =
    pathname === SMART_TRANSACTION_STATUS_ROUTE;
  const isViewQuoteRoute = pathname.includes(VIEW_QUOTE_ROUTE);
  const isViewOTCRoute = pathname.includes(VIEW_OTC_ROUTE);
  const isViewDEXRoute = pathname.includes(VIEW_DEX_ROUTE);

  const [currentStxErrorTracked, setCurrentStxErrorTracked] = useState(false);
  const fetchParams = useSelector(getFetchParams, isEqual);
  const { destinationTokenInfo = {} } = fetchParams?.metaData || {};

  const routeState = useSelector(getBackgroundSwapRouteState);
  const selectedAccount = useSelector(getSelectedAccount, shallowEqual);
  const quotes = useSelector(getQuotes, isEqual);
  const txList = useSelector(currentNetworkTxListSelector, shallowEqual);
  const tradeTxId = useSelector(getTradeTxId);
  const approveTxId = useSelector(getApproveTxId);
  const aggregatorMetadata = useSelector(getAggregatorMetadata, shallowEqual);
  const fetchingQuotes = useSelector(getFetchingQuotes);
  const swapHeaderTitle = useSelector(getSwapsHeaderTitle);
  let swapsErrorKey = useSelector(getSwapsErrorKey);
  const swapsEnabled = useSelector(getSwapsFeatureIsLive);
  const chainId = useSelector(getCurrentChainId);
  const isSwapsChain = useSelector(getIsSwapsChain);
  const networkAndAccountSupports1559 = useSelector(
    checkNetworkAndAccountSupports1559,
  );
  const tokenList = useSelector(getTokenList, isEqual);
  const shuffledTokensList = shuffle(Object.values(tokenList));
  const reviewSwapClickedTimestamp = useSelector(getReviewSwapClickedTimestamp);
  const pendingSmartTransactions = useSelector(getPendingSmartTransactions);
  const reviewSwapClicked = Boolean(reviewSwapClickedTimestamp);
  const smartTransactionsOptInStatus = useSelector(
    getSmartTransactionsOptInStatus,
  );
  const smartTransactionsEnabled = useSelector(getSmartTransactionsEnabled);
  const currentSmartTransactionsEnabled = useSelector(
    getCurrentSmartTransactionsEnabled,
  );
  const currentSmartTransactionsError = useSelector(
    getCurrentSmartTransactionsError,
  );
  const defaultSwapsActiveTabName = useSelector(
    ({ metamask }) => metamask.defaultSwapsActiveTabName,
  );

  useEffect(() => {
    const leaveSwaps = async () => {
      await dispatch(prepareToLeaveSwaps());
      // We need to wait until "prepareToLeaveSwaps" is done, because otherwise
      // a user would be redirected from DEFAULT_ROUTE back to Swaps.
      history.push(DEFAULT_ROUTE);
    };

    if (!isSwapsChain) {
      leaveSwaps();
    }
  }, [isSwapsChain, dispatch, history]);

  // This will pre-load gas fees before going to the View Quote page.
  // useGasFeeEstimates();

  const { balance: ethBalance, address: selectedAccountAddress } =
    selectedAccount;

  const { destinationTokenAddedForSwap } = fetchParams || {};
  const approveTxData =
    approveTxId && txList.find(({ id }) => approveTxId === id);
  const tradeTxData = tradeTxId && txList.find(({ id }) => tradeTxId === id);
  const tokensReceived =
    tradeTxData?.txReceipt &&
    getSwapsTokensReceivedFromTxMeta(
      destinationTokenInfo?.symbol,
      tradeTxData,
      destinationTokenInfo?.address,
      selectedAccountAddress,
      destinationTokenInfo?.decimals,
      approveTxData,
      chainId,
    );

  if (tradeTxData?.exchangerSettings?.status === ExchangeP2PStatus.expired) {
    swapsErrorKey = EXPIRED_ERROR;
  }

  const tradeConfirmed = tradeTxData?.status === TransactionStatus.confirmed;

  const approveError = tradeTxData?.status === TransactionStatus.rejected;
  const tradeError =
    tradeTxData?.status === TransactionStatus.failed ||
    tradeTxData?.txReceipt?.status === '0x0';
  const conversionError = approveError || tradeError;

  if (conversionError && swapsErrorKey !== CONTRACT_DATA_DISABLED_ERROR) {
    swapsErrorKey = SWAP_FAILED_ERROR;
  }

  const clearTemporaryTokenRef = useRef();
  useEffect(() => {
    clearTemporaryTokenRef.current = () => {
      if (
        destinationTokenAddedForSwap &&
        (!isAwaitingSwapRoute || conversionError)
      ) {
        dispatch(
          ignoreTokens({
            tokensToIgnore: destinationTokenInfo?.address,
            dontShowLoadingIndicator: true,
          }),
        );
      }
    };
  }, [
    conversionError,
    dispatch,
    destinationTokenAddedForSwap,
    destinationTokenInfo,
    fetchParams,
    isAwaitingSwapRoute,
  ]);
  useEffect(() => {
    return () => {
      clearTemporaryTokenRef.current();
    };
  }, []);

  useEffect(() => {
    if (!isSwapsChain) {
      return undefined;
    }
    fetchTopAssets(chainId).then((topAssets) => {
      dispatch(setTopAssets(topAssets));
    });
    fetchAggregatorMetadata(chainId).then((newAggregatorMetadata) => {
      dispatch(setAggregatorMetadata(newAggregatorMetadata));
    });
    if (!networkAndAccountSupports1559) {
      dispatch(fetchAndSetSwapsGasPriceInfo(chainId));
    }
    return () => {
      dispatch(prepareToLeaveSwaps());
    };
  }, [dispatch, chainId, networkAndAccountSupports1559, isSwapsChain]);

  const hardwareWalletUsed = useSelector(isHardwareWallet);
  const hardwareWalletType = useSelector(getHardwareWalletType);
  const trackExitedSwapsEvent = () => {
    trackEvent({
      event: 'Exited Swaps',
      category: EVENT.CATEGORIES.SWAPS,
      sensitiveProperties: {
        token_from: fetchParams?.sourceTokenInfo?.symbol,
        token_from_amount: fetchParams?.value,
        request_type: fetchParams?.balanceError,
        token_to: fetchParams?.destinationTokenInfo?.symbol,
        slippage: fetchParams?.slippage,
        custom_slippage: fetchParams?.slippage !== 2,
        current_screen: pathname.match(/\/swaps\/(.+)/u)[1],
        is_hardware_wallet: hardwareWalletUsed,
        hardware_wallet_type: hardwareWalletType,
        stx_enabled: smartTransactionsEnabled,
        current_stx_enabled: currentSmartTransactionsEnabled,
        stx_user_opt_in: smartTransactionsOptInStatus,
      },
    });
  };
  const exitEventRef = useRef();
  useEffect(() => {
    exitEventRef.current = () => {
      trackExitedSwapsEvent();
    };
  });

  useEffect(() => {
    // If there is a swapsErrorKey and reviewSwapClicked is false, there was an error in silent quotes prefetching
    // and we don't want to show the error page in that case, because another API call for quotes can be successful.
    if (swapsErrorKey && !isSwapsErrorRoute && reviewSwapClicked) {
      history.push(SWAPS_ERROR_ROUTE);
    }
  }, [history, swapsErrorKey, isSwapsErrorRoute, reviewSwapClicked]);

  const beforeUnloadEventAddedRef = useRef();
  useEffect(() => {
    const fn = () => {
      clearTemporaryTokenRef.current();
      if (isLoadingQuotesRoute) {
        dispatch(prepareToLeaveSwaps());
      }
      return null;
    };
    if (isLoadingQuotesRoute && !beforeUnloadEventAddedRef.current) {
      beforeUnloadEventAddedRef.current = true;
      window.addEventListener('beforeunload', fn);
    }
    return () => window.removeEventListener('beforeunload', fn);
  }, [dispatch, isLoadingQuotesRoute]);

  const trackErrorStxEvent = useCallback(() => {
    trackEvent({
      event: 'Error Smart Transactions',
      category: EVENT.CATEGORIES.SWAPS,
      sensitiveProperties: {
        token_from: fetchParams?.sourceTokenInfo?.symbol,
        token_from_amount: fetchParams?.value,
        request_type: fetchParams?.balanceError,
        token_to: fetchParams?.destinationTokenInfo?.symbol,
        slippage: fetchParams?.slippage,
        custom_slippage: fetchParams?.slippage !== 2,
        current_screen: pathname.match(/\/swaps\/(.+)/u)[1],
        is_hardware_wallet: hardwareWalletUsed,
        hardware_wallet_type: hardwareWalletType,
        stx_enabled: smartTransactionsEnabled,
        current_stx_enabled: currentSmartTransactionsEnabled,
        stx_user_opt_in: smartTransactionsOptInStatus,
        stx_error: currentSmartTransactionsError,
      },
    });
  }, [
    currentSmartTransactionsError,
    currentSmartTransactionsEnabled,
    trackEvent,
    fetchParams?.balanceError,
    fetchParams?.destinationTokenInfo?.symbol,
    fetchParams?.slippage,
    fetchParams?.sourceTokenInfo?.symbol,
    fetchParams?.value,
    hardwareWalletType,
    hardwareWalletUsed,
    pathname,
    smartTransactionsEnabled,
    smartTransactionsOptInStatus,
  ]);

  useEffect(() => {
    if (currentSmartTransactionsError && !currentStxErrorTracked) {
      setCurrentStxErrorTracked(true);
      trackErrorStxEvent();
    }
  }, [
    currentSmartTransactionsError,
    trackErrorStxEvent,
    currentStxErrorTracked,
  ]);

  // SET DEFAULT TAB
  useEffect(() => {
    const exchangerTabName = swapsEnabled
      ? EXCHANGER_TAB_NAME.P2P
      : EXCHANGER_TAB_NAME.OTC;
    dispatch(setDefaultSwapsActiveTabName(exchangerTabName));
  }, [dispatch, swapsEnabled]);

  if (!isSwapsChain) {
    // A user is being redirected outside of Swaps via the async "leaveSwaps" function above. In the meantime
    // we have to prevent the code below this condition, which wouldn't work on an unsupported chain.
    return <></>;
  }

  return (
    <div className="swaps">
      <div className="swaps__container">
        <div className="swaps__header">
          <div
            className="swaps__header-edit"
            onClick={async () => {
              await dispatch(navigateBackToBuildQuote(history));
            }}
          >
            {(isViewQuoteRoute || isViewOTCRoute || isViewDEXRoute) &&
              t('edit')}
          </div>
          <div className="swaps__title">{swapHeaderTitle || t('swap')}</div>
          <div
            className="swaps__header-cancel"
            onClick={async () => {
              clearTemporaryTokenRef.current();
              history.push(DEFAULT_ROUTE);
              dispatch(clearSwapsState());
              dispatch(resetBackgroundSwapsState());
            }}
          >
            {!isAwaitingSwapRoute &&
              !isAwaitingSignaturesRoute &&
              !isSmartTransactionStatusRoute &&
              t('cancel')}
          </div>
        </div>
        <div className="swaps__content">
          <Switch>
            <FeatureToggledRoute
              redirectRoute={SWAPS_MAINTENANCE_ROUTE}
              flag={
                swapsEnabled ||
                defaultSwapsActiveTabName === EXCHANGER_TAB_NAME.OTC
              }
              path={BUILD_QUOTE_ROUTE}
              exact
              render={() => {
                if (tradeTxData && !conversionError) {
                  return <Redirect to={{ pathname: AWAITING_SWAP_ROUTE }} />;
                } else if (tradeTxData && routeState) {
                  return <Redirect to={{ pathname: SWAPS_ERROR_ROUTE }} />;
                } else if (routeState === 'loading' && aggregatorMetadata) {
                  return <Redirect to={{ pathname: LOADING_QUOTES_ROUTE }} />;
                }

                return (
                  <BuildQuote
                    swapsEnabled={swapsEnabled}
                    ethBalance={ethBalance}
                    selectedAccountAddress={selectedAccountAddress}
                    shuffledTokensList={shuffledTokensList}
                  />
                );
              }}
            />
            <FeatureToggledRoute
              redirectRoute={BUILD_QUOTE_ROUTE}
              flag={swapsEnabled}
              path={`${VIEW_QUOTE_ROUTE}/:id?`}
              exact
              render={({
                match: {
                  params: { id },
                },
              }) => {
                if (
                  pendingSmartTransactions.length > 0 &&
                  routeState === 'smartTransactionStatus'
                ) {
                  return (
                    <Redirect
                      to={{ pathname: SMART_TRANSACTION_STATUS_ROUTE }}
                    />
                  );
                }
                if (id) {
                  return <ViewP2PExchange id={id} />;
                }
                return <Redirect to={{ pathname: BUILD_QUOTE_ROUTE }} />;
              }}
            />
            <FeatureToggledRoute
              redirectRoute={BUILD_QUOTE_ROUTE}
              flag={swapsEnabled}
              path={`${VIEW_OTC_ROUTE}/:provider`}
              exact
              render={({
                match: {
                  params: { provider },
                },
              }) => {
                if (
                  pendingSmartTransactions.length > 0 &&
                  routeState === 'smartTransactionStatus'
                ) {
                  return (
                    <Redirect
                      to={{ pathname: SMART_TRANSACTION_STATUS_ROUTE }}
                    />
                  );
                }
                if (provider) {
                  return <ViewOTCExchange provider={provider} />;
                }
                return <Redirect to={{ pathname: BUILD_QUOTE_ROUTE }} />;
              }}
            />
            <FeatureToggledRoute
              redirectRoute={BUILD_QUOTE_ROUTE}
              flag={swapsEnabled}
              path={`${VIEW_DEX_ROUTE}/:provider`}
              exact
              render={({
                match: {
                  params: { provider },
                },
              }) => {
                if (
                  pendingSmartTransactions.length > 0 &&
                  routeState === 'smartTransactionStatus'
                ) {
                  return (
                    <Redirect
                      to={{ pathname: SMART_TRANSACTION_STATUS_ROUTE }}
                    />
                  );
                }
                if (provider) {
                  return <ViewDEXExchange provider={provider} />;
                }
                return <Redirect to={{ pathname: BUILD_QUOTE_ROUTE }} />;
              }}
            />
            <Route
              path={SWAPS_ERROR_ROUTE}
              exact
              render={() => {
                if (swapsErrorKey) {
                  return (
                    <AwaitingSwap
                      swapComplete={false}
                      errorKey={swapsErrorKey}
                      txId={tradeTxData}
                    />
                  );
                }
                return <Redirect to={{ pathname: BUILD_QUOTE_ROUTE }} />;
              }}
            />
            <FeatureToggledRoute
              redirectRoute={SWAPS_MAINTENANCE_ROUTE}
              flag={swapsEnabled}
              path={LOADING_QUOTES_ROUTE}
              exact
              render={() => {
                return aggregatorMetadata ? (
                  <LoadingQuote
                    loadingComplete={
                      !fetchingQuotes && Boolean(Object.values(quotes).length)
                    }
                    onDone={async () => {
                      await dispatch(setBackgroundSwapRouteState(''));
                      if (
                        swapsErrorKey === ERROR_FETCHING_QUOTES ||
                        swapsErrorKey === QUOTES_NOT_AVAILABLE_ERROR
                      ) {
                        dispatch(setSwapsErrorKey(QUOTES_NOT_AVAILABLE_ERROR));
                        history.push(SWAPS_ERROR_ROUTE);
                      } else {
                        history.push(VIEW_QUOTE_ROUTE);
                      }
                    }}
                    aggregatorMetadata={aggregatorMetadata}
                  />
                ) : (
                  <Redirect to={{ pathname: BUILD_QUOTE_ROUTE }} />
                );
              }}
            />
            <Route
              path={SWAPS_MAINTENANCE_ROUTE}
              exact
              render={() => {
                return swapsEnabled === false ? (
                  <AwaitingSwap errorKey={OFFLINE_FOR_MAINTENANCE} />
                ) : (
                  <Redirect to={{ pathname: BUILD_QUOTE_ROUTE }} />
                );
              }}
            />
            <Route
              path={AWAITING_SIGNATURES_ROUTE}
              exact
              render={() => {
                return <AwaitingSignatures />;
              }}
            />
            <Route
              path={SMART_TRANSACTION_STATUS_ROUTE}
              exact
              render={() => {
                return <SmartTransactionStatus txId={tradeTxData?.id} />;
              }}
            />
            <Route
              path={AWAITING_SWAP_ROUTE}
              exact
              render={() => {
                return routeState === 'awaiting' || tradeTxData ? (
                  <AwaitingSwap
                    swapComplete={tradeConfirmed}
                    errorKey={swapsErrorKey}
                    tokensReceived={tokensReceived}
                    transaction={tradeTxData}
                  />
                ) : (
                  <Redirect to={{ pathname: DEFAULT_ROUTE }} />
                );
              }}
            />
          </Switch>
        </div>
      </div>
    </div>
  );
}
