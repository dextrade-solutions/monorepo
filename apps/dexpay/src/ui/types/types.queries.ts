/* eslint-disable @typescript-eslint/no-namespace */
import type {
  IProject,
  IVault,
  IAddress,
  ICurrency,
  INetwork,
  ITransaction,
  IMemo,
  ICallback,
  IApiToken,
  IInvoice,
  IPair,
  ICoin,
  IPriceSource,
  IPriceSourcePair,
  IAdvert,
  ITrade,
  IUser,
  IBalance,
  IDextradeUser,
  IStatistic,
  ITransactionWithdrawal,
  IInvoiceFull,
  IAddressTransferFrom,
} from './types.entities';

export namespace Auth {
  export namespace SignUp {
    export interface Body {
      email: string;
      password: string;
      first_name: string;
      last_name: string;
    }

    export interface Response {
      twofa: {
        token: string;
      };
    }
  }

  export namespace TwoFaRequest {
    export interface Body {
      auth_token: string;
      method: number;
    }

    export interface Response {
      twofa: {
        code_token: string;
      };
    }
  }

  export namespace TwoFaCode {
    export interface Params {
      isNewMode: boolean;
    }

    export interface Body {
      code_token: string;
      code: string;
      method?: number;
    }

    export interface Response {
      access_token: string;
      refresh_token: string;
    }
  }

  export namespace SignIn {
    export interface Body {
      email: string;
      password: string;
      old_2fa: boolean;
    }

    export interface Response {
      tokens?: {
        access_token: string;
        refresh_token: string;
      };
      twofa: {
        token?: string;
        supported?: {
          google_auth: boolean;
          email: boolean;
        };
        required?: number;
      };
    }
  }

  export namespace Refresh {
    export interface Response {
      access_token: string;
      refresh_token: string;
    }

    export interface Body {
      token: string;
    }
  }

  export namespace ResetPasswordRequest {
    export interface Body {
      email: string;
      new_password: string;
    }

    export interface Response {
      code_token: string;
    }
  }

  export namespace ResetPasswordComplete {
    export interface Body {
      code_token: string;
      new_password: string;
      code: string;
    }

    export interface Response {
      access_token: string;
      refresh_token: string;
    }
  }
}

export namespace ApiTokens {
  export namespace CreateRequest {
    export interface Body {
      api_token_name: string;
    }

    export interface Response {
      code_token: string;
    }
  }

  export namespace CreateConfirm {
    export interface Body {
      code_token: string;
      api_token_name: string;
      code: string;
    }
    export interface Response {
      credentials: {
        token: string;
        secret: string;
      };
    }
  }

  export namespace DeleteRequest {
    export interface Body {
      id: number;
    }

    export interface Response {
      code_token: string;
    }
  }

  export namespace DeleteConfirm {
    export interface Body {
      id: number;
      code_token: string;
      code: string;
    }
    export interface Response {}
  }

  export namespace List {
    export interface Query extends Record<string, any> {
      page?: number;
    }

    export interface Response {
      currentPageResult: IApiToken[];
      totalPages: number;
      page: number;
    }
  }
}

export namespace Project {
  export namespace My {
    export interface Query extends Record<string, any> {
      page: number;
    }

    export interface Response {
      list: {
        currentPageResult: IProject[];
        totalPages: number;
        page: number;
      };
    }
  }

  export namespace Delete {
    export interface Params {
      id: number;
    }

    export interface Response {
      data: {
        status: boolean;
      };
    }
  }

  export namespace Update {
    export interface Params {
      id: number;
    }

    export interface Body {
      name: string;
      username: string;
      drain_is_enabled?: boolean;
    }

    export interface Response {
      data: IProject;
    }
  }

  export namespace Create {
    export interface Body {
      name: string;
    }

    export interface Response {
      data: IProject;
    }
  }

  export namespace Init {
    export interface Params {
      id: number;
    }

    export interface Body {
      mnemonic_encrypted_id: number;
    }

    export interface Response {
      status: string;
    }
  }

  export namespace InviteUser {
    export interface Params {
      projectId: number;
    }

    export interface Body {
      email: string;
    }

    export interface Response {
      status: boolean;
    }
  }

  export namespace UsersWithAccess {
    export interface Params {
      projectId: number;
    }

    export interface Response {
      currentPageResult: Array<{
        id: number;
        user_id: number;
        user: { email: string };
      }>;
      totalPages: number;
      totalCount: number;
      page: number;
    }
  }

  export namespace RevokeAccess {
    export interface Params {
      projectId: number;
      userId: number;
    }

    export interface Response {
      status: boolean;
    }
  }
}

export namespace Vault {
  export namespace Create {
    export interface Params {
      projectId: number;
    }

