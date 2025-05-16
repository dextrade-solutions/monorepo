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
  ApiErrorResponse,
  ChangellyExchangeModel,
  CoinData,
  DataBlock,
  DepositData,
  ProviderCoinsModel,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Changelly<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags changelly-controller
   * @name Create
   * @request POST:/public/changelly/create
   */
  create = (data: ChangellyExchangeModel, params: RequestParams = {}) =>
    this.request<DepositData, ApiErrorResponse>({
      path: `/public/changelly/create`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags changelly-controller
   * @name GetPairs
   * @request GET:/public/changelly/status
   */
  getPairs = (
    query: {
      externalId: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<DataBlock, ApiErrorResponse>({
      path: `/public/changelly/status`,
      method: "GET",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags changelly-controller
   * @name GetPairs1
   * @request GET:/public/changelly/pairs
   */
  getPairs1 = (
    query: {
      from: string;
      to: string;
      fromNetwork: string;
      toNetwork: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<CoinData[], ApiErrorResponse>({
      path: `/public/changelly/pairs`,
      method: "GET",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags changelly-controller
   * @name GetCoins
   * @request GET:/public/changelly/coins
   */
  getCoins = (params: RequestParams = {}) =>
    this.request<ProviderCoinsModel[], ApiErrorResponse>({
      path: `/public/changelly/coins`,
      method: "GET",
      ...params,
    });
}
