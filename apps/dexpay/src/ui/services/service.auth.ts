import { $api } from './client';
import type { Auth } from '../types';

// import { useStore } from '@/stores';

export default abstract class AuthService {
  private static readonly PREFIX = 'auth';

  static signIn(json: Auth.SignIn.Body) {
    return $api
      .post(`${AuthService.PREFIX}/sign-in`, { json })
      .json<Auth.SignIn.Response>();
  }

  static signUp(json: Auth.SignUp.Body) {
    return $api
      .post(`${AuthService.PREFIX}/sign-up`, { json })
      .json<Auth.SignUp.Response>();
  }

  /**
   * @param json
   */
  static async twoFaRequest(json: Auth.TwoFaRequest.Body) {
    return $api
      .post(`${AuthService.PREFIX}/2fa/request`, { json })
      .json<Auth.TwoFaRequest.Response>();
  }

  /**
   * Confirm 2FA code
   * @param params
   * @param json
   */
  static async twoFaCode(
    params: Auth.TwoFaCode.Params,
    json: Auth.TwoFaCode.Body,
  ) {
    return $api
      .post(
        params.isNewMode
          ? `${AuthService.PREFIX}/2fa/confirm`
          : `${AuthService.PREFIX}/code`,
        {
          json,
        },
      )
      .json<Auth.TwoFaCode.Response>();
  }

  static refresh(json: Auth.Refresh.Body) {
    return $api
      .post(`${AuthService.PREFIX}/refresh`, {
        json,
      })
      .json<Auth.Refresh.Response>();
  }

  static resetPasswordRequest(json: Auth.ResetPasswordRequest.Body) {
    return $api
      .post(`${AuthService.PREFIX}/reset-password-request`, { json })
      .json<Auth.ResetPasswordRequest.Response>();
  }

  static resetPasswordComplete(json: Auth.ResetPasswordComplete.Body) {
    return $api
      .post(`${AuthService.PREFIX}/reset-password-complete`, {
        json,
      })
      .json<Auth.ResetPasswordComplete.Response>();
  }
}
