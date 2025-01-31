import type { Address } from '../types';
import { $api } from './client';

export default abstract class AddressService {
  private static readonly PREFIX = 'address';

  static generate(
    params: Address.Generate.Params,
    json: Address.Generate.Body,
  ) {
    return $api
      .post(
        `${params.projectId}/vault-user/${params.vaultId}/${AddressService.PREFIX}/generate`,
        {
          json,
        },
      )
      .json<Address.Generate.Response>();
  }

  static list(params: Address.List.Params, query: Address.List.Query) {
    return $api
      .get(
        `${params.projectId}/vault-user/${params.vaultId}/${AddressService.PREFIX}/my`,
        {
          searchParams: query,
        },
      )
      .json<Address.List.Response>();
  }

  /**
   * @param params
   * @param query
   */
  static listByCurrency(
    params: Address.ListByCurrency.Params,
    query: Address.ListByCurrency.Query,
  ) {
    return $api
      .get(`${params.projectId}/${AddressService.PREFIX}/my`, {
        searchParams: query,
      })
      .json<Address.ListByCurrency.Response>();
  }
}
