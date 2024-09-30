import { cloneDeep } from 'lodash';
import { hasProperty, isObject } from '@metamask/utils';
import { TransactionType } from '../../../shared/constants/transaction';

export const version = 83;

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
  if (
    !hasProperty(state, 'TransactionController') ||
    !isObject(state.TransactionController)
  ) {
    return state;
  }
  const {
    TransactionController: { transactions = {} },
  } = state;

  const txList = Object.values(transactions as any);
  if (txList.length > 0) {
    const swapsTxs = txList.filter((t) => t.type === TransactionType.swap);
    swapsTxs.forEach((t) => {
      delete transactions[t.id];
    });
  }

  return {
    ...state,
    TransactionController: {
      transactions,
    },
  };
}
