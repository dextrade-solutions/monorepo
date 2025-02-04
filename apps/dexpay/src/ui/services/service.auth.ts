import { $api, $base } from './client';
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
          hooks: {
            afterResponse: [
              async (request, options, response) => {
                if (response.ok) {
                  await response.json().then((json) => {
                    const responseData = json as Auth.TwoFaCode.Response;

                    const store = useStore();

                    store.tokens.access = responseData.access_token;
                    store.tokens.refresh = responseData.refresh_token;
                  });
                }
              },
            ],
          },
        },
      )
      .then(() => null);
  }

  static refresh(json: Auth.Refresh.Body) {
    return $base
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
    return $api.post(`${AuthService.PREFIX}/reset-password-complete`, {
      json,
      hooks: {
        afterResponse: [
          async (request, options, response) => {
            const store = useStore();
            if (response.ok) {
              await response.json().then((json) => {
                const responseData =
                  json as Auth.ResetPasswordComplete.Response;
                store.tokens.access = responseData.access_token;
                store.tokens.refresh = responseData.refresh_token;
              });
            }
          },
        ],
      },
    });
  }

  static logout() {
    const store = useStore();
    store.tokens.access = null;
    store.tokens.refresh = null;
  }
}
