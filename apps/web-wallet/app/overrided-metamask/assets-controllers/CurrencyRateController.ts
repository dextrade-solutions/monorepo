import { Mutex } from 'async-mutex';
import type { Patch } from 'immer';
import {
  BaseController,
  RestrictedControllerMessenger,
} from '@metamask/base-controller';
import { safelyExecute } from '@metamask/controller-utils';
import { Asset } from '../../../ui/ducks/send';
import { fetchExchangeRate as defaultFetchExchangeRate } from './crypto-compare';

export type RatesDict = {
  [k: string]: {
    conversionRate: string | null;
    usdConversionRate: string | null;
  };
};

/**
 * @type CurrencyRateState
 * @property conversionDate - Timestamp of conversion rate expressed in ms since UNIX epoch
 * @property conversionRate - Conversion rate from current base asset to the current currency
 * @property currentCurrency - Currently-active ISO 4217 currency code
 * @property nativeCurrency - Symbol for the base asset used for conversion
 * @property pendingCurrentCurrency - The currency being switched to
 * @property usdConversionRate - Conversion rate from usd to the current currency
 */
export type CurrencyRateState = {
  conversionDate: number | null;
  currentCurrency: string;
  pendingCurrentCurrency: string | null;
  rates: RatesDict;
};

const name = 'CurrencyRateController';

export type CurrencyRateStateChange = {
  type: `${typeof name}:stateChange`;
  payload: [CurrencyRateState, Patch[]];
};

export type GetCurrencyRateState = {
  type: `${typeof name}:getState`;
  handler: () => CurrencyRateState;
};

type CurrencyRateMessenger = RestrictedControllerMessenger<
  typeof name,
  GetCurrencyRateState,
  CurrencyRateStateChange,
  never,
  never
>;

const metadata = {
  conversionDate: { persist: true, anonymous: true },
  currentCurrency: { persist: true, anonymous: true },
  pendingCurrentCurrency: { persist: false, anonymous: true },
  rates: { persist: false, anonymous: true },
};

const defaultState = {
  conversionDate: 0,
  currentCurrency: 'usd',
  pendingCurrentCurrency: null,
  rates: {
    ETH: {
      conversionRate: '0',
      usdConversionRate: null,
    },
  },
};

/**
 * Controller that passively polls on a set interval for an exchange rate from the current network
 * asset to the user's preferred currency.
 */
export class CurrencyRateController extends BaseController<
  typeof name,
  CurrencyRateState,
  CurrencyRateMessenger
