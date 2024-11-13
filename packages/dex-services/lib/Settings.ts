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

import { SettingsModel } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Settings<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags settings-controller
   * @name GetSettings
   * @request GET:/public/settings
   */
  getSettings = (params: RequestParams = {}) =>
    this.request<SettingsModel, Record<string, string>>({
      path: `/public/settings`,
      method: "GET",
      ...params,
    });
}