    export interface Response {
      data: {
        id: number;
        name: string;
        project_id: number;
      };
    }

    export interface Body {
      user_external_id?: string;
      name: string;
      mnemonic_encrypted_id?: number;
    }
  }

  export namespace Delete {
    export interface Params {
      projectId: number;
      id: number;
    }

    export interface Response {
      data: boolean;
    }
  }

  export namespace My {
    export interface Params {
      projectId: number;
    }

    export interface Response {
      list: {
        currentPageResult: IVault[];
        totalPages: number;
        page: number;
      };
    }

    export interface Query extends Record<string, any> {
      page: number;
    }
  }
}

export namespace Address {
  export namespace Generate {
    export type Response = IAddress & {
      currency: ICurrency & { network: INetwork };
      transfer_from: IAddressTransferFrom;
    };

    export interface Body {
      // network: string;
      currency_id: number;
    }

    export interface Params {
      projectId: number;
      vaultId: number;
    }
  }

  export namespace List {
    export interface Params {
      projectId: number;
      vaultId: number;
    }

    export interface Response {
      currentPageResult: Array<
        IAddress & {
          vault: IVault & { project: IProject };
          currency: ICurrency & { network: INetwork };
        }
      >;
      totalPages: number;
      page: number;
    }

    export interface Query extends Record<string, any> {
      page: number;
    }
  }

  export namespace ListByCurrency {
    export interface Params {
      projectId: number;
    }

    export interface Response {
      currentPageResult: IAddress[];
      totalPages: number;
      page: number;
    }

    export interface Query extends Record<string, any> {
      currency_id?: number;
      page: number;
    }
  }
}

export namespace Currency {
  export namespace Tokens {
    export interface Response {
      list: {
        currentPageResult: Array<
          ICurrency & { network: INetwork; isActive: boolean }
        >;
        totalPages: number;
        page: number;
      };
    }

    export interface Query extends Record<string, any> {
      page?: number;
      sort?: string;
      iso?: string;
      public_name?: string;
      coin_id?: number;
      token_type?: string;
      contract_address?: string;
    }
  }

  export namespace Coins {
    export interface Response {
      list: {
        currentPageResult: Array<ICoin>;
        totalPages: number;
        page: number;
      };
    }

    export interface Query extends Record<string, any> {
      page?: number;
      sort?: string;
      iso?: string;
      public_name?: string;
      type?: string;
      token_type?: string;
      contract_address?: string;
    }
  }

  export namespace ListWithBalances {
    export interface Params {
      projectId: number;
    }

    export interface Response {
      currentPageResult: Array<
        ICurrency & { network: INetwork; isActive: boolean }
      >;
      totalPages: number;
      page: number;
    }

    export interface Query extends Record<string, any> {
      page?: number;
      sort?: string;
      public_name?: string;
      coin_id?: number;
    }
  }
}

export namespace Transaction {
  export namespace List {
    export interface Response {
      list: {
        currentPageResult: Array<
          ITransaction & {
            project: IProject;
            vault: IVault;
            currency: ICurrency & { network: INetwork };
            address: string | null;
          }
        >;
        totalPages: number;
        page: number;
      };
    }

    export interface Query extends Record<string, any> {
      vault_id?: number;
      'project.name'?: string;
      'currency.iso'?: string;
      type?: number;
      'vault.name'?: string;
      txid?: string;
      to_address?: number;
      page?: number;
      currency_id?: number;
      status?: number;
    }
  }

  export namespace Withdrawal {
    export namespace List {
      export interface Params {
        projectId: number;
      }

      export interface Query extends Record<string, any> {
        page: number;
        not_completed_only?: boolean;
        status?: number;
      }

      export interface Response {
        currentPageResult: ITransactionWithdrawal[];
        totalPages: number;
        page: number;
      }
    }

    export namespace Create {
      export interface Params {
        projectId: number;
      }

      export interface Body {
        address_from_id: number;
        address_to_id?: number;
        address_to?: string;
        amount: string;
      }

      export interface Response {
        status: boolean;
        result: boolean;
        id: number;
        twoFa: {
          code_token: string;
        };
      }
    }

    export namespace Confirm {
      export interface Params {
        projectId: number;
      }

      export interface Body {
        id: number;
        code_token: string;
        code: string;
      }

      export interface Response {}
    }
  }

  export namespace TransferFrom {
    export interface Params {
      projectId: number;
    }

    export interface Body {
      address_id: number;
    }

    export interface Response {
      success: boolean; // Adjust based on actual API response
    }
  }
}

export namespace Memo {
  export namespace BeginImport {
    export interface Response {
      code_token: string;
      id: number;
      algo: string;
      public_key: string;
    }

