import { AssetModel } from 'dex-helpers/types';

import { WalletConnectionType } from '../helpers/constants/wallets';

export type WalletConnection = {
  walletName: string;
  connectionType: WalletConnectionType;
  address: string;
};

export type FeeParams = {
  asset: AssetModel;
  amount?: string | number;
  from?: string | null;
  to: string;
};

export type PublicFeeParams = {
  amount: number;
  side: 'sell' | 'buy';
  currency_1_iso: string;
  currency_2_iso: string;
};

export type EstimatedFeeParamsToken = {
  from?: string;
  data: string;
  contractAddress: string;
  network: string;
};

export type EstimatedFeeParamsEth = {
  from?: string;
  to: string;
  network: string;
};
