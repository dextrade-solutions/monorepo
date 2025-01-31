import type { Trade } from '../types';
import { $api } from './client';

export default abstract class TradeService {
  private static readonly PREFIX = 'exchanges/orders';

   /**
   * Search trades
   *
   * @param query
   */
  static listSearch(query?: Trade.List.Query) {
      return $api
        .get(TradeService.PREFIX, { searchParams: query })
        .json<Trade.List.Response>();
  }

  /**
   * Get trades by project
   *
   * @param params
   * @param query
   */
  static listByProject(params: Trade.List.Params, query?: Trade.List.Query) {
      return $api
        .get(`exchanges/${params.projectId}/orders`, { searchParams: query })
        .json<Trade.List.Response>();
  }

  /**
   * Get trades for admin
   *
   * @param query
   */
  static listByAdmin(query?: Trade.List.Query) {
    return $api
      .get(`admin/${TradeService.PREFIX}`, { searchParams: query })
      .json<Trade.List.Response>();
  }

  // static list(params: Trade.List.Params, query?: Trade.List.Query) {
  //   return $api
  //     .get(`${params.projectId}/${TradeService.PREFIX}`, { searchParams: query })
  //     .json<Trade.List.Response>();
  // }
}
