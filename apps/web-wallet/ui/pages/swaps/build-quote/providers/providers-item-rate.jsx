import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import React, { memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import LoadingSkeleton from '../../../../components/ui/loading-skeleton';
import { getFromToken, getToToken } from '../../../../ducks/swaps/swaps';
import { useI18nContext } from '../../../../hooks/useI18nContext';

const ProvidersItemRate = ({ disabled, rate, from, to, loading = false }) => {
  const t = useI18nContext();
  const fromToken = useSelector(getFromToken, isEqual);
  const toToken = useSelector(getToToken, isEqual);

  const fromSymbol = useMemo(
    () => from?.symbol || fromToken?.symbol,
    [from, fromToken],
  );
  const toSymbol = useMemo(() => to?.symbol || toToken?.symbol, [to, toToken]);

  const showRate = useMemo(
    () => fromSymbol && toSymbol && rate && !disabled,
    [fromSymbol, toSymbol, rate, disabled],
  );

  if (!showRate) {
    return null;
  }

  return (
    <div className="exchanges-providers__item-rate">
      <span>{t('swapsExchangeRate')}&#58;</span>
      <LoadingSkeleton isLoading={loading}>
        <div className="exchanges-providers__item-rate__content">
          <span>1&nbsp;</span>
          <span>{fromToken.symbol}</span>
          <span>&#8776;</span>
          <span>{rate}&nbsp;</span>
          <span>{toToken.symbol}</span>
        </div>
      </LoadingSkeleton>
    </div>
  );
};

const tokenProps = PropTypes.shape({
  symbol: PropTypes.string,
});

ProvidersItemRate.propTypes = {
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  rate: PropTypes.number,
  from: tokenProps,
  to: tokenProps,
};

export default memo(ProvidersItemRate);
