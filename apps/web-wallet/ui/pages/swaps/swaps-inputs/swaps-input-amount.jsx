import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NetworkNames } from '../../../../shared/constants/exchanger';
import { calcTokenAmount } from '../../../../shared/lib/transactions-controller-utils';
import Box from '../../../components/ui/box';
import LoadingIndicator from '../../../components/ui/loading-indicator';
import TextField from '../../../components/ui/text-field';
import { getFromMaxModeOn, setFromMaxModeOn } from '../../../ducks/swaps/swaps';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { useTokenFiatAmount } from '../../../hooks/useTokenFiatAmount';
import { getUseCurrencyRateCheck } from '../../../selectors';
import { useInputChange } from './hooks/useInputChange';

export const SwapsInputAmount = ({
  onChange,
  onBlur,
  value,
  loading,
  onMax,
  selectedCoinFrom,
  error,
  disabledMax,
}) => {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const useCurrencyRateCheck = useSelector(getUseCurrencyRateCheck);
  const isOnMaxModeFrom = useSelector(getFromMaxModeOn);

  const valueBeforeMax = useRef(value);

  const [onInputChange] = useInputChange();

  const swapFromTokenFiatValue = useTokenFiatAmount(
    selectedCoinFrom?.address,
    Number(value) || 0,
    selectedCoinFrom?.symbol,
    {
      showFiat: useCurrencyRateCheck,
    },
    true,
  );

  const disabled = useMemo(() => !selectedCoinFrom, [selectedCoinFrom]);
  const disabledMaxMode = useMemo(
    () =>
      disabledMax ||
      selectedCoinFrom?.network?.name === NetworkNames.fiat ||
      disabled,
    [disabled, disabledMax, selectedCoinFrom],
  );
  const onTextFieldChange = useCallback(
    (e) => {
      e && e.stopPropagation();
      e && e.nativeEvent?.stopImmediatePropagation();
      const targetValue = e.target.value;
      const valueToUse = targetValue === '.' ? '0.' : targetValue;
      const regexp = /^(\.\d+|\d+(\.\d+)?|\d+\.)$/u;
      if (valueToUse === '' || regexp.test(valueToUse)) {
        return valueToUse;
      }
      return value;
    },
    [value],
  );

  const handleChange = useCallback(
    (e) => {
      const v = onTextFieldChange(e);
      dispatch(setFromMaxModeOn(false));
      if (onChange) {
        return onChange(v);
      }
      return onInputChange(v);
    },
    [dispatch, onChange, onTextFieldChange, onInputChange],
  );

  const handleBlur = useCallback(
    (e) => {
      onBlur && onBlur(onTextFieldChange(e));
    },
    [onBlur, onTextFieldChange],
  );

  const handleMax = useCallback(() => {
    if (onMax) {
      return onMax();
    }
    const { balance, decimals } = selectedCoinFrom;
    if (!balance || !decimals) {
      return null;
    }
    const tokenBalance = calcTokenAmount(balance, decimals).toString(10);
    if (!isOnMaxModeFrom) {
      valueBeforeMax.current = value;
    }
    const settedOnMaxValue = isOnMaxModeFrom
      ? valueBeforeMax.current || 0
      : tokenBalance;
    dispatch(setFromMaxModeOn(!isOnMaxModeFrom));
    return onInputChange(settedOnMaxValue);
  }, [
    onMax,
    dispatch,
    onInputChange,
    selectedCoinFrom,
    isOnMaxModeFrom,
    valueBeforeMax,
    value,
  ]);

  return (
    <div className="coin-input-card__input-amount">
      <div className="flex-grow">
        <TextField
          disabled={disabled}
          endAdornment={
            <>
              {loading && (
                <Box marginRight={2}>
                  <LoadingIndicator
                    isLoading
                    title="Updating amount..."
                    alt="loading"
                  />
                </Box>
              )}
              {!loading && (
                <div className="coin-input-card__input-amount__end">
                  <span className="coin-input-card__input-amount__end__price">
                    {swapFromTokenFiatValue}
                  </span>
                  <button
                    disabled={disabledMaxMode}
                    className="send-v2__amount-max"
                    onClick={handleMax}
                  >
                    <input type="checkbox" checked={isOnMaxModeFrom} readOnly />
                    <div className="send-v2__amount-max__button">
                      {t('max')}
                    </div>
                  </button>
                </div>
              )}
            </>
          }
          type="text"
          placeholder="0"
          fullWidth
          margin="dense"
          theme="material"
          value={value}
          error={error}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </div>
    </div>
  );
};

SwapsInputAmount.propTypes = {
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onMax: PropTypes.func,
  loading: PropTypes.bool,
  value: PropTypes.oneOfType(PropTypes.string, PropTypes.number),
  selectedCoinFrom: PropTypes.object,
  error: PropTypes.string,
  disabledMax: PropTypes.bool,
};
