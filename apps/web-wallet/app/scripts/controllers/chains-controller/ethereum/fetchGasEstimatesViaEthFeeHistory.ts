import { fromWei } from 'ethjs-unit';
import { GWEI } from '@metamask/controller-utils';
import { GasFeeEstimates } from '../../../../overrided-metamask/gas-fee-controller';
import { EthQuery } from './fetchGasEstimatesViaEthFeeHistory/types';
import fetchBlockFeeHistory from './fetchBlockFeeHistory';
import fetchLatestBlock from './fetchGasEstimatesViaEthFeeHistory/fetchLatestBlock';
import calculateGasFeeEstimatesForPriorityLevels from './fetchGasEstimatesViaEthFeeHistory/calculateGasFeeEstimatesForPriorityLevels';

/**
 * Generates gas fee estimates based on gas fees that have been used in the recent past so that
 * those estimates can be displayed to users.
 *
 * To produce the estimates, the last 5 blocks are read from the network, and for each block, the
 * priority fees for transactions at the 10th, 20th, and 30th percentiles are also read (here
 * "percentile" signifies the level at which those transactions contribute to the overall gas used
 * for the block, where higher percentiles correspond to higher fees). This information is used to
 * calculate reasonable max priority and max fees for three different priority levels (higher
 * priority = higher fee).
 *
 * Note that properties are returned for other data that are normally obtained via the API; however,
 * to prevent extra requests to Infura, these properties are empty.
 *
 * @param ethQuery - An EthQuery instance.
 * @returns Base and priority fee estimates, categorized by priority level, as well as an estimate
 * for the next block's base fee.
 */
export default async function fetchGasEstimatesViaEthFeeHistory(
  ethQuery: EthQuery,
): Promise<GasFeeEstimates> {
  const latestBlock = await fetchLatestBlock(ethQuery);
  const blocks = await fetchBlockFeeHistory({
    ethQuery,
    endBlock: latestBlock.number,
    numberOfBlocks: 5,
    percentiles: [10, 20, 30],
  });
  const estimatedBaseFee = fromWei(latestBlock.baseFeePerGas, GWEI);

  const levelSpecificEstimates =
    calculateGasFeeEstimatesForPriorityLevels(blocks);

  return {
    ...levelSpecificEstimates,
    estimatedBaseFee,
    historicalBaseFeeRange: null,
    baseFeeTrend: null,
    latestPriorityFeeRange: null,
    historicalPriorityFeeRange: null,
    priorityFeeTrend: null,
    networkCongestion: null,
  };
}
