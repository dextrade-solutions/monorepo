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

import { ZealyAuthRequestModel } from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Zealy<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags zealy-controller
   * @name Task
   * @request POST:/public/zealy/task
   */
  task = (data: ZealyAuthRequestModel, params: RequestParams = {}) =>
    this.request<void, Record<string, string>>({
      path: `/public/zealy/task`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags zealy-controller
   * @name Task2
   * @request POST:/public/zealy/taskDextradeCom
   */
  task2 = (data: ZealyAuthRequestModel, params: RequestParams = {}) =>
    this.request<void, Record<string, string>>({
      path: `/public/zealy/taskDextradeCom`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
}
