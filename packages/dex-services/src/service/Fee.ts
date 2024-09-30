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

import { FeeEstimateModel } from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Fee<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags fee-controller
   * @name Estimate
   * @request POST:/api/fee/estimate
   */
  estimate = (data: FeeEstimateModel, params: RequestParams = {}) =>
    this.request<number, Record<string, string>>({
      path: `/api/fee/estimate`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
}
