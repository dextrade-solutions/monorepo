import { TxStatus } from '../services/statuses';

export interface INetwork {
  id: number;
  name: string;
  public_name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface IProject {
  id: number;
  name: string;
  creator_id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  private_name: string | null;
  access_granted: {
    id: string;
    internal_id: string;
    project_id: string;
    user_id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  }[];
  drain_rule: {
    is_enabled: boolean;
  };
}

export interface IVault {
  id: number;
  name: string;
  project_id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ICurrency {
  id: number;
  iso: string;
  name: string;
  public_name: string;
  icon?: string;
  contract_address: string;
  network_id: number;
  network: INetwork;
  status: number;
  token_type: string;
  native_asset_id: number;
  is_native_asset: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface IAddress {
  id: number;
  currency_id: number;
  currency: ICurrency;
  vault_id: number;
  vault: IVault;
  address: string;
  tag: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface IAddressTransferFrom {
  status: number;
  is_done: boolean;
  is_pending: boolean;
  status_label: 'WAITING_FOR_TOKEN_DEPOSIT' | 'PENDING' | 'ERROR' | 'CONNECTED';
}

export interface ICoin {
  id: number;
  iso: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ITransaction {
  id: number;
  vault_id: number;
  project_id: number;
  address_id: number | null;
  currency_id: number;
  type: number;
  network_fee: string;
  amount: string;
  txid: string;
  from_address: string;
  to_address: string;
  to_tag: string;
  status: TxStatus;
  confirmations: number;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ITransactionWithdrawal {
  id: number;
  project_id: number;
  status: TxStatus;
  creator_id: number;
  transaction_id: string | null;
  address_from_id: number | null;
  address_to_id: number | null;
  currency_id: number;
  amount: string;
  from_address: string | null;
  to_address: string | null;
  to_tag: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  address_from: IAddress;
  address_to: IAddress | null;
  currency: ICurrency;
  project: {
    id: number;
    name: string;
    creator_id: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  };
  status_label: string;
}

export interface IMemo {
  id: number;
  name: string;
  is_imported: boolean;
  hash: string;
  creator_id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ICallback {
  id: number;
  name: string;
  url: string;
  hash: string;
  public_key: string;
  project_id: number;
  creator_id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface IApiToken {
  id: number;
  label: string;
  createdAt: string;
}

export interface IInvoiceFull {
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
  coin: ICoin | null;
  coin_id: number | null;
  converted_coin: ICoin | null;
  converted_coin_id: number | null;
  currency_id: number;
  currency: ICurrency;
  description: string;
  invoice_number: string;
  due_to: string | null;
  discounts: string | null;
  tax: string | null;
  payment_page_url: string;
  logo_url: string | null;

  // Поле supported_currencies: массив объектов или undefined
  supported_currencies?: Array<{
    id: number;
    coin_id: number;
    iso_with_network: string;
    type: number;
    iso: string;
    native_currency_iso: string;
    token_type: string | null;
    network_name: string;
  }>;
}

export interface IInvoice {
  id: number;
  currency_id: number;
  currency: ICurrency;
  amount_requested: string;
  amount_received_total: string;
  converted_amount_requested: string;
  converted_coin_id: number;
  converted_coin: ICoin;
  description: string;
  due_to: string;
  project_id: number;
  project: IProject;
  status: number;
  address_to: string;
  payment_page_url: string;
  public_id: string;
  status_label: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  transactions: [];
}

export interface IPair {
  rate_source_options: {
    serviceName: string;
    serviceParams: {
      main_iso: string;
      second_iso: string;
    };
  };
  id: number;
  project_id: number;
  currency_main_id: number;
  currency_second_id: number;
  name: string;
  is_active: boolean;
  liquidity_address_main_id: number;
  liquidity_address_second_id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  currency_main: ICurrency | null;
  currency_second: ICurrency;
  liquidity_main_address: {
    address: string;
    tag: string;
    balance: string;
    balanceUpdatedAt: string;
  };
  liquidity_second_address: {
    address: string;
    tag: string;
    balance: string;
    balanceUpdatedAt: string;
  };
}

export interface IPriceSource {
  id: number;
  currency_id: number;
  coin_id: number;
  service_type: string;
  service_currency_iso: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface IPriceSourcePair {
  settingForMain: IPriceSource;
  settingForSecond: IPriceSource;
}

export interface IAdvert {
  id?: number;
  dextrade_id?: number;
  dextrade_reversed_id?: number;
  pair_id?: number;
  pair?: IPair;
  details: {
    id: number;
    userId: number;
    active: boolean;
    priceAdjustment: number;
    transactionFee: number;
    walletAddress: string;
    walletAddressInNetwork2: string;
    coinPair: {
      id: number;
      pair: string;
      nameFrom: string;
      nameTo: string;
      originalPrice: number;
      price: number;
      priceCoin1InUsdt: number;
      priceCoin2InUsdt: number;
      currencyAggregator: string;
    };
    from: {
      id: number;
      ticker: string;
      tokenName: string;
      uuid: string;
      networkType: string;
      networkName: string;
      networkId: number;
    };
    to: {
      id: number;
      ticker: string;
      tokenName: string;
      uuid: string;
      networkType: string;
      networkName: string;
      networkId: number;
    };
    reserve: [
      {
        id: number;
        coin: {
          id: number;
          ticker: string;
          tokenName: string;
          uuid: string;
          networkType: string;
          networkName: string;
          networkId: number;
        };
        reserveInCoin1: number;
        reserveInCoin2: number;
      },
    ];
    reserveSum: number;
    minimumExchangeAmountCoin1: number;
    maximumExchangeAmountCoin1: number;
    exchangersPolicy: string;
    paymentMethods: [];
    statistic: {
      transactionCount: number;
    };
    isAtomicSwap: boolean;
    lastActive: number;
    tradeWithKycUsers: boolean;
    provider: string;
    cdt: number;
  };
}

export interface ITrade {
  id: number;
  external_id: string;
  createdAt: string;
  updatedAt: string;
  status: number;
  amount_from_processed: string;
  amount_to_processed: string;
  fixed_rate_in_second: string;
  liqudity_address_from: IAddress;
  liqudity_address_to: IAddress;
  fee_in_to_currency: string;
  fee_in_from_currency: string;
  deletedAt: string | null;
  rate_fetched_data: {
    rateServiceName: string;
    rateData: {
      rate: string;
      fetchedAt: number;
    };
  };
  public_id: string;
  address_to: string;
  tag_to: string | null;
  project_id: number;
  hold_id: number;
  liqudity_address_to_id: number;
  liqudity_address_from_id: number;
  user_id: number;
  pair_id: number;
  pair: IPair;
  currency_from_id: number;
  currency_to_id: number;
  direction: string;
  is_expired: boolean;
  invoice_id: number;
  withdrawal_request_id: number;
  amount_from_requested: string;
  amount_to_requested: string;
  profit_in_from_currency_processed: string | null;
  profit_in_to_currency_processed: string | null;
  profit_in_usdt_processed: string | null;
  converted: {
    id: number;
    address_id: number;
    balance_usdt: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  };
}

export interface IPermission {
  id: number;
  user_id: number;
  permission_type: number;
  is_enabled: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface IUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  label?: string;
  is_email_activated: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  permissions?: IPermission[];
}

export interface IBalance {
  id: number;
  unique_key: string;
  total_balance_usdt: string;
  latest_data_date: string;
  total_balance_currency: string;
  project_id: number;
  currency_id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface IDextradeUser {
  id: number;
  dextrade_id: number;
  project_id: number;
  username: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  project?: IProject | null;
}

export interface IStatistic {
  currency_iso: string;
  amount: string;
  amount_usdt: string;
}
