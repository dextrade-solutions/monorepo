import type { Vault } from '../types';
import { $api } from './client';

export default abstract class VaultService {
  private static readonly PREFIX = 'vault-user';

  static my(params: Vault.My.Params, query: Vault.My.Query) {
    return $api
      .get(`${params.projectId}/${VaultService.PREFIX}/my`, {
        searchParams: query,
      })
      .json<Vault.My.Response>();
  }

  static delete(params: Vault.Delete.Params) {
    return $api
      .delete(`${params.projectId}/${VaultService.PREFIX}/${params.id}`)
      .json<Vault.Delete.Response>();
  }

  static create(params: Vault.Create.Params, json: Vault.Create.Body) {
    return $api
      .post(`${params.projectId}/${VaultService.PREFIX}`, { json })
      .json<Vault.Create.Response>();
  }
}
