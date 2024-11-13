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

import { AmlAddressRequestModel, AmlExchangeRequestModel, AmlTransactionRequestModel } from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Aml<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags aml-controller
   * @name CheckTransaction
   * @request POST:/api/aml/transaction
   */
  checkTransaction = (
    data: AmlTransactionRequestModel,
    params: RequestParams = {},
  ) =>
    this.request<string, Record<string, string>>({
      path: `/api/aml/transaction`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags aml-controller
   * @name CheckExchange
   * @request POST:/api/aml/exchange
   */
  checkExchange = (
    data: AmlExchangeRequestModel,
    params: RequestParams = {},
  ) =>
    this.request<string, Record<string, string>>({
      path: `/api/aml/exchange`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags aml-controller
   * @name CheckAddress
   * @request POST:/api/aml/address
   */
  checkAddress = (
    data: AmlAddressRequestModel,
    params: RequestParams = {},
  ) =>
    this.request<string, Record<string, string>>({
      path: `/api/aml/address`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
}
