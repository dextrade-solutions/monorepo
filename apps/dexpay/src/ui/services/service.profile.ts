import type { Profile } from '../types';
import { $api } from './client';

export default abstract class ProfileService {
  private static readonly PREFIX = 'profile';

  /**
   *
   * @param params
   */
  static getProfile(params: Profile.Get.Params) {
    return $api
      .get(`projects/${params.projectId}/${ProfileService.PREFIX}`)
      .json<Profile.Get.Response>();
  }

  /**
   * Upload profile logo
   *
   * @param params
   * @param formData
   */
  static uploadAvatar(params: Profile.UploadAvatar.Params, formData: FormData) {
    return $api
      .post(`projects/${params.projectId}/${ProfileService.PREFIX}/upload-profile-pic`, {
        body: formData,  // заменяем `json` на `body` для отправки FormData
      })
      .json<Profile.UploadAvatar.Response>();
  }
}
