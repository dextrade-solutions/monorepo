import { $invoiceApi } from './client';
import { Invoice } from '../types/invoices';

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
   * @param query
   * @param json
   */
  static paymentAddress(json: Invoice.View.Query) {
    return $invoiceApi
      .post(`${InvoicesService.PREFIX}/payment/address`, { json })
      .json<Invoice.View.Response>();
  }

  /**
   *
   * @param query
   */
  static currencies() {
    return $invoiceApi.post(`currencies`).json<Invoice.Currencies.Response>();
  }
}
