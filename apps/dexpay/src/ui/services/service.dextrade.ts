import type { DexTrade } from '../types';
import { $api } from './client';

export default abstract class DexTradeService {
  private static readonly PREFIX = 'dextrade';

  static usersList(query: DexTrade.User.List.Query) {
    return $api
      .get(`admin/${DexTradeService.PREFIX}/users`, {
        searchParams: query,
      })
      .json<DexTrade.User.List.Response>();
  }

  /**
   *
   * @param params
   */
  static userGet(params: DexTrade.User.Get.Params) {
    return $api
      .get(`${params.projectId}/${DexTradeService.PREFIX}/users`)
      .json<DexTrade.User.Get.Response>();
  }

  /**
   *
   * @param params
   * @param json
   */
  static userCreate(
    params: DexTrade.User.Create.Params,
    json: DexTrade.User.Create.Body,
  ) {
    return $api
      .post(`${params.projectId}/${DexTradeService.PREFIX}/users`, { json })
      .json<DexTrade.User.Create.Response>();
  }

  /**
   *
   * @param params
   * @param json
   */
  static userUpdate(
    params: DexTrade.User.Update.Params,
    json: DexTrade.User.Update.Body,
  ) {
    return $api
      .put(`${params.projectId}/${DexTradeService.PREFIX}/users`, { json })
      .json<DexTrade.User.Update.Response>();
  }

  /**
   *
   * @param params
   * @param query
   */
  static advertsList(
    params: DexTrade.Advert.List.Params,
    query?: DexTrade.Advert.List.Query,
  ) {
    return $api
      .get(`${params.projectId}/${DexTradeService.PREFIX}/ads/list`, {
        searchParams: query,
      })
      .json<DexTrade.Advert.List.Response>();
  }

  /**
   *
   * @param params
   * @param json
   */
  static advertCreateFromPair(
    params: DexTrade.Advert.Create.Params,
    json: DexTrade.Advert.Create.Body,
  ) {
    return $api
      .post(`${params.projectId}/${DexTradeService.PREFIX}/ads/from-pair`, {
        json,
      })
      .json<DexTrade.Advert.Create.Response>();
  }

  /**
   *
   * @param params
   * @param json
   */
  static advertUpdate(
    params: DexTrade.Advert.Update.Params,
    json: DexTrade.Advert.Update.Body,
  ) {
    return $api
      .put(`${params.projectId}/${DexTradeService.PREFIX}/ads/ad`, { json })
      .json<DexTrade.Advert.Update.Response>();
  }

  /**
   *
   * @param params
   * @param json
   */
  static advertDelete(
    params: DexTrade.Advert.Delete.Params,
    json: DexTrade.Advert.Delete.Body,
  ) {
    return $api
      .delete(`${params.projectId}/${DexTradeService.PREFIX}/ads`, { json })
      .json<DexTrade.Advert.Delete.Response>();
  }
}
