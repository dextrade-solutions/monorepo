import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { PRIMARY, SECONDARY } from '../../../helpers/constants/common';
import CurrencyDisplay from '../../ui/currency-display';
import { useUserPreferencedCurrency } from '../../../hooks/useUserPreferencedCurrency';
import { EtherDenomination } from '../../../../shared/constants/common';

export default function UserPreferencedCurrencyDisplay({
  'data-testid': dataTestId,
  ethLogoHeight = 14,
  ethNumberOfDecimals,
  fiatNumberOfDecimals,
  numberOfDecimals: propsNumberOfDecimals,
  showEthLogo,
  type,
  showFiat,
  showCurrencySuffix,
  ticker,
  ...restProps
}) {
  const { currency, numberOfDecimals } = useUserPreferencedCurrency(type, {
    ethNumberOfDecimals,
    fiatNumberOfDecimals,
    numberOfDecimals: propsNumberOfDecimals,
    showFiatOverride: showFiat,
    nativeCurrency: ticker,
  });
  const prefixComponent = useMemo(() => {
    return (
      currency === EtherDenomination.ETH &&
      showEthLogo && (
        <i
          className="fab fa-ethereum"
          style={{
            color: 'var(--color-icon-default)',
            fontSize: ethLogoHeight,
          }}
        />
      )
    );
  }, [currency, showEthLogo, ethLogoHeight]);

  return ticker ? (
    <CurrencyDisplay
      {...restProps}
      ticker={ticker}
      currency={currency}
      data-testid={dataTestId}
      numberOfDecimals={numberOfDecimals}
      prefixComponent={prefixComponent}
      suffix={showCurrencySuffix && !showEthLogo && currency}
    />
  ) : (
    <span className="text-left half-opacity">Error: Ticker not passed</span>
  );
}

UserPreferencedCurrencyDisplay.propTypes = {
  className: PropTypes.string,
  'data-testid': PropTypes.string,
  prefix: PropTypes.string,
  value: PropTypes.string,
  numberOfDecimals: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  hideLabel: PropTypes.bool,
  hideTitle: PropTypes.bool,
  style: PropTypes.object,
  showEthLogo: PropTypes.bool,
  ethLogoHeight: PropTypes.number,
  type: PropTypes.oneOf([PRIMARY, SECONDARY]),
  ethNumberOfDecimals: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  fiatNumberOfDecimals: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  showFiat: PropTypes.bool,
  showCurrencySuffix: PropTypes.bool,
  ticker: PropTypes.string,
  shiftBy: PropTypes.number,
  isDecimal: PropTypes.bool,
};
