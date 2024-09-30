import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { PRIMARY } from '../../../helpers/constants/common';
import { formatCurrency } from '../../../helpers/utils/confirm-tx.util';
import { useCurrencyDisplay } from '../../../hooks/useCurrencyDisplay';
import { useUserPreferencedCurrency } from '../../../hooks/useUserPreferencedCurrency';
import { getCurrentCurrency } from '../../../selectors';

export const MultisigPageToken = ({
  balance,
  symbol,
  decimals,
  balanceFiat,
}) => {
  const currentCurrency = useSelector(getCurrentCurrency);

  const primaryCurrencyPreferences = useUserPreferencedCurrency(PRIMARY);
  const [formattedCurrency] = useCurrencyDisplay(balance, {
    ticker: symbol,
    shiftBy: decimals,
    isDecimal: true,
    hideLabel: true,
    ...primaryCurrencyPreferences,
  });

  const formattedFiat = formatCurrency(balanceFiat, currentCurrency);

  return (
    <div className="multisig-page__token__balance">
      <div className="multisig-page__token__balance__symbol">
        <span>{symbol}&nbsp;</span>
        <span>{formattedCurrency}</span>
      </div>
      <span>{formattedFiat}</span>
    </div>
  );
};

MultisigPageToken.propTypes = {
  balance: PropTypes.string.isRequired,
  symbol: PropTypes.string.isRequired,
  balanceFiat: PropTypes.string.isRequired,
  decimals: PropTypes.number.isRequired,
};
