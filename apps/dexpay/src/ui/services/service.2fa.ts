import type { TwoFA } from '../types';
import { $api } from './client';

export default abstract class TwoFAService {
  private static readonly PREFIX = 'validation-code';

  static checkStatus() {
    return $api
      .get(`${TwoFAService.PREFIX}/status`)
      .json<TwoFA.Status.Response>();
  }

  /**
   * Init reset or set new Google Auth
   */
  static init() {
    return $api
      .post(`${TwoFAService.PREFIX}/google-auth/reset/request`)
      .json<TwoFA.Init.Response>();
  }

  /**
   * Code confirm
   * @param json
   */
  static codeConfirm(json: TwoFA.CodeConfirm.Body) {
    return $api
      .post(`${TwoFAService.PREFIX}/google-auth/reset/confirm`, { json })
      .json<TwoFA.CodeConfirm.Response>();
  }

  /**
   * Do google 2fa enable
   * @param json
   */
  static enable2FA(json: TwoFA.Enable2FA.Body) {
    return $api
      .post(`${TwoFAService.PREFIX}/google-auth/enable`, { json })
      .json<TwoFA.Enable2FA.Response>();
  }
}
