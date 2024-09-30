import { useSelector } from 'react-redux';
import { getAssets } from '../ducks/metamask/metamask';

/**
 * @returns
 */
export function useCurrentTokens() {
  const all = useSelector(getAssets);
  return {
    all,
    totalBalanceFiat: all.reduce(
      (acc, token) => acc + Number(token.balanceFiat || '0'),
      0,
    ),
    findToken: (symbol, networkName) => {
      if (!symbol) {
        return null;
      }
      return all.find((t) => t.symbol === symbol && t.network === networkName);
    },
    findTokenByLocalId: (localId) => {
      if (!localId) {
        return null;
      }
      return all.find((t) => t.localId === localId);
    },
  };
}
