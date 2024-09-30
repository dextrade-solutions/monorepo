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

import { HttpClient, RequestParams } from "./http-client";

export class Avatar<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags avatar-controller
   * @name List2
   * @request GET:/public/avatar/{userId}
   */
  list2 = (userId: string, params: RequestParams = {}) =>
    this.request<string, Record<string, string>>({
      path: `/public/avatar/${userId}`,
      method: "GET",
      ...params,
    });
}
