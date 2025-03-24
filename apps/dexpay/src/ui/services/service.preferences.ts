import type { Preferences } from '../types';
import { $api } from './client';

export default abstract class PreferencesService {
  private static readonly PREFIX = 'invoices/prefs';

  /**
   * Get user preferences
   * @param params
   * @param params.projectId
   */
  static getMy(params: { projectId: number }) {
    return $api
      .get(`${params.projectId}/${PreferencesService.PREFIX}/my`)
      .json<Preferences.GetMy.Response>();
  }

  /**
   * Save user preferences
   * @param params
   * @param params.projectId
   * @param json
   */
  static save(params: { projectId: number }, json: Preferences.Save.Body) {
    return $api
      .patch(`${params.projectId}/${PreferencesService.PREFIX}/save`, { json })
      .json<Preferences.Save.Response>();
  }
}
