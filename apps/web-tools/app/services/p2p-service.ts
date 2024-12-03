import axios, { Axios, InternalAxiosRequestConfig } from 'axios';

import { DEXTRADE_BASE_URL } from '../helpers/constants';
import { AuthParams } from '../types/dextrade';
import { AdFilterModel, TradeFilterModel } from '../types/p2p-swaps';
import { TradeType } from 'dex-helpers';

type PublicGetMarketFeeResponse = {
  status: boolean;
  data: {
    from_address: string;
    to_address: string;
    amount: string;
    type: string;
    network_cost: number;
    result_amount: string;
  };
};

class P2PService {
  axios: Axios;

  constructor() {
    this.axios = axios.create({
      baseURL: DEXTRADE_BASE_URL,
    });
  }

  public setOnRequestHandler(
    handler: (
      config: InternalAxiosRequestConfig<any>,
    ) => InternalAxiosRequestConfig<any>,
  ) {
    this.axios.interceptors.request.use(handler, (error) => {
      return Promise.reject(error);
    });
  }

  public login(params: AuthParams) {
    return this.axios.post('public/auth', params);
  }

  public filterAds(data: AdFilterModel) {
    return this.axios.post('public/exchanger/filter', data);
  }

  public filterTrades(data: TradeFilterModel) {
    return this.axios.post('api/exchange/filter', data);
  }

  public clientExchangeStart(type: TradeType, params: any) {
    let urlPostfix;
    switch (type) {
      case TradeType.cryptoCrypto:
      case TradeType.atomicSwap:
        urlPostfix = 'crypto/crypto';
        break;
      case TradeType.fiatCrypto:
        urlPostfix = 'fiat/crypto';
        break;
      case TradeType.cryptoFiat:
        urlPostfix = 'crypto/fiat';
        break;
      default:
        throw new Error(`Unexpected pair type - ${type}`);
    }
    return this.axios.post(`api/exchange/create/${urlPostfix}`, params);
  }

  public exchangeById(id: string) {
    return this.axios.get('api/exchange/byId', { params: { id } });
  }

  public exchangeApprove(isFiat: boolean, params: any) {
    const type = isFiat ? 'fiat' : 'crypto';
    return this.axios.post(`api/exchange/client/send/${type}`, params);
  }

  public paymentMethodIndex() {
    return this.axios.get('api/payment/methods');
  }

  public paymentMethodCurrenciesIndex() {
    return this.axios.get('api/payment/methods/currencies');
  }

  public paymentMethodCreateOrUpdate(data: any) {
    const method = data.id ? 'put' : 'post';

    return this.axios[method]('api/payment/methods', data);
  }

  public paymentMethodDelete(id: number) {
    return this.axios.post(`api/payment/methods/delete`, { id });
  }

  public userPaymentMethods() {
    return this.axios.get('api/payment/methods/by/user');
  }

  public cancelExchange(id: string) {
    return this.axios.post(`api/exchange/client/cancel/transaction`, { id });
  }

  public confirmExchangeFiat(id: string) {
    return this.axios.post(`api/exchange/client/confirm/fiat`, { id });
  }

  public estimateFee(txParams: any) {
    return this.axios.post('api/fee/estimate', txParams);
  }

  public publicGetMarketFee(params: {
    amount: number;
    side: 'sell' | 'buy';
    currency_1_iso: string;
    currency_2_iso: string;
  }) {
    return this.axios.post<PublicGetMarketFeeResponse>(
      'https://api.cryptodao.com/v2/pub/get-market-fee',
      params,
    );
  }

  public saveImage(base64: string) {
    return this.axios.post('api/chat/save', { data: base64 });
  }

  public requestKycForm() {
    return this.axios.get('api/kyc/form');
  }

  public getKycInfo() {
    return this.axios.get('api/kyc');
  }
}

const serviceInstance = new P2PService();

export default serviceInstance;
