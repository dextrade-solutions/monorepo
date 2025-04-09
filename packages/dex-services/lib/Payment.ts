/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

import {
  BankDictModel,
  CountryDictModel,
  IdRequestModel,
  PaymentBalanceUpdateModel,
  PaymentCallBackModel,
  PaymentCreateExchangeRequestModel,
  PaymentInfoModel,
  PaymentMethodCurrencyModel,
  PaymentMethodsCreateModel,
  PaymentMethodsModel,
  PaymentOrderResponseModel,
  PaymentPricesModel,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Payment<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags payments-public-controller
   * @name PaymentCallback
   * @request POST:/public/payment/callback
   */
  paymentCallback = (data: PaymentCallBackModel, params: RequestParams = {}) =>
    this.request<void, Record<string, string>>({
      path: `/public/payment/callback`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags payment-methods-controller
   * @name ListAllBanks
   * @request GET:/api/payment/methods
   */
  listAllBanks = (params: RequestParams = {}) =>
    this.request<BankDictModel[], Record<string, string>>({
      path: `/api/payment/methods`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags payment-methods-controller
   * @name Save
   * @request POST:/api/payment/methods
   */
  save = (data: PaymentMethodsCreateModel, params: RequestParams = {}) =>
    this.request<number, Record<string, string>>({
      path: `/api/payment/methods/list`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags payment-methods-controller
   * @name Update2
   * @request POST:/api/payment/methods/update
   */
  update2 = (data: PaymentBalanceUpdateModel, params: RequestParams = {}) =>
    this.request<number, Record<string, string>>({
      path: `/api/payment/methods/update`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags payment-methods-controller
   * @name Delete1
   * @request POST:/api/payment/methods/delete
   */
  delete1 = (data: IdRequestModel, params: RequestParams = {}) =>
    this.request<void, Record<string, string>>({
      path: `/api/payment/methods/delete`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags payments-controller
   * @name CreateExchange
   * @request POST:/api/payment/exchange
   */
  createExchange = (data: PaymentCreateExchangeRequestModel, params: RequestParams = {}) =>
    this.request<string, Record<string, string>>({
      path: `/api/payment/exchange`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags payments-public-controller
   * @name CreateCryptoCrypto1
   * @request GET:/public/payment/dex/order/info
   */
  createCryptoCrypto1 = (
    query: {
      uuid: string;
      /** api key */
      "api-key": any;
    },
    params: RequestParams = {},
  ) =>
    this.request<PaymentOrderResponseModel, Record<string, string>>({
      path: `/public/payment/dex/order/info`,
      method: "GET",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags payments-controller
   * @name GetByUserId
   * @request GET:/api/payment
   */
  getByUserId = (params: RequestParams = {}) =>
    this.request<PaymentInfoModel[], Record<string, string>>({
      path: `/api/payment`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags payments-controller
   * @name GetPrices
   * @request GET:/api/payment/prices
   */
  getPrices = (params: RequestParams = {}) =>
    this.request<PaymentPricesModel, Record<string, string>>({
      path: `/api/payment/prices`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags payments-controller
   * @name ListAllNetworks
   * @request GET:/api/payment/networks
   */
  listAllNetworks = (params: RequestParams = {}) =>
    this.request<("ethereum" | "binance_smart_chain" | "tron" | "bitcoin")[], Record<string, string>>({
      path: `/api/payment/networks`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags payment-methods-controller
   * @name ListAllCurrency
   * @request GET:/api/payment/methods/currencies
   */
  listAllCurrency = (params: RequestParams = {}) =>
    this.request<PaymentMethodCurrencyModel[], Record<string, string>>({
      path: `/api/payment/methods/currencies`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags payment-methods-controller
   * @name ListAllCurrencyByCountryId
   * @request GET:/api/payment/methods/currencies/by/country/{countryId}
   */
  listAllCurrencyByCountryId = (countryId: number, params: RequestParams = {}) =>
    this.request<PaymentMethodCurrencyModel[], Record<string, string>>({
      path: `/api/payment/methods/currencies/by/country/${countryId}`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags payment-methods-controller
   * @name ListAllCountry
   * @request GET:/api/payment/methods/countries
   */
  listAllCountry = (params: RequestParams = {}) =>
    this.request<CountryDictModel[], Record<string, string>>({
      path: `/api/payment/methods/countries`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags payment-methods-controller
   * @name ListAll1
   * @request GET:/api/payment/methods/by/user
   */
  listAll1 = (params: RequestParams = {}) =>
    this.request<PaymentMethodsModel[], Record<string, string>>({
      path: `/api/payment/methods/by/user`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags payment-methods-controller
   * @name ListAllBankByCurrencyId
   * @request GET:/api/payment/methods/by/currency/{currency}
   */
  listAllBankByCurrencyId = (currency: string, params: RequestParams = {}) =>
    this.request<BankDictModel[], Record<string, string>>({
      path: `/api/payment/methods/by/currency/${currency}`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags payment-methods-controller
   * @name ListAllBankByCountryId
   * @request GET:/api/payment/methods/by/country/{countryId}
   */
  listAllBankByCountryId = (countryId: number, params: RequestParams = {}) =>
    this.request<BankDictModel[], Record<string, string>>({
      path: `/api/payment/methods/by/country/${countryId}`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags payments-controller
   * @name ListAllCurrencies
   * @request GET:/api/payment/currencies
   */
  listAllCurrencies = (params: RequestParams = {}) =>
    this.request<("ETH" | "BNB" | "TRX" | "BTC" | "USDT")[], Record<string, string>>({
      path: `/api/payment/currencies`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags payments-controller
   * @name CreateAddress
   * @request GET:/api/payment/address
   */
  createAddress = (
    query: {
      network: "ethereum" | "binance_smart_chain" | "tron" | "bitcoin";
      currency: "ETH" | "BNB" | "TRX" | "BTC" | "USDT";
    },
    params: RequestParams = {},
  ) =>
    this.request<string, Record<string, string>>({
      path: `/api/payment/address`,
      method: "GET",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags payments-controller
   * @name CreateInvoice
   * @request GET:/api/payment/address
   */
  createInvoice = (
    data: { tariffId: number },
    params: RequestParams = {},
  ) =>
    this.request<string, Record<string, string>>({
      path: `/api/payment/create-invoice`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

    /**
   * No description
   *
   * @tags payments-controller
   * @name SubscribeAddress
   * @request POST:/api/payment/fija/subscribe/address
   */
    subscribeAddress = (
      data: { address: string; currency: string },
      params: RequestParams = {},
    ) =>
      this.request<void, Record<string, string>>({
        path: `/api/payment/fija/subscribe/address`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      });
}
