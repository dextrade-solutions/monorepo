import { cloneDeep } from 'lodash';
import { CHAIN_IDS, MAINNET_RPC_URL } from '../../../shared/constants/network';

export const version = 95;

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
  const {
    ChainsController: { usedNetworks = {} },
  } = state;

  if (usedNetworks[CHAIN_IDS.MAINNET]) {
    const { config } = usedNetworks[CHAIN_IDS.MAINNET];
    config.rpcUrl = MAINNET_RPC_URL;
    return {
      ...state,
      ChainsController: { usedNetworks },
    };
  }

  return state;
}
