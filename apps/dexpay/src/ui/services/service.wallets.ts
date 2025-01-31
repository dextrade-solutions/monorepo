import type { Balance } from '../types';
import { $api } from './client';

export default abstract class WalletService {
  private static readonly PREFIX = 'balances';

  /**
   *
   * @param params
   * @param query
   */
  static list(params: Balance.List.Params, query: Balance.List.Query) {
    return $api
      .get(`statistic/${params.projectId}/${WalletService.PREFIX}`, {
        searchParams: query
      })
      .json<Balance.List.Response>();
  }
}
