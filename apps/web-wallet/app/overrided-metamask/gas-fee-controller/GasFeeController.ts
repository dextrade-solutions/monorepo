import type { Patch } from 'immer';
import { v1 as random } from 'uuid';
import {
  BaseController,
  RestrictedControllerMessenger,
} from '@metamask/base-controller';
import { safelyExecute } from '@metamask/controller-utils';
import type {
  NetworkControllerGetEthQueryAction,
  NetworkControllerGetProviderConfigAction,
  NetworkControllerProviderConfigChangeEvent,
} from '@metamask/network-controller';
import ChainsController from '../../scripts/controllers/chains-controller';
import { calculateTimeEstimate } from './gas-util';

export const LEGACY_GAS_PRICES_API_URL = `https://api.metaswap.codefi.network/gasPrices`;

export type unknownString = 'unknown';

// Fee Market describes the way gas is set after the london hardfork, and was
// defined by EIP-1559.
export type FeeMarketEstimateType = 'fee-market';
// Legacy describes gasPrice estimates from before london hardfork, when the
// user is connected to mainnet and are presented with fast/average/slow
// estimate levels to choose from.
export type LegacyEstimateType = 'legacy';
// EthGasPrice describes a gasPrice estimate received from eth_gasPrice. Post
// london this value should only be used for legacy type transactions when on
// networks that support EIP-1559. This type of estimate is the most accurate
// to display on custom networks that don't support EIP-1559.
export type EthGasPriceEstimateType = 'eth_gasPrice';
// NoEstimate describes the state of the controller before receiving its first
// estimate.
export type NoEstimateType = 'none';
// New kind of estimate. Not implemented yet. Dextrade feature
export type TronEstimate = 'tron';
/**
 * Indicates which type of gasEstimate the controller is currently returning.
 * This is useful as a way of asserting that the shape of gasEstimates matches
 * expectations. NONE is a special case indicating that no previous gasEstimate
 * has been fetched.
 */
export const GAS_ESTIMATE_TYPES = {
  FEE_MARKET: 'fee-market' as FeeMarketEstimateType,
  LEGACY: 'legacy' as LegacyEstimateType,
  ETH_GASPRICE: 'eth_gasPrice' as EthGasPriceEstimateType,
  NONE: 'none' as NoEstimateType,
};

export type GasEstimateType =
  | FeeMarketEstimateType
  | EthGasPriceEstimateType
  | LegacyEstimateType
  | NoEstimateType;

export type EstimatedGasFeeTimeBounds = {
  lowerTimeBound: number | null;
  upperTimeBound: number | unknownString;
};

/**
 * @type EthGasPriceEstimate
 *
 * A single gas price estimate for networks and accounts that don't support EIP-1559
 * This estimate comes from eth_gasPrice but is converted to dec gwei to match other
 * return values
 * @property gasPrice - A GWEI dec string
 */

export type EthGasPriceEstimate = {
  gasPrice: string;
};

/**
 * @type LegacyGasPriceEstimate
 *
 * A set of gas price estimates for networks and accounts that don't support EIP-1559
 * These estimates include low, medium and high all as strings representing gwei in
 * decimal format.
 * @property high - gasPrice, in decimal gwei string format, suggested for fast inclusion
 * @property medium - gasPrice, in decimal gwei string format, suggested for avg inclusion
 * @property low - gasPrice, in decimal gwei string format, suggested for slow inclusion
 */
export type LegacyGasPriceEstimate = {
  high: string;
  medium: string;
  low: string;
};

/**
 * @type Eip1559GasFee
 *
 * Data necessary to provide an estimate of a gas fee with a specific tip
 * @property minWaitTimeEstimate - The fastest the transaction will take, in milliseconds
 * @property maxWaitTimeEstimate - The slowest the transaction will take, in milliseconds
 * @property suggestedMaxPriorityFeePerGas - A suggested "tip", a GWEI hex number
 * @property suggestedMaxFeePerGas - A suggested max fee, the most a user will pay. a GWEI hex number
 */
export type Eip1559GasFee = {
  minWaitTimeEstimate: number; // a time duration in milliseconds
  maxWaitTimeEstimate: number; // a time duration in milliseconds
  suggestedMaxPriorityFeePerGas: string; // a GWEI decimal number
  suggestedMaxFeePerGas: string; // a GWEI decimal number
};

