import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { BUILT_IN_NETWORKS, NetworkNames, NetworkTypes } from 'dex-helpers';

export interface PaybisConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
  apiUrl: string;
  widgetUrl: string;
  widgetUrlSell: string;
  isLive: boolean;
  backUrl: string;
  failureBackUrl: string;
  depositRedirectUrl: string;
  user_id: string;
  email: string;
  locale: string;
}

export interface CurrencyResponse {
  id: string;
  type: string;
  name: string;
  code: string;
  network: string;
  precision: number;
  minBuyAmount: number;
  maxBuyAmount: number;
  minSellAmount: number;
  maxSellAmount: number;
  isSellSupported: boolean;
  isSuspended: boolean;
  supportsTestMode: boolean;
  supportsLiveMode: boolean;
}

export interface WidgetUrlData {
  url: string;
  requestId: string;
  tempId: string;
}

export interface QuoteResponse {
  baseCurrencyAmount: number;
  baseCurrencyCode: string;
  quoteCurrencyAmount: number;
  quoteCurrencyCode: string;
  feeAmount: number;
  networkFeeAmount: number;
  extraFeeAmount: number;
}

export interface TransactionResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  baseCurrencyAmount: number;
  quoteCurrencyAmount: number;
  feeAmount: number;
  extraFeeAmount: number;
  networkFeeAmount: number;
  status: string;
  walletAddress: string;
  redirectUrl: string;
}

export type NetworkNames =
  | 'ethereum'
  | 'bsc'
  | 'polygon'
  | 'tron'
  | 'arbitrum'
  | 'optimism'
  | 'base'
  | 'avalanche'
  | 'solana';

interface NetworkMapEntry {
  config: (typeof BUILT_IN_NETWORKS)[NetworkNames];
  networkType: NetworkTypes;
}

export type AssetModel = {
  chainId?: number;
  contract?: string;
  decimals?: number;
  name: string;
  symbol: string;
  uid: string;
  network: NetworkNames;
  standard?: string;
  isFiat: boolean;
  isNative: boolean;
  priceInUsdt?: number;
};

export interface PaybisCurrencyResponse {
  id: string;
  symbol: string;
  network: string;
  networkDisplayName: string;
  currency: string;
  name: string;
  code: string;
  hasDestinationTag: boolean;
  image: string;
  blockchainName: string;
  network_data?: {
    name: string;
    blockchain: string;
    assetId: string;
    network: string;
    decimals: number;
    tokenContract: string;
    hasDestinationTag: boolean;
  };
}

export function transformPaybisCurrencyToAssetModel(
  currency: PaybisCurrencyResponse,
): AssetModel {
  const networkMap: Record<string, NetworkMapEntry> = {
    ethereum: {
      config: BUILT_IN_NETWORKS[NetworkNames.ethereum],
      networkType: NetworkTypes.erc20,
    },
    'binance-smart-chain': {
      config: BUILT_IN_NETWORKS[NetworkNames.binance],
      networkType: NetworkTypes.bep20,
    },
    polygon: {
      config: BUILT_IN_NETWORKS[NetworkNames.polygon],
      networkType: NetworkTypes.polygon,
    },
    bitcoin: {
      config: BUILT_IN_NETWORKS[NetworkNames.bitcoin],
      networkType: NetworkTypes.bip86,
    },
    tron: {
      config: BUILT_IN_NETWORKS[NetworkNames.tron],
      networkType: NetworkTypes.trc20,
    },
    solana: {
      config: BUILT_IN_NETWORKS[NetworkNames.solana],
      networkType: NetworkTypes.solana,
    },
    base: {
      config: BUILT_IN_NETWORKS[NetworkNames.base],
      networkType: NetworkTypes.erc20,
    },
  };
  if (currency.network_data?.network === 'testnet') {
    return null;
  }
  try {
    const network = networkMap[currency.network_data?.blockchain.toLowerCase()];
    if (!network) {
      throw new Error(
        `unknown blockchain ${currency.network_data?.blockchain}`,
      );
    }

    return {
      name: currency.name,
      symbol: currency.symbol,
      uid: currency.image,
      network: network.config.key,
      isFiat: false,
      isNative: !currency.network_data?.tokenContract,
      contract: currency.network_data?.tokenContract,
      decimals: currency.network_data?.decimals,
      standard: network.networkType,
      chainId: network.config.id,
    };
  } catch (error) {
    console.error(currency);
    return null;
  }
}

export class PaybisClient {
  private axiosInstance: AxiosInstance;

  private config: PaybisConfig;

