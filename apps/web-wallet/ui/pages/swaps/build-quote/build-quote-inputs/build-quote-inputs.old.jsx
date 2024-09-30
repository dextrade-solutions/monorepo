import React, { useContext, useEffect, useState, useCallback } from 'react';
import BigNumber from 'bignumber.js';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import classnames from 'classnames';
import { isEqual } from 'lodash';
import { MetaMetricsContext } from '../../../../contexts/metametrics';
import { useTokensToSearch } from '../../../../hooks/useTokensToSearch';
import { useEqualityCheck } from '../../../../hooks/useEqualityCheck';
import { I18nContext } from '../../../../contexts/i18n';
import DropdownInputPair from '../../dropdown-input-pair';
import DropdownSearchList from '../../dropdown-search-list';
import { getBalances } from '../../../../ducks/metamask/metamask';

import {
  setSwapsFromToken,
  setSwapToToken,
  getFromToken,
  getToToken,
  getBalanceError,
  getTopAssets,
  getFetchParams,
  setBalanceError,
  setFromTokenInputValue,
  setFromTokenError,
  setReviewSwapClickedTimestamp,
  getSmartTransactionsOptInStatus,
  getSmartTransactionsEnabled,
  getCurrentSmartTransactionsEnabled,
  getFromTokenInputValue,
  getFromTokenError,
  getSmartTransactionFees,
} from '../../../../ducks/swaps/swaps';
import {
  getCurrentChainId,
  isHardwareWallet,
  getHardwareWalletType,
  getUseCurrencyRateCheck,
} from '../../../../selectors';

import { usePrevious } from '../../../../hooks/usePrevious';
import { useTokenFiatAmount } from '../../../../hooks/useTokenFiatAmount';

import {
  isSwapsDefaultTokenAddress,
  isSwapsDefaultTokenSymbol,
} from '../../../../../shared/modules/swaps.utils';
import { EVENT } from '../../../../../shared/constants/metametrics';
import {
  SWAPS_CHAINID_DEFAULT_TOKEN_MAP,
  TokenBucketPriority,
} from '../../../../../shared/constants/swaps';

import {
  resetSwapsPostFetchState,
  ignoreTokens,
  clearSmartTransactionFees,
} from '../../../../store/actions';
import { countDecimals, fetchTokenPrice } from '../../swaps.util';
import { isEqualCaseInsensitive } from '../../../../../shared/modules/string-utils';
import { calcTokenAmount } from '../../../../../shared/lib/transactions-controller-utils';

import {
  getValueFromWeiHex,
  hexToDecimal,
} from '../../../../../shared/modules/conversion.utils';
import { useInputChange } from '../../swaps-inputs/hooks/useInputChange';

const fuseSearchKeys = [
  { name: 'name', weight: 0.499 },
  { name: 'symbol', weight: 0.499 },
  { name: 'address', weight: 0.002 },
];

