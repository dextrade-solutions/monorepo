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

import { ImageModel } from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Chat<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags chat-controller
   * @name Unread
   * @request POST:/api/chat/unread
   */
  unread = (
    query: {
      /** @format uuid */
      exchangeId: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<number, Record<string, string>>({
      path: `/api/chat/unread`,
      method: "POST",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags chat-controller
   * @name Save1
   * @request POST:/api/chat/save
   */
  save1 = (data: ImageModel, params: RequestParams = {}) =>
    this.request<string, Record<string, string>>({
      path: `/api/chat/save`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags chat-public-controller
   * @name List1
   * @request GET:/public/chat/{identifier}
   */
  list1 = (identifier: string, params: RequestParams = {}) =>
    this.request<string, Record<string, string>>({
      path: `/public/chat/${identifier}`,
      method: "GET",
      ...params,
    });
}
