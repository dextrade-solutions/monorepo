import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { useCurrencyDisplay } from '../../../hooks/useCurrencyDisplay';
import { EtherDenomination } from '../../../../shared/constants/common';

export default function CurrencyDisplay({
  value,
  displayValue,
  'data-testid': dataTestId,
  style,
  className,
  prefix,
  prefixComponent,
  hideLabel,
  hideTitle,
  numberOfDecimals,
  denomination,
  currency,
  suffix,
  ticker = 'None',
  shiftBy,
  isDecimal,
}) {
  const [title, parts] = useCurrencyDisplay(value, {
    displayValue,
    prefix,
    numberOfDecimals,
    hideLabel,
    denomination,
    ticker,
    shiftBy,
    currency,
    suffix,
    isDecimal,
  });
  return (
    <div
      className={classnames('currency-display-component', className)}
      data-testid={dataTestId}
      style={style}
      title={(!hideTitle && title) || null}
    >
      {prefixComponent && (
        <span className="currency-display-component__prefix">
          {prefixComponent}
        </span>
      )}
      <span className="currency-display-component__text">
        {parts.prefix}
        {parts.value}
      </span>
      {parts.suffix && (
        <span className="currency-display-component__suffix">
          {parts.suffix}
        </span>
      )}
    </div>
  );
}

CurrencyDisplay.propTypes = {
  className: PropTypes.string,
  currency: PropTypes.string,
  'data-testid': PropTypes.string,
  denomination: PropTypes.oneOf([
    EtherDenomination.GWEI,
    EtherDenomination.ETH,
  ]),
  displayValue: PropTypes.string,
  hideLabel: PropTypes.bool,
  hideTitle: PropTypes.bool,
  numberOfDecimals: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  prefix: PropTypes.string,
  prefixComponent: PropTypes.node,
  style: PropTypes.object,
  suffix: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  value: PropTypes.string,
  ticker: PropTypes.string,
  shiftBy: PropTypes.number,
  isDecimal: PropTypes.bool,
};
