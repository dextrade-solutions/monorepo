import ExolixService from '../../../services/exolix-service';
import {
  IExchangerCoin,
  IExchangerParams,
  INormalizeRates,
  IServiceController,
  ISwapExchangerParams,
} from '../types';
import { getExolixNetwork, exolixNetworks } from './exolix.helpers';
import { ERateType, IRateQuery } from './types';

export default class ExolixController implements IServiceController {
  private readonly exolixService: ExolixService;

  constructor() {
    this.exolixService = new ExolixService();
  }

  private normalizeRates(data): INormalizeRates {
    return {
      fromAmount: null,
      toAmount: null,
      rate: null,
      minAmount: null,
      error: null,
      message: null,
      ...data,
    };
  }

  private normalizeCoinNetworkParam(token: IExchangerCoin): {
    coin: string;
    network: string;
  } {
    const networkFormatter = {
      ETHEREUM: 'ETH',
      BITCOIN: 'BTC',
      TRON: 'TRX',
      BINANCE: 'BNB',
    };
    const network = token.network.toUpperCase();
    return {
      coin: token.symbol,
      network: networkFormatter[network] || '',
    };
  }

  private createRateQuery(params: ISwapExchangerParams): IRateQuery {
    const { from, to, amount } = params;
    return {
      coinFrom: this.normalizeCoinNetworkParam(from).coin,
      networkFrom: this.normalizeCoinNetworkParam(from).network,
      coinTo: this.normalizeCoinNetworkParam(to).coin,
      networkTo: this.normalizeCoinNetworkParam(to).network,
      amount: amount.toString(),
      rateType: ERateType.FIXED,
    };
  }

  public async getRates(
    params: ISwapExchangerParams,
  ): Promise<INormalizeRates> {
    try {
      const queryRateParams = this.createRateQuery(params);
      const data = await this.exolixService.rate(queryRateParams);
      return this.normalizeRates(data);
    } catch (err) {
      const { message, ...errData } = err?.data || {};
      return this.normalizeRates({
        ...errData,
        error: message || err?.message,
      });
    }
  }

  public async swapStart(data): Promise<unknown> {
    const { coinFrom, coinTo, amount } = data;
    const normalizedData = {
      coinFrom: this.normalizeCoinNetworkParam(coinFrom).coin,
      networkFrom: this.normalizeCoinNetworkParam(coinFrom).network,
      coinTo: this.normalizeCoinNetworkParam(coinTo).coin,
      networkTo: this.normalizeCoinNetworkParam(coinTo).network,
      amount,
      withdrawalAddress: coinTo.account,
      refundAddress: coinFrom.account,
    };
    return this.exolixService.createTransaction(normalizedData);
  }

  public async getById(id: string): Promise<unknown> {
    return this.exolixService.getById(id);
  }
}
