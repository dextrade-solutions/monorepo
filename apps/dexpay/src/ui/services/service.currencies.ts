import { $api } from './client';
import type { Currency } from '../types';

export default abstract class CurrencyService {
  private static readonly PREFIX = 'currencies';

  static index(query: Currency.Tokens.Query) {
    return $api
      .get(`${CurrencyService.PREFIX}`, { searchParams: query })
      .json<Currency.Tokens.Response>();
  }

  static coins(query: Currency.Coins.Query) {
    return $api
      .get(`${CurrencyService.PREFIX}/coins`, { searchParams: query })
      .json<Currency.Coins.Response>();
  }

  static listWithBalances(
    params: Currency.ListWithBalances.Params,
    query: Currency.ListWithBalances.Query,
  ) {
    return $api
      .get(`${params.projectId}/address/currencies-with-balance`, {
        searchParams: query,
      })
      .json<Currency.ListWithBalances.Response>();
  }
}
