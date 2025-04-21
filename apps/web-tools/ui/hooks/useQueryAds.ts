import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

import { getAssetByIso } from '../../app/helpers/p2p';
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

  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    const fromString = newSearchParams.get('fromToken');
    const toString = newSearchParams.get('toToken');
    let assetFrom, assetTo;

    if (fromString) {
      assetFrom = getAssetByIso(fromString);
      dispatch(setFromToken(assetFrom));
    } else {
      dispatch(setFromToken(null));
    }
    if (toString) {
      assetTo = getAssetByIso(toString);
      dispatch(setToToken(assetTo));
    } else {
      dispatch(setToToken(null));
    }

    if (assetFrom) {
      newSearchParams.set('fromToken', assetFrom.iso);
    } else if (fromString) {
      newSearchParams.delete('fromToken');
    }

    if (assetTo) {
      newSearchParams.set('toToken', assetTo.iso);
    } else if (toString) {
      newSearchParams.delete('toToken');
    }

    if (newSearchParams.toString() !== searchParams.toString()) {
      setSearchParams(newSearchParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, dispatch]);

  return {
    fromToken,
    toToken,
    providerName: searchParams.get('merchant'),
  };
};