> {
  private mutex = new Mutex();

  private intervalId?: ReturnType<typeof setTimeout>;

  private intervalDelay;

  private fetchExchangeRate;

  private getTokens;

  private includeUsdRate;

  /**
   * A boolean that controls whether or not network requests can be made by the controller
   */
  #enabled;

  /**
   * Creates a CurrencyRateController instance.
   *
   * @param options - Constructor options.
   * @param options.includeUsdRate - Keep track of the USD rate in addition to the current currency rate.
   * @param options.interval - The polling interval, in milliseconds.
   * @param options.messenger - A reference to the messaging system.
   * @param options.state - Initial state to set on this controller.
   * @param options.fetchExchangeRate - Fetches the exchange rate from an external API. This option is primarily meant for use in unit tests.
   * @param options.getTokens
   */
  constructor({
    includeUsdRate = false,
    interval = 180000,
    messenger,
    state,
    getTokens,
    fetchExchangeRate = defaultFetchExchangeRate,
  }: {
    includeUsdRate?: boolean;
    interval?: number;
    messenger: CurrencyRateMessenger;
    state?: Partial<CurrencyRateState>;
    getTokens: () => Asset[];
    fetchExchangeRate?: typeof defaultFetchExchangeRate;
  }) {
    super({
      name,
      metadata,
      messenger,
      state: { ...defaultState, ...state },
    });
    this.includeUsdRate = includeUsdRate;
    this.intervalDelay = interval;
    this.fetchExchangeRate = fetchExchangeRate;
    this.getTokens = getTokens;
    this.#enabled = false;
  }

  /**
   * Start polling for the currency rate.
   */
  async start() {
    this.#enabled = true;

    await this.startPolling();
  }

  /**
   * Stop polling for the currency rate.
   */
  stop() {
    this.#enabled = false;

    this.stopPolling();
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

  /**
   * Sets a currency to track.
   *
   * @param currentCurrency - ISO 4217 currency code.
   */
  async setCurrentCurrency(currentCurrency: string) {
    this.update((state) => {
      state.pendingCurrentCurrency = currentCurrency;
    });
    await this.updateExchangeRate();
  }

  // /**
  //  * Sets a new native currency.
  //  *
  //  * @param symbol - Symbol for the base asset.
  //  */
  // async setNativeCurrency(symbol: string) {
  //   this.update((state) => {
  //     state.pendingNativeCurrency = symbol;
  //   });
  //   await this.updateExchangeRate();
  // }

  private stopPolling() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  /**
   * Starts a new polling interval.
   */
  private async startPolling(): Promise<void> {
    this.stopPolling();
    // TODO: Expose polling currency rate update errors

    await safelyExecute(async () => await this.updateExchangeRate());

    this.intervalId = setInterval(async () => {
      await safelyExecute(async () => await this.updateExchangeRate());
    }, this.intervalDelay);
  }

  async fetchRate(fromSymbol: string, toSymbol: string) {
    const fetchExchangeRateResponse = await this.fetchExchangeRate(fromSymbol, [
      toSymbol,
    ]);
    return fetchExchangeRateResponse[fromSymbol];
  }

  async fetchLocalTokenRate(symbol: string, toSymbol: string) {
    const conversionRate = this.state.rates[symbol];
    if (!conversionRate?.usdConversionRate) {
      throw new Error('Cannot find local token rate');
    }
    if (symbol === toSymbol) {
      return 1;
    }
    if (toSymbol === 'USDT') {
      return Number(conversionRate.usdConversionRate);
    }
    const result = await this.fetchRate('USDT', toSymbol);
    return Number(conversionRate.usdConversionRate) * result.conversionRate;
  }

  /**
   * Updates exchange rate for the current currency.
   *
   * @returns The controller state.
   */
  async updateExchangeRate(): Promise<CurrencyRateState | void> {
    if (!this.#enabled) {
      console.info(
        '[CurrencyRateController] Not updating exchange rate since network requests have been disabled',
      );
      return this.state;
    }
    const { currentCurrency: stateCurrentCurrency, pendingCurrentCurrency } =
      this.state;
    const tokens = this.getTokens();
    const assets = tokens.map(({ symbol }) => symbol);

    if (!assets.length) {
      console.info('[CurrencyRateController] Not found any assets');
      return this.state;
    }
    const releaseLock = await this.mutex.acquire();

    let conversionDate: number | null = null;
    let rates: any = {};
    const currentCurrency = pendingCurrentCurrency ?? stateCurrentCurrency;

    try {
      if (
        currentCurrency &&
        // if either currency is an empty string we can skip the comparison
        // because it will result in an error from the api and ultimately
        // a null conversionRate either way.
        currentCurrency !== ''
      ) {
        const fetchExchangeRateResponse = await this.fetchExchangeRate(
          currentCurrency,
          assets,
        );
        rates = fetchExchangeRateResponse;
        conversionDate = Date.now() / 1000;
      }
    } catch (error) {
      if (
        !(
          error instanceof Error &&
          error.message.includes('market does not exist for this coin pair')
        )
      ) {
        throw error;
      }
    } finally {
      try {
        this.update(() => {
          return {
            conversionDate,
            currentCurrency,
            pendingCurrentCurrency: null,
            rates,
          };
        });
      } finally {
        releaseLock();
      }
    }
    return this.state;
  }
}

export default CurrencyRateController;
