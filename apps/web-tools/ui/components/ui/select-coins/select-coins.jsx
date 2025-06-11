import assetDict from 'dex-helpers/assets-dict';
import { isEqual } from 'lodash';
import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

import { SelectCoinsItem } from './select-coins-item';
import { SelectCoinsSwap } from './select-coins-swap';
import {
  getFromToken,
  getToToken,
  setFromMaxModeOn,
  setFromTokenInputValue,
} from '../../../ducks/swaps/swaps';
import { useI18nContext } from '../../../hooks/useI18nContext';

const allTokens = Object.values(assetDict);

const SelectCoinsComponents = () => {
  const t = useI18nContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [checked, setChecked] = useState(false);
  const dispatch = useDispatch();
  const toToken = useSelector(getToToken, isEqual);
  const fromToken = useSelector(getFromToken, isEqual);

  const toggle = useCallback(() => setChecked(!checked), [checked]);

  const updateToken = useCallback(
    (token, param) => {
      const newSearchParams = new URLSearchParams(searchParams);
      if (token) {
        newSearchParams.set(param, token.iso);
      } else {
        newSearchParams.delete(param);
      }
      setSearchParams(newSearchParams);
    },
    [searchParams, setSearchParams],
  );

  const setCoinFrom = useCallback(
    (token) => {
      updateToken(token, 'fromToken');
      dispatch(setFromTokenInputValue(0));
      dispatch(setFromMaxModeOn(false));
    },
    [dispatch, updateToken],
  );

  const setCoinTo = useCallback(
    (token) => updateToken(token, 'toToken'),
    [updateToken],
  );

  const onSwapCoin = useCallback(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (toToken) {
      newSearchParams.set('fromToken', toToken.iso);
    } else {
      newSearchParams.delete('fromToken');
    }
    if (fromToken) {
      newSearchParams.set('toToken', fromToken.iso);
    } else {
      newSearchParams.delete('toToken');
    }
    setSearchParams(newSearchParams);
  }, [fromToken, toToken, searchParams, setSearchParams]);

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

export default SelectCoinsComponents;
