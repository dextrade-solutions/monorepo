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

import { AuthRequestModel, AuthResponseModel } from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Auth<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags auth-controller
   * @name Auth
   * @request POST:/public/auth
   */
  auth = (data: AuthRequestModel, params: RequestParams = {}) =>
    this.request<AuthResponseModel, Record<string, string>>({
      path: `/public/auth`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
}
