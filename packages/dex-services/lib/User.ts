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

import { AvatarModel, DeviceIdRequestModel, IdNameModel, UserModel, UserSessionModel } from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class User<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags user-controller
   * @name Update
   * @request POST:/api/user/update
   */
  update = (
    data: UserModel,
    params: RequestParams = {},
  ) =>
    this.request<void, Record<string, string>>({
      path: `/api/user/update`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags user-controller
   * @name UpdateName
   * @request POST:/api/user/session/set/name
   */
  updateName = (data: IdNameModel, params: RequestParams = {}) =>
    this.request<void, Record<string, string>>({
      path: `/api/user/session/set/name`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags user-controller
   * @name Update1
   * @request POST:/api/user/save/avatar
   */
  update1 = (data: AvatarModel, params: RequestParams = {}) =>
    this.request<string, Record<string, string>>({
      path: `/api/user/save/avatar`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags user-controller
   * @name Ping
   * @request POST:/api/user/ping
   */
  ping = (params: RequestParams = {}) =>
    this.request<void, Record<string, string>>({
      path: `/api/user/ping`,
      method: "POST",
      ...params,
    });
  /**
   * No description
   *
   * @tags user-controller
   * @name Offline
   * @request POST:/api/user/offline
   */
  offline = (params: RequestParams = {}) =>
    this.request<void, Record<string, string>>({
      path: `/api/user/offline`,
      method: "POST",
      ...params,
    });
  /**
   * No description
   *
   * @tags user-controller
   * @name IsUsernameExist
   * @request POST:/api/user/is/username/exist
   */
  isUsernameExist = (
    query: {
      username: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<boolean, Record<string, string>>({
      path: `/api/user/is/username/exist`,
      method: "POST",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags user-controller
   * @name Delete
   * @request POST:/api/user/delete
   */
  delete = (
    params: RequestParams = {},
  ) =>
    this.request<void, Record<string, string>>({
      path: `/api/user/delete`,
      method: "POST",
      ...params,
    });
  /**
   * No description
   *
   * @tags user-controller
   * @name DeleteSession
   * @request POST:/api/user/delete/session
   */
  deleteSession = (
    query: {
      /** @format int64 */
      id: number;
    },
    params: RequestParams = {},
  ) =>
    this.request<void, Record<string, string>>({
      path: `/api/user/delete/session`,
      method: "POST",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags user-controller
   * @name DeleteAvatar
   * @request POST:/api/user/delete/avatar
   */
  deleteAvatar = (params: RequestParams = {}) =>
    this.request<void, Record<string, string>>({
      path: `/api/user/delete/avatar`,
      method: "POST",
      ...params,
    });
  /**
   * No description
   *
   * @tags user-controller
   * @name AddDeviceId
   * @request POST:/api/user/add/device/id
   */
  addDeviceId = (data: DeviceIdRequestModel, params: RequestParams = {}) =>
    this.request<void, Record<string, string>>({
      path: `/api/user/add/device/id`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags user-controller
   * @name Activate
   * @request POST:/api/user/activate
   */
  activate = (
    query: {
      force: boolean;
    },
    params: RequestParams = {},
  ) =>
    this.request<void, Record<string, string>>({
      path: `/api/user/activate`,
      method: "POST",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags user-controller
   * @name GetSession
   * @request GET:/api/user/sessions
   */
  getSession = (params: RequestParams = {}) =>
    this.request<UserSessionModel[], Record<string, string>>({
      path: `/api/user/sessions`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags user-controller
   * @name Current
   * @request GET:/api/user/current
   */
  current = (
    params: RequestParams = {},
  ) =>
    this.request<UserModel, Record<string, string>>({
      path: `/api/user/current`,
      method: "GET",
      format: 'json',
      ...params,
    });
}
