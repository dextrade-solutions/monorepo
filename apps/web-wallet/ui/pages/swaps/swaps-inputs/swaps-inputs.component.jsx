import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import React, { memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  getBalanceError,
  getFromToken,
  getFromTokenError,
  getFromTokenInputValue,
  getToToken,
} from '../../../ducks/swaps/swaps';
import { useI18nContext } from '../../../hooks/useI18nContext';
import SelectCoins from '../select-coins/select-coins.components';
import { SwapsInputAmount } from './swaps-input-amount';
import { SwapsInputBalance } from './swaps-input-balance';

const SwapsInputs = ({
  selectedCoinFrom = null,
  itemsCoinFrom = null,
  onChangeFrom = null,
  selectedCoinTo = null,
  itemsCoinTo = null,
  onChangeTo = null,
  onAmountChange = null,
  onAmountBlur = null,
  amountValue = null,
  amountLoading = null,
  onAmountMax = null,
  disabledAmountMax = false,
  amountError = null,
  includeFiats = false,
}) => {
  const t = useI18nContext();
  const fromToken = useSelector(getFromToken, isEqual);
  const toToken = useSelector(getToToken, isEqual);
  const fromTokenInputValue = useSelector(getFromTokenInputValue);
  const fromTokenError = useSelector(getFromTokenError);
  const balanceError = useSelector(getBalanceError);

  const coinFrom = useMemo(
    () => selectedCoinFrom || fromToken,
    [selectedCoinFrom, fromToken],
  );
  const coinTo = useMemo(
    () => selectedCoinTo || toToken,
    [selectedCoinTo, toToken],
  );

  const amount = useMemo(
    () => (amountValue || fromTokenInputValue).toString(),
    [amountValue, fromTokenInputValue],
  );

  const error = useMemo(() => {
    if (amountError) {
      return amountError;
    }

    if (!coinFrom || !coinFrom.symbol) {
      return null;
    }

    const { symbol, decimals } = coinFrom;

    if (fromTokenError && coinFrom?.decimals) {
      return t('swapTooManyDecimalsError', [symbol, decimals]);
    }

    if (balanceError) {
      return t('swapsNotEnoughForTx', [symbol]);
    }

    return null;
  }, [t, amountError, fromTokenError, balanceError, coinFrom]);

  return (
    <div className="swap-inputs">
      <div className="coin-input-card">
        <SelectCoins
          selectedCoinFrom={coinFrom}
          itemsCoinFrom={itemsCoinFrom}
          onChangeFrom={onChangeFrom}
          selectedCoinTo={coinTo}
          itemsCoinTo={itemsCoinTo}
          onChangeTo={onChangeTo}
          includeFiats={includeFiats}
        />
        <SwapsInputAmount
          onChange={onAmountChange}
          onBlur={onAmountBlur}
          onMax={onAmountMax}
          value={amount}
          loading={amountLoading}
          selectedCoinFrom={coinFrom}
          disabledMax={disabledAmountMax}
          error={error}
        />
        <SwapsInputBalance selectedCoinFrom={coinFrom} />
      </div>
    </div>
  );
};

SwapsInputs.propTypes = {
  selectedCoinFrom: PropTypes.object,
  itemsCoinFrom: PropTypes.array,
  onChangeFrom: PropTypes.func,
  selectedCoinTo: PropTypes.object,
  itemsCoinTo: PropTypes.array,
  onChangeTo: PropTypes.func,
  onAmountChange: PropTypes.func,
  onAmountBlur: PropTypes.func,
  amountValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  amountLoading: PropTypes.bool,
  onAmountMax: PropTypes.func,
  disabledAmountMax: PropTypes.bool,
  amountError: PropTypes.string,
  includeFiats: PropTypes.bool,
};

export default memo(SwapsInputs);