    export interface Body {
      name: string;
    }
  }

  export namespace CompleteImport {
    export interface Body {
      id: number;
      encrypted: string;
      code_token: string;
      code: string;
    }

    export interface Response extends IMemo {}
  }

  export namespace My {
    export interface Query extends Record<string, any> {
      page?: number;
      name?: string;
      is_imported?: number;
    }

    export interface Response {
      list: {
        currentPageResult: IMemo[];
        totalPages: number;
        page: number;
      };
    }
  }

  export namespace ExternalConnection {
    export interface Body {
      name: string;
    }

    export interface Response {
      id: number;

      code_token?: string;

      qr_code?: string;
      expiryAt?: string;
      deep_link?: string;
    }

    export interface CompleteBody {
      id: number;
      code_token: string;
      code: string;
    }

    export interface CompleteResponse {
      qr_code: string;
      expiryAt: string;
      id: string;
      deep_link: string;
    }

    export interface Status {
      public_id: string;
      eth_address: string | null;
      is_expired: boolean;
      can_be_confirmed: boolean;
      is_done: boolean;
      expiryAt: string;
      createdAt: string;
      updatedAt: string;
      deletedAt: string | null;
    }
  }
}

export namespace Callback {
  export namespace Create {
    export interface Params {
      projectId: number;
    }

    export interface Body {
      name: string;
      url: string;
    }

    export interface Response {
      data: {
        hash: string;
        id: number;
        name: string;
        url: string;
        public_key: string;
        private_key: string;
        creator_id: number;
        project_id: number;
      };
    }
  }

  export namespace Delete {
    export interface Params {
      id: number;
      projectId: number;
    }

    export interface Response {
      data: boolean;
    }
  }

  export namespace List {
    export interface Params {
      projectId: number;
    }

    export interface Response {
      list: {
        currentPageResult: ICallback[];
        totalPages: number;
        page: number;
      };
    }

    export interface Query extends Record<string, any> {
      page?: number;
      name?: string;
    }
  }
}

export namespace Statistic {
  export namespace Invoices {
    export interface Params {
      projectId: number;
    }

