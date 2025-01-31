import type { Users } from '../types';
import { $api } from './client';

export default abstract class UserService {
  private static readonly PREFIX = 'users';

  static list(query: Users.List.Query) {
    return $api
      .get(`${UserService.PREFIX}/search`, {
        searchParams: query,
      })
      .json<Users.List.Response>();
  }

  static view() {
    return $api.get(`${UserService.PREFIX}/me`).json<Users.View.Response>();
  }
}
