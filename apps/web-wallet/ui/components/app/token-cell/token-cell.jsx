import classnames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useSelector } from 'react-redux';
import AssetListItem from '../asset-list-item';
import { getSelectedAddress } from '../../../selectors';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { useCurrencyDisplay } from '../../../hooks/useCurrencyDisplay';
import { useUserPreferencedCurrency } from '../../../hooks/useUserPreferencedCurrency';
import { PRIMARY } from '../../../helpers/constants/common';

export default function TokenCell({
  reservedBalance,
  hasActiveNetwork,
  chainId,
  iconUrl,
  secondaryLabel,
  decimals,
  balance,
  formattedFiat,
  balanceError,
  symbol,
  onClick,
  isERC721,
  localId,
}) {
  const userAddress = useSelector(getSelectedAddress);
  const t = useI18nContext();

  const primaryCurrencyPreferences = useUserPreferencedCurrency(PRIMARY);
  const [formattedCurrency] = useCurrencyDisplay(balance, {
    ticker: symbol,
    shiftBy: decimals,
    isDecimal: true,
    hideLabel: true,
    ...primaryCurrencyPreferences,
  });
  const warning = balanceError ? (
    <span>
      {t('troubleTokenBalances')}
      <a
        href={`https://ethplorer.io/address/${userAddress}`}
        rel="noopener noreferrer"
        target="_blank"
        onClick={(event) => event.stopPropagation()}
        style={{ color: 'var(--color-warning-default)' }}
      >
        {t('here')}
      </a>
    </span>
  ) : null;
  return (
    <AssetListItem
      onClick={onClick}
      className={classnames('token-cell', {
        'token-cell--outdated': Boolean(balanceError),
      })}
      iconClassName="token-cell__icon"
      tokenReservedBalance={reservedBalance}
      tokenChainId={chainId}
      tokenBalance={balance}
      tokenAddress={localId}
      tokenSymbol={symbol}
      tokenDecimals={decimals}
      tokenImage={iconUrl}
      secondaryLabel={secondaryLabel}
      hasActiveNetwork={hasActiveNetwork}
      warning={warning}
      primary={formattedCurrency || 0}
      secondary={formattedFiat}
      isERC721={isERC721}
    />
  );
}

TokenCell.propTypes = {
  localId: PropTypes.string,
  chainId: PropTypes.string,
  iconUrl: PropTypes.string,
  balance: PropTypes.string,
  reservedBalance: PropTypes.number,
  formattedFiat: PropTypes.string,
  balanceError: PropTypes.string,
  secondaryLabel: PropTypes.string,
  symbol: PropTypes.string,
  decimals: PropTypes.number,
  onClick: PropTypes.func,
  isERC721: PropTypes.bool,
  hasActiveNetwork: PropTypes.bool,
};

TokenCell.defaultProps = {
  balanceError: null,
  chainId: null,
  onClick: null,
  formattedFiat: null,
};
