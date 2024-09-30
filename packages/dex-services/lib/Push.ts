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

import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Push<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags push-controller
   * @name SendPush
   * @request POST:/public/push
   */
  sendPush = (
    query: {
      title: string;
      mnemonicHash: string;
      deviceId: string;
    },
    data: string,
    params: RequestParams = {},
  ) =>
    this.request<void, Record<string, string>>({
      path: `/public/push`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags push-controller
   * @name SendWeb
   * @request POST:/public/push/web
   */
  sendWeb = (
    query: {
      title: string;
      mnemonicHash: string;
    },
    data: string,
    params: RequestParams = {},
  ) =>
    this.request<void, Record<string, string>>({
      path: `/public/push/web`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags push-controller
   * @name SendIos
   * @request POST:/public/push/ios
   */
  sendIos = (
    query: {
      title: string;
      mnemonicHash: string;
      deviceId: string;
    },
    data: string,
    params: RequestParams = {},
  ) =>
    this.request<void, Record<string, string>>({
      path: `/public/push/ios`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags push-controller
   * @name SendAndroid
   * @request POST:/public/push/android
   */
  sendAndroid = (
    query: {
      title: string;
      mnemonicHash: string;
    },
    data: string,
    params: RequestParams = {},
  ) =>
    this.request<void, Record<string, string>>({
      path: `/public/push/android`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });
}