  /**
   * @param config
   */
  constructor(config: PaybisConfig) {
    this.config = config;

    this.axiosInstance = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error(
          'Paybis API Error:',
          error.response?.data || error.message,
        );
        return Promise.reject(
          new Error(
            `Paybis API Error: ${error.response?.data?.message || error.message}`,
          ),
        );
      },
    );
  }

  private getRequestConfig(
    method: string,
    endpoint: string,
    data?: any,
  ): AxiosRequestConfig {
    const url = `${this.config.baseUrl}${endpoint}`;
    return {
      method,
      url,
      data,
    };
  }

  async isTestMode() {
    return !this.config.isLive;
  }

  /**
   * @param side
   * @param userId
   * @param userIp
   * @returns Promise<CurrencyResponse[]>
   */
  async getCurrencies(side: 'buy' | 'sell'): Promise<CurrencyResponse[]> {
    const config = this.getApiRequestConfig(
      'GET',
      `/paybis/currencies/crypto/${side}`,
    );
    const response = await this.axiosInstance(config);
    return response.data.response
      .map((currency: any) => ({
        ...transformPaybisCurrencyToAssetModel(currency),
        id: currency.id,
        isSuspended: currency.isSuspended ?? false,
        isSellSupported: currency.isSellSupported ?? true,
        supportsTestMode: currency.supportsTestMode ?? true,
        supportsLiveMode: currency.supportsLiveMode ?? true,
      }))
      .filter((asset) => asset.network);
  }

  /**
   * @param requestId
   * @returns Promise<any>
   */
  async getPaymentDetails(requestId: string): Promise<any> {
    const config = this.getApiRequestConfig(
      'GET',
      `/paybis/payment_details/${requestId}`,
    );
    const response = await this.axiosInstance(config);
    return response;
  }

  /**
   * @param baseCurrencyCode
   * @param quoteCurrencyCode
   * @param baseCurrencyAmount
   * @returns Promise<QuoteResponse>
   */
  async getQuote(
    baseCurrencyCode: string,
    quoteCurrencyCode: string,
    baseCurrencyAmount: number,
  ): Promise<QuoteResponse> {
    const config = this.getRequestConfig(
      'GET',
      `/v3/currencies/${quoteCurrencyCode}/buy_quote?apiKey=${this.config.apiKey}`,
      {
        baseCurrencyCode,
        baseCurrencyAmount,
      },
    );
    const response = await this.axiosInstance(config);
    return response.data;
  }

  /**
   * @param transactionId
   * @returns Promise<TransactionResponse>
   */
  async getTransaction(transactionId: string): Promise<TransactionResponse> {
    const config = this.getRequestConfig(
      'GET',
      `/v1/transactions/${transactionId}?apiKey=${this.config.apiKey}`,
    );
    const response = await this.axiosInstance(config);
    return response.data;
  }

  private getApiRequestConfig(
    method: string,
    endpoint: string,
    data?: any,
  ): AxiosRequestConfig {
    const url = `${this.config.apiUrl}${endpoint}`;
    return {
      method,
      url,
      data,
    };
  }

  /**
   * @param params
   * @param side
   * @returns URL
   */
  async createWidgetUrl(
    params: Record<string, string | number | boolean>,
    side: string,
  ): Promise<WidgetUrlData> {
    const baseUrl =
      side === 'sell' ? this.config.widgetUrlSell : this.config.widgetUrl;

    const all_params: Record<string, string | number | boolean> = {};
    if (params.currencyCode) {
      all_params.defaultCrypto = params.currencyCode;
      all_params.sell_defaultCrypto = params.currencyCode;
    }
    if (params.baseCurrencyCode) {
      all_params.defaultFiat = params.baseCurrencyCode;
      all_params.sell_defaultFiat = params.baseCurrencyCode;
    }
    if (params.baseCurrencyAmount) {
      all_params.defaultAmount = params.baseCurrencyAmount;
    }
    if (params.quoteCurrencyAmount) {
      all_params.defaultAmount = params.quoteCurrencyAmount;
    }
    if (params.walletAddress) {
      all_params.walletAddress = params.walletAddress;
    }

    // Generate a temporary ID and store the mapping
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const payload = {
      depositRedirectUrl: `${this.config.depositRedirectUrl}/${tempId}`,
      mode: side,
      ...all_params,
      locale: this.config.locale,
    };

    console.log(params);
    let endpoint;
    if (side === 'swap') {
      endpoint = '/paybis/makeSwapRequestId';
    } else {
      endpoint = '/paybis/makeRequestId';
    }
    const config = this.getApiRequestConfig('POST', endpoint, payload);
    const response = await this.axiosInstance(config);
    const requestId = response.data;
    localStorage.setItem(`paybis_temp_${tempId}`, requestId);


    const urlParams = new URLSearchParams({
      requestId,
    });
    if (all_params.walletAddress) {
      urlParams.set('cryptoAddress', String(all_params.walletAddress));
    }

    const urlString = `${baseUrl}?${urlParams.toString()}`;
    const backUrl = `${this.config.backUrl}/${tempId}`;
    const failureBackUrl = `${this.config.failureBackUrl}/${tempId}`;
    const wUrl = `${urlString}&successReturnURL=${encodeURIComponent(backUrl)}&failureReturnURL=${encodeURIComponent(failureBackUrl)}`;
    console.log('wUrl:', wUrl);
    return { url: wUrl, requestId, tempId };
  }
}

export const createPaybisClient = (config: PaybisConfig): PaybisClient => {
  return new PaybisClient(config);
};
