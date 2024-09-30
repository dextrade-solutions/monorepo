import classnames from 'classnames';
import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import React, { memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFromToken } from '../../../../ducks/swaps/swaps';
import { useI18nContext } from '../../../../hooks/useI18nContext';

const ProvidersItemMin = ({
  disabled = false,
  error = false,
  amount = 0,
  minAmount = 0,
  symbol = '',
}) => {
  const t = useI18nContext();
  const fromToken = useSelector(getFromToken, isEqual);

  const fromSymbol = useMemo(
    () => symbol || fromToken?.symbol,
    [symbol, fromToken],
  );

  if (disabled || !minAmount || !amount || !fromSymbol) {
    return null;
  }

  return (
    <div
      className={classnames('exchanges-providers__item-min', {
        'exchanges-providers__item-min--error': error,
      })}
    >
      <span>{t('swapsMinAmount')}&#58;</span>
      <span>
        {amount}&nbsp;{fromSymbol}
      </span>
    </div>
  );
};

ProvidersItemMin.propTypes = {
  disabled: PropTypes.bool,
  error: PropTypes.bool,
  amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  minAmount: PropTypes.number,
  symbol: PropTypes.symbol,
};

export default memo(ProvidersItemMin);
