import type { Pair } from '../types';
import { $api } from './client';

export default abstract class PairsService {
  private static readonly PREFIX = 'exchanges/pair';

  /**
   *
   * @param params
   * @param query
   */
  static list(params: Pair.List.Params, query: Pair.List.Query) {
    return $api
      .get(`${PairsService.PREFIX}/project/${params.projectId}`, {
        searchParams: query
      })
      .json<Pair.List.Response>();
  }

  /**
   *
   * @param params
   * @param json
   */
  static create(params: Pair.Create.Params, json: Pair.Create.Body) {
    return $api
      .post(`${PairsService.PREFIX}/project/${params.projectId}`, { json })
      .json<Pair.Create.Response>();
  }

  /**
   *
   * @param params
   * @param json
   */
  static update(params: Pair.Update.Params, json: Pair.Update.Body) {
    return $api
      .patch(`${PairsService.PREFIX}/project/${params.projectId}/${params.id}`, { json })
      .json<Pair.Update.Response>();
  }

  /**
   *
   * @param params
   */
  static delete(params: Pair.Delete.Params) {
    return $api
      .delete(`${PairsService.PREFIX}/project/${params.projectId}/${params.id}`)
      .json<Pair.Delete.Response>();
  }

  /**
   * @param query
   */
  static priceSources(query: Pair.PriceSources.Query) {
    return $api
      .get(`${PairsService.PREFIX}/price-sources-settings`, {
        searchParams: query
      })
      .json<Pair.PriceSources.Response>();
  }

  /**
   * @param query
   */
  static priceSourcesForPair(query: Pair.PriceSourcesForPair.Query) {
    return $api
      .get(`${PairsService.PREFIX}/price-sources-settings/for-pair`, {
        searchParams: query
      })
      .json<Pair.PriceSourcesForPair.Response>();
  }
}
