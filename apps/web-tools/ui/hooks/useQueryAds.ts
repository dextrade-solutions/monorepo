import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

import {
  getAssetByIso,
  parseCoinByTickerAndNetwork,
} from '../../app/helpers/p2p';
import {
  getFromToken,
  getToToken,
  setFromToken,
  setToToken,
} from '../ducks/swaps/swaps';

export const useQueryAds = () => {
  const toToken = useSelector(getToToken);
  const fromToken = useSelector(getFromToken);
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const [providerName, setProviderName] = useState(
    searchParams.get('merchant'),
  );

  useEffect(() => {
    const fromString = searchParams.get('fromToken');
    const toString = searchParams.get('toToken');
    if (fromString) {
      const assetFrom = getAssetByIso(fromString);
      if (assetFrom) {
        dispatch(setFromToken(assetFrom));
      } else {
        dispatch(setFromToken(null));
      }
    }
    if (toString) {
      const assetTo = getAssetByIso(toString);
      dispatch(setToToken(assetTo));
    } else {
      dispatch(setToToken(null));
    }
  }, [searchParams, dispatch]);

  useEffect(() => {
    if (fromToken) {
      searchParams.set('fromToken', fromToken.iso);
    } else {
      searchParams.delete('fromToken');
    }

    if (toToken) {
      searchParams.set('toToken', toToken.iso);
    } else {
      searchParams.delete('toToken');
    }

    if (providerName) {
      searchParams.set('merchant', providerName);
    } else {
      searchParams.delete('merchant');
    }

    setSearchParams(searchParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromToken, toToken, providerName]);

  return {
    fromToken,
    toToken,
    providerName,
    setProviderName,
  };
};
