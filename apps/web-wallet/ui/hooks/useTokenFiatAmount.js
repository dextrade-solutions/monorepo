import { useMemo } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import {
  getTokenExchangeRates,
  getCurrentCurrency,
  getShouldShowFiat,
} from '../selectors';
import { getTokenFiatAmount } from '../helpers/utils/token-util';
import { getConversionRate } from '../ducks/metamask/metamask';
import { isEqualCaseInsensitive } from '../../shared/modules/string-utils';

/**
 * Get the token balance converted to fiat and formatted for display
 *
 * @param {string} [tokenAddress] - The token address
 * @param {string} [tokenAmount] - The token balance
 * @param {string} [tokenSymbol] - The token symbol
 * @param {object} [overrides] - A configuration object that allows the caller to explicitly pass an exchange rate or
 *                              ensure fiat is shown even if the property is not set in state.
 * @param {number} [overrides.exchangeRate] -  An exhchange rate to use instead of the one selected from state
 * @param {boolean} [overrides.showFiat] - If truthy, ensures the fiat value is shown even if the showFiat value from state is falsey
 * @param {boolean} hideCurrencySymbol - Indicates whether the returned formatted amount should include the trailing currency symbol
 * @returns {string} The formatted token amount in the user's chosen fiat currency
 */
export function useTokenFiatAmount(
  tokenAddress,
  tokenAmount,
  tokenSymbol,
  overrides = {},
  hideCurrencySymbol,
) {
  const { conversionRate = 0 } = useSelector((state) =>
    getConversionRate(state, tokenSymbol),
  );
  const currentCurrency = useSelector(getCurrentCurrency);
  const userPrefersShownFiat = useSelector(getShouldShowFiat);
  const showFiat = overrides.showFiat ?? userPrefersShownFiat;

  const formattedFiat = useMemo(
    () =>
      getTokenFiatAmount(
        conversionRate,
        currentCurrency,
        tokenAmount,
        tokenSymbol,
        true,
        hideCurrencySymbol,
      ),
    [
      conversionRate,
      currentCurrency,
      tokenAmount,
      tokenSymbol,
      hideCurrencySymbol,
    ],
  );

  if (!showFiat || currentCurrency.toUpperCase() === tokenSymbol) {
    return undefined;
  }

  return formattedFiat;
}
