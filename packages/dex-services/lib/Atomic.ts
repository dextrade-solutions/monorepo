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

import { ClaimSwapOwnerModel } from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Atomic<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags atomic-swap-controller
   * @name GetStatistics2
   * @request POST:/api/atomic/swap/claim
   */
  swapClaim = (data: ClaimSwapOwnerModel, params: RequestParams = {}) =>
    this.request<string, Record<string, string>>({
      path: `/api/atomic/swap/claim`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
}
