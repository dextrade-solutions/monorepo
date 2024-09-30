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

import { StatisticRequestModel, StatisticResponseModel } from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Statistics<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags statistics-controller
   * @name GetStatistics
   * @request POST:/api/statistics
   */
  getStatistics = (
    query: {
      /** api key */
      "api-key": any;
    },
    data: StatisticRequestModel,
    params: RequestParams = {},
  ) =>
    this.request<StatisticResponseModel, Record<string, string>>({
      path: `/api/statistics`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });
}
