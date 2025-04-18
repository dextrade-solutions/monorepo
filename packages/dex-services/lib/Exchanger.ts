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

import {
  ExchangerFilterModel,
  ExchangerMinModel,
  ExchangerModel,
  ExchangerSettingsCreateModel,
  ExchangerSettingsInfoModel,
  IdNameModel,
  IdNetworkModel,
  IdRequestModel,
  OnOffSettingsRequestModel,
  PaymentMethodsDeleteModel,
  ReserveModel,
  ReserveRequestModel,
  UserSessionInfoModel,
  ExchangerFilterGroupModel,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Exchanger<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags exchanger-public-controller
   * @name GetActiveExchangersByFilter
   * @request POST:/public/exchanger/filter
   */
  getActiveExchangersByFilter = (data: ExchangerFilterModel, params: RequestParams = {}) =>
    this.request<ExchangerModel[], Record<string, string>>({
      path: `/public/exchanger/filter`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags exchanger-controller
   * @name OnOffSetting
   * @request POST:/api/exchanger/status
   */
  onOffSetting = (
    data: OnOffSettingsRequestModel,
    params: RequestParams = {},
  ) =>
    this.request<void, Record<string, string>>({
      path: `/api/exchanger/status`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags exchanger-controller
   * @name SaveExchangerSettings
   * @request POST:/api/exchanger/save/settings
   */
  saveExchangerSettings = (data: ExchangerSettingsCreateModel, params: RequestParams = {}) =>
    this.request<IdNameModel, Record<string, string>>({
      path: `/api/exchanger/save/settings`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags exchanger-controller
   * @name RemoveDeleteExchange
   * @request POST:/api/exchanger/return/deleted/setting
   */
  removeDeleteExchange = (data: IdRequestModel, params: RequestParams = {}) =>
    this.request<void, Record<string, string>>({
      path: `/api/exchanger/return/deleted/setting`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags exchanger-controller
   * @name ReserveList
   * @request GET:/api/exchanger/reserve
   */
  reserveList = (
    params: RequestParams = {},
  ) =>
    this.request<ReserveModel[], Record<string, string>>({
      path: `/api/exchanger/reserve`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags exchanger-controller
   * @name CreateReserve
   * @request POST:/api/exchanger/reserve
   */
  createReserve = (
    data: ReserveModel,
    params: RequestParams = {},
  ) =>
    this.request<void, Record<string, string>>({
      path: `/api/exchanger/reserve`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags exchanger-controller
   * @name CreateReserve1
   * @request POST:/api/exchanger/reserve/list
   */
  createReserve1 = (
    data: ReserveRequestModel,
    params: RequestParams = {},
  ) =>
    this.request<ReserveModel[], Record<string, string>>({
      path: `/api/exchanger/reserve/list`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags exchanger-controller
   * @name GetExchanger
   * @request POST:/api/exchanger/info
   */
  getExchanger = (data: IdRequestModel, params: RequestParams = {}) =>
    this.request<ExchangerModel, Record<string, string>>({
      path: `/api/exchanger/info`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags exchanger-controller
   * @name GetActiveExchangersByFilter1
   * @request POST:/api/exchanger/filter
   */
  getActiveExchangersByFilter1 = (data: ExchangerFilterModel, params: RequestParams = {}) =>
    this.request<ExchangerModel[], Record<string, string>>({
      path: `/api/exchanger/filter`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags exchanger-controller
   * @name GetActiveExchangersByFilter2
   * @request POST:/api/exchanger/filter/byId
   */
  getActiveExchangersByFilter2 = (data: IdRequestModel, params: RequestParams = {}) =>
    this.request<ExchangerModel, Record<string, string>>({
      path: `/api/exchanger/filter/byId`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags exchanger-controller
   * @name DeleteExchange
   * @request POST:/api/exchanger/delete/setting
   */
  deleteExchange = (data: IdRequestModel, params: RequestParams = {}) =>
    this.request<void, Record<string, string>>({
      path: `/api/exchanger/delete/setting`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags exchanger-controller
   * @name DeletePaymentMethodFromExchangerSettings
   * @request POST:/api/exchanger/delete/payment-method/from/exchanger-settings
   */
  deletePaymentMethodFromExchangerSettings = (data: PaymentMethodsDeleteModel[], params: RequestParams = {}) =>
    this.request<void, Record<string, string>>({
      path: `/api/exchanger/delete/payment-method/from/exchanger-settings`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags exchanger-public-controller
   * @name IsExchangerActive
   * @request GET:/public/exchanger/is/active
   */
  isExchangerActive = (
    query: {
      /** @format int64 */
      userId: number;
      /** api key */
      "api-key": any;
    },
    params: RequestParams = {},
  ) =>
    this.request<boolean, Record<string, string>>({
      path: `/public/exchanger/is/active`,
      method: "GET",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags exchanger-public-controller
   * @name IsExchangerActiveBySettings
   * @request GET:/public/exchanger/is/active/by/settings
   */
  isExchangerActiveBySettings = (
    query: {
      /** @format int64 */
      settingsId: number;
      /** api key */
      "api-key": any;
    },
    params: RequestParams = {},
  ) =>
    this.request<boolean, Record<string, string>>({
      path: `/public/exchanger/is/active/by/settings`,
      method: "GET",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags exchanger-public-controller
   * @name IsExchangerActiveBySession
   * @request GET:/public/exchanger/is/active/by/session
   */
  isExchangerActiveBySession = (
    query: {
      session: string;
      /** api key */
      "api-key": any;
    },
    params: RequestParams = {},
  ) =>
    this.request<UserSessionInfoModel, Record<string, string>>({
      path: `/public/exchanger/is/active/by/session`,
      method: "GET",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags exchanger-public-controller
   * @name GetById
   * @request GET:/public/exchanger/byId
   */
  getById = (
    query: {
      /** @format int64 */
      id: number;
    },
    params: RequestParams = {},
  ) =>
    this.request<ExchangerSettingsInfoModel, Record<string, string>>({
      path: `/public/exchanger/byId`,
      method: "GET",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags exchanger-controller
   * @name GetUserSettingsByUserId
   * @request GET:/api/exchanger/settings
   */
  getUserSettingsByUserId = (
    params: RequestParams = {},
  ) =>
    this.request<ExchangerSettingsInfoModel[], Record<string, string>>({
      path: `/api/exchanger/settings`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags exchanger-controller
   * @name GetUserSettingsById
   * @request GET:/api/exchanger/settings/{id}
   */
  getUserSettingsById = (
    id: number,
    params: RequestParams = {},
  ) =>
    this.request<ExchangerSettingsInfoModel, Record<string, string>>({
      path: `/api/exchanger/settings/${id}`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags exchanger-controller
   * @name GetSettingsStatus
   * @request GET:/api/exchanger/settings/status
   */
  getSettingsStatus = (params: RequestParams = {}) =>
    this.request<ExchangerMinModel[], Record<string, string>>({
      path: `/api/exchanger/settings/status`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags exchanger-controller
   * @name GetNetworks
   * @request GET:/api/exchanger/networks
   */
  getNetworks = (params: RequestParams = {}) =>
    this.request<IdNetworkModel[], Record<string, string>>({
      path: `/api/exchanger/networks`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags exchanger-controller
   * @name GetExchangerFilterGroup
   * @request GET:/api/exchanger/filter/group
   */
  getExchangerFilterGroup = (params: RequestParams = {}) =>
    this.request<ExchangerFilterGroupModel[], Record<string, string>>({
      path: `/api/exchanger/filter/group`,
      method: "GET",
      ...params,
    });
}
