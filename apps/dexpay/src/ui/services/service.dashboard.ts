import { type Dashboard } from '../types';
import { $api } from './client';

export default abstract class DashboardService {
  private static readonly PREFIX = 'dashboard';

  static getData(params: Dashboard.Params) {
    return $api
      .get(`projects/${params.projectId}/profile`)
      .json<Dashboard.Response>();
  }
}

// https://dev-api.cryptodao.com/wallet_dev/projects/1208/profile