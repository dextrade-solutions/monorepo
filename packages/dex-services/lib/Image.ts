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

export class Image<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags image-controller
   * @name List
   * @request GET:/public/image/{id}
   */
  list = (id: string, params: RequestParams = {}) =>
    this.request<string, Record<string, string>>({
      path: `/public/image/${id}`,
      method: "GET",
      ...params,
    });
}
