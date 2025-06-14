import React from 'react';
import PropTypes from 'prop-types';
import CurrencyDisplay from '../currency-display';
import { useTokenTracker } from '../../../hooks/useTokenTracker';

export default function TokenBalance({ className, token }) {
  const { tokensWithBalances } = useTokenTracker([token]);

  const { string, symbol } = tokensWithBalances[0] || {};
  return (
    <CurrencyDisplay
      className={className}
      displayValue={string}
      suffix={symbol}
      provider={token.provider}
    />
  );
}

TokenBalance.propTypes = {
  className: PropTypes.string,
  token: PropTypes.shape({
    address: PropTypes.string,
    provider: PropTypes.object,
  }).isRequired,
};

TokenBalance.defaultProps = {
  className: undefined,
};
