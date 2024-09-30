import { shuffle } from 'lodash';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { getAssetList, getFiatList } from '../selectors';

/**
 * @param {*} params
 */
export function useAssets({ shuffleTokens = false, includeFiats = true } = {}) {
  const assets = useSelector(getAssetList);
  const fiats = useSelector(getFiatList);

  return useMemo(() => {
    let all = assets;
    if (includeFiats) {
      all = all.concat(fiats);
    }
    if (shuffleTokens) {
      all = shuffle(all);
    }

    return {
      all,
      findToken: (symbol, networkName) => {
        if (!symbol) {
          return null;
        }
        return all.find(
          (t) => t.symbol === symbol && t.network === networkName,
        );
      },
    };
  }, [fiats, assets, shuffleTokens, includeFiats]);
}
