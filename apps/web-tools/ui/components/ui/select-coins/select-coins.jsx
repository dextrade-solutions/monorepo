import assetDict from 'dex-helpers/assets-dict';
import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { SelectCoinsItem } from './select-coins-item';
import { SelectCoinsSwap } from './select-coins-swap';
import {
  getFromToken,
  getToToken,
  setFromMaxModeOn,
  setFromTokenInputValue,
  setFromToken,
  setToToken,
} from '../../../ducks/swaps/swaps';
import { useI18nContext } from '../../../hooks/useI18nContext';

const allTokens = Object.values(assetDict);

const SelectCoinsComponents = ({
  selectedCoinFrom = null,
  itemsCoinFrom = null,
  onChangeFrom = null,
  selectedCoinTo = null,
  itemsCoinTo = null,
  onChangeTo = null,
  includeFiats,
}) => {
  const t = useI18nContext();
  const [checked, setChecked] = useState(false);
  const dispatch = useDispatch();
  const toToken = useSelector(getToToken, isEqual);
  const fromToken = useSelector(getFromToken, isEqual);

  const toggle = useCallback(() => setChecked(!checked), [checked]);

  const setCoinFrom = useCallback(
    (token) => {
      if (onChangeFrom) {
        onChangeFrom(token);
        return;
      }
      dispatch(setFromToken(token));
      dispatch(setFromTokenInputValue(0));
      dispatch(setFromMaxModeOn(false));
    },
    [dispatch, onChangeFrom],
  );

  const setCoinTo = useCallback(
    (token) => {
      if (onChangeTo) {
        onChangeTo(token);
        return;
      }
      dispatch(setToToken(token));
    },
    [dispatch, onChangeTo],
  );

  const onSwapCoin = useCallback(() => {
    dispatch(setFromToken(toToken));
    dispatch(setToToken(fromToken));
  }, [dispatch, fromToken, toToken]);

  return (
    <div className="select-coins" onClick={toggle}>
      <SelectCoinsItem
        coin={fromToken}
        placeholder={t('youGive')}
        items={allTokens}
        onChange={setCoinFrom}
        maxListItem={6}
      />
      <SelectCoinsSwap
        coinFrom={fromToken}
        coinTo={toToken}
        onClick={onSwapCoin}
        disabled={!fromToken && !toToken}
      />
      <SelectCoinsItem
        coin={toToken}
        placeholder={t('youGet')}
        items={allTokens}
        onChange={setCoinTo}
        reversed
        maxListItem={6}
        shouldSearchForImports
      />
    </div>
  );
};

SelectCoinsComponents.propTypes = {
  selectedCoinFrom: PropTypes.object,
  itemsCoinFrom: PropTypes.array,
  onChangeFrom: PropTypes.func,
  selectedCoinTo: PropTypes.object,
  itemsCoinTo: PropTypes.array,
  onChangeTo: PropTypes.func,
  includeFiats: PropTypes.bool,
};

export default SelectCoinsComponents;
