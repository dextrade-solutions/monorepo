import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import CurrencyDisplay from '../../ui/currency-display';
import UserPreferencedCurrencyDisplay from '../user-preferenced-currency-display';
import HexToDecimal from '../../ui/hex-to-decimal';
import { PRIMARY, SECONDARY } from '../../../helpers/constants/common';
import { EtherDenomination } from '../../../../shared/constants/common';
import TransactionBreakdownRow from './transaction-breakdown-row';

export default class TransactionBreakdown extends PureComponent {
  static contextTypes = {
    t: PropTypes.func,
  };

  static propTypes = {
    className: PropTypes.string,
    assetInstance: PropTypes.object,
    showFiat: PropTypes.bool,
    nonce: PropTypes.string,
    primaryCurrency: PropTypes.string,
    isTokenApprove: PropTypes.bool,
    gas: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    gasPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    maxFeePerGas: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    feeUsed: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    totalInHex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    baseFee: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    priorityFee: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    hexGasTotal: PropTypes.string,
    isEIP1559Transaction: PropTypes.bool,
    isMultiLayerFeeNetwork: PropTypes.bool,
    l1HexGasTotal: PropTypes.string,
  };

  static defaultProps = {
    showFiat: true,
  };

  render() {
    const { t } = this.context;
    const {
      gas,
      gasPrice,
      maxFeePerGas,
      primaryCurrency,
      className,
      nonce,
      showFiat,
      totalInHex,
      feeUsed,
      isTokenApprove,
      baseFee,
      priorityFee,
      hexGasTotal,
      isEIP1559Transaction,
      isMultiLayerFeeNetwork,
      l1HexGasTotal,
      assetInstance,
    } = this.props;
    const { isEthTypeNetwork, nativeToken } = assetInstance.sharedProvider;
    return (
      <div className={classnames('transaction-breakdown', className)}>
        <div className="transaction-breakdown__title">{t('transaction')}</div>
        {isEthTypeNetwork && (
          <TransactionBreakdownRow divider title={t('nonce')}>
            {typeof nonce === 'undefined' ? null : (
              <HexToDecimal
                className="transaction-breakdown__value"
                value={nonce}
              />
            )}
          </TransactionBreakdownRow>
        )}
        <TransactionBreakdownRow
          title={isTokenApprove ? t('spendingCap') : t('amount')}
        >
          <span className="transaction-breakdown__value transaction-breakdown__value--amount">
            {primaryCurrency}
          </span>
        </TransactionBreakdownRow>
        {isEthTypeNetwork && (
          <>
            <TransactionBreakdownRow
              title={
                isMultiLayerFeeNetwork
                  ? t('transactionHistoryL2GasLimitLabel')
                  : `${t('gasLimit')} (${t('units')})`
              }
              className="transaction-breakdown__row-title"
            >
              {typeof gas === 'undefined' ? (
                '?'
              ) : (
                <HexToDecimal
                  className="transaction-breakdown__value"
                  value={gas}
                />
              )}
            </TransactionBreakdownRow>
            {typeof feeUsed === 'string' && (
              <TransactionBreakdownRow
                title={`${t('gasUsed')} (${t('units')})`}
                className="transaction-breakdown__row-title"
              >
                <HexToDecimal
                  className="transaction-breakdown__value"
                  value={feeUsed}
                />
              </TransactionBreakdownRow>
            )}
            {isEIP1559Transaction && typeof baseFee !== 'undefined' ? (
              <TransactionBreakdownRow title={t('transactionHistoryBaseFee')}>
                <CurrencyDisplay
                  className="transaction-breakdown__value"
                  data-testid="transaction-breakdown__base-fee"
                  denomination={EtherDenomination.GWEI}
                  value={baseFee}
                  numberOfDecimals={10}
                  hideLabel
                  ticker={nativeToken.symbol}
                  shiftBy={nativeToken.decimals}
                />
              </TransactionBreakdownRow>
            ) : null}
            {isEIP1559Transaction && typeof priorityFee !== 'undefined' ? (
              <TransactionBreakdownRow
                title={t('transactionHistoryPriorityFee')}
              >
                <CurrencyDisplay
                  className="transaction-breakdown__value"
                  data-testid="transaction-breakdown__priority-fee"
                  denomination={EtherDenomination.GWEI}
                  value={priorityFee}
                  numberOfDecimals={10}
                  hideLabel
                  ticker={nativeToken.symbol}
                  shiftBy={nativeToken.decimals}
                />
              </TransactionBreakdownRow>
            ) : null}
            {!isEIP1559Transaction && (
              <TransactionBreakdownRow
                title={
                  isMultiLayerFeeNetwork
                    ? t('transactionHistoryL2GasPriceLabel')
                    : t('advancedGasPriceTitle')
                }
              >
                {typeof gasPrice === 'undefined' ? (
                  '?'
                ) : (
                  <CurrencyDisplay
                    className="transaction-breakdown__value"
                    data-testid="transaction-breakdown__gas-price"
                    denomination={EtherDenomination.GWEI}
                    value={gasPrice}
                    numberOfDecimals={9}
                    hideLabel
                    ticker={nativeToken.symbol}
                    shiftBy={nativeToken.decimals}
                  />
                )}
              </TransactionBreakdownRow>
            )}
            {isEIP1559Transaction && (
              <TransactionBreakdownRow
                title={t('transactionHistoryTotalGasFee')}
              >
                <UserPreferencedCurrencyDisplay
                  className="transaction-breakdown__value"
                  data-testid="transaction-breakdown__effective-gas-price"
                  denomination={EtherDenomination.ETH}
                  numberOfDecimals={6}
                  value={hexGasTotal}
                  type={PRIMARY}
                  ticker={nativeToken.symbol}
                  shiftBy={nativeToken.decimals}
                />
                {showFiat && (
                  <UserPreferencedCurrencyDisplay
                    className="transaction-breakdown__value"
                    denomination={EtherDenomination.ETH}
                    value={hexGasTotal}
                    type={SECONDARY}
                    ticker={nativeToken.symbol}
                    shiftBy={nativeToken.decimals}
                  />
                )}
              </TransactionBreakdownRow>
            )}
            {isEIP1559Transaction && (
              <TransactionBreakdownRow
                divider
                title={t('transactionHistoryMaxFeePerGas')}
              >
                <UserPreferencedCurrencyDisplay
                  className="transaction-breakdown__value"
                  denomination={EtherDenomination.ETH}
                  numberOfDecimals={9}
                  value={maxFeePerGas}
                  type={PRIMARY}
                  ticker={nativeToken.symbol}
                  shiftBy={nativeToken.decimals}
                />
                {showFiat && (
                  <UserPreferencedCurrencyDisplay
                    className="transaction-breakdown__value"
                    type={SECONDARY}
                    value={maxFeePerGas}
                    ticker={nativeToken.symbol}
                    shiftBy={nativeToken.decimals}
                  />
                )}
              </TransactionBreakdownRow>
            )}
            {isMultiLayerFeeNetwork && (
              <TransactionBreakdownRow
                title={t('transactionHistoryL1GasLabel')}
              >
                <UserPreferencedCurrencyDisplay
                  className="transaction-breakdown__value"
                  data-testid="transaction-breakdown__l1-gas-total"
                  numberOfDecimals={18}
                  value={l1HexGasTotal}
                  type={PRIMARY}
                  ticker={nativeToken.symbol}
                  shiftBy={nativeToken.decimals}
                />
                {showFiat && (
                  <UserPreferencedCurrencyDisplay
                    className="transaction-breakdown__value"
                    type={SECONDARY}
                    value={l1HexGasTotal}
                    ticker={nativeToken.symbol}
                    shiftBy={nativeToken.decimals}
                  />
                )}
              </TransactionBreakdownRow>
            )}
          </>
        )}
        {!isEthTypeNetwork && (
          <>
            <TransactionBreakdownRow
              title={t('feeUsed')}
              className="transaction-breakdown__row-title"
            >
              <UserPreferencedCurrencyDisplay
                className="transaction-breakdown__value"
                type={PRIMARY}
                value={feeUsed}
                ticker={nativeToken.symbol}
                shiftBy={nativeToken.decimals}
              />
            </TransactionBreakdownRow>
          </>
        )}
        <TransactionBreakdownRow title={t('total')}>
          <UserPreferencedCurrencyDisplay
            className="transaction-breakdown__value transaction-breakdown__value--eth-total"
            type={PRIMARY}
            value={totalInHex}
            numberOfDecimals={isMultiLayerFeeNetwork ? 18 : null}
            ticker={nativeToken.symbol}
            shiftBy={nativeToken.decimals}
          />
          {showFiat && (
            <UserPreferencedCurrencyDisplay
              className="transaction-breakdown__value"
              type={SECONDARY}
              value={totalInHex}
              ticker={nativeToken.symbol}
              shiftBy={nativeToken.decimals}
            />
          )}
        </TransactionBreakdownRow>
      </div>
    );
  }
}
