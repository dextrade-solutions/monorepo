import { cloneDeep } from 'lodash';

export const version = 93;

/**
 * DEXTRADE: The swaps transactions update. Deletes all swaps transactions history
 *
 * @param originalVersionedData - Versioned MetaMask extension state, exactly what we persist to dist.
 * @param originalVersionedData.meta - State metadata.
 * @param originalVersionedData.meta.version - The current state version.
 * @param originalVersionedData.data - The persisted MetaMask state, keyed by controller.
 * @returns Updated versioned MetaMask extension state.
 */
export async function migrate(originalVersionedData: {
  meta: { version: number };
  data: Record<string, unknown>;
}) {
  const versionedData = cloneDeep(originalVersionedData);
  versionedData.meta.version = version;
  versionedData.data = transformState(versionedData.data);
  return versionedData;
}

function transformState(state: Record<string, unknown>) {
  const cleanState = {
    allDetectedTokens: {},
    allIgnoredTokens: {},
    allTokens: {},
    ignoredTokens: [],
    suggestedAssets: [],
    tokens: [],
  };

  return {
    ...state,
    TokensController: cleanState,
    TransactionController: { transactions: {} },
    ChainsController: { usedNetworks: {} },
  };
}
