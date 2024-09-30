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

import { TestModel } from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Test<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags test-controller
   * @name TestWithoutBody
   * @request POST:/api/test/without-body
   */
  testWithoutBody = (params: RequestParams = {}) =>
    this.request<string, Record<string, string>>({
      path: `/api/test/without-body`,
      method: "POST",
      ...params,
    });
  /**
   * No description
   *
   * @tags test-controller
   * @name TestWithBody
   * @request POST:/api/test/with-body
   */
  testWithBody = (data: TestModel, params: RequestParams = {}) =>
    this.request<string, Record<string, string>>({
      path: `/api/test/with-body`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
}
