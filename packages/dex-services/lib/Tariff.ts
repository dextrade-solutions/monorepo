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

import { TariffModel, UserTariffModel } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Tariff<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags tariff-controller
   * @name ListAll
   * @request GET:/public/tariff
   */
  listAll = (params: RequestParams = {}) =>
    this.request<TariffModel[], Record<string, string>>({
      path: `/public/tariff`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags user-tariff-controller
   * @name Limit
   * @request GET:/api/tariff/limit
   */
  limit = (params: RequestParams = {}) =>
    this.request<UserTariffModel, Record<string, string>>({
      path: `/api/tariff/limit`,
      method: "GET",
      ...params,
    });
}
