import { addHexPrefix } from 'ethereumjs-util';

const ONE_HUNDRED_THOUSAND = 100000;
const MIN_GAS_LIMIT_DEC = '21000';

export const MIN_GAS_LIMIT_HEX = parseInt(MIN_GAS_LIMIT_DEC, 10).toString(16);

export const GAS_LIMITS = {
  // maximum gasLimit of a simple send
  SIMPLE: addHexPrefix(MIN_GAS_LIMIT_HEX),
  // a base estimate for token transfers.
  BASE_TOKEN_ESTIMATE: addHexPrefix(ONE_HUNDRED_THOUSAND.toString(16)),
};

/**
 * @typedef {object} GasEstimateTypes
 * @property {'fee-market'} FEE_MARKET - A gas estimate for a fee market transaction generated by our gas estimation API.
 * @property {'legacy'} LEGACY - A gas estimate for a legacy Transaction generated by our gas estimation API.
 * @property {'eth_gasPrice'} ETH_GAS_PRICE - A gas estimate provided by the Ethereum node via eth_gasPrice.
 * @property {'none'} NONE - No gas estimate available.
 */

/**
 * These are already declared in @metamask/controllers but importing them from
 * that module and re-exporting causes the UI bundle size to expand beyond 4MB
 *
 * (TODO: This comment was added before @metamask/controllers was split up —
 * revisit now that @metamask/gas-fee-controller is available)
 *
 * @type {GasEstimateTypes}
 */
export enum GasEstimateTypes {
  feeMarket = 'fee-market',
  legacy = 'legacy',
  ethGasPrice = 'eth_gasPrice',
  tron = 'tron',
  none = 'none',
}

/**
 * These represent gas recommendation levels presented in the UI
 */
export enum GasRecommendations {
  low = 'low',
  medium = 'medium',
  high = 'high',
}

/**
 * These represent types of gas estimation
 */
export enum PriorityLevels {
  tenPercentIncreased = 'tenPercentIncreased',
  low = 'low',
  medium = 'medium',
  high = 'high',
  custom = 'custom',
  dAppSuggested = 'dappSuggested',
}

/**
 * Represents the user customizing their gas preference
 */
export const CUSTOM_GAS_ESTIMATE = 'custom';

/**
 * These represent the different edit modes presented in the UI
 */
export enum EditGasModes {
  speedUp = 'speed-up',
  cancel = 'cancel',
  modifyInPlace = 'modify-in-place',
  swaps = 'swaps',
}

/**
 * Represents levels for `networkCongestion` (calculated along with gas fee
 * estimates; represents a number between 0 and 1) that we use to render the
 * network status slider on the send transaction screen and inform users when
 * gas fees are high
 */
export enum NetworkCongestionThresholds {
  notBusy = 0,
  stable = 0.33,
  busy = 0.66,
}

export interface TxGasFees {
  /** Maxmimum number of units of gas to use for this transaction. */
  gasLimit: string;
  /** Price per gas for legacy txs */
  gasPrice: string;
  /**
   * Maximum amount per gas to pay for the transaction, including the priority
   * fee.
   */
  maxFeePerGas: string;
  /** Maximum amount per gas to give to validator as incentive. */
  maxPriorityFeePerGas: string;
  /** Which estimate level was used */
  estimateUsed: string;
  /** Which estimate level that the API suggested. */
  estimateSuggested: string;
  /** The default estimate for gas. */
  defaultGasEstimates: string;
  /** same as gasLimit? */
  gas: string;
  /** Original estimate for gas. */
  originalGasEstimate: string;
  /** The gas limit supplied by user. */
  userEditedGasLimit: string;
  /** Estimate level user selected. */
  userFeeLevel: string;
}
