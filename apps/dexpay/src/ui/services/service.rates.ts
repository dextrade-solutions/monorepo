import { Rate } from '../types';
import { $api } from './client';

export default abstract class RatesService {
  private static readonly PREFIX = 'rates';

  static getRate(params: Rate.Params) {
    return $api
      .get(`${RatesService.PREFIX}/?currencies=${params.pair}`)
      .json<Rate.Response>();
  }
}
