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

import { KycModel } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Kyc<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags kyc-controller
   * @name GetKycInfo
   * @request GET:/api/kyc
   */
  getKycInfo = (params: RequestParams = {}) =>
    this.request<KycModel, Record<string, string>>({
      path: `/api/kyc`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags kyc-controller
   * @name GetFormLink
   * @request GET:/api/kyc/form
   */
  getFormLink = (params: RequestParams = {}) =>
    this.request<string, Record<string, string>>({
      path: `/api/kyc/form`,
      method: "GET",
      ...params,
    });
}
