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

import { TronScanBroadcastRequestModel } from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Broadcast<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags broadcast-controller
   * @name BroadcastTrx
   * @request POST:/public/broadcast/broadcast/trx
   */
  broadcastTrx = (data: TronScanBroadcastRequestModel, params: RequestParams = {}) =>
    this.request<string, Record<string, string>>({
      path: `/public/broadcast/broadcast/trx`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
}
