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

import { UtilsUTXORequestModel, UtilsUTXOResponseModel } from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Utils<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags utils-controller
   * @name GetUtxo
   * @request POST:/public/utils/utxo
   */
  getUtxo = (data: UtilsUTXORequestModel, params: RequestParams = {}) =>
    this.request<UtilsUTXOResponseModel, Record<string, string>>({
      path: `/public/utils/utxo`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags utils-controller
   * @name Init
   * @request POST:/public/utils/coin-pairs/init
   */
  init = (params: RequestParams = {}) =>
    this.request<void, Record<string, string>>({
      path: `/public/utils/coin-pairs/init`,
      method: "POST",
      ...params,
    });
}
