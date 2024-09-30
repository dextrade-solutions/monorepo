import { fromHex } from '../../../../../overrided-metamask/controller-utils';
import { EthBlock } from './types';

/**
 * Returns information about the latest completed block.
 *
 * @param ethQuery - An EthQuery instance
 * @param includeFullTransactionData - Whether or not to include all data for transactions as
 * opposed to merely hashes. False by default.
 * @returns The block.
 */
export default async function fetchLatestBlock(
  ethQuery: any,
  includeFullTransactionData = false,
): Promise<EthBlock> {
  const block = await ethQuery.getBlockByNumber(
    'latest',
    includeFullTransactionData,
  );
  return {
    ...block,
    number: fromHex(block.number),
    baseFeePerGas: fromHex(block.baseFeePerGas),
  };
}
