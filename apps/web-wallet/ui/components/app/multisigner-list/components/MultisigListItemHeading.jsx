import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { PRIMARY } from '../../../../helpers/constants/common';
import { formatCurrency } from '../../../../helpers/utils/confirm-tx.util';
import { useCurrencyDisplay } from '../../../../hooks/useCurrencyDisplay';
import { useUserPreferencedCurrency } from '../../../../hooks/useUserPreferencedCurrency';
import { getCurrentCurrency } from '../../../../selectors';
import TokenBadge from '../../../ui/token-badge';

export const MultisigListItemHeading = ({
  token: { symbol, decimals, network, balance = '0', balanceFiat = '0' },
}) => {
  const currentCurrency = useSelector(getCurrentCurrency);
  const primaryCurrencyPreferences = useUserPreferencedCurrency(PRIMARY);
  const [currency] = useCurrencyDisplay(balance, {
    ticker: symbol,
    shiftBy: decimals,
    isDecimal: true,
    hideLabel: true,
    ...primaryCurrencyPreferences,
  });

  const formattedFiat = formatCurrency(balanceFiat, currentCurrency);

  return (
    <div>
      <div className="multisig-list__item__heading">
        <h2>
          <span>{currency}</span>
          <span className="asset-list-item__token-symbol">{symbol}</span>
        </h2>
        {network && network.type && <TokenBadge value={network.type} />}
      </div>
      <div className="multisig-list__item__subtitle">
        <h3 title={formattedFiat}>{formattedFiat}</h3>
      </div>
    </div>
  );
};

MultisigListItemHeading.propTypes = {
  token: PropTypes.shape({
    balance: PropTypes.string,
    balanceFiat: PropTypes.string,
    decimals: PropTypes.number.isRequired,
    symbol: PropTypes.string.isRequired,
    network: PropTypes.shape({
      name: PropTypes.string,
      type: PropTypes.string,
    }).isRequired,
  }),
};
