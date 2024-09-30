import React, { useContext, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { isEqual } from 'lodash';
import { useHistory } from 'react-router-dom';
import { MetaMetricsContext } from '../../../../contexts/metametrics';
import { getBalances } from '../../../../ducks/metamask/metamask';

import {
  fetchQuotesAndSetQuoteState,
  setSwapsFromToken,
  getFromToken,
  getToToken,
  setReviewSwapClickedTimestamp,
  getSmartTransactionsOptInStatus,
  getSmartTransactionsEnabled,
  getCurrentSmartTransactionsEnabled,
  getFromTokenInputValue,
  getFromTokenError,
  getMaxSlippage,
  getIsFeatureFlagLoaded,
  getSmartTransactionFees,
} from '../../../../ducks/swaps/swaps';
import { isHardwareWallet, getHardwareWalletType } from '../../../../selectors';

import { usePrevious } from '../../../../hooks/usePrevious';
import { EVENT } from '../../../../../shared/constants/metametrics';

import {
  resetSwapsPostFetchState,
  clearSwapsQuotes,
  stopPollingForQuotes,
  clearSmartTransactionFees,
  p2pExchangesFilter,
} from '../../../../store/actions';
import { isEqualCaseInsensitive } from '../../../../../shared/modules/string-utils';

import { useDebouncedEffect } from '../../../../../shared/lib/use-debounced-effect';
import BuildQuoteInputs from '../build-quote-inputs';
import P2PExchanges from './p2p-exchanges';
import { SortTypes } from './constants';

const MAX_ALLOWED_SLIPPAGE = 15;
const PAGE_SIZE = 10;

let timeoutIdForQuotesPrefetching;

export default function P2pExchangesComponent(props) {
  const dispatch = useDispatch();
  const history = useHistory();
  const trackEvent = useContext(MetaMetricsContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState(SortTypes.byPrice);

  const isFeatureFlagLoaded = useSelector(getIsFeatureFlagLoaded);
  const tokensWithBalances = useSelector(getBalances, isEqual);
  const fromToken = useSelector(getFromToken, isEqual);
  const fromTokenInputValue = useSelector(getFromTokenInputValue);
  const fromTokenError = useSelector(getFromTokenError);
  const maxSlippage = useSelector(getMaxSlippage);
  const toToken = useSelector(getToToken, isEqual);

  const hardwareWalletUsed = useSelector(isHardwareWallet);
  const hardwareWalletType = useSelector(getHardwareWalletType);
  const smartTransactionsOptInStatus = useSelector(
    getSmartTransactionsOptInStatus,
  );
  const smartTransactionsEnabled = useSelector(getSmartTransactionsEnabled);
  const currentSmartTransactionsEnabled = useSelector(
    getCurrentSmartTransactionsEnabled,
  );
  const smartTransactionFees = useSelector(getSmartTransactionFees);

  const filterModel = {
    notSupportedCoins: [],
    amountInCoin1: fromTokenInputValue === '' ? undefined : fromTokenInputValue,
    fromNetworkName: fromToken?.network,
    fromTicker: fromToken?.symbol,
    orderBy: fromToken?.symbol && toToken?.symbol ? sortBy : undefined,
    toNetworkName: toToken?.network,
    toTicker: toToken?.symbol,
  };

  useDebouncedEffect(
    () => {
      dispatch(
        p2pExchangesFilter({
          model: filterModel,
          pagination: {
            page: 1,
            size: PAGE_SIZE,
          },
        }),
      );
      setCurrentPage(1);
    },
    [fromToken, toToken, fromTokenInputValue, sortBy],
    400,
  );

  // load more items
  useDebouncedEffect(
    () => {
      if (currentPage === 1) {
        return;
      }
      dispatch(
        p2pExchangesFilter(
          {
            model: filterModel,
            pagination: {
              page: currentPage,
              size: PAGE_SIZE,
            },
          },
          true,
        ),
      );
    },
    [currentPage],
    400,
  );

  const tokensWithBalancesFromToken = tokensWithBalances.find((token) =>
    isEqualCaseInsensitive(token.address, fromToken?.address),
  );
  const previousTokensWithBalancesFromToken = usePrevious(
    tokensWithBalancesFromToken,
  );

  useEffect(() => {
    const addressesAreTheSame = isEqualCaseInsensitive(
      tokensWithBalancesFromToken?.address,
      previousTokensWithBalancesFromToken?.address,
    );
    const balanceHasChanged =
      tokensWithBalancesFromToken?.balance !==
      previousTokensWithBalancesFromToken?.balance;
    if (addressesAreTheSame && balanceHasChanged) {
      dispatch(
        setSwapsFromToken({
          ...fromToken,
          balance: tokensWithBalancesFromToken?.balance,
          string: tokensWithBalancesFromToken?.string,
        }),
      );
    }
  }, [
    dispatch,
    tokensWithBalancesFromToken,
    previousTokensWithBalancesFromToken,
    fromToken,
  ]);

  const trackBuildQuotePageLoadedEvent = useCallback(() => {
    trackEvent({
      event: 'Build Quote Page Loaded',
      category: EVENT.CATEGORIES.SWAPS,
      sensitiveProperties: {
        is_hardware_wallet: hardwareWalletUsed,
        hardware_wallet_type: hardwareWalletType,
        stx_enabled: smartTransactionsEnabled,
        current_stx_enabled: currentSmartTransactionsEnabled,
        stx_user_opt_in: smartTransactionsOptInStatus,
      },
    });
  }, [
    trackEvent,
    hardwareWalletUsed,
    hardwareWalletType,
    smartTransactionsEnabled,
    currentSmartTransactionsEnabled,
    smartTransactionsOptInStatus,
  ]);

  useEffect(() => {
    dispatch(resetSwapsPostFetchState());
    dispatch(setReviewSwapClickedTimestamp());
    trackBuildQuotePageLoadedEvent();
  }, [dispatch, trackBuildQuotePageLoadedEvent]);

  useEffect(() => {
    if (smartTransactionsEnabled && smartTransactionFees?.tradeTxFees) {
      // We want to clear STX fees, because we only want to use fresh ones on the View Quote page.
      clearSmartTransactionFees();
    }
  }, [smartTransactionsEnabled, smartTransactionFees]);

  const isReviewSwapButtonDisabled =
    fromTokenError ||
    !isFeatureFlagLoaded ||
    !Number(fromTokenInputValue) ||
    Number(maxSlippage) < 0 ||
    Number(maxSlippage) > MAX_ALLOWED_SLIPPAGE;

  // It's triggered every time there is a change in form values (token from, token to, amount and slippage).
  useEffect(() => {
    dispatch(clearSwapsQuotes());
    dispatch(stopPollingForQuotes());
    const prefetchQuotesWithoutRedirecting = async () => {
      const pageRedirectionDisabled = true;
      await dispatch(
        fetchQuotesAndSetQuoteState(
          history,
          fromTokenInputValue,
          maxSlippage,
          trackEvent,
          pageRedirectionDisabled,
        ),
      );
    };
    // Delay fetching quotes until a user is done typing an input value. If they type a new char in less than a second,
    // we will cancel previous setTimeout call and start running a new one.
    timeoutIdForQuotesPrefetching = setTimeout(() => {
      timeoutIdForQuotesPrefetching = null;
      if (!isReviewSwapButtonDisabled) {
        // Only do quotes prefetching if the Review swap button is enabled.
        prefetchQuotesWithoutRedirecting();
      }
    }, 1000);
    return () => clearTimeout(timeoutIdForQuotesPrefetching);
  }, [
    dispatch,
    history,
    maxSlippage,
    trackEvent,
    isReviewSwapButtonDisabled,
    fromTokenInputValue,
    smartTransactionsOptInStatus,
  ]);

  return (
    <>
      <BuildQuoteInputs {...props} />
      <div className="build-quote__exchangers">
        <P2PExchanges
          fromTokenInputValue={fromTokenInputValue}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          sort={sortBy}
          onChangeSort={setSortBy}
        />
      </div>
    </>
  );
}

P2pExchangesComponent.propTypes = {
  ethBalance: PropTypes.string,
};
