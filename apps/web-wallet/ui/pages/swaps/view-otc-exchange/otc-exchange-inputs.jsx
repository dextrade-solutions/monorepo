import { isEqual } from 'lodash';
import React, { memo, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Text } from '../../../components/component-library';
import AssetInputCard from '../../../components/ui/asset-input-card/asset-input-card';
import CoinInputCard from '../../../components/ui/asset-input-card/asset-input-card';
import { getAllBalances } from '../../../ducks/metamask/metamask';
import {
  getFromToken,
  getFromTokenError,
  getFromTokenInputValue,
  getSwapOTC,
  getToToken,
} from '../../../ducks/swaps/swaps';
import { Color } from '../../../helpers/constants/design-system';
import { useAssets } from '../../../hooks/useAssets';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { useEmulateInputTransaction } from '../build-quote/build-quote-inputs/useEmulateInputTransaction';
import { useInputChange } from '../swaps-inputs/hooks/useInputChange';
import { normalizeTokenInput } from './helpers';

const OtcExchangeInputs = ({ provider, errors, onError }) => {
  const t = useI18nContext();

  const fromInputValue = useSelector(getFromTokenInputValue);
  const fromToken = useSelector(getFromToken, isEqual);
  const toToken = useSelector(getToToken, isEqual);
  const { loading } = useSelector(getSwapOTC);
  const fromTokenError = useSelector(getFromTokenError);
  const { findToken } = useAssets({ includeFiats: true });

  const [onInputChange] = useInputChange();
  const [onEmulateTransaction] = useEmulateInputTransaction();

  const assetFrom = useMemo(
    () => findToken(fromToken.symbol, fromToken.network),
    [fromToken, findToken],
  );
  const assetTo = findToken(toToken.symbol, toToken.network);

  const fromInput = useMemo(
    () => ({
      ...normalizeTokenInput(fromToken, fromInputValue),
      loading,
    }),
    [fromToken, fromInputValue, loading],
  );

  const toInput = useMemo(
    () => ({
      ...normalizeTokenInput(toToken, provider?.toAmount || ''),
      loading,
    }),
    [toToken, loading, provider],
  );

  const onChangeFrom = useCallback(
    ({ amount }) => onInputChange(amount),
    [onInputChange],
  );

  const handleMax = useCallback(async () => {
    if (!assetFrom?.isNativeToken) {
      const maxBalance = fromToken.balance / Math.pow(10, fromToken.decimals);
      onInputChange(maxBalance);
    }
    const amount = await onEmulateTransaction();
    onInputChange(amount);
  }, [onInputChange, fromToken, assetFrom, onEmulateTransaction]);

  const onChangeTo = useCallback(() => {}, []);

  const validate = useCallback(
    (key, err) => {
      onError(key, err);
    },
    [onError],
  );

  return (
    <>
      <div className="p2p-exchange__row">
        <Text className="row-label" color={Color.textMuted}>
          {t('swapSwapFrom')}
        </Text>
        <AssetInputCard
          value={fromInput}
          asset={assetFrom}
          readonlyCoin
          hidePaymentMethods
          onChange={onChangeFrom}
          onMax={handleMax}
          error={
            fromTokenError ||
            provider?.message ||
            provider?.error ||
            errors.from
          }
        />
      </div>
      <div className="p2p-exchange__row">
        <Text className="row-label" color={Color.textMuted}>
          {t('swapSwapTo')}
        </Text>
        <AssetInputCard
          value={toInput}
          asset={assetTo}
          readonlyCoin
          onChange={onChangeTo}
          disabledBalance
          disabledMax
          isReserveToken
          readonlyInput
        />
      </div>
    </>
  );
};

export default memo(OtcExchangeInputs);
