import type { ApiTokens } from '../types';
import { $api } from './client';

export default abstract class ApiTokensService {
  private static readonly PREFIX = 'api-keys';

  // @danhutsuliak 

  // СПИСОК АПИ КЛЮЧЕЙ ДЕКСПЕЯ
  // GET
  // /v1/api-keys?page=0
  // &label=Te
  // {
  //     "currentPageResult": [
  //         {
  //             "id": 46,
  //             "label": "Test",
  //             "createdAt": "2024-09-24T13:00:20.000Z"
  //         }
  //     ],
  //     "totalPages": 1,
  //     "page": 0
  // }

  // DELETE
  // /v1/api-keys/request
  // {id: 46}

  // DELETE
  // /v1/api-keys/confirm
  // {id: 46, code_token:, code}

  static list(query: ApiTokens.List.Query) {
    return $api
      .get(`${ApiTokensService.PREFIX}`, { searchParams: query })
      .json<ApiTokens.List.Response>();
  }

  static createRequest(json: ApiTokens.CreateRequest.Body) {
    return $api
      .post(`${ApiTokensService.PREFIX}/request`, { json })
      .json<ApiTokens.CreateRequest.Response>();
  }

  static createConfirm(json: ApiTokens.CreateConfirm.Body) {
    return $api
      .post(`${ApiTokensService.PREFIX}/confirm`, { json })
      .json<ApiTokens.CreateConfirm.Response>();
  }

  static deleteRequest(json: ApiTokens.DeleteRequest.Body) {
    return $api
      .delete(`${ApiTokensService.PREFIX}/request`, { json })
      .json<ApiTokens.DeleteRequest.Response>();
  }

  static deleteConfirm(json: ApiTokens.DeleteConfirm.Body) {
    return $api
      .delete(`${ApiTokensService.PREFIX}/confirm`, { json })
      .json<ApiTokens.DeleteConfirm.Response>();
  }
}