    export interface Response {
      received: {
        by_currency: Record<ICurrency['id'], IStatistic>;
        total_usdt: string;
      };
    }
  }
}

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
      converted_amount_requested: string;
      converted_coin_id: number;
      amount_requested: string;
      currency_id?: number;
      supported_currencies?: number[];
      coin_id?: number;
      description?: string;
      due_to: string;
    }

    export type Response = IInvoice;
  }

  export namespace View {
    export interface Query extends Record<string, any> {
      id: string;
    }

    export type Response = IInvoiceFull;
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

  export namespace Preference {
    export interface Params {
      projectId: number;
    }

    export interface Response {
      id: number;
      converted_coin_id: number;
    }

    export interface SaveBody {
      converted_coin_id: number;
    }
  }

  export namespace Rate {
    export interface Params {
      pair: string;
    }

    export interface Response {
      [key: string]: {
        symbol: string;
        rateFloat: number;
        updateTime: number;
        serviceName: string;
      };
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

export namespace Pair {
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
      currentPageResult: IPair[];
      totalPages: number;
      page: number;
    }
  }

  export namespace Create {
    export interface Params {
      projectId: number;
    }

    export interface Body {
      currency_main_id: number;
      currency_second_id: number;
      liquidity_address_main_id: number;
      liquidity_address_second_id: number;
      name: string;
      rateSourceCoinGecko: object;
    }

    export type Response = IPair;
  }

  export namespace Update {
    export interface Params {
      projectId: number;
      id: number;
    }

    export interface Body {
      currency_main_id: number;
      currency_second_id: number;
      liquidity_address_main_id: number;
      liquidity_address_second_id: number;
      name: string;
      rateSourceCoinGecko: object;
      is_active: boolean;
    }

    export interface Response {
      currentPageResult: IPair;
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

  export namespace PriceSources {
    export interface Query extends Record<string, any> {
      page?: number;
      currency_id?: number;
    }

    export interface Response {
      currentPageResult: IPriceSource[];
    }
  }

  export namespace PriceSourcesForPair {
    export interface Query extends Record<string, any> {
      currency1_id?: number;
      currency2_id?: number;
    }

    export type Response = IPriceSourcePair[];
  }

  export namespace CreateExchangerSettings {
    export interface Params {
      coinPair: {
        currencyAggregator: string;
        price: string;
      };
    }

    export interface Response {
      data: {
        status: boolean;
      };
    }
  }
}

export namespace Profile {
  export namespace Get {
    export interface Params {
      projectId: number;
    }

    export interface Response {
      logo_url: string | null;
    }
  }

  export namespace UploadAvatar {
    export interface Params {
      projectId: number;
    }

    export interface Body {
      file: string;
    }

    export interface Response {
      logo: string;
      status: boolean;
    }
  }
}

export namespace DexTrade {
  export namespace User {
    export namespace List {
      export interface Query extends Record<string, any> {
        page?: number;
        username?: string;
      }

      export interface Response {
        currentPageResult: IDextradeUser[];
        totalPages: number;
        page: number;
        totalCount: number;
      }
    }

    export namespace Create {
      export interface Params {
        projectId: number;
      }

      export interface Body {
        username: string;
      }

      export interface Response {}
    }

    export namespace Get {
      export interface Params {
        projectId: number;
      }

      export interface Response {
        user: IDextradeUser;
      }
    }

    export namespace Update {
      export interface Params {
        projectId: number;
      }

      export interface Body {
        username: string;
      }

      export interface Response {}
    }
  }

  export namespace Advert {
    export namespace List {
      export interface Params {
        projectId: number;
      }

      export interface Query extends Record<string, any> {}

      export type Response = IAdvert[];
    }

    export namespace Create {
      export interface Params {
        projectId: number;
      }

      export interface Body {
        pair_id: number;
        exchangersPolicy: string | null;
        minimumExchangeAmountCoin1: string;
        maximumExchangeAmountCoin1: string;
        priceAdjustment: string;
        transactionFee: string;
      }

      export interface Response {}
    }

    export namespace Update {
      export interface Params {
        projectId: number;
      }

      export interface Body {
        dextrade_id: number;
        exchangersPolicy?: string | null;
        settingsMain: {
          active?: boolean;
          minimumExchangeAmountCoin1?: string;
          maximumExchangeAmountCoin1?: string | null;
          priceAdjustment?: string;
          transactionFee?: string;
        };
      }

      export interface Response {}
    }

    export namespace Delete {
      export interface Params {
        projectId: number;
      }

      export interface Body {
        ad_id?: number;
        dextrade_id?: number;
      }

      export interface Response {
        data: {
          status: boolean;
        };
      }
    }
  }
}

export namespace Dashboard {
  export interface Params {
    projectId: number;
  }

  export interface Response {}
}

export namespace Users {
  export namespace List {
    export interface Query extends Record<string, any> {
      page?: number;
      email?: string;
    }

    export interface Response {
      currentPageResult: IUser[];
      totalPages: number;
      page: number;
    }
  }

  export namespace View {
    export type Response = IUser;
  }
}

export namespace Trade {
  export namespace List {
    export interface Params {
      projectId?: number;
    }

    export interface Response {
      currentPageResult: ITrade[];
      totalPages: number;
      totalCount: number;
      page: number;
    }

    export interface Query extends Record<string, any> {
      page?: number;
      user_id?: number;
      project_id?: number;
    }
  }

  export namespace PNL {
    export interface Params {
      projectId: number;
    }

    export interface Response {
      pnl: {
        pair_id: number;
        currency_id: number;
        pnl: string;
        pnl_usdt: string;
      }[];
    }
  }
}

export namespace TwoFA {
  export namespace Init {
    export interface Response {
      code_token: string;
    }
  }

  export namespace Status {
    export interface Response {
      google_auth: {
        enabled: boolean;
      };
      email: {
        enabled: boolean;
      };
    }
  }

  export namespace CodeConfirm {
    export interface Body {
      code_token: string;
      code: string;
    }

    export interface Response {
      is_enabled: boolean;
      seed: string;
      otpauthUrl: string;
      qr_code: string;
    }
  }

  export namespace Enable2FA {
    export interface Body {
      code: string;
    }

    export interface Response {
      is_enabled: boolean;
    }
  }
}

export namespace Balance {
  export namespace List {
    export interface Params {
      projectId?: number;
    }

    export interface Response {
      balances: IBalance[];
      totalPages: number;
    }

    export interface Query extends Record<string, any> {}
  }
}

export namespace Rate {
  export interface Params {
    pair: string;
  }

  export interface Response {
    [key: string]: {
      symbol: string;
      rateFloat: number;
      updateTime: number;
      serviceName: string;
    };
  }
}

export namespace Preferences {
  export namespace GetMy {
    export type Response = {
      id: number;
      user_id: number;
      project_id: number;
      converted_coin_id: number;
      createdAt: string;
      updatedAt: string;
      deletedAt: string | null;
      currencies: {
        name: string;
        iso: string;
        public_name: string;
        icon: string;
        is_payment_supported: boolean;
      }[];
    };
  }

  export namespace Save {
    export type Body = {
      converted_coin_id?: number;
      currencies: {
        currency_id: number;
      }[];
    };
    export type Response = {
      message: string;
    };
  }
}
