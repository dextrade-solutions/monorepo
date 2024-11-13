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

import { CoinPairsAggregatorsModel, CoinPairsModel } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class CoinPairs<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags pairs-controller
   * @name ListCurrencyByPair
   * @request GET:/api/coin-pairs/pairs/by/currency
   */
  listCurrencyByPair = (
    query: {
      currency: "BINANCE" | "CRYPTO_COMPARE" | "COIN_MARKET_CUP" | "DEXPAY" | "COIN_GECKO" | "FIXED_PRICE";
    },
    params: RequestParams = {},
  ) =>
    this.request<CoinPairsModel[], Record<string, string>>({
      path: `/api/coin-pairs/pairs/by/currency`,
      method: "GET",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags pairs-controller
   * @name ListCurrencyByPair1
   * @request GET:/api/coin-pairs/currencies/by/pair
   */
  listCurrencyByPair1 = (
    query: {
      nameFrom: string;
      nameTo: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<CoinPairsAggregatorsModel, Record<string, string>>({
      path: `/api/coin-pairs/currencies/by/pair`,
      method: "GET",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags pairs-controller
   * @name GetByAggregatorAndPair1
   * @request GET:/api/coin-pairs/by/currency-and-pair
   */
  getByAggregatorAndPair1 = (
    query: {
      currencies: "BINANCE" | "CRYPTO_COMPARE" | "COIN_MARKET_CUP" | "DEXPAY" | "COIN_GECKO" | "FIXED_PRICE";
      nameFrom: string;
      nameTo: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<CoinPairsModel, Record<string, string>>({
      path: `/api/coin-pairs/by/currency-and-pair`,
      method: "GET",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags pairs-controller
   * @name ListAllCurrencies1
   * @request GET:/api/coin-pairs/all/currencies
   */
  listAllCurrencies1 = (params: RequestParams = {}) =>
    this.request<
      ("BINANCE" | "CRYPTO_COMPARE" | "COIN_MARKET_CUP" | "DEXPAY" | "COIN_GECKO" | "FIXED_PRICE")[],
      Record<string, string>
    >({
      path: `/api/coin-pairs/all/currencies`,
      method: "GET",
      ...params,
    });
}
