import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import { isEqual, uniqBy } from 'lodash';

import { getSwapsTokens } from '../ducks/swaps/swaps';
import { TokenBucketPriority } from '../../shared/constants/swaps';

/**
 * const generateSearchTokenList = (
 *  tokenList,
 *  excludesList = [],
 *  ArrayClass = Array,
 *  ) => {
 *   return new ArrayClass(
 * ...tokenList.map((token) => {
 * if (!excludesList.includes(token.localId)) {
 * return token;
 * }
 * return { ...token, disabled: true };
 * }),
 *   );
 * };
 */

const generateSearchTokenList = (
  tokenList,
  excludesList = [],
  selectedCoin = null,
) => {
  // return tokenList.filter(
  //   (token) => !excludesList.find(({ localId }) => localId === token.localId),
  // );
  return tokenList.map((token) => {
    const disabled = excludesList.find(
      ({ localId }) => localId === token.localId,
    );
    const selected = selectedCoin?.localId === token.localId;
    return Object.assign(token, { disabled, selected });
  });
};

export function useTokensToSearch({
  usersTokens = [],
  topTokens = {},
  shuffledTokensList = [],
  tokenBucketPriority = TokenBucketPriority.owned,
  hideZeroBalances = false,
  excludesList = [],
  renderableOutputFormat = true,
  selected = null,
}) {
  const swapsTokens = useSelector(getSwapsTokens, isEqual) || [];
  const tokensToSearch = swapsTokens.length ? swapsTokens : shuffledTokensList;

  return useMemo(() => {
    let usersTokensList = usersTokens;
    if (hideZeroBalances) {
      usersTokensList = usersTokens.filter(
        ({ balance, isFiat }) => isFiat || (!isFiat && balance > 0),
      );
    }
    const tokensToSearchBuckets = {
      owned: [],
      top: [],
      others: [],
    };
    const memoizedSwapsAndUserTokensWithoutDuplicities = uniqBy(
      [...tokensToSearch, ...usersTokensList],
      'localId',
    );

    memoizedSwapsAndUserTokensWithoutDuplicities.forEach((token) => {
      const renderableDataToken = renderableOutputFormat
        ? token.getRenderableTokenData()
        : token;
      if (tokenBucketPriority === TokenBucketPriority.owned) {
        if (token.isExistInWallet) {
          tokensToSearchBuckets.owned.push(renderableDataToken);
        } else if (topTokens[token.localId]) {
          tokensToSearchBuckets.top[topTokens[token.localId].index] =
            renderableDataToken;
        } else {
          tokensToSearchBuckets.others.push(renderableDataToken);
        }
      } else if (topTokens[token.localId]) {
        tokensToSearchBuckets.top[topTokens[token.localId].index] =
          renderableDataToken;
      } else if (token.isExistInWallet) {
        tokensToSearchBuckets.owned.push(renderableDataToken);
      } else {
        tokensToSearchBuckets.others.push(renderableDataToken);
      }
    });
    tokensToSearchBuckets.owned = tokensToSearchBuckets.owned.sort(
      ({ rawFiat }, { rawFiat: secondRawFiat }) => {
        return new BigNumber(rawFiat || 0).gt(secondRawFiat || 0) ? -1 : 1;
      },
    );
    tokensToSearchBuckets.top = tokensToSearchBuckets.top.filter(Boolean);
    if (tokenBucketPriority === TokenBucketPriority.owned) {
      return generateSearchTokenList(
        [
          ...tokensToSearchBuckets.owned,
          ...tokensToSearchBuckets.top,
          ...tokensToSearchBuckets.others,
        ],
        excludesList,
        selected,
      );
    }
    return generateSearchTokenList(
      [
        ...tokensToSearchBuckets.top,
        ...tokensToSearchBuckets.owned,
        ...tokensToSearchBuckets.others,
      ],
      excludesList,
      selected,
    );
  }, [
    renderableOutputFormat,
    tokensToSearch,
    usersTokens,
    topTokens,
    tokenBucketPriority,
    excludesList,
    selected,
    hideZeroBalances,
  ]);
}
