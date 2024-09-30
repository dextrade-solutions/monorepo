import React, { useContext, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { isEqual } from 'lodash';
import SwapsInputs from '../../swaps-inputs';
import { MetaMetricsContext } from '../../../../contexts/metametrics';
import { getBalances } from '../../../../ducks/metamask/metamask';

import {
  setSwapsFromToken,
  getFromToken,
  setReviewSwapClickedTimestamp,
  getSmartTransactionsOptInStatus,
  getSmartTransactionsEnabled,
  getCurrentSmartTransactionsEnabled,
  getFromTokenInputValue,
  getSmartTransactionFees,
} from '../../../../ducks/swaps/swaps';
import {
  getCurrentChainId,
  isHardwareWallet,
  getHardwareWalletType,
} from '../../../../selectors';

import { usePrevious } from '../../../../hooks/usePrevious';

import { isSwapsDefaultTokenAddress } from '../../../../../shared/modules/swaps.utils';
import { EVENT } from '../../../../../shared/constants/metametrics';

import {
  resetSwapsPostFetchState,
  clearSmartTransactionFees,
} from '../../../../store/actions';
import { isEqualCaseInsensitive } from '../../../../../shared/modules/string-utils';
import { calcTokenAmount } from '../../../../../shared/lib/transactions-controller-utils';

import {
  getValueFromWeiHex,
  hexToDecimal,
} from '../../../../../shared/modules/conversion.utils';
import { useInputChange } from '../../swaps-inputs/hooks/useInputChange';

// TODO: refactor component. get only input actions
export default function BuildQuoteInputs() {
  // const dispatch = useDispatch();
  // const trackEvent = useContext(MetaMetricsContext);

  // const tokensWithBalances = useSelector(getBalances, isEqual);
  // const fromToken = useSelector(getFromToken, isEqual);
  // const fromTokenInputValue = useSelector(getFromTokenInputValue);
  // const chainId = useSelector(getCurrentChainId);

  // const hardwareWalletUsed = useSelector(isHardwareWallet);
  // const hardwareWalletType = useSelector(getHardwareWalletType);
  // const smartTransactionsOptInStatus = useSelector(
  //   getSmartTransactionsOptInStatus,
  // );
  // const smartTransactionsEnabled = useSelector(getSmartTransactionsEnabled);
  // const currentSmartTransactionsEnabled = useSelector(
  //   getCurrentSmartTransactionsEnabled,
  // );
  // const smartTransactionFees = useSelector(getSmartTransactionFees);

  // const [onInputChange] = useInputChange();

  // const { decimals: fromTokenDecimals, balance: rawFromTokenBalance } =
  //   fromToken || {};

  // const fromTokenBalance =
  //   rawFromTokenBalance &&
  //   calcTokenAmount(rawFromTokenBalance, fromTokenDecimals).toString(10);

  // const prevFromTokenBalance = usePrevious(fromTokenBalance);
  // const tokensWithBalancesFromToken = tokensWithBalances.find((token) =>
  //   isEqualCaseInsensitive(token.address, fromToken?.address),
  // );
  // const previousTokensWithBalancesFromToken = usePrevious(
  //   tokensWithBalancesFromToken,
  // );

  // useEffect(() => {
  //   const notDefault = !isSwapsDefaultTokenAddress(
  //     tokensWithBalancesFromToken?.address,
  //     chainId,
  //   );
  //   const addressesAreTheSame = isEqualCaseInsensitive(
  //     tokensWithBalancesFromToken?.address,
  //     previousTokensWithBalancesFromToken?.address,
  //   );
  //   const balanceHasChanged =
  //     tokensWithBalancesFromToken?.balance !==
  //     previousTokensWithBalancesFromToken?.balance;
  //   if (notDefault && addressesAreTheSame && balanceHasChanged) {
  //     dispatch(
  //       setSwapsFromToken({
  //         ...fromToken,
  //         balance: tokensWithBalancesFromToken?.balance,
  //         string: tokensWithBalancesFromToken?.string,
  //       }),
  //     );
  //   }
  // }, [
  //   dispatch,
  //   tokensWithBalancesFromToken,
  //   previousTokensWithBalancesFromToken,
  //   fromToken,
  //   chainId,
  // ]);

  // If the eth balance changes while on build quote, we update the selected from token
  // useEffect(() => {
  //   if (
  //     isSwapsDefaultTokenAddress(fromToken?.address, chainId) &&
  //     fromToken?.balance !== hexToDecimal(ethBalance)
  //   ) {
  //     dispatch(
  //       setSwapsFromToken({
  //         ...fromToken,
  //         balance: hexToDecimal(ethBalance),
  //         string: getValueFromWeiHex({
  //           value: ethBalance,
  //           numberOfDecimals: 4,
  //           toDenomination: 'ETH',
  //         }),
  //       }),
  //     );
  //   }
  // }, [dispatch, fromToken, ethBalance, chainId]);

  // useEffect(() => {
  //   if (prevFromTokenBalance !== fromTokenBalance) {
  //     onInputChange(fromTokenInputValue, fromTokenBalance);
  //   }
  // }, [
  //   onInputChange,
  //   prevFromTokenBalance,
  //   fromTokenInputValue,
  //   fromTokenBalance,
  // ]);

  // const trackBuildQuotePageLoadedEvent = useCallback(() => {
  //   trackEvent({
  //     event: 'Build Quote Page Loaded',
  //     category: EVENT.CATEGORIES.SWAPS,
  //     sensitiveProperties: {
  //       is_hardware_wallet: hardwareWalletUsed,
  //       hardware_wallet_type: hardwareWalletType,
  //       stx_enabled: smartTransactionsEnabled,
  //       current_stx_enabled: currentSmartTransactionsEnabled,
  //       stx_user_opt_in: smartTransactionsOptInStatus,
  //     },
  //   });
  // }, [
  //   trackEvent,
  //   hardwareWalletUsed,
  //   hardwareWalletType,
  //   smartTransactionsEnabled,
  //   currentSmartTransactionsEnabled,
  //   smartTransactionsOptInStatus,
  // ]);

  // useEffect(() => {
  //   dispatch(resetSwapsPostFetchState());
  //   dispatch(setReviewSwapClickedTimestamp());
  //   trackBuildQuotePageLoadedEvent();
  // }, [dispatch, trackBuildQuotePageLoadedEvent]);

  // useEffect(() => {
  //   if (smartTransactionsEnabled && smartTransactionFees?.tradeTxFees) {
  //     // We want to clear STX fees, because we only want to use fresh ones on the View Quote page.
  //     clearSmartTransactionFees();
  //   }
  // }, [smartTransactionsEnabled, smartTransactionFees]);

  return (
    <div className="quote-inputs">
      <SwapsInputs includeFiats />
    </div>
  );
}
