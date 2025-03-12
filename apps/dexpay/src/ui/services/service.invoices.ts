import { Invoice } from '../types';
import { $api, $invoiceApi } from './client';

export default abstract class InvoicesService {
  private static readonly PREFIX = 'invoices';

  /**
   *
   * @param query
   */
  static paymentGet(query?: Invoice.View.Query) {
    return $invoiceApi
      .get(`${InvoicesService.PREFIX}/payment/get`, {
        searchParams: query,
      })
      .json<Invoice.View.Response>();
  }

  /**
   *
   * @param params
   * @param query
   */
  static list(params: Invoice.List.Params, query?: Invoice.List.Query) {
    return $api
      .get(`${params.projectId}/${InvoicesService.PREFIX}`, {
        searchParams: query,
      })
      .json<Invoice.List.Response>();
  }

  /**
   *
   * @param params
   * @param json
   */
  static create(params: Invoice.Create.Params, json: Invoice.Create.Body) {
    return $api
      .post(`${params.projectId}/${InvoicesService.PREFIX}`, { json })
      .json<Invoice.Create.Response>();
  }

  /**
   *
   * @param params
   * @param json
   */
  static update(params: Invoice.Update.Params, json: Invoice.Update.Body) {
    return $api
      .patch(`${params.projectId}/${InvoicesService.PREFIX}/${params.id}`, {
        json,
      })
      .json<Invoice.Update.Response>();
  }

  /**
   *
   * @param params
   */
  static delete(params: Invoice.Delete.Params) {
    return $api
      .delete(`${params.projectId}/${InvoicesService.PREFIX}/${params.id}`)
      .json<Invoice.Delete.Response>();
  }

  static currencies() {
    return $api.post(`currencies`).json<Invoice.Currencies.Response>();
  }

  static getPreference(params: Invoice.Preference.Params) {
    return $api
      .get(`${params.projectId}/${InvoicesService.PREFIX}/prefs/my`)
      .json<Invoice.Preference.Response>();
  }

  static savePreference(
    params: Invoice.Preference.Params,
    json: Invoice.Preference.SaveBody,
  ) {
    return $api
      .patch(`${params.projectId}/${InvoicesService.PREFIX}/prefs/save`, {
        json,
      })
      .json<Invoice.Preference.Response>();
  }

  static getRate(params: Invoice.Rate.Params) {
    return $api
      .get(`rates?currencies=${params.pair}`)
      .json<Invoice.Rate.Response>();
  }
}
