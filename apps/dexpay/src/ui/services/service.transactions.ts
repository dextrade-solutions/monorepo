import type { Transaction } from '../types';
import { $api } from './client';

export default abstract class TransactionService {
  private static readonly PREFIX = 'transactions';

  static list(query?: Transaction.List.Query) {
    return $api
      .get(`${TransactionService.PREFIX}/all`, { searchParams: query })
      .json<Transaction.List.Response>();
  }

  /**
   * waiting withdrawals list
   * @param params
   * @param query
   */
  static withdrawalList(
    params: Transaction.Withdrawal.List.Params,
    query?: Transaction.Withdrawal.List.Query,
  ) {
    return $api
      .get(`${params.projectId}/${TransactionService.PREFIX}/provider/list`, {
        searchParams: query,
      })
      .json<Transaction.Withdrawal.List.Response>();
  }

  /**
   * Create withdrawal request
   * @param params
   * @param json
   */
  static withdrawalCreate(
    params: Transaction.Withdrawal.Create.Params,
    json: Transaction.Withdrawal.Create.Body,
  ) {
    return $api
      .post(
        `${params.projectId}/${TransactionService.PREFIX}/provider/request`,
        { json },
      )
      .json<Transaction.Withdrawal.Create.Response>();
  }

  /**
   * Confirm withdrawal request
   * @param params
   * @param json
   */
  static withdrawalConfirm(
    params: Transaction.Withdrawal.Confirm.Params,
    json: Transaction.Withdrawal.Confirm.Body,
  ) {
    return $api
      .put(
        `${params.projectId}/${TransactionService.PREFIX}/provider/confirm`,
        { json },
      )
      .json<Transaction.Withdrawal.Confirm.Response>();
  }
}