// TODO: refactor component. get only input actions
export default function BuildQuoteInputs({ ethBalance, shuffledTokensList }) {
  const t = useContext(I18nContext);
  const dispatch = useDispatch();
  const trackEvent = useContext(MetaMetricsContext);

  const [fetchedTokenExchangeRate, setFetchedTokenExchangeRate] =
    useState(undefined);
  const [verificationClicked, setVerificationClicked] = useState(false);
  const balanceError = useSelector(getBalanceError);
  const fetchParams = useSelector(getFetchParams, isEqual);
  const tokensWithBalances = useSelector(getBalances, isEqual);
  const topAssets = useSelector(getTopAssets, isEqual);
  const fromToken = useSelector(getFromToken, isEqual);
  const fromTokenInputValue = useSelector(getFromTokenInputValue);
  const fromTokenError = useSelector(getFromTokenError);
  const toToken = useSelector(getToToken, isEqual);
  const chainId = useSelector(getCurrentChainId);

  const useCurrencyRateCheck = useSelector(getUseCurrencyRateCheck);
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

  const [onInputChange] = useInputChange();
  // If the fromToken was set in a call to `onFromSelect` (see below), and that from token has a balance
  // but is not in tokensWithBalances or tokens, then we want to add it to the usersTokens array so that
  // the balance of the token can appear in the from token selection dropdown
  const fromTokenArray =
    !isSwapsDefaultTokenSymbol(fromToken?.symbol, chainId) && fromToken?.balance
      ? [fromToken]
      : [];
  // const usersTokens = uniqBy(
  //   [...tokensWithBalances, ...fromTokenArray],
  //   'address',
  // );
  const usersTokens = [...tokensWithBalances, ...fromTokenArray];
  const memoizedUsersTokens = useEqualityCheck(usersTokens);
  const selectedFromToken = fromToken;
  const tokensToSearchSwapFrom = useTokensToSearch({
    usersTokens: memoizedUsersTokens,
    topTokens: topAssets,
    shuffledTokensList: [],
    tokenBucketPriority: TokenBucketPriority.owned,
    hideZeroBalances: true,
  });

  const selectedToToken =
    tokensToSearchSwapFrom.find(({ address }) =>
      isEqualCaseInsensitive(address, toToken?.address),
    ) || toToken;

  const tokensToSearchSwapTo = useTokensToSearch({
    usersTokens: memoizedUsersTokens,
    topTokens: topAssets,
    shuffledTokensList,
    tokenBucketPriority: TokenBucketPriority.top,
    excludesList: [selectedFromToken, selectedToToken].filter((token) =>
      Boolean(token),
    ),
  });

  const {
    address: fromTokenAddress,
    symbol: fromTokenSymbol,
    string: fromTokenString,
    decimals: fromTokenDecimals,
    balance: rawFromTokenBalance,
  } = selectedFromToken || {};

  const fromTokenBalance =
    rawFromTokenBalance &&
    calcTokenAmount(rawFromTokenBalance, fromTokenDecimals).toString(10);

  const prevFromTokenBalance = usePrevious(fromTokenBalance);
  const swapFromTokenFiatValue = useTokenFiatAmount(
    fromTokenAddress,
    fromTokenInputValue || 0,
    fromTokenSymbol,
    {
      showFiat: useCurrencyRateCheck,
    },
    true,
  );

  const onFromSelect = (token) => {
    if (
      token?.address &&
      !swapFromTokenFiatValue &&
      fetchedTokenExchangeRate !== null
    ) {
      fetchTokenPrice(token.address).then((rate) => {
        if (rate !== null && rate !== undefined) {
          setFetchedTokenExchangeRate(rate);
        }
      });
    } else {
      setFetchedTokenExchangeRate(null);
    }
    dispatch(setSwapsFromToken(token));
    onInputChange(
      token?.address ? fromTokenInputValue : '',
      token.string,
      token.decimals,
    );
  };

  const { destinationTokenAddedForSwap } = fetchParams || {};
  const { address: toAddress } = toToken || {};
  const onToSelect = useCallback(
    (token) => {
      if (destinationTokenAddedForSwap && token.address !== toAddress) {
        dispatch(
          ignoreTokens({
            tokensToIgnore: toAddress,
            dontShowLoadingIndicator: true,
          }),
        );
      }
      dispatch(setSwapToToken(token));
      setVerificationClicked(false);
    },
    [dispatch, destinationTokenAddedForSwap, toAddress],
  );

  const hideDropdownItemIf = useCallback(
    (item) => isEqualCaseInsensitive(item.address, fromTokenAddress),
    [fromTokenAddress],
  );

  const tokensWithBalancesFromToken = tokensWithBalances.find((token) =>
    isEqualCaseInsensitive(token.address, fromToken?.address),
  );
  const previousTokensWithBalancesFromToken = usePrevious(
    tokensWithBalancesFromToken,
  );

  useEffect(() => {
    const notDefault = !isSwapsDefaultTokenAddress(
      tokensWithBalancesFromToken?.address,
      chainId,
    );
    const addressesAreTheSame = isEqualCaseInsensitive(
      tokensWithBalancesFromToken?.address,
      previousTokensWithBalancesFromToken?.address,
    );
    const balanceHasChanged =
      tokensWithBalancesFromToken?.balance !==
      previousTokensWithBalancesFromToken?.balance;
    if (notDefault && addressesAreTheSame && balanceHasChanged) {
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
    chainId,
  ]);

  // If the eth balance changes while on build quote, we update the selected from token
  useEffect(() => {
    if (
      isSwapsDefaultTokenAddress(fromToken?.address, chainId) &&
      fromToken?.balance !== hexToDecimal(ethBalance)
    ) {
      dispatch(
        setSwapsFromToken({
          ...fromToken,
          balance: hexToDecimal(ethBalance),
          string: getValueFromWeiHex({
            value: ethBalance,
            numberOfDecimals: 4,
            toDenomination: 'ETH',
          }),
        }),
      );
    }
  }, [dispatch, fromToken, ethBalance, chainId]);

  useEffect(() => {
    if (prevFromTokenBalance !== fromTokenBalance) {
      onInputChange(fromTokenInputValue, fromTokenBalance);
    }
  }, [
    onInputChange,
    prevFromTokenBalance,
    fromTokenInputValue,
    fromTokenBalance,
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

  const swapYourTokenBalance = t('swapYourTokenBalance', [
    fromTokenString || '0',
    fromTokenSymbol || SWAPS_CHAINID_DEFAULT_TOKEN_MAP[chainId]?.symbol || '',
  ]);

  return (
    <>
      <div className="build-quote__dropdown-input-pair-header">
        <div className="build-quote__input-label">{t('swapSwapFrom')}</div>
        {!isSwapsDefaultTokenSymbol(fromTokenSymbol, chainId) && (
          <div
            className="build-quote__max-button"
            data-testid="build-quote__max-button"
            onClick={() =>
              onInputChange(fromTokenBalance || '0', fromTokenBalance)
            }
          >
            {t('max')}
          </div>
        )}
      </div>
      <DropdownInputPair
        onSelect={onFromSelect}
        itemsToSearch={tokensToSearchSwapFrom}
        onInputChange={(value) => {
          /* istanbul ignore next */
          onInputChange(value, fromTokenBalance);
        }}
        inputValue={fromTokenInputValue}
        leftValue={fromTokenInputValue && swapFromTokenFiatValue}
        selectedItem={selectedFromToken}
        maxListItems={30}
        selectPlaceHolderText={t('swapSelect')}
        hideItemIf={(item) =>
          isEqualCaseInsensitive(item.address, selectedToToken?.address)
        }
        listContainerClassName="build-quote__open-dropdown"
        autoFocus
      />
      <div
        className={classnames('build-quote__balance-message', {
          'build-quote__balance-message--error': balanceError || fromTokenError,
        })}
      >
        {!fromTokenError &&
          !balanceError &&
          fromTokenSymbol &&
          swapYourTokenBalance}
        {!fromTokenError && balanceError && fromTokenSymbol && (
          <div className="build-quite__insufficient-funds">
            <div className="build-quite__insufficient-funds-first">
              {t('swapsNotEnoughForTx', [fromTokenSymbol])}
            </div>
            <div className="build-quite__insufficient-funds-second">
              {swapYourTokenBalance}
            </div>
          </div>
        )}
        {fromTokenError && (
          <>
            <div className="build-quote__form-error">
              {t('swapTooManyDecimalsError', [
                fromTokenSymbol,
                fromTokenDecimals,
              ])}
            </div>
            <div>{swapYourTokenBalance}</div>
          </>
        )}
      </div>
      <div className="build-quote__swap-arrows-row">
        <button
          className="build-quote__swap-arrows"
          data-testid="build-quote__swap-arrows"
          onClick={() => {
            onToSelect(selectedFromToken);
            onFromSelect(selectedToToken);
          }}
        >
          <i className="fa fa-arrow-up" title={t('swapSwapSwitch')} />
          <i className="fa fa-arrow-down" title={t('swapSwapSwitch')} />
        </button>
      </div>
      <div className="build-quote__dropdown-swap-to-header">
        <div className="build-quote__input-label">{t('swapSwapTo')}</div>
      </div>
      <div className="dropdown-input-pair dropdown-input-pair__to">
        <DropdownSearchList
          startingItem={selectedToToken}
          itemsToSearch={tokensToSearchSwapTo}
          fuseSearchKeys={fuseSearchKeys}
          selectPlaceHolderText={t('swapSelectAToken')}
          maxListItems={30}
          onSelect={onToSelect}
          externallySelectedItem={selectedToToken}
          hideItemIf={hideDropdownItemIf}
          listContainerClassName="build-quote__open-to-dropdown"
          hideRightLabels
          defaultToAll
          shouldSearchForImports
        />
      </div>
    </>
  );
}

BuildQuoteInputs.propTypes = {
  ethBalance: PropTypes.string,
  shuffledTokensList: PropTypes.array,
};
