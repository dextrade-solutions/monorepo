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

import { PriceResponseModel } from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Price<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags price-controller
   * @name GetByAggregatorAndPair
   * @request POST:/public/price/by/uuids
   */
  getByAggregatorAndPair = (data: string[], params: RequestParams = {}) =>
    this.request<PriceResponseModel[], Record<string, string>>({
      path: `/public/price/by/uuids`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
}
