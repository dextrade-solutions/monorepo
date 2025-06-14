import { Aml } from './Aml';
import { Atomic } from './Atomic';
import { Broadcast } from './Broadcast';
import { Changelly } from './Changelly';
import { CoinPairs } from './CoinPairs';
import { Exchange } from './Exchange';
import { Exchanger } from './Exchanger';
import { Kyc } from './Kyc';
import { Payment } from './Payment';
import { Tariff } from './Tariff';
import { User } from './User';

export class ServiceBridge {
  // eslint-disable-next-line no-use-before-define
  static #instance: ServiceBridge | null;

  public baseUrl?: string;

  public static get instance(): ServiceBridge {
    if (!ServiceBridge.#instance) {
      ServiceBridge.#instance = new ServiceBridge();
    }

    return ServiceBridge.#instance;
  }

  customFetch = (...args: Parameters<typeof fetch>) => fetch(...args);

  init({
    baseUrl,
    customFetch,
  }: {
    baseUrl?: string;
    customFetch: typeof fetch;
  }) {
    this.baseUrl = baseUrl;
    this.customFetch = customFetch;
  }
}

export * as DextradeTypes from './data-contracts';

const opts = {
  customFetch: (...args: Parameters<typeof fetch>) => {
    return ServiceBridge.instance.customFetch(...args);
  },
};

export const kycService = new Kyc(opts);
export const amlService = new Aml(opts);
export const paymentService = new Payment(opts);
export const exchangeService = new Exchange(opts);
export const userService = new User(opts);
export const atomicService = new Atomic(opts);
export const broadcastService = new Broadcast(opts);
export const tariffService = new Tariff(opts);
export const exchangerService = new Exchanger(opts);
export const changellyService = new Changelly(opts);
export const coinPairsService = new CoinPairs(opts);
