import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { networkMap } from './networks-map';

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
  fiats: string[];
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

export interface PaybisTransactionAsset {
  id: string;
  name: string;
  currency: {
    code: string;
  };
  blockchain: {
    name: string;
    network: string;
  };
}

export interface PaybisTransactionAmount {
  amount: string;
  currency: string;
}

export interface PaybisTransactionFees {
  paybisFee: PaybisTransactionAmount | null;
  paymentFee: PaybisTransactionAmount | null;
  networkFee: PaybisTransactionAmount | null;
  partnerFee: PaybisTransactionAmount | null;
  partnerFeeFiat: PaybisTransactionAmount | null;
}

export interface PaybisTransactionAmounts {
  spentOriginal: PaybisTransactionAmount;
  spentFiat: PaybisTransactionAmount;
  receivedOriginal: PaybisTransactionAmount;
  receivedFiat: PaybisTransactionAmount;
}

export interface PaybisTransactionExchangeRate {
  currencyTo: PaybisTransactionAmount;
  currencyFrom: PaybisTransactionAmount;
}

export interface PaybisTransactionUser {
  id: string;
  email: string;
  country: {
    name: string;
    code: string;
  };
}

export interface PaybisTransactionRequest {
  id: string;
  flow: string;
  createdAt: string;
}

export interface PaybisTransaction {
  id: string;
  gateway: string;
  status: string;
  from: {
    name: string;
    asset: PaybisTransactionAsset;
    address: string;
    destinationTag: string | null;
  };
  to: {
    name: string;
    asset: PaybisTransactionAsset | null;
    address: string | null;
    destinationTag: string | null;
  };
  exchangeRate: PaybisTransactionExchangeRate;
  hash: string | null;
  explorerLink: string | null;
  createdAt: string;
  paidAt: string;
  completedAt: string | null;
  amounts: PaybisTransactionAmounts;
  fees: PaybisTransactionFees;
  user: PaybisTransactionUser;
  request: PaybisTransactionRequest;
}

export interface PaybisTransactionResponse {
  data: PaybisTransaction[];
  meta: {
    limit: number;
    currentCursor: string | null;
    nextCursor: string | null;
  };
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

  getRequestConfig(
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

  getApiRequestConfig(
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
   * Get transaction details by requestId
   * @param requestId - The request ID to fetch transaction details for
   * @returns Promise<PaybisTransactionResponse>
   */
  async getTransactionByRequestId(
    requestId: string,
  ): Promise<PaybisTransactionResponse> {
    const config = this.getApiRequestConfig(
      'GET',
      `/paybis/transaction/${requestId}`,
    );
    const response = await this.axiosInstance(config);
    return response.data;
  }

  /**
   * @param params
   * @param side
   * @returns URL
   */
  async createWidgetUrl(
    all_params: Record<string, string | number | boolean>,
    side: string,
  ): Promise<WidgetUrlData> {
    const baseUrl =
      side === 'sell' ? this.config.widgetUrlSell : this.config.widgetUrl;


    // Generate a temporary ID and store the mapping
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const payload = {
      depositRedirectUrl: `${this.config.depositRedirectUrl}/${tempId}`,
      mode: side,
      ...all_params,
      locale: this.config.locale,
    };

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
