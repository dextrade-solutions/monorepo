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
  CoinModel,
  ExchangerSettingsInfoModel,
  ProviderExchangerSettingsListRequestModel,
  ProviderExchangerSettingsResponseModel,
  ProviderExchangerSettingsStatusRequestModel,
  ProviderUserCreateModel,
  ProviderUserExchangerSettingsCreateModel,
  ProviderUserExchangerSettingsUpdateModel,
  ProviderUserResponseModel,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Provider<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags provider-controller
   * @name UpdateExchangerSettingsStatus
   * @request POST:/public/provider/update/exchanger-settings/status
   */
  updateExchangerSettingsStatus = (data: ProviderExchangerSettingsStatusRequestModel, params: RequestParams = {}) =>
    this.request<void, Record<string, string>>({
      path: `/public/provider/update/exchanger-settings/status`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags provider-controller
   * @name UpdateExchangerSettings
   * @request POST:/public/provider/update/exchanger-settings/
   */
  updateExchangerSettings = (data: ProviderUserExchangerSettingsUpdateModel, params: RequestParams = {}) =>
    this.request<ProviderExchangerSettingsResponseModel, Record<string, string>>({
      path: `/public/provider/update/exchanger-settings/`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags provider-controller
   * @name ListExchangerSettings
   * @request POST:/public/provider/exchanger-settings
   */
  listExchangerSettings = (data: ProviderExchangerSettingsListRequestModel, params: RequestParams = {}) =>
    this.request<ExchangerSettingsInfoModel[], Record<string, string>>({
      path: `/public/provider/exchanger-settings`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags provider-controller
   * @name AddUser
   * @request POST:/public/provider/create/user
   */
  addUser = (data: ProviderUserCreateModel, params: RequestParams = {}) =>
    this.request<ProviderUserResponseModel, Record<string, string>>({
      path: `/public/provider/create/user`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags provider-controller
   * @name AddExchangerSettings
   * @request POST:/public/provider/create/exchanger-settings
   */
  addExchangerSettings = (data: ProviderUserExchangerSettingsCreateModel, params: RequestParams = {}) =>
    this.request<ProviderExchangerSettingsResponseModel, Record<string, string>>({
      path: `/public/provider/create/exchanger-settings`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags provider-controller
   * @name ListCoins
   * @request GET:/public/provider/coins
   */
  listCoins = (params: RequestParams = {}) =>
    this.request<CoinModel[], Record<string, string>>({
      path: `/public/provider/coins`,
      method: "GET",
      ...params,
    });
}
