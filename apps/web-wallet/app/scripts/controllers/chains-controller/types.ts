import { HDKey } from 'ethereum-cryptography/hdkey';
import PreferencesController from '../preferences';
import OnboardingController from '../onboarding';

import {
  NETWORK_TYPES,
  RPCDefinition,
} from '../../../../shared/constants/network';
import { NetworkConfiguration } from '../../../../shared/shared-chain-provider/types';
import { KeyringController } from '../../../overrided-metamask/eth-keyring-controller';

export type NetworkType = (typeof NETWORK_TYPES)[keyof typeof NETWORK_TYPES];
export type ChainId = `0x${string}` | string;

export type NativeAccount = {
  // Native address in blockchain
  nativeAddress: string;
  // Balance of native tokens
  nativeBalance: string;
  // Created datetime
  created: number;

  info?: any;
};

export type BalancesPool = {
  [address: string]: {
    balance?: string;
    balanceError?: string;
  };
};

export type ControllerState = {
  id: string;
  config: NetworkConfiguration;
  incomingTransactions: any;
  incomingTxLastFetchedBlock: number;

  network: {
    EIPS?: {
      [key: number]: boolean;
    };
    networkVersion?: string | null;

    latestBlock?: string; // hash of latest block
    previousBlock?: string; // hash of previous block

    // bitcoin net info
    height?: number;
    highFeePerKb?: number;
    mediumFeePerKb?: number;
    lowFeePerKb?: number;
    peerCount?: number;
  };

  accounts: {
    [walletAddress: string]: NativeAccount;
  };

  lastRequestTimestamp?: number;
};

export type UsedNetworks = {
  [chainId: string]: ControllerState;
};

export type ChainsControllerState = {
  // defaultChain uses in client-wallet communications
  defaultChain: ChainId;
  usedNetworks: UsedNetworks;
};

export type ProviderConfig = {
  chainId: ChainId;
  type?: NetworkType;
  rpcUrl?: string;
  contract?: string;
  decimals?: number;
  symbol?: string;
  iconUrl?: string;
  blockExplorerUrl?: string;
};

export type ChainControllerOptions = {
  state: ControllerState;
  networkConfiguration: NetworkConfiguration;
  keyringController: KeyringController;
  preferencesController: PreferencesController;
  onboardingController: OnboardingController;
  isTestnet: boolean;
  cooldown?: number;
  deriveHdKey: (level: number) => Promise<HDKey>;
};

export declare type FeeParams = {
  fee?: number | string; // min fee
  feeLimit?: number | string; // max fee
  feePrice?: number | string;

  // Tron resources
  bandwidth?: number | string;
  energy?: number | string;

  highFeePerByte?: number | string;
  mediumFeePerByte?: number | string;
  lowFeePerByte?: number | string;
};

export type EnqueueWithCooldown = (
  v: (...args: any[]) => Promise<any>,
) => Promise<any>;

export interface TxParams {
  /** The address the transaction is sent from */
  from: string;
  /** The address the transaction is sent to */
  to: string;
  /** The amount of wei, in hexadecimal, to send */
  value: string;
  /** The transaction count for the current account/network */
  nonce: number;
  /** The amount of gwei, in hexadecimal, per unit of gas */
  gasPrice?: string;
  /** The max amount of gwei, in hexadecimal, the user is willing to pay */
  gas: string;
  /** Hexadecimal encoded string representing calls to the EVM's ABI */
  data?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  feeParams?: FeeParams;

  // Local asset id
  localId?: string;
}

export type UpsertNetworkParams = {
  rpcUrl: string;
  chainId: ChainId;
  nickname: string;
  rpcPrefs: RPCDefinition['rpcPrefs'];
  ticker: string;
  decimals?: number;
};
