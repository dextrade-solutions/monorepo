import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { formatCurrency } from '../helpers/utils/confirm-tx.util';
import { getConversionRate } from '../ducks/metamask/metamask';

import { TEST_NETWORK_TICKER_MAP } from '../../shared/constants/network';
import { Numeric } from '../../shared/modules/Numeric';

/**
 * Defines the shape of the options parameter for useCurrencyDisplay
 *
 * @typedef {object} UseCurrencyOptions
 * @property {string} [displayValue] - When present is used in lieu of formatting the inputValue
 * @property {string} [prefix] - String to prepend to the final result
 * @property {number} [numberOfDecimals] - Number of significant decimals to display
 * @property {string} [denomination] - Denomination (wei, gwei) to convert to for display
 * @property {string} [currency] - Currency type to convert to. Will override nativeCurrency
 * @property {boolean} [native] - Is native token value
 */

/**
 * Defines the return shape of the second value in the tuple
 *
 * @typedef {object} CurrencyDisplayParts
 * @property {string} [prefix] - string to prepend to the value for display
 * @property {string} value - string representing the value, formatted for display
 * @property {string} [suffix] - string to append to the value for display
 */

/**
 * useCurrencyDisplay hook
 *
 * Given a hexadecimal encoded value string and an object of parameters used for formatting the
 * display, produce both a fully formed string and the pieces of that string used for displaying
 * the currency to the user
 *
 * @param {string} inputValue - The value to format for display
 * @param {UseCurrencyOptions} opts - An object for options to format the inputValue
 * @returns {[string, CurrencyDisplayParts]}
 */
export function useCurrencyDisplay(
  inputValue,
  {
    displayValue,
    prefix,
    numberOfDecimals,
    isDecimal,
    currency,
    ticker,
    shiftBy,
    ...opts
  },
) {
  const outputCurrency = currency || ticker;
  const rates = useSelector((state) => getConversionRate(state, ticker));
  const conversionRate = rates?.conversionRate;
  const roundBy = numberOfDecimals || 8;

  const value = useMemo(() => {
    if (displayValue) {
      return displayValue;
    }
    let numeric = null;
    if (isDecimal) {
      numeric = new Numeric(inputValue, 10);
    } else {
      numeric = new Numeric(inputValue, 16).toBase(10);
    }
    numeric = numeric.shiftedBy(shiftBy);
    if (String(ticker).toLowerCase() !== String(outputCurrency).toLowerCase()) {
      if (!conversionRate) {
        return null;
      }
      numeric = numeric.applyConversionRate(conversionRate).round(roundBy);
      return formatCurrency(numeric.toString(), outputCurrency);
    }
    return numeric.round(roundBy).toString();
  }, [
    inputValue,
    displayValue,
    conversionRate,
    outputCurrency,
    shiftBy,
    roundBy,
    ticker,
    isDecimal,
  ]);

  let suffix;

  if (!opts.hideLabel) {
    // if the currency we are displaying is the native currency of one of our preloaded test-nets (goerli, sepolia etc.)
    // then we allow lowercase characters, otherwise we force to uppercase any suffix passed as a currency
    const currencyTickerSymbol = Object.values(
      TEST_NETWORK_TICKER_MAP,
    ).includes(currency)
      ? currency
      : currency?.toUpperCase();

    suffix = opts.suffix || outputCurrency || currencyTickerSymbol;
  }

  return [
    `${prefix || ''}${value || 0}${suffix ? ` ${suffix}` : ''}`,
    { prefix, value, suffix },
  ];
}
