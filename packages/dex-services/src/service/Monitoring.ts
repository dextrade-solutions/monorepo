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

import { ExchangeModel } from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Monitoring<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags monitoring-controller
   * @name SendWss
   * @request POST:/public/monitoring/check/connection
   */
  sendWss = (
    query: {
      apiKey: string;
    },
    data: ExchangeModel,
    params: RequestParams = {},
  ) =>
    this.request<boolean, Record<string, string>>({
      path: `/public/monitoring/check/connection`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });
}
