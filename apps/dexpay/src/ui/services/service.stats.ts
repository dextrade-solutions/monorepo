import { Statistic } from '../types';
import { $api } from './client';

export default abstract class StatsService {
  private static readonly PREFIX = 'statistic';

  static invoices(params: Statistic.Invoices.Params) {
    return $api
      .get(`${StatsService.PREFIX}/${params.projectId}/invoices`)
      .json<Statistic.Invoices.Response>();
  }
}
