import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import React, { memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import LoadingSkeleton from '../../../../components/ui/loading-skeleton';
import { getToToken } from '../../../../ducks/swaps/swaps';
import { useI18nContext } from '../../../../hooks/useI18nContext';

const ProvidersItemAmount = ({
  disabled = false,
  amount = 0,
  symbol = '',
  loading,
}) => {
  const t = useI18nContext();
  const toToken = useSelector(getToToken, isEqual);

  const toSymbol = useMemo(() => symbol || toToken?.symbol, [symbol, toToken]);

  if (disabled || !amount || !toSymbol) {
    return null;
  }

  return (
    <div className="exchanges-providers__item-amount">
      <span className="exchanges-providers__item-amount__title">
        {t('youReceive')}&#58;
      </span>
      <span className="exchanges-providers__item-amount__value">
        <LoadingSkeleton isLoading={loading}>
          &#126;&nbsp;{amount}&nbsp;{toSymbol}
        </LoadingSkeleton>
      </span>
    </div>
  );
};

ProvidersItemAmount.propTypes = {
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  symbol: PropTypes.symbol,
};

export default memo(ProvidersItemAmount);
