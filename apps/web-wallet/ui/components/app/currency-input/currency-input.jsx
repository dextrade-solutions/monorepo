import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { stripHexPrefix } from 'ethereumjs-util';
import UnitInput from '../../ui/unit-input';
import CurrencyDisplay from '../../ui/currency-display';
import { I18nContext } from '../../../contexts/i18n';
import { getConversionRate } from '../../../ducks/metamask/metamask';
import { getCurrentCurrency, getShouldShowFiat } from '../../../selectors';
import { Numeric } from '../../../../shared/modules/Numeric';

/**
 * Component that allows user to enter currency values as a number, and props receive a converted
 * hex value in WEI. props.value, used as a default or forced value, should be a hex value, which
 * gets converted into a decimal value depending on the currency (ETH or Fiat).
 *
 * @param options0
 * @param options0.hexValue
 * @param options0.featureSecondary
 * @param options0.onChange
 * @param options0.assetInstance
 * @param options0.onPreferenceToggle
 * @param options0.className
 */
export default function CurrencyInput({
  hexValue,
  featureSecondary,
  onChange,
  assetInstance,
  onPreferenceToggle,
  className = '',
}) {
  const t = useContext(I18nContext);

  const preferredCurrency = assetInstance.symbol;
  const secondaryCurrency = useSelector(getCurrentCurrency);
  const rates = useSelector((state) =>
    getConversionRate(state, preferredCurrency),
  );
  const showFiat = useSelector(getShouldShowFiat);
  const hideSecondary = !showFiat;
  const primarySuffix = preferredCurrency;
  const secondarySuffix = secondaryCurrency.toUpperCase();

  const [isSwapped, setSwapped] = useState(false);
  const [shouldDisplayFiat, setShouldDisplayFiat] = useState(featureSecondary);
  const shouldUseFiat = hideSecondary ? false : Boolean(shouldDisplayFiat);

  const getDecimalValue = () => {
    const decimal = new Numeric(stripHexPrefix(hexValue) || 0, 16)
      .toBase(10)
      .divide(Math.pow(10, Number(assetInstance.decimals)), 10);
    const decimalValueString = shouldUseFiat
      ? decimal
          .applyConversionRate(rates.conversionRate)
          .round(2, BigNumber.ROUND_HALF_DOWN)
          .toString()
      : decimal
          .round(assetInstance.decimals, BigNumber.ROUND_HALF_DOWN)
          .toString();
    return Number(decimalValueString) || 0;
  };

  const initialDecimalValue = getDecimalValue();

  const swap = async () => {
    await onPreferenceToggle();
    setSwapped(!isSwapped);
    setShouldDisplayFiat(!shouldDisplayFiat);
  };

  const handleChange = (v) => {
    let newDecimalValue = new BigNumber(v || 0, 10);
    newDecimalValue = new Numeric(newDecimalValue || 0, 10);
    if (shouldUseFiat && rates) {
      newDecimalValue = newDecimalValue.applyConversionRate(
        1 / rates.conversionRate,
      );
    }

    const hexValueNew = newDecimalValue
      .round(assetInstance.decimals, BigNumber.ROUND_HALF_DOWN)
      .times(Math.pow(10, Number(assetInstance.decimals)), 10)
      .toBase(16)
      .toString();
    onChange(hexValueNew);
    setSwapped(!isSwapped);
  };

  useEffect(() => {
    if (featureSecondary) {
      handleChange(initialDecimalValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featureSecondary, initialDecimalValue]);

  const renderConversionComponent = () => {
    let currency, numberOfDecimals;

    if (hideSecondary) {
      return (
        <div className="currency-input__conversion-component">
          {t('noConversionRateAvailable')}
        </div>
      );
    }

    if (shouldUseFiat) {
      // Display ETH
      currency = preferredCurrency;
      numberOfDecimals = 8;
    } else {
      // Display Fiat
      currency = secondaryCurrency;
      numberOfDecimals = 2;
    }

    return (
      <CurrencyDisplay
        className="currency-input__conversion-component"
        currency={currency}
        value={hexValue}
        numberOfDecimals={numberOfDecimals}
        ticker={assetInstance.symbol}
        shiftBy={assetInstance.decimals}
      />
    );
  };

  return (
    <UnitInput
      {...{
        hexValue,
        preferredCurrency,
        secondaryCurrency,
        hideSecondary,
        featureSecondary,
        conversionRate: rates.conversionRate,
        onChange,
        onPreferenceToggle,
      }}
      dataTestId="currency-input"
      suffix={shouldUseFiat ? secondarySuffix : primarySuffix}
      onChange={handleChange}
      value={initialDecimalValue}
      className={className}
      actionComponent={
        <button
          className="currency-input__swap-component"
          data-testid="currency-swap"
          onClick={swap}
        >
          <i className="fa fa-retweet fa-lg" />
        </button>
      }
    >
      {renderConversionComponent()}
    </UnitInput>
  );
}

CurrencyInput.propTypes = {
  assetInstance: PropTypes.object.isRequired,
  hexValue: PropTypes.number,
  featureSecondary: PropTypes.bool,
  onChange: PropTypes.func,
  onPreferenceToggle: PropTypes.func,
  className: PropTypes.string,
};
