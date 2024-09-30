import { BaseConfig, BaseState } from '@metamask/base-controller';
import { ChainId, ProviderConfig } from '../chains-controller/types';
import { Asset } from '../network/chain-provider';

export type TMultisignTransactionSignStatus = 'SIGNED' | 'DECLINED' | 'WAIT';
export type TMultisignTransactionStatus =
  | 'PENDING'
  | 'ERROR'
  | 'EXPIRED'
  | 'SEND';

export interface IMultisignTransaction {
  id: string;
  addressId: string;
  txHash: string;
  toAddress: string;
  signedCount: number;
  toSignCount: number;
  sigHashes: string[];
  hex?: string;

  cdt: string;

  amount: number;
  fee: number;

  // TODO: implement for BNB
  amountFiat?: number;
  feeFiat?: number;

  status: TMultisignTransactionStatus;
  signStatus: TMultisignTransactionSignStatus;
  errorMessage: string;

  // TODO: refactor this
  multisigId?: string;
  txId?: number;
}

export interface IMultisign {
  id: string;
  account?: string;
  initiatorAddress: string;
  totalSigners: number;
  minForBroadcasting: number;
  provider: ProviderConfig;
  pubkeys: string[];
  cdt?: string;
  added?: number;
}

export interface IMultisignerChainState {
  multisigs: Map<IMultisign['id'], IMultisign>;
  transactions: Map<IMultisignTransaction['id'], IMultisignTransaction>;
}

export interface IMultisignerCreatorState {
  tokens: Asset[];
  token: Asset | null;
  provider: ProviderConfig;
  totalSigners: number | null;
  minForBroadcasting: number | null;
  disabledGenerate: boolean;
}

export type IMultisignerAddressedState = {
  creator: IMultisignerCreatorState;
  isLoading: boolean;
  state: Partial<Record<ChainId | string, IMultisignerChainState>>;
};

export interface IMultisignerState extends BaseState {
  multisigner: Record<string, IMultisignerAddressedState>;
}

export interface IMultisignerConfig extends BaseConfig {
  selectedAddress: string;
}
