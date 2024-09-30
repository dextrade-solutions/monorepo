import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import {
  getFromToken,
  getFromTokenInputValue,
  getToToken,
} from '../../../../ducks/swaps/swaps';
import ProvidersCard from './providers-card';
import ProvidersItemRow from './providers-item-row';
import ProvidersItemInfo from './providers-item-info';
import ProvidersItemAmount from './providers-item-amount';
import ProvidersItemMin from './providers-item-min';
import ProvidersItemRate from './providers-item-rate';
import ProvidersItemError from './providers-item-error';

const formatter = (num) =>
  new Intl.NumberFormat('en-US', { maximumSignificantDigits: 6 }).format(num);

const ProvidersItem = ({ provider, disabled, loading, onClick }) => {
  const {
    name,
    image,
    error,
    message,
    minAmount,
    toAmount = null,
    rate,
  } = provider;
  const fromToken = useSelector(getFromToken, isEqual);
  const toToken = useSelector(getToToken, isEqual);
  const fromTokenInputValue = useSelector(getFromTokenInputValue, isEqual);

  return (
    <ProvidersCard
      disabled={disabled}
      error={Boolean(error) && !disabled}
      onClick={() => onClick(provider)}
      loading={loading}
    >
      <ProvidersItemRow side={<ProvidersItemInfo image={image} name={name} />}>
        <ProvidersItemAmount
          disabled={Boolean(error) || disabled || !fromTokenInputValue}
          amount={formatter(toAmount)}
          symbol={toToken?.symbol}
          loading={loading}
        />
        <ProvidersItemMin
          disabled={!error || disabled || !fromTokenInputValue}
          error={error}
          minAmount={minAmount}
          amount={formatter(minAmount)}
          symbol={fromToken?.symbol}
        />
      </ProvidersItemRow>
      <ProvidersItemRate
        loading={loading}
        disabled={disabled || Boolean(error) || loading || !fromTokenInputValue}
        rate={rate && formatter(rate)}
      />
      <ProvidersItemError
        error={error || message}
        disabled={disabled}
        loading={loading}
      />
    </ProvidersCard>
  );
};

ProvidersItem.propTypes = {
  provider: PropTypes.shape({
    name: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    error: PropTypes.string,
    message: PropTypes.string,
    minAmount: PropTypes.number,
    toAmount: PropTypes.number,
    rate: PropTypes.number,
  }),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

export default memo(ProvidersItem);