/**
 * @type GasFeeEstimates
 *
 * Data necessary to provide multiple GasFee estimates, and supporting information, to the user
 * @property low - A GasFee for a minimum necessary combination of tip and maxFee
 * @property medium - A GasFee for a recommended combination of tip and maxFee
 * @property high - A GasFee for a high combination of tip and maxFee
 * @property estimatedBaseFee - An estimate of what the base fee will be for the pending/next block. A GWEI dec number
 * @property networkCongestion - A normalized number that can be used to gauge the congestion
 * level of the network, with 0 meaning not congested and 1 meaning extremely congested
 */
export type GasFeeEstimates = SourcedGasFeeEstimates | FallbackGasFeeEstimates;

type SourcedGasFeeEstimates = {
  low: Eip1559GasFee;
  medium: Eip1559GasFee;
  high: Eip1559GasFee;
  estimatedBaseFee: string;
  historicalBaseFeeRange: [string, string];
  baseFeeTrend: 'up' | 'down' | 'level';
  latestPriorityFeeRange: [string, string];
  historicalPriorityFeeRange: [string, string];
  priorityFeeTrend: 'up' | 'down' | 'level';
  networkCongestion: number;
};

type FallbackGasFeeEstimates = {
  low: Eip1559GasFee;
  medium: Eip1559GasFee;
  high: Eip1559GasFee;
  estimatedBaseFee: string;
  historicalBaseFeeRange: null;
  baseFeeTrend: null;
  latestPriorityFeeRange: null;
  historicalPriorityFeeRange: null;
  priorityFeeTrend: null;
  networkCongestion: null;
};

const metadata = {
  gasFeeEstimates: { persist: true, anonymous: false },
  estimatedGasFeeTimeBounds: { persist: true, anonymous: false },
  gasEstimateType: { persist: true, anonymous: false },
};

export type GasFeeStateEthGasPrice = {
  gasFeeEstimates: EthGasPriceEstimate;
  estimatedGasFeeTimeBounds: Record<string, never>;
  gasEstimateType: EthGasPriceEstimateType;
};

export type GasFeeStateFeeMarket = {
  gasFeeEstimates: GasFeeEstimates;
  estimatedGasFeeTimeBounds: EstimatedGasFeeTimeBounds | Record<string, never>;
  gasEstimateType: FeeMarketEstimateType;
};

export type GasFeeStateLegacy = {
  gasFeeEstimates: LegacyGasPriceEstimate;
  estimatedGasFeeTimeBounds: Record<string, never>;
  gasEstimateType: LegacyEstimateType;
};

export type GasFeeStateNoEstimates = {
  gasFeeEstimates: Record<string, never>;
  estimatedGasFeeTimeBounds: Record<string, never>;
  gasEstimateType: TronEstimate;
};

export type GasFeeStateTron = {
  gasFeeEstimates: Record<string, never>;
  estimatedGasFeeTimeBounds: Record<string, never>;
  gasEstimateType: NoEstimateType;
};

export type FetchGasFeeEstimateOptions = {
  shouldUpdateState?: boolean;
  chainId: string;
};

/**
 * @type GasFeeState
 *
 * Gas Fee controller state
 * @property gasFeeEstimates - Gas fee estimate data based on new EIP-1559 properties
 * @property estimatedGasFeeTimeBounds - Estimates representing the minimum and maximum
 */
export type GasFeeState =
  | GasFeeStateEthGasPrice
  | GasFeeStateFeeMarket
  | GasFeeStateLegacy
  | GasFeeStateNoEstimates
  | GasFeeStateTron;

const name = 'GasFeeController';

export type GasFeeStateChange = {
  type: `${typeof name}:stateChange`;
  payload: [GasFeeState, Patch[]];
};

export type GetGasFeeState = {
  type: `${typeof name}:getState`;
  handler: () => GasFeeState;
};

type GasFeeMessenger = RestrictedControllerMessenger<
  typeof name,
  | GetGasFeeState
  | NetworkControllerGetProviderConfigAction
  | NetworkControllerGetEthQueryAction,
  GasFeeStateChange | NetworkControllerProviderConfigChangeEvent,
  | NetworkControllerGetProviderConfigAction['type']
  | NetworkControllerGetEthQueryAction['type'],
  NetworkControllerProviderConfigChangeEvent['type']
>;

const defaultState: GasFeeState = {
  gasFeeEstimates: {},
  estimatedGasFeeTimeBounds: {},
  gasEstimateType: GAS_ESTIMATE_TYPES.NONE,
};

export type ChainID = `0x${string}` | `${number}` | number;

/**
 * Controller that retrieves gas fee estimate data and polls for updated data on a set interval
 */
export class GasFeeController extends BaseController<
  typeof name,
  GasFeeState,
  GasFeeMessenger
