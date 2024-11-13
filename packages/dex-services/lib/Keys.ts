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

import { PriceApiKeyInfoRequestModel, PriceApiKeyModel, PriceApiKeyRequestLimitModel } from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Keys<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags api-key-controller
   * @name GetStatistics1
   * @request POST:/api/keys/info
   */
  getStatistics1 = (data: PriceApiKeyInfoRequestModel, params: RequestParams = {}) =>
    this.request<PriceApiKeyRequestLimitModel, Record<string, string>>({
      path: `/api/keys/info`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags api-key-controller
   * @name GetNewApiKey
   * @request GET:/api/keys
   */
  getNewApiKey = (params: RequestParams = {}) =>
    this.request<PriceApiKeyModel[], Record<string, string>>({
      path: `/api/keys`,
      method: "GET",
      ...params,
    });
}
