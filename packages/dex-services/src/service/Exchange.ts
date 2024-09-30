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
  ClientSendCryptoRequestModel,
  CreatedExchangeModel,
  CreateRatingModel,
  ExchangeFilterModel,
  ExchangeModel,
  ExchangerResendCryptoRequestModel,
  ExchangerSendCryptoRequestModel,
  ExchangerSendFiatRequestModel,
  NewExchangeFiatModel,
  NewExchangeModel,
  ReserveExchangeModel,
  RetrieveSafeRequestModel,
  SaveResponseModel,
  UUIDRequestModel,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Exchange<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags exchange-controller
   * @name Rating
   * @request POST:/api/exchange/rating
   */
  rating = (
    query: {
      /** api key */
      "api-key": any;
    },
    data: CreateRatingModel,
    params: RequestParams = {},
  ) =>
    this.request<void, Record<string, string>>({
      path: `/api/exchange/rating`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags exchange-controller
   * @name GetExchangesFilter
   * @request POST:/api/exchange/filter
   */
  getExchangesFilter = (data: ExchangeFilterModel, params: RequestParams = {}) =>
    this.request<ExchangeModel[], Record<string, string>>({
      path: `/api/exchange/filter`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags exchange-controller
   * @name ExchangerVerifyReserve
   * @request POST:/api/exchange/exchanger/verify/reserve
   */
  exchangerVerifyReserve = (data: ReserveExchangeModel, params: RequestParams = {}) =>
    this.request<SaveResponseModel[], Record<string, string>>({
      path: `/api/exchange/exchanger/verify/reserve`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags exchange-controller
   * @name RetrieveExchangerSafe
   * @request POST:/api/exchange/exchanger/send/safe
   */
  retrieveExchangerSafe = (
    query: {
      /** api key */
      "api-key": any;
    },
    data: RetrieveSafeRequestModel,
    params: RequestParams = {},
  ) =>
    this.request<void, Record<string, string>>({
      path: `/api/exchange/exchanger/send/safe`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags exchange-controller
   * @name ExchangerSendFiat
   * @request POST:/api/exchange/exchanger/send/fiat
   */
  exchangerSendFiat = (
    query: {
      /** api key */
      "api-key": any;
    },
    data: ExchangerSendFiatRequestModel,
    params: RequestParams = {},
  ) =>
    this.request<void, Record<string, string>>({
      path: `/api/exchange/exchanger/send/fiat`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags exchange-controller
   * @name ExchangerSendCrypto
   * @request POST:/api/exchange/exchanger/send/crypto
   */
  exchangerSendCrypto = (
    query: {
      /** api key */
      "api-key": any;
    },
    data: ExchangerSendCryptoRequestModel,
    params: RequestParams = {},
  ) =>
    this.request<void, Record<string, string>>({
      path: `/api/exchange/exchanger/send/crypto`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags exchange-controller
   * @name ExchangerResendCrypto
   * @request POST:/api/exchange/exchanger/resend/crypto
   */
  exchangerResendCrypto = (
    query: {
      /** api key */
      "api-key": any;
    },
    data: ExchangerResendCryptoRequestModel,
    params: RequestParams = {},
  ) =>
    this.request<void, Record<string, string>>({
      path: `/api/exchange/exchanger/resend/crypto`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags exchange-controller
   * @name ExchangerCancelTransaction
   * @request POST:/api/exchange/exchanger/cancel/transaction
   */
  exchangerCancelTransaction = (
    query: {
      /** api key */
      "api-key": any;
    },
    data: UUIDRequestModel,
    params: RequestParams = {},
  ) =>
    this.request<void, Record<string, string>>({
      path: `/api/exchange/exchanger/cancel/transaction`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags exchange-controller
   * @name Dispute
   * @request POST:/api/exchange/dispute
   */
  dispute = (
    query: {
      /** api key */
      "api-key": any;
    },
    data: UUIDRequestModel,
    params: RequestParams = {},
  ) =>
    this.request<void, Record<string, string>>({
      path: `/api/exchange/dispute`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags exchange-controller
   * @name CreateFiatCrypto
   * @request POST:/api/exchange/create/fiat/crypto
   */
  createFiatCrypto = (
    query: {
      /** api key */
      "api-key": any;
    },
    data: NewExchangeModel,
    params: RequestParams = {},
  ) =>
    this.request<CreatedExchangeModel, Record<string, string>>({
      path: `/api/exchange/create/fiat/crypto`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags exchange-controller
   * @name CreateCryptoFiat
   * @request POST:/api/exchange/create/crypto/fiat
   */
  createCryptoFiat = (
    query: {
      /** api key */
      "api-key": any;
    },
    data: NewExchangeFiatModel,
    params: RequestParams = {},
  ) =>
    this.request<CreatedExchangeModel, Record<string, string>>({
      path: `/api/exchange/create/crypto/fiat`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags exchange-controller
   * @name CreateCryptoCrypto
   * @request POST:/api/exchange/create/crypto/crypto
   */
  createCryptoCrypto = (
    query: {
      /** api key */
      "api-key": any;
    },
    data: NewExchangeModel,
    params: RequestParams = {},
  ) =>
    this.request<CreatedExchangeModel, Record<string, string>>({
      path: `/api/exchange/create/crypto/crypto`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags exchange-controller
   * @name RetrieveClientSafe
   * @request POST:/api/exchange/client/send/safe
   */
  retrieveClientSafe = (
    query: {
      /** api key */
      "api-key": any;
    },
    data: RetrieveSafeRequestModel,
    params: RequestParams = {},
  ) =>
    this.request<void, Record<string, string>>({
      path: `/api/exchange/client/send/safe`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags exchange-controller
   * @name ConfirmClientTransaction
   * @request POST:/api/exchange/client/send/fiat
   */
  confirmClientTransaction = (
    query: {
      /** api key */
      "api-key": any;
    },
    data: UUIDRequestModel,
    params: RequestParams = {},
  ) =>
    this.request<void, Record<string, string>>({
      path: `/api/exchange/client/send/fiat`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags exchange-controller
   * @name ClientSendCrypto
   * @request POST:/api/exchange/client/send/crypto
   */
  clientSendCrypto = (
    query: {
      /** api key */
      "api-key": any;
    },
    data: ClientSendCryptoRequestModel,
    params: RequestParams = {},
  ) =>
    this.request<void, Record<string, string>>({
      path: `/api/exchange/client/send/crypto`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags exchange-controller
   * @name ClientConfirmCrypto
   * @request POST:/api/exchange/client/confirm/fiat
   */
  clientConfirmCrypto = (
    query: {
      /** api key */
      "api-key": any;
    },
    data: UUIDRequestModel,
    params: RequestParams = {},
  ) =>
    this.request<void, Record<string, string>>({
      path: `/api/exchange/client/confirm/fiat`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags exchange-controller
   * @name ClientCancelTransaction
   * @request POST:/api/exchange/client/cancel/transaction
   */
  clientCancelTransaction = (
    query: {
      /** api key */
      "api-key": any;
    },
    data: UUIDRequestModel,
    params: RequestParams = {},
  ) =>
    this.request<void, Record<string, string>>({
      path: `/api/exchange/client/cancel/transaction`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags exchange-controller
   * @name Appeal
   * @request POST:/api/exchange/appeal
   */
  appeal = (
    query: {
      /** api key */
      "api-key": any;
    },
    data: UUIDRequestModel,
    params: RequestParams = {},
  ) =>
    this.request<void, Record<string, string>>({
      path: `/api/exchange/appeal`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags exchange-controller
   * @name GetExchangeById
   * @request GET:/api/exchange/byId
   */
  getExchangeById = (
    query: {
      /** @format uuid */
      id: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<ExchangeModel, Record<string, string>>({
      path: `/api/exchange/byId`,
      method: "GET",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags exchange-controller
   * @name GetExchangesActiveCount
   * @request GET:/api/exchange/active/count
   */
  getExchangesActiveCount = (
    query: {
      /** api key */
      "api-key": any;
    },
    params: RequestParams = {},
  ) =>
    this.request<number, Record<string, string>>({
      path: `/api/exchange/active/count`,
      method: "GET",
      query: query,
      ...params,
    });
}