> {
  private intervalId?: ReturnType<typeof setTimeout>;

  private intervalDelay;

  private pollTokens: Set<string>;

  private chainsController: ChainsController;

  /**
   * Creates a GasFeeController instance.
   *
   * @param options - The controller options.
   * @param options.interval - The time in milliseconds to wait between polls.
   * @param options.messenger - The controller messenger.
   * @param options.state - The initial state.
   * asking for estimates.
   * @param options.chainsController
   */
  constructor({
    interval = 15000,
    messenger,
    state,
    chainsController,
  }: {
    interval?: number;
    messenger: GasFeeMessenger;
    state?: GasFeeState;
    chainsController: ChainsController;
  }) {
    super({
      name,
      metadata,
      messenger,
      state: { ...defaultState, ...state },
    });
    this.chainsController = chainsController;
    this.intervalDelay = interval;
    this.pollTokens = new Set();
  }

  // async resetPolling() {
  //   if (this.pollTokens.size !== 0) {
  //     const tokens = Array.from(this.pollTokens);
  //     this.stopPolling();
  //     // await this.getGasFeeEstimatesAndStartPolling(tokens[0]);
  //     tokens.slice(1).forEach((token) => {
  //       this.pollTokens.add(token);
  //     });
  //   }
  // }

  async fetchGasFeeEstimates(options: FetchGasFeeEstimateOptions) {
    return await this._fetchGasFeeEstimateData(options);
  }

  async getGasFeeEstimatesAndStartPolling(
    pollToken: string | undefined,
    chainId: string,
  ): Promise<string> {
    const _pollToken = pollToken || random();

    this.pollTokens.add(_pollToken);

    if (this.pollTokens.size === 1) {
      await this._fetchGasFeeEstimateData({ chainId });
      this._poll({ chainId });
    }

    return _pollToken;
  }

  /**
   * Gets and sets gasFeeEstimates in state.
   *
   * @param options - The gas fee estimate options.
   * @param options.shouldUpdateState - Determines whether the state should be updated with the
   * updated gas estimates.
   * @returns The gas fee estimates.
   */
  async _fetchGasFeeEstimateData(
    options: FetchGasFeeEstimateOptions,
  ): Promise<GasFeeState | null> {
    // if (!isEthTypeNetwork) {
    //   // Currently available only eth type chains
    //   this.update((state) => {
    //     state.gasFeeEstimates = {};
    //     state.gasEstimateType = GasEstimateTypes.tron;
    //   });
    //   return null;
    // }

    const { shouldUpdateState = true } = options;

    const chainsController = this.chainsController.getControllerByChainId(
      options.chainId,
    );

    const gasFeeCalculations =
      await chainsController.txController.fetchGasFeeEstimateData();
    if (shouldUpdateState) {
      this.update((state) => {
        state.gasFeeEstimates = gasFeeCalculations.gasFeeEstimates;
        state.estimatedGasFeeTimeBounds =
          gasFeeCalculations.estimatedGasFeeTimeBounds;
        state.gasEstimateType = gasFeeCalculations.gasEstimateType;
      });
    }

    return gasFeeCalculations;
  }

  /**
   * Remove the poll token, and stop polling if the set of poll tokens is empty.
   *
   * @param pollToken - The poll token to disconnect.
   */
  disconnectPoller(pollToken: string) {
    this.pollTokens.delete(pollToken);
    if (this.pollTokens.size === 0) {
      this.stopPolling();
    }
  }

  stopPolling() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.pollTokens.clear();
    this.resetState();
  }

  /**
   * Prepare to discard this controller.
   *
   * This stops any active polling.
   */
  override destroy() {
    super.destroy();
    this.stopPolling();
  }

  private _poll(options: FetchGasFeeEstimateOptions) {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(async () => {
      await safelyExecute(() => this._fetchGasFeeEstimateData(options));
    }, this.intervalDelay);
  }

  private resetState() {
    this.update(() => {
      return defaultState;
    });
  }

  getTimeEstimate(
    maxPriorityFeePerGas: string,
    maxFeePerGas: string,
  ): EstimatedGasFeeTimeBounds | Record<string, never> {
    if (
      !this.state.gasFeeEstimates ||
      this.state.gasEstimateType !== GAS_ESTIMATE_TYPES.FEE_MARKET
    ) {
      return {};
    }
    return calculateTimeEstimate(
      maxPriorityFeePerGas,
      maxFeePerGas,
      this.state.gasFeeEstimates,
    );
  }
}

export default GasFeeController;
