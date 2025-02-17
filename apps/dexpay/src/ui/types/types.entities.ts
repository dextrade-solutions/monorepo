import { number, string } from 'yup';

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
}

export interface IVault {
  id: number;
  name: string;
  project_id: number;
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

export interface ICoin {
  id: number;
  iso: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface INetwork {
  id: number;
  name: string;
  public_name: string;
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
  status: number;
  confirmations: number;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
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
  id?: number;
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
