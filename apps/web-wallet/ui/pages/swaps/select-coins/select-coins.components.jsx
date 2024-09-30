import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TokenBucketPriority } from '../../../../shared/constants/swaps';
import {
  getFromToken,
  getToToken,
  setFromMaxModeOn,
  setFromTokenInputValue,
  setSwapsFromToken,
  setSwapToToken,
} from '../../../ducks/swaps/swaps';
import { useAssets } from '../../../hooks/useAssets';
import { useCurrentTokens } from '../../../hooks/useCurrentTokens';
import { useTokensToSearch } from '../../../hooks/useTokensToSearch';
import { getFiatList } from '../../../selectors';
import { SelectCoinsItem } from './select-coins-item';
import { SelectCoinsSwap } from './select-coins-swap';

const SelectCoinsComponents = ({
  selectedCoinFrom = null,
  itemsCoinFrom = null,
  onChangeFrom = null,
  selectedCoinTo = null,
  itemsCoinTo = null,
  onChangeTo = null,
  includeFiats = false,
}) => {
  const [checked, setChecked] = useState(false);
  const dispatch = useDispatch();
  const toToken = useSelector(getToToken, isEqual);
  const fromToken = useSelector(getFromToken, isEqual);
  const fiats = useSelector(getFiatList);
  const { all: usersTokens } = useCurrentTokens();
  const { all: allAssets } = useAssets({ includeFiats });

  const selectedTokensList = useMemo(
    () => [selectedCoinFrom, selectedCoinTo].filter((token) => Boolean(token)),
    [selectedCoinFrom, selectedCoinTo],
  );

  const tokenItemsFrom = useTokensToSearch({
    usersTokens: [
      ...new Set([
        ...usersTokens,
        ...allAssets.filter(({ balance }) => balance > 0),
        ...(includeFiats ? fiats : []),
      ]),
    ],
    // usersTokens,
    // shuffledTokensList: [], // TODO: empty list without shuffledTokensList ??
    shuffledTokensList: usersTokens,
    tokenBucketPriority: TokenBucketPriority.owned,
    hideZeroBalances: true,
    excludesList: selectedTokensList,
    selected: selectedCoinFrom,
  });

  const tokenItemsTo = useTokensToSearch({
    usersTokens,
    shuffledTokensList: allAssets,
    tokenBucketPriority: TokenBucketPriority.top,
    excludesList: selectedTokensList,
    selected: selectedCoinTo,
  });

  const itemsFrom = useMemo(
    () => itemsCoinFrom || tokenItemsFrom,
    [itemsCoinFrom, tokenItemsFrom],
  );
  const itemsTo = useMemo(
    () => itemsCoinTo || tokenItemsTo,
    [itemsCoinTo, tokenItemsTo],
  );

  const toggle = useCallback(() => setChecked(!checked), [checked]);

  const setCoinFrom = useCallback(
    (token) => {
      if (onChangeFrom) {
        onChangeFrom(token);
        return;
      }
      dispatch(setSwapsFromToken(token));
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
      dispatch(setSwapToToken(token));
    },
    [dispatch, onChangeTo],
  );

  const onSwapCoin = useCallback(() => {
    setCoinFrom(toToken);
    setCoinTo(fromToken);
  }, [fromToken, toToken, setCoinFrom, setCoinTo]);

  return (
    <div className="select-coins" onClick={toggle}>
      <SelectCoinsItem
        coin={selectedCoinFrom}
        items={itemsFrom}
        onChange={setCoinFrom}
      />
      <SelectCoinsSwap
        coinFrom={selectedCoinFrom}
        coinTo={selectedCoinTo}
        onClick={onSwapCoin}
        itemsFrom={itemsFrom}
        itemsTo={itemsTo}
      />
      <SelectCoinsItem
        coin={selectedCoinTo}
        items={itemsTo}
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

export default memo(SelectCoinsComponents);
