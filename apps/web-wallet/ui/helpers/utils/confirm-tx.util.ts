import currencyFormatter from 'currency-formatter';
import currencies from 'currency-formatter/currencies';
import { BigNumber } from 'bignumber.js';

import { unconfirmedTransactionsCountSelector } from '../../selectors';
import { Numeric } from '../../../shared/modules/Numeric';
import { EtherDenomination } from '../../../shared/constants/common';
import { TransactionMeta } from '../../../shared/constants/transaction';

export function getHexGasTotal({ gasLimit = '0x0', gasPrice = '0x0' }): string {
  return new Numeric(gasLimit, 16)
    .times(new Numeric(gasPrice, 16))
    .toPrefixedHexString();
}

export function addEth(firstValue: string, ...otherValues: string[]): string {
  return otherValues
    .reduce((numericAcc, ethAmount) => {
      return numericAcc.add(new Numeric(ethAmount, 10)).round(6);
    }, new Numeric(firstValue, 10))
    .toString();
}

export function addFiat(firstValue: string, ...otherValues: string[]): string {
  return otherValues
    .reduce((numericAcc, fiatAmount) => {
      return numericAcc.add(new Numeric(fiatAmount, 10)).round(2);
    }, new Numeric(firstValue, 10))
    .toString();
}

export function getTransactionFee({
  value,
  fromCurrency = EtherDenomination.ETH,
  toCurrency,
  conversionRate,
  numberOfDecimals,
}: {
  value: string;
  fromCurrency: EtherDenomination;
  toCurrency: string;
  conversionRate: number;
  numberOfDecimals: number;
}): string {
  let fee = new Numeric(value, 16, EtherDenomination.WEI)
    .toDenomination(EtherDenomination.ETH)
    .toBase(10);

  if (fromCurrency !== toCurrency && conversionRate) {
    fee = fee.applyConversionRate(conversionRate);
  }
  return fee.round(numberOfDecimals).toString();
}

export function formatCurrency(value: string, currencyCode: string): string {
  const upperCaseCurrencyCode = currencyCode.toUpperCase();

  return currencies.find((currency) => currency.code === upperCaseCurrencyCode)
    ? currencyFormatter.format(Number(value), {
        code: upperCaseCurrencyCode,
      })
    : value;
}

export function convertTokenToFiat({
  value,
  fromCurrency = EtherDenomination.ETH,
  toCurrency,
  conversionRate,
}: {
  value: string;
  fromCurrency: EtherDenomination;
  toCurrency: string;
  conversionRate: number;
}): string {
  let tokenInFiat = new Numeric(value, 10);

  if (fromCurrency !== toCurrency && conversionRate) {
    tokenInFiat = tokenInFiat.applyConversionRate(conversionRate);
  }

  return tokenInFiat.round(2).toString();
}

/**
 * This is a selector and probably doesn't belong here but its staying for now
 * Note: I did not go so far as to type the entirety of the MetaMask state tree
 * which definitely needs to be done for the full conversion of TypeScript to
 * be successful and as useful as possible.
 * TODO: Type the MetaMask state tree and use that type here.
 *
 * @param state - MetaMask state
 * @returns true if there are unconfirmed transactions in state
 */
export function hasUnconfirmedTransactions(
  state: Record<string, any>,
): boolean {
  return unconfirmedTransactionsCountSelector(state) > 0;
}

/**
 * Rounds the given decimal string to 4 significant digits.
 *
 * @param decimalString - The base-ten number to round.
 * @returns The rounded number, or the original number if no
 * rounding was necessary.
 */
export function roundExponential(decimalString: string): string {
  const PRECISION = 4;
  const bigNumberValue = new BigNumber(decimalString);

  // In JS, numbers with exponentials greater than 20 get displayed as an exponential.
  return bigNumberValue.e > 20
    ? bigNumberValue.toPrecision(PRECISION)
    : decimalString;
}

export function areDappSuggestedAndTxParamGasFeesTheSame(
  txData: TransactionMeta,
): boolean {
  const { txParams, dappSuggestedGasFees } = txData ?? {};
  const {
    gasPrice: txParamsGasPrice,
    maxFeePerGas: txParamsMaxFeePerGas,
    maxPriorityFeePerGas: txParamsMaxPriorityFeePerGas,
  } = txParams || {};
  const {
    gasPrice: dappGasPrice,
    maxFeePerGas: dappMaxFeePerGas,
    maxPriorityFeePerGas: dappMaxPriorityFeePerGas,
  } = dappSuggestedGasFees || {};

  const txParamsDoesNotHaveFeeProperties =
    !txParamsGasPrice && !txParamsMaxFeePerGas && !txParamsMaxPriorityFeePerGas;
  const dappDidNotSuggestFeeProperties =
    !dappGasPrice && !dappMaxFeePerGas && !dappMaxPriorityFeePerGas;
  if (txParamsDoesNotHaveFeeProperties || dappDidNotSuggestFeeProperties) {
    return false;
  }

  const txParamsGasPriceMatchesDappSuggestedGasPrice =
    txParamsGasPrice && txParamsGasPrice === dappGasPrice;
  const txParamsEIP1559FeesMatchDappSuggestedGasPrice = [
    txParamsMaxFeePerGas,
    txParamsMaxPriorityFeePerGas,
  ].every((fee) => fee === dappGasPrice);
  const txParamsEIP1559FeesMatchDappSuggestedEIP1559Fees =
    txParamsMaxFeePerGas &&
    txParamsMaxFeePerGas === dappMaxFeePerGas &&
    txParamsMaxPriorityFeePerGas === dappMaxPriorityFeePerGas;

  return Boolean(
    txParamsGasPriceMatchesDappSuggestedGasPrice ||
      txParamsEIP1559FeesMatchDappSuggestedGasPrice ||
      txParamsEIP1559FeesMatchDappSuggestedEIP1559Fees,
  );
}
