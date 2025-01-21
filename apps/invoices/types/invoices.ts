/* eslint-disable @typescript-eslint/no-namespace */

import { IInvoice } from './entities';

export namespace Invoice {
  export namespace List {
    export interface Params {
      projectId: number;
    }

    export interface Query extends Record<string, any> {
      page?: number;
      sort?: string;
      iso?: string;
      currency_id?: number;
    }

    export interface Response {
      currentPageResult: IInvoice[];
      totalPages: number;
      page: number;
    }
  }

  export namespace Create {
    export interface Params {
      projectId: number;
    }

    export interface Body {
      description: string;
      amount_requested: string;
      currency_id: number;
      due_to: string;
    }

    export type Response = IInvoice;
  }

  export namespace View {
    export interface Query extends Record<string, any> {
      id: string;
    }

    export interface Response {
      id: string;
      address: string;
      amount_requested: string;
      amount_requested_f: string;
      amount_received_total: string;
      amount_received_total_f: string;
      converted_amount_received_total_f: string;
      converted_amount_requested: string;
      converted_amount_requested_f: string;
      discounts_f: string | null;
      converted_discounts_f: string | null;
      tax_f: string | null;
      converted_tax_f: string | null;
      status: number;
      coin: { iso: string } | null;
      coin_id: number | null;
      converted_coin: { iso: string } | null;
      converted_coin_id: number | null;
      currency_id: number;
      currency: {
        iso_with_network: string;
        type: number;
        iso: string;
        native_currency_iso: string;
        token_type: string | null;
        network_name: string;
        symbol: string;
      };
      description: string;
      invoice_number: string;
      due_to: string | null;
      discounts: string | null;
      tax: string | null;
      payment_page_url: string;
      logo_url: string | null;
    }
  }

  export namespace Update {
    export interface Params {
      projectId: number;
      id: number;
    }

    export interface Body {
      description: string;
      amount_requested: string;
      currency_id: number;
      due_to: string;
    }

    export interface Response {
      currentPageResult: IInvoice[];
      totalPages: number;
      page: number;
    }
  }

  export namespace Delete {
    export interface Params {
      projectId: number;
      id: number;
    }

    export interface Response {
      data: {
        status: boolean;
      };
    }
  }

  export namespace Currencies {
    export interface Response {
      status: boolean;
      data: Array<{
        id: number;
        iso: string;
        symbol: string;
        type: number;
        contract_address: string | null;
        native_currency_iso: string;
        token_type: string | null;
        network_name: string;
        coin_id: number;
      }>;
    }
  }

  // export namespace Address {
  //   export interface Query extends Record<string, any> {
  //     id: string;
  //   }

  //   export interface Response {
  //     id: string;
  //     address: string;
  //     amount_requested: string;
  //     amount_received_total: string;
  //     amount_requested_f: string;
  //     amount_received_total_f: string;
  //     discounts_f: string | null;
  //     tax_f: string | null;
  //     status: number;
  //     currency_id: number;
  //     currency: {
  //       iso_with_network: string;
  //       type: number;
  //       iso: string;
  //       native_currency_iso: string;
  //       token_type: string | null;
  //       network_name: string;
  //     };
  //     description: string;
  //     invoice_number: string;
  //     due_to: string | null;
  //     discounts: string | null;
  //     tax: string | null;
  //     payment_page_url: string;
  //   }
  // }
}
