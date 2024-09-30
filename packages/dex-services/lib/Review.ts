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

import { ReviewModel } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Review<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags review-controller
   * @name GetByExchangerId
   * @request GET:/public/review/by/exchanger
   */
  getByExchangerId = (
    query: {
      /** @format int64 */
      exchangerId: number;
    },
    params: RequestParams = {},
  ) =>
    this.request<ReviewModel[], Record<string, string>>({
      path: `/public/review/by/exchanger`,
      method: "GET",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags review-controller
   * @name GetByExchangeId
   * @request GET:/public/review/by/exchange
   */
  getByExchangeId = (
    query: {
      /** @format uuid */
      exchangeId: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<ReviewModel, Record<string, string>>({
      path: `/public/review/by/exchange`,
      method: "GET",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags review-controller
   * @name GetByClientId
   * @request GET:/public/review/by/client
   */
  getByClientId = (
    query: {
      /** @format int64 */
      clientId: number;
    },
    params: RequestParams = {},
  ) =>
    this.request<ReviewModel[], Record<string, string>>({
      path: `/public/review/by/client`,
      method: "GET",
      query: query,
      ...params,
    });
}
